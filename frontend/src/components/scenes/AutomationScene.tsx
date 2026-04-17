import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneAnimation } from '@/components/primitives/SceneWrapper';
import { WORKFLOWS, STEP_COLORS, type WorkflowConfig } from '@/data/automation-workflow';

/* ─── Layout constants ───────────────────────────────────────────── */

const NODE_W = 115;
const NODE_H = 38;
const VB_W   = 810;
const VB_H   = 460;

const STEP_LAYOUT: Record<string, { x: number; y: number }> = {
  read:    { x:  90, y:  70 },
  detect:  { x: 230, y:  70 },
  llm:     { x: 370, y:  70 },
  gate:    { x: 510, y:  70 },
  allow:   { x: 285, y: 235 },
  queue:   { x: 505, y: 235 },
  block:   { x: 725, y: 235 },
  resolve: { x: 505, y: 385 },
};

/* ─── Edge path computation ──────────────────────────────────────── */

function edgePath(fromId: string, toId: string): string {
  const from = STEP_LAYOUT[fromId];
  const to   = STEP_LAYOUT[toId];
  if (!from || !to) return '';
  if (from.y === to.y) {
    // horizontal
    return `M ${from.x + NODE_W / 2} ${from.y} H ${to.x - NODE_W / 2}`;
  }
  const midY = (from.y + NODE_H / 2 + to.y - NODE_H / 2) / 2;
  return `M ${from.x} ${from.y + NODE_H / 2} C ${from.x} ${midY} ${to.x} ${midY} ${to.x} ${to.y - NODE_H / 2}`;
}

/* ─── SVG Defs (self-contained — no SceneWrapper) ───────────────── */

function WorkflowDefs() {
  return (
    <defs>
      <filter id="wf-softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <marker id="wf-arrow-default" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.2)" />
      </marker>
      <marker id="wf-arrow-allow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#38A169" />
      </marker>
      <marker id="wf-arrow-queue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#ED8936" />
      </marker>
      <marker id="wf-arrow-block" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#E53E3E" />
      </marker>
    </defs>
  );
}

/* ─── WorkflowNode ───────────────────────────────────────────────── */

interface WorkflowNodeProps {
  stepId: string;
  label: string;
  typeLabel: string;
  color: string;
  pulse?: boolean;
  approved?: boolean;
  active?: boolean;
}

function WorkflowNode({ stepId, label, typeLabel, color, pulse, approved, active }: WorkflowNodeProps) {
  const layout = STEP_LAYOUT[stepId];
  if (!layout) return null;
  const { x, y } = layout;
  const fill = approved ? '#38A169' : color;
  const glowing = active || pulse;

  return (
    <g>
      {/* Pulse ring */}
      {pulse && (
        <motion.rect
          x={x - NODE_W / 2 - 4}
          y={y - NODE_H / 2 - 4}
          width={NODE_W + 8}
          height={NODE_H + 8}
          rx={10}
          fill="none"
          stroke="#ED8936"
          strokeWidth={1.5}
          animate={{ opacity: [0.8, 0, 0.8], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      )}

      {/* Node rect */}
      <rect
        x={x - NODE_W / 2}
        y={y - NODE_H / 2}
        width={NODE_W}
        height={NODE_H}
        rx={6}
        fill={`${fill}22`}
        stroke={fill}
        strokeWidth={glowing ? 1.5 : 1}
        opacity={glowing ? 1 : 0.7}
        filter={glowing ? 'url(#wf-softGlow)' : undefined}
      />

      {/* Type label (small, above center) */}
      <text
        x={x}
        y={y - 5}
        textAnchor="middle"
        fill={`${fill}aa`}
        fontSize={7}
        fontFamily="monospace"
      >
        {typeLabel}
      </text>

      {/* Step label (bold, below) */}
      <text
        x={x}
        y={y + 8}
        textAnchor="middle"
        fill={approved ? '#68D391' : 'rgba(255,255,255,0.85)'}
        fontSize={9}
        fontWeight="600"
      >
        {approved ? '✓ ' : ''}{label}
      </text>
    </g>
  );
}

/* ─── Animated packet along an SVG path ─────────────────────────── */

interface PathPacketProps {
  fromId: string;
  toId: string;
  color: string;
  playing: boolean;
  duration?: number;
  delay?: number;
  label?: string;
}

function PathPacket({ fromId, toId, color, playing, duration = 1.4, delay = 0, label }: PathPacketProps) {
  const from = STEP_LAYOUT[fromId];
  const to   = STEP_LAYOUT[toId];
  if (!from || !to) return null;

  const isHorizontal = from.y === to.y;
  const xs = isHorizontal
    ? [from.x + NODE_W / 2, to.x - NODE_W / 2]
    : [from.x, from.x, to.x, to.x];
  const ys = isHorizontal
    ? [from.y, to.y]
    : [
        from.y + NODE_H / 2,
        (from.y + NODE_H / 2 + to.y - NODE_H / 2) / 2,
        (from.y + NODE_H / 2 + to.y - NODE_H / 2) / 2,
        to.y - NODE_H / 2,
      ];
  const labelYs = ys.map((y) => y - 12);

  const transition = { duration, delay, ease: [0.42, 0, 0.58, 1] as const };

  return (
    <g>
      <motion.circle r={5} fill={color} filter="url(#wf-softGlow)" opacity={0}
        animate={playing ? { cx: xs, cy: ys, opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={transition} />
      <motion.circle r={2} fill="white" opacity={0}
        animate={playing ? { cx: xs, cy: ys, opacity: [0, 0.8, 0.8, 0] } : { opacity: 0 }}
        transition={transition} />
      {label && (
        <motion.text textAnchor="middle" fill={color} fontSize={7} fontFamily="monospace" opacity={0}
          animate={playing ? { x: xs, y: labelYs, opacity: [0, 0, 0.9, 0.9, 0] } : { opacity: 0 }}
          transition={{ ...transition, delay: delay + 0.15 }}>
          {label}
        </motion.text>
      )}
    </g>
  );
}

/* ─── Human Review Panel ─────────────────────────────────────────── */

interface HumanReviewPanelProps {
  onApprove: () => void;
  workflow: WorkflowConfig;
}

function HumanReviewPanel({ onApprove, workflow }: HumanReviewPanelProps) {
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setApproved(true);
      onApprove();
    }, 2500);
    return () => clearTimeout(id);
  }, [onApprove]);

  const isInsurance = workflow.id === 'insurance';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(15,17,23,0.95)',
        border: '1px solid rgba(237,137,54,0.35)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/[0.06]" style={{ background: 'rgba(237,137,54,0.08)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#ED8936' }}>
            HTTP 202 · Queued
          </span>
          <span className="ml-auto text-[10px] text-white/30">Human Review Required</span>
        </div>
      </div>

      <div className="p-3 space-y-2 text-xs">
        <Row label="action" value="send_email" />
        <Row label="destination" value={isInsurance ? 'adjuster@meridian.com' : 'reviewer@org.com'} />
        <Row label="risk score" value="0.84" valueColor="#ED8936" />
        <Row label="PII fields" value="ICD10 · SSN · Name" />
        <Row label="rule triggered" value="risk > 0.8 → QUEUE" />
        <Row label="status" value="HTTP 202 Accepted" />
      </div>

      <div className="px-3 pb-3 space-y-1.5">
        <button
          className="w-full rounded py-1.5 text-xs font-semibold transition-all duration-300"
          style={
            approved
              ? { background: 'rgba(56,161,105,0.2)', color: '#68D391', border: '1px solid rgba(56,161,105,0.5)', boxShadow: '0 0 12px rgba(56,161,105,0.3)' }
              : { background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }
          }
        >
          {approved ? '✓ Approved (tokenized)' : 'Approve tokenized'}
        </button>
        <button
          className="w-full rounded py-1.5 text-xs font-medium"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          disabled
        >
          Approve (expert view)
        </button>
        <button
          className="w-full rounded py-1.5 text-xs font-medium"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
          disabled
        >
          Request more info
        </button>
      </div>
    </motion.div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-white/35 shrink-0 w-24">{label}</span>
      <span className="font-mono" style={{ color: valueColor ?? 'rgba(255,255,255,0.75)' }}>{value}</span>
    </div>
  );
}

/* ─── Edge rendering ─────────────────────────────────────────────── */

const EDGE_STROKE: Record<string, string> = {
  allow:   '#38A169',
  queue:   '#ED8936',
  block:   '#E53E3E',
  default: 'rgba(255,255,255,0.18)',
};

const EDGE_MARKER: Record<string, string> = {
  allow:   'url(#wf-arrow-allow)',
  queue:   'url(#wf-arrow-queue)',
  block:   'url(#wf-arrow-block)',
  default: 'url(#wf-arrow-default)',
};

/* ─── AutomationScene ────────────────────────────────────────────── */

export function AutomationScene() {
  const { ref, isPlaying, epoch } = useSceneAnimation();
  const [workflowIdx, setWorkflowIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [resolved, setResolved] = useState(false);

  const workflow = WORKFLOWS[workflowIdx];

  const resetAndPlay = useCallback(() => {
    setPhase(0);
    setResolved(false);
    setTimeout(() => setPhase(1), 60);
  }, []);

  // Phase timer chain
  useEffect(() => {
    if (!isPlaying) { setPhase(0); setResolved(false); return; }
    resetAndPlay();
    const timers = [
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4500),
      setTimeout(() => setPhase(5), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isPlaying, epoch, resetAndPlay]);

  const handleApprove = useCallback(() => {
    setTimeout(() => {
      setResolved(true);
      setPhase(6);
    }, 400);
  }, []);

  const switchWorkflow = (idx: number) => {
    setWorkflowIdx(idx);
    setPhase(0);
    setResolved(false);
    setTimeout(() => setPhase(1), 80);
    setTimeout(() => setPhase(2), 1500 + 80);
    setTimeout(() => setPhase(3), 3000 + 80);
    setTimeout(() => setPhase(4), 4500 + 80);
    setTimeout(() => setPhase(5), 5500 + 80);
  };

  const stepMap = Object.fromEntries(workflow.steps.map((s) => [s.id, s]));

  return (
    <section id="automation" className="scroll-section py-20 px-4" style={{ background: '#0F1117' }}>
      <div ref={ref} className="mx-auto max-w-5xl">

        {/* Header */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">Automation Layer</h2>
          <p className="mt-3 text-white/50">
            The <span style={{ color: '#ED8936' }}>QUEUE moment</span> — AI waits for human approval before proceeding
          </p>
        </motion.div>

        {/* Industry tabs */}
        <div className="mb-8 flex justify-center gap-2 flex-wrap">
          {WORKFLOWS.map((wf, idx) => (
            <button
              key={wf.id}
              onClick={() => switchWorkflow(idx)}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200"
              style={
                idx === workflowIdx
                  ? { background: 'rgba(237,137,54,0.18)', color: '#ED8936', border: '1px solid rgba(237,137,54,0.45)' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              {wf.label}
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div className="flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
              style={{ overflow: 'visible' }}
            >
              <WorkflowDefs />

              {/* Edges */}
              {workflow.edges.map((edge) => {
                const v = edge.variant ?? 'default';
                const isQueueEdge = v === 'queue';
                const active =
                  (v === 'allow'   && phase >= 4) ||
                  (v === 'queue'   && phase >= 4) ||
                  (v === 'block'   && phase >= 4) ||
                  (v === 'default' && phase >= 1);
                const stroke = active ? EDGE_STROKE[v] : 'rgba(255,255,255,0.12)';
                const marker = active ? EDGE_MARKER[v] : EDGE_MARKER.default;
                const d = edgePath(edge.from, edge.to);
                if (!d) return null;

                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <path
                      d={d}
                      stroke={stroke}
                      strokeWidth={isQueueEdge && phase >= 4 ? 2 : 1.5}
                      markerEnd={marker}
                      strokeDasharray={v === 'default' ? undefined : undefined}
                      opacity={active ? 1 : 0.4}
                    />
                    {edge.label && phase >= 4 && (
                      <motion.text
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        fill={EDGE_STROKE[v]}
                        fontSize={7}
                        fontWeight="600"
                        fontFamily="monospace"
                        textAnchor="middle"
                        x={(() => {
                          const from = STEP_LAYOUT[edge.from];
                          const to   = STEP_LAYOUT[edge.to];
                          if (!from || !to) return 0;
                          return (from.x + to.x) / 2;
                        })()}
                        y={(() => {
                          const from = STEP_LAYOUT[edge.from];
                          const to   = STEP_LAYOUT[edge.to];
                          if (!from || !to) return 0;
                          return from.y === to.y ? from.y - 10 : (from.y + to.y) / 2;
                        })()}
                      >
                        {edge.label}
                      </motion.text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {workflow.steps.map((step) => {
                const layout = STEP_LAYOUT[step.id];
                if (!layout) return null;
                const color = STEP_COLORS[step.type];
                const isGate    = step.id === 'gate';
                const isQueue   = step.id === 'queue';
                const isResolve = step.id === 'resolve';
                const isAllow   = step.id === 'allow';
                const isBlock   = step.id === 'block';

                const active =
                  (step.id === 'read'    && phase >= 1) ||
                  (step.id === 'detect'  && phase >= 2) ||
                  (step.id === 'llm'     && phase >= 3) ||
                  (isGate               && phase >= 4) ||
                  (isAllow              && phase >= 4) ||
                  (isQueue              && phase >= 4) ||
                  (isBlock              && phase >= 4) ||
                  (isResolve            && phase >= 6);

                return (
                  <WorkflowNode
                    key={step.id}
                    stepId={step.id}
                    label={step.label}
                    typeLabel={step.type}
                    color={color}
                    active={active}
                    pulse={isQueue && phase === 4 && !resolved}
                    approved={isResolve && resolved}
                  />
                );
              })}

              {/* Animated packets */}
              {phase === 1 && (
                <PathPacket fromId="read" toId="detect" color="#10B981" playing label="claim_78234.json" />
              )}
              {phase === 2 && (
                <PathPacket fromId="detect" toId="llm" color="#ED8936" playing label="ICD10·SSN·Name" duration={1.2} />
              )}
              {phase === 3 && (
                <PathPacket fromId="llm" toId="gate" color="#3B82F6" playing label="[MASKED-*]" />
              )}
              {phase >= 4 && phase < 6 && (
                <PathPacket fromId="gate" toId="queue" color="#ED8936" playing={phase === 4} duration={1} />
              )}
              {phase === 6 && (
                <PathPacket fromId="queue" toId="resolve" color="#10B981" playing label="approved ✓" duration={1.4} />
              )}

              {/* HTTP 202 badge near gate */}
              {phase >= 4 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <rect
                    x={STEP_LAYOUT.gate.x - 38}
                    y={STEP_LAYOUT.gate.y + NODE_H / 2 + 8}
                    width={76}
                    height={16}
                    rx={4}
                    fill="rgba(237,137,54,0.18)"
                    stroke="rgba(237,137,54,0.5)"
                    strokeWidth={1}
                  />
                  <text
                    x={STEP_LAYOUT.gate.x}
                    y={STEP_LAYOUT.gate.y + NODE_H / 2 + 19}
                    textAnchor="middle"
                    fill="#ED8936"
                    fontSize={7.5}
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    HTTP 202 · QUEUE
                  </text>
                </motion.g>
              )}

              {/* PII badge near detect node */}
              {phase >= 2 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <rect
                    x={STEP_LAYOUT.detect.x - 38}
                    y={STEP_LAYOUT.detect.y + NODE_H / 2 + 8}
                    width={76}
                    height={14}
                    rx={3}
                    fill="rgba(107,70,193,0.2)"
                    stroke="rgba(107,70,193,0.5)"
                    strokeWidth={1}
                  />
                  <text
                    x={STEP_LAYOUT.detect.x}
                    y={STEP_LAYOUT.detect.y + NODE_H / 2 + 18}
                    textAnchor="middle"
                    fill="#9B59B6"
                    fontSize={7}
                    fontFamily="monospace"
                  >
                    ICD10 · SSN · Name
                  </text>
                </motion.g>
              )}
            </svg>
          </div>

          {/* Human Review Panel — visible md+ */}
          <div className="hidden md:block w-72 shrink-0">
            <AnimatePresence>
              {phase >= 5 && !resolved && (
                <HumanReviewPanel key={`panel-${epoch}-${workflowIdx}`} onApprove={handleApprove} workflow={workflow} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Resolution display */}
        <AnimatePresence>
          {resolved && (
            <motion.div
              key={`resolved-${epoch}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
              className="mt-6 text-center"
            >
              <div
                className="text-3xl font-bold font-mono"
                style={{ color: '#10B981', textShadow: '0 0 24px rgba(16,185,129,0.4)' }}
              >
                $2.8M exposure → $0
              </div>
              <div className="mt-1 text-xs text-white/40">
                847 violations caught · 0 incidents
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step description */}
        {phase > 0 && phase <= 6 && (
          <motion.p
            key={`step-${phase}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-xs font-mono text-white/30"
          >
            {[
              '',
              `Reading: ${stepMap['read']?.description ?? ''}`,
              `Detecting PII: ${stepMap['detect']?.description ?? ''}`,
              `LLM call: ${stepMap['llm']?.description ?? ''}`,
              `Gate decision: ${stepMap['gate']?.description ?? ''}`,
              'Awaiting human approval…',
              `Resolved: ${stepMap['resolve']?.description ?? ''}`,
            ][phase]}
          </motion.p>
        )}
      </div>
    </section>
  );
}
