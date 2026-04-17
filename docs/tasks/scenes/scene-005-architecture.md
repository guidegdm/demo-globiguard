# scene-005: ArchScene (Two-Plane Architecture + Deployment Models)

**Status:** pending  
**Priority:** P1  
**Complexity:** M  
**Depends on:** prim-001, prim-002, prim-003, prim-005, prim-007  
**Standards:** `docs/architecture.md` (Two-Plane Architecture, Four deployment models)

## What

Animated two-plane architecture diagram: Coordination Plane (GG cloud) and Enforcement Plane
(customer environment). Shows what data crosses the boundary (nothing) and what stays
(all raw data). Scroll further to see the 4 deployment model cards.

## Files

```
frontend/src/components/scenes/ArchScene.tsx   ← create
```

## Content

### Part A: Two-Plane Diagram (SVG)

```
╔══════════════════════════════╗  ← Coordination Plane (dark navy bg)
║  Policy Engine               ║    "GG-operated cloud — never sees raw data"
║  Compliance Reports          ║    Receives: decision metadata only
║  Human Review Queue          ║    Sends: policy updates (encrypted)
║  Billing / Org Settings      ║
╚══════════════╤═══════════════╝
               │  ← "Architecturally separated. No raw data can cross."
               │    (animated boundary line — dashed, pulsing)
╔══════════════╧═══════════════╗  ← Enforcement Plane (dark green bg)
║  Go Sidecar :8080            ║    "Your VPC / K8s / on-prem"
║  Python Detection Brain      ║
║  Redis token map (TTL 1hr)   ║
║  Audit Buffer                ║
╚══════════════════════════════╝
```

**Animated elements:**
- Packet travels Enforcement → Coordination: shows ONLY metadata `{decision: QUEUE, score: 0.84, fields: [SSN, ICD10]}`
  NOT the actual values. Label: `"metadata only"`, color: `amber`
- Packet travels Coordination → Enforcement: `{policy_update: v2.4.1, encrypted: true}`
  Label: `"policy (encrypted)"`, color: `blue`
- A red `×` appears on a hypothetical raw data path to show it CAN'T cross

**Zero-knowledge proof visualization:**
- GG side shows: `{ score: 0.84, decision: "QUEUE", field_types: ["SSN", "ICD10"] }`
- GG side does NOT show: `"547-82-3901"` or `"E11.9"` — these are grayed out with ~~strikethrough~~
- Text: `"GlobiGuard sees decisions. Never data."`

### Part B: Deployment Models (4 cards, scroll-triggered)

| Model | Icon | Who uses it | What it means |
|-------|------|-------------|---------------|
| Native | 🏛️ | Banks, hospitals | Customer runs everything on-prem |
| Dedicated | 🔒 | Mid-enterprise | GG-operated isolation zone, BYOK |
| Gateway | ☁️ | Serverless teams | Lightweight virtual node |
| Self-hosted | 🔧 | Open-source users | OSS enforcement + SaaS coordination |

Each card uses `<GlassCardDiv>`. Clicking expands to show technical details.

## Acceptance criteria

- [ ] Two-plane diagram renders with correct background colors
- [ ] Metadata packet travels UP (enforcement → coordination) showing only schema
- [ ] Red × blocks hypothetical raw data path
- [ ] ZK proof panel shows what GG sees vs doesn't see
- [ ] 4 deployment model cards render and expand on click
