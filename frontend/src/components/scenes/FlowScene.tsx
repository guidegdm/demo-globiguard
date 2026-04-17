import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneAnimation, SceneWrapper } from '@/components/primitives/SceneWrapper';
import { FlowLine } from '@/components/primitives/FlowLine';
import { DataPacket } from '@/components/primitives/DataPacket';
import { ShieldGate } from '@/components/primitives/ShieldGate';
import { RiskGauge } from '@/components/primitives/RiskGauge';
import { ExplanationPanel } from '@/components/primitives/ExplanationPanel';
import { PIPELINE_NODES, type PanelContent } from '@/data/pipeline-nodes';

/* ─── Layout constants ────────────────────────────────────────────── */

const VB_W = 900;
const VB_H = 520;
const NODE_W = 86;
const NODE_H = 44;

/* Row 1: data-sources → risk-scorer (left to right, y≈90) */
const ROW1_Y = 90;
/* Row 2: gate → safe-output (right to left flow, y≈380) */
const ROW2_Y = 380;

const ROW1_XS = [72, 176, 280, 384, 488, 592, 696];
const ROW2_XS = [696, 592, 488, 384, 280, 176, 72];

/* 14 node layout positions [cx, cy] */
const NODE_POS: Record<string, [number, number]> = {
  'data-sources': [ROW1_XS[0], ROW1_Y],
  'mcp-connector': [ROW1_XS[1], ROW1_Y],
  'go-sidecar':   [ROW1_XS[2], ROW1_Y],
  'regex-layer':  [ROW1_XS[3], ROW1_Y],
  'presidio-ner': [ROW1_XS[4], ROW1_Y],
  'gliner':       [ROW1_XS[5], ROW1_Y],
  'risk-scorer':  [ROW1_XS[6], ROW1_Y],
  'gate':         [ROW2_XS[0], ROW2_Y],
  'tokenizer':    [ROW2_XS[1], ROW2_Y],
  'token-map':    [ROW2_XS[2], ROW2_Y],
  'llm':          [ROW2_XS[3], ROW2_Y],
  'detokenizer':  [ROW2_XS[4], ROW2_Y],
  'audit-log':    [ROW2_XS[5], ROW2_Y],
  'safe-output':  [ROW2_XS[6], ROW2_Y],
};

const NODE_COLOR: Record<string, string> = {
  'data-sources': '#4A5568',
  'mcp-connector': '#744210',
  'go-sidecar':   '#2B4C8C',
  'regex-layer':  '#276749',
  'presidio-ner': '#2B4C8C',
  'gliner':       '#6B46C1',
  'risk-scorer':  '#9B2C2C',
  'gate':         '#ED8936',
  'tokenizer':    '#2C7A7B',
  'token-map':    '#2C7A7B',
  'llm':          '#4A5568',
  'detokenizer':  '#2C7A7B',
  'audit-log':    '#553C9A',
  'safe-output':  '#276749',
};

const NODE_LABELS: Record<string, string> = {
  'data-sources': 'Data Sources',
  'mcp-connector': 'MCPConnector',
  'go-sidecar':   'Go Sidecar',
  'regex-layer':  'Regex (L1)',
  'presidio-ner': 'Presidio NER',
  'gliner':       'GLiNER (L3)',
  'risk-scorer':  'Risk Scorer',
  'gate':         'Policy Gate',
  'tokenizer':    'Tokenizer',
  'token-map':    'Token Map',
  'llm':          'LLM',
  'detokenizer':  'Detokenizer',
  'audit-log':    'Audit Log',
  'safe-output':  'Safe Output',
};

const ROW1_IDS = ['data-sources','mcp-connector','go-sidecar','regex-layer','presidio-ner','gliner','risk-scorer'];
const ROW2_IDS = ['gate','tokenizer','token-map','llm','detokenizer','audit-log','safe-output'];

function pt(id: string) { return { x: NODE_POS[id][0], y: NODE_POS[id][1] }; }

/* ─── NodeRect ────────────────────────────────────────────────────── */

interface NodeRectProps {
  id: string;
  phase: number;
  glow: boolean;
  onClick: () => void;
}

function NodeRect({ id, glow, onClick }: NodeRectProps) {
  const [cx, cy] = NODE_POS[id];
  const color = NODE_COLOR[id];
  const label = NODE_LABELS[id];
  const x = cx - NODE_W / 2;
  const y = cy - NODE_H / 2;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: ROW1_IDS.indexOf(id) * 0.05 + ROW2_IDS.indexOf(id) * 0.05 + 0.1 }}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={x} y={y} width={NODE_W} height={NODE_H} rx={6}
        fill={`${color}22`}
        stroke={color}
        strokeWidth={glow ? 2 : 1}
        opacity={glow ? 1 : 0.75}
        filter={glow ? 'url(#softGlow)' : undefined}
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(255,255,255,0.85)" fontSize={9} fontWeight="500">
        {label}
      </text>
      {/* Hover target */}
      <rect x={x - 4} y={y - 4} width={NODE_W + 8} height={NODE_H + 8} rx={8}
        fill="transparent" />
    </motion.g>
  );
}

/* ─── Token replacement overlay ─────────────────────────────────── */

const TOKEN_PAIRS = [
  { before: 'Sarah Mitchell', after: '[MASKED-PERSON-001]', x: 490, y: 290 },
  { before: 'ICD10:E11.9',    after: '[MASKED-ICD10-002]',  x: 490, y: 310 },
  { before: '547-82-3901',    after: '[MASKED-SSN-003]',    x: 490, y: 330 },
];

function TokenReplace({ playing }: { playing: boolean }) {
  const [step, setStep] = useState(-1);
  useEffect(() => {
    if (!playing) { setStep(-1); return; }
    setStep(0);
    const ids = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1200),
    ];
    return () => ids.forEach(clearTimeout);
  }, [playing]);

  return (
    <AnimatePresence>
      {playing && TOKEN_PAIRS.map((pair, i) => (
        <motion.g key={pair.before} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ delay: i * 0.6, duration: 0.4 }}>
          {i > step ? (
            <text x={pair.x} y={pair.y} textAnchor="middle" fill="#E53E3E" fontSize={8} fontFamily="monospace">
              {pair.before}
            </text>
          ) : (
            <text x={pair.x} y={pair.y} textAnchor="middle" fill="#10B981" fontSize={8} fontFamily="monospace">
              {pair.after}
            </text>
          )}
        </motion.g>
      ))}
    </AnimatePresence>
  );
}

/* ─── FlowScene ───────────────────────────────────────────────────── */

export function FlowScene() {
  const { ref, isPlaying, epoch } = useSceneAnimation();
  const [phase, setPhase] = useState(0);
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  const panelContent: PanelContent | undefined =
    openPanel ? PIPELINE_NODES.find((n) => n.id === openPanel) : undefined;

  /* Phase timer chain */
  useEffect(() => {
    if (!isPlaying) { setPhase(0); return; }
    setPhase(1);
    const timers = [
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 5000),
      setTimeout(() => setPhase(5), 6000),
      setTimeout(() => setPhase(6), 8000),
      setTimeout(() => setPhase(0), 10000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isPlaying, epoch]);

  const handleNodeClick = useCallback((id: string) => {
    setOpenPanel(id);
  }, []);

  const gateState = phase < 2 ? 'idle'
    : phase === 2 ? 'scanning'
    : phase === 3 || phase === 4 ? 'queued'
    : phase >= 5 ? 'allowed'
    : 'idle';

  /* Node glow — depends on phase */
  const glowNode = (id: string) => {
    if (phase === 1 && ['data-sources','mcp-connector','go-sidecar'].includes(id)) return true;
    if (phase === 2 && ['regex-layer','presidio-ner','gliner','risk-scorer'].includes(id)) return true;
    if (phase === 3 && ['risk-scorer'].includes(id)) return true;
    if (phase === 4 && ['tokenizer','token-map'].includes(id)) return true;
    if (phase >= 5 && ['llm','detokenizer','audit-log','safe-output'].includes(id)) return true;
    return false;
  };

  return (
    <section id="pipeline" className="scroll-section py-20 px-4" style={{ background: '#0F1117' }}>
      <div ref={ref} className="mx-auto max-w-5xl">
        <motion.div className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.6 }}>
          <h2 className="text-3xl font-bold text-white md:text-4xl">How It Works</h2>
          <p className="mt-3 text-white/50">
            14-node pipeline — <span style={{ color: '#10B981' }}>click any node</span> to explore
          </p>
        </motion.div>

        <SceneWrapper viewBox={`0 0 ${VB_W} ${VB_H}`} maxWidth="max-w-full">

          {/* ── Row 1 edges ── */}
          {ROW1_IDS.slice(0,-1).map((id, i) => (
            <FlowLine key={id} from={pt(id)} to={pt(ROW1_IDS[i+1])}
              delay={0.1 * i} playing={isPlaying}
              variant={phase >= 2 && i >= 3 ? (i >= 5 ? 'queue' : 'active') : 'default'} />
          ))}

          {/* ── Vertical drop: risk-scorer → gate ── */}
          <FlowLine
            from={{ x: NODE_POS['risk-scorer'][0], y: NODE_POS['risk-scorer'][1] + NODE_H / 2 }}
            to={{ x: NODE_POS['gate'][0], y: NODE_POS['gate'][1] - 44 }}
            playing={isPlaying} delay={0.7}
            variant={phase >= 3 ? 'queue' : 'default'}
          />

          {/* ── Row 2 edges (right → left) ── */}
          {ROW2_IDS.slice(0,-1).map((id, i) => (
            <FlowLine key={id} from={pt(id)} to={pt(ROW2_IDS[i+1])}
              delay={0.1 * i + 0.5} playing={phase >= 5}
              variant="active" />
          ))}

          {/* ── Nodes Row 1 ── */}
          {ROW1_IDS.map((id) => (
            <NodeRect key={id} id={id} phase={phase} glow={glowNode(id)} onClick={() => handleNodeClick(id)} />
          ))}

          {/* ── Gate (ShieldGate) ── */}
          <g onClick={() => handleNodeClick('gate')} style={{ cursor: 'pointer' }}>
            <ShieldGate
              x={NODE_POS['gate'][0] - 36}
              y={NODE_POS['gate'][1] - 44}
              width={72} height={80}
              state={gateState}
              playing={isPlaying}
            />
          </g>

          {/* ── Nodes Row 2 (skip gate — ShieldGate above) ── */}
          {ROW2_IDS.slice(1).map((id) => (
            <NodeRect key={id} id={id} phase={phase} glow={glowNode(id)} onClick={() => handleNodeClick(id)} />
          ))}

          {/* ── Risk Gauge ── */}
          {phase >= 3 && (
            <RiskGauge
              x={VB_W / 2} y={ROW1_Y + 100}
              radius={38}
              value={0.84}
              playing={phase >= 3}
              delay={0}
            />
          )}

          {/* ── Token replacement overlays (phase 4) ── */}
          <TokenReplace playing={phase === 4} />

          {/* ── Phase 1: data packet row 1 ── */}
          {phase === 1 && (
            <DataPacket
              path={[pt('data-sources'), pt('mcp-connector'), pt('go-sidecar')]}
              color="emerald" duration={1.6} playing delay={0}
              label="claim_email.json"
            />
          )}

          {/* ── Phase 2: detection cascade ── */}
          {phase === 2 && <>
            <DataPacket path={[pt('go-sidecar'), pt('regex-layer')]}
              color="emerald" duration={1} playing delay={0} label="ICD10:E11.9" />
            <DataPacket path={[pt('regex-layer'), pt('presidio-ner')]}
              color="emerald" duration={1} playing delay={0.5} label="Sarah Mitchell" />
            <DataPacket path={[pt('presidio-ner'), pt('gliner')]}
              color="emerald" duration={1} playing delay={1} label="Metformin 500mg" />
            <DataPacket path={[pt('gliner'), pt('risk-scorer')]}
              color="amber" duration={1} playing delay={1.5} />
          </>}

          {/* ── Phase 5: packet resumes after gate ── */}
          {phase >= 5 && (
            <DataPacket
              path={[pt('gate'), pt('tokenizer'), pt('token-map'), pt('llm'), pt('detokenizer'), pt('audit-log'), pt('safe-output')]}
              color="emerald" duration={3} playing delay={0} repeat={false}
            />
          )}

          {/* ── Phase labels ── */}
          {phase >= 1 && phase <= 6 && (
            <motion.text x={VB_W / 2} y={VB_H - 16} textAnchor="middle"
              fill="rgba(255,255,255,0.3)" fontSize={10} fontFamily="monospace"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              {['','Processing claim_78234.json...','Detection cascade...','Risk: 0.84 → QUEUE','Tokenizing PII...','Human approved → LLM processing...','Pipeline complete'][phase]}
            </motion.text>
          )}
        </SceneWrapper>

        {/* Click hint */}
        <p className="mt-4 text-center text-xs text-white/25">Click any node for details</p>
      </div>

      {/* Explanation panel */}
      {panelContent && (
        <ExplanationPanel
          open={!!openPanel}
          onClose={() => setOpenPanel(null)}
          title={panelContent.title}
          subtitle={panelContent.subtitle}
          decision={panelContent.decision}
          accentColor={panelContent.accentColor}
          sections={panelContent.sections}
        />
      )}
    </section>
  );
}
