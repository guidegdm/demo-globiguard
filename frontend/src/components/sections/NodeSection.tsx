import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Lock, ClipboardList, Activity, BarChart3, Key } from 'lucide-react';
import { ScrollReveal } from '@/components/shared';

const aiModels = [
  { label: 'GPT-4o', color: '#10a37f' },
  { label: 'Claude 3.5', color: '#d97706' },
  { label: 'Gemini 1.5', color: '#4285f4' },
  { label: 'Llama 3', color: '#9333ea' },
  { label: 'Custom', color: '#6b7280' },
];
const dataPools = [
  { label: 'CRM', color: '#06b6d4' },
  { label: 'EHR', color: '#ef4444' },
  { label: 'Legal Docs', color: '#f59e0b' },
  { label: 'Files', color: '#3b82f6' },
  { label: 'REST APIs', color: '#10b981' },
];
const tools = [
  { label: 'Web Search', status: '✓', color: 'text-emerald', bg: 'bg-emerald/10 border-emerald/20' },
  { label: 'Database', status: '✓', color: 'text-emerald', bg: 'bg-emerald/10 border-emerald/20' },
  { label: 'Code Exec', status: '✗', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { label: 'Email', status: '~', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { label: 'HTTP API', status: '✓', color: 'text-emerald', bg: 'bg-emerald/10 border-emerald/20' },
];
const capabilities = [
  { icon: Lock, label: 'Guard & Mask' },
  { icon: ClipboardList, label: 'Policy Engine' },
  { icon: Activity, label: 'Flow Monitor' },
  { icon: BarChart3, label: 'Compliance Trail' },
  { icon: Key, label: 'Token Manager' },
];
const frameworks = ['HIPAA ✓', 'GDPR ✓', 'SOC2 ✓', 'EU AI Act ✓'];

export function NodeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-80px' });
  const [activeCap, setActiveCap] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => setActiveCap(c => (c + 1) % capabilities.length), 1500);
    return () => clearInterval(t);
  }, [isInView]);

  return (
    <section id="node" className="scroll-section relative px-4 py-24 overflow-hidden" ref={ref}>
      <div className="section-divider mb-16" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald/4 blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">The Architecture</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">The Control Plane</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            One node. Every AI. Every tool. Every data source. Fully governed.
          </p>
        </ScrollReveal>

        {/* Desktop diagram */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
          {/* Left column */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">AI Models</p>
              <div className="flex flex-col gap-2">
                {aiModels.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedModel(selectedModel === m.label ? null : m.label)}
                    className="relative flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-mono transition-all duration-200 text-left"
                    style={{
                      borderColor: selectedModel === m.label ? m.color : `${m.color}30`,
                      backgroundColor: selectedModel === m.label ? `${m.color}15` : `${m.color}08`,
                      color: selectedModel === m.label ? m.color : '#9ca3af',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.label}
                    {selectedModel === m.label && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-card/95 border border-border/50 rounded-lg p-3 text-xs z-20 shadow-xl w-48">
                        <p className="font-semibold mb-1" style={{ color: m.color }}>{m.label}</p>
                        <p className="text-muted-foreground">Fully supported · All features active</p>
                        <p className="text-muted-foreground">Streaming · Function calling · Vision</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Data Pools</p>
              <div className="flex flex-col gap-2">
                {dataPools.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-mono"
                    style={{ borderColor: `${d.color}30`, backgroundColor: `${d.color}08`, color: '#9ca3af' }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - GlobiGuard box */}
          <div className="gradient-border animate-breathe glow-emerald-strong p-6 w-56">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
              <div className="w-8 h-8 rounded-lg bg-emerald/20 border border-emerald/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald" />
              </div>
              <span className="font-semibold text-sm text-foreground">GlobiGuard</span>
            </div>
            <div className="flex flex-col gap-1">
              {capabilities.map((cap, i) => (
                <motion.button
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-300 text-left w-full"
                  animate={activeCap === i
                    ? { backgroundColor: 'oklch(0.7 0.18 165 / 0.15)', borderColor: 'oklch(0.7 0.18 165 / 0.3)' }
                    : { backgroundColor: 'transparent', borderColor: 'transparent' }
                  }
                  style={{ border: '1px solid transparent' }}
                >
                  <cap.icon className={`w-3.5 h-3.5 flex-shrink-0 ${activeCap === i ? 'text-emerald' : 'text-muted-foreground'}`} />
                  <span className={activeCap === i ? 'text-emerald' : 'text-muted-foreground'}>{cap.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Tools & Actions</p>
              <div className="flex flex-col gap-2">
                {tools.map((t, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-mono ${t.bg}`}>
                    <span className={`font-bold ${t.color}`}>{t.status}</span>
                    <span className="text-muted-foreground">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Compliance</p>
              <div className="flex flex-col gap-2">
                {frameworks.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald/20 bg-emerald/5 text-sm font-mono text-emerald">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: vertical flow */}
        <div className="md:hidden flex flex-col items-center gap-4">
          <div className="w-full max-w-xs">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 text-center">AI Models → Data Pools</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[...aiModels, ...dataPools].map((item, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full border border-border/50 text-muted-foreground font-mono">{item.label}</span>
              ))}
            </div>
          </div>
          <div className="text-emerald text-2xl">↓</div>
          <div className="gradient-border glow-emerald p-4 w-full max-w-xs">
            <p className="text-center font-semibold text-emerald mb-3 text-sm">GlobiGuard</p>
            <div className="flex flex-col gap-1">
              {capabilities.map((cap, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1">
                  <cap.icon className="w-3 h-3 text-emerald" />
                  {cap.label}
                </div>
              ))}
            </div>
          </div>
          <div className="text-emerald text-2xl">↓</div>
          <div className="w-full max-w-xs">
            <div className="flex flex-wrap gap-2 justify-center">
              {[...tools.map(t => ({ label: t.label, color: t.color })), ...frameworks.map(f => ({ label: f, color: 'text-emerald' }))].map((item, i) => (
                <span key={i} className={`text-xs px-2 py-1 rounded-full border border-border/50 font-mono ${item.color}`}>{item.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
