import { Puzzle, Eye, AlertTriangle } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/shared';

const cards = [
  {
    icon: Puzzle,
    iconBg: 'bg-red-500/10',
    iconBorder: 'border-red-500/20',
    iconColor: 'text-red-400',
    title: 'No permission layer',
    body: 'You gave your AI access. You never approved every action it takes.',
    statLabel: 'No limits set',
    statColor: 'text-red-400',
  },
  {
    icon: Eye,
    iconBg: 'bg-amber-500/10',
    iconBorder: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    title: 'Zero delay',
    body: 'Your client data moves before you see it. AI executes in milliseconds.',
    statLabel: '0ms between AI output and real-world impact',
    statColor: 'text-amber-400',
  },
  {
    icon: AlertTriangle,
    iconBg: 'bg-orange-500/10',
    iconBorder: 'border-orange-500/20',
    iconColor: 'text-orange-400',
    title: 'You are responsible. Regardless.',
    body: 'HIPAA, GDPR, SOC2 — every framework puts accountability on you. Not on the AI.',
    statLabel: '$4.45M average breach cost',
    statColor: 'text-orange-400',
  },
];

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    e.currentTarget.style.transform = `perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) scale(1.02)`;
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
  };
  return (
    <div
      className={`transition-transform duration-300 will-change-transform ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

const beforeRows = [
  { label: 'SSN', dest: 'GPT-4', status: '⚠️' },
  { label: 'Email', dest: 'External API', status: '⚠️' },
  { label: 'PHI', dest: 'Slack', status: '⚠️' },
];
const afterRows = [
  { label: '[TOKEN_7823]', dest: 'GPT-4', status: '✓' },
  { label: '[Blocked]', dest: 'External API', status: '✓' },
  { label: '[REDACTED]', dest: 'Slack', status: '✓' },
];

export function ProblemSection() {
  return (
    <section id="problem" className="scroll-section relative px-4 py-24 overflow-hidden">
      <div className="section-divider mb-16" />

      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-red-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-amber-500/4 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">The Problem</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            AI is operating inside your business.{' '}
            <span className="text-red-400">Nobody is governing it.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Most teams assume someone else has this covered. Nobody does.
          </p>
        </ScrollReveal>

        {/* Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" staggerDelay={0.15}>
          {cards.map((card, i) => (
            <StaggerItem key={i}>
              <TiltCard>
                <div className="gradient-border p-6 h-full cursor-default">
                  <div className={`w-10 h-10 rounded-lg ${card.iconBg} border ${card.iconBorder} flex items-center justify-center mb-4`}>
                    <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{card.body}</p>
                  <div className={`text-sm font-mono font-semibold ${card.statColor}`}>{card.statLabel}</div>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Before / After */}
        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <p className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Without GlobiGuard
              </p>
              <div className="space-y-3">
                {beforeRows.map((row, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-mono">
                    <span className="text-red-300 bg-red-500/10 px-2 py-0.5 rounded text-xs">{row.label}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground">{row.dest}</span>
                    <span className="ml-auto text-red-400">{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* After */}
            <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-6">
              <p className="text-sm font-semibold text-emerald mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald" />
                With GlobiGuard
              </p>
              <div className="space-y-3">
                {afterRows.map((row, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-mono">
                    <span className="text-emerald bg-emerald/10 px-2 py-0.5 rounded text-xs">{row.label}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground">{row.dest}</span>
                    <span className="ml-auto text-emerald">{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
