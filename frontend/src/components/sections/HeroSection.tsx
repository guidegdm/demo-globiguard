import { useState, useEffect, lazy, Suspense } from 'react';
import { Zap, Shield, Clock } from 'lucide-react';
import { ScrollReveal } from '@/components/shared';

const HeroScene3D = lazy(() =>
  import('./HeroScene3D').then(m => ({ default: m.HeroScene3D }))
);

const codeLines = [
  { tokens: [{ text: "import", cls: "text-purple-400" }, { text: " { GlobiGuard } ", cls: "text-foreground" }, { text: "from", cls: "text-purple-400" }, { text: " '@globiguard/node'", cls: "text-emerald" }] },
  { tokens: [] },
  { tokens: [{ text: "const", cls: "text-blue-400" }, { text: " guard ", cls: "text-foreground" }, { text: "=", cls: "text-muted-foreground" }, { text: " new ", cls: "text-blue-400" }, { text: "GlobiGuard", cls: "text-yellow-400" }, { text: "({ apiKey: process.env.", cls: "text-foreground" }, { text: "GLOBIGUARD_KEY", cls: "text-emerald" }, { text: " })", cls: "text-foreground" }] },
  { tokens: [] },
  { tokens: [{ text: "const", cls: "text-blue-400" }, { text: " result ", cls: "text-foreground" }, { text: "=", cls: "text-muted-foreground" }, { text: " await ", cls: "text-purple-400" }, { text: "guard.", cls: "text-foreground" }, { text: "evaluate", cls: "text-yellow-400" }, { text: "(agentAction)", cls: "text-foreground" }] },
  { tokens: [] },
  { tokens: [{ text: "if", cls: "text-purple-400" }, { text: " (!", cls: "text-foreground" }, { text: "result.", cls: "text-foreground" }, { text: "allowed", cls: "text-emerald" }, { text: ") {", cls: "text-foreground" }] },
  { tokens: [{ text: "  // Block or escalate for human review", cls: "text-muted-foreground" }] },
  { tokens: [{ text: "  console.", cls: "text-foreground" }, { text: "log", cls: "text-yellow-400" }, { text: "(result.", cls: "text-foreground" }, { text: "reason", cls: "text-emerald" }, { text: ")", cls: "text-foreground" }] },
  { tokens: [{ text: "}", cls: "text-foreground" }] },
];

export function HeroSection() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= codeLines.length) return;
    const t = setTimeout(() => setVisibleLines(v => v + 1), 150);
    return () => clearTimeout(t);
  }, [visibleLines]);

  return (
    <section id="hero" className="scroll-section relative flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-background pointer-events-none" />
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald/8 blur-[140px] animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/6 blur-[120px] animate-float-medium pointer-events-none" />
      <div className="absolute top-3/4 left-1/2 w-64 h-64 rounded-full bg-blue-500/5 blur-[100px] animate-float-slow pointer-events-none" style={{ animationDelay: '-5s' }} />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-8">
        {/* Badge */}
        <ScrollReveal delay={0}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald/30 bg-emerald/10 text-xs font-mono text-emerald tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
            AI Governance Middleware · Control Plane
          </div>
        </ScrollReveal>

        {/* H1 */}
        <ScrollReveal delay={0.1}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Any AI. Any Tool.<br />
            <span className="bg-gradient-to-r from-emerald via-emerald-light to-emerald bg-clip-text text-transparent">Zero Risk.</span>
          </h1>
        </ScrollReveal>

        {/* Subtitle */}
        <ScrollReveal delay={0.2}>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
            GlobiGuard sits between your AI and everything it can touch — guarding data, enforcing policy, logging every decision in real time.
          </p>
        </ScrollReveal>

        {/* 3D scene: GlobiGuard core + orbiting model cards + data streams */}
        <ScrollReveal delay={0.3} className="w-full flex justify-center">
          <div className="w-full max-w-[480px] aspect-square mx-auto relative">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald/20 border border-emerald/40 flex items-center justify-center glow-emerald animate-breathe">
                  <span className="text-emerald font-bold font-mono text-lg">[ ]</span>
                </div>
              </div>
            }>
              <HeroScene3D />
            </Suspense>
          </div>
        </ScrollReveal>

        {/* Code card */}
        <ScrollReveal delay={0.4} className="w-full max-w-2xl">
          <div className="gradient-border shine-effect glow-emerald relative p-0 overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-muted-foreground font-mono ml-2">app.ts</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">TypeScript</span>
            </div>
            {/* Code */}
            <div className="p-4 font-mono text-sm text-left relative">
              {codeLines.map((line, i) => (
                <div key={i} className={`leading-relaxed min-h-[1.6rem] ${i === visibleLines - 1 && visibleLines < codeLines.length ? 'typing-cursor' : ''}`}>
                  {i < visibleLines
                    ? line.tokens.length === 0
                      ? <span>&nbsp;</span>
                      : line.tokens.map((t, j) => <span key={j} className={t.cls}>{t.text}</span>)
                    : null}
                </div>
              ))}
            </div>
            {/* Annotation */}
            <div className="absolute right-3 bottom-3 token-pill">3 lines to integrate</div>
          </div>
        </ScrollReveal>

        {/* Stats row */}
        <ScrollReveal delay={0.5} className="w-full">
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { icon: Clock, label: 'average latency', value: '<3ms' },
              { icon: Shield, label: 'PII types detected', value: '40+' },
              { icon: Zap, label: 'compliance frameworks', value: '14' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card/50">
                <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald" />
                </div>
                <span className="text-2xl font-bold text-foreground font-mono">{value}</span>
                <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
