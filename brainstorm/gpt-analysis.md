# GlobiGuard: technical + UX analysis

**Source grounding note:** the requested PDF path `D:\Dev\AI\demo-globiguard\GlobiGuard_Compliance_Framework.1.pdf` did not exist. I used the available compliance PDF at `D:\Dev\AI\globiguard\GlobiGuard_Compliance_Center.pdf`, plus the requested source files:

- `brain/detection/engine.py`
- `brain/tokenizer/tokenizer.py`
- `brain/tokenizer/detokenizer.py`
- `brain/automation/__init__.py`
- `brain/detection/risk_scorer.py`
- `docs/vision.md`

## First: what is real vs what is aspirational

The codebase is a **Phase 0 skeleton with real core ideas**. The detection cascade is real. The tokenizer/detokenizer are real. The automation controller shape is real. The risk scorer exists. But some of the strongest product claims are still target-state, not fully embodied in code:

- `DetectionEngine` is implemented and explicitly designed as a 3-layer cascade: regex, Presidio, GLiNER.
- `Tokenizer` and `Detokenizer` exist and do reversible masking through a token registry.
- `AutomationEngine` exposes the correct workflow verbs, but many handlers are still stubs.
- `RiskScorer` is described as “XGBoost 13-feature,” but Phase 0 code is actually a **deterministic linear scorer** with several declared-but-unused features.
- `vision.md` is more ambitious than the runtime: hash-chained audit evidence, token oracle resistance via random IDs, and strong sidecar guarantees are architectural commitments, not all visible in the files reviewed.

That distinction matters. Engineers building the explainer page should not accidentally present Phase 0 code as if it were already Phase 3 production hardening.

---

## 1. The byte-level lifecycle

Use one concrete claim payload:

```json
{
  "claim_number": "CLM-2026-184233",
  "insured_name": "Jane Miller",
  "dob": "04/12/1986",
  "ssn": "547-82-3901",
  "diagnosis": "lumbar disc herniation",
  "claim_amount": "$4,850.00",
  "recipient_email": "outside-counsel@gmail.com",
  "instruction": "Draft a coverage update email for the claimant."
}
```

### 1.1 Wire bytes at ingress

On the wire this is UTF-8 JSON bytes. Example sensitive spans:

- `547-82-3901`  
  UTF-8 hex: `35 34 37 2d 38 32 2d 33 39 30 31`
- `04/12/1986`  
  UTF-8 hex: `30 34 2f 31 32 2f 31 39 38 36`
- `CLM-2026-184233`  
  UTF-8 hex: `43 4c 4d 2d 32 30 32 36 2d 31 38 34 32 33 33`

The sidecar receives bytes, parses JSON, and the Python brain then operates on **Unicode strings**, not raw bytes. That is an important implementation detail: `engine.py` and `tokenizer.py` use Python string offsets (`start_pos`, `end_pos`), so the runtime is currently **code-point indexed, not byte indexed**. For ASCII this is equivalent. For non-ASCII names and addresses, byte offsets and Python string offsets diverge.

That is not academic. If an upstream connector or downstream UI ever expects byte offsets while the detector reports character offsets, highlights will drift for names like `José Álvarez` or addresses with accented characters.

### 1.2 Connector and normalization

The ideal ingress path is:

1. MCPConnector reads source record.
2. Sidecar on port 8080 intercepts the AI-bound call.
3. Payload is normalized into a text block or structured field summary for detection.

`AutomationEngine._step_read_data()` is currently a stub returning `{source, resource}`. So the exact record materialization is still product design, not finished code. For the explainer page, the right mental model is:

- **source bytes**: CRM/API payload
- **normalized bytes**: only fields needed for the current step
- **policy context bytes**: org, workflow, destination, actor, permissions

### 1.3 PII detection cascade

`DetectionEngine.detect()` runs:

1. Regex layer
2. Presidio in a worker thread
3. GLiNER in a worker thread
4. Deduplication and tier assignment

Documented/encoded latency targets:

- Regex: **<1 ms**
- Presidio: **<10 ms**
- GLiNER: **<30 ms**

Actual logic details from code:

- Regex rules are precompiled at module load.
- Contextual regex rules exist, not just strict patterns.
- `_is_likely_fiction()` suppresses false positives near fiction/public-figure language.
- `_tier()` maps field types into `BLOCKED`, `CONFIDENTIAL`, `RESTRICTED`.

For the sample claim:

- `CLM-2026-184233` → `CLAIM_NUMBER` → `CONFIDENTIAL`
- `04/12/1986` → `DOB` → `CONFIDENTIAL`
- `547-82-3901` → `SSN` → `BLOCKED`
- `lumbar disc herniation` likely caught contextually/GLiNER as `HEALTH_DX` → `BLOCKED`
- `$4,850.00` with claim context → `CLAIM_AMOUNT` → `CONFIDENTIAL`
- `outside-counsel@gmail.com` → `EMAIL` → `RESTRICTED`

The merge result is a list of typed spans:

```json
[
  {"field_type":"CLAIM_NUMBER","start":17,"end":32,"tier":"CONFIDENTIAL"},
  {"field_type":"DOB","start":63,"end":73,"tier":"CONFIDENTIAL"},
  {"field_type":"SSN","start":84,"end":95,"tier":"BLOCKED"},
  {"field_type":"HEALTH_DX","start":110,"end":132,"tier":"BLOCKED"},
  {"field_type":"CLAIM_AMOUNT","start":151,"end":160,"tier":"CONFIDENTIAL"},
  {"field_type":"EMAIL","start":181,"end":206,"tier":"RESTRICTED"}
]
```

### 1.4 Tokenization

`Tokenizer.tokenize()` does four important things:

1. Keeps only fields with positions and values.
2. Deduplicates overlapping spans by higher confidence.
3. Replaces from the end of the string backward so offsets do not shift.
4. Stores token → value in a `TokenRegistry`.

The exact transformation is reversible:

- `547-82-3901` → `[MASKED-SSN-001]`
- `04/12/1986` → `[MASKED-DOB-001]`
- `lumbar disc herniation` → `[MASKED-HEALTH_DX-001]`

So the pre-LLM prompt becomes:

```text
Claim [MASKED-CLAIM_NUMBER-001] for Jane Miller, DOB [MASKED-DOB-001], SSN [MASKED-SSN-001], diagnosis [MASKED-HEALTH_DX-001], amount [MASKED-CLAIM_AMOUNT-001]. Draft a coverage update email to [MASKED-EMAIL-001].
```

Representative token bytes:

- `[MASKED-SSN-001]`  
  UTF-8 hex: `5b 4d 41 53 4b 45 44 2d 53 53 4e 2d 30 30 31 5d`

The value bytes are no longer present in the LLM-bound payload. They exist only in:

- original request memory in the enforcement plane
- encrypted token registry state in Redis
- transient audit/event context inside customer boundary

`vision.md` says the token map lives in Redis with **hard TTL 1 hour**. `detokenizer.py` explicitly handles expiry by leaving tokens in place, never blanking them out. That is the correct failure mode.

### 1.5 Risk scoring and gate prep

Before any external action, the system needs more than content analysis. It needs intent context:

- action type
- destination
- detected field tiers
- prior violations
- payload size
- industry

`RiskScorer.build_features()` constructs the feature bundle. `score()` currently applies a deterministic weighted sum. Latency here is effectively **sub-millisecond**.

For the sample “send external email containing SSN + diagnosis” case, the local fallback scorer would likely see:

- action_type = `send`
- destination = `gmail`
- blocked_field_count = 2
- confidential_field_count = 3
- restricted_field_count = 1
- health_field_present = true
- financial_field_present = true
- identity_field_present = true

That pushes the score into **QUEUE or BLOCK territory** in the intended architecture. In current fallback code it is still less aggressive than it should be; more on that below.

### 1.6 LLM call

`AutomationEngine._step_call_llm()` is explicit about the security invariant:

- raw prompt sent to LLM is tokenized
- output summary stored upstream must never contain detokenized text
- only metadata should cross to control plane

The real latency budget is dominated by the model provider, not middleware:

- sidecar + detection + tokenization + local gating: roughly **1–50 ms**
- LLM inference: typically **300–1500+ ms**

That asymmetry is why GlobiGuard is viable. If the enforcement path adds single-digit milliseconds and the model adds hundreds, the middleware is not the bottleneck.

### 1.7 Output scan, detokenization, audit

After the model returns:

1. output should be rescanned for leaked or hallucinated sensitive data
2. approved tokens are detokenized
3. action is executed or held
4. audit event is appended and published asynchronously

`Detokenizer.detokenize()`:

- finds `[MASKED-*]` placeholders
- does ordered lookup through the token registry
- replaces only tokens with live mappings
- leaves expired/missing tokens untouched

That last choice matters operationally. It prevents silent corruption. If token lookup fails, the safest response is a visibly unresolved token, not accidental emission of partial content.

### 1.8 End-to-end timing budget

For the canonical insurance-email case:

| Stage | Latency |
|---|---:|
| Sidecar intercept + policy cache lookup | `<1 ms` target |
| Regex detection | `<1 ms` |
| Presidio | `<10 ms` |
| GLiNER | `<30 ms` |
| Merge + tier + tokenize + Redis writes | `1–5 ms` typical target |
| Risk score + gate request | `<1–5 ms` local / small sidecar RPC |
| LLM inference | `300–1500+ ms` |
| Output scan + detokenize | `1–5 ms` |
| Async audit enqueue | `<1 ms` on critical path |

So the practical story is: **GlobiGuard adds tens of milliseconds, the LLM adds the seconds**.

---

## 2. The automation workflow deep dive

This is the product most teams misunderstand.

If GlobiGuard only governed reads, it would be a privacy filter. Useful, but incomplete. The real liability is not just “the model saw an SSN.” It is “the model sent a claim email to the wrong recipient,” “the model updated a CRM record with unapproved medical detail,” or “the model triggered money movement with weak authority.”

**Reads leak information. Actions create outcomes.** Regulators, plaintiffs, insurers, and internal audit all care more about the second.

### 2.1 Why governing actions matters more than governing reads

A model reading private data is dangerous.  
A model taking an irreversible action is worse.

Examples:

- A read can expose PHI to a model vendor.
- A write can permanently contaminate a system of record.
- A send can disclose regulated data to an external party.
- A trigger can move money or initiate a legal process.

Action governance is harder because it must understand:

- what the AI saw
- what it is trying to do
- where the result is going
- whether the actor is allowed to do that action
- whether human approval is mandatory

That is why `AutomationEngine` exists. The important abstraction is not “call detector before LLM.” It is **execute a controlled workflow where each step is typed, inspectable, and gateable**.

### 2.2 The typed workflow model

`AutomationEngine.execute_step()` routes typed steps:

- `READ_DATA`
- `DETECT_PII`
- `CALL_LLM`
- `GATE_CHECK`
- `WRITE_RECORD`
- `SEND_MESSAGE`
- `REQUIRE_APPROVAL`
- `BRANCH`
- `NOTIFY`
- `PROCESS_FILE`

This is the correct abstraction because compliance is step-specific. The risk model for `READ_DATA` is not the risk model for `SEND_MESSAGE`. The approval reason for `WRITE_RECORD` is not the approval reason for `TRIGGER_ACH_TRANSFER`.

### 2.3 Full insurance workflow

Take a realistic claim workflow:

> “Read claim record, summarize status, draft customer update, hold if external email contains regulated fields, require human approval, then send and write back outcome.”

#### Step 1: `READ_DATA`

Input:

```json
{
  "connector":"salesforce",
  "resource":"claim_record",
  "record_id":"CLM-2026-184233"
}
```

Output object should be:

```json
{
  "claim_number":"CLM-2026-184233",
  "status":"under_review",
  "claimant_name":"Jane Miller",
  "dob":"04/12/1986",
  "ssn":"547-82-3901",
  "diagnosis":"lumbar disc herniation",
  "adjuster_note":"PT authorized pending utilization review"
}
```

Current code stub only returns source/resource metadata. Product-wise, the correct behavior is to materialize the record inside the enforcement plane and pass a structured payload forward.

#### Step 2: `DETECT_PII`

Input:

- structured record text or selected fields
- industry = `INSURANCE`

What happens:

- regex catches hard identifiers
- Presidio catches named entities
- GLiNER catches fuzzy contextual fields
- fields are classified by sensitivity tier

Output:

```json
{
  "decision":"BLOCK or MODIFY or ALLOW",
  "masked_fields":["DOB","CLAIM_NUMBER"],
  "blocked_fields":["SSN","HEALTH_DX"],
  "output":{"blocked":2,"masked":2}
}
```

Important nuance: current implementation returns masked field names but does **not** itself tokenize. So the actual workflow engine still needs explicit tokenization between `DETECT_PII` and `CALL_LLM`.

#### Step 3: `CALL_LLM`

Input:

- tokenized prompt
- model/provider selection
- non-sensitive workflow context

LLM-visible text:

```text
Draft a status email for claim [MASKED-CLAIM_NUMBER-001]. The claimant DOB is [MASKED-DOB-001]. Do not include diagnosis unless necessary.
```

Output:

- tokenized draft only
- no detokenized content in control-plane summary

This is a critical product invariant. If the control plane ever stores detokenized LLM drafts, the “zero raw data leaves customer environment” story collapses.

#### Step 4: `GATE_CHECK`

This is the pivot.

The question is not “did we detect PII?” The question is:

> “Given these entities, this action, this destination, this actor, and this policy set, may this workflow continue?”

Current code sends a payload to the Go sidecar `/gate` endpoint:

```json
{
  "agent_id":"automation",
  "action_type":"send",
  "destination":"gmail",
  "payload_summary":{
    "fields":[
      {"field_type":"DOB"},
      {"field_type":"SSN"},
      {"field_type":"HEALTH_DX"}
    ]
  }
}
```

If sidecar says `QUEUE`, `AutomationEngine` returns `WAITING_APPROVAL`.

This is where the typed human-readable reason belongs. Example:

> `SEND_MESSAGE queued: body contains CONFIDENTIAL field [DOB] and BLOCKED field [HEALTH_DX]; recipient domain is external; actor 'automation' lacks 'external-pii-send' permission`

That typed reason is not cosmetic. It is the bridge between enforcement and human operations.

#### Step 5: Human review

Queue payload should show:

- draft text with highlighted tokens and resolved labels
- destination and domain classification
- risk score and contributing factors
- policy rule that fired
- recommended action

Reviewer actions:

- approve
- reject
- edit and approve
- escalate

The reviewer is not reading an opaque “risk 0.82” number. They are adjudicating a typed policy conflict.

#### Step 6: `APPROVE`

Approval event should write:

```json
{
  "review_id":"rvw_01",
  "reviewer":"claims_manager_44",
  "decision":"APPROVE",
  "reason":"Claimant has signed external disclosure authorization on file",
  "timestamp":"2026-03-15T14:02:19Z"
}
```

This approval object becomes part of the execution context for downstream steps.

#### Step 7: `SEND_MESSAGE`

Only after approval:

- detokenize approved fields needed for delivery
- send via connector
- log message ID / provider response

If the outbound system is external email, detokenization should happen **as late as possible**, ideally immediately before connector call, not earlier in workflow memory.

#### Step 8: `WRITE_RECORD`

Write back:

- message sent
- approval reference
- audit ID
- any summary safe for CRM storage

This write is itself gateable. A safe send does not imply a safe CRM write. Insurance CRMs often should not receive freeform medical detail even if the recipient email was authorized.

### 2.4 What data flows between steps

The clean model is:

1. **data context**: original record fragments, tokenized text, token IDs
2. **policy context**: org policy version, permissions, workflow type, destination class
3. **decision context**: risk score, triggered rules, approval state, audit IDs

Do not mash these together into one giant JSON blob. That leads to accidental over-sharing across steps.

### 2.5 Why this controller is the missing layer

Without the workflow controller, you get:

- good detection
- reversible masking
- maybe a decent audit log

But you do **not** get governed execution.

The controller turns GlobiGuard from “privacy middleware” into **an action governor for AI agents**. That is the category-defining layer. It is how the system can say not only:

- “the model never saw the SSN”

but also:

- “the AI was not allowed to send this email without approval”
- “the AI was not allowed to write this diagnosis into Salesforce”
- “the AI was not allowed to trigger payment because this workflow lacked authority”

That is a much stronger compliance claim.

---

## 3. Tokenization vs alternatives

### 3.1 Why not simple redaction

`[REDACTED]` destroys structure.

If a prompt contains:

```text
The claimant SSN is 547-82-3901. Verify whether 547-82-3901 matches the prior filing.
```

simple redaction yields:

```text
The claimant SSN is [REDACTED]. Verify whether [REDACTED] matches the prior filing.
```

That loses:

- referential integrity
- entity identity
- count of distinct values
- any ability to restore correct output later

Tokenization preserves those:

```text
The claimant SSN is [MASKED-SSN-001]. Verify whether [MASKED-SSN-001] matches the prior filing.
```

The model can still reason that the two mentions are the same thing. That is the key technical advantage.

### 3.2 Why tokenization beats redaction for enterprise workflows

Redaction is acceptable for archival display.  
It is weak for transactional AI workflows.

You need the model to preserve:

- entity co-reference
- field type
- narrative grammar
- downstream restorability

`[MASKED-SSN-001]` carries more useful semantics than `[REDACTED]`:

- it tells the model this is an SSN, not an address or policy ID
- it lets the same token reappear consistently
- it enables exact detokenization after generation

The model sees a typed placeholder. That supports controlled reasoning without revealing the value.

### 3.3 Why not differential privacy

Differential privacy is for **aggregate statistical release**, not transactional prompt protection.

It answers questions like:

- “Can I publish model outputs about a population without exposing one person’s contribution?”

It does **not** solve:

- “Can I let an LLM draft one claim email without revealing this claimant’s SSN?”

Adding noise to a single customer record is useless or destructive:

- legal documents need exact values
- claims processing needs exact identifiers
- customer communications cannot contain probabilistically perturbed DOBs or policy numbers

DP protects datasets at population level. GlobiGuard protects **live per-request disclosure and action execution**.

### 3.4 Why not federated learning

Federated learning is about model training across distributed data holders.  
GlobiGuard’s problem is inference-time governance.

Federated learning does not answer:

- what leaves the context window
- what actions the model may take
- how to approve risky steps
- how to generate audit evidence for one transaction

You could use federated learning and still leak PHI in a single bad prompt. It is orthogonal.

### 3.5 One hard truth about current tokenization

The current tokenizer uses sequential token IDs like `[MASKED-SSN-001]`. That is useful for demos and local traceability. It is not the ideal production design.

`vision.md` explicitly calls out the need for **random token IDs** to prevent token-oracle correlation attacks across sessions. Engineers should treat this as a known hardening gap:

- good for explaining concept: sequential typed tokens
- better for production: typed tokens with unpredictable suffixes or opaque random IDs

So the precise claim is:

> `[MASKED-SSN-001]` is much better than `[REDACTED]` for reasoning and restoration, but production GlobiGuard should randomize token identity to avoid oracle leakage.

---

## 4. Risk scoring deep dive

### 4.1 The current 13-feature schema

`RiskFeatures` declares 13 fields:

1. `action_type`
2. `destination`
3. `blocked_field_count`
4. `confidential_field_count`
5. `restricted_field_count`
6. `health_field_present`
7. `financial_field_present`
8. `identity_field_present`
9. `previous_violations`
10. `agent_violation_score`
11. `time_of_day_bucket`
12. `payload_size_tokens`
13. `industry`

This is the right shape: it mixes **intent**, **destination**, **content sensitivity**, and **behavioral history**.

### 4.2 What each feature actually means

| Feature | Meaning | Why it matters | Used in current score? |
|---|---|---|---|
| `action_type` | read/write/send/trigger/delete | Actions carry different blast radius | Yes |
| `destination` | internal system or external channel | Exfiltration risk is destination-dependent | Yes |
| `blocked_field_count` | number of highest-sensitivity entities | Strong proxy for severe disclosure risk | Yes |
| `confidential_field_count` | number of medium-high sensitivity entities | More sensitive fields, more exposure | Yes |
| `restricted_field_count` | lower-tier sensitive fields | Volume/context still matters | **No** |
| `health_field_present` | medical content present | Health data sharply raises regulatory stakes | Yes |
| `financial_field_present` | money/accounting data present | Financial data changes action risk | Yes |
| `identity_field_present` | SSN/EIN/etc present | Identity + external send is dangerous | Yes |
| `previous_violations` | recent bad behavior in session/workflow | Repeated failure should harden controls | Yes |
| `agent_violation_score` | rolling trust score for the actor/agent | Low-trust automations need tighter gating | **No** |
| `time_of_day_bucket` | business/after-hours/weekend | off-hours activity often correlates with anomalies | **No** |
| `payload_size_tokens` | size of prompt/action body | larger payloads widen leakage surface | Yes |
| `industry` | insurance/accounting/etc | industry affects policy semantics | **No** in score, only passed through |

So the honest engineering statement is: **the schema is 13-feature, the implemented Phase 0 scoring logic does not yet use all 13 features.**

### 4.3 Why context matters more than content

“Contains SSN” is not a sufficient decision rule.

The same SSN can appear in:

- an internal read used to verify claimant identity
- an external email draft
- a CRM write
- an ACH transfer initiation

Content says **what is present**.  
Context says **what is being attempted**.

Example calculations from current fallback scorer:

#### Case A: internal read

- action = `read`
- destination = `internal`
- fields = one `SSN`

Score:

- action: `0.1 * 0.25 = 0.025`
- destination: `0.1 * 0.15 = 0.015`
- blocked count: `0.15`
- identity: `0.15`

Total ≈ **0.34** → `MODIFY`

That means even an internal read with SSN is not cleanly `ALLOW`. Good instinct.

#### Case B: Salesforce write

- action = `write`
- destination = `salesforce`
- same SSN

Score:

- action: `0.4 * 0.25 = 0.10`
- destination: `0.35 * 0.15 = 0.0525`
- blocked count: `0.15`
- identity: `0.15`

Total ≈ **0.4525** → `MODIFY`

Higher risk, same content.

#### Case C: external Gmail send

- action = `send`
- destination = `gmail`
- same SSN

Score:

- action: `0.5 * 0.25 = 0.125`
- destination: `0.5 * 0.15 = 0.075`
- blocked count: `0.15`
- identity: `0.15`

Total ≈ **0.50** → still `MODIFY`

This is where current fallback scoring is obviously too soft. An external email containing SSN should usually be `QUEUE` or `BLOCK` unless a strong explicit policy exception exists.

### 4.4 What the sidecar must add

The prompt described a reviewer-visible reason including requester role and external-domain permission. Current fallback scoring cannot express that because it lacks:

- requester role
- policy permission set
- recipient class beyond coarse destination name
- workflow criticality
- approval state

That is why `AutomationEngine` correctly treats the Go sidecar as the authority. The sidecar should own:

- rule-based permission evaluation
- actor/role checks
- domain allowlists
- typed reason generation
- stronger action-specific overrides

The fallback scorer is only a degraded local approximation.

### 4.5 What “XGBoost” should mean here

If GlobiGuard graduates to a true XGBoost model, the point is not “use ML because ML is fashionable.” The point is:

- interactions matter
- thresholds should be nonlinear
- rare combinations should spike sharply

For example:

- `send + gmail + health + identity + prior violations`

should jump much harder than a linear additive model. Gradient-boosted trees are good at exactly that.

---

## 5. Visual interaction spec: 12 pipeline nodes

The page should use one canonical insurance claim example throughout so the user can watch the same record mutate as the active node changes.

### Node 1 — **Source Connectors**
- **Tagline:** Pull exactly the fields the workflow needs.
- **What:** Data starts in customer systems like Salesforce, AMS360, Epic, Gmail, or PostgreSQL. The page should show that GlobiGuard is upstream of the model, not embedded inside it.
- **How:** MCP connectors fetch or receive the record and emit a normalized workflow payload. Keep the record visibly structured.
- **Why:** Compliance starts before prompt construction. If you cannot control ingress, every later control is weaker.
- **Before/after:** `salesforce.claim.ssn = 547-82-3901` → normalized claim payload enters the enforcement plane.
- **Metrics:** connector RTT, fields pulled, source system, record size in bytes.
- **Animation:** Data cards slide in from multiple systems and collapse into one canonical claim packet.

### Node 2 — **Go Sidecar Intercept**
- **Tagline:** Every AI-bound request must pass through the proxy.
- **What:** The sidecar sits in the execution path on port 8080. This is non-bypass architecture, not passive observability.
- **How:** AI calls and action requests route through the sidecar before reaching an LLM or downstream system. The UI should depict a hard choke point.
- **Why:** If there is a bypass, there is no control plane worth discussing.
- **Before/after:** Raw app request → intercepted governed request with policy context attached.
- **Metrics:** proxy latency, policy-cache hit, org policy version.
- **Animation:** A moving packet hits a gate; alternate bypass lines visibly dead-end.

### Node 3 — **Payload Normalizer**
- **Tagline:** Turn messy records into deterministic scan targets.
- **What:** Freeform fields, structured JSON, and connector metadata are flattened into a consistent detection surface. This is where field names and narrative text become one analyzable body.
- **How:** Serialize only relevant fields into a bounded prompt candidate. Preserve field labels so later explanations stay human-readable.
- **Why:** Detection quality is garbage if the pre-scan representation is inconsistent.
- **Before/after:** nested CRM JSON → ordered text block with labeled fields.
- **Metrics:** input bytes, normalized bytes, dropped fields count.
- **Animation:** Nested boxes flatten into a readable ribbon of labeled text.

### Node 4 — **Regex Layer**
- **Tagline:** Catch the obvious fast.
- **What:** Regex handles high-precision structural identifiers like SSNs, claim numbers, DOBs, policy numbers, and common health/accounting patterns. It is the cheapest layer and should fire first.
- **How:** Precompiled rules sweep the normalized payload. Matches appear immediately with tier colors.
- **Why:** Most enterprise compliance wins come from catching obvious high-risk fields with near-zero latency.
- **Before/after:** `547-82-3901` lights up as `SSN`; `CLM-2026-184233` lights up as `CLAIM_NUMBER`.
- **Metrics:** `<1 ms`, matches found, rule IDs fired.
- **Animation:** Rapid pulse scan; matches snap-highlight in place.

### Node 5 — **Presidio NER**
- **Tagline:** Catch entities regex misses.
- **What:** Presidio adds NLP-based detection for names, locations, and entities that do not always have rigid patterns. It is the structured NLP middle layer.
- **How:** Run in a worker thread and merge results back into the span list. Show confidence on hover.
- **Why:** Regex alone misses too much freeform operational text.
- **Before/after:** `Jane Miller` becomes `FULL_NAME`; ambiguous spans gain confidence badges.
- **Metrics:** `<10 ms`, entity count, average confidence.
- **Animation:** A second softer scan washes across the text and reveals new spans not caught by regex.

### Node 6 — **GLiNER Zero-Shot**
- **Tagline:** Catch contextual and novel sensitive content.
- **What:** GLiNER is the catch-all layer for fuzzy domain language like diagnoses, medications, or field types not written in strict formats. It handles the long tail.
- **How:** Run zero-shot labels against industry-specific entity sets. Merge only non-overlapping or higher-value detections.
- **Why:** The hardest compliance failures hide in prose, not form fields.
- **Before/after:** `lumbar disc herniation` becomes `HEALTH_DX`; `physical therapy` becomes `HEALTH_TX`.
- **Metrics:** `<30 ms`, labels attempted, fallback rate, model loaded/not loaded.
- **Animation:** Context halo expands around words before resolving into entity labels.

### Node 7 — **Span Merge + Tiering**
- **Tagline:** Resolve conflicts and classify severity.
- **What:** Multiple layers may detect overlapping spans. The system must deduplicate and assign a final sensitivity tier.
- **How:** Prefer stronger confidence/priority spans, then map field types to `BLOCKED`, `CONFIDENTIAL`, or `RESTRICTED`. Surface the final authoritative label set.
- **Why:** Without canonical spans, tokenization and gating become nondeterministic.
- **Before/after:** overlapping detections collapse into one final span map with severity colors.
- **Metrics:** overlaps removed, final entity count, tier distribution.
- **Animation:** Competing boxes stack, then weaker boxes fade while one final outline remains.

### Node 8 — **Tokenizer + Redis Vault**
- **Tagline:** Replace values, keep meaning.
- **What:** Sensitive spans are replaced with typed placeholders and the original values are stored in the token registry. The model never sees the raw value.
- **How:** Replace from end to start so offsets stay valid, then write token mappings to Redis with 1-hour TTL. Show both token text and vault storage.
- **Why:** Reversible masking preserves reasoning and enables exact restoration later.
- **Before/after:** `SSN: 547-82-3901` → `SSN: [MASKED-SSN-001]`
- **Metrics:** tokens created, Redis writes, TTL `1h`, tokenization latency.
- **Animation:** Sensitive spans dissolve into brackets while glowing keys drop into a vault panel.

### Node 9 — **Risk Scorer**
- **Tagline:** Content is not enough; intent changes the answer.
- **What:** Build a risk vector from action, destination, entity mix, history, and payload size. Show both current Phase 0 linear scoring and target XGBoost framing.
- **How:** Animate each feature contributing to a composite score bar. Let the same SSN example score differently under read/write/send.
- **Why:** Compliance decisions should be contextual, not keyword-based.
- **Before/after:** same `SSN` + `send:gmail` scores higher than `SSN` + `read:internal`.
- **Metrics:** risk score, top contributors, decision threshold crossed.
- **Animation:** Feature chips fly into a score gauge; the bar changes color as thresholds are crossed.

### Node 10 — **LLM Call**
- **Tagline:** The model sees aliases, not secrets.
- **What:** Only the tokenized prompt leaves for the model provider. The explainer must show raw values absent from the provider view.
- **How:** Render split panels: enforcement plane keeps the map, provider sees masked text. Never visually show the model panel with plaintext.
- **Why:** This is the core trust boundary.
- **Before/after:** raw claim email request → tokenized prompt sent to OpenAI/Anthropic/etc.
- **Metrics:** prompt tokens, model latency, response token count.
- **Animation:** The masked prompt traverses the network; the raw-data layer remains physically behind a boundary line.

### Node 11 — **Gate Check + Human Review**
- **Tagline:** High-risk actions pause for accountable humans.
- **What:** The sidecar decides `ALLOW`, `MODIFY`, `QUEUE`, or `BLOCK`. If `QUEUE`, the workflow enters reviewer mode with a typed reason.
- **How:** Show the rule explanation, highlighted risky fields, destination class, and available reviewer actions. This should feel operational, not decorative.
- **Why:** This is where GlobiGuard stops being a filter and becomes an action governor.
- **Before/after:** “Send claimant email” → `QUEUE: external domain + health data + missing permission`
- **Metrics:** decision, queue rate, review SLA, reviewer outcome distribution.
- **Animation:** The pipeline halts, the packet shifts upward into a review lane, and a reason card unfolds.

### Node 12 — **Detokenize + Audit Evidence**
- **Tagline:** Restore only what is approved, then write immutable proof.
- **What:** Approved outputs are detokenized at the last safe moment, executed, and logged with audit identifiers. Compliance evidence is generated from these events, not from hand-written policy docs.
- **How:** Replace only live tokens, then emit action metadata and audit linkage. Show that raw content does not cross to the coordination plane.
- **Why:** A control that cannot prove execution is not compliance infrastructure.
- **Before/after:** approved draft with tokens → final sent email + audit event + framework mapping.
- **Metrics:** detokenization latency, tokens restored, audit ID, framework controls satisfied.
- **Animation:** Tokens resolve back into plaintext on the customer side while an evidence ledger stamps and chains the event.

---

## 6. The page UX spec

### 6.1 Overall structure

The current frontend is basically a starter Vite page. That is good news. There is no legacy information architecture to work around.

Build the explainer as a **single narrative page with a sticky animated pipeline** plus deep side panels.

Recommended section flow:

1. **Hero:** one sentence defining the category
2. **Why existing AI governance is fake:** explain bypass problem
3. **Sticky 12-node pipeline:** the system walkthrough
4. **Automation workflow section:** action governance, queue, approval
5. **Live demo section:** same insurance record, interactive toggles
6. **Framework/evidence section:** 12 frameworks and proof model
7. **Architecture section:** coordination vs enforcement plane
8. **Closing assertion:** why this becomes mandatory infrastructure

### 6.2 Scroll behavior

- The left side stays sticky with the SVG pipeline.
- The right side scrolls explanatory panels.
- Each scroll breakpoint activates one node and morphs the sample payload.
- Node activation should update three things simultaneously:
  1. highlighted path in SVG
  2. right-side text panel
  3. claim-payload diff view

Do not make the user hunt. Every scroll tick should answer:

- what changed
- why it changed
- what risk was removed or deferred

### 6.3 The emotional arc

The emotional arc should peak **not** at “look, we found an SSN.” That is commodity.

It should peak at:

> “The AI drafted the action, and GlobiGuard stopped the action with a typed reason before it touched the outside world.”

That is the moment people understand the category shift from DLP-style scanning to agentic governance.

Recommended emotional sequence:

1. **Curiosity:** “How does the model avoid seeing raw PII?”
2. **Respect:** “The three-layer detector is fast and precise.”
3. **Trust:** “Tokens preserve reasoning without revealing values.”
4. **Shock / clarity:** “The AI still cannot act without passing the gate.”
5. **Confidence:** “A human can approve with explicit reasons.”
6. **Conviction:** “Everything is provable later.”

### 6.4 Where the live demo goes

Put the live demo **immediately after Node 11 or at the transition into the workflow-controller section**.

Reason:

- If you show the demo too early, users fixate on masking and miss the product.
- If you show it too late, the page becomes too abstract before payoff.

The demo should let users toggle:

- action type: `read`, `write`, `send`
- destination: `internal`, `salesforce`, `gmail`
- fields present: `SSN`, `DOB`, `HEALTH_DX`, `CLAIM_AMOUNT`

Then show:

- tokenized prompt
- risk score shift
- resulting decision
- if queued, the human review card

That interactivity is more persuasive than an autoplay animation.

### 6.5 Information density rules

Engineers will tolerate density if the page is structured. They will reject fluff immediately.

So:

- no giant hero claims without diagrams
- no framework badges before the pipeline is understood
- no generic “AI safety” language
- no motion without state change

Every animated step should correspond to a real architecture event.

### 6.6 Visual language

Use consistent semantic colors:

- red = blocked / hard stop
- amber = queued / human review
- blue = processing / transformation
- green = approved / executed
- gray = coordination-plane metadata
- purple = tokenization / cryptographic boundary

Show the coordination plane and enforcement plane as separate visual strata. If that separation is fuzzy in the UI, the zero-knowledge architecture will also feel fuzzy.

---

## 7. Things Claude Will Likely Get Wrong

Claude will probably do several predictable bad habits here.

### 7.1 It will over-explain compliance frameworks and under-explain runtime control

It will happily write 800 words on GDPR principles and barely explain how `QUEUE` works. That is backwards. The product is not a framework encyclopedia. It is an enforcement runtime.

### 7.2 It will describe GlobiGuard as a data filter instead of an action governor

This is the biggest conceptual failure mode. It will say things like “the middleware redacts sensitive data before AI processing,” which is true but incomplete. The actual differentiator is governing **what the AI is allowed to do next**.

### 7.3 It will say “XGBoost model” as if the code already does that

The reviewed code does not. The current scorer is linear and deterministic. A good analysis must say that explicitly instead of laundering aspiration into implementation.

### 7.4 It will miss the code-point vs byte-offset issue

The request asked for byte-level lifecycle. Most model answers will narrate bytes abstractly and fail to notice that Python detection/tokenization operates on string indices, not raw byte offsets. That matters for multilingual names and exact UI highlighting.

### 7.5 It will underspecify the queue reason model

It will write vague prose like “human approval is requested for risky actions.” That is useless. The important artifact is the **typed reason**:

- what field triggered the hold
- what destination class is risky
- what permission is missing
- what policy rule fired

If it does not specify that, it has not understood the workflow layer.

### 7.6 It will flatten tokenization and redaction into the same thing

They are not the same. `[REDACTED]` destroys referential structure. `[MASKED-SSN-001]` preserves typed identity and reversibility. If Claude treats them as equivalent privacy techniques, it is not thinking at systems level.

### 7.7 It will compare differential privacy and federated learning too generously

Those are not serious substitutes for this problem. DP is for aggregate release. FL is for training topology. Neither solves inference-time disclosure control plus action gating.

### 7.8 It will ignore the non-bypass sidecar requirement

It may describe the sidecar as “an optional proxy layer” or “middleware for monitoring AI traffic.” Wrong. The entire architecture depends on being in the execution path with no bypass. If bypass exists, the control guarantee disappears.

### 7.9 It will fail to notice the current sequential token-ID weakness

`vision.md` explicitly points toward random token IDs to avoid token-oracle attacks. If Claude praises `[MASKED-SSN-001]` without calling out that production should harden the suffix, it missed an important engineering edge.

### 7.10 It will blur coordination plane and enforcement plane

A sloppy answer will say “GlobiGuard stores audit and compliance data in the cloud” without sharply stating that raw customer data must remain in the customer environment and only anonymized metadata crosses the boundary. That blur kills the product’s trust model.

### 7.11 It will make the UX too abstract

Expect generic advice like “use animations to show data flow.” Not enough. Engineers need:

- which node is active
- what data changed
- what metric is shown
- why the motion exists

If the spec cannot be handed to a React + Framer Motion engineer and implemented directly, it is not good enough.

### 7.12 It will undersell audit evidence

The audit log is not a reporting convenience. In the target architecture it is the evidentiary backbone: async published, tamper-evident, and usable for framework mapping and regulator response. If Claude treats it as “logging,” it has missed the legal/commercial core.

---

## Bottom line

GlobiGuard is strongest when presented as **runtime AI action governance implemented inside the customer boundary**.

The technology stack is not the story by itself:

- regex/Presidio/GLiNER are necessary
- tokenization is necessary
- risk scoring is necessary

But the category-defining layer is the typed workflow controller plus sidecar gate:

> AI can read only masked data, can act only through governed steps, and can execute sensitive actions only with explicit policy authority or human approval.

That is the product engineers should build, and the explainer page should make that impossible to miss.
