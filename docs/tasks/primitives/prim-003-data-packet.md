# prim-003: DataPacket

**Status:** pending  
**Priority:** P0  
**Complexity:** S  
**Depends on:** prim-001  
**Standards:** `docs/animations.md` (DataPacket section)

## What

Port `DataPacket.tsx` from globiguard landing page, then add color variants and a label prop
so packets show what kind of data they're carrying as they travel through the pipeline.

**Source:** `D:\Dev\AI\globiguard\frontend\src\components\landing\animations\DataPacket.tsx`

## Files

```
frontend/src/components/primitives/DataPacket.tsx   ← create
```

## Why

Data packets traveling along FlowLines are the visual heartbeat of the pipeline diagram.
Watching a packet change color from green (safe) to amber (detected PII) to red (blocked)
communicates the detection cascade without any text. Adding a tiny floating label
("SSN 0.84") makes the click-panel content feel earned — you saw it happen.

## Implementation notes

1. Remove `'use client'`
2. Port the 5-layer design: trail dots (opacity cascade) + glow halo + main circle + bright center
3. Add `color` prop: `'emerald' | 'amber' | 'red' | 'purple' | 'blue'`
   - Maps to hex: `#10b981 | #ED8936 | #E53E3E | #6B46C1 | #3B82F6`
   - All 5 layers (trail, halo, main, center) use the same color
4. Add `size` prop: `'sm' | 'md' | 'lg'` → main radius `3 | 5 | 8`px
5. Add `label` prop: string that floats 12px above center of packet while in motion
   Font: 8px monospace, white with 80% opacity, fades in after 0.2s delay
6. Add `repeat` prop (boolean) + `repeatDelay` (seconds, default 1.5)
   When true, packet loops continuously along its path
7. Keep `waypoints` array prop (the point-to-point path system from source)

## Acceptance criteria

- [ ] Packet travels along waypoints array
- [ ] All 5 layers render with correct color
- [ ] `label` floats above packet
- [ ] `repeat=true` loops continuously
- [ ] No TypeScript errors, no `'use client'`
