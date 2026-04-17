import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* ─── PIIBadge ────────────────────────────────────────────────────── */

type PIIVariant = 'pii' | 'token' | 'safe';
type PIITier = 1 | 2 | 3;

interface PIIBadgeProps {
  x: number;
  y: number;
  label: string;
  variant?: PIIVariant;
  tier?: PIITier;
  playing?: boolean;
  delay?: number;
}

const PII_COLOR: Record<PIIVariant, string> = {
  pii:   '#E53E3E',
  token: '#10B981',
  safe:  '#4A5568',
};

const PII_BG: Record<PIIVariant, string> = {
  pii:   'rgba(229,62,62,0.15)',
  token: 'rgba(16,185,129,0.12)',
  safe:  'rgba(74,85,104,0.1)',
};

const TIER_OPACITY: Record<PIITier, number> = { 1: 1, 2: 0.8, 3: 0.6 };

export function PIIBadge({
  x, y, label,
  variant = 'pii',
  tier = 1,
  playing = true,
  delay = 0,
}: PIIBadgeProps) {
  const prefersReduced = useReducedMotion();
  const color = PII_COLOR[variant];
  const bg    = PII_BG[variant];
  const width = Math.max(60, label.length * 7 + 16);

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.85 }}
      animate={playing ? { opacity: TIER_OPACITY[tier], scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={prefersReduced ? { duration: 0 } : { duration: 0.35, delay }}
    >
      <rect
        x={x - width / 2} y={y - 11}
        width={width} height={22}
        rx={11}
        fill={bg}
        stroke={color}
        strokeWidth={1.5}
        opacity={0.9}
      />
      <text
        x={x} y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={10}
        fontFamily="monospace"
        fontWeight="500"
      >
        {label}
      </text>
    </motion.g>
  );
}

/* ─── StatusIndicator ─────────────────────────────────────────────── */

type StatusState = 'ALLOW' | 'MODIFY' | 'QUEUE' | 'BLOCK' | 'IDLE';

interface StatusIndicatorProps {
  x: number;
  y: number;
  status: StatusState;
  playing?: boolean;
  delay?: number;
  showLabel?: boolean;
}

const STATUS_COLOR: Record<StatusState, string> = {
  ALLOW:  '#38A169',
  MODIFY: '#ECC94B',
  QUEUE:  '#ED8936',
  BLOCK:  '#E53E3E',
  IDLE:   '#4A5568',
};

const STATUS_PULSE: Record<StatusState, number> = {
  ALLOW:  0,
  MODIFY: 0,
  QUEUE:  1.8,
  BLOCK:  0,
  IDLE:   0,
};

export function StatusIndicator({
  x, y, status,
  playing = true,
  delay = 0,
  showLabel = true,
}: StatusIndicatorProps) {
  const prefersReduced = useReducedMotion();
  const color      = STATUS_COLOR[status];
  const pulsePeriod = STATUS_PULSE[status];
  const doPulse    = pulsePeriod > 0 && playing && !prefersReduced;

  const labelOffset = showLabel ? 20 : 0;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={playing ? { opacity: 1 } : { opacity: 0 }}
      transition={prefersReduced ? { duration: 0 } : { duration: 0.3, delay }}
    >
      {/* Outer pulsing ring */}
      <AnimatePresence>
        {doPulse && (
          <motion.circle
            key={`pulse-${status}`}
            cx={x} cy={y} r={8}
            stroke={color}
            strokeWidth={2}
            fill="none"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: pulsePeriod, ease: 'easeInOut' }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        )}
      </AnimatePresence>

      {/* Core dot */}
      <circle cx={x} cy={y} r={5} fill={color} />
      <circle cx={x} cy={y} r={3} fill="white" opacity={0.4} />

      {/* Label */}
      {showLabel && (
        <text
          x={x + labelOffset} y={y + 1}
          dominantBaseline="middle"
          fill={color}
          fontSize={10}
          fontWeight="600"
          fontFamily="monospace"
          letterSpacing={1}
        >
          {status}
        </text>
      )}
    </motion.g>
  );
}

/* ─── AnimatedCounter ─────────────────────────────────────────────── */

import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  x: number;
  y: number;
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  playing?: boolean;
  delay?: number;
  fill?: string;
  fontSize?: number;
  fontWeight?: string | number;
}

export function AnimatedCounter({
  x, y,
  from = 0,
  to,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  playing = true,
  delay = 0,
  fill = 'rgba(255,255,255,0.9)',
  fontSize = 24,
  fontWeight = 'bold',
}: AnimatedCounterProps) {
  const prefersReduced = useReducedMotion();
  const [value, setValue] = useState(from);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    if (!playing) {
      setValue(from);
      return;
    }
    const timeout = setTimeout(() => {
      const totalDur = prefersReduced ? 0 : duration * 1000;

      if (totalDur === 0) {
        setValue(to);
        return;
      }

      startRef.current = null;
      const animate = (ts: number) => {
        if (!startRef.current) startRef.current = ts;
        const elapsed = ts - startRef.current;
        const progress = Math.min(elapsed / totalDur, 1);
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        setValue(from + (to - from) * eased);
        if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [playing, from, to, duration, delay, prefersReduced]);

  const display = `${prefix}${value.toFixed(decimals)}${suffix}`;

  return (
    <text
      x={x} y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={fill}
      fontSize={fontSize}
      fontWeight={fontWeight}
      fontFamily="monospace"
    >
      {display}
    </text>
  );
}
