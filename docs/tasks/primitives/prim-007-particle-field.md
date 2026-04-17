# prim-007: ParticleField

**Status:** pending  
**Priority:** P1  
**Complexity:** S  
**Depends on:** prim-001  
**Standards:** `docs/animations.md` (ParticleField section)

## What

Port `ParticleField.tsx` from globiguard. Minimal changes — this component is excellent as-is.
Add `color` and `density` props.

**Source:** `D:\Dev\AI\globiguard\frontend\src\components\landing\animations\ParticleField.tsx`

## Files

```
frontend/src/components/primitives/ParticleField.tsx   ← port + minor improvements
```

## Why

ParticleField is used in the Hero section (ambient glow), the Architecture section background,
and potentially the Compliance section. The seeded random is critical — it makes particles
deterministic across renders, preventing layout shift and hydration mismatches.

## Implementation notes

1. Remove `'use client'`
2. Replace `useId()` from React with a simple incrementing counter or passed `id` prop
   (React's `useId` is fine in Vite too, but verify it works with the version installed)
3. Add `color` prop: `'emerald' | 'amber' | 'blue'` (default `'emerald'`)
   - Maps hex: `'emerald'` = `#10b981`, `'amber'` = `#ED8936`, `'blue'` = `#3B82F6`
4. Add `density` prop: `'low' | 'medium' | 'high'` → particle count `15 | 30 | 50`
5. Keep seeded random (the `lcg` or `xmur3` implementation from source — critical for determinism)
6. Keep pure CSS animations (no Framer Motion in this component)

## Acceptance criteria

- [ ] Particles render in correct color based on `color` prop
- [ ] Particles render correct count based on `density` prop
- [ ] Same seed always produces same particle layout (deterministic)
- [ ] No TypeScript errors, no `'use client'`
