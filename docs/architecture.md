# GlobiGuard Architecture Reference

*Source of truth for all animation content, thresholds, and component descriptions.*

---

## The One-Sentence Summary

GlobiGuard is the mandatory compliance middleware that sits between every enterprise AI workflow
and every enterprise data source — enforcing policy, masking PII, governing autonomous actions,
and generating cryptographic proof — without ever seeing raw data itself.

---

## The 4 Layers

### Layer 1: Detection Pipeline

```
Data Sources → MCPConnector → Go Sidecar (port 8080)
  → [Regex <1ms ~70%] → [Presidio NER <10ms ~20%] → [GLiNER zero-shot <30ms ~10%]
  → Tokenizer → Risk Scorer → Gate → LLM → Detokenizer → Output
```

**Go Sidecar:** 6MB static binary. Mandatory proxy. Fails secure (error → BLOCK). No bypass possible.

**3-Layer Detection Cascade:**
- Layer 1 Regex (<1ms): 18 rules, ~70% recall — SSN, ICD-10, 55 drugs, 80+ health keywords
- Layer 2 Presidio NER (<10ms): ~20% of cases — names in prose, non-standard formats
- Layer 3 GLiNER zero-shot (<30ms): ~10% of cases — novel jargon, edge cases
- Layer 3 SKIPPED if layers 1+2 achieve >97% confidence

**Tokenization:** `SSN: 547-82-3901` → `[MASKED-SSN-001]` (AES-256, Redis TTL 1hr)
Token IDs are RANDOM (not sequential) — prevents token oracle attack.

### Layer 2: Policy Gate

| Score     | Decision | HTTP | What happens |
|-----------|----------|------|--------------|
| < 0.30    | ALLOW    | 200  | Proceed without modification |
| 0.30–0.69 | MODIFY   | 200  | Tokenize fields, forward clean version |
| 0.70–0.89 | QUEUE    | 202  | Hold, surface to human review with full forensic context |
| ≥ 0.90    | BLOCK    | 403  | Refuse completely, return reason |

Fail-safe: any internal error → BLOCK. Never fails open.

**Risk Scorer — 13 features:**
```
health_field_present   → +0.25 (flat)
identity_field_present → +0.15 (flat)
financial_field_present → +0.10 (flat)
blocked_field_count    → +0.15 each (cap 0.5)
action_type: delete    → 0.8 base
action_type: send      → 0.5 base
destination: gmail     → +0.5 modifier
destination: slack     → +0.45 modifier
```

### Layer 3: Automation Workflow Controller

Governs AI *intent* (what the AI is about to *do*), not just content.

**Step type vocabulary:**
- `READ_DATA` — pull from connector (Salesforce, Epic, AMS360, QB)
- `DETECT_PII` — run detection cascade
- `CALL_LLM` — call AI (tokenized text ONLY — never raw PII)
- `GATE_CHECK` — evaluate risk score → ALLOW/MODIFY/QUEUE/BLOCK
- `WRITE_RECORD` — governed write to data system
- `SEND_MESSAGE` — governed external communication (email/Slack/SMS)
- `REQUIRE_APPROVAL` — hard stop, score-independent human decision
- `BRANCH` — conditional routing
- `NOTIFY` — async notification, audit without blocking

**The QUEUE moment (cinematic — most important thing to show):**
Sarah's workflow tried to send PHI via Gmail. Risk 0.84. QUEUE fires HTTP 202.
Dashboard: action type, destination, detected fields, risk score, policy rule, 4 buttons.
Sarah clicks "Approve tokenized". Adjuster gets clean email. Audit hash-chained. $0 incident.

### Layer 4: Compliance Evidence Engine

Every gate decision → immutable audit event → maps to regulatory control → auto-report.

**Audit log:** Hash-chained. Chain root published to Rekor (Sigstore) hourly.
Contains: field TYPES only (not values), risk score, decision, action type. NO raw data.

**12 Frameworks:**
- Cat A (GG certifies independently): HIPAA, GDPR, GLBA, CCPA/CPRA, NIST CSF 2.0, NIST AI RMF, EU AI Act, ISO 42001
- Cat B (GG as evidence layer): SOC 2, ISO 27001, HITRUST CSF, PCI DSS v4.0

---

## Two-Plane Architecture

```
┌─────────────────────────────┐  ← Coordination Plane (GG Cloud)
│ Policy Engine               │    Policy, reports, review queue, billing
│ Compliance Reports          │    Receives: decision metadata (anonymized, NO data)
│ Human Review Queue          │    Sends: policy updates (encrypted)
│ Org Settings / Billing      │
└─────────────┬───────────────┘
              │  Raw data: ARCHITECTURALLY CANNOT CROSS
              │  (enforcement plane holds the keys)
┌─────────────┴───────────────┐  ← Enforcement Plane (Customer Environment)
│ Go Sidecar (:8080)          │    Your VPC / K8s / on-prem
│ Python Brain (detection)    │    Data NEVER leaves this boundary
│ Redis (token map, TTL 1hr)  │
│ Audit Buffer                │
└─────────────────────────────┘
```

---

## Narrative: Sarah's Monday Morning

- CCO Meridian Insurance Group, 847 HIPAA violations, $2.8M exposure
- Day 4 with GlobiGuard: same AI, same claim email → 0.8ms Regex catches ICD10 + SSN + metformin
- Risk score 0.84 → QUEUE → Sarah reviews dashboard → Approve tokenized
- $2.8M → $0. Same workflow. Same AI. Zero exposures.

---

## Color System

```
ALLOW:   #38A169  (green)
MODIFY:  #ECC94B  (yellow)
QUEUE:   #ED8936  (amber)
BLOCK:   #E53E3E  (red)
ACCENT:  #10b981  (emerald)

Enforcement plane bg: #0d1a0d  (dark green)
Coordination plane bg: #0d0f1a  (dark navy)
Base bg: #0F1117

Token pill: #2D3748 bg, #68D391 border
```
