# scene-001: HeroScene

**Status:** pending  
**Priority:** P0  
**Complexity:** S  
**Depends on:** prim-007 (ParticleField), app-001  
**Standards:** `docs/architecture.md`, `brainstorm/sonnet-analysis.md` (Section 1)

## What

The landing section of the explainer. Full-viewport hero with animated tagline,
3 rotating stats, and ambient particle field. Scroll arrow at the bottom.

## Files

```
frontend/src/components/scenes/HeroScene.tsx   ← create
```

## Content

**Tagline (large, centered):**
> "Your AI can see everything. GlobiGuard decides what it should."

**Rotating subtitle lines** (cycle every 4s, fade in/out):
1. "Compliance middleware for regulated AI"
2. "Sits between your data and every LLM"
3. "Zero-knowledge enforcement — we can't see your data either"

**Stat cards (3, horizontal row):**
| Stat | Label |
|------|-------|
| 0.8ms | Detection latency |
| 12 | Compliance frameworks |
| 4 | Deployment models |

**Visual:**
- `<ParticleField density='low' color='emerald' />` as full-bleed background
- Subtle radial gradient glow behind title (emerald, 20% opacity)
- "↓ Scroll to explore" text at bottom with bouncing arrow

## Implementation notes

1. Pure HTML + Tailwind. No SVG. Full-height section.
2. Tagline: `text-4xl md:text-6xl font-bold`, Framer Motion fade-in-up on load
3. Stat cards: use `<GlassCardDiv>` from prim-005. `AnimatedCounter` from prim-006.
4. Rotating subtitle: `<AnimatePresence>` swapping text on 4s interval
5. ParticleField: position absolute, behind all content, z-index 0
6. Stats animate in with 0.15s stagger after title

## Acceptance criteria

- [ ] Tagline renders and fades in on page load
- [ ] Subtitle rotates every 4s with smooth transition
- [ ] 3 stat cards with counters animate in
- [ ] ParticleField renders as background
- [ ] Scroll arrow at bottom
