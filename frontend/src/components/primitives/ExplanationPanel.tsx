import { useEffect, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DecisionBadge } from './DecisionBadge';

/* ─── types ────────────────────────────────────────────────────────── */

type Decision = 'ALLOW' | 'MODIFY' | 'QUEUE' | 'BLOCK';

interface DataExample {
  before: string;
  after:  string;
  label?: string;
}

interface PanelSection {
  heading: string;
  body?:   string;
  code?:   string;
  dataExample?: DataExample;
}

interface ExplanationPanelProps {
  open:         boolean;
  onClose:      () => void;
  title:        string;
  subtitle?:    string;
  decision?:    Decision;
  accentColor?: string;
  sections:     PanelSection[];
}

/* ─── helpers ─────────────────────────────────────────────────────── */

function highlight(code: string): string {
  return code
    .replace(/(\/\/[^\n]*)/g,                 '<span style="color:#718096">$1</span>')
    .replace(/\b(const|let|var|return|if|else|function|async|await|true|false)\b/g,
             '<span style="color:#10B981">$1</span>')
    .replace(/"([^"]*)"/g,                    '<span style="color:#ECC94B">"$1"</span>')
    .replace(/\b(\d+\.?\d*)\b/g,              '<span style="color:#ED8936">$1</span>');
}

/* ─── component ────────────────────────────────────────────────────── */

export function ExplanationPanel({
  open,
  onClose,
  title,
  subtitle,
  decision,
  accentColor = '#10B981',
  sections,
}: ExplanationPanelProps) {
  // Escape key closes panel
  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const accent = decision
    ? { ALLOW: '#38A169', MODIFY: '#ECC94B', QUEUE: '#ED8936', BLOCK: '#E53E3E' }[decision]
    : accentColor;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden"
            style={{
              width: 'min(420px, 95vw)',
              background: 'rgba(13,15,20,0.97)',
              borderLeft: `1px solid ${accent}33`,
              boxShadow: `-8px 0 40px rgba(0,0,0,0.6)`,
            }}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0,  opacity: 1 }}
            exit={{ x: 60,  opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />

            {/* Header */}
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold leading-tight text-white/95 truncate">{title}</h2>
                  {subtitle && (
                    <p className="mt-0.5 text-xs text-white/50">{subtitle}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {decision && (
                    <DecisionBadge decision={decision} size="sm" showHttp />
                  )}
                  <button
                    onClick={onClose}
                    onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => e.key === 'Enter' && onClose()}
                    aria-label="Close panel"
                    className="text-white/40 hover:text-white/80 transition-colors rounded-full w-7 h-7 flex items-center justify-center text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {sections.map((sec, i) => (
                <div key={i}>
                  <h3
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: accent }}
                  >
                    {sec.heading}
                  </h3>

                  {sec.body && (
                    <p className="text-sm text-white/70 leading-relaxed">{sec.body}</p>
                  )}

                  {sec.dataExample && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span
                        className="font-mono text-xs px-2.5 py-1 rounded-full border"
                        style={{
                          background: 'rgba(229,62,62,0.12)',
                          borderColor: '#E53E3E66',
                          color: '#E53E3E',
                        }}
                      >
                        {sec.dataExample.before}
                      </span>
                      <span className="text-white/30 text-base">→</span>
                      <span
                        className="font-mono text-xs px-2.5 py-1 rounded-full border"
                        style={{
                          background: 'rgba(16,185,129,0.12)',
                          borderColor: '#10B98166',
                          color: '#10B981',
                        }}
                      >
                        {sec.dataExample.after}
                      </span>
                      {sec.dataExample.label && (
                        <span className="text-xs text-white/40">{sec.dataExample.label}</span>
                      )}
                    </div>
                  )}

                  {sec.code && (
                    <pre
                      className="mt-2 rounded-lg p-3 text-xs leading-relaxed overflow-x-auto"
                      style={{
                        background: '#1A202C',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.8)',
                        fontFamily: 'ui-monospace, monospace',
                      }}
                      dangerouslySetInnerHTML={{ __html: highlight(sec.code) }}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
