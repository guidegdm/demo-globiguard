# widget-001: TokenizationDemo

**Status:** pending  
**Priority:** P1  
**Complexity:** M  
**Depends on:** prim-006 (PIIBadge token variant), app-001  
**Standards:** `docs/architecture.md` (Tokenization section)

## What

Interactive live demo widget embedded in (or below) the FlowScene. User types text,
watches PII get highlighted in real-time, then clicks "Tokenize" to see it masked
field-by-field, then "Restore" to see original values returned.

## Files

```
frontend/src/components/widgets/TokenizationDemo.tsx   ← create
```

## Why

This is the most memorable moment in the explainer. Team members will type their own
SSN or name and watch it disappear into `[MASKED-SSN-001]`. The restoration animation —
watching the token dissolve back to the original — demonstrates that the data isn't lost,
just protected during AI processing.

## User flow

1. Text area shows pre-loaded example:
   ```
   Patient Sarah Mitchell (DOB 03/15/1987) has SSN 547-82-3901.
   Diagnosis: ICD-10 E11.9. Medication: Metformin 500mg.
   ```
2. PII fields highlight in real-time as user edits (regex in-browser, no server needed)
3. Click "Tokenize →" button:
   - Each PII span transforms one at a time (0.3s stagger)
   - `"Sarah Mitchell"` morphs to `[MASKED-PERSON-001]` (teal pill)
   - `"547-82-3901"` morphs to `[MASKED-SSN-002]` (teal pill)
   - etc.
   - Token registry appears on the right: key→value mapping
4. Click "← Restore" button:
   - Tokens morph back to original values
   - Registry fades

## Implementation notes

1. PII detection: client-side regex only (for demo, not production rules)
   Patterns:
   - SSN: `\b\d{3}-\d{2}-\d{4}\b`
   - ICD-10: `\b[A-Z]\d{2}\.?\d?\b`
   - Person name: `\b[A-Z][a-z]+ [A-Z][a-z]+\b`
   - DOB: `\b\d{2}\/\d{2}\/\d{4}\b`
   - Medication: `\b(Metformin|Lisinopril|Atorvastatin|Insulin|Warfarin)\b`

2. Tokenization animation: Framer Motion `layoutId` + `AnimatePresence`
   - Original span has `layoutId={fieldId}`
   - Token span has same `layoutId` — Framer Motion auto-animates the morphing

3. Token registry: right side panel, rows fade in as tokens appear
   Format: `MASKED-SSN-001 → (hidden during AI processing) → 547-82-3901`

4. Textarea is contentEditable with controlled span insertion for PII highlighting

## Acceptance criteria

- [ ] PII highlights in real-time as user types
- [ ] Tokenize button morphs spans to tokens with stagger
- [ ] Token registry appears with each tokenization
- [ ] Restore button morphs tokens back
- [ ] Works with user-edited text (not just pre-loaded example)
