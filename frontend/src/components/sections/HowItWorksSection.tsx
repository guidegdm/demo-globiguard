import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Zap, ScanSearch, ShieldCheck, Cpu, Activity, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/shared';

const stages = [
  { icon: Zap, title: 'AI Request', latency: 'Agent', accent: '#facc15', iconClass: 'text-yellow-400', bgClass: 'bg-yellow-400/10', borderClass: 'border-yellow-400/20' },
  { icon: ScanSearch, title: 'Input Guard', latency: '~1ms', accent: '#60a5fa', iconClass: 'text-blue-400', bgClass: 'bg-blue-400/10', borderClass: 'border-blue-400/20' },
  { icon: ShieldCheck, title: 'Policy Check', latency: '~1ms', accent: '#c084fc', iconClass: 'text-purple-400', bgClass: 'bg-purple-400/10', borderClass: 'border-purple-400/20' },
  { icon: Cpu, title: 'AI Model', latency: 'External', accent: '#10b981', iconClass: 'text-emerald', bgClass: 'bg-emerald/10', borderClass: 'border-emerald/20' },
  { icon: Activity, title: 'Output Guard', latency: '~1ms', accent: '#22d3ee', iconClass: 'text-cyan-400', bgClass: 'bg-cyan-400/10', borderClass: 'border-cyan-400/20' },
  { icon: CheckCircle2, title: 'Audit Log', latency: 'Sync', accent: '#10b981', iconClass: 'text-emerald', bgClass: 'bg-emerald/10', borderClass: 'border-emerald/20' },
];

function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false });

  useEffect(() => {
    if (!isInView) { setVal(0); return; }
    let start: number | null = null;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [isInView, target, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// PII overlay shown above Input Guard
function PiiOverlay({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 bg-red-500/90 rounded-lg px-3 py-2 text-xs font-mono text-white shadow-lg z-20 whitespace-nowrap"
        >
          PII detected: SSN, Name
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-500/90" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CounterFloat({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false });
  useEffect(() => {
    if (!isInView) { setVal(0); return; }
    let start: number | null = null;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 2000, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(parseFloat((ease * target).toFixed(1)));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [isInView, target]);
  return <span ref={ref}>{val.toFixed(1)}{suffix}</span>;
}

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-80px' });
  const [activeStage, setActiveStage] = useState(0);
  const [showPii, setShowPii] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => {
      setActiveStage(s => {
        const next = (s + 1) % stages.length;
        setShowPii(next === 1);
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isInView]);

  return (
    <section id="how-it-works" className="scroll-section relative px-4 py-24 overflow-hidden" ref={ref}>
      <div className="section-divider mb-16" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-emerald/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">Every Request, Fully Governed</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Six stages of protection, two milliseconds of overhead. Your AI runs faster, safer.
          </p>
        </ScrollReveal>

        {/* Pipeline */}
        <div className="flex items-center gap-0 overflow-x-auto pb-4 mb-16">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              {/* Connector */}
              {i > 0 && (
                <div className="relative w-8 h-px bg-border/50 flex-shrink-0">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ height: 2, top: -0.5, backgroundColor: stage.accent }}
                    animate={isInView && activeStage >= i ? { width: '100%' } : { width: '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
              {/* Stage box */}
              <div className="relative">
                {i === 1 && <PiiOverlay active={showPii} />}
                <motion.div
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border w-24 transition-all duration-300 ${stage.bgClass} ${stage.borderClass}`}
                  animate={activeStage === i
                    ? { boxShadow: `0 0 20px ${stage.accent}40` }
                    : { boxShadow: 'none' }
                  }
                >
                  <div className={`w-10 h-10 rounded-xl ${stage.bgClass} border ${stage.borderClass} flex items-center justify-center`}>
                    <stage.icon className={`w-5 h-5 ${stage.iconClass}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-foreground leading-tight">{stage.title}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{stage.latency}</p>
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
              </div>
            </div>
          ))}
        </div>

        {/* Counters */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { prefix: '', value: 1.2, suffix: 'M+', label: 'requests inspected', decimals: 1 },
            { prefix: '', value: 99.7, suffix: '%', label: 'detection accuracy', decimals: 1 },
            { prefix: '<', value: 3, suffix: 'ms', label: 'average latency', decimals: 0 },
          ].map((stat, i) => (
            <ScrollReveal key={i} delay={i * 0.1} className="text-center">
              <div className="gradient-border p-6">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald mb-1">
                  {stat.prefix}
                  {stat.decimals === 1 ? (
                    <CounterFloat target={stat.value} suffix={stat.suffix} />
                  ) : (
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
