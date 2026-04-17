# GlobiGuard Visual Explainer — Docs

Internal interactive explainer for the team building GlobiGuard. Answers every "what, why, how"
with animated diagrams, clickable nodes, and scroll-triggered scenes.

## Stack
- `frontend/` — Vite 8 + React 19 + TypeScript
- Framer Motion 12 (scene transitions, panel slides)
- SVG-based animation system (ported + improved from globiguard landing page)
- Tailwind v4 via `@tailwindcss/vite`

## What exists already
- `brainstorm/sonnet-analysis.md` — 58KB deep analysis (narrative, click panel text, animation specs)
- `brainstorm/gpt-analysis.md` — 43KB technical analysis (automation layer, byte-level lifecycle)
- `brainstorm/gpt-review-of-sonnet.md` — cross-review (catches threshold errors, missing automation)
- `brainstorm/sonnet-review-of-gpt.md` — cross-review (catches missing narrative, wrong page structure)
- `brainstorm/build-spec.md` — synthesized build spec (start here before coding)

## Docs structure
```
docs/
  README.md             ← this file
  architecture.md       ← GlobiGuard 4-layer architecture reference
  animations.md         ← Animation system: what we port, what we improve, what we add
  tasks/
    README.md           ← task index with status
    primitives/         ← base SVG animation components (ported from globiguard)
    scenes/             ← the 6 scrollable sections
    widgets/            ← interactive widgets (tokenization demo, nav dots)
    app/                ← app wiring and CSS tokens
```

## Task execution order
Dependencies must be respected. Start with primitives, then scenes, then app wiring.

```
primitives (all) → scenes (all in parallel) → widgets → app root → CSS
```
