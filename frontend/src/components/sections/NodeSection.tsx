import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Shield, Lock, ClipboardList, Activity, BarChart3, Key, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '@/components/shared';

// ─── Tooltip ────────────────────────────────────────────────────────────────
function Tooltip({
  content, children, wide = false, align = 'center',
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
  align?: 'center' | 'start' | 'end';
}) {
  const [visible, setVisible] = useState(false);
  const pos = align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2';
  return (
    <div className="relative" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.14 }}
            className={`absolute bottom-full ${pos} mb-2 z-50 pointer-events-none ${wide ? 'w-80' : 'w-64'}`}
          >
            <div className="bg-[oklch(0.17_0.01_250)] border border-border/70 rounded-xl p-3 shadow-2xl text-xs text-foreground/90 leading-relaxed">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const aiModels = [
  { label: 'GPT-4o',     color: '#10a37f', provider: 'OpenAI',     detail: 'Connected via OpenAI SDK or a one-line proxy URL swap. All tool calls, streaming chunks, and function outputs are intercepted before reaching the model.' },
  { label: 'Claude 3.5', color: '#d97706', provider: 'Anthropic',  detail: 'Anthropic SDK. All messages pass through GlobiGuard. Tool use and computer use actions are individually policy-evaluated before any execution.' },
  { label: 'Gemini 1.5', color: '#4285f4', provider: 'Google',     detail: 'Google AI SDK. GlobiGuard intercepts text, image inputs, and grounding results — all governed before reaching the model.' },
  { label: 'Llama 3',    color: '#9333ea', provider: 'Self-hosted', detail: 'Works with any self-hosted model. GlobiGuard proxies at the HTTP level — no SDK changes. Drop-in for any OpenAI-compatible endpoint.' },
  { label: 'Custom',     color: '#6b7280', provider: 'Any REST',   detail: 'Set GLOBIGUARD_UPSTREAM_URL to any OpenAI-compatible API. GlobiGuard is model-agnostic — it operates purely at the request/response layer.' },
];

const dataSources = [
  { label: 'CRM',        color: '#06b6d4', risk: 'Medium', detail: 'Salesforce, HubSpot, etc. READ and WRITE are governed separately. PII fields (email, phone, name) are tokenized before the AI sees query results.' },
  { label: 'EHR',        color: '#ef4444', risk: 'High',   detail: 'Epic, Cerner. Highest risk tier. PHI — diagnoses (ICD-10 codes), medications, SSNs, DOBs — is tokenized before the AI receives any content. HIPAA §164.502 enforced on every call.' },
  { label: 'Legal Docs', color: '#f59e0b', risk: 'High',   detail: 'Contracts, case files, privileged documents. Document-level access controls block extraction of attorney-client privileged content based on classification metadata.' },
  { label: 'Files',      color: '#3b82f6', risk: 'Medium', detail: 'S3, SharePoint, blob storage. File contents are scanned on ingest — PII inside documents is detected and tokenized at field level before reaching the AI.' },
  { label: 'REST APIs',  color: '#10b981', risk: 'Varies', detail: 'Internal or third-party APIs. Request/response payloads are inspected. Action-level policies are evaluated before the AI can trigger any side effect.' },
];

const capabilities = [
  {
    icon: Lock,         label: 'Guard & Mask',
    desc:    'Detects + tokenizes 40+ PII types before the AI sees them',
    example: '"SSN: 547-82-3901" → "[MASKED-SSN-001]"',
    detail:  '3-stage cascade: Regex (<1ms, 70% of cases) → Presidio NER (<10ms, 20%) → GLiNER zero-shot (<30ms, 10% edge cases). Each detected field is replaced with an AES-256 token stored in Redis. The AI only ever sees the token — never the raw value.',
  },
  {
    icon: ClipboardList, label: 'Policy Engine',
    desc:    'Scores 13 risk features → ALLOW / MODIFY / QUEUE / BLOCK',
    example: 'send_email + PHI + Gmail destination → 0.84 → QUEUE',
    detail:  '13 features scored per request: field types (+0.25 health, +0.15 identity), action type (send=0.5 base, delete=0.8 base), destination modifier (gmail +0.5, slack +0.45). Score maps to: <0.30 ALLOW, 0.30–0.69 MODIFY, 0.70–0.89 QUEUE, ≥0.90 BLOCK.',
  },
  {
    icon: Activity,     label: 'Flow Monitor',
    desc:    'Watches multi-step AI workflows for scope violations',
    example: 'Step 3 tries to WRITE when only READ was approved → flag',
    detail:  'Tracks the full lifecycle of multi-step AI agent workflows. Each step is checked against the approved action scope for that session. Unapproved step types (e.g. unexpected WRITE_RECORD, SEND_MESSAGE) are flagged or blocked and logged.',
  },
  {
    icon: BarChart3,    label: 'Compliance Trail',
    desc:    'Hash-chained, tamper-evident log of every gate decision',
    example: 'Chain root → published to Rekor (Sigstore) every hour',
    detail:  'Every GlobiGuard gate decision is appended to a hash-chained audit log. Chain root is published to Rekor hourly — cryptographic proof of integrity. Logs store field TYPES only (never raw values), risk score, and decision outcome. Auto-maps to 12 regulatory frameworks.',
  },
  {
    icon: Key,          label: 'Token Manager',
    desc:    'Reversible pseudonymization — only GlobiGuard holds the keys',
    example: '"John Smith" ↔ PERSON_7823 (AES-256, TTL 1hr, random IDs)',
    detail:  'Manages the token vault: encrypts PII to random (not sequential) tokens — sequential IDs would allow oracle attacks. Stores in Redis with 1-hour TTL. Authorized downstream systems can request reversal. GlobiGuard holds the only decryption keys.',
  },
];

const tools = [
  { label: 'Web Search', status: '✓', badge: 'ALLOWED',   color: 'text-emerald',    bg: 'bg-emerald/10 border-emerald/20',   detail: 'Allowed. Returns only public data. GlobiGuard still scans results for unexpected PII before passing them to the AI — prevents data leakage via third-party sources.' },
  { label: 'Database',   status: '✓', badge: 'TOKENIZED', color: 'text-emerald',    bg: 'bg-emerald/10 border-emerald/20',   detail: 'Allowed with tokenization. Query results are scanned — any PII fields are replaced with reversible tokens before the AI reads them. The AI works with tokens and can still reason over the data.' },
  { label: 'Code Exec',  status: '✗', badge: 'BLOCKED',   color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20',   detail: 'Blocked by default. Code execution can exfiltrate data or cause irreversible side effects. Risk score: 0.90+ base. Requires explicit per-session human approval to enable.' },
  { label: 'Email',      status: '⏸', badge: 'QUEUED',    color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', detail: 'Conditional. Emails containing PII are held in the review queue (HTTP 202) for human approval. Once approved, the email is sent tokenized — the recipient sees clean content, PII never leaves the environment.' },
  { label: 'HTTP API',   status: '✓', badge: 'GOVERNED',  color: 'text-emerald',    bg: 'bg-emerald/10 border-emerald/20',   detail: 'Allowed for internal endpoints. External API calls are evaluated: destination domain, payload PII content, and action type all factor into the risk score before the request is forwarded.' },
];

const frameworks = [
  { label: 'HIPAA',     detail: 'Health Insurance Portability and Accountability Act. Every gate decision maps to specific HIPAA controls (§164.502, §164.514). Auto-generates compliance reports for auditors.' },
  { label: 'GDPR',      detail: 'EU GDPR. GlobiGuard enforces data minimization and purpose limitation. Tokens can be deleted server-side, making all derived data permanently unreadable — supporting right-to-erasure.' },
  { label: 'SOC 2',     detail: 'SOC 2 Type II. GlobiGuard provides the evidence layer — audit logs and decision trails map directly to CC6.x (logical access) controls required for annual audits.' },
  { label: 'EU AI Act', detail: 'EU AI Act (2024). Addresses high-risk AI system requirements: human oversight (QUEUE mechanism), logging (Compliance Trail), and transparency. Maps to Articles 9, 12, 13, 14.' },
];

// The "Sarah" scenario shown cycling in the bottom strip
const scenarioSteps = [
  { text: 'GPT-4o reads patient EHR record to draft a claim email', color: '#4285f4' },
  { text: '0.8ms — Regex detects ICD-10 code + SSN + drug name "metformin"', color: '#60a5fa' },
  { text: 'Risk score: 0.84 (health + identity fields + Gmail destination)', color: '#f59e0b' },
  { text: 'Decision: QUEUE (HTTP 202) — workflow paused, no timeout error', color: '#ed8936' },
  { text: 'Sarah approves tokenized version in 90-second review dashboard', color: '#10b981' },
  { text: 'Clean email sent · Audit hash-chained to Rekor · $0 exposure', color: '#10b981' },
];

// Animated packet traveling along a connector line
function FlowDot({ color, delay }: { color: string; delay: number }) {
  return (
    <motion.span
      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      initial={{ left: '4%', opacity: 0 }}
      animate={{ left: ['4%', '96%'], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.8, delay, repeat: Infinity, ease: 'linear', times: [0, 0.05, 0.9, 1] }}
    />
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function NodeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-80px' });
  const [activeCap, setActiveCap] = useState(0);
  const [storyStep, setStoryStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const capT = setInterval(() => setActiveCap(c => (c + 1) % capabilities.length), 1800);
    const storyT = setInterval(() => setStoryStep(s => (s + 1) % scenarioSteps.length), 2400);
    return () => { clearInterval(capT); clearInterval(storyT); };
  }, [isInView]);

  return (
    <section id="node" className="scroll-section relative px-4 py-24 overflow-hidden" ref={ref}>
      <div className="section-divider mb-16" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald/4 blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">The Control Plane</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            GlobiGuard Sits in the Middle
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every AI request passes through before it reaches a model or triggers an action.{' '}
            <span className="text-foreground/70">Hover any element to see exactly what it does.</span>
          </p>
        </ScrollReveal>

        {/* ── Desktop 5-column diagram: left | arrow | center | arrow | right ── */}
        <div className="hidden md:flex items-stretch gap-0">

          {/* ── Left column: inputs ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 w-40 flex-shrink-0">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest mb-2">AI Models</p>
              <div className="flex flex-col gap-1.5">
                {aiModels.map((m, i) => (
                  <Tooltip key={i} align="start" content={
                    <><span className="font-semibold" style={{ color: m.color }}>{m.label}</span>
                    {' · '}<span className="text-muted-foreground">{m.provider}</span><br /><br />
                    {m.detail}</>
                  }>
                    <div
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono cursor-help transition-all duration-150 hover:scale-[1.02] will-change-transform"
                      style={{ borderColor: `${m.color}45`, backgroundColor: `${m.color}0b`, color: '#9ca3af' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                      {m.label}
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest mb-2">Data Sources</p>
              <div className="flex flex-col gap-1.5">
                {dataSources.map((d, i) => (
                  <Tooltip key={i} align="start" content={
                    <><span className="font-semibold" style={{ color: d.color }}>{d.label}</span>
                    {' '}<span className={`text-[10px] px-1 py-0.5 rounded ${d.risk === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{d.risk} risk</span>
                    <br /><br />{d.detail}</>
                  }>
                    <div
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono cursor-help transition-all duration-150 hover:scale-[1.02] will-change-transform"
                      style={{ borderColor: `${d.color}45`, backgroundColor: `${d.color}0b`, color: '#9ca3af' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      {d.label}
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* ── Connector: raw → GlobiGuard ──────────────────────────────────── */}
          <Tooltip content={
            <><span className="font-semibold text-amber-400">Raw input stream</span><br /><br />
            Prompt text, data source query results, and tool call payloads — potentially containing PII.
            GlobiGuard intercepts <em>everything</em> in this stream before any of it reaches a model.
            This is the "unfiltered" side of the proxy.</>
          }>
            <div className="flex-1 min-w-[44px] flex flex-col justify-center cursor-help select-none">
              <p className="text-[9px] font-mono text-amber-500/60 text-center mb-1">raw input</p>
              <div className="relative h-px bg-amber-500/25 mx-2">
                <FlowDot color="#f59e0b" delay={0} />
                <FlowDot color="#f59e0b" delay={0.9} />
                {/* arrowhead */}
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-amber-500/50 text-[10px] leading-none">▶</span>
              </div>
              <p className="text-[9px] font-mono text-amber-500/50 text-center mt-1">⚠ unfiltered</p>
            </div>
          </Tooltip>

          {/* ── Center: GlobiGuard node ───────────────────────────────────────── */}
          <div className="gradient-border animate-breathe glow-emerald-strong flex-shrink-0 w-52">
            <div className="p-4 h-full flex flex-col">
              <Tooltip content={
                <><span className="font-semibold text-emerald">GlobiGuard Engine</span><br /><br />
                The mandatory proxy. There is no bypass. Every AI request passes through this node.
                On any internal error it fails <strong>SECURE</strong> — the request is blocked, never passed through.
                Runs 5 protection layers in under 3ms total overhead.</>
              } wide>
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50 cursor-help">
                  <div className="w-7 h-7 rounded-lg bg-emerald/20 border border-emerald/40 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-3.5 h-3.5 text-emerald" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-foreground">GlobiGuard</p>
                    <p className="text-[10px] text-muted-foreground/70">hover each layer ↓</p>
                  </div>
                </div>
              </Tooltip>

              <div className="flex flex-col gap-0.5 flex-1">
                {capabilities.map((cap, i) => (
                  <Tooltip key={i} content={
                    <><span className="font-semibold text-emerald">{cap.label}</span><br />
                    <span className="text-muted-foreground">{cap.desc}</span><br /><br />
                    <span className="font-mono text-[10px] text-emerald/80">{cap.example}</span><br /><br />
                    {cap.detail}</>
                  } wide>
                    <motion.div
                      className="flex flex-col px-2 py-1.5 rounded-lg text-xs border cursor-help"
                      animate={activeCap === i
                        ? { backgroundColor: 'oklch(0.7 0.18 165 / 0.12)', borderColor: 'oklch(0.7 0.18 165 / 0.3)' }
                        : { backgroundColor: 'transparent', borderColor: 'transparent' }
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <cap.icon className={`w-3 h-3 flex-shrink-0 ${activeCap === i ? 'text-emerald' : 'text-muted-foreground/50'}`} />
                        <span className={`font-medium ${activeCap === i ? 'text-emerald' : 'text-muted-foreground/60'}`}>{cap.label}</span>
                      </div>
                      <AnimatePresence>
                        {activeCap === i && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[10px] text-muted-foreground pl-[18px] mt-0.5 leading-snug overflow-hidden"
                          >
                            {cap.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* ── Connector: GlobiGuard → sanitized output ─────────────────────── */}
          <Tooltip content={
            <><span className="font-semibold text-emerald">Sanitized output stream</span><br /><br />
            Tokenized prompts (PII replaced with reversible tokens), policy decisions (ALLOW / MODIFY / QUEUE / BLOCK),
            and governed tool call results. The AI model and downstream tools only ever see tokens — never raw sensitive values.</>
          }>
            <div className="flex-1 min-w-[44px] flex flex-col justify-center cursor-help select-none">
              <p className="text-[9px] font-mono text-emerald/60 text-center mb-1">sanitized</p>
              <div className="relative h-px bg-emerald/35 mx-2">
                <FlowDot color="#10b981" delay={0.45} />
                <FlowDot color="#10b981" delay={1.35} />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald/50 text-[10px] leading-none">▶</span>
              </div>
              <p className="text-[9px] font-mono text-emerald/50 text-center mt-1">✓ governed</p>
            </div>
          </Tooltip>

          {/* ── Right column: outputs ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 w-40 flex-shrink-0">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest mb-2">Tools & Actions</p>
              <div className="flex flex-col gap-1.5">
                {tools.map((t, i) => (
                  <Tooltip key={i} align="end" content={
                    <><span className={`font-semibold font-mono ${t.color}`}>{t.badge}</span><br /><br />{t.detail}</>
                  }>
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono cursor-help transition-all duration-150 hover:scale-[1.02] will-change-transform ${t.bg}`}>
                      <span className={`font-bold text-[11px] flex-shrink-0 ${t.color}`}>{t.status}</span>
                      <span className="text-muted-foreground">{t.label}</span>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest mb-2">Auto-Compliance</p>
              <div className="flex flex-col gap-1.5">
                {frameworks.map((f, i) => (
                  <Tooltip key={i} align="end" content={f.detail}>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-emerald/20 bg-emerald/5 text-xs font-mono text-emerald cursor-help hover:bg-emerald/10 transition-colors">
                      <span className="text-[10px]">✓</span>
                      {f.label}
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Live scenario strip ───────────────────────────────────────────── */}
        <div className="hidden md:block mt-6 gradient-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
              <span className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest">Live Example</span>
            </div>
            <div className="flex-1 h-px bg-border/30" />
            <AnimatePresence mode="wait">
              <motion.div
                key={storyStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: scenarioSteps[storyStep].color }} />
                <span className="text-xs font-mono" style={{ color: scenarioSteps[storyStep].color }}>
                  {scenarioSteps[storyStep].text}
                </span>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-1 ml-2 flex-shrink-0">
              {scenarioSteps.map((_, i) => (
                <span key={i} className={`w-1 h-1 rounded-full transition-colors duration-300 ${i === storyStep ? 'bg-emerald' : 'bg-border/50'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile: vertical flow ─────────────────────────────────────────── */}
        <div className="md:hidden flex flex-col items-center gap-4">
          <div className="w-full">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2 text-center">AI Models + Data Sources</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[...aiModels, ...dataSources].map((item, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-full border border-border/50 text-muted-foreground font-mono">{item.label}</span>
              ))}
            </div>
          </div>
          <div className="text-amber-500 text-lg font-mono">↓ raw input (may contain PII)</div>
          <div className="gradient-border glow-emerald p-4 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-emerald" />
              <p className="font-semibold text-emerald text-sm">GlobiGuard — mandatory proxy</p>
            </div>
            <div className="flex flex-col gap-1">
              {capabilities.map((cap, i) => (
                <div key={i} className="flex flex-col px-2 py-1.5 rounded text-xs">
                  <div className="flex items-center gap-1.5">
                    <cap.icon className="w-3 h-3 text-emerald flex-shrink-0" />
                    <span className="text-foreground/80 font-medium">{cap.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground pl-[18px] mt-0.5">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-emerald text-lg font-mono">↓ sanitized output (tokens only)</div>
          <div className="w-full">
            <div className="flex flex-wrap gap-2 justify-center">
              {tools.map((t, i) => (
                <span key={i} className={`text-[10px] px-2 py-1 rounded-full border font-mono ${t.bg} ${t.color}`}>
                  {t.status} {t.label}
                </span>
              ))}
              {frameworks.map((f, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-full border border-emerald/30 bg-emerald/5 text-emerald font-mono">✓ {f.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
