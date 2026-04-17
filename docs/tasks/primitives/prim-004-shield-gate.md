# prim-004: ShieldGate

**Status:** pending  
**Priority:** P0  
**Complexity:** M  
**Depends on:** prim-001  
**Standards:** `docs/animations.md` (ShieldGate section), `docs/architecture.md` (Layer 2: Policy Gate)

## What

Port `ShieldGate.tsx` from globiguard, then add `'queued'` state with its distinct amber visual
(the most important state to get right — it's the signature GlobiGuard behavior).

**Source:** `D:\Dev\AI\globiguard\frontend\src\components\landing\animations\ShieldGate.tsx`

## Files

```
frontend/src/components/primitives/ShieldGate.tsx   ← create
```

## Why

The Gate is the visual climax of every pipeline animation. Four decisions are possible:
ALLOW (green pass), MODIFY (yellow filter), QUEUE (amber hold), BLOCK (red stop).
QUEUE is the differentiator — it's NOT a rejection and NOT an approval. It's GlobiGuard
saying "I noticed something human eyes should confirm." The visual must feel different
from both BLOCK (urgent red) and MODIFY (routine yellow).

## Implementation notes

1. Remove `'use client'`
2. Port all 4 existing states: `'idle' | 'scanning' | 'blocked' | 'allowed'`
   - Keep all SVG layers: hexagonal shield path, grid pattern, glow ring, dashed border, state flash
3. Add `'queued'` state (5th state):
   - Color: `#ED8936` (amber)
   - Pulse ring: 1.8s period, scale 1.0 → 1.10, amber glow
   - Center icon: `?` question mark (not ✓ or ✗)
   - Dashed border: slower rotation (8s), amber colored
   - Badge overlay: floating "202" badge above shield (HTTP 202 Accepted = held, not rejected)
   - DO NOT use pulsing red — amber queue should feel calm, not alarming
4. Add `size` prop: number in px (default 80). All SVG measurements scale proportionally.
5. Keep `onStateChange` callback prop from source for orchestration

## State config (per state)
```typescript
const STATE_CONFIG = {
  idle:     { ring: '#4A5568', glow: 'none',        icon: '◉', flash: 'none'    },
  scanning: { ring: '#3182CE', glow: 'softGlow',    icon: '◎', flash: '#3182CE' },
  allowed:  { ring: '#38A169', glow: 'softGlow',    icon: '✓', flash: '#38A169' },
  blocked:  { ring: '#E53E3E', glow: 'redGlow',     icon: '✗', flash: '#E53E3E' },
  queued:   { ring: '#ED8936', glow: 'amberGlow',   icon: '?', flash: '#ED8936' },
};
```

## Acceptance criteria

- [ ] All 5 states render with correct colors
- [ ] `'queued'` state has floating "202" badge
- [ ] `'queued'` pulse is amber and 1.8s period (distinctly slower than `'scanning'` 1.2s)
- [ ] `size` prop scales all measurements
- [ ] No TypeScript errors, no `'use client'`
