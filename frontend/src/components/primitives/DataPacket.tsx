import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* ─── types ────────────────────────────────────────────────────────── */

type Point = { x: number; y: number };
type PacketColor = 'emerald' | 'amber' | 'red' | 'purple' | 'blue';
type PacketSize = 'sm' | 'md' | 'lg';

interface DataPacketProps {
  path: Point[];
  delay?: number;
  duration?: number;
  playing?: boolean;
  color?: PacketColor;
  size?: PacketSize;
  repeat?: boolean;
  repeatDelay?: number;
  label?: string;
}

/* ─── colour map ───────────────────────────────────────────────────── */

const COLORS: Record<PacketColor, string> = {
  emerald: '#10B981',
  amber:   '#ED8936',
  red:     '#E53E3E',
  purple:  '#6B46C1',
  blue:    '#3B82F6',
};

const SIZE_MAP: Record<PacketSize, number> = { sm: 3, md: 5, lg: 8 };

/* ─── component ────────────────────────────────────────────────────── */

export function DataPacket({
  path,
  delay = 0,
  duration = 2,
  playing = true,
  color = 'emerald',
  size = 'md',
  repeat = false,
  repeatDelay = 1.5,
  label,
}: DataPacketProps) {
  const prefersReduced = useReducedMotion();
  const fill = COLORS[color];
  const r = SIZE_MAP[size];

  const xs = useMemo(() => path.map((p) => p.x), [path]);
  const ys = useMemo(() => path.map((p) => p.y), [path]);
  const labelYs = useMemo(() => path.map((p) => p.y - 14), [path]);

  const gradientId = `packetGrad-${path[0]?.x ?? 0}-${path[0]?.y ?? 0}-${color}`;

  if (!path.length || prefersReduced) return null;

  const transition = {
    duration,
    delay,
    ease: [0.42, 0, 0.58, 1] as const,
    repeat: repeat ? Infinity : 0,
    repeatDelay,
  };

  return (
    <g>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={fill} stopOpacity={1} />
          <stop offset="60%" stopColor={fill} stopOpacity={0.6} />
          <stop offset="100%" stopColor={fill} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Trail dot 3 */}
      <motion.circle r={r * 0.3} fill={fill} opacity={0}
        animate={playing ? { cx: xs, cy: ys, opacity: [0, 0.15, 0.15, 0] } : { opacity: 0 }}
        transition={{ ...transition, delay: delay + duration * 0.12 }} />

      {/* Trail dot 2 */}
      <motion.circle r={r * 0.4} fill={fill} opacity={0}
        animate={playing ? { cx: xs, cy: ys, opacity: [0, 0.25, 0.25, 0] } : { opacity: 0 }}
        transition={{ ...transition, delay: delay + duration * 0.07 }} />

      {/* Trail dot 1 */}
      <motion.circle r={r * 0.55} fill={fill} opacity={0}
        animate={playing ? { cx: xs, cy: ys, opacity: [0, 0.35, 0.35, 0] } : { opacity: 0 }}
        transition={{ ...transition, delay: delay + duration * 0.035 }} />

      {/* Glow halo */}
      <motion.circle r={r * 1.8} fill={`url(#${gradientId})`} opacity={0}
        filter="url(#softGlow)"
        animate={playing ? { cx: xs, cy: ys, opacity: [0, 0.5, 0.5, 0] } : { opacity: 0 }}
        transition={transition} />

      {/* Main dot */}
      <motion.circle r={r} fill={fill} opacity={0}
        filter="url(#softGlow)"
        animate={playing ? { cx: xs, cy: ys, opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={transition} />

      {/* Bright center */}
      <motion.circle r={r * 0.4} fill="white" opacity={0}
        animate={playing ? { cx: xs, cy: ys, opacity: [0, 0.8, 0.8, 0] } : { opacity: 0 }}
        transition={transition} />

      {/* Floating label */}
      {label && (
        <motion.text
          textAnchor="middle"
          fill={fill}
          fontSize={8}
          fontFamily="monospace"
          opacity={0}
          animate={playing ? { x: xs, y: labelYs, opacity: [0, 0, 0.85, 0.85, 0] } : { opacity: 0 }}
          transition={{ ...transition, delay: delay + 0.2 }}
        >
          {label}
        </motion.text>
      )}
    </g>
  );
}
