import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* ─── types ────────────────────────────────────────────────────────── */

interface RiskGaugeProps {
  x: number;
  y: number;
  radius?: number;
  value: number;            /* 0.0 – 1.0 */
  playing?: boolean;
  delay?: number;
  showValue?: boolean;
  showLabel?: boolean;
}

/* ─── zone definitions ────────────────────────────────────────────── */

const ZONES = [
  { min: 0,    max: 0.40, color: '#38A169', label: 'ALLOW'  },
  { min: 0.40, max: 0.70, color: '#ECC94B', label: 'MODIFY' },
  { min: 0.70, max: 0.90, color: '#ED8936', label: 'QUEUE'  },
  { min: 0.90, max: 1.00, color: '#E53E3E', label: 'BLOCK'  },
];

function getColor(v: number): string {
  const zone = ZONES.find((z) => v >= z.min && v <= z.max);
  return zone?.color ?? '#E53E3E';
}

function getZoneLabel(v: number): string {
  const zone = ZONES.find((z) => v >= z.min && v <= z.max);
  return zone?.label ?? 'BLOCK';
}

/* ─── arc helpers ─────────────────────────────────────────────────── */

const START_ANGLE = -210; /* degrees – bottom-left */
const SWEEP       = 240;  /* total arc sweep        */
const DEG         = Math.PI / 180;

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const a = angleDeg * DEG;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start  = polarToXY(cx, cy, r, startDeg);
  const end    = polarToXY(cx, cy, r, endDeg);
  const large  = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep  = endDeg > startDeg ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${large} ${sweep} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

/* ─── component ────────────────────────────────────────────────────── */

export function RiskGauge({
  x,
  y,
  radius  = 52,
  value,
  playing = true,
  delay   = 0,
  showValue = true,
  showLabel = true,
}: RiskGaugeProps) {
  const prefersReduced = useReducedMotion();
  const clampedValue   = Math.min(1, Math.max(0, value));
  const color          = getColor(clampedValue);
  const zoneLabel      = getZoneLabel(clampedValue);

  /* Arc geometry */
  const trackR = radius;
  const barR   = radius - 1;

  const trackStart = START_ANGLE;
  const trackEnd   = START_ANGLE + SWEEP;

  const barEndAngle = START_ANGLE + SWEEP * clampedValue;

  /* Needle */
  const needleAngle = START_ANGLE + SWEEP * clampedValue;
  const needleTip   = polarToXY(x, y, radius - 4, needleAngle);

  /* Zone arcs (rendered as track segments) */
  const zoneArcs = ZONES.map((zone) => {
    const startDeg = START_ANGLE + SWEEP * zone.min;
    const endDeg   = START_ANGLE + SWEEP * zone.max;
    return { ...zone, startDeg, endDeg };
  });

  const displayValue = (clampedValue * 100).toFixed(0);

  return (
    <g>
      {/* Background track */}
      <path
        d={arcPath(x, y, trackR, trackStart, trackEnd)}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={12}
        fill="none"
        strokeLinecap="round"
      />

      {/* Zone colour segments */}
      {zoneArcs.map((z) => (
        <path
          key={z.label}
          d={arcPath(x, y, barR, z.startDeg, z.endDeg)}
          stroke={z.color}
          strokeWidth={8}
          fill="none"
          opacity={0.25}
        />
      ))}

      {/* Active value arc */}
      <motion.path
        d={arcPath(x, y, barR, trackStart, barEndAngle)}
        stroke={color}
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        filter={`url(#${color === '#ED8936' ? 'amberGlow' : color === '#E53E3E' ? 'redGlow' : 'softGlow'})`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={playing ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={prefersReduced ? { duration: 0 } : { duration: 1.2, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      />

      {/* Needle */}
      <motion.line
        x1={x}
        y1={y}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={{ rotate: -SWEEP / 2 * DEG * 57.3, opacity: 0 }}
        animate={playing ? { opacity: 1 } : { opacity: 0 }}
        transition={prefersReduced ? { duration: 0 } : { duration: 1.2, delay }}
      />
      <circle cx={x} cy={y} r={4} fill={color} />

      {/* Centre value text */}
      {showValue && (
        <motion.text
          x={x} y={y + 20}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={18}
          fontWeight="bold"
          fontFamily="monospace"
          initial={{ opacity: 0 }}
          animate={playing ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: delay + 0.8 }}
        >
          {displayValue}
        </motion.text>
      )}

      {/* Zone label below */}
      {showLabel && (
        <motion.text
          x={x} y={y + 36}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={9}
          fontWeight="600"
          fontFamily="monospace"
          letterSpacing={2}
          initial={{ opacity: 0 }}
          animate={playing ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: delay + 1 }}
        >
          {zoneLabel}
        </motion.text>
      )}
    </g>
  );
}
