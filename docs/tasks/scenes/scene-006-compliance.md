# scene-006: ComplianceScene (12 Frameworks + Live Enforcement Log)

**Status:** pending  
**Priority:** P1  
**Complexity:** M  
**Depends on:** prim-005, prim-006, prim-008  
**Standards:** `docs/architecture.md` (Layer 4: Compliance Evidence Engine), `brainstorm/build-spec.md` (Section 8: Compliance)

## What

Grid of 12 compliance framework badges. Hover or click to expand each one. Category A glows
green (GlobiGuard certifies independently), Category B glows amber (GlobiGuard is evidence
layer). Live scrolling enforcement log at the bottom.

## Files

```
frontend/src/components/scenes/ComplianceScene.tsx   ← create
```

## Content

### Section header
> "12 Compliance Frameworks, One Enforcement Layer"

Sub-text: "GlobiGuard doesn't just help you comply — it proves you comply."

### Category A — GG certifies independently (8 frameworks)

| Badge | Full name | Max penalty | Key GG controls |
|-------|-----------|-------------|-----------------|
| HIPAA | Health Insurance Portability & Accountability | $50K/incident | PHI detection, audit log |
| GDPR | General Data Protection Regulation | 4% global revenue | Right-to-forget, consent |
| GLBA | Gramm-Leach-Bliley Act | $100K/violation | NPI tokenization |
| CCPA/CPRA | CA Consumer Privacy Act | $7,500/intentional | Consumer data map |
| NIST CSF 2.0 | Cybersecurity Framework | — | Detect/Respond functions |
| NIST AI RMF | AI Risk Management Framework | — | GOVERN/MAP/MEASURE/MANAGE |
| EU AI Act | EU Artificial Intelligence Act | €30M or 6% revenue | High-risk AI controls |
| ISO 42001 | AI Management System Standard | — | AI governance system |

### Category B — GG as evidence layer (4 frameworks)

| Badge | Full name | Notes |
|-------|-----------|-------|
| SOC 2 | Service Organization Control 2 | Audit evidence provided |
| ISO 27001 | Information Security Management | Risk treatment records |
| HITRUST CSF | Health Information Trust Alliance | Healthcare AI controls |
| PCI DSS v4.0 | Payment Card Industry Data Security | Cardholder data tokenization |

### Badge design
- Category A: green border + glow, `"GG CERTIFIES"` microtext
- Category B: amber border + glow, `"EVIDENCE LAYER"` microtext
- Hover: expands to show control list
- Click: opens `<ExplanationPanel>` with full framework explanation

### Live enforcement log (bottom)
Scrolling ticker of recent enforcement decisions:

```
[12:04:31] MODIFY   HIPAA §164.514  healthcare   PHI in Salesforce query       risk 0.45
[12:04:29] ALLOW    —              accounting   QuickBooks report (clean)      risk 0.18
[12:04:27] QUEUE    GDPR Art.9     insurance    Health data via Gmail          risk 0.84
[12:04:24] BLOCK    PCI DSS §3.4   finance      Raw PAN to external API        risk 0.97
[12:04:22] MODIFY   GLBA §501      banking      SSN in email draft             risk 0.38
```

New entries fade in at top every 2s. Maximum 8 visible. Auto-scrolls.
Color-coded by decision using CSS custom properties.

### Compliance certificate animation (optional P2)
Button: `"Generate Compliance Certificate"` → shows fake PDF animating into existence,
stamped `"HIPAA COMPLIANT — Enforced by GlobiGuard"`, with real audit hash.

## Acceptance criteria

- [ ] 12 framework badges render in Cat A / Cat B sections
- [ ] Hover expands badge to show control list
- [ ] Cat A = green glow, Cat B = amber glow
- [ ] Live enforcement log scrolls with new entries every 2s
- [ ] Log entries color-coded by decision
