# GlobiGuard Demo — Detailed Build Spec

## The Product (complete picture)
GlobiGuard = Universal AI safety layer. NOT one feature — ALL of these simultaneously:
- Guard & Mask: intercept AI prompts/responses, detect + mask PII (40+ types) before the model sees it
- Policy Engine: smart rules — IF action THEN block / allow / modify / queue-for-human
- Flow Monitor: watches multi-step AI agent workflows in real-time, flags anomalies
- Compliance Trail: every decision timestamped, tamper-evident, mapped to HIPAA/GDPR/SOC2/EU AI Act
- Token Manager: reversible pseudonymization — "John Smith" → TOKEN_7823, reversible only by GlobiGuard

n8n node metaphor: plug in (AI model + tools + data pool) → GlobiGuard controls what AI sees and does

## Two Acts in One Scroll
Act 1 — Emotional/Visual (sections 1-3): Apple-like, makes you FEEL the product
Act 2 — Technical/Depth (sections 4-7): architecture, flows, integration for devs

## "2D" Animations (going beyond the 1.5D reference)
- 3D card tilt on hover: perspective(600px) rotateX/Y with mouse tracking
- SVG bezier paths draw themselves on scroll entry (stroke-dashoffset: total → 0)
- Data packets travel along SVG offset-paths
- Orbit animation: AI model badges elliptically orbit center node in hero
- Character-level PII masking: individual chars swap from red to green [TOKEN]
- Clip-path reveal for section headers
- Living node: GlobiGuard center node breathes (scale 1→1.02→1 loop)
- AnimatePresence mode="popLayout" for activity feed (reference LiveMetricsAnimation)
- Perspective depth layers: background moves slower than foreground on scroll

## Section Specs

### Section 1: HERO
- min-h-screen, grid-background, 3x floating orbs (animate-float-slow/medium)
- Badge: "AI GOVERNANCE MIDDLEWARE"
- H1: "Any AI. Zero Risk." + "Full Control." on separate line with gradient text
- Subtext: "GlobiGuard sits between your AI and everything it can touch — guarding data, enforcing policy, logging every decision in real time."
- Mini orbit diagram (pure CSS): central "GG" hexagon badge, 4 AI model badges orbit it (GPT-4, Claude, Gemini, Llama) using CSS animation: transform rotate+translate+rotate-back trick
- Code card below (gradient-border, shine-effect): typing animation with colored syntax tokens (reference Hero.tsx codeLines pattern EXACTLY — import GlobiGuard, new GlobiGuard, guard.evaluate, result.allowed check)
- Stats row: <3ms latency · 40+ PII types · 14 frameworks

### Section 2: PROBLEM
- section-divider at top
- H2: "AI is operating inside your business. Nobody is governing it."
- 3 cards (grid-cols-1 md:grid-cols-3): StaggerContainer + StaggerItem
- Each card: red icon box, title, description, border-t with big red stat
  Card 1: No governance — "Your AI has access to everything. No one defined what it's allowed to do."
  Card 2: Zero delay — "AI executes in milliseconds. By the time you see it, data already moved."
  Card 3: $4.45M — "Average cost of a data breach. The AI is not responsible. You are."
- Below cards: a "before/after" visual strip — LEFT: AI agent + red "unguarded" flows leaking data, RIGHT: same agent + GlobiGuard + green "controlled" flows. CSS clip-path split animation.

### Section 3: THE NODE (Centerpiece)
Full-width section. Title: "The Control Plane" + description.
Layout: The interactive diagram fills the section width.

SVG DIAGRAM LAYOUT:
  Left zone: AI models + Data pools (input nodes)
  Center: GlobiGuard rectangle (gradient-border styled)
  Right zone: Tools + Compliance outputs

AI Model pills (left, top group): GPT-4o · Claude 3.5 · Gemini 1.5 · Llama 3 · Custom
Data Pool pills (left, bottom group): CRM · EHR · Legal Docs · Files · REST APIs

GlobiGuard center box (5 layered rows inside):
  Row 1: 🔒 Guard & Mask  [pulse animation when data flows through]
  Row 2: 📋 Policy Engine
  Row 3: 👁️ Flow Monitor
  Row 4: 📊 Compliance Trail
  Row 5: 🔑 Token Manager
  Center box breathes: scale 1.0 → 1.01 → 1.0, 3s loop

Tool output pills (right, top): Web Search ✓ · Database ✓ · Code Exec ✗ · Email ~ · HTTP ✓
Compliance output (right, bottom): HIPAA ✓ · GDPR ✓ · SOC2 ✓ · EU AI Act ✓

SVG PATHS connecting left nodes to center left edge, center right edge to right nodes.
Cubic bezier paths: from (nodeX, nodeY) curves to (centerLeftX, middleY)
Paths draw themselves on scroll: strokeDashoffset from totalLength to 0, duration 1.2s staggered

DATA PACKETS along paths:
  Small emerald circles travel from left→center (input flow): repeat every 2.5s
  Small circles travel from center→right (output flow): emerald=allowed, red=blocked, amber=modified
  Use CSS offset-path with the SVG path d attribute OR framer-motion keyframes interpolating 5 waypoints

INTERACTIVITY:
  Click AI model pill → it glows, a tooltip shows supported models list, its connection line brightens
  Click tool pill → shows a decision badge (ALLOW/BLOCK/MODIFY) with reason
  Click capability row inside node → it expands with a one-line description
  Click data pool → shows "PII scan activated" message

### Section 4: CAPABILITIES
Tab-based: 5 tabs across the top (pill style, framer-motion layoutId sliding indicator)
Each tab = left text panel + right interactive visual

Tab 1 - Guard & Mask:
  Right visual: a "prompt" card showing raw text with PII highlighted
  Raw: "Patient John Smith (SSN: 123-45-6789, DOB: 1990-01-15) needs prescription review"
  Animation: every 3s, PII spans pulse red, then flip to green [TOKEN_7823], [GG-4b2c], [BLOCKED]
  Below: "3 fields tokenized · SSN blocked · 2ms"

Tab 2 - Policy Engine:
  Right visual: a YAML policy card (gradient-border, code font)
  Live evaluation: below the policy, an "incoming action" card slides in, the policy evaluates (typing line by line), then a DECISION badge appears (BLOCK / ALLOW / QUEUE)
  Show 3 different incoming actions cycling every 4s with different decisions

Tab 3 - Flow Monitor:
  Right visual: a 4-step agent workflow vertical diagram
  Steps: [Fetch data] → [Analyze records] → [Write CRM] → [Send email]
  Each step has a status icon: ✓ ✓ ⚠️ ✗
  Step 3 pulses amber: "Action outside approved scope · Queued for review"
  Step 4 blocked: "Contains PII in external destination · Blocked"
  Animate the status icons appearing one by one

Tab 4 - Compliance Trail:
  Use reference ComplianceSection pattern: score rings (HIPAA 94%, SOC2 86%, GDPR 84%)
  Plus live enforcement feed (AnimatePresence popLayout, cycling entries like LiveMetricsAnimation)
  Framework badges row at bottom

Tab 5 - Token Manager:
  Right visual: split card (left=ENCODE, right=DECODE) with GlobiGuard badge in middle
  ENCODE side: shows real data fields with values
  DECODE side: shows tokenized fields with [GG-xxx] tokens
  Arrow animation between sides: packet travels left→center→right
  Below: "Reversible only by GlobiGuard · AES-256 · Zero-knowledge"

### Section 5: HOW IT WORKS
Reference DataFlowAnimation pattern EXACTLY but with 6 stages (not 5):
  Stage 1: AI Request (yellow) - "Your agent calls an action"
  Stage 2: Input Guard (blue) - "~1ms · PII scan + context check"
  Stage 3: Policy Engine (purple) - "~1ms · Rules evaluated"
  Stage 4: AI Model (emerald) - "Sanitized prompt only"
  Stage 5: Output Guard (cyan) - "~1ms · Response filter"
  Stage 6: Audit Log (emerald) - "Every decision recorded"

Connector between each stage: DataPacket dots traveling (reference DataPacket component pattern)
PIIOverlay above Stage 2 (reference PIIFragment pattern)
3 animated counters below: 1.2M+ requests · 99.7% accuracy · <3ms latency

### Section 6: INTEGRATION
Tab bar (8 tabs, layoutId sliding bg): TypeScript · Python · Express · cURL · Docker · K8s · Policy · OpenAI SDK
Code blocks (gradient-border, macOS chrome title bar, syntax colored spans)
AnimatePresence mode="wait" on tab switch

PLUS below the code: 3 deployment model cards
  Cloud Native: "Deploy as API gateway middleware. AWS/GCP/Azure."
  Self-Hosted: "Docker image. Your data never leaves."
  K8s Sidecar: "Container per pod. Zero config mesh."
  Hybrid: "On-prem evaluation + cloud dashboard."

### Section 7: VISION
Large dramatic closing. Ambient orbs (bigger, more dramatic).
Badge: "THE MISSION"
H2: "Enable every team to use any AI — without risk, without compromise."
Subtext: "Any frontier model. Your rules. Your data stays yours. Full audit trail. Zero friction."
3 principle cards: Any Model · Your Rules · Zero Data Leaks
Closing emerald glow line + grid fade

## Design System
Same as reference globiguard/frontend - oklch colors, gradient-border, grid-background, etc.
Easing [0.21, 0.47, 0.32, 0.98] everywhere.

## File Structure
Delete: frontend/src/components/scenes/ (all old scene files)
Create:
  frontend/src/index.css (full overhaul)
  frontend/src/components/shared/ScrollReveal.tsx
  frontend/src/components/sections/HeroSection.tsx
  frontend/src/components/sections/ProblemSection.tsx
  frontend/src/components/sections/NodeSection.tsx
  frontend/src/components/sections/CapabilitiesSection.tsx
  frontend/src/components/sections/HowItWorksSection.tsx
  frontend/src/components/sections/IntegrationSection.tsx
  frontend/src/components/sections/VisionSection.tsx
  frontend/src/components/widgets/SectionNav.tsx (updated)
  frontend/src/App.tsx (rewired)
