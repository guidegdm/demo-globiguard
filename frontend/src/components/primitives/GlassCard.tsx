import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

/* ─── types ────────────────────────────────────────────────────────── */

type CardVariant = 'default' | 'queue' | 'blocked' | 'allowed';

interface GlassCardProps {
  x: number;
  y: number;
  width: number;
  height: number;
  children?: ReactNode;
  variant?: CardVariant;
  title?: string;
  label?: string;
  playing?: boolean;
  delay?: number;
  rx?: number;
}

/* ─── variant colours ─────────────────────────────────────────────── */

const ACCENT: Record<CardVariant, string> = {
  default: '#10B981',
  queue:   '#ED8936',
  blocked: '#E53E3E',
  allowed: '#38A169',
};

const FILL: Record<CardVariant, string> = {
  default: 'rgba(16,185,129,0.05)',
  queue:   'rgba(237,137,54,0.08)',
  blocked: 'rgba(229,62,62,0.08)',
  allowed: 'rgba(56,161,105,0.05)',
};

/* ─── component (SVG) ─────────────────────────────────────────────── */

export function GlassCard({
  x,
  y,
  width,
  height,
  children,
  variant = 'default',
  title,
  label,
  playing = true,
  delay = 0,
  rx = 8,
}: GlassCardProps) {
  const accent = ACCENT[variant];
  const fill   = FILL[variant];

  return (
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={playing ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Card body */}
      <rect
        x={x} y={y} width={width} height={height}
        rx={rx}
        fill="rgba(15,17,23,0.82)"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={1}
        filter="url(#cardShadow)"
      />

      {/* Inner fill tint */}
      <rect
        x={x + 1} y={y + 1} width={width - 2} height={height - 2}
        rx={rx - 1}
        fill={fill}
      />

      {/* Top accent bar */}
      <rect
        x={x + rx} y={y}
        width={width - rx * 2} height={2}
        rx={1}
        fill={accent}
        opacity={0.9}
      />

      {/* Optional title text */}
      {title && (
        <text
          x={x + width / 2}
          y={y + 18}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={accent}
          fontSize={9}
          fontWeight="600"
          letterSpacing={1.5}
          textDecoration="none"
          style={{ textTransform: 'uppercase' }}
        >
          {title}
        </text>
      )}

      {/* Optional label (larger centred text) */}
      {label && (
        <text
          x={x + width / 2}
          y={y + height / 2 + (title ? 6 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.85)"
          fontSize={11}
          fontWeight="500"
        >
          {label}
        </text>
      )}

      {children}
    </motion.g>
  );
}
