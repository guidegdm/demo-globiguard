import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleField } from '@/components/primitives/ParticleField';
import { GlassCardDiv } from '@/components/primitives/GlassCardDiv';

const SUBTITLES = [
  'Compliance middleware for regulated AI',
  'Sits between your data and every LLM',
  'Zero-knowledge enforcement — we can\'t see your data either',
];

const STATS = [
  { value: 0.8, suffix: 'ms', label: 'Detection latency', prefix: '' },
  { value: 12,  suffix: '',   label: 'Compliance frameworks', prefix: '' },
  { value: 4,   suffix: '',   label: 'Deployment models', prefix: '' },
];

function Counter({ to, suffix, prefix }: { to: number; suffix: string; prefix: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const dur = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setV(to * ease);
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [to]);
  return <>{prefix}{v.toFixed(to < 2 ? 1 : 0)}{suffix}</>;
}

export function HeroScene() {
  const [subtitleIdx, setSubtitleIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSubtitleIdx((i) => (i + 1) % SUBTITLES.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="hero"
      className="scroll-section relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: '#0F1117' }}
    >
      {/* Particle background */}
      <div className="absolute inset-0 z-0">
        <ParticleField
          width={typeof window !== 'undefined' ? window.innerWidth : 1400}
          height={typeof window !== 'undefined' ? window.innerHeight : 900}
          color="#10B981"
          density="low"
          className="h-full w-full"
        />
      </div>

      {/* Radial glow behind title */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(16,185,129,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          {/* Product badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            GlobiGuard v2.4
          </div>

          {/* Tagline */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            Your AI can see{' '}
            <span style={{ color: '#E53E3E' }}>everything</span>.
            <br />
            GlobiGuard decides{' '}
            <span style={{ color: '#10B981' }}>what it should</span>.
          </h1>
        </motion.div>

        {/* Rotating subtitle */}
        <div className="mt-6 h-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={subtitleIdx}
              className="text-lg text-white/55"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {SUBTITLES[subtitleIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Stat cards */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
            >
              <GlassCardDiv className="min-w-[140px] p-5 text-center" variant="default">
                <div className="text-3xl font-bold font-mono" style={{ color: '#10B981' }}>
                  <Counter to={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <div className="mt-1 text-xs text-white/50">{stat.label}</div>
              </GlassCardDiv>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll arrow */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-xs text-white/30">↓ Scroll to explore</span>
        <motion.div
          className="text-white/30 text-xl"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
}
