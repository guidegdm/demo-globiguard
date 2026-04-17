# prim-005: GlassCard (SVG + Div)

**Status:** pending  
**Priority:** P0  
**Complexity:** S  
**Depends on:** prim-001  
**Standards:** `docs/animations.md` (GlassCard section)

## What

Port `GlassCard.tsx` (SVG version) from globiguard, then also create a separate HTML div version
`GlassCardDiv.tsx` for panels, section headers, and widget containers.

**Source:** `D:\Dev\AI\globiguard\frontend\src\components\landing\animations\GlassCard.tsx`

## Files

```
frontend/src/components/primitives/GlassCard.tsx      ← SVG version (port + improve)
frontend/src/components/primitives/GlassCardDiv.tsx   ← HTML div version (new)
```

## Why

The SVG version is used inside animation scenes (positioned precisely within the SVG coordinate
space). The HTML div version is needed for the ExplanationPanel, the hero stats, and the
compliance framework grid — things that live outside SVG and need normal CSS layout.

## Implementation notes

### GlassCard.tsx (SVG)
1. Remove `'use client'`
2. Port all 6 SVG layers: shadow rect, gradient fill rect, dark base rect, volume overlay rect,
   border rect, optional header (macOS dots + label)
3. Add `variant` prop: `'default' | 'queue' | 'blocked' | 'allowed'`
   - Sets border fill color and header background:
     - `'queue'` → border `#ED8936`, header bg `rgba(237,137,54,0.15)`
     - `'blocked'` → border `#E53E3E`, header bg `rgba(229,62,62,0.15)`
     - `'allowed'` → border `#38A169`, header bg `rgba(56,161,105,0.15)`
4. Add `glowColor` prop for custom border color (overrides variant)
5. Keep `x y width height` positioning props, `label` header text, `headerDots` boolean

### GlassCardDiv.tsx (HTML)
New component. Uses Tailwind classes + CSS custom properties.
- `className` passthrough + `variant` prop same as SVG version
- `children` prop
- `title` prop: optional card header text
- Glass effect: `bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-xl`
- Variant border overrides: `border-[#ED8936]/40` for queue, etc.
- Glow effect: `box-shadow: 0 0 24px color/20`

## Acceptance criteria

- [ ] SVG GlassCard renders all 6 layers
- [ ] `variant='queue'` uses amber border on both versions
- [ ] `GlassCardDiv` accepts children and renders HTML
- [ ] No TypeScript errors, no `'use client'`
