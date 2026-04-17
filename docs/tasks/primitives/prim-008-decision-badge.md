# prim-008: DecisionBadge

**Status:** pending  
**Priority:** P0  
**Complexity:** S  
**Depends on:** app-001  
**Standards:** `docs/architecture.md` (Layer 2: Policy Gate — color table)

## What

New component (not from globiguard). A pure HTML+CSS badge for displaying gate decisions:
ALLOW / MODIFY / QUEUE / BLOCK. Used in panels, cards, and explanation drawers.

## Files

```
frontend/src/components/primitives/DecisionBadge.tsx   ← create new
```

## Why

Every explanation panel and workflow step needs to show the gate decision prominently.
This badge is reused across scenes. It must be unmissable: large, colored, glowing slightly.

## Implementation notes

```typescript
type Decision = 'ALLOW' | 'MODIFY' | 'QUEUE' | 'BLOCK';

const CONFIG = {
  ALLOW:  { color: '#38A169', bg: 'rgba(56,161,105,0.15)',  icon: '✓' },
  MODIFY: { color: '#ECC94B', bg: 'rgba(236,201,75,0.15)',  icon: '≈' },
  QUEUE:  { color: '#ED8936', bg: 'rgba(237,137,54,0.15)',  icon: '⏸' },
  BLOCK:  { color: '#E53E3E', bg: 'rgba(229,62,62,0.15)',   icon: '✗' },
};
```

Rendered as `<span>`:
- Background: `CONFIG[decision].bg`
- Border: `1px solid CONFIG[decision].color` with 60% opacity
- Text: `CONFIG[decision].color`, uppercase, monospace, letter-spacing 0.1em
- Box shadow: `0 0 8px CONFIG[decision].color` at 30% opacity (subtle glow)
- Padding: `2px 10px`
- Variants via `size` prop: `'sm' | 'md' | 'lg'` (font-size `10 | 12 | 14`px)

Optionally show HTTP code below decision via `showHttp?: boolean`:
- ALLOW → 200, MODIFY → 200, QUEUE → 202, BLOCK → 403
- Small `HTTP {code}` text beneath badge

## Acceptance criteria

- [ ] All 4 decisions render with correct colors and icons
- [ ] `showHttp=true` shows HTTP status code below
- [ ] No TypeScript errors
