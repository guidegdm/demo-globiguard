# app-001: index.css — Design Tokens + Tailwind Base

**Status:** pending  
**Priority:** P0  
**Complexity:** S  
**Depends on:** (none — do first)  
**Standards:** `docs/animations.md` (Color system section), `brainstorm/build-spec.md` (Section 3)

## What

Define all CSS custom properties (design tokens) and base styles in `frontend/src/index.css`.
This is the first file to update — everything else depends on these tokens.

## Files

```
frontend/src/index.css   ← update (already exists, add to it)
```

## All tokens to define

```css
@import "tailwindcss";

:root {
  /* Base */
  --bg-base:    #0F1117;
  --bg-surface: #1A1D2E;
  --bg-card:    rgba(255,255,255,0.04);

  /* Decision states */
  --allow:  #38A169;
  --modify: #ECC94B;
  --queue:  #ED8936;
  --block:  #E53E3E;

  /* Accent */
  --accent:        #10b981;
  --accent-dim:    rgba(16,185,129,0.15);
  --accent-glow:   0 0 24px rgba(16,185,129,0.3);

  /* Architecture planes */
  --plane-coord:    #0d0f1a;
  --plane-enforce:  #0d1a0d;

  /* Pipeline node colors */
  --node-connector: #744210;
  --node-sidecar:   #2B4C8C;
  --node-regex:     #276749;
  --node-presidio:  #2B4C8C;
  --node-gliner:    #6B46C1;
  --node-scorer:    #9B2C2C;
  --node-gate:      #C05621;
  --node-tokenmap:  #2C7A7B;
  --node-llm:       #4A5568;
  --node-audit:     #553C9A;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

body {
  background: var(--bg-base);
  color: rgba(255,255,255,0.87);
  font-family: var(--font-sans);
  overflow-x: hidden;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }

/* Section scroll snapping (optional) */
.scroll-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Token pill */
.token-pill {
  display: inline-flex;
  align-items: center;
  background: rgba(44,122,123,0.2);
  border: 1px solid rgba(44,122,123,0.6);
  border-radius: 4px;
  padding: 1px 8px;
  font-family: var(--font-mono);
  font-size: 0.8em;
  color: #68D391;
}
```

## Acceptance criteria

- [ ] All CSS custom properties defined
- [ ] Body has dark base background
- [ ] Tailwind v4 import works (`@import "tailwindcss"`)
- [ ] Custom scrollbar styles applied
- [ ] `.token-pill` class renders correctly
