import { Layers, Shield, Lock } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/shared';

const principles = [
  {
    icon: Layers,
    title: 'Any Model',
    body: 'GPT-4o, Claude, Gemini, Llama, or any custom model. GlobiGuard is model-agnostic.',
  },
  {
    icon: Shield,
    title: 'Your Rules',
    body: 'You define the policies. GlobiGuard enforces them on every action, every time.',
  },
  {
    icon: Lock,
    title: 'Zero Leaks',
    body: 'Your data never leaves your environment. All evaluation runs inside your infrastructure.',
  },
];

export function VisionSection() {
  return (
    <section id="vision" className="scroll-section relative px-4 py-32 overflow-hidden flex flex-col items-center justify-center">
      {/* Dramatic orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald/6 blur-[200px] animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/4 blur-[160px] animate-float-medium pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center gap-12">
        <ScrollReveal className="text-center">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">The Mission</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-center leading-[1.1] mb-6">
            Enable every team to use any AI —<br />
            <span className="bg-gradient-to-r from-emerald via-emerald-light to-emerald bg-clip-text text-transparent">
              without risk, without compromise.
            </span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Any frontier model. Your rules. Your data stays yours. Full audit trail. Zero friction.
          </p>
        </ScrollReveal>

        {/* Principle cards */}
        <StaggerContainer className="flex flex-col sm:flex-row gap-4 justify-center items-stretch" staggerDelay={0.15}>
          {principles.map((p, i) => (
            <StaggerItem key={i}>
              <div className="gradient-border p-6 max-w-xs hover:glow-emerald transition-all duration-500 cursor-default group">
                <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mb-4">
                  <p.icon className="w-5 h-5 text-emerald" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Glowing divider */}
        <div className="w-full max-w-2xl" style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, oklch(0.7 0.18 165 / 0.6), transparent)',
          boxShadow: '0 0 20px oklch(0.7 0.18 165 / 0.3)',
        }} />

        <ScrollReveal>
          <p className="text-muted-foreground text-center text-sm tracking-wide">
            Built for regulated industries. Designed for every developer.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
