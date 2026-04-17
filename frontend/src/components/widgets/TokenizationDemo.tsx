import { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── PII Detection ──────────────────────────────────────────────── */

const PII_PATTERNS = [
  { regex: /\b\d{3}-\d{2}-\d{4}\b/g,                                        type: 'SSN',    color: '#E53E3E' },
  { regex: /\b[A-Z]\d{2}\.?\d{0,2}\b/g,                                     type: 'ICD10',  color: '#ED8936' },
  { regex: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,                                  type: 'PERSON', color: '#9B59B6' },
  { regex: /\b\d{2}\/\d{2}\/\d{4}\b/g,                                      type: 'DOB',    color: '#E67E22' },
  { regex: /\b(Metformin|Lisinopril|Atorvastatin|Insulin|Warfarin)\b/g,      type: 'MED',    color: '#3498DB' },
] as const;

const DEFAULT_TEXT =
  'Patient Sarah Mitchell (DOB 03/15/1987) has SSN 547-82-3901.\nDiagnosis: ICD-10 E11.9. Medication: Metformin 500mg.';

/* ─── Types ──────────────────────────────────────────────────────── */

interface Segment {
  id: string;
  type: 'text' | 'pii';
  content: string;
  token?: string;
  piiType?: string;
  color?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function detectSegments(text: string): Segment[] {
  // Collect all matches with their positions
  type Match = { start: number; end: number; content: string; piiType: string; color: string };
  const matches: Match[] = [];

  for (const { regex, type, color } of PII_PATTERNS) {
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      // Check no overlap with existing matches
      const start = m.index;
      const end = start + m[0].length;
      if (!matches.some((x) => start < x.end && end > x.start)) {
        matches.push({ start, end, content: m[0], piiType: type, color });
      }
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;
  let piiCounter = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      segments.push({ id: `text-${cursor}`, type: 'text', content: text.slice(cursor, match.start) });
    }
    const idx = piiCounter++;
    segments.push({
      id: `pii-${idx}`,
      type: 'pii',
      content: match.content,
      token: `[MASKED-${match.piiType}-${String(idx + 1).padStart(3, '0')}]`,
      piiType: match.piiType,
      color: match.color,
    });
    cursor = match.end;
  }
  if (cursor < text.length) {
    segments.push({ id: `text-${cursor}`, type: 'text', content: text.slice(cursor) });
  }
  return segments;
}

/* ─── Component ──────────────────────────────────────────────────── */

export function TokenizationDemo() {
  const uid = useId();
  const [text, setText] = useState(DEFAULT_TEXT);
  const [segments, setSegments] = useState<Segment[]>(() => detectSegments(DEFAULT_TEXT));
  const [tokenized, setTokenized] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(DEFAULT_TEXT);

  useEffect(() => {
    setSegments(detectSegments(text));
    setTokenized(false);
  }, [text]);

  const piiSegments = segments.filter((s) => s.type === 'pii');

  const handleApplyEdit = () => {
    setText(draftText);
    setEditing(false);
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(15,17,23,0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold" style={{ color: '#10B981' }}>
          Tokenization Demo
        </h3>
        <div className="flex gap-2">
          {!editing && (
            <button
              onClick={() => { setEditing(true); setDraftText(text); }}
              className="rounded px-3 py-1 text-xs font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
            >
              Edit
            </button>
          )}
          {editing && (
            <button
              onClick={handleApplyEdit}
              className="rounded px-3 py-1 text-xs font-medium transition-colors"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              Apply
            </button>
          )}
          {!editing && !tokenized && piiSegments.length > 0 && (
            <button
              onClick={() => setTokenized(true)}
              className="rounded px-3 py-1 text-xs font-medium transition-colors"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              Tokenize →
            </button>
          )}
          {!editing && tokenized && (
            <button
              onClick={() => setTokenized(false)}
              className="rounded px-3 py-1 text-xs font-medium transition-colors"
              style={{ background: 'rgba(229,62,62,0.12)', color: '#E53E3E', border: '1px solid rgba(229,62,62,0.3)' }}
            >
              ← Restore
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Left: text display */}
        <div className="flex-1 min-w-0 p-4 border-b md:border-b-0 md:border-r border-white/[0.06]">
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Input Text</div>
          {editing ? (
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={5}
              className="w-full resize-none rounded bg-black/30 p-3 text-sm outline-none"
              style={{
                fontFamily: 'monospace',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            />
          ) : (
            <div
              style={{
                fontFamily: 'monospace',
                lineHeight: 1.8,
                padding: '16px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                minHeight: '80px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {segments.map((seg) => {
                if (seg.type === 'text') {
                  return <span key={seg.id}>{seg.content}</span>;
                }
                const piiIdx = piiSegments.indexOf(seg);
                const staggerDelay = tokenized ? piiIdx * 0.15 : 0;
                return (
                  <AnimatePresence mode="wait" key={`${uid}-${seg.id}`}>
                    {tokenized ? (
                      <motion.span
                        key="token"
                        className="token-pill"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.25, delay: staggerDelay }}
                      >
                        {seg.token}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="raw"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          color: seg.color,
                          background: `${seg.color}1e`,
                          borderRadius: '4px',
                          padding: '1px 6px',
                        }}
                      >
                        {seg.content}
                      </motion.span>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: token registry */}
        <div className="w-full md:w-64 shrink-0 p-4">
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Token Registry</div>
          <div className="space-y-1">
            <AnimatePresence>
              {tokenized
                ? piiSegments.map((seg, i) => (
                    <motion.div
                      key={seg.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.25, delay: i * 0.12 }}
                      className="rounded p-2 text-xs"
                      style={{ background: 'rgba(44,122,123,0.1)', border: '1px solid rgba(44,122,123,0.25)' }}
                    >
                      <div className="font-mono text-teal-400">{seg.token}</div>
                      <div className="text-white/40 text-[10px] mt-0.5">protecting during AI processing</div>
                      <div className="font-mono mt-0.5" style={{ color: seg.color }}>
                        {seg.content}
                      </div>
                    </motion.div>
                  ))
                : piiSegments.length > 0
                ? piiSegments.map((seg) => (
                    <motion.div
                      key={`hint-${seg.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded px-2 py-1 text-xs"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <span style={{ color: seg.color }}>{seg.piiType}</span>
                      <span className="text-white/30 ml-1">detected</span>
                    </motion.div>
                  ))
                : (
                  <div className="text-xs text-white/25">No PII detected</div>
                )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
