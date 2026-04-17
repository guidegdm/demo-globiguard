import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCardDiv } from '@/components/primitives/GlassCardDiv';
import { useSceneAnimation } from '@/components/primitives/SceneWrapper';

interface PiiField {
  text: string;
  law: string;
  penalty: string;
}

const PII_FIELDS: PiiField[] = [
  { text: 'Sarah Mitchell', law: 'HIPAA §164.514(b)',  penalty: '$50,000/incident' },
  { text: '03/15/1987',     law: 'HIPAA PHI',          penalty: '$50,000/incident' },
  { text: 'ICD-10: E11.9',  law: 'HIPAA §164.502',     penalty: '$50,000/incident' },
  { text: '547-82-3901',    law: 'GLBA + PCI DSS',     penalty: '$100,000/violation' },
  { text: 'Metformin 500mg', law: 'HIPAA §164.512',    penalty: '$50,000/incident' },
];

function PiiSpan({ field }: { field: PiiField }) {
  const [hover, setHover] = useState(false);
  return (
    <span className="relative inline">
      <span
        className="cursor-pointer rounded px-1 font-semibold underline decoration-dotted"
        style={{ color: '#E53E3E', background: 'rgba(229,62,62,0.12)' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {field.text}
      </span>
      <AnimatePresence>
        {hover && (
          <motion.div
            className="absolute bottom-full left-1/2 mb-2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none"
            style={{ background: 'rgba(13,15,20,0.97)', border: '1px solid rgba(229,62,62,0.4)' }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="font-semibold" style={{ color: '#E53E3E' }}>{field.law}</div>
            <div className="mt-0.5 text-white/60">Max: {field.penalty}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function AnimCounter({ to, prefix, suffix, playing }: { to: number; prefix?: string; suffix?: string; playing: boolean }) {
  const [v, setV] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!playing) { setV(0); return; }
    const dur = 2000;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setV(to * ease);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, playing]);
  const display = to === 2.8 ? v.toFixed(1) : Math.round(v).toString();
  return <>{prefix ?? ''}{display}{suffix ?? ''}</>;
}

export function ProblemScene() {
  const { ref, isPlaying, epoch } = useSceneAnimation();

  return (
    <section id="problem" className="scroll-section py-20 px-4" style={{ background: '#0F1117' }}>
      <div ref={ref} className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">The Problem</h2>
          <p className="mt-3 text-white/50">Without GlobiGuard, regulated data flows unprotected into AI</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left panel — email with PII */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <GlassCardDiv variant="blocked" title="Without GlobiGuard" className="h-full p-5">
              <div className="mt-4 space-y-1 font-mono text-sm text-white/70">
                <div>To: adjuster@example.com</div>
                <div>From: intake@meridian-ins.com</div>
                <div className="mt-3 text-white/40">— claim_78234.txt —</div>
                <div className="mt-2">
                  Patient: <PiiSpan field={PII_FIELDS[0]} />
                </div>
                <div>
                  DOB: <PiiSpan field={PII_FIELDS[1]} />
                </div>
                <div>
                  Diagnosis: <PiiSpan field={PII_FIELDS[2]} />
                </div>
                <div>
                  SSN: <PiiSpan field={PII_FIELDS[3]} />
                </div>
                <div>
                  Medication: <PiiSpan field={PII_FIELDS[4]} />
                </div>
              </div>

              {/* "→ AI" indicator */}
              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1 border-t border-dashed border-red-500/40" />
                <motion.div
                  className="text-xs font-mono font-bold px-2 py-1 rounded"
                  style={{ color: '#E53E3E', background: 'rgba(229,62,62,0.15)', border: '1px solid rgba(229,62,62,0.4)' }}
                  animate={isPlaying ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  key={epoch}
                >
                  ⚠ PII EXPOSED
                </motion.div>
                <div className="flex-1 border-t border-dashed border-red-500/40" />
              </div>

              <p className="mt-3 text-xs text-white/35 italic">
                Hover each highlighted field to see which law is violated
              </p>
            </GlassCardDiv>
          </motion.div>

          {/* Right panel — exposure stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <GlassCardDiv variant="blocked" title="Meridian Insurance Exposure" className="h-full p-5">
              <div className="mt-4 flex flex-col items-center justify-center gap-6 py-4">
                <div className="text-center">
                  <div className="text-6xl font-bold font-mono" style={{ color: '#E53E3E' }}>
                    <AnimCounter to={847} playing={isPlaying} key={`847-${epoch}`} />
                  </div>
                  <div className="mt-2 text-sm text-white/50">potential HIPAA violations</div>
                </div>

                <div className="h-px w-full bg-white/08" />

                <div className="text-center">
                  <div className="text-4xl font-bold font-mono" style={{ color: '#E53E3E' }}>
                    $<AnimCounter to={2.8} suffix="M" playing={isPlaying} key={`2.8-${epoch}`} />
                  </div>
                  <div className="mt-2 text-sm text-white/50">estimated penalty exposure</div>
                </div>

                <div className="rounded-lg px-4 py-2 text-center text-xs text-white/40"
                  style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)' }}>
                  Before GlobiGuard — 3 months of unprotected AI usage
                </div>
              </div>
            </GlassCardDiv>
          </motion.div>
        </div>

        {/* Scroll prompt */}
        <motion.div
          className="mt-10 text-center text-sm text-white/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.5 }}
        >
          Scroll to see what GlobiGuard does instead →
        </motion.div>
      </div>
    </section>
  );
}
