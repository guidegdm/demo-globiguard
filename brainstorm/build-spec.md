# GlobiGuard Visual Explainer — Build Specification
*Final synthesis from cross-reviewed agent analyses. This is the definitive build document.*

---

## 1. PROJECT OVERVIEW

**What we're building:** A single scrollable page (Vite + React + TypeScript) that answers every
"what, why, how" about GlobiGuard for the internal engineering team. Animated, interactive,
clickable nodes reveal deep technical explanations.

**Stack:** `demo-globiguard/frontend/` — Vite 8 + React 19 + TypeScript + Framer Motion 12 +
GSAP 3 + Tailwind v4 + Lucide React

**Route:** Single page, App.tsx. No router needed.

---

## 2. DESIGN SYSTEM

### Colors (CSS custom properties in index.css)
```css
--bg-base:          #0F1117;   /* near-black background */
--bg-enforcement:   #0d1a0d;   /* very dark green for enforcement plane region */
--bg-coordination:  #0d0f1a;   /* very dark navy for coordination plane region */
--boundary:         #4A5568;   /* dashed boundary line between planes */

--allow:            #38A169;   /* ALLOW decision — green */
--modify:           #ECC94B;   /* MODIFY decision — yellow */
--queue:            #ED8936;   /* QUEUE decision — amber */
--block:            #E53E3E;   /* BLOCK decision — red */

--node-data:        #2C5282;   /* data source nodes — deep blue */
--node-sidecar:     #744210;   /* sidecar/gate — amber-brown */
--node-regex:       #276749;   /* regex layer — dark green */
--node-presidio:    #2B4C8C;   /* Presidio NER — medium blue */
--node-gliner:      #6B46C1;   /* GLiNER — purple */
--node-scorer:      #9B2C2C;   /* risk scorer — dark red */
--node-gate:        #C05621;   /* gate engine — orange-red */
--node-tokenmap:    #2C7A7B;   /* token map — teal */
--node-llm:         #4A5568;   /* LLM — neutral gray */
--node-audit:       #1A365D;   /* audit log — deep navy */
--node-queue:       #744210;   /* human queue — amber (same as sidecar) */
--node-coord:       #2A4365;   /* coordination plane — navy */
--node-enforce:     #22543D;   /* enforcement plane — deep green */

--text-primary:     #F7FAFC;
--text-secondary:   #A0AEC0;
--token-bg:         #2D3748;
--token-border:     #68D391;
--accent:           #10b981;   /* emerald accent */
```

### Typography
- Body: `system-ui, -apple-system, 'Segoe UI', sans-serif`
- Mono (tokens/code): `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`
- Title sizes: 4xl (hero), 3xl (section), 2xl (subsection)

### Animation defaults
- Duration fast: 200ms
- Duration normal: 400ms  
- Duration slow: 800ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

---

## 3. PAGE STRUCTURE (5 Sections)

```
Section 0: Hero — "The Compliance Infrastructure for AI"
Section 1: The Problem — Sarah's story, before/after
Section 2: The Full Pipeline — 14-node interactive diagram (main centerpiece)
Section 3: The Automation Engine — QUEUE/human-review moment
Section 4: The Architecture — Two planes + 4 deployment models
Section 5: The Compliance Layer — 12 frameworks grid
```

---

## 4. SECTION SPECS

### Section 0: Hero

**Tagline:** "GlobiGuard is the compliance middleware that sits between your enterprise data and
any AI model — intercepting every request, masking sensitive fields, enforcing policies, and
generating cryptographic proof."

**Sub-tagline:** "So regulated industries can use AI freely."

**Background:** Three core stats fade in one by one:
- `$4.8M` — Average cost of a healthcare data breach (IBM 2023)
- `847` — HIPAA violations in 6 weeks from one AI assistant
- `47ms` — Time GlobiGuard takes to catch it

**CTA:** Scroll indicator (animated chevron down), section nav dots on right side

---

### Section 1: The Problem — "Sarah's Monday Morning"

**Narrative text (render in styled blockquote):**
> Sarah Chen, CCO, Meridian Insurance Group. Monday 9:17 AM. Her AI workflow
> had been processing claims for 6 weeks — 4 days reduced to 4 hours. Then she
> got the call. 847 claim summary emails. Each one: patient name, ICD-10 diagnosis,
> SSN, claim amount. Sent to adjusters via Gmail. Legal is estimating $2.8M exposure.

**Left panel — "WITHOUT GlobiGuard":**
Animated data flow: `Data Source → AI → Gmail` — simple, clean, fast-looking.
Then red indicators appear one by one (animate in sequence):
- ❌ No PII detection
- ❌ No action authorization
- ❌ No audit trail
- ❌ No compliance evidence

**Right panel — "WITH GlobiGuard":**
Same flow but sidecar intercepts. Show QUEUE badge appearing.
Green indicators:
- ✅ Health data detected in 0.8ms
- ✅ Risk score 0.89 → QUEUE
- ✅ Sarah reviews and approves tokenized version
- ✅ Audit event hash-chained

---

### Section 2: The Full Pipeline (CENTERPIECE)

**Layout:** Large SVG diagram, full width, ~600px tall. 14 nodes arranged in U-shape or pipeline.

**Node list and click panel content:**

#### Node 1: Data Sources
- **Visual:** 4 small icons — Salesforce, Epic (hospital cross), AMS360, QuickBooks
- **Color:** `#2C5282` (deep blue)
- **Panel title:** "Where It Starts"
- **Panel text:** "GlobiGuard connects to your existing data sources without moving the data. Salesforce, QuickBooks, Epic EHR, AMS360, HawkSoft, PostgreSQL, Gmail — any system your AI reads from or writes to. The connector reads data into the enforcement plane only. Data never leaves your environment. The AI never gets a direct connection to your data systems. Everything flows through the gate."

#### Node 2: MCPConnector
- **Visual:** Plug/connector icon
- **Color:** `#2B6CB0` (blue)
- **Panel title:** "Universal Connector"
- **Panel text:** "The MCPConnector implements the Model Context Protocol — the emerging standard for AI tool calls. It translates between your data sources and the enforcement engine, handles authentication, rate limiting, and data normalization. Your AI agent calls a single unified API. GlobiGuard handles the complexity of connecting to every enterprise system."

#### Node 3: Go Sidecar (port 8080)
- **Visual:** Shield icon + port label
- **Color:** `#744210` (amber-brown)
- **Panel title:** "The Mandatory Gate"
- **Panel text:** "A single 6MB Go binary — no runtime, no dependencies — that sits in the execution path between your AI and everything else. Port 8080. Every request must pass through it. There is no bypass. This is not monitoring — it is enforcement. The sidecar fails secure: if anything goes wrong inside the gate, the default decision is BLOCK, never ALLOW. Built from open-source code your security team can audit before deploying."
- **Technical badge:** `go build -o sidecar main.go` → `6.2MB` static binary

#### Node 4: Layer 1 — Regex Detection
- **Visual:** Lightning bolt (fast)
- **Color:** `#276749` (green)
- **Panel title:** "The Fast Guard (<1ms)"
- **Panel text:** "18 hand-crafted regex rules catch ~70% of all PII in under 1 millisecond. SSNs, ICD-10 diagnosis codes, 55 named prescription drugs, credit card numbers, routing numbers, Medicare IDs, and 80+ health condition keywords. Pattern-matched at the speed of memory. Zero network calls. Zero ML inference. When the pattern is unambiguous — and SSN format is unambiguous — regex is faster and more reliable than any neural network."
- **Code block:**
  ```python
  SSN: r'\b(?!9)\d{3}-\d{2}-\d{4}\b'
  ICD10: r'\b[A-TV-Z]\d{2}\.\d{1,2}[A-Z]?\b'
  # 55 drug names, 80+ health keywords
  ```

#### Node 5: Layer 2 — Presidio NER
- **Visual:** Brain icon
- **Color:** `#2B4C8C` (medium blue)
- **Panel title:** "The Context Reader (<10ms)"
- **Panel text:** "Microsoft Presidio's Named Entity Recognition engine, extended with custom insurance-specific recognizers. Catches PII that regex cannot — names embedded in prose sentences, dollar amounts without triggering keywords, policy references in non-standard formats. Handles ~20% of cases that regex misses. Runs in-process, no external service call. Results reconciled with Layer 1 via span overlap deduplication — the higher-confidence detection always wins."

#### Node 6: Layer 3 — GLiNER Zero-Shot
- **Visual:** Eye/scan icon
- **Color:** `#6B46C1` (purple)
- **Panel title:** "The Unknown Catcher (<30ms)"
- **Panel text:** "A zero-shot NER model built on DeBERTa. Can find entity types it was never explicitly trained on — novel industry jargon, unusual document formats, creative attempts to embed sensitive data in unexpected structures. Handles the remaining ~10% of cases. The cascade only reaches Layer 3 when Layers 1 and 2 have insufficient confidence — so it adds depth without adding latency to the common case."

#### Node 7: Risk Scorer
- **Visual:** Gauge/dial icon
- **Color:** `#9B2C2C` (dark red)
- **Panel title:** "The Judge (13 Features)"
- **Panel text:** "An XGBoost model with 13 features scores every request 0.0–1.0. Features: action type (read=low, delete=high, send=medium), destination (internal=low, Gmail=high), BLOCKED/CONFIDENTIAL/RESTRICTED field counts, health/financial/identity presence flags, agent violation history, time of day, payload size. Phase 0 uses deterministic linear scorer with hand-tuned weights."
- **Feature table (render as mini-table):**
  ```
  health_field_present  →  +0.25
  identity_field_present → +0.15
  blocked_field_count   →  +0.15 each
  action=delete         →  +0.80
  destination=gmail     →  +0.50 modifier
  ```

#### Node 8: Gate Decision Engine
- **Visual:** Four-way split (ALLOW/MODIFY/QUEUE/BLOCK in their colors)
- **Color:** `#C05621` (orange-red)
- **Panel title:** "Four Outcomes"
- **Panel text:** "Every request gets exactly one outcome: ALLOW (score < 0.30 — proceed), MODIFY (0.30–0.69 — tokenize sensitive fields, forward clean version), QUEUE (0.70–0.89 — hold for human review, return HTTP 202 with queue ID), or BLOCK (≥ 0.90 — refuse completely, return HTTP 403 with reason). The gate is the product. Every architectural decision in GlobiGuard exists to make this gate reliable, fast, and impossible to circumvent. Fail-safe: any internal error defaults to BLOCK."
- **Visual:** Color-coded threshold bar animating on open

#### Node 9: Token Map (Redis, TTL 1hr)
- **Visual:** Lock + key icon
- **Color:** `#2C7A7B` (teal)
- **Panel title:** "The Forgetting Engine"
- **Panel text:** "When the gate decides MODIFY, detected PII values are replaced with opaque tokens — [MASKED-SSN-001], [MASKED-ICD10-001] — and the real values are stored in Redis with AES encryption and a mandatory 1-hour TTL. The LLM only ever sees tokens. It reasons about [MASKED-SSN-001] without seeing the actual digits. After 1 hour, the token map is gone. 'The data exists for at most 1 hour, then it is structurally gone' is a compliance statement, not a policy promise."
- **Example block:**
  ```
  SSN: 547-82-3901
      ↓ AES-256 encrypt → Redis key: tk:a8f2c1d9
  [MASKED-SSN-001]  ← LLM sees this
      ↓ TTL: 3600s ↓
  GONE after 1 hour
  ```

#### Node 10: LLM (Any Provider)
- **Visual:** AI/sparkle icon
- **Color:** `#4A5568` (neutral gray — replaceable, interchangeable)
- **Panel title:** "The AI Brain (Working Blind)"
- **Panel text:** "GPT-4o, Gemini, Claude, Llama — any LLM your team prefers. GlobiGuard is model-agnostic. The LLM receives fully tokenized text — every SSN is [MASKED-SSN-001], every diagnosis is [MASKED-ICD10-001]. The LLM produces responses referencing those same tokens. The model provider's data retention policies become irrelevant — they only retain tokens. The AI works with representations. The representations are as useful for reasoning as the real data. Useless to anyone who intercepts them."

#### Node 11: Detokenizer
- **Visual:** Unlock/restore icon
- **Color:** `#276749` (green — restoration, completion)
- **Panel title:** "Restoring Reality"
- **Panel text:** "After the LLM responds, the detokenizer replaces every [MASKED-*] token with the original value from the Redis registry. The response the human receives is complete and readable. If a token has expired (past the 1-hour TTL), the token string is left in place — an expired token in the output is a visible, auditable signal, not a silent corruption."

#### Node 12: Immutable Audit Log
- **Visual:** Chain link icon
- **Color:** `#1A365D` (very deep blue — permanent)
- **Panel title:** "Cryptographic Proof"
- **Panel text:** "Every enforcement decision generates an audit event: action attempted, fields detected, risk score, decision made, who requested. Each event is linked to the previous by a cryptographic hash chain. The chain root is published to Rekor (Sigstore's transparency log) every hour. This means: even GlobiGuard cannot alter the audit record without breaking the chain. The audit log is not a dashboard. It is evidence — admissible in regulatory proceedings, acceptable to E&O carriers, verifiable by anyone with the public chain root."

#### Node 13: Human Review Queue
- **Visual:** Human silhouette + badge
- **Color:** `#744210` (amber — human, decision)
- **Panel title:** "The Human Stays in Control"
- **Panel text:** "When risk score lands 0.70–0.89, the action is held. A compliance officer sees: action type, destination, detected sensitive fields, risk score, specific policy rule triggered. Options: APPROVE (send tokenized), APPROVE with override (send full — requires PIN + justification), DENY (block + notify workflow), or MODIFY (edit before sending). Every decision recorded. The queue is the governance product compliance officers interact with daily."

#### Node 14: Compliance Reports
- **Visual:** Document/certificate icon
- **Color:** `#2A4365` (navy)
- **Panel title:** "Auto-Generated Evidence"
- **Panel text:** "Every enforcement decision automatically maps to regulatory control requirements. HIPAA §164.312(b) — Audit Controls. GDPR Article 30 — Records of Processing. NIST CSF 2.0 — GV.OC-05. Every 30 days, GlobiGuard compiles these decisions into framework-specific evidence packages. Not a questionnaire — actual logged enforcement decisions proving the control is operational."

---

### Section 3: The Automation Engine ("The Layer Most People Miss")

**Opening hook:**
> "Most AI compliance tools ask: 'Is there PII in this text?'
> GlobiGuard asks: 'Should this AI be *allowed to do* what it's about to do?'"

**Workflow Canvas:** Animated step-by-step DAG for `process_claim_auto`

Steps (animate one by one, 0.8s apart):
1. `READ_DATA` — Pull from Epic EHR: claimant record
2. `DETECT_PII` — ICD10 (BLOCKED), RX_TOP25 (BLOCKED), DOB (CONFIDENTIAL), PERSON (RESTRICTED)
3. `CALL_LLM` — LLM receives fully tokenized version
4. `GATE_CHECK` — Risk score: 0.84 → **QUEUE** ← ANIMATE THIS PROMINENTLY
5. `[QUEUE bubble]` — Sarah sees dashboard card, clicks "Approve tokenized"
6. `WRITE_RECORD` — AMS360 updated (risk: 0.28, ALLOW)

**QUEUE card (render full card):**
```
QUEUED ACTION — REQUIRES REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Workflow: process_claim_auto
Step: SEND_MESSAGE → adjuster@meridian.com
Time: 2024-11-18 09:23:41 EST
Risk Score: 0.84

Detected:
  🔴 ICD10 code (BLOCKED tier)
  🔴 Prescription medication (BLOCKED tier)
  🟡 Date of birth (CONFIDENTIAL tier)
  🟡 NPI number (CONFIDENTIAL tier)
  🟢 Patient name (RESTRICTED tier)

Policy: HIPAA §164.514 — minimum necessary

[APPROVE tokenized] [APPROVE full — PIN required]
[DENY] [MODIFY]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Industry selector tabs:** Insurance | Healthcare | Accounting | Legal
(Each tab shows a different workflow scenario with different detected fields)

---

### Section 4: The Architecture

**Two-plane diagram:**
- Left region (dark navy `#0d0f1a`): "Coordination Plane — GlobiGuard Cloud"
  - Contents: Policy Engine, Compliance Reports, Human Review UI, Billing
  - Arrow down: "Policy updates (encrypted)"
  - Arrow up: "Decision metadata (anonymized — never data)"
- Right region (dark green `#0d1a0d`): "Enforcement Plane — Your Environment"
  - Contents: Go Sidecar, Python Brain, Redis, Audit Buffer
  - Show data blobs flowing freely inside — contained, healthy
- Dashed boundary line with label: "Raw data: NEVER crosses here"
  - Animate: red blob tries to cross → bounces back → boundary flashes red

**Four Deployment Models (cards, click to expand):**
1. **Native** — You run everything. VPC, your Kubernetes cluster. Maximum control. Banks, health systems.
2. **Dedicated** — GlobiGuard operates an isolated zone for you. BYOK encryption. Data never shared.
3. **Gateway** — Serverless teams. Virtual enforcement node. Lightweight.
4. **Self-Hosted** — Open-source enforcement agent + SaaS coordination plane. OSS commitment.

---

### Section 5: The Compliance Layer

**Opening:** "GlobiGuard governs 12 compliance frameworks."

**Two categories:**

**Category A — GlobiGuard certifies independently (green glow):**
- HIPAA, GDPR, GLBA, CCPA/CPRA, NIST CSF 2.0, NIST AI RMF, EU AI Act, ISO 42001

**Category B — GlobiGuard as evidence layer (amber glow):**
- SOC 2, ISO 27001, HITRUST CSF, PCI DSS v4.0

**Each framework card on click shows:**
- Framework full name
- What GlobiGuard's role is
- Specific controls automated
- Key regulatory risk ($M penalties)

**Example — HIPAA card:**
- Role: Category A — certifies independently
- Controls automated: §164.312(b) Audit Controls, §164.514 De-identification, §164.308(a)(1) Risk Analysis
- Risk: $100K–$1.9M per violation category

**Bottom of section:** Live scrolling enforcement log (mock real-time):
```
09:23:41  QUEUE  process_claim_auto → HIPAA §164.514  score: 0.84
09:23:39  ALLOW  customer_analysis → no PII detected   score: 0.12
09:23:37  MODIFY financial_report  → GLBA §313         score: 0.45
09:23:35  BLOCK  bulk_export       → GDPR Art.17       score: 0.91
```

---

## 5. SHARED COMPONENTS

### `ClickableNode.tsx`
Props: `id, label, sublabel, color, icon, onClick, isActive`
- Renders: rounded rect or circle SVG element with glass effect
- States: idle (dim glow), hover (brighter glow, scale 1.02), active (solid border, bright glow)
- Animation: `whileHover` scale, `whileTap` scale down, color pulse on active

### `ExplanationPanel.tsx`
Props: `node | null, onClose`
- Slides in from right (Framer Motion `x: '100%'` → `x: 0`)
- Glass background: `rgba(15, 17, 23, 0.95)` with backdrop-blur
- Header: node color as top border accent, title, close button
- Body: panel text, optional code block (monospace), optional technical detail
- Overlay: dark semi-transparent backdrop, click to close

### `DataPacket.tsx`
Props: `path, color, label, duration, delay`
- A glowing dot (8px circle with box-shadow glow) traveling along an SVG path
- Uses GSAP `motionPath` plugin for path following
- Label appears briefly when passing through nodes

### `TokenizationDemo.tsx`
- Textarea input: user types text
- Live detection: debounced 300ms, highlights detected spans with color coding
  - Red highlight: BLOCKED tier (SSN, ICD10, drug names)
  - Orange highlight: CONFIDENTIAL tier (DOB, claim amounts)
  - Yellow highlight: RESTRICTED tier (names, contact info)
- "Tokenize" button: animate span-by-span replacement with [MASKED-TYPE-001] pills
  - Each span: fade out real text, fade in gray pill with green border
- "Restore" button: reverse animation

### `SectionNav.tsx`
- Fixed right side: 6 dots (one per section)
- Active dot: filled, glowing; inactive: outline
- Click dot: smooth scroll to section
- Labels appear on hover

### `WorkflowCanvas.tsx`
Props: `steps, activeStep`
- Horizontal or diagonal DAG visualization
- Steps as nodes connected by arrows
- Each step highlights in sequence (GSAP timeline or Framer Motion stagger)
- QUEUE step has special treatment: amber, pulsing, human icon

---

## 6. ANIMATION SEQUENCES (exact specs)

### Main Flow (8 seconds, loops)
```
0.0s  Data sources pulse gently (#2C5282, 1Hz sine)
0.5s  Request blob (#E2E8F0, 24px, blur-glow) travels: DataSource → Sidecar  (0.4s ease-in-out)
0.9s  Sidecar flashes amber (#ED8936)
1.0s  Detection layers activate sequentially:
      Layer1 (regex): 0.3s fade-in green  label "< 1ms"
      Layer2 (NER):   0.4s fade-in blue   label "< 10ms"
      Layer3 (GLiNER): 0.3s fade-in purple label "< 30ms" (dimmer)
1.8s  Inside blob: "SSN: 547-82-3901" → red flash → "[MASKED-SSN-001]" (0.6s morph)
2.5s  Risk score counter: 0.00 → 0.84 (1.0s, green→yellow→orange→red gradient)
3.5s  Decision badge: "QUEUE" amber (#ED8936) pulses 3x
4.0s  Blob → Human Queue node (0.5s)
4.5s  Human icon appears, hand cursor clicks "APPROVE"
5.2s  Clean blob → LLM (smaller, #68D391 light green)
6.0s  LLM processes (spinner 0.8s), response blob emits
6.8s  Detokenizer: [MASKED-*] tokens → real values (reverse morph)
7.5s  Audit log: chain-link icon, gold flash (#F6E05E), hash increments
8.0s  "Request processed in 47ms" label fades in
```

### BLOCK Decision (3 seconds)
```
0.0s  Blob enters sidecar
0.5s  Multiple fields flash red simultaneously (SSN + ICD10 + CREDIT_CARD)
0.8s  Risk score snaps to 0.93 (no gradual — instant red)
1.0s  "BLOCK" badge: deep red (#E53E3E), 1.5x scale → normal
1.2s  Path to LLM: red X drawn (2 diagonal lines, 0.3s draw animation)
1.5s  HTTP 403 travels back to caller (#FC8181, "Blocked: HIPAA violation")
2.0s  Audit log fires
2.5s  System returns to idle
```

### Two-Plane (6 seconds, on section enter)
```
0.0s  Two regions appear separated by dashed boundary
1.0s  Arrows appear: ↓ policy sync (gray), ↑ decision metadata (gray)
2.5s  Red blob labeled "PHI" tries to cross → bounces back → boundary flashes red briefly
3.5s  Label: "Raw data: NEVER crosses here"
4.0s  Enforcement plane: data blobs flow freely (green, contained)
5.0s  Coordination plane: policy docs, compliance reports, review queue filling
6.0s  Hold: "Your data. Your environment. Our governance."
```

### Tokenization Close-Up (4 seconds, on interact)
```
0.0s  Text block with highlighted spans:
      "547-82-3901" highlighted red
      "E11.9" highlighted dark red
      "metformin" highlighted dark red
      "$18,400.00" highlighted orange
1.0s  Staggered morph (0.3s apart each):
      "547-82-3901" → scales to 0 → "[MASKED-SSN-001]" scales from 0 (gray pill, green border)
      "E11.9"       → "[MASKED-ICD10-001]"
      "metformin"   → "[MASKED-RX_TOP25-001]"
      "$18,400.00"  → "[MASKED-CLAIM_AMOUNT-001]"
2.5s  "Safe for LLM" green badge appears
2.8s  Redis lock icon: "Encrypted, TTL: 1hr"
3.5s  Tokenized LLM output → detokenize → clean output
4.0s  Before/after comparison holds
```

---

## 7. COMPONENT FILE STRUCTURE

```
frontend/src/
  main.tsx
  App.tsx                          ← main scrollable page, section wiring
  index.css                        ← CSS custom properties, Tailwind base

  components/
    SectionNav.tsx                 ← right-side dot navigation
    TokenizationDemo.tsx           ← interactive tokenization widget

    primitives/
      ClickableNode.tsx            ← SVG node, hover/click states
      ExplanationPanel.tsx         ← slide-in detail panel
      DataPacket.tsx               ← animated blob on SVG path
      GlassCard.tsx                ← reusable glass card container
      DecisionBadge.tsx            ← ALLOW/MODIFY/QUEUE/BLOCK colored badge

    scenes/
      HeroScene.tsx                ← Section 0: stats, tagline
      ProblemScene.tsx             ← Section 1: Sarah's story, before/after
      FlowScene.tsx                ← Section 2: 14-node pipeline diagram
      AutomationScene.tsx          ← Section 3: workflow DAG, QUEUE moment
      ArchScene.tsx                ← Section 4: two planes, deployment models
      ComplianceScene.tsx          ← Section 5: 12 frameworks, enforcement log

    diagrams/
      PipelineDiagram.tsx          ← SVG pipeline with animated edges
      TwoPlanesDiagram.tsx         ← coordination vs enforcement planes
      WorkflowDiagram.tsx          ← automation step DAG
```

---

## 8. KEY TECHNICAL ACCURACY NOTES (from cross-review)

1. **Risk thresholds:**  < 0.30 ALLOW | 0.30–0.69 MODIFY | 0.70–0.89 QUEUE | ≥ 0.90 BLOCK
   (NOT 0.71 — the sonnet agent had this wrong in its first pass)

2. **QUEUE returns HTTP 202** (Accepted), not HTTP 403. HTTP 403 = BLOCK only.

3. **The LLM sees ONLY tokenized text** — never raw PII values. Even in MODIFY decisions, the
   LLM path gets the tokenized version.

4. **GLiNER Layer 3 is skipped** when Layers 1+2 achieve >97% confidence — it is NOT always run.

5. **Audit log contains NO raw data** — only metadata (field types, not values; risk scores; decisions).

6. **Two planes are architecturally separated** — not policy-separated. The coordination plane
   cannot decrypt enforcement data even if subpoenaed. Enforcement plane holds the keys.

7. **Token IDs are random** (not sequential) — prevents token oracle attack via inference.

8. **Fail-safe = BLOCK** — any internal error defaults to blocking the request.

9. **MODIFY at 0.30–0.69** — the system tokenizes and forwards the clean version. The LLM
   still runs on the MODIFY case, just on masked text.

10. **Automation workflow controller** (brain/automation/) governs *intent* (what the AI is
    about to *do*), not just content (what data it contains). This is the critical architectural
    distinction from all competitors.

---

## 9. CONTENT HIERARCHY (what matters most)

1. **Most important:** The QUEUE/human-review moment in Section 3. This is what nobody else does.
   Animate it prominently. Make it cinematic.

2. **Second:** The tokenization transformation (Section 2, node 9). The LLM working blind is the
   core privacy guarantee. Show it happening in real time.

3. **Third:** The two-plane separation (Section 4). "Your data stays here, we operate the governance"
   is the trust architecture.

4. **Fourth:** Sarah's story opening. Grounds everything in real stakes.

5. **Fifth:** The 12 compliance frameworks (Section 5). Shows breadth after trust is established.
