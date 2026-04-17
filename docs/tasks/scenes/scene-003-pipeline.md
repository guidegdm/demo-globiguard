# scene-003: FlowScene (Pipeline — CENTERPIECE)

**Status:** pending  
**Priority:** P0  
**Complexity:** L  
**Depends on:** prim-001, prim-002, prim-003, prim-004, prim-005, prim-008, prim-009, prim-010  
**Standards:** `docs/architecture.md` (Layer 1+2), `brainstorm/build-spec.md` (Section 4: Pipeline), `brainstorm/sonnet-analysis.md` (Section 3: Interactive Pipeline)

## What

The centerpiece. Full-width SVG pipeline showing all 14 nodes connected by animated edges.
Data packets travel left-to-right. Clicking any node opens `<ExplanationPanel>`.
The full journey of Sarah's claim email plays out in phases: receive → detect → tokenize → score → gate → LLM → detokenize → output.

## Files

```
frontend/src/components/scenes/FlowScene.tsx   ← create
frontend/src/data/pipeline-nodes.ts            ← node + edge definitions + click content
```

## The 14 nodes (left to right)

| # | Node ID | Label | Color | Component |
|---|---------|-------|-------|-----------|
| 1 | `data-sources` | Data Sources | `#2D3748` | GlassCard |
| 2 | `mcp-connector` | MCPConnector | `#744210` | GlassCard (amber border) |
| 3 | `go-sidecar` | Go Sidecar :8080 | `#2B4C8C` | GlassCard (blue border) |
| 4 | `regex-layer` | Regex (L1) | `#276749` | GlassCard (green) |
| 5 | `presidio-ner` | Presidio NER (L2) | `#2B4C8C` | GlassCard |
| 6 | `gliner` | GLiNER (L3) | `#6B46C1` | GlassCard (purple) |
| 7 | `risk-scorer` | Risk Scorer | `#9B2C2C` | GlassCard (red) |
| 8 | `gate` | Policy Gate | varies | ShieldGate (state changes) |
| 9 | `tokenizer` | Tokenizer | `#2C7A7B` | GlassCard (teal) |
| 10 | `token-map` | Token Map (Redis) | `#2C7A7B` | GlassCard |
| 11 | `llm` | LLM (masked) | `#4A5568` | GlassCard (dim) |
| 12 | `detokenizer` | Detokenizer | `#2C7A7B` | GlassCard (teal) |
| 13 | `audit-log` | Audit Log | `#553C9A` | GlassCard (purple) |
| 14 | `safe-output` | Safe Output | `#276749` | GlassCard (green) |

## Animation phases (auto-play when in viewport)

**Phase 0 (0s):** All nodes appear (fade in, 0.1s stagger)

**Phase 1 (1s):** Data packet `color='emerald'` travels: data-sources → mcp-connector → go-sidecar
- Label on packet: `"claim_email.json"`

**Phase 2 (2s):** Detection cascade
- Packet arrives at regex-layer. Node pulses. Label changes to `"ICD10:E11.9 detected"`
- 70% of packets exit after Regex (show split: most exit left, few continue to Presidio)
- Packet continues to presidio-ner. Label: `"Sarah Mitchell (PERSON)"`
- Packet continues to gliner (only ~10%). Label: `"Metformin 500mg (MEDICATION)"`
- All merge into risk-scorer. Packet color shifts `emerald → amber`

**Phase 3 (4s):** Risk scoring
- RiskGauge animates 0.00 → 0.84
- Gauge stops in amber zone (QUEUE threshold 0.70–0.89)
- Packet color is now `amber`
- ShieldGate transitions: idle → scanning → queued
- 202 badge appears above shield

**Phase 4 (5s):** Tokenization (parallel with gate hold)
- Three token replacement animations:
  1. `"Sarah Mitchell"` → `[MASKED-PERSON-001]` (green fade)
  2. `"ICD10:E11.9"` → `[MASKED-ICD10-002]` (green fade)
  3. `"547-82-3901"` → `[MASKED-SSN-003]` (green fade)
- Token map node glows (Redis storing the mapping)

**Phase 5 (6s):** Human review resolves to APPROVE
- ShieldGate: queued → allowed (green flash)
- Packet color: `amber → emerald`
- Packet travels: gate → llm (color: `emerald`, label: `"masked only"`)
- LLM node pulses softly
- Packet exits LLM → detokenizer
- Token map glows again (lookup)
- Packet exits detokenizer → audit-log → safe-output
- safe-output node glows bright green

**Phase 6 (8s):** Hold final state, then reset after 2s

## Click panel content (from build-spec.md Section 5)

Content for each of the 14 nodes is in `frontend/src/data/pipeline-nodes.ts`.
This file exports an array of `PanelContent` objects.

See `brainstorm/build-spec.md` lines ~250–450 for the full click text for each node.

## Implementation notes

1. SVG viewBox `"0 0 900 520"`. Nodes arranged in 2 rows (zigzag for detection layers)
2. Phase management: `useState<number>` for phase, driven by `isPlaying` from `useSceneAnimation`
3. `useEffect` with `setTimeout` chain drives phases
4. Click handler on each node: `setOpenPanel(nodeId)` → renders `<ExplanationPanel>`
5. Panel content comes from `pipeline-nodes.ts` data file
6. Node hover: opacity 0.6 → 1.0 (always interactive, even when not animating)
7. RiskGauge mounted inside SVG using `<foreignObject>` (or position absolutely over SVG)

## Acceptance criteria

- [ ] All 14 nodes render in correct positions
- [ ] Animation phases play in order when section in viewport
- [ ] Packets change color at detection and gate phases
- [ ] ShieldGate shows queued state (202 badge visible)
- [ ] Token replacement animation plays in phase 4
- [ ] Clicking any node opens ExplanationPanel with correct content
- [ ] Panel closes on X or Escape
- [ ] Reset and replay every 90s
