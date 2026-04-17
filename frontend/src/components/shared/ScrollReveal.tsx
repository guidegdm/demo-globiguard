import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const ease = [0.21, 0.47, 0.32, 0.98] as const;

export function ScrollReveal({ children, delay = 0, direction = 'up', className = '' }: {
  children: React.ReactNode; delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none'; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-60px' });
  const initial = direction === 'left' ? { opacity: 0, x: -32 }
    : direction === 'right' ? { opacity: 0, x: 32 }
    : direction === 'none' ? { opacity: 0 }
    : { opacity: 0, y: 24 };
  return (
    <motion.div ref={ref} initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration: 0.6, delay, ease }}
      className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.1 }: {
  children: React.ReactNode; className?: string; staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-60px' });
  return (
    <motion.div ref={ref} className={className}
      initial="hidden" animate={isInView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: staggerDelay } } }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className}
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } } }}>
      {children}
    </motion.div>
  );
}
