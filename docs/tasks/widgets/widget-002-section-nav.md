# widget-002: SectionNav

**Status:** pending  
**Priority:** P1  
**Complexity:** S  
**Depends on:** app-001  
**Standards:** —

## What

Fixed right-side vertical dot navigation. 6 dots for 6 sections. Active dot is filled
and glowing. Clicking a dot smooth-scrolls to that section.

## Files

```
frontend/src/components/widgets/SectionNav.tsx   ← create
```

## Implementation notes

1. Fixed position: `fixed right-6 top-1/2 -translate-y-1/2 z-40`
2. 6 dots, 8px circle each, spaced 20px apart vertically
3. Inactive: `border: 1px solid rgba(255,255,255,0.3)`, transparent fill
4. Active: `background: #10b981`, `box-shadow: 0 0 8px #10b981`
5. Tooltip on hover: section name appears to the left of the dot
6. Clicks call `element.scrollIntoView({ behavior: 'smooth' })`
7. IntersectionObserver watches each section to determine active dot

## Section labels

```typescript
const SECTIONS = [
  { id: 'hero',       label: 'What is GlobiGuard?' },
  { id: 'problem',    label: 'The Problem'          },
  { id: 'pipeline',   label: 'How It Works'         },
  { id: 'automation', label: 'Automation Layer'     },
  { id: 'architecture', label: 'Architecture'       },
  { id: 'compliance', label: 'Compliance'           },
];
```

## Acceptance criteria

- [ ] 6 dots render on right side
- [ ] Active dot glows emerald
- [ ] Hover shows section label tooltip
- [ ] Click smooth-scrolls to correct section
- [ ] Updates active dot on scroll
