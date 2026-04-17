# prim-009: ExplanationPanel

**Status:** pending  
**Priority:** P0  
**Complexity:** M  
**Depends on:** prim-005, prim-008, app-001  
**Standards:** `docs/architecture.md` (all layer descriptions), `brainstorm/build-spec.md` (Section 5: Click Panel Content)

## What

Slide-in panel that opens when user clicks any interactive node or edge in the pipeline diagram.
Uses Framer Motion `AnimatePresence` for enter/exit. Fully HTML (not SVG).

## Files

```
frontend/src/components/primitives/ExplanationPanel.tsx   ← create new
```

## Why

The click interaction is the soul of this explainer. Every curious team member should be able to
click *anything* and get a deep explanation: what is this thing, why does it exist, what does
the data look like here, what are the performance numbers. The panel should feel like opening
an IDE quick-documentation popup — but animated.

## Props interface

```typescript
interface PanelContent {
  id: string;
  title: string;
  subtitle?: string;
  decision?: 'ALLOW' | 'MODIFY' | 'QUEUE' | 'BLOCK';
  accentColor?: string;          // hex, defaults to emerald
  sections: PanelSection[];
}

interface PanelSection {
  heading: string;
  body: string;                  // plain text or markdown-lite (bold with **)
  code?: string;                 // monospace code block
  dataExample?: {
    before: string;
    after: string;
    label?: string;
  };
}

interface ExplanationPanelProps {
  content: PanelContent | null;  // null = closed
  onClose: () => void;
}
```

## Implementation notes

1. Wraps in `<AnimatePresence>` — panel slides from `x: 60` to `x: 0`, fades `opacity: 0→1`
2. Fixed position, right side: `fixed top-0 right-0 h-full w-[420px] z-50`
3. Background: `bg-[#0F1117]/95 backdrop-blur-md`
4. Top accent bar: 4px tall, full width, `background: accentColor` (or decision color)
5. Close button: top-right `×`, fades panel out
6. Keyboard: `Escape` key closes panel
7. `dataExample` section: before/after pill with arrow between them
   - Before: slightly red-tinted bg, monospace font
   - After: teal-tinted bg, monospace font (the token `[MASKED-SSN-001]`)
8. Scrollable if content is tall (overflow-y: auto)
9. `code` block: dark gray bg `#1A202C`, monospace, syntax-highlight keywords in emerald

## Click panel content registry

14 nodes in the pipeline diagram. Their content is documented in `brainstorm/build-spec.md`
Section 5. The panel component itself is generic — content is passed as props from each scene.

## Acceptance criteria

- [ ] Panel slides in from right on `content !== null`
- [ ] `AnimatePresence` ensures smooth exit when closed
- [ ] `Escape` key closes panel
- [ ] `dataExample` before/after renders with arrow
- [ ] `decision` prop shows `DecisionBadge` in panel header
- [ ] Scroll works when content overflows
- [ ] No TypeScript errors
