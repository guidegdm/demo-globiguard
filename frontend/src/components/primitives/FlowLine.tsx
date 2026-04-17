import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* ─── types ────────────────────────────────────────────────────────── */

type Point = { x: number; y: number };
type FlowVariant = 'default' | 'queue' | 'blocked' | 'active';

interface FlowLineProps {
  from: Point;
  to: Point;
  delay?: number;
  duration?: number;
  playing?: boolean;
  variant?: FlowVariant;
  strokeWidth?: number;
  curvature?: number;
  label?: string;
}

/* ─── colour map ───────────────────────────────────────────────────── */

const STROKE: Record<FlowVariant, string> = {
  default: '#10B981',
  queue:   '#ED8936',
  blocked: '#E53E3E',
  active:  '#10B981',
};

/* ─── helpers ──────────────────────────────────────────────────────── */

function buildPath(from: Point, to: Point, curvature: number): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const isHorizontal = Math.abs(dx) > Math.abs(dy);

  if (isHorizontal) {
    const cp1x = from.x + dx * curvature;
    const cp1y = from.y;
    const cp2x = to.x - dx * curvature;
    const cp2y = to.y;
    return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
  }

  const offset = Math.abs(dx) * 0.5 + 30;
  const cp1x = from.x + offset * Math.sign(dx || 1);
  const cp1y = from.y + dy * 0.3;
  const cp2x = to.x - offset * Math.sign(dx || 1) * 0.3;
  const cp2y = to.y - dy * 0.3;
  return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
}

function estimatePathLength(from: Point, to: Point): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy) * 1.4;
}

function midpoint(from: Point, to: Point): Point {
  return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
}

/* ─── component ────────────────────────────────────────────────────── */

export function FlowLine({
  from,
  to,
  delay = 0,
  duration = 1.2,
  playing = true,
  variant = 'default',
  strokeWidth = 2,
  curvature = 0.35,
  label,
}: FlowLineProps) {
  const prefersReduced = useReducedMotion();
  const color = STROKE[variant];

  const d = useMemo(() => buildPath(from, to, curvature), [from, to, curvature]);
  const len = useMemo(() => estimatePathLength(from, to), [from, to]);
  const mid = useMemo(() => midpoint(from, to), [from, to]);

  const gradientId = `flowGrad-${from.x}-${from.y}-${to.x}-${to.y}-${variant}`;

  const isDashed = variant === 'queue';
  const isBlocked = variant === 'blocked';
  const glowOpacity = variant === 'active' ? 0.25 : 0.15;

  if (prefersReduced) {
    return (
      <g>
        <path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" opacity={isBlocked ? 0.3 : 0.5}
          strokeDasharray={isDashed ? '8 4' : undefined} />
        {label && (
          <text x={mid.x} y={mid.y - 8} textAnchor="middle" fill={color} fontSize={9}
            fontFamily="monospace" opacity={0.7}>{label}</text>
        )}
      </g>
    );
  }

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1={from.x} y1={from.y} x2={to.x} y2={to.y} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity={0.9} />
          <stop offset="80%" stopColor={color} stopOpacity={0.5} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Glow underlayer */}
      <motion.path
        d={d}
        stroke={color}
        strokeWidth={strokeWidth + 4}
        fill="none"
        opacity={glowOpacity}
        filter="url(#softGlow)"
        strokeLinecap="round"
        strokeDasharray={isDashed ? '8 4' : undefined}
        initial={{ strokeDasharray: isDashed ? '8 4' : `${len}`, strokeDashoffset: len }}
        animate={playing ? { strokeDashoffset: 0 } : { strokeDashoffset: len }}
        transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      />

      {/* Main stroke */}
      <motion.path
        d={d}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        opacity={isBlocked ? 0.35 : 1}
        strokeDasharray={isDashed ? '8 4' : undefined}
        initial={{ strokeDasharray: isDashed ? '8 4' : `${len}`, strokeDashoffset: len }}
        animate={playing ? { strokeDashoffset: 0 } : { strokeDashoffset: len }}
        transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      />

      {/* Label at midpoint */}
      {label && (
        <motion.text
          x={mid.x}
          y={mid.y - 8}
          textAnchor="middle"
          fill={color}
          fontSize={9}
          fontFamily="monospace"
          initial={{ opacity: 0 }}
          animate={playing ? { opacity: 0.75 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: delay + duration * 0.6 }}
        >
          {label}
        </motion.text>
      )}
    </g>
  );
}
