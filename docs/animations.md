# Animation System

## Source: globiguard landing page

All base animation primitives are **ported** from `D:\Dev\AI\globiguard\frontend\src\components\landing\animations\`
then **improved** for our use case. We do NOT copy from globiguard — we rewrite from the source,
improving where needed.

---

## What we port (and how we improve it)

### SceneWrapper + useSceneAnimation
**Source:** `animations/SceneWrapper.tsx`
**Port as:** `primitives/SceneWrapper.tsx`
**Improvements:**
- Remove `'use client'` (Vite, not Next.js)
- Remove `@/hooks/use-reduced-motion` import — inline the hook
- Add `amber` and `queue` color variants to SharedDefs gradients
- Add `queueGlow` filter variant (amber pulse for QUEUE state)
- Expand SharedDefs: add `amberGlow`, `purpleGlow` linear gradients for detection layers
- viewBox expand to `0 0 900 520` for wider pipeline diagrams

### FlowLine
**Source:** `animations/FlowLine.tsx`
**Port as:** `primitives/FlowLine.tsx`
**Improvements:**
- Add `variant: 'queue'` (amber dashed, pulsing) and `variant: 'blocked'` (red X'd out)
- Add `animated` prop: when true, run continuous packet-style shimmer along the line
- Add `label` prop: small monospace label that appears midway along the path
- Keep bezier curve logic and path-length estimation

### DataPacket
**Source:** `animations/DataPacket.tsx`
**Port as:** `primitives/DataPacket.tsx`
**Improvements:**
- Add `color: 'amber' | 'purple'` variants for QUEUE and detection layers
- Add `label` prop: tiny text that appears above the packet as it travels (e.g. "SSN detected")
- Add `repeat: true` with configurable repeatDelay — for continuous pipeline loops
- Add `size` variants: `sm` (4px), `md` (6px), `lg` (9px)
- Keep trail dots + glow halo + bright center design

### ShieldGate
**Source:** `animations/ShieldGate.tsx`
**Port as:** `primitives/ShieldGate.tsx`
**Improvements:**
- Add `state: 'queued'` — amber ring, "?" center icon, slower pulse (1.8s)
- Make scanning ring animation smoother (use strokeDashoffset scroll instead of dash)
- Add `queueBadge` overlay: when state='queued', show floating "202" badge above shield
- Keep all 4 states, all SVG layers, hexagonal shield path

### GlassCard (SVG)
**Source:** `animations/GlassCard.tsx`
**Port as:** `primitives/GlassCard.tsx` (SVG version)
**Also create:** `primitives/GlassCardDiv.tsx` (HTML div version for panels/sections)
**Improvements to SVG version:**
- Add `variant: 'queue'` (amber border + header)
- Add `variant: 'blocked'` (red border, dimmer fill)
- Increase cardVolume gradient contrast slightly
- Add `glowColor` prop for per-instance border glow intensity

### PIIBadge
**Source:** `animations/PIIBadge.tsx`
**Port as:** `primitives/PIIBadge.tsx`
**Improvements:**
- Add tier color coding: BLOCKED=red, CONFIDENTIAL=amber, RESTRICTED=yellow
- Add `variant: 'token'` — shows `[MASKED-SSN-001]` pill format instead of type label

### ParticleField
**Source:** `animations/ParticleField.tsx`
**Port as:** `primitives/ParticleField.tsx`
**Improvements:**
- Accept `color` prop (default emerald, also amber for automation section)
- Add `density: 'low' | 'medium' | 'high'` (15/30/50 particles)
- Keep seeded random (deterministic, no hydration mismatch)

### StatusIndicator + AnimatedCounter
**Source:** `animations/StatusIndicator.tsx`, `animations/AnimatedCounter.tsx`
**Port as-is** with minor improvements:
- StatusIndicator: add `QUEUED` state (amber, "QUEUED" label)
- AnimatedCounter: add `prefix` prop (e.g. `$`) and `suffix` prop (e.g. `ms`)

---

## What we add (new, not in globiguard)

### DecisionBadge (HTML)
Pure HTML+CSS badge for ALLOW/MODIFY/QUEUE/BLOCK decisions.
Used in panels, cards, section headers.

### ExplanationPanel (HTML)
Slide-in panel from right side using Framer Motion.
Shows on node click. Glass background, color-accented top border.

### RiskGauge
SVG arc gauge 0.0–1.0 that fills with color transition green→yellow→amber→red.
Used in FlowScene to show score animating up.

### TokenizationDemo (HTML)
Interactive textarea where user types text, sees live PII highlighting,
then watches tokenization happen span-by-span.

### WorkflowStep
SVG node for automation workflow DAG. Rectangular with rounded corners,
colored border by decision state, optional pulsing animation.

### SectionNav (HTML)
Fixed right-side dot navigation. 6 dots, active = filled + glowing.

---

## Scenes: what animation components each uses

| Scene | Components from globiguard | New components |
|-------|---------------------------|----------------|
| Hero | ParticleField | — |
| Problem | GlassCard, FlowLine, DataPacket | — |
| Pipeline | GlassCard, FlowLine, DataPacket, ShieldGate, SceneWrapper | RiskGauge, ExplanationPanel |
| Automation | GlassCard, FlowLine, DataPacket, StatusIndicator | WorkflowStep |
| Architecture | GlassCard, FlowLine, DataPacket, ParticleField | — |
| Compliance | AnimatedCounter, StatusIndicator | — |

---

## Animation timing philosophy

- **Ease:** `cubic-bezier(0.21, 0.47, 0.32, 0.98)` — sharp start, smooth landing (same as globiguard)
- **Scene cycle:** 90s auto-replay while in view (inherited from useSceneAnimation)
- **Stagger:** 0.15s between sequential elements
- **Packet travel:** 1.0–1.5s per segment
- **Badge pop:** scale 0→1, duration 0.3s, ease overshoot (spring)
- **QUEUE pulse:** 1.8s period, amber glow scales 1→1.08→1

## Reduced motion
All animation components check `prefers-reduced-motion`. When reduced:
- Skip all entering animations
- Show final/complete state immediately
- Keep static layout intact
