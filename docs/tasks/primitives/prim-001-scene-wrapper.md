# prim-001: SceneWrapper + useSceneAnimation

**Status:** pending  
**Priority:** P0  
**Complexity:** M  
**Depends on:** app-001 (CSS tokens must exist)  
**Standards:** `docs/animations.md` (SceneWrapper section)

## What

Port `SceneWrapper.tsx` and the `useSceneAnimation` hook from the globiguard landing page,
adapted for Vite (no `'use client'`, no Next.js deps). Then improve with extra SVG filter defs.

**Source:** `D:\Dev\AI\globiguard\frontend\src\components\landing\animations\SceneWrapper.tsx`

**Output files:**
- `frontend/src/components/primitives/SceneWrapper.tsx`

## Why

Every animated scene in the explainer uses this component as its container. It provides:
- IntersectionObserver-based play/pause: animation fires only while in viewport
- Auto-replay every 90s (keeps the page alive as team members read alongside)
- Shared `<defs>` block with reusable SVG filters — avoids duplicating filter defs per scene
- Hydration guard (`requestAnimationFrame`) — prevents SSR flicker even though we're Vite

## Files

```
frontend/src/components/primitives/SceneWrapper.tsx   ← create
```

## Implementation notes

1. Remove `'use client'` at top of file
2. Port `useSceneAnimation` hook as a named export from the same file
3. SharedDefs must include all filters from source PLUS new additions:
   - `softGlow` — existing (emerald, small radius)
   - `cardShadow` — existing
   - `heavyGlow` — existing
   - `innerGlow` — existing
   - `amberGlow` — NEW: same as softGlow but `#ED8936` base color (QUEUE state)
   - `purpleGlow` — NEW: same as softGlow but `#6B46C1` (GLiNER detection layer)
   - `redGlow` — NEW: `#E53E3E` (BLOCK state)
4. `useSceneAnimation` returns `{ ref, isPlaying, epoch }` — same API as source
5. Wrap `IntersectionObserver` call in `useEffect` with cleanup
6. viewBox default: `"0 0 800 480"` (wider than source's `700 420` for pipeline diagram)

## Acceptance criteria

- [ ] `<SceneWrapper>` renders an `<svg>` with the given viewBox
- [ ] `useSceneAnimation` returns correct `isPlaying` when element enters/leaves viewport
- [ ] SharedDefs contains all 7 filters (4 original + 3 new)
- [ ] No TypeScript errors
- [ ] No `'use client'` directive
- [ ] Works inside Vite dev server without hydration errors
