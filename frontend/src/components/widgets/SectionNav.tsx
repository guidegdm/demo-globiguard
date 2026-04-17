import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = [
  { id: 'hero',         label: 'What is GlobiGuard?' },
  { id: 'problem',      label: 'The Problem'          },
  { id: 'pipeline',     label: 'How It Works'         },
  { id: 'automation',   label: 'Automation Layer'     },
  { id: 'architecture', label: 'Architecture'         },
  { id: 'compliance',   label: 'Compliance'           },
];

export function SectionNav() {
  const [active, setActive] = useState('hero');
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.4 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <nav
      className="fixed right-6 top-1/2 z-40 flex flex-col items-center gap-3"
      style={{ transform: 'translateY(-50%)' }}
      aria-label="Section navigation"
    >
      {SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <div
            key={id}
            className="relative flex items-center"
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            <AnimatePresence>
              {hovered === id && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-6 whitespace-nowrap rounded px-2 py-1 text-xs font-medium"
                  style={{
                    background: 'rgba(15,17,23,0.95)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {label}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dot */}
            <button
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
              aria-label={`Navigate to ${label}`}
              className="h-2.5 w-2.5 rounded-full transition-all duration-200"
              style={
                isActive
                  ? { background: '#10b981', boxShadow: '0 0 8px #10b981' }
                  : { background: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }
              }
            />
          </div>
        );
      })}
    </nav>
  );
}
