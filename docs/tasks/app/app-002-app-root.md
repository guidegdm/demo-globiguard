# app-002: App.tsx — Scroll Spine + Section Wiring

**Status:** pending  
**Priority:** P0  
**Complexity:** M  
**Depends on:** ALL scenes, ALL widgets, app-001  
**Standards:** `docs/tasks/README.md` (dependency order)

## What

The root `App.tsx` that wires all 6 scenes together into a single scrollable page.
Mounts `<SectionNav>` as a fixed overlay. Handles section ID registration for nav.

## Files

```
frontend/src/App.tsx   ← update (currently has placeholder Vite template content)
```

## Implementation notes

```tsx
// App.tsx structure
import SectionNav from './components/widgets/SectionNav';
import HeroScene from './components/scenes/HeroScene';
import ProblemScene from './components/scenes/ProblemScene';
import FlowScene from './components/scenes/FlowScene';
import AutomationScene from './components/scenes/AutomationScene';
import ArchScene from './components/scenes/ArchScene';
import ComplianceScene from './components/scenes/ComplianceScene';

export default function App() {
  return (
    <div className="relative">
      <SectionNav />
      <section id="hero"         className="scroll-section"><HeroScene /></section>
      <section id="problem"      className="scroll-section"><ProblemScene /></section>
      <section id="pipeline"     className="scroll-section"><FlowScene /></section>
      <section id="automation"   className="scroll-section"><AutomationScene /></section>
      <section id="architecture" className="scroll-section"><ArchScene /></section>
      <section id="compliance"   className="scroll-section"><ComplianceScene /></section>
    </div>
  );
}
```

1. Each `<section>` has a unique `id` that matches the `SECTIONS` array in `SectionNav`
2. `SectionNav` is `position: fixed` so it overlays all sections
3. No Router needed — this is a single-page scrolling experience
4. Remove all Vite template boilerplate from current `App.tsx`
5. Remove the React/Vite SVG logos and counter from `App.tsx`

## Acceptance criteria

- [ ] All 6 sections render on the page
- [ ] SectionNav renders as overlay
- [ ] Scrolling through page updates active nav dot
- [ ] No TypeScript errors
- [ ] `npm run dev` serves the page without errors
