import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Shield, ClipboardList, Activity, BarChart3, Key, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/shared';

const tabs = [
  { id: 'guard', label: 'Guard & Mask', icon: Shield },
  { id: 'policy', label: 'Policy Engine', icon: ClipboardList },
  { id: 'flow', label: 'Flow Monitor', icon: Activity },
  { id: 'compliance', label: 'Compliance Trail', icon: BarChart3 },
  { id: 'token', label: 'Token Manager', icon: Key },
];

// Tab 1 — PII Mask Demo
function PiiMaskDemo() {
  const [masked, setMasked] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setMasked(m => !m), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="space-y-4">
      <div className="gradient-border p-4 font-mono text-sm leading-relaxed">
        <p className="text-muted-foreground mb-2 text-xs">// Incoming prompt</p>
        <p>
          <span className="text-foreground">"Patient </span>
          <AnimatePresence mode="wait">
            {masked ? (
              <motion.span key="t1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-emerald bg-emerald/10 px-1 rounded font-mono">PERSON_7823</motion.span>
            ) : (
              <motion.span key="r1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 bg-red-500/10 px-1 rounded">John Smith</motion.span>
            )}
          </AnimatePresence>
          <span className="text-foreground"> (SSN: </span>
          <AnimatePresence mode="wait">
            {masked ? (
              <motion.span key="t2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 bg-red-500/10 px-1 rounded font-mono">[BLOCKED]</motion.span>
            ) : (
              <motion.span key="r2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 bg-red-500/10 px-1 rounded">123-45-6789</motion.span>
            )}
          </AnimatePresence>
          <span className="text-foreground">, DOB: </span>
          <AnimatePresence mode="wait">
            {masked ? (
              <motion.span key="t3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-emerald bg-emerald/10 px-1 rounded font-mono">GG-4b2c</motion.span>
            ) : (
              <motion.span key="r3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 bg-red-500/10 px-1 rounded">1990-01-15</motion.span>
            )}
          </AnimatePresence>
          <span className="text-foreground">) requested prescription review"</span>
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-card/50 rounded-lg px-3 py-2 border border-border/50">
        <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
        3 fields intercepted · 2 tokenized · 1 blocked · <span className="text-emerald">2ms</span>
      </div>
    </div>
  );
}

// Tab 2 — Policy Eval Demo
const policyActions = [
  { action: 'send_email with 2 PII fields', decision: 'BLOCK', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  { action: 'read_record with human token', decision: 'ALLOW', color: 'text-emerald', bg: 'bg-emerald/10 border-emerald/30' },
  { action: 'export_data to external API', decision: 'QUEUE', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
];

function PolicyEvalDemo() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % policyActions.length), 3000);
    return () => clearInterval(t);
  }, []);
  const cur = policyActions[idx];
  return (
    <div className="space-y-4">
      <div className="gradient-border p-4 font-mono text-xs leading-relaxed">
        <p className="text-amber-400">scope: <span className="text-emerald">crm</span></p>
        <p className="text-amber-400 mt-1">rules:</p>
        <p className="text-muted-foreground ml-2">- action: <span className="text-blue-400">send_email</span></p>
        <p className="text-muted-foreground ml-4">allow: <span className="text-red-400">false</span></p>
        <p className="text-muted-foreground ml-4">when: contains_pii: <span className="text-red-400">true</span></p>
        <p className="text-muted-foreground ml-4">escalate: <span className="text-amber-400">human_review</span></p>
        <p className="text-muted-foreground ml-2">- action: <span className="text-blue-400">read_record</span></p>
        <p className="text-muted-foreground ml-4">allow: <span className="text-emerald">true</span></p>
        <p className="text-muted-foreground ml-4">condition: <span className="text-amber-400">human_approved</span></p>
      </div>
      <div className="text-xs text-muted-foreground font-mono mb-1">// Incoming action:</div>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center justify-between p-3 rounded-lg border ${cur.bg}`}
        >
          <span className="text-sm font-mono text-foreground">{cur.action}</span>
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${cur.color}`}>{cur.decision}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Tab 3 — Flow Monitor Demo
const flowSteps = [
  { label: 'Fetch customer records', status: 'approved', statusLabel: '✓ Approved', color: 'text-emerald', borderColor: 'border-emerald/30' },
  { label: 'Analyze with GPT-4o', status: 'approved', statusLabel: '✓ Approved', color: 'text-emerald', borderColor: 'border-emerald/30' },
  { label: 'Write to CRM (unexpected scope)', status: 'flagged', statusLabel: '⚠ Flagged', color: 'text-amber-400', borderColor: 'border-amber-400/30', note: 'Outside approved scope' },
  { label: 'Send summary email', status: 'blocked', statusLabel: '✗ Blocked', color: 'text-red-400', borderColor: 'border-red-400/30', note: 'PII in external destination' },
];

function FlowMonitorDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false });
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (!isInView) { setVisible(0); return; }
    if (visible >= flowSteps.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), 400);
    return () => clearTimeout(t);
  }, [isInView, visible]);
  return (
    <div ref={ref} className="space-y-0">
      {flowSteps.map((step, i) => (
        <div key={i}>
          <AnimatePresence>
            {i < visible && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex items-center justify-between p-3 rounded-lg border ${step.borderColor} bg-card/30`}
              >
                <div>
                  <p className="text-sm font-mono text-foreground">{step.label}</p>
                  {step.note && <p className="text-xs text-muted-foreground mt-0.5">{step.note}</p>}
                </div>
                <span className={`text-xs font-mono font-semibold ${step.color} ml-3 flex-shrink-0`}>{step.statusLabel}</span>
              </motion.div>
            )}
          </AnimatePresence>
          {i < flowSteps.length - 1 && i < visible - 1 && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 24 }}
              className="w-px bg-border/50 mx-auto overflow-hidden"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Tab 4 — Compliance Trail Demo
const complianceEntries = [
  { text: 'SSN blocked · Payroll export → CC6.5', time: '12ms' },
  { text: 'PHI tokenized · Patient intake → §164.502', time: '8ms' },
  { text: 'Email blocked · External send → Art.6 GDPR', time: '11ms' },
  { text: 'Token issued · CRM write → SOC2 CC6.1', time: '9ms' },
  { text: 'Anomaly flagged · Scope exceeded → EU AI Act', time: '15ms' },
];

function ComplianceTrailDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false });
  const [entries, setEntries] = useState<typeof complianceEntries>([]);
  const [entryIdx, setEntryIdx] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => {
      setEntries(prev => [complianceEntries[entryIdx % complianceEntries.length], ...prev].slice(0, 4));
      setEntryIdx(i => i + 1);
    }, 2000);
    return () => clearInterval(t);
  }, [isInView, entryIdx]);

  const rings = [
    { label: 'HIPAA', value: 94, color: '#10b981' },
    { label: 'SOC2', value: 86, color: '#60a5fa' },
    { label: 'GDPR', value: 84, color: '#c084fc' },
  ];
  const r = 20;
  const circumference = 2 * Math.PI * r;

  return (
    <div ref={ref} className="space-y-4">
      <div className="flex gap-6 justify-center">
        {rings.map((ring) => (
          <div key={ring.label} className="flex flex-col items-center gap-1">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r={r} fill="none" stroke="oklch(0.25 0.01 250)" strokeWidth="4" />
              <motion.circle
                cx="30" cy="30" r={r} fill="none"
                stroke={ring.color} strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={isInView ? { strokeDashoffset: circumference * (1 - ring.value / 100) } : { strokeDashoffset: circumference }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                transform="rotate(-90 30 30)"
              />
              <text x="30" y="34" textAnchor="middle" fontSize="11" fill={ring.color} fontFamily="monospace" fontWeight="bold">{ring.value}%</text>
            </svg>
            <span className="text-xs text-muted-foreground font-mono">{ring.label}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground font-mono mb-2">// Live enforcement feed</p>
        <AnimatePresence>
          {entries.map((entry, i) => (
            <motion.div
              key={`${entry.text}-${i}`}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between p-2 rounded border border-border/50 bg-card/50 text-xs font-mono"
            >
              <span className="text-muted-foreground">{entry.text}</span>
              <span className="text-emerald ml-2 flex-shrink-0">{entry.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-2">
        {['14 Frameworks', '6 Industries', '89+ Controls'].map(s => (
          <span key={s} className="text-xs px-2 py-1 rounded-full border border-emerald/20 bg-emerald/5 text-emerald font-mono">{s}</span>
        ))}
      </div>
    </div>
  );
}

// Tab 5 — Token Manager Demo
function TokenDemo() {
  const [animating, setAnimating] = useState(false);
  useEffect(() => {
    const t = setInterval(() => { setAnimating(true); setTimeout(() => setAnimating(false), 600); }, 3000);
    return () => clearInterval(t);
  }, []);
  const realData = [['name', 'John Smith'], ['ssn', '123-45-6789'], ['dob', '1990-01-15'], ['account', 'ACC-8847-X']];
  const tokenData = [['name', 'PERSON_7823'], ['ssn', '[BLOCKED]'], ['dob', 'GG-4b2c'], ['account', 'GG-9f1a']];
  return (
    <div className="space-y-4">
      <div className="gradient-border overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_1fr]">
          <div className="p-4">
            <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">Encode</p>
            {realData.map(([k, v]) => (
              <div key={k} className="flex gap-2 text-xs font-mono mb-1.5">
                <span className="text-muted-foreground">{k}:</span>
                <span className="text-red-300">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center px-2 border-x border-border/50 relative">
            <motion.div
              animate={{ x: animating ? [0, 8, 0] : 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-6 h-6 rounded-full bg-emerald/20 border border-emerald/40 flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-emerald" />
              </div>
              <span className="text-[9px] font-mono text-emerald">GG</span>
            </motion.div>
          </div>
          <div className="p-4">
            <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">Decode</p>
            {tokenData.map(([k, v]) => (
              <div key={k} className="flex gap-2 text-xs font-mono mb-1.5">
                <span className="text-muted-foreground">{k}:</span>
                <span className={v === '[BLOCKED]' ? 'text-red-400' : 'text-emerald'}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-xs text-center text-muted-foreground font-mono bg-card/50 rounded-lg px-3 py-2 border border-border/50">
        AES-256 encrypted · Reversible only by GlobiGuard · Zero-knowledge
      </div>
    </div>
  );
}

const tabContent: Record<string, { left: { title: string; body: string; bullets: string[] }; right: React.ReactNode }> = {
  guard: {
    left: { title: 'Guard & Mask', body: 'Automatically detects and masks 40+ PII types in prompts before the AI model ever sees the data. All masking is reversible only by GlobiGuard.', bullets: ['40+ PII type detection', 'Sub-3ms processing', 'Reversible tokenization', 'Streaming support'] },
    right: <PiiMaskDemo />,
  },
  policy: {
    left: { title: 'Policy Engine', body: 'Define smart rules: IF action THEN block/allow/modify/queue-for-human-review. Rules are versioned, audited, and hot-reloadable.', bullets: ['YAML policy format', 'Hot-reload without restart', 'Human review queues', 'Rule versioning & rollback'] },
    right: <PolicyEvalDemo />,
  },
  flow: {
    left: { title: 'Flow Monitor', body: 'Watches multi-step AI agent workflows in real time. Detects scope anomalies, unexpected tool calls, and policy violations at every step.', bullets: ['Multi-step workflow tracking', 'Real-time anomaly detection', 'Scope boundary enforcement', 'Step-by-step audit log'] },
    right: <FlowMonitorDemo />,
  },
  compliance: {
    left: { title: 'Compliance Trail', body: 'Every decision is timestamped, tamper-evident, and mapped to specific controls in HIPAA, GDPR, SOC2, and the EU AI Act.', bullets: ['14 compliance frameworks', 'Tamper-evident logs', 'Control mapping', 'One-click reports'] },
    right: <ComplianceTrailDemo />,
  },
  token: {
    left: { title: 'Token Manager', body: 'Reversible pseudonymization — "John Smith" becomes TOKEN_7823 before the AI sees it. Only GlobiGuard can reverse the mapping.', bullets: ['AES-256 encryption', 'Reversible by GlobiGuard only', 'Zero-knowledge architecture', 'Deterministic tokens'] },
    right: <TokenDemo />,
  },
};

export function CapabilitiesSection() {
  const [activeTab, setActiveTab] = useState('guard');
  const content = tabContent[activeTab];

  return (
    <section id="capabilities" className="scroll-section relative px-4 py-24 overflow-hidden">
      <div className="section-divider mb-16" />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/4 blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Capabilities</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">Five Layers of Protection</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Every request passes through each layer. Every decision is logged.</p>
        </ScrollReveal>

        {/* Tab bar */}
        <div className="relative flex gap-1 p-1 rounded-xl bg-card/50 border border-border/50 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors z-10 flex-shrink-0 whitespace-nowrap"
              style={{ color: activeTab === tab.id ? 'oklch(0.7 0.18 165)' : 'oklch(0.55 0.01 250)' }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="capTab"
                  className="absolute inset-0 rounded-lg bg-emerald/10 border border-emerald/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
          >
            {/* Left */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">{content.left.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{content.left.body}</p>
              <ul className="space-y-2">
                {content.left.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald flex-shrink-0" />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Right */}
            <div>{content.right}</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
