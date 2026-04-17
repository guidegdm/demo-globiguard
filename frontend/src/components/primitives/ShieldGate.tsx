import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* ─── types ────────────────────────────────────────────────────────── */

type GateState = 'idle' | 'scanning' | 'blocked' | 'allowed' | 'queued';

interface ShieldGateProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  state?: GateState;
  playing?: boolean;
}

/* ─── colours per state ──────────────────────────────────────────── */

const STATE_COLOR: Record<GateState, string> = {
  idle:     '#4A5568',
  scanning: '#10B981',
  blocked:  '#E53E3E',
  allowed:  '#38A169',
  queued:   '#ED8936',
};

const STATE_FILTER: Record<GateState, string | undefined> = {
  idle:     undefined,
  scanning: 'url(#softGlow)',
  blocked:  'url(#redGlow)',
  allowed:  'url(#softGlow)',
  queued:   'url(#amberGlow)',
};

const STATE_ICON: Record<GateState, string> = {
  idle:     '⬡',
  scanning: '◈',
  blocked:  '✗',
  allowed:  '✓',
  queued:   '?',
};

const STATE_PULSE: Record<GateState, number> = {
  idle:     0,
  scanning: 1.2,
  blocked:  0,
  allowed:  0,
  queued:   1.8,
};

/* ─── component ────────────────────────────────────────────────────── */

export function ShieldGate({
  x = 0,
  y = 0,
  width = 72,
  height = 80,
  state = 'idle',
  playing = true,
}: ShieldGateProps) {
  const prefersReduced = useReducedMotion();
  const color = STATE_COLOR[state];
  const filterRef = STATE_FILTER[state];
  const icon = STATE_ICON[state];
  const pulsePeriod = STATE_PULSE[state];

  const cx = x + width / 2;
  const cy = y + height / 2;
  const halfW = width / 2;
  const shieldTop = y + 4;

  /* Shield path centred on cx */
  const shieldPath = [
    `M ${cx} ${shieldTop}`,
    `L ${cx + halfW - 4} ${shieldTop + 10}`,
    `L ${cx + halfW - 4} ${shieldTop + height * 0.45}`,
    `Q ${cx + halfW - 4} ${shieldTop + height * 0.7} ${cx} ${shieldTop + height - 6}`,
    `Q ${cx - halfW + 4} ${shieldTop + height * 0.7} ${cx - halfW + 4} ${shieldTop + height * 0.45}`,
    `L ${cx - halfW + 4} ${shieldTop + 10}`,
    'Z',
  ].join(' ');

  const ringScale = pulsePeriod > 0 && playing && !prefersReduced
    ? { scale: [1, 1.3, 1] }
    : { scale: 1 };
  const ringTransition =
    pulsePeriod > 0
      ? { repeat: Infinity, duration: pulsePeriod, ease: 'easeInOut' as const }
      : {};

  return (
    <g>
      {/* Outer pulsing ring (scanning / queued only) */}
      <AnimatePresence>
        {(state === 'scanning' || state === 'queued') && (
          <motion.circle
            key={state}
            cx={cx}
            cy={cy}
            r={halfW}
            stroke={color}
            strokeWidth={2}
            fill="none"
            opacity={0.35}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={playing && !prefersReduced ? { ...ringScale, opacity: [0.1, 0.4, 0.1] } : { opacity: 0.25 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={ringTransition}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        )}
      </AnimatePresence>

      {/* Shield body fill */}
      <motion.path
        d={shieldPath}
        fill={`${color}1A`}
        stroke={color}
        strokeWidth={2}
        filter={filterRef}
        animate={playing && !prefersReduced ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
        transition={
          pulsePeriod > 0
            ? { repeat: Infinity, duration: pulsePeriod, ease: 'easeInOut' }
            : { duration: 0.4 }
        }
      />

      {/* Icon text */}
      <motion.text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={state === 'idle' ? 16 : 20}
        fontWeight="bold"
        filter={filterRef}
        animate={playing && !prefersReduced ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
        transition={
          pulsePeriod > 0
            ? { repeat: Infinity, duration: pulsePeriod, ease: 'easeInOut' }
            : { duration: 0.4 }
        }
      >
        {icon}
      </motion.text>

      {/* "202" badge for queued state */}
      <AnimatePresence>
        {state === 'queued' && (
          <motion.g
            key="badge-202"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <rect
              x={cx - 18}
              y={shieldTop - 22}
              width={36}
              height={16}
              rx={8}
              fill="#ED893633"
              stroke="#ED8936"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={shieldTop - 11}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ED8936"
              fontSize={9}
              fontWeight="bold"
              fontFamily="monospace"
            >
              202
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}
