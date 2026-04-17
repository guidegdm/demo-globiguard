# Task Index

## Primitives (base animation components — build first)

| Task | Title | Status | Priority |
|------|-------|--------|----------|
| [prim-001](primitives/prim-001-scene-wrapper.md) | SceneWrapper + useSceneAnimation | pending | P0 |
| [prim-002](primitives/prim-002-flow-line.md) | FlowLine | pending | P0 |
| [prim-003](primitives/prim-003-data-packet.md) | DataPacket | pending | P0 |
| [prim-004](primitives/prim-004-shield-gate.md) | ShieldGate | pending | P0 |
| [prim-005](primitives/prim-005-glass-card.md) | GlassCard (SVG + Div) | pending | P0 |
| [prim-006](primitives/prim-006-pii-badge.md) | PIIBadge + StatusIndicator + AnimatedCounter | pending | P1 |
| [prim-007](primitives/prim-007-particle-field.md) | ParticleField | pending | P1 |
| [prim-008](primitives/prim-008-decision-badge.md) | DecisionBadge (HTML) | pending | P0 |
| [prim-009](primitives/prim-009-explanation-panel.md) | ExplanationPanel (HTML slide-in) | pending | P0 |
| [prim-010](primitives/prim-010-risk-gauge.md) | RiskGauge (SVG arc) | pending | P1 |

## Scenes (build after all P0 primitives)

| Task | Title | Status | Priority |
|------|-------|--------|----------|
| [scene-001](scenes/scene-001-hero.md) | HeroScene — tagline + stats | pending | P0 |
| [scene-002](scenes/scene-002-problem.md) | ProblemScene — Sarah's story + before/after | pending | P0 |
| [scene-003](scenes/scene-003-pipeline.md) | FlowScene — 14-node interactive pipeline | pending | P0 |
| [scene-004](scenes/scene-004-automation.md) | AutomationScene — QUEUE moment (key scene) | pending | P0 |
| [scene-005](scenes/scene-005-architecture.md) | ArchScene — two planes + deployment models | pending | P1 |
| [scene-006](scenes/scene-006-compliance.md) | ComplianceScene — 12 frameworks + live log | pending | P1 |

## Widgets + App

| Task | Title | Status | Priority |
|------|-------|--------|----------|
| [widget-001](widgets/widget-001-tokenization-demo.md) | TokenizationDemo — live interactive | pending | P1 |
| [widget-002](widgets/widget-002-section-nav.md) | SectionNav — right-side dot nav | pending | P1 |
| [app-001](app/app-001-css-tokens.md) | index.css — design tokens + Tailwind base | pending | P0 |
| [app-002](app/app-002-app-root.md) | App.tsx — scroll spine + section wiring | pending | P0 |

## Dependency order

```
app-001 (CSS)
  └─→ prim-001 through prim-010 (all primitives)
        └─→ scene-001 (Hero)
        └─→ scene-002 (Problem)
        └─→ scene-003 (Pipeline) + prim-009 (Panel) + prim-010 (Gauge)
        └─→ scene-004 (Automation) ← most important
        └─→ scene-005 (Architecture)
        └─→ scene-006 (Compliance)
              └─→ widget-001 (Tokenization Demo)
              └─→ widget-002 (Section Nav)
                    └─→ app-002 (App root)
```
