# scene-004: AutomationScene (KEY SCENE — The QUEUE Moment)

**Status:** pending  
**Priority:** P0  
**Complexity:** L  
**Depends on:** prim-001, prim-002, prim-003, prim-004, prim-005, prim-008  
**Standards:** `docs/architecture.md` (Layer 3: Automation Workflow Controller), `brainstorm/sonnet-analysis.md` (Section 6: Automation), `brainstorm/gpt-analysis.md` (automation DAG)

## What

The most important scene in the explainer. Shows the Automation Workflow Controller governing
an AI claim-processing pipeline. The QUEUE moment fires visually — HTTP 202, human review
dashboard slides in, Sarah approves. $2.8M → $0.

This is the differentiator: not just masking PII, but GOVERNING AI ACTIONS.

## Files

```
frontend/src/components/scenes/AutomationScene.tsx   ← create
frontend/src/data/automation-workflow.ts             ← workflow step definitions
```

## Content structure

### Top: Industry selector tabs
`[Insurance] [Healthcare] [Accounting] [Finance]`
Each tab switches the workflow steps shown below. Start with Insurance.

### Main: Workflow DAG (SVG)

**Insurance claim workflow (7 steps):**

```
[READ_DATA] → [DETECT_PII] → [CALL_LLM] → [GATE_CHECK]
                                                  ↓
                                    ┌─────────────┼─────────────┐
                               [ALLOW]        [QUEUE]        [BLOCK]
                                  ↓               ↓               ↓
                           [SEND_EMAIL]   [REQUIRE_APPROVAL]  [NOTIFY]
                                              ↓
                                       [Human Review Panel]
                                        [Approve] or [Reject]
                                              ↓
                                        [SEND_EMAIL (tokenized)]
```

Each step is a `<WorkflowStep>` node:
- Rectangle, rounded corners, border color = step type color
- Step type label above (small, monospace), action description inside

### Step type colors
| Type | Color | Meaning |
|------|-------|---------|
| READ_DATA | `#2B4C8C` blue | Data pull from connector |
| DETECT_PII | `#6B46C1` purple | Detection cascade |
| CALL_LLM | `#4A5568` gray | AI inference |
| GATE_CHECK | `#ED8936` amber | Policy enforcement |
| WRITE_RECORD | `#276749` green | Governed write |
| SEND_MESSAGE | `#276749` green | Governed send |
| REQUIRE_APPROVAL | `#ED8936` amber + pulse | Human decision |
| BRANCH | `#4A5568` gray | Conditional |
| NOTIFY | `#553C9A` purple | Audit |

### Animation phases

**Phase 0 (0s):** Nodes fade in, edges draw

**Phase 1 (1s):** Data packet traverses READ_DATA → DETECT_PII
- Label: `"claim_78234.json"`, color emerald

**Phase 2 (2s):** DETECT_PII fires — packet turns amber
- PII badge overlays: ICD10, SSN, Name (pop in sequence)

**Phase 3 (3s):** CALL_LLM — packet turns gray (masked text only)
- Node shows tiny text: `"[MASKED-SSN-001] [MASKED-ICD10-002]"`

**Phase 4 (4s):** GATE_CHECK — risk 0.84
- QUEUE branch lights up amber
- REQUIRE_APPROVAL node pulses
- HTTP 202 badge appears

**Phase 5 (5.5s) — THE CLIMAX:**
- Human Review Panel slides in from the right (same animation as ExplanationPanel)
- Shows: Action type, destination, risk score, PII fields, policy rule
- Four buttons: [Approve tokenized] [Approve (expert)] [Request more info] [Reject]
- 2 second pause...
- "Approve tokenized" button clicks (animated highlight)

**Phase 6 (7s):** Resolution
- SEND_EMAIL (tokenized) node glows green
- Packet resumes travel, now green
- NOTIFY/AUDIT fires in parallel
- Counter: `$2.8M → $0` in big type
- Text: `"847 exposures caught. 0 incidents."` 

### Industry switch behavior
When user clicks another industry tab, workflow resets and replays with different steps:
- Healthcare: medication reconciliation (Epic → AI → patient summary)
- Accounting: QuickBooks → AI analysis → CFO report (SSN, revenue masked)
- Finance: trade order → AI risk model → REQUIRE_APPROVAL if large position

## Acceptance criteria

- [ ] Insurance workflow renders with all 7 steps
- [ ] Animation phases play in order
- [ ] REQUIRE_APPROVAL node pulses amber distinctly
- [ ] Human Review Panel slides in at phase 5
- [ ] "Approve tokenized" button animates
- [ ] $2.8M → $0 counter transition
- [ ] Industry tabs switch workflow content
- [ ] No TypeScript errors
