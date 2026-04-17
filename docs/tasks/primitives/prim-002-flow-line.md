# prim-002: FlowLine

**Status:** pending  
**Priority:** P0  
**Complexity:** S  
**Depends on:** prim-001  
**Standards:** `docs/animations.md` (FlowLine section)

## What

Port `FlowLine.tsx` from globiguard landing page, then add new variants for QUEUE and BLOCK flows.

**Source:** `D:\Dev\AI\globiguard\frontend\src\components\landing\animations\FlowLine.tsx`

**Output files:**
- `frontend/src/components/primitives/FlowLine.tsx`

## Why

Every connection between nodes in the pipeline diagram is a FlowLine. It draws itself (dash-draw
animation) and optionally shimmers continuously to show live data moving. The `queue` variant
(amber dashed) and `blocked` variant (red, not drawing at all) communicate gate decisions
visually without any text needed.

## Files

```
frontend/src/components/primitives/FlowLine.tsx   ← create
```

## Implementation notes

1. Remove `'use client'`
2. Port core: bezier path builder (horizontal + vertical), `strokeDashoffset` draw animation,
   per-instance `linearGradient`, glow underlayer (thicker + blurFilter)
3. Add `variant` prop: `'default' | 'queue' | 'blocked' | 'active'`
   - `'default'` → emerald gradient (same as source)
   - `'queue'` → amber `#ED8936`, dashed stroke (`strokeDasharray="8 4"`), slower shimmer
   - `'blocked'` → red `#E53E3E`, draw but then fade out (opacity 0.3)
   - `'active'` → emerald, brighter, faster shimmer (continuous data flowing)
4. Add `label` prop (optional): small monospace text floating at the midpoint of the path.
   Font size 9px, opacity 0.7, `font-family: monospace`.
5. Add `delay` prop (seconds) — when to start draw animation (default 0)
6. Keep all existing props: `x1 y1 x2 y2 bend orientation color duration delay`

## Acceptance criteria

- [ ] Draws from start to end with `strokeDashoffset` animation
- [ ] Glow underlayer renders behind main path
- [ ] `variant='queue'` renders amber dashed line
- [ ] `variant='blocked'` renders red, faded
- [ ] `label` appears at midpoint when provided
- [ ] No TypeScript errors, no `'use client'`
