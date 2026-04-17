# prim-006: PIIBadge + StatusIndicator + AnimatedCounter

**Status:** pending  
**Priority:** P1  
**Complexity:** S  
**Depends on:** prim-001  
**Standards:** `docs/animations.md` (PIIBadge section)

## What

Port three small utility components from globiguard. Minor improvements only — these are
good as-is from the source.

**Sources:**
- `D:\Dev\AI\globiguard\frontend\src\components\landing\animations\PIIBadge.tsx`
- `D:\Dev\AI\globiguard\frontend\src\components\landing\animations\StatusIndicator.tsx`
- `D:\Dev\AI\globiguard\frontend\src\components\landing\animations\AnimatedCounter.tsx`

## Files

```
frontend/src/components/primitives/PIIBadge.tsx          ← port + improve
frontend/src/components/primitives/StatusIndicator.tsx   ← port + add QUEUED
frontend/src/components/primitives/AnimatedCounter.tsx   ← port + add prefix/suffix
```

## Implementation notes

### PIIBadge.tsx
1. Remove `'use client'`
2. Add `variant: 'token'` — renders `[MASKED-SSN-001]` pill format
   - Different style: monospace font, teal border (`#2C7A7B`), code-like padding
3. Add tier color coding via `tier` prop: `'blocked' | 'confidential' | 'restricted'`
   - `blocked`: red background — field was blocked entirely
   - `confidential`: amber — field masked, PII class is sensitive health/SSN
   - `restricted`: yellow — field masked, moderately sensitive

### StatusIndicator.tsx
1. Remove `'use client'`
2. Add `status: 'QUEUED'` alongside existing ALLOWED/BLOCKED/MASKED
   - Color: `#ED8936` amber
   - Icon: hourglass or clock symbol
   - Dot pulse: slower 1.8s period

### AnimatedCounter.tsx
1. Remove `'use client'`
2. Add `prefix?: string` (e.g. `"$"` for dollar amounts, `"~"` for approximates)
3. Add `suffix?: string` (e.g. `"ms"` for latency, `"K"` for thousands)
4. Keep existing `value`, `duration`, `formatter` props

## Acceptance criteria

- [ ] PIIBadge renders `variant='token'` in teal pill style
- [ ] StatusIndicator renders QUEUED with amber dot at 1.8s pulse
- [ ] AnimatedCounter shows `$2.8M` with `prefix="$"`, `suffix="M"`
- [ ] No TypeScript errors, no `'use client'`
