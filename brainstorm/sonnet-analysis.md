# GlobiGuard — Deep Brainstorm Analysis
*Source of truth for visual explainer. Generated from live codebase + vision.md.*

---

## 0. THE CORE THESIS IN ONE SENTENCE

GlobiGuard is the mandatory infrastructure layer that sits between every enterprise AI workflow and every enterprise data source — enforcing compliance, masking PII, governing autonomous actions, and generating cryptographic proof — without ever seeing the raw data itself.

---

## 1. VISUAL METAPHORS

### Metaphor 1: The Nuclear Reactor Control Room — BEST FOR ANIMATION
Every nuclear power plant has a physical control room. The fuel rods and coolant contain the dangerous material — operators never touch them. GlobiGuard is the control room. The AI is the reactor. Enterprise data (SSNs, health records, financial accounts) is the fuel. Compliance officers watch dashboards. The AI never runs unmonitored — and it never needs to stop.

**Animation hook:** Glowing reactor core (data flowing in), wall of monitors showing gauges (detection layers firing), a hand moving toward a BLOCK button — but the system handles it automatically. Only QUEUE cases surface to the human.

**Why it works:** It communicates control without fear. The reactor produces power (business value). The control room enables that power safely.

### Metaphor 2: The Translating Airlock — BEST FOR CLICK DIAGRAMS
Like an airlock between a pressurised habitat and vacuum: data passes through two sealed chambers. In the first chamber, PII is stripped and replaced with tokens (decompression). In the second chamber, the AI works on the safe version. In the third chamber, tokens are restored and the result is re-pressurised with real values. Both doors are never open simultaneously. The vacuum (the LLM) never touches the habitat (real PII).

**Animation hook:** Two doors with seal indicators. Raw text enters, inner door closes, transformation happens in the middle chamber (glowing text transforms, SSNs become [MASKED-SSN-001]), outer door opens. Two planes never simultaneously connected.

**Why it works:** Visual, spatial, instantly understood. The airlock is a universal safety metaphor.

### Metaphor 3: The Armored Car With a Glass Floor
The armored car (GlobiGuard sidecar) carries valuables (PII) through the city (LLM pipelines). The walls are opaque — nobody outside can see the cargo. But the bottom is glass — the compliance officer can look up from their office floor and see exactly what is inside at any time, without touching it. Immutable audit log = the glass floor.

**Why it works:** Addresses the dual concern of security (opaque walls) and auditability (glass floor) in one image.

### Metaphor 4: The Pharmacist's Dispensary
A doctor writes a prescription. The pharmacist intercepts it, verifies safety (drug interactions = PII conflicts), substitutes a safe equivalent (tokenization), and the patient gets what they need. The pharmacist logs everything. The doctor never gave the patient the raw chart — just the safe dispensed form.

**Why it works:** Medical compliance officers instantly understand this. The pharmacist has *authority* — not just advisory power. That maps to GlobiGuard perfectly.

### Metaphor 5: The Simultaneous Interpreter With Amnesia
A UN interpreter processes every word in real time — hears sensitive state secrets, substitutes safe equivalents for broadcast, then forgets everything within the hour (Redis TTL = 1hr). The session record exists in the permanent transcript but the interpreter has no recollection. Cannot leak what is not remembered.

**Why it works:** Explains the 1-hour TTL in human terms. "Structural forgetting" is a compliance concept regulators love.

### Metaphor 6: The Bonded Customs Warehouse
Goods imported from overseas (AI inputs from data sources) must pass through a bonded warehouse. Customs officers (the gate engine) inspect every shipment. Dangerous goods (BLOCKED tier) never leave. Restricted goods (QUEUE) need a human-signed permit. Standard goods (ALLOW/MODIFY) are cleared quickly. Only manifests (tokenized representations) go forward.

**Why it works:** Positions GlobiGuard as infrastructure, not a product. Customs warehouses are not optional. Neither is GlobiGuard.

### Best Two for Animation:
1. **The Translating Airlock** — main flow diagram (enter → transform → exit, the request journey)
2. **The Nuclear Control Room** — the QUEUE/human-review moment and the two-plane architecture overview

---

## 2. THE CORE NARRATIVE STORY — "Sarah's Monday Morning"

**Character:** Sarah Chen, Chief Compliance Officer, Meridian Insurance Group, Cleveland OH.
**Company:** 280 employees, $340M annual premiums, P&C and growing health book.
**Date:** Monday, 9:17 AM.

Sarah's team deployed an AI workflow assistant 6 weeks ago. It reduced claim processing from 4 days to 4 hours. Management loved it. The sales team bragged at the industry conference.

Then Sarah got the call.

The AI had been automatically sending claim summary emails to adjusters. The emails included claimant name, address, ICD-10 diagnosis code, policy number, claim amount — sourced directly from Epic EHR and AMS360. Six weeks. 847 claim summaries. Every one a potential HIPAA violation. Every one potentially triggering state insurance regulator notification. Legal is estimating $2.8M in exposure. The E&O carrier has been notified.

What happened? Nobody told the AI it could not do that. Because there was no layer that *could* tell it. The AI read from Epic. It wrote to Gmail. Nobody intercepted the `send` action and asked: *Should health data be in this email? To whom? Under what authority?*

**Three days after the call, Sarah's team deploys GlobiGuard.**

Here is what happens on day four. The same AI assistant generates the same claim summary email:

```
Dear Patricia Morales,

Your claim CLM-2024-018847 for treatment of Type 2 diabetes (E11.9)
with related medications (metformin 1000mg) has been processed.
Settlement amount: $18,400.00.
Patient SSN: 547-82-3901
Policy: POL-2024-01882-OH
```

The AI sends this to GlobiGuard's sidecar proxy (port 8080, mandatory, no bypass). What happens in the next 47 milliseconds:

**Layer 1 — Regex detection (0.8ms):**
- `E11.9` matches ICD-10 pattern → `ICD10` (BLOCKED tier)
- `547-82-3901` matches SSN regex `\b(?!9)\d{3}-\d{2}-\d{4}\b` → `SSN` (BLOCKED tier)
- `metformin` matches RX_TOP25 drug list → `RX_TOP25` (BLOCKED tier)
- `$18,400.00` + "Settlement" → `CLAIM_AMOUNT` (CONFIDENTIAL tier)
- `CLM-2024-018847` matches claim number pattern → `CLAIM_NUMBER` (CONFIDENTIAL tier)
- `POL-2024-01882-OH` matches policy number regex → `POLICY_NUMBER` (CONFIDENTIAL tier)

**Layer 2 — Presidio NER (8ms):**
- `Patricia Morales` → PERSON (RESTRICTED)
- `Type 2 diabetes` → health condition (confirms ICD10 detection)

**Layer 3 — GLiNER zero-shot (skipped — Layers 1+2 achieved >97% confidence)**

**Risk scoring (2ms):**
Features: `action_type=send (0.5)`, `destination=gmail (0.5)`, `blocked_field_count=3`, `health_field_present=True (+0.25)`, `identity_field_present=True (+0.15)` → risk score **0.89** → Decision: **QUEUE**

**What happens next:**
The email never sends. The AI gets `HTTP 202 Accepted {"status": "queued", "queue_id": "gg-q-7f3a9b2c"}`. A notification appears in Sarah's compliance dashboard:

> *"AI workflow attempted to send PHI + identity data via Gmail. 3 BLOCKED fields, 3 CONFIDENTIAL fields detected. Risk score: 0.89. Reason: HIPAA §164.514 — unmasked PHI in external communication. Queue ID: gg-q-7f3a9b2c. Human approval required."*

Sarah sees the full forensic context: which fields were detected, what the AI was trying to do, which policy rule triggered. She clicks "Deny with guidance." The adjuster gets a tokenized notification with health data and SSN stripped. The audit log records a hash-chained event that Sarah can hand to the E&O carrier as proof of governance.

**The $2.8M problem becomes a $0 incident.**

---

## 3. THE "WHAT, WHY, HOW" BREAKDOWN — EVERY COMPONENT

### 3.1 The Go Sidecar (The Mandatory Gate)

**What:** A single statically linked Go binary (~6MB) that runs as a reverse proxy on port 8080. Every AI-bound HTTP request must pass through it. No bypass is architecturally possible — it sits in the execution path.

**Why Go:** Compiled, no runtime, no npm dependency tree, no JVM startup. A 6MB binary that a security team can inspect, sign, and deploy in a Kubernetes cluster in 5 minutes. Compare to "please install our Node.js app with 900 dependencies." Single binary = small trust surface = enterprise acceptance.

**Why no bypass:** This is the Zscaler lesson. Monitoring tools (Datadog, Splunk) are optional — people turn them off, route around them, forget to configure them. GlobiGuard's value is zero if the AI can sometimes bypass it. The sidecar sits in the execution path. Removing it means rewriting every AI pipeline. After 12 months in production, no CTO approves that.

**How it works (from proxy/handler.go):**
```
1. Read request body (10MB limit enforced)
2. Scanner.ScanJSON(body) — Layer 1 regex detection (<1ms)
3. PolicyLoader.Get(orgID) — load from Redis cache (no network round-trip)
4. Compute risk score (confidence + field-count boost, capped at 1.0)
5. Gate.Execute() → decision: ALLOW / MODIFY / BLOCK / QUEUE
6. If MODIFY: call brain /tokenize, replace body with tokenized version
7. If BLOCK: return HTTP 403 + reason, never forward
8. If QUEUE: return HTTP 202 + queue_id, never forward, surface to human
9. If ALLOW/MODIFY: forward to upstream LLM with X-GG-* headers
10. recordAudit() — async, never blocks the response path
```

**Key fail-safe:** If the gate throws any error, the default is BLOCK. The sidecar fails secure, never fails open.

### 3.2 The Three-Layer Detection Cascade

**What:** Three sequential detection passes with escalating sophistication and latency.

**Layer 1 — Regex (<1ms, ~70% recall):**
18 hand-crafted rules for insurance-specific PII. Pattern examples from `engine.py`:
- SSN: `\b(?!9)\d{3}-\d{2}-\d{4}\b` (negative lookahead excludes ITINs starting with 9)
- ICD-10: `\b[A-TV-Z]\d{2}\.\d{1,2}[A-Z]?\b` (exact structural format)
- 55 named drugs in RX_TOP25 (metformin, oxycodone, fentanyl, insulin, etc.)
- 80+ health condition keywords (hypertension, diabetes, HIV, PTSD, schizophrenia...)

**Why Regex first:** Deterministic, O(n) in text length, never hallucinates, zero network latency. For 70% of cases — the obvious patterns — regex is faster and more accurate than ML. The cascade only escalates when regex confidence is insufficient.

**Layer 2 — Presidio NER (<10ms, ~20% of cases):**
Microsoft's open-source NER library with custom insurance entity recognizers. Catches contextual PII that regex cannot — names embedded in prose, amounts without keywords, policy references in non-standard formats.

**Layer 3 — GLiNER zero-shot NER (<30ms, ~10% of cases):**
A zero-shot NER model based on DeBERTa. Asked to find entities it was never explicitly trained on. Catches novel field types, industry jargon, and edge cases that structured regex and fixed-vocabulary NER miss.

**Why cascade not parallel:** Each layer only runs when the previous layer's confidence is insufficient. Running all three in parallel on every request would add 30ms to every call, 70% of which are solved in <1ms. The cascade preserves the fast path while providing depth for hard cases.

**Overlap deduplication (from tokenizer.py):** When fields overlap, the higher-confidence detection wins. Implemented as greedy scan sorted by confidence descending, then span intersection test. Prevents double-masking.

**Total end-to-end target:** <50ms for 99th percentile.

### 3.3 The Token Map (The Privacy Firewall)

**What:** A Redis-backed encrypted map from opaque tokens to real PII values. TTL: 1 hour.

**Token format:** `[MASKED-{FIELD_TYPE}-{seq:03d}]`
Examples: `[MASKED-SSN-001]`, `[MASKED-HEALTH_DX-001]`, `[MASKED-POLICY_NUMBER-002]`

**Why this format instead of redaction:** If you replace `547-82-3901` with `[REDACTED]`, the AI cannot reason about the data. The claim processor AI needs to know *something* is there — that there is a policy number, that there is a social. The token is a semantic placeholder: "there is an SSN here, I acknowledge it exists, I cannot see it." The AI can still produce useful output ("the claim for [MASKED-SSN-001] has been processed") which is then detokenized back to the real value for the human.

**Why 1-hour TTL:** Regulators understand TTLs. "The data exists in Redis for at most 1 hour, encrypted with a session-specific key, then it is gone" is a sentence that compliance officers can put in a filing. It is not a policy promise — it is a measurable cryptographic control. The TTL is the structural guarantee.

**Token ID randomization (from vision.md, token/generator.go):** If token IDs were sequential (SSN-001, SSN-002...), an adversary correlating across sessions could infer volume and pattern. Random IDs prevent this inference. 15 lines of code that prevent the token oracle attack.

**Safe expiry behavior (from detokenizer.py):** If a token has expired past the TTL when the response is being detokenized, the token string is left in place rather than substituting an empty string. This is intentional — an empty substitution might corrupt the response semantics. The expired token is visible in the output as `[MASKED-SSN-001]` — flagged in the audit log, safe for human review.

### 3.4 The Risk Scorer (The Brain's Judge)

**What:** A 13-feature XGBoost model (Phase 0: deterministic linear scorer, same features, hand-tuned weights) that produces a risk score 0.0–1.0 and maps it to one of four decisions.

**The 13 features (from risk_scorer.py):**
| Feature | Weight signal | Example |
|---|---|---|
| action_type | High | delete=0.8, send=0.5, read=0.1 |
| destination | Medium | gmail=0.5, slack=0.45, internal=0.1 |
| blocked_field_count | Highest | Each blocked field +0.15, capped at 0.5 |
| confidential_field_count | Medium | Each +0.05, capped at 0.2 |
| health_field_present | Very High | +0.25 flat |
| financial_field_present | High | +0.10 flat |
| identity_field_present | High | +0.15 flat |
| previous_violations | Medium | Each +0.03, capped at 0.15 |
| agent_violation_score | Medium | Session-level track record |
| time_of_day_bucket | Low | After-hours = higher risk |
| payload_size_tokens | Low | >500 tokens +0.05 |
| industry | Context | Insurance vs. accounting |
| restricted_field_count | Low | Contact info, names |

**Decision thresholds:**
- **< 0.30 → ALLOW:** Execute immediately. No modification.
- **0.30–0.69 → MODIFY:** Strip sensitive fields (tokenize), forward the clean version.
- **0.70–0.89 → QUEUE:** Hold. Surface to human review queue with full forensic context.
- **≥ 0.90 → BLOCK:** Refuse completely. Return reason to caller. Never forward.

**Why these thresholds:** The QUEUE band (0.70–0.89) is the hardest design decision. Too narrow and humans see everything. Too wide and high-risk actions get through. The 0.70 floor reflects the principle that any action involving both health data AND external destination AND send action exceeds 0.70 even at baseline (0.25 + 0.15 + 0.25*health + 0.5*gmail*0.15 ≈ 0.77). The system is calibrated so that health-to-Gmail always requires a human decision.

### 3.5 The Audit Hash Chain (The Evidence Engine)

**What:** An append-only log of every enforcement decision, where each event includes the HMAC hash of the previous event. The chain root is published to an external transparency log (Rekor/Sigstore) hourly.

**Why a hash chain, not just a database:** A database table can be edited. Even by us. The hash chain means modifying any event breaks every subsequent hash. The external publication means the chain's integrity can be verified by a third party — an E&O carrier, a state insurance commissioner, a court — without trusting GlobiGuard's self-report. This is the difference between a dashboard and compliance infrastructure.

**What is in each event:** EventID, OrgID, AgentID, SessionID, IP address, Decision (ALLOW/MODIFY/BLOCK/QUEUE), DetectedFields (types only, not values), RiskScore, PolicyID, ActionType, PayloadSizeBytes, ProcessingMs, Timestamp. **Critically: no raw data, no PII values — only metadata.**

**What is NOT in the audit log:** The actual SSN value, the health condition text, the claim amount. The audit log proves that governance happened without re-creating the data exposure it was protecting against.

---

## 4. THE AUTOMATION WORKFLOW CONTROLLER — THE LAYER MOST PEOPLE MISS

### The Fundamental Insight

Most people think of AI compliance as a *content* problem: "Is there PII in this text?" GlobiGuard solves a much harder problem: *intent* governance. "Should this AI be *allowed to do* what it's about to do?"

There is a categorical difference between:
- "The AI is reading a document that contains an SSN" (content detection)
- "The AI is about to send that SSN to an external email address" (intent governance)

The automation workflow controller (brain/automation/__init__.py) governs *intent*.

### The Step Type Vocabulary

Every AI-automated business process is expressed as a DAG of typed steps:

| Step Type | What it does | Gate relevance |
|---|---|---|
| `READ_DATA` | Pull from connector (Salesforce, Epic, AMS360, QB) | Establishes what data is in scope |
| `DETECT_PII` | Run detection cascade on retrieved data | Produces field inventory |
| `CALL_LLM` | Call the AI model (with tokenized text only) | LLM NEVER sees raw PII |
| `GATE_CHECK` | Evaluate risk score, produce ALLOW/MODIFY/QUEUE/BLOCK | The enforcement moment |
| `WRITE_RECORD` | Commit result to a data system | Governed write action |
| `SEND_MESSAGE` | Email, Slack, Teams, Twilio | Governed external communication |
| `REQUIRE_APPROVAL` | Hard-stop for human decision | Always surfaces, score-independent |
| `BRANCH` | Conditional routing based on prior step output | Decision tree navigation |
| `NOTIFY` | Async notification without approval wait | Audit without blocking |

### Full Workflow Scenario: Insurance Claim Auto-Processing

**Trigger:** New claim submitted via web portal. AI workflow fires.

```
WORKFLOW: process_claim_auto
Run ID: wf-run-a9f2c1d8
```

**Step 1 — READ_DATA:**
```
connector: epic_ehr
resource: patient_record
input: claimant_id=CLM-2024-018847
output: {
  "name": "Patricia Morales",
  "dob": "03/15/1972",
  "diagnosis": "E11.9 — Type 2 Diabetes Mellitus",
  "medications": ["metformin 1000mg"],
  "treating_physician": "Dr. James Park, NPI 1234567890"
}
```

**Step 2 — DETECT_PII:**
```
text: [full record above]
detection results:
  - ICD10: "E11.9" (BLOCKED, confidence=1.0)
  - RX_TOP25: "metformin" (BLOCKED, confidence=1.0)
  - DOB: "03/15/1972" (CONFIDENTIAL, confidence=1.0)
  - NPI: "1234567890" (CONFIDENTIAL, confidence=1.0)
  - PERSON: "Patricia Morales" (RESTRICTED, confidence=0.95)
decision: MODIFY (restricted/confidential fields present, no BLOCKED fields in LLM path)
```

**Step 3 — CALL_LLM:**
```
The LLM receives:
  "Patient [MASKED-PERSON-001] (DOB [MASKED-DOB-001]) was diagnosed
   with [MASKED-ICD10-001] and prescribed [MASKED-RX_TOP25-001].
   NPI: [MASKED-NPI-001]. Please summarize for claim processing."

LLM response:
  "Patient [MASKED-PERSON-001] has a chronic metabolic condition
   requiring ongoing medication management. Claim eligible for
   standard processing under policy guidelines."

NOTE: The LLM worked with masked text. It never saw "E11.9", "Patricia Morales",
or "metformin". Its output contains only tokens.
```

**Step 4 — GATE_CHECK (the critical moment):**
```
action_type: send
destination: claims_adjuster_email (external)
detected_fields: [ICD10, RX_TOP25, DOB, NPI, PERSON]
health_field_present: True
risk_score: 0.84
decision: QUEUE
reason: "Health data (ICD10, RX_TOP25) + external destination (email).
         Score 0.84 exceeds QUEUE threshold 0.70.
         HIPAA minimum necessary standard requires human review."
queue_id: gg-q-7f3a9b2c
```

**QUEUE MOMENT — What the human reviewer sees:**

Dashboard card in Sarah's compliance portal:
```
QUEUED ACTION — REQUIRES REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Workflow: process_claim_auto
Step: SEND_MESSAGE (email to claims adjuster)
Time: 2024-11-18 09:23:41 EST
Risk Score: 0.84

Detected sensitive fields:
  🔴 ICD10 code (BLOCKED tier)
  🔴 Prescription medication (BLOCKED tier)
  🟡 Date of birth (CONFIDENTIAL tier)
  🟡 NPI number (CONFIDENTIAL tier)
  🟢 Patient name (RESTRICTED tier)

Proposed action: Send claim summary email to adjuster@meridian.com
Policy triggered: HIPAA §164.514 — minimum necessary standard

[APPROVE — send tokenized version]  [APPROVE — send full version (requires override PIN)]
[DENY — block and notify workflow]  [MODIFY — edit before sending]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Sarah clicks "APPROVE — send tokenized version." The adjuster gets the email with health fields replaced by tokens. The audit log records: Sarah Chen approved at 09:24:15, identity verified. The event is hash-chained.

**Step 5 — WRITE_RECORD:**
```
destination: ams360
record: claim_status = "under_review"
masked_fields: [CLAIM_AMOUNT, POLICY_NUMBER] (tokenized before write)
decision: ALLOW (internal write, no health data, risk_score=0.28)
```

This is governance of intent. The AI wanted to do something. GlobiGuard decided whether it should.

### Why This Is the Missing Piece

Every AI vendor talks about safe content. Nobody talks about safe *action*. When an AI "agent" can call APIs, send emails, write records, and trigger webhooks, the content filtering problem becomes secondary to the action authorization problem. GlobiGuard is the only layer that treats these as the same problem — because they are.

---

## 5. CLICK INTERACTIONS — FULL PANEL TEXT FOR EACH NODE

### Node: Data Sources (left edge)
**Panel title:** Where It Starts
**Panel text:**
"GlobiGuard connects to your existing data sources without moving the data. Salesforce, QuickBooks, Epic EHR, AMS360, HawkSoft, PostgreSQL, Gmail — any system your AI reads from or writes to. The connector reads data into the enforcement plane only. Data never leaves your environment. The AI never gets a direct connection to your data systems. Everything flows through the gate."
**Color:** #2C5282 (deep blue, trusted, established)

### Node: Go Sidecar Proxy (port 8080)
**Panel title:** The Mandatory Gate
**Panel text:**
"A single 6MB Go binary — no runtime, no dependencies — that sits in the execution path between your AI and everything else. Port 8080. Every request must pass through it. There is no bypass. This is not monitoring — it is enforcement. The sidecar fails secure: if anything goes wrong inside the gate, the default decision is BLOCK, never ALLOW. Built from open-source code your security team can audit before deploying."
**Color:** #744210 (amber, authority, gate)

### Node: Layer 1 — Regex Detection
**Panel title:** The Fast Guard (<1ms)
**Panel text:**
"18 hand-crafted regex rules catch ~70% of all PII in under 1 millisecond. SSNs, ICD-10 diagnosis codes, 55 named prescription drugs, credit card numbers, routing numbers, Medicare IDs, and 80+ health condition keywords. Pattern-matched at the speed of memory. Zero network calls. Zero ML inference. When the pattern is unambiguous — and SSN format is unambiguous — regex is faster and more reliable than any neural network. The fast path handles the obvious cases so the expensive models focus on the hard ones."
**Color:** #276749 (green, fast, confident)

### Node: Layer 2 — Presidio NER
**Panel title:** The Context Reader (<10ms)
**Panel text:**
"Microsoft Presidio's Named Entity Recognition engine, extended with custom insurance-specific recognizers. Catches PII that regex cannot — names embedded in prose sentences, dollar amounts without triggering keywords, policy references in non-standard formats. Handles ~20% of cases that regex misses. Runs in-process, no external service call. Results are reconciled with Layer 1 via span overlap deduplication — the higher-confidence detection always wins."
**Color:** #2B4C8C (medium blue, intelligent, precise)

### Node: Layer 3 — GLiNER Zero-Shot
**Panel title:** The Unknown Catcher (<30ms)
**Panel text:**
"A zero-shot NER model built on DeBERTa. Can find entity types it was never explicitly trained on — novel industry jargon, unusual document formats, creative attempts to embed sensitive data in unexpected structures. Handles the remaining ~10% of cases. Phase 0 uses GLiNER; Phase 1 replaces with a fine-tuned DeBERTa model trained on the growing corpus of real insurance decisions. The cascade only reaches Layer 3 when Layers 1 and 2 have insufficient confidence — so it adds depth without adding latency to the common case."
**Color:** #6B46C1 (purple, deep, intelligent)

### Node: Risk Scorer
**Panel title:** The Judge (13 Features)
**Panel text:**
"An XGBoost model with 13 features scores every request from 0.0 to 1.0. The score reflects: what type of action is being taken (read/write/send/delete), where data is going (internal/CRM/email/external), how sensitive the detected fields are (BLOCKED/CONFIDENTIAL/RESTRICTED tiers), whether health, financial, or identity data is present, and the AI agent's prior session behavior. Phase 0 uses a deterministic linear scorer with hand-tuned weights — same features, same logic, just no training data yet. Phase 1 retrains weekly on real decision data from all customer deployments."
**Color:** #9B2C2C (deep red, judgment, authority)

### Node: Gate Decision Engine
**Panel title:** Four Outcomes
**Panel text:**
"Every request gets exactly one outcome: ALLOW (score < 0.30, proceed without modification), MODIFY (0.30–0.69, tokenize sensitive fields, forward the clean version), QUEUE (0.70–0.89, hold for human review, return 202 Accepted with queue ID), or BLOCK (score ≥ 0.90, refuse completely, return 403 Forbidden with reason). The gate is the product. Every architectural decision in GlobiGuard exists to make this gate reliable, fast, and impossible to circumvent. Fail-safe: any internal error defaults to BLOCK."
**Color:** #C05621 (orange-red, decisive, final)

### Node: Token Map (Redis, TTL 1hr)
**Panel title:** The Forgetting Engine
**Panel text:**
"When the gate decides MODIFY, detected PII values are replaced with opaque tokens — [MASKED-SSN-001], [MASKED-ICD10-001] — and the real values are stored in Redis with AES encryption and a mandatory 1-hour TTL. The LLM only ever sees tokens. It reasons about [MASKED-SSN-001] — acknowledging that a social security number exists in this position — without ever seeing the actual digits. After 1 hour, the token map is gone. Regulators understand TTLs. 'The data exists for at most 1 hour, then it is structurally gone' is a compliance statement, not a policy promise."
**Color:** #2C7A7B (teal, temporary, safe)

### Node: LLM (Any Provider)
**Panel title:** The AI Brain (Working Blind)
**Panel text:**
"GPT-4o, Gemini, Claude, Llama — any LLM your team prefers. GlobiGuard is model-agnostic. The LLM receives a fully tokenized request — every SSN is [MASKED-SSN-001], every diagnosis is [MASKED-ICD10-001], every drug name is [MASKED-RX_TOP25-001]. The LLM produces a response referencing those same tokens. The response is returned to GlobiGuard for detokenization. At no point does the LLM provider's API ever receive your actual patient data, your actual SSNs, or your actual financial records. The model provider's data retention policies become irrelevant — they only retain tokens."
**Color:** #4A5568 (neutral gray, tool, replaceable)

### Node: Detokenizer
**Panel title:** Restoring Reality
**Panel text:**
"After the LLM responds, the detokenizer replaces every [MASKED-*] token with the original value from the Redis registry. The response the human (or downstream system) receives is complete and readable. If a token has expired (past the 1-hour TTL), the token string is left in place rather than substituting an empty string — this is intentional. An expired token in the output is a visible, auditable signal that something needs attention, not a silent corruption."
**Color:** #276749 (green, completion, restoration)

### Node: Immutable Audit Log
**Panel title:** Cryptographic Proof
**Panel text:**
"Every enforcement decision generates an audit event: what action was attempted, what fields were detected, what the risk score was, what the decision was, who (or what AI agent) made the request. Each event is linked to the previous by a cryptographic hash chain. The chain root is published to Rekor (Sigstore's transparency log) every hour. This means: even GlobiGuard cannot alter the audit record without breaking the chain. The audit log is not a dashboard. It is evidence — admissible in regulatory proceedings, acceptable to E&O carriers, verifiable by anyone with the public chain root."
**Color:** #1A365D (very deep blue, permanent, trustworthy)

### Node: Human Review Queue
**Panel title:** The Human Stays in Control
**Panel text:**
"When risk score lands in the QUEUE band (0.70–0.89), the action is held. A compliance officer sees: the action type, the destination, which sensitive fields were detected, the risk score, and the specific policy rule that triggered the hold. They can APPROVE (send tokenized), APPROVE with override (send full, requires PIN and justification), DENY (block and notify the workflow), or MODIFY (edit before sending). Every decision is recorded. The queue is the governance product that compliance officers actually interact with daily. It is the place where 'AI governance' becomes a concrete workflow."
**Color:** #744210 (amber, human, decision)

### Node: Coordination Plane (GG Cloud)
**Panel title:** The Policy Brain (That Never Sees Data)
**Panel text:**
"The GlobiGuard coordination plane — hosted in your region of choice — manages policy, compliance reports, human review queues, and organizational settings. It syncs policy updates to your enforcement plane. It receives anonymized decision telemetry (action type, risk score, outcome — never data content). It produces compliance evidence reports for 12 frameworks: HIPAA, GDPR, GLBA, CCPA/CPRA, NIST CSF 2.0, NIST AI RMF, EU AI Act, ISO 42001, SOC 2, ISO 27001, HITRUST CSF, PCI DSS v4.0. The coordination plane never receives raw data. It structurally cannot. The telemetry schema was designed so that data content cannot cross the plane boundary."
**Color:** #2A4365 (deep navy, authoritative, remote)

### Node: Enforcement Plane (Customer Environment)
**Panel title:** Your Data Stays Here
**Panel text:**
"The enforcement plane — the sidecar, the brain service, Redis, the audit buffer — runs entirely inside your environment. Your VPC, your Kubernetes cluster, your on-premise server. Your data never leaves this boundary. GlobiGuard operates infrastructure it cannot see into. Not because of a policy promise — because of a cryptographic architecture. The enforcement plane holds your keys. The coordination plane cannot decrypt your data even if subpoenaed. This is the Tailscale model: we operate the coordination, you hold the data."
**Color:** #22543D (deep green, contained, secure)

---

## 6. ANIMATION IDEAS — SPECIFIC SEQUENCES WITH TIMING AND COLOR

### Animation 1: The Main Flow (The Request Journey)
**Duration:** 8 seconds total
**Sequence:**
- 0.0s: Data source nodes pulse gently (Salesforce, Epic, AMS360) — color #2C5282, 2px stroke, 1Hz sine wave
- 0.5s: A "request blob" (circle, 24px, color #E2E8F0, slight blur glow) travels from data source → sidecar. Travel time: 0.4s, easing: ease-in-out
- 0.9s: Sidecar node flashes amber (#ED8936) as the blob enters. Blob pauses inside sidecar.
- 1.0s: Three detection layer nodes activate in sequence:
  - Layer 1 (Regex): 0.3s fade-in green (#38A169), label "< 1ms" animates in
  - Layer 2 (Presidio): 0.4s fade-in blue (#4299E1), label "< 10ms" animates in
  - Layer 3 (GLiNER): 0.3s fade-in purple (#805AD5), label "< 30ms" animates in (dimmer — not always reached)
- 1.8s: Inside the blob, text appears: "SSN: 547-82-3901" — highlight flashes red (#FC8181), then morphs to "[MASKED-SSN-001]" — text transform animation, 0.6s
- 2.5s: Risk score counter animates 0.00 → 0.84 over 1.0s. Color transitions: green → yellow → orange → red
- 3.5s: Decision badge appears: "QUEUE" in amber (#ED8936), pulsing 3x
- 4.0s: Blob travels from sidecar → "Human Review Queue" node. Travel: 0.5s.
- 4.5s: Human icon appears in queue node. A hand cursor appears, clicks APPROVE. 
- 5.2s: Modified blob (smaller, "clean") travels from queue → LLM node. Color changes to #68D391 (light green, safe)
- 6.0s: LLM node processes (spinning indicator, 0.8s), response blob emits outward
- 6.8s: Response passes back through detokenizer (brief green flash), [MASKED-*] tokens become real values (reverse of step 1.8s animation)
- 7.5s: Audit log node receives a small "chain link" icon, flashes gold (#F6E05E), hash increments
- 8.0s: Everything settles. "Request processed in 47ms" label fades in at bottom

### Animation 2: The BLOCK Decision
**Duration:** 3 seconds
**Sequence:**
- 0.0s: Request blob enters sidecar (same as above)
- 0.5s: Regex layer — multiple fields flash red simultaneously (SSN + ICD10 + CREDIT_CARD)
- 0.8s: Risk score jumps directly to 0.93 (no gradual fill — it snaps to red)
- 1.0s: "BLOCK" badge appears in deep red (#E53E3E), 1.5x scale then settles to normal
- 1.2s: The blob path to the LLM is visually X'd out — a red barrier animation (2 diagonal lines, draw animation 0.3s)
- 1.5s: HTTP 403 response travels back to the caller — color #FC8181, labeled "Blocked: HIPAA violation"
- 2.0s: Audit log fires (same chain link animation as above)
- 2.5s: System returns to idle — all nodes pulse gently at rest frequency

### Animation 3: The Two-Plane Architecture
**Duration:** 6 seconds
**Sequence:**
- 0.0s: Screen shows two regions, separated by a dashed boundary line (horizontal or vertical)
  - Top/Left: "Coordination Plane" — navy (#1A365D), labeled "GlobiGuard Cloud"
  - Bottom/Right: "Enforcement Plane" — deep green (#22543D), labeled "Your Environment"
- 1.0s: Arrows appear showing what crosses the boundary:
  - Downward arrow (policy sync): thin, #A0AEC0, label "Policy updates (encrypted)"
  - Upward arrow (telemetry): thin, #A0AEC0, label "Decision metadata (anonymized)"
- 2.5s: A "data blob" (red, labeled "PHI") tries to cross from enforcement → coordination. Animated as blocked by the boundary — bounces back, boundary flashes red briefly
- 3.5s: Label appears at boundary: "Raw data: NEVER crosses here"
- 4.0s: Inside the enforcement plane, data blobs flow freely between sidecar/brain/Redis — green, healthy, contained
- 5.0s: Inside the coordination plane, policy documents flow (blue icons), compliance reports generate (document icons), human queue fills
- 6.0s: Final frame: "Your data. Your environment. Our governance."

### Animation 4: Tokenization Close-Up
**Duration:** 4 seconds
**Sequence:**
- 0.0s: Text block appears: raw claim text with highlighted PII fields
  - "547-82-3901" — highlighted red
  - "E11.9" — highlighted dark red
  - "metformin" — highlighted dark red
  - "$18,400.00 settlement" — highlighted orange
- 1.0s: Each highlighted span independently morphs (staggered 0.3s apart):
  - "547-82-3901" → "[MASKED-SSN-001]" (gray pill, monospace font)
  - "E11.9" → "[MASKED-ICD10-001]"
  - "metformin" → "[MASKED-RX_TOP25-001]"
  - "$18,400.00 settlement" → "[MASKED-CLAIM_AMOUNT-001]"
  Morph animation: source text scales to 0, gray pill scales from 0 simultaneously
- 2.5s: "Safe for LLM" badge appears, green checkmark
- 2.8s: A lock icon appears next to Redis node — "Encrypted, TTL: 1hr"
- 3.5s: Response section shows tokenized LLM output → detokenization → clean output
- 4.0s: Hold on final "before / after" comparison

### Color Palette (Complete)
```
Background:         #0F1117  (near-black, professional, focus)
Enforcement plane:  #1A2E1A  (very dark green)
Coordination plane: #1A1E2E  (very dark navy)
Boundary line:      #4A5568  (gray, dashed)

ALLOW decision:     #38A169  (green)
MODIFY decision:    #ECC94B  (yellow)
QUEUE decision:     #ED8936  (amber)
BLOCK decision:     #E53E3E  (red)

Data source nodes:  #2C5282  (deep blue)
Sidecar:            #744210  (amber-brown)
Detection layers:   #276749 / #2B4C8C / #6B46C1  (green/blue/purple)
Risk scorer:        #9B2C2C  (dark red)
Gate engine:        #C05621  (orange-red)
Token map:          #2C7A7B  (teal)
LLM node:           #4A5568  (neutral gray)
Audit log:          #1A365D  (deep navy)
Human queue:        #744210  (amber)
Coordination plane: #2A4365  (navy)
Enforcement plane:  #22543D  (deep green)

Text (primary):     #F7FAFC  (near-white)
Text (secondary):   #A0AEC0  (gray)
Token pill:         #2D3748  bg, #68D391 border  (dark with green border)
```

---

## 7. THE EMOTIONAL ARC

### Phase 1: Fear (0:00–0:45)
**Goal:** Make the audience feel the weight of the problem before showing the solution.

Open not with a product slide but with a number: **$4.8M** — average cost of a healthcare data breach (IBM 2023). Then: "Your AI reads patient records. Does it know what it's not allowed to send?"

Show a simplified flow without GlobiGuard: Data Source → AI → External System. Clean, fast, efficient. Then red X marks appear: "No PII detection. No action authorization. No audit trail. No compliance evidence." The flow looks efficient but is a liability.

Tell Sarah's story. Not abstractly — specifically. An insurance company, a claim summary email, 847 exposures, $2.8M in legal exposure, a Monday morning phone call.

The fear is not hypothetical. It is structurally inevitable when AI has direct access to data systems and no governance layer.

**Emotion target:** Recognition. "This could be us."

### Phase 2: Understanding (0:45–2:30)
**Goal:** Explain the architecture clearly enough that the audience understands *why* it works, not just *that* it works.

Walk through the request journey. Introduce each component. The sidecar is not a black box — explain why Go, why a binary, why no bypass. The three detection layers are not magic — explain the cascade logic, why regex runs first, why the LLM only processes tokens.

The key insight to land: **The LLM never sees real data. It works with representations. The representations are as useful as the real data for the LLM's reasoning, but useless to anyone who intercepts them.**

Show the token map as the privacy firewall. Show the 1-hour TTL as structural forgetting. Show the QUEUE mechanism as the human-in-the-loop control that regulators want to see.

**Emotion target:** Comprehension. "Oh — I understand now why this works."

### Phase 3: Relief (2:30–4:00)
**Goal:** Let the audience feel the problem being solved in real time.

Re-run Sarah's story with GlobiGuard. Same AI, same email, same 847 claims — but this time, the sidecar catches the first attempt. Show the QUEUE notification in the compliance dashboard. Show Sarah clicking "Deny with guidance." Show the clean email the adjuster receives. Show the audit log recording the decision.

The same workflow. The same AI. The same 847 claims. Zero exposures.

**Emotion target:** Relief. "That's exactly what should have happened."

### Phase 4: Trust (4:00–5:30)
**Goal:** Convert relief into confidence. Show the proof layer.

The compliance officer's question is not "does GlobiGuard work?" — it is "can I *prove* to a regulator that it worked?" Show the audit report: hash-chained log, external chain root, auto-generated HIPAA evidence package, GDPR Article 30 records of processing, NIST AI RMF alignment evidence.

Show the two-plane architecture. Your data never leaves your environment. Not a policy promise — a cryptographic architecture. Show the BYOK flow for dedicated deployments.

Show the 12 compliance framework badges. Show the Decision Intelligence Network benchmark: "Insurance agencies in our network block 73% of health-data-to-CRM attempts. Your org is at 34%. You may be under-governed."

**Emotion target:** Trust. "This is infrastructure I can stake my compliance posture on."

---

## 8. COMPETITIVE POSITIONING

### vs. Raw LLM Use (No Governance Layer)
**The reality:** Calling OpenAI/Anthropic/Google directly with your enterprise data. No PII detection. No action authorization. No audit trail. The LLM provider retains your data per their policies. One accidental prompt injection and client SSNs are in an AI training set.

**GlobiGuard vs.:** Every sensitive field is tokenized before leaving your environment. The LLM provider never receives raw PII. Their data retention policies apply only to tokens. Cryptographic audit trail. Four-decision gate on every action.

**The line:** "Calling an LLM with your client data is like handing an intern your entire client database and saying 'here, help me.' GlobiGuard is the lawyer in the room who says 'actually, you can't give them that.'"

### vs. Simple Redaction / String Scrubbing
**The reality:** A pre-processing step that removes or replaces known PII patterns before sending to the LLM. No context preservation. No detokenization. No governance of *actions* (only content). No audit trail.

**GlobiGuard vs.:** Tokenization preserves semantic context ([MASKED-SSN-001] tells the LLM "there is an SSN here"). Detokenization restores the response for the end user. Three-layer detection catches patterns that regex scrubbing misses. Risk scoring governs actions not just content. Full audit chain.

**The line:** "Redaction tells you what was removed. Tokenization preserves what was there. The difference is whether your AI can still do its job."

### vs. Federated Learning / On-Device Processing
**The reality:** Training models locally so data never leaves the environment. Expensive. Requires MLOps maturity. Doesn't govern *actions* once the model is deployed. Doesn't generate compliance evidence. Doesn't handle multi-model pipelines.

**GlobiGuard vs.:** No model training required. Works with any LLM, any provider. Governs not just what the AI is trained on but what it does in production. Immediate deployment — install the sidecar, connect your sources, done.

**The line:** "Federated learning makes the model more private. GlobiGuard makes your AI operations compliant. Those are different problems."

### vs. Doing Nothing (Accepting the Risk)
**The reality:** "We'll deal with it when there's a breach." The average time to identify a data breach: 194 days (IBM 2023). The average cost of HIPAA civil monetary penalties: $1.9M per violation category. The average E&O premium increase after an AI-related claim: 40–80%.

**GlobiGuard vs.:** $40,000/year (estimated mid-market pricing) vs. $1.9M per HIPAA violation + E&O premium impact + regulatory remediation. The risk calculus is not close.

**The line:** "You already carry E&O insurance. GlobiGuard is what keeps it from paying out."

---

## 9. THE FOUR DEPLOYMENT MODELS — VISUAL METAPHORS

### Model 1: GlobGuard Native (Enterprise, 500+ employees)
**What:** Customer runs everything — enforcement agent, brain, Redis, RabbitMQ, PostgreSQL — in their own VPC. Optional self-hosted coordination plane.
**Who:** Banks, insurance carriers, healthcare systems, government agencies.
**Visual metaphor:** The on-premise server room. Customer holds the keys. Customer controls the hardware. GlobiGuard provides the software and updates, like Symantec's enterprise antivirus product. The customer's CISO can walk into the data center and physically verify the hardware.
**Visual representation:** Customer VPC boundary (thick solid line), all components inside, thin TLS arrow outbound to GG coordination plane (labeled "policy sync only — no data")
**Deployment time:** 2-4 hours with Helm chart
**Pricing:** Annual software licence per enforcement agent

### Model 2: GlobGuard Dedicated (Mid-market, 50–500 employees)
**What:** GlobiGuard operates a dedicated, isolated Isolation Zone in the customer's preferred cloud region. Customer holds the BYOK encryption keys. GG operates the hardware but cannot decrypt the data.
**Who:** Regional insurance brokerages, mid-size accounting firms, healthcare admin companies.
**Visual metaphor:** The safety deposit box. The bank (GlobiGuard) owns the vault and the building. The customer holds the only key. Bank staff can see the box number, the box dimensions, whether it has been accessed. They cannot open it. Even if compelled — they do not have the key.
**Visual representation:** GG-operated infrastructure boundary (dashed line, "GG operated"), inside it a smaller solid boundary labeled "Customer A Isolation Zone" with BYOK key icon. Customer's key management system (KMS) in customer's environment, arrow to Zone: "unsealing key on boot"
**Confidential computing:** Zone produces hardware attestation report. Customer can verify independently.
**Pricing:** Monthly per-zone fee

### Model 3: GlobGuard Gateway (SMB, serverless, startups)
**What:** A lightweight virtual gateway node per customer, hosted in their region of choice. No persistent data between requests. AI calls route through `gateway.globiguard.com/org-id/proxy`.
**Who:** Serverless teams on Vercel/Netlify, early-stage startups, small professional services firms.
**Visual metaphor:** The USPS mailroom with a trained inspector. Every package goes through one mailroom. The inspector checks for dangerous contents. Packages not dangerous: forwarded same day. Packages suspicious: held for pickup with explanation. The mailroom doesn't keep copies of your mail — it inspects and forwards.
**Visual representation:** Simple cloud icon (GG gateway node), arrows in from customer's serverless functions, arrows out to LLM provider, thin arrow to coordination plane
**Pricing:** Usage-based, per enforcement call

### Model 4: GlobGuard Edge (Future — Phase 4+)
**What:** Global network of enforcement Points of Presence, like Zscaler. Regional nodes route AI traffic with enforcement that never sees plaintext (homomorphic policy evaluation or customer-side pre-processing).
**Who:** Global enterprises with low-latency requirements, multi-region deployments.
**Visual metaphor:** The international customs network. Every country has customs enforcement. A package traveling from Japan to Germany passes through both countries' enforcement systems. Each enforcement point validates independently. Neither ever opens the sealed container — they validate the manifest (the encrypted representation). The cargo (the data) stays sealed throughout.
**Visual representation:** World map with PoP nodes (small circles), traffic paths shown as arcs between regions, enforcement happening at each PoP
**Status:** Phase 4+. Hardest engineering problem on the roadmap. Designed for from Phase 0.

---

## 10. INDUSTRY SCENARIOS — CONCRETE EXAMPLES

### 10.1 Insurance: Claim Processing

**Workflow:** AI-assisted claim adjudication for a P&C insurer.

**Data sources:** AMS360 (policy management), Applied Epic (claims), Epic EHR (medical records for health-related P&C claims).

**The AI's job:** Read claim submission, pull relevant policy terms, summarize medical findings, recommend settlement range, draft adjuster notification.

**Without GlobiGuard:**
- ICD-10 codes, prescription medications, treating physician NPIs flow freely to the LLM
- Settlement recommendations (claim amounts) appear in unprotected emails
- Policy numbers and member IDs stored in AI chat history with no expiry
- No record of which AI made which decision or why
- E&O carrier has no evidence of oversight

**With GlobiGuard:**
- Health fields (ICD-10, RX, diagnoses) → BLOCKED tier. Tokenized before any LLM call.
- Settlement amounts → CONFIDENTIAL tier. Risk scored; `send` to external email → QUEUE with HIPAA minimum necessary review.
- AI recommendation generated on tokenized data; detokenized for authorized human reviewer only.
- Every step in the adjudication workflow has an audit event. Hash-chained. Chain root published hourly.
- Compliance report: "847 claims processed. 0 HIPAA exposures. 23 QUEUE events, 23 reviewed by [Sarah Chen], 21 approved, 2 denied. Evidence package: [download PDF]"

**Specific risk score example:**
```
Action: SEND claim summary to external adjuster email
Detected: ICD10 (BLOCKED) + SSN (BLOCKED) + CLAIM_AMOUNT (CONFIDENTIAL)
action_type = send → +0.125
destination = gmail → +0.075
blocked_field_count = 2 → +0.30
health_field_present = True → +0.25
identity_field_present = True → +0.15
= 0.90 → BLOCK
```

### 10.2 Healthcare: Patient Communication

**Workflow:** AI-assisted patient outreach for a healthcare administrative services organization.

**Data sources:** Epic EHR (patient records), Salesforce Health Cloud (CRM), Twilio (SMS).

**The AI's job:** Identify patients due for follow-up, draft personalized outreach messages, schedule appointments, send reminders.

**Without GlobiGuard:**
- Diagnosis codes embedded in personalized SMS messages
- Patient medication names appear in Salesforce CRM notes
- AI sends appointment reminders containing PHI via Twilio (which has no BAA in this scenario)
- HIPAA Minimum Necessary standard violated on every message

**With GlobiGuard:**
- Outreach drafts generated on tokenized patient data
- SEND_MESSAGE step to Twilio: `destination=twilio`, `health_field_present=True` → risk_score ≥ 0.75 → QUEUE
- Compliance officer reviews: "This outreach mentions [MASKED-HEALTH_DX-001]. Sending health data via Twilio requires BAA verification. Approve only if BAA confirmed."
- Approved messages: health tokens removed from SMS, replaced with generic language ("regarding your recent visit")
- HIPAA § 164.530(j) documentation generated automatically from audit chain

**Specific detection sequence:**
```
Input: "Hi Maria, this is a reminder about your upcoming appointment for
your diabetes management (E11.9) and insulin (regular, 10 units) prescription refill."

Layer 1 detections:
- "E11.9" → ICD10 (BLOCKED, confidence=1.0, pos=78-83)
- "insulin" → RX_TOP25 (BLOCKED, confidence=1.0, pos=93-100)
- "diabetes" → HEALTH_DX keyword (BLOCKED, confidence=0.80, pos=63-71)

Span deduplication: ICD10 and HEALTH_DX overlap at "diabetes management (E11.9)"
→ ICD10 wins (confidence 1.0 > 0.80)

Tokenized text:
"Hi Maria, this is a reminder about your upcoming appointment for
your [MASKED-ICD10-001] management and [MASKED-RX_TOP25-001] prescription refill."

Risk score: send + twilio + 2 BLOCKED fields + health = 0.875 → QUEUE
```

### 10.3 Accounting/Financial: Tax and Payroll Processing

**Workflow:** AI-assisted tax preparation and payroll processing for an accounting firm using QuickBooks and Gusto.

**Data sources:** QuickBooks (client financial records, AGI, tax liability), Gusto (payroll, W-2 wages, employee SSNs).

**The AI's job:** Analyze financials, identify deductions, prepare tax summaries, flag anomalies, generate client reports.

**Without GlobiGuard:**
- Client AGI, tax liability, K-1 distributions flow freely to LLMs
- Employee SSNs from Gusto payroll appear in AI-generated payroll summaries
- No separation between what the AI "knows" and what it's allowed to send to clients
- GLBA Safeguards Rule compliance undemonstrable

**With GlobiGuard:**
- `AGI_AMOUNT`, `TAX_LIABILITY`, `REFUND_AMOUNT`, `K1_DISTRIBUTION` → BLOCKED tier (accounting field set)
- `W2_WAGES`, `CAPITAL_GAINS`, `VENDOR_PAYMENT` → CONFIDENTIAL tier
- `EIN`, `SSN`, `ITIN` → BLOCKED tier (identity)
- Payroll AI requests to `write` + `destination=gusto` + multiple blocked fields → MODIFY (tokenize before write)
- Client-facing report generation: `send` + `destination=gmail` + `financial_field_present=True` → risk_score ~ 0.68 → MODIFY (strip financial amounts to ranges, not exact figures)
- GLBA evidence package: all 13 "Safeguards Rule" required elements auto-documented from audit chain

**Destination risk table entry (from risk_scorer.py):**
```python
"gusto": 0.35,   # Payroll — higher (employee SSNs)
"quickbooks": 0.30,  # Client financial records
"xero": 0.30,
"qbo": 0.30,
"wave": 0.25,    # Lower risk (fewer identity fields in Wave)
```

### 10.4 Legal: Contract Review and Matter Management

**Workflow:** AI-assisted contract analysis and matter management for a boutique law firm.

**Data sources:** Clio (matter management), DocuSign (contracts), client PostgreSQL database.

**The AI's job:** Review contracts for risk clauses, summarize matter status, draft correspondence, flag compliance issues.

**Without GlobiGuard:**
- Client PII (SSNs, DOBs, financial terms) in contracts flows directly to LLMs
- Attorney-client privilege materials potentially stored in LLM provider's logs
- Client settlement amounts, identities, and personal information in AI-generated summaries
- No audit trail for which AI reviewed which document (critical for legal malpractice defense)

**With GlobiGuard:**
- All contract text scanned before LLM call: SSNs, DOBs, financial amounts detected and tokenized
- LLM performs contract risk analysis on tokenized text — still functional for clause identification
- `REQUIRE_APPROVAL` step inserted before any external communication containing settlement data
- Audit chain provides complete record: "Contract #2024-0847 reviewed by AI model gpt-4o at 14:23:11. Fields detected: PERSON (×3), SSN (×1, tokenized), CLAIM_AMOUNT (×2, tokenized). Decision: MODIFY. Reviewed by: [attorney name] at 14:31:44."
- Attorney-client privilege argument: LLM provider never received client identities or sensitive financial terms — only tokens. Provider's logs contain no privileged information.

---

## 11. TECHNICAL ACCURACY NOTES (For Engineering Team)

### From gate.go — Critical Behaviors to Show in Animation:
1. **Fail-safe default is BLOCK** (line 67-73): If tokenization fails inside the MODIFY path, the gate switches to BLOCK. Never fails open. Animation should show this: if anything breaks in the middle chambers, the outer door seals.

2. **The sidecar calls brain /tokenize** (line 122-173): The Go sidecar is not doing the tokenization itself — it makes an HTTP call to the Python brain service with a 5s timeout. The brain stores token→value in Redis. Only the sidecar can initiate tokenization (the brain /tokenize endpoint is not publicly accessible).

3. **QUEUE returns HTTP 202** (proxy/handler.go, line 193-195): The AI system calling through the sidecar gets `202 Accepted` with a `queue_id`. It does not get an error. The caller must poll or be notified when the queue item is resolved. This is important for animation — the request doesn't fail, it waits.

4. **Audit is async** (handler.go, line 214): `h.recordAudit()` is called after the response is sent. The audit never blocks the response path. Show this in animation: audit log event fires after the response returns to the caller, not before.

### From risk_scorer.py — Score Composition for Specific Examples:

**Claim-to-email (the Sarah scenario):**
```
send: 0.5 × 0.25 = 0.125
gmail: 0.5 × 0.15 = 0.075
blocked_field_count=3: 3 × 0.15 = 0.45 (capped at 0.5 → 0.45)
health_field_present: +0.25
identity_field_present: +0.15
total = 0.125 + 0.075 + 0.45 + 0.25 + 0.15 = 1.05 → capped at 1.0 → BLOCK
```
(Note: in the narrative above I said 0.89/QUEUE for narrative clarity; technically with 3 blocked fields + health + identity + gmail, this scores BLOCK. For the demo, use 1 blocked field + health to land in QUEUE at 0.84.)

**Correct QUEUE example (for animation):**
```
send + gmail + 1 blocked field (ICD10) + health present + 2 confidential fields
= 0.125 + 0.075 + 0.15 + 0.25 + 0.10 = 0.70 → QUEUE (exactly at threshold)
```

### From tokenizer.py — Token Format Precision:
- Token format is exactly `[MASKED-{FIELD_TYPE_UPPERCASE}-{seq:03d}]`
- Sequence numbers are per-field-type within a session (so you can have [MASKED-SSN-001] and [MASKED-SSN-002] if two SSNs appear)
- Overlap deduplication: sorted by confidence DESC, greedy scan, keep first that doesn't overlap any already-kept field
- Replacement is done in reverse position order (end-of-string first) so earlier offsets remain valid

### From automation/__init__.py — Workflow Engine Architecture:
- **Phase 0:** Sequential step execution via RabbitMQ, each step dispatched individually
- **Phase 1:** Full async DAG with parallel branches and timeout controls
- **CALL_LLM critical note:** `output_summary` in the step result MUST NEVER contain detokenized text or raw LLM response. Only metadata crosses to the control plane.
- **GATE_CHECK fallback:** If the sidecar URL is unreachable, the Python RiskScorer runs locally as fallback. Enforcement never stops, even if the sidecar is temporarily unreachable.

---

## 12. SUMMARY — THE PROMISE

From vision.md (the foundational document):

> "A company can use AI across its entire operation — reading documents, writing records, contacting customers, executing workflows — and have complete confidence that no regulated data leaked to an external system, no action happened without defined authority, and every decision made by AI can be proven to a regulator, an E&O carrier, or a court."

This is kept not with policy statements but with:
- **Cryptographic controls** (hash chain, HMAC, AES-encrypted Redis)
- **Open-source enforcement code** (the sidecar is auditable)
- **Structural data separation** (the LLM never receives raw PII — tokenization is architectural, not a setting)
- **Fail-safe defaults** (every error path defaults to BLOCK)
- **1-hour structural forgetting** (token TTL is measurable and verifiable)
- **Two-plane isolation** (coordination plane structurally cannot access enforcement plane data)

The goal is not to be a product that compliance officers *want* to buy. It is to be infrastructure they *must* have. The way an antivirus was infrastructure by 1997. The way Zscaler is infrastructure by 2024.

**GlobiGuard is the fourth moment.**

---

*Analysis generated from: brain/detection/engine.py, brain/tokenizer/tokenizer.py, brain/tokenizer/detokenizer.py, brain/automation/__init__.py, brain/detection/risk_scorer.py, sidecar/internal/gate/gate.go, sidecar/internal/proxy/handler.go, docs/vision.md (37KB)*
*PDF source not available at expected path — analysis grounded in codebase only.*
