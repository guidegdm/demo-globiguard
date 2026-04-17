import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  { id: 'hero', label: 'Hero' },
  { id: 'problem', label: 'Problem' },
  { id: 'node', label: 'The Node' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'integration', label: 'Integration' },
  { id: 'vision', label: 'Vision' },
];

export function SectionNav() {
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { threshold: 0.3 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
      {sections.map(({ id, label }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
            onMouseEnter={() => setHoveredSection(id)}
            onMouseLeave={() => setHoveredSection(null)}
            className="relative flex items-center justify-end gap-2 group"
            aria-label={label}
          >
            <AnimatePresence>
              {hoveredSection === id && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className="text-xs font-mono text-muted-foreground bg-card/90 border border-border/50 px-2 py-1 rounded whitespace-nowrap shadow-lg"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            <motion.div
              animate={isActive
                ? { width: 10, height: 10, backgroundColor: 'oklch(0.7 0.18 165)' }
                : { width: 8, height: 8, backgroundColor: hoveredSection === id ? 'oklch(0.7 0.18 165 / 0.4)' : 'oklch(0.25 0.01 250)' }
              }
              transition={{ duration: 0.2 }}
              className="rounded-full will-change-transform"
            />
          </button>
        );
      })}
    </nav>
  );
}
