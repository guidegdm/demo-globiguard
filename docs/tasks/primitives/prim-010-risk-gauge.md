# prim-010: RiskGauge

**Status:** pending  
**Priority:** P1  
**Complexity:** S  
**Depends on:** prim-001  
**Standards:** `docs/architecture.md` (Layer 1: Risk Scorer, Layer 2: Policy Gate thresholds)

## What

SVG arc gauge showing risk score 0.0–1.0. Color transitions green → yellow → amber → red
as the score crosses the four thresholds. Used in the FlowScene to visually explain
how the risk scorer works.

## Files

```
frontend/src/components/primitives/RiskGauge.tsx   ← create new
```

## Why

The threshold table in the architecture doc (`<0.30 ALLOW | 0.30–0.69 MODIFY | 0.70–0.89 QUEUE | ≥0.90 BLOCK`)
is hard to read. An animated arc that fills with the right color at the right position
makes it instantly clear — especially when it animates from 0.00 to 0.84 and stops in the amber zone.

## Implementation notes

1. SVG `<path>` arc using `Math.PI` calculations for stroke arc
2. Background arc: gray, full 180° (semicircle)
3. Foreground arc: animates from 0 to `score * 180°`, colored by zone:
   - 0.00–0.29: `#38A169` green
   - 0.30–0.69: `#ECC94B` yellow
   - 0.70–0.89: `#ED8936` amber
   - 0.90–1.00: `#E53E3E` red
4. Score number animates with it (Framer Motion `useMotionValue` + `useTransform`)
5. Zone labels on the arc: `ALLOW` `MODIFY` `QUEUE` `BLOCK` at the threshold points
6. Props: `score: number` (0–1), `animated: boolean`, `animationDuration?: number`
7. Size: fixed `200 × 120` SVG viewBox (can be embedded at any scale)

## Acceptance criteria

- [ ] Arc fills to correct position for given score
- [ ] Color is correct for each zone
- [ ] Score number animates alongside arc
- [ ] Zone labels show at threshold boundaries
- [ ] No TypeScript errors
