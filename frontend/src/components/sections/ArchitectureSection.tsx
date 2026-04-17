import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Zap, ScanSearch, Database, Lock,
  Shield, BarChart3, Eye, Settings,
  Server, Search, Cpu, Key,
} from 'lucide-react';
import { ScrollReveal } from '@/components/shared';

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function Tooltip({
  content,
  children,
  className,
  style,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className={className ?? 'relative inline-block'}
      style={style}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 max-w-[calc(100vw-2rem)] pointer-events-none"
          >
            <div className="bg-[oklch(0.18_0.01_250)] border border-border/60 rounded-xl p-3 shadow-2xl">
              <div className="text-xs text-foreground/90 leading-relaxed">{content}</div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border/60" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Animated Flow Dot ────────────────────────────────────────────────────────

function FlowDot({ delay = 0 }: { delay?: number }) {
  return (
    <Tooltip
      content="Anonymized decision metadata traveling to the Coordination Plane — field types detected, risk score calculated, decision outcome. Raw data never included."
      className="absolute top-1/2 -translate-y-1/2"
    >
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-emerald cursor-pointer"
        style={{ left: 0 }}
        animate={{ x: [-4, 16, 36], opacity: [0, 1, 0] }}
        transition={{
          duration: 1.8,
          delay,
          repeat: Infinity,
          ease: 'linear',
          times: [0, 0.5, 1],
        }}
      />
    </Tooltip>
  );
}

// ─── Plane Node Card ──────────────────────────────────────────────────────────

type NodeCardProps = {
  icon: React.ElementType;
  title: string;
  desc: string;
  tooltip: string;
  accent?: 'emerald' | 'blue';
};

function NodeCard({ icon: Icon, title, desc, tooltip, accent = 'emerald' }: NodeCardProps) {
  const c =
    accent === 'emerald'
      ? { bg: 'bg-emerald/10', border: 'border-emerald/20', text: 'text-emerald', hover: 'hover:border-emerald/40' }
      : { bg: 'bg-blue-400/10', border: 'border-blue-400/20', text: 'text-blue-400', hover: 'hover:border-blue-400/40' };

  return (
    <Tooltip content={tooltip} className="relative block w-full">
      <div
        className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${c.bg} ${c.border} ${c.hover} transition-all duration-200 cursor-pointer h-full`}
      >
        <div className={`w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
        <div className="text-center">
          <p className="text-[11px] font-semibold text-foreground leading-tight">{title}</p>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5 leading-tight">{desc}</p>
        </div>
      </div>
    </Tooltip>
  );
}

// ─── Two Planes Diagram ────────────────────────────────────────────────────────

const coordinationNodes: NodeCardProps[] = [
  {
    icon: Shield,
    title: 'Policy Engine',
    desc: 'Rules & distribution',
    tooltip:
      'Stores and distributes policy rules to enforcement planes. Receives only anonymized metadata: what type of action, what decision was made, risk score. Never receives field values.',
    accent: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Compliance Reports',
    desc: '12 frameworks',
    tooltip:
      'Auto-generates compliance reports mapped to 12 frameworks: HIPAA, GDPR, SOC2, EU AI Act, and more. Every decision is pre-mapped to specific regulatory controls.',
    accent: 'blue',
  },
  {
    icon: Eye,
    title: 'Review Queue',
    desc: 'QUEUE inbox',
    tooltip:
      'The QUEUE inbox. When risk score is 0.70–0.89, action is held here for human review. Reviewer sees: action type, destination, field TYPES, risk score, applicable policy rule. 4 options: Approve as-is, Approve tokenized, Block, Escalate.',
    accent: 'blue',
  },
  {
    icon: Settings,
    title: 'Org Settings',
    desc: 'Config & billing',
    tooltip:
      'Central configuration for policies, integrations, team permissions, API keys, and billing. Changes are encrypted and pushed to Enforcement Planes.',
    accent: 'blue',
  },
];

const enforcementNodes: NodeCardProps[] = [
  {
    icon: Server,
    title: 'Go Sidecar :8080',
    desc: 'Mandatory proxy · 6MB',
    tooltip:
      'The mandatory proxy. 6MB static binary. Every AI request MUST pass through here — there is no bypass. On any internal error, it fails SECURE (blocks the request). Intercepts on port 8080.',
    accent: 'emerald',
  },
  {
    icon: ScanSearch,
    title: 'Python Brain',
    desc: '3-stage detection',
    tooltip:
      'The detection intelligence. Runs the 3-stage cascade: Regex (<1ms, 70% of cases), Presidio NER (<10ms, 20%), and GLiNER zero-shot (<30ms, 10% edge cases). Skips stage 3 if confidence > 97%.',
    accent: 'emerald',
  },
  {
    icon: Database,
    title: 'Redis Token Store',
    desc: 'AES-256 · TTL 1hr',
    tooltip:
      'Stores the reversible token map. SSN: 547-82-3901 → [MASKED-SSN-001]. AES-256 encrypted. TTL: 1 hour. Token IDs are RANDOM (not sequential) — prevents token oracle attacks.',
    accent: 'emerald',
  },
  {
    icon: Lock,
    title: 'Audit Buffer',
    desc: 'Hash-chained → Rekor',
    tooltip:
      'Buffers audit events before hash-chaining. Stores field TYPES only — never raw values. Chain root published to Rekor (Sigstore) hourly for tamper-evident compliance proof.',
    accent: 'emerald',
  },
];

function TwoPlanesDiagram() {
  return (
    <div>
      {/* Coordination Plane */}
      <div
        className="rounded-t-2xl border border-blue-400/20 bg-[oklch(0.16_0.02_250)] p-5"
        style={{ borderTop: '2px solid oklch(0.65 0.15 240 / 0.4)' }}
      >
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-base">☁</span>
          <span className="text-sm font-semibold text-foreground">Coordination Plane</span>
          <span className="text-xs text-blue-400/70 font-mono">· GlobiGuard Cloud</span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400/80 font-mono whitespace-nowrap">
            anonymized metadata only
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {coordinationNodes.map((node) => (
            <NodeCard key={node.title} {...node} />
          ))}
        </div>
      </div>

      {/* Data Boundary */}
      <Tooltip content="GlobiGuard's zero-trust boundary. The Coordination Plane only receives anonymized decision metadata: field types (never values), risk scores, and decision outcomes. Encryption keys live exclusively in the Enforcement Plane inside your environment.">
        <div className="relative border-y border-dashed border-red-500/30 py-3 cursor-pointer hover:bg-red-500/5 transition-colors text-center px-2">
          <span className="text-xs font-mono text-red-400/80">
            ── RAW DATA ARCHITECTURALLY CANNOT CROSS THIS BOUNDARY ──
          </span>
          <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
            Enforcement plane holds the encryption keys
          </span>
        </div>
      </Tooltip>

      {/* Enforcement Plane */}
      <div className="rounded-b-2xl border border-emerald/10 bg-[oklch(0.12_0.03_145)] p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-base">🔒</span>
          <span className="text-sm font-semibold text-foreground">Enforcement Plane</span>
          <span className="text-xs text-emerald/70 font-mono hidden sm:inline">
            · Your Environment (VPC / K8s / On-Prem)
          </span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-emerald/80 font-mono whitespace-nowrap">
            your data stays here
          </span>
        </div>

        {/* Desktop: flex row with animated connectors */}
        <div className="hidden sm:flex items-stretch">
          {enforcementNodes.map((node, i) => (
            <div key={node.title} className="flex items-center flex-1 min-w-0">
              {i > 0 && (
                <div className="relative w-8 h-0.5 bg-emerald/20 flex-shrink-0">
                  <FlowDot delay={i * 0.55} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <NodeCard {...node} />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: 2×2 grid */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {enforcementNodes.map((node) => (
            <NodeCard key={node.title} {...node} />
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-border/20 flex items-center justify-end gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">
            ↑ Decision metadata only (no PII, no field values) → Coordination Plane
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Detection Cascade ────────────────────────────────────────────────────────

type CascadeStage = {
  icon: React.ElementType;
  title: string;
  latency: string;
  accent: string;
  iconClass: string;
  bgClass: string;
  borderClass: string;
  pct: string;
  tooltip: string;
};

const cascadeStages: CascadeStage[] = [
  {
    icon: Zap,
    title: 'Incoming',
    latency: 'Request',
    accent: '#facc15',
    iconClass: 'text-yellow-400',
    bgClass: 'bg-yellow-400/10',
    borderClass: 'border-yellow-400/20',
    pct: '',
    tooltip:
      'The raw AI request containing potentially sensitive data. Enters the Go Sidecar at port 8080 — the mandatory proxy. No bypass exists.',
  },
  {
    icon: ScanSearch,
    title: 'Regex',
    latency: '<1ms',
    accent: '#60a5fa',
    iconClass: 'text-blue-400',
    bgClass: 'bg-blue-400/10',
    borderClass: 'border-blue-400/20',
    pct: '70% of cases',
    tooltip:
      '18 regex rules covering: 9-digit SSNs, ICD-10 diagnosis codes (A00.0–Z99.9), 55 drug names, 80+ health keywords. Runs in under 1ms on any hardware. Handles ~70% of all PII cases.',
  },
  {
    icon: Search,
    title: 'Presidio NER',
    latency: '<10ms',
    accent: '#c084fc',
    iconClass: 'text-purple-400',
    bgClass: 'bg-purple-400/10',
    borderClass: 'border-purple-400/20',
    pct: '20% of cases',
    tooltip:
      "Microsoft's Presidio NER model identifies: names in unstructured prose, non-standard date formats, partial SSNs, email addresses. Activates when Regex confidence < 97%. Typical latency: 8–12ms.",
  },
  {
    icon: Cpu,
    title: 'GLiNER',
    latency: '<30ms',
    accent: '#f59e0b',
    iconClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10',
    borderClass: 'border-amber-400/20',
    pct: '10% edge cases',
    tooltip:
      'Zero-shot NER for edge cases: novel medical jargon, proprietary identifiers, domain-specific terms. Only activates when Regex + Presidio together are under 97% confidence. Latency: 20–35ms.',
  },
  {
    icon: Key,
    title: 'Tokenizer',
    latency: '~0ms',
    accent: '#10b981',
    iconClass: 'text-emerald',
    bgClass: 'bg-emerald/10',
    borderClass: 'border-emerald/20',
    pct: 'AES-256',
    tooltip:
      'Replaces detected fields with reversible tokens. SSN: 547-82-3901 → [MASKED-SSN-001]. Stores mapping in Redis with AES-256 encryption, 1-hour TTL. Only GlobiGuard can reverse the token.',
  },
];

const piiStates = [
  { text: '"John Smith, SSN: 547-82-3901"', cls: 'text-red-400/90' },
  { text: '"John Smith, SSN: 547-82-3901"', cls: 'text-red-400/90' },
  { text: '"[PERSON_?], SSN: 547-82-3901"', cls: 'text-amber-400' },
  { text: '"[PERSON_001], [MASKED-SSN-?]"', cls: 'text-amber-400' },
  { text: '"[PERSON_001], [MASKED-SSN-001]"', cls: 'text-emerald' },
];

function DetectionCascade() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-80px' });
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => setActiveStage((s) => (s + 1) % cascadeStages.length), 1500);
    return () => clearInterval(t);
  }, [isInView]);

  const pii = piiStates[activeStage];

  return (
    <div ref={ref}>
      {/* Animated PII example */}
      <div className="text-center mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className={`inline-block font-mono text-xs sm:text-sm px-4 py-2 rounded-lg bg-card/50 border border-border/50 ${pii.cls}`}
          >
            {pii.text}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pipeline */}
      <div className="flex items-center justify-center gap-0 overflow-x-auto pb-2">
        {cascadeStages.map((stage, i) => {
          const StageIcon = stage.icon;
          return (
            <div key={stage.title} className="flex items-center flex-shrink-0">
              {i > 0 && (
                <div className="relative w-5 sm:w-8 h-px bg-border/50 flex-shrink-0">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ height: 2, top: -0.5, backgroundColor: stage.accent }}
                    animate={isInView && activeStage >= i ? { width: '100%' } : { width: '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
              <Tooltip content={stage.tooltip}>
                <motion.div
                  className={`relative flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-xl border w-[68px] sm:w-24 cursor-pointer ${stage.bgClass} ${stage.borderClass}`}
                  animate={activeStage === i ? { boxShadow: `0 0 20px ${stage.accent}40` } : { boxShadow: 'none' }}
                >
                  <div
                    className={`w-8 h-8 rounded-xl ${stage.bgClass} border ${stage.borderClass} flex items-center justify-center`}
                  >
                    <StageIcon className={`w-4 h-4 ${stage.iconClass}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold text-foreground leading-tight">{stage.title}</p>
                    <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{stage.latency}</p>
                    {stage.pct && (
                      <p className="text-[8px] font-mono mt-0.5" style={{ color: stage.accent }}>
                        {stage.pct}
                      </p>
                    )}
                  </div>
                  {activeStage === i && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.accent }}
                    />
                  )}
                </motion.div>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Risk Score Band ──────────────────────────────────────────────────────────

type RiskZone = {
  label: string;
  range: string;
  http: string;
  desc: string;
  color: string;
  textClass: string;
  tooltip: string;
  sampleScore: number;
  widthPct: number;
};

const riskZones: RiskZone[] = [
  {
    label: 'ALLOW',
    range: '< 0.30',
    http: 'HTTP 200',
    desc: 'Proceed unmodified',
    color: '#10b981',
    textClass: 'text-emerald',
    tooltip:
      'Score < 0.30. Request proceeds unmodified at HTTP 200. No PII detected or risk is negligible. The AI receives the original content.',
    sampleScore: 0.12,
    widthPct: 30,
  },
  {
    label: 'MODIFY',
    range: '0.30–0.69',
    http: 'HTTP 200',
    desc: 'Tokenize & forward',
    color: '#facc15',
    textClass: 'text-yellow-400',
    tooltip:
      'Score 0.30–0.69. PII detected but action is low-risk. Fields are tokenized (real values replaced with reversible tokens). Request forwarded at HTTP 200 with clean content. AI never sees the raw data.',
    sampleScore: 0.45,
    widthPct: 40,
  },
  {
    label: 'QUEUE',
    range: '0.70–0.89',
    http: 'HTTP 202',
    desc: 'Hold for review',
    color: '#f59e0b',
    textClass: 'text-amber-400',
    tooltip:
      "Score 0.70–0.89. Action held pending human review. HTTP 202 returned immediately so the workflow doesn't timeout. Reviewer sees field types (never values), risk score, and policy context. 4 decision options.",
    sampleScore: 0.81,
    widthPct: 20,
  },
  {
    label: 'BLOCK',
    range: '≥ 0.90',
    http: 'HTTP 403',
    desc: 'Refuse completely',
    color: '#ef4444',
    textClass: 'text-red-400',
    tooltip:
      'Score ≥ 0.90. Request refused. HTTP 403 returned with structured reason. Examples: attempting to send PHI via Gmail (score: 0.91), bulk export of financial records (score: 0.95). Fail-safe: any internal error also returns 403.',
    sampleScore: 0.95,
    widthPct: 10,
  },
];

function scoreToBarPct(score: number): number {
  if (score < 0.3) return (score / 0.3) * 30;
  if (score < 0.7) return 30 + ((score - 0.3) / 0.4) * 40;
  if (score < 0.9) return 70 + ((score - 0.7) / 0.2) * 20;
  return 90 + Math.min((score - 0.9) / 0.1, 1) * 10;
}

function RiskScoreBand() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-80px' });
  const [zoneIdx, setZoneIdx] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => setZoneIdx((i) => (i + 1) % riskZones.length), 2000);
    return () => clearInterval(t);
  }, [isInView]);

  const currentZone = riskZones[zoneIdx];
  const needlePct = scoreToBarPct(currentZone.sampleScore);

  return (
    <div ref={ref} className="gradient-border p-5 sm:p-6">
      {/* Zone labels row */}
      <div className="flex mb-3">
        {riskZones.map((z) => (
          <Tooltip key={z.label} content={z.tooltip} style={{ width: `${z.widthPct}%` }} className="relative block cursor-pointer">
            <div className="text-center">
              <p className={`text-xs font-bold font-mono ${z.textClass}`}>{z.label}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{z.range}</p>
            </div>
          </Tooltip>
        ))}
      </div>

      {/* Coloured bar + needle */}
      <div className="relative">
        <div className="flex h-5 rounded-full overflow-hidden">
          {riskZones.map((z, i) => (
            <div
              key={z.label}
              style={{
                width: `${z.widthPct}%`,
                backgroundColor: `${z.color}28`,
                borderRight: i < riskZones.length - 1 ? `1px solid ${z.color}35` : undefined,
              }}
              className="h-full"
            />
          ))}
        </div>
        {/* Needle */}
        <motion.div
          className="absolute -top-1 flex flex-col items-center"
          animate={{ left: `${needlePct}%`, x: '-50%' }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <motion.div
            key={zoneIdx}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-5 h-5 rounded-full border-2 border-background shadow-lg"
            style={{ backgroundColor: currentZone.color }}
          />
        </motion.div>
      </div>

      {/* HTTP labels */}
      <div className="flex mt-4">
        {riskZones.map((z) => (
          <div key={z.label} style={{ width: `${z.widthPct}%` }} className="text-center">
            <p className="text-[10px] font-mono" style={{ color: z.color }}>
              {z.http}
            </p>
            <p className="text-[9px] text-muted-foreground">{z.desc}</p>
          </div>
        ))}
      </div>

      {/* Sample score indicator */}
      <div className="mt-5 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={zoneIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-2"
          >
            <span className="text-xs font-mono text-muted-foreground">Sample score:</span>
            <span className="text-sm font-bold font-mono" style={{ color: currentZone.color }}>
              {currentZone.sampleScore.toFixed(2)}
            </span>
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full border"
              style={{
                color: currentZone.color,
                borderColor: `${currentZone.color}40`,
                backgroundColor: `${currentZone.color}15`,
              }}
            >
              → {currentZone.label}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sarah's Story ────────────────────────────────────────────────────────────

const timelineSteps = [
  {
    emoji: '🟡',
    text: 'Claim email workflow starts',
    tooltip:
      "An AI agent in Meridian's CRM initiates a standard claims processing workflow. Without GlobiGuard, this workflow would have direct access to all patient data.",
  },
  {
    emoji: '🔵',
    text: '0.8ms · Regex detects ICD-10 + SSN + metformin',
    tooltip:
      'Regex layer matched ICD-10 code J18.9 (pneumonia), SSN pattern, and drug name metformin in 0.8ms. Combined confidence: 94%. Layer 2 (Presidio) also activates, adding full name. Combined confidence: 99.1%. Layer 3 skipped.',
  },
  {
    emoji: '🟠',
    text: 'Risk score: 0.84 → QUEUE',
    tooltip:
      'score = 0.5 (action: send_email) + 0.25 (health_field_present) + 0.15 (identity_field_present) + 0.5 modifier (destination: gmail) = 0.84. Decision: QUEUE. HTTP 202 returned. Workflow paused without timeout error.',
  },
  {
    emoji: '👁',
    text: 'Sarah opens review dashboard',
    tooltip:
      'Review dashboard shows: Action=send_email, Destination=gmail.com, Fields detected=[health_record, SSN, full_name], Risk=0.84, Policy=pii_in_outbound_email. Options: Approve as-is / Approve tokenized / Block / Escalate',
  },
  {
    emoji: '✅',
    text: "Clicks 'Approve tokenized'",
    tooltip:
      "Sarah clicks 'Approve tokenized'. GlobiGuard sends email with tokens: 'Patient [PERSON_001] (ID: [MASKED-SSN-001]) regarding condition [ICD_001]'. Adjuster's system reverses tokens using authorized key. Audit log records human decision + full context hash.",
  },
  {
    emoji: '📧',
    text: 'Adjuster receives clean email',
    tooltip:
      'The adjuster receives the email with tokenized fields. Their authorized system can reverse the tokens to see the actual values, while the email trail contains only safe tokens.',
  },
  {
    emoji: '🔒',
    text: 'Audit hash-chained to Rekor',
    tooltip:
      'The complete audit event — field types detected (never values), risk score, human decision, timestamp — is hash-chained and root published to Rekor (Sigstore). Tamper-evident compliance proof. $0 exposure.',
  },
];

function SarahStory() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-80px' });
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    if (!isInView) {
      setVisibleSteps(0);
      return;
    }
    let current = 0;
    const t = setInterval(() => {
      current += 1;
      setVisibleSteps(current);
      if (current >= timelineSteps.length) clearInterval(t);
    }, 600);
    return () => clearInterval(t);
  }, [isInView]);

  return (
    <div ref={ref} className="gradient-border glow-emerald overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/30">
        {/* LEFT — before */}
        <div className="p-6 bg-red-500/5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
            Before GlobiGuard
          </p>
          <p className="text-xs text-muted-foreground mb-5">Meridian Insurance · Day 0</p>
          <div className="space-y-4">
            <div>
              <div className="text-5xl font-bold font-mono text-red-400">847</div>
              <p className="text-xs text-muted-foreground mt-1">HIPAA violations flagged</p>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-red-400">$2.8M</div>
              <p className="text-xs text-muted-foreground mt-1">regulatory exposure</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 italic mt-6 leading-relaxed">
            Same AI. Same workflows.<br />No governance.
          </p>
        </div>

        {/* CENTER — timeline */}
        <div className="p-6">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
            Day 4 · 9:14 AM
          </p>
          <p className="text-sm font-semibold text-foreground mb-5">The moment it mattered</p>
          <div className="flex flex-col gap-3">
            {timelineSteps.map((step, i) => (
              <AnimatePresence key={i}>
                {i < visibleSteps && (
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Tooltip content={step.tooltip}>
                      <div className="flex items-start gap-2.5 cursor-pointer group">
                        <span className="text-sm flex-shrink-0 leading-relaxed">{step.emoji}</span>
                        <p className="text-xs text-foreground/75 group-hover:text-foreground transition-colors leading-relaxed">
                          {step.text}
                        </p>
                      </div>
                    </Tooltip>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>

        {/* RIGHT — after */}
        <div className="p-6 bg-emerald/5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
            After GlobiGuard
          </p>
          <p className="text-xs text-muted-foreground mb-5">Day 4 · Same workflow</p>
          <div className="space-y-4">
            <div>
              <div className="text-5xl font-bold font-mono text-emerald">$0</div>
              <p className="text-xs text-muted-foreground mt-1">exposure</p>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-emerald">0</div>
              <p className="text-xs text-muted-foreground mt-1">violations</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 italic mt-6 leading-relaxed">
            Same AI. GlobiGuard governs<br />every action.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ArchitectureSection() {
  return (
    <section id="architecture" className="scroll-section relative px-4 py-24 overflow-hidden">
      <div className="section-divider mb-16" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-blue-500/4 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] rounded-full bg-emerald/4 blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">
            Technical Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Two Planes. One Guarantee.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The enforcement plane lives inside your environment. Raw data never crosses the boundary — not even to us.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <TwoPlanesDiagram />
        </ScrollReveal>

        <ScrollReveal className="mt-16">
          <h3 className="text-xl font-bold text-center mb-8">Detection Cascade</h3>
          <DetectionCascade />
        </ScrollReveal>

        <ScrollReveal className="mt-16">
          <h3 className="text-xl font-bold text-center mb-8">Risk Score → Policy Decision</h3>
          <RiskScoreBand />
        </ScrollReveal>

        <ScrollReveal className="mt-16">
          <SarahStory />
        </ScrollReveal>
      </div>
    </section>
  );
}
