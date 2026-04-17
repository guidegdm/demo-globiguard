import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneAnimation } from '@/components/primitives/SceneWrapper';

/* ─── Framework data ─────────────────────────────────────────────── */

interface Framework {
  abbr: string;
  name: string;
  penalty: string;
  controls: string;
  category: 'certifies' | 'evidence';
}

const FRAMEWORKS_A: Framework[] = [
  { abbr: 'HIPAA',        name: 'Health Insurance Portability & Accountability Act', penalty: '$50K/incident',       controls: 'PHI detection, audit log',          category: 'certifies' },
  { abbr: 'GDPR',         name: 'General Data Protection Regulation',               penalty: '4% global revenue',   controls: 'Right-to-forget, consent',          category: 'certifies' },
  { abbr: 'GLBA',         name: 'Gramm-Leach-Bliley Act',                           penalty: '$100K/violation',     controls: 'NPI tokenization',                  category: 'certifies' },
  { abbr: 'CCPA/CPRA',    name: 'CA Consumer Privacy Act',                          penalty: '$7.5K/intentional',   controls: 'Consumer data map',                 category: 'certifies' },
  { abbr: 'NIST CSF 2.0', name: 'NIST Cybersecurity Framework',                     penalty: '—',                   controls: 'Detect/Respond functions',           category: 'certifies' },
  { abbr: 'NIST AI RMF',  name: 'NIST AI Risk Management Framework',                penalty: '—',                   controls: 'GOVERN/MAP/MEASURE/MANAGE',          category: 'certifies' },
  { abbr: 'EU AI Act',    name: 'EU Artificial Intelligence Act',                    penalty: '€30M or 6%',          controls: 'High-risk AI controls',             category: 'certifies' },
  { abbr: 'ISO 42001',    name: 'AI Management System Standard',                    penalty: '—',                   controls: 'AI governance system',              category: 'certifies' },
];

const FRAMEWORKS_B: Framework[] = [
  { abbr: 'SOC 2',         name: 'Service Organization Control 2',           penalty: 'Audit evidence',       controls: 'Trust service criteria mapping',     category: 'evidence' },
  { abbr: 'ISO 27001',     name: 'Information Security Management',          penalty: 'Risk treatment records', controls: 'Risk treatment records',           category: 'evidence' },
  { abbr: 'HITRUST CSF',   name: 'Health Information Trust Alliance',        penalty: 'Healthcare AI controls', controls: 'Healthcare AI controls',           category: 'evidence' },
  { abbr: 'PCI DSS v4.0',  name: 'Payment Card Industry Data Security Std', penalty: 'Cardholder tokenization', controls: 'Cardholder data tokenization',   category: 'evidence' },
];

/* ─── Log data ───────────────────────────────────────────────────── */

interface LogEntry {
  id: number;
  time: string;
  decision: string;
  framework: string;
  industry: string;
  action: string;
  risk: number;
}

const LOG_TEMPLATES = [
  { decision: 'MODIFY', framework: 'HIPAA §164.514',    industry: 'healthcare',  action: 'PHI in Salesforce query',         risk: 0.45 },
  { decision: 'ALLOW',  framework: '—',                 industry: 'accounting',  action: 'QuickBooks report (clean)',        risk: 0.18 },
  { decision: 'QUEUE',  framework: 'GDPR Art.9',        industry: 'insurance',   action: 'Health data via Gmail',            risk: 0.84 },
  { decision: 'BLOCK',  framework: 'PCI DSS §3.4',      industry: 'finance',     action: 'Raw PAN to external API',          risk: 0.97 },
  { decision: 'MODIFY', framework: 'GLBA §501',         industry: 'banking',     action: 'SSN in email draft',              risk: 0.38 },
  { decision: 'ALLOW',  framework: '—',                 industry: 'finance',     action: 'Masked trade order approved',      risk: 0.12 },
  { decision: 'BLOCK',  framework: 'HIPAA §164.502',    industry: 'healthcare',  action: 'Diagnosis in Slack message',       risk: 0.91 },
  { decision: 'QUEUE',  framework: 'EU AI Act Art.13',  industry: 'insurance',   action: 'High-risk AI recommendation',     risk: 0.78 },
] as const;

const DECISION_COLORS: Record<string, string> = {
  ALLOW:  '#38A169',
  MODIFY: '#ECC94B',
  QUEUE:  '#ED8936',
  BLOCK:  '#E53E3E',
};

let logCounter = 0;

function makeLogEntry(): LogEntry {
  const tpl = LOG_TEMPLATES[logCounter % LOG_TEMPLATES.length];
  logCounter++;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return { id: logCounter, time, ...tpl };
}

/* ─── Badge component ────────────────────────────────────────────── */

function FrameworkBadge({ fw, isHovered, onHover, onLeave }: {
  fw: Framework;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const isCert = fw.category === 'certifies';
  const borderColor  = isCert ? 'rgba(56,161,105,0.45)'  : 'rgba(237,137,54,0.45)';
  const glowColor    = isCert ? 'rgba(56,161,105,0.4)'   : 'rgba(237,137,54,0.4)';
  const accentColor  = isCert ? '#68D391'                 : '#ED8936';
  const labelText    = isCert ? 'GG CERTIFIES'            : 'EVIDENCE LAYER';

  return (
    <motion.div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg p-3 cursor-default"
      style={{
        background: 'rgba(15,17,23,0.9)',
        border: `1px solid ${isHovered ? borderColor.replace('0.45', '0.7') : borderColor}`,
        boxShadow: isHovered ? `0 0 12px ${glowColor}` : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <div className="text-lg font-bold font-mono leading-none" style={{ color: accentColor }}>
        {fw.abbr}
      </div>
      <div className="mt-1 text-[10px] leading-tight text-white/50">
        {fw.name}
      </div>
      {isHovered ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-1.5 text-[10px] leading-relaxed"
          style={{ color: accentColor }}
        >
          {fw.controls}
        </motion.div>
      ) : (
        <div className="mt-1.5 text-[9px] text-white/30">{fw.penalty}</div>
      )}
      <div className="mt-1.5 text-[8px] font-semibold tracking-widest" style={{ color: `${accentColor}88` }}>
        {labelText}
      </div>
    </motion.div>
  );
}

/* ─── ComplianceScene ────────────────────────────────────────────── */

export function ComplianceScene() {
  const { ref, isPlaying, epoch } = useSceneAnimation();
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [logEntries, setLogEntries] = useState<LogEntry[]>(() =>
    Array.from({ length: 4 }, () => makeLogEntry()),
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addEntry = useCallback(() => {
    setLogEntries((prev) => {
      const next = [makeLogEntry(), ...prev];
      return next.slice(0, 8);
    });
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isPlaying) {
      intervalRef.current = setInterval(addEntry, 2000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, epoch, addEntry]);

  return (
    <section id="compliance" className="scroll-section py-20 px-4" style={{ background: '#0F1117' }}>
      <div ref={ref} className="mx-auto max-w-5xl">

        {/* Header */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            12 Compliance Frameworks, One Enforcement Layer
          </h2>
          <p className="mt-3 text-white/50">
            GlobiGuard doesn&apos;t just help you comply — it proves you comply.
          </p>
        </motion.div>

        {/* Category A */}
        <div className="mb-2 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#68D391' }}>
            GG CERTIFIES
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(56,161,105,0.25)' }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {FRAMEWORKS_A.map((fw) => (
            <FrameworkBadge
              key={fw.abbr}
              fw={fw}
              isHovered={hoveredBadge === fw.abbr}
              onHover={() => setHoveredBadge(fw.abbr)}
              onLeave={() => setHoveredBadge(null)}
            />
          ))}
        </div>

        {/* Category B */}
        <div className="mb-2 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ED8936' }}>
            EVIDENCE LAYER
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(237,137,54,0.25)' }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {FRAMEWORKS_B.map((fw) => (
            <FrameworkBadge
              key={fw.abbr}
              fw={fw}
              isHovered={hoveredBadge === fw.abbr}
              onHover={() => setHoveredBadge(fw.abbr)}
              onLeave={() => setHoveredBadge(null)}
            />
          ))}
        </div>

        {/* Live Enforcement Log */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(15,17,23,0.9)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-white/80">Live Enforcement Log</span>
            <span className="ml-auto text-xs text-white/25 font-mono">real-time</span>
          </div>

          <div className="px-4 py-2 space-y-1 max-h-72 overflow-hidden">
            <AnimatePresence initial={false}>
              {logEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 py-1.5 border-b border-white/[0.04] last:border-0 text-xs font-mono"
                >
                  <span className="text-white/30 shrink-0">[{entry.time}]</span>
                  <span
                    className="shrink-0 w-14 text-center rounded px-1.5 py-0.5 text-[10px] font-bold"
                    style={{
                      color: DECISION_COLORS[entry.decision],
                      background: `${DECISION_COLORS[entry.decision]}18`,
                      border: `1px solid ${DECISION_COLORS[entry.decision]}44`,
                    }}
                  >
                    {entry.decision}
                  </span>
                  <span className="text-white/30 shrink-0 hidden sm:inline w-28 truncate">{entry.framework}</span>
                  <span className="text-white/25 shrink-0 hidden md:inline w-20 truncate">{entry.industry}</span>
                  <span className="text-white/60 flex-1 truncate">{entry.action}</span>
                  <span
                    className="shrink-0 text-[10px]"
                    style={{ color: entry.risk >= 0.8 ? '#E53E3E' : entry.risk >= 0.5 ? '#ED8936' : '#38A169' }}
                  >
                    {entry.risk.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
