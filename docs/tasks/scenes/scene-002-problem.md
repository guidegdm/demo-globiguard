# scene-002: ProblemScene

**Status:** pending  
**Priority:** P0  
**Complexity:** M  
**Depends on:** prim-002, prim-003, prim-005  
**Standards:** `docs/architecture.md` (Narrative: Sarah's Monday), `brainstorm/sonnet-analysis.md` (Sarah's story)

## What

The "before" picture. A split-screen scene that shows what happens to regulated industries
without GlobiGuard: raw data flowing unprotected into AI, with red warning highlights
on each PII field. Hover any data type to see which compliance law it triggers.

## Files

```
frontend/src/components/scenes/ProblemScene.tsx   ← create
```

## Content

**Left panel — "Without GlobiGuard":**
```
Insurance claim email (mock):
  To: adjuster@example.com
  Patient: [Sarah Mitchell ← hover → HIPAA §164.514(b)]
  DOB: [03/15/1987 ← hover → HIPAA PHI]
  Diagnosis: [ICD-10: E11.9 ← hover → HIPAA §164.502]
  SSN: [547-82-3901 ← hover → GLBA, PCI DSS]
  Medication: [Metformin 500mg ← hover → HIPAA §164.512]
```
Red animated data packet travels from email → AI (direct, no shield).
As it crosses a "boundary" line, red flashing warning appears: "PII EXPOSED"

**Right panel — "847 potential violations":**
A counter animating up to 847 (Meridian's exposure from sonnet-analysis).
Below it: `$2.8M` exposure amount.
Below that: `"Before GlobiGuard"` label.

**Transition:** "Scroll to see what GlobiGuard does instead →"

## Implementation notes

1. Two `<GlassCardDiv>` panels side by side, with a divider
2. Left panel: mock email with hover-tooltip on each PII field
   - Tooltip shows which law is violated + max penalty
   - PII spans colored red with subtle underline
3. `<DataPacket color='red' />` travels from email to a cloud icon on right
4. Right panel: `<AnimatedCounter value={847} />` + `<AnimatedCounter prefix='$' value={2.8} suffix='M' />`
5. Both animate in with `useSceneAnimation` IntersectionObserver

## Hover tooltip data

| Field | Law | Max penalty |
|-------|-----|-------------|
| Patient name | HIPAA §164.514(b) | $50,000/incident |
| Date of birth | HIPAA PHI | $50,000/incident |
| ICD-10 code | HIPAA §164.502 | $50,000/incident |
| SSN | GLBA + PCI DSS | $100,000/violation |
| Medication | HIPAA §164.512 | $50,000/incident |

## Acceptance criteria

- [ ] Hover on PII field shows tooltip with law + penalty
- [ ] Red data packet travels left-to-right
- [ ] Counter animates to 847 when section enters viewport
- [ ] $2.8M counter animates
- [ ] Scroll prompt at bottom
