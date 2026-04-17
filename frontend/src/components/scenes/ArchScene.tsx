import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSceneAnimation, SceneWrapper } from '@/components/primitives/SceneWrapper';
import { DataPacket } from '@/components/primitives/DataPacket';
import { GlassCardDiv } from '@/components/primitives/GlassCardDiv';

/* ─── Deployment model data ─────────────────────────────────────── */

interface DeploymentModel {
  id: string;
  icon: string;
  title: string;
  who: string;
  description: string;
  detail: string;
}

const DEPLOYMENT_MODELS: DeploymentModel[] = [
  {
    id: 'native',
    icon: '🏢',
    title: 'Native',
    who: 'Banks / Hospitals',
    description: 'Customer runs everything on-prem. Full data sovereignty — no traffic leaves the perimeter.',
    detail: 'Enforcement Plane runs inside your Kubernetes cluster or bare-metal VMs. Coordination Plane syncs policies via mTLS — only metadata (scores, decisions) crosses the boundary, never raw records. Supports air-gapped deployments with offline policy bundles.',
  },
  {
    id: 'dedicated',
    icon: '🔐',
    title: 'Dedicated',
    who: 'Mid-enterprise',
    description: 'GG-operated isolation zone with BYOK encryption. Shared Coordination, dedicated Enforcement.',
    detail: 'GlobiGuard provisions an isolated VPC tenancy. You supply your KMS key (AWS/Azure/GCP) and GG never holds plaintext. Compliance reports available within the isolation zone. SLA: 99.9% uptime.',
  },
  {
    id: 'gateway',
    icon: '⚡',
    title: 'Gateway',
    who: 'Serverless teams',
    description: 'Lightweight virtual node. ~0.8 ms added latency. No sidecar required.',
    detail: 'A single HTTP gateway intercepts LLM API calls. Deploys in under 5 minutes via Terraform module. Ideal for teams that cannot modify existing services. Scales to zero when idle.',
  },
  {
    id: 'self-hosted',
    icon: '🔓',
    title: 'Self-Hosted OSS',
    who: 'OSS users',
    description: 'Open-source Enforcement Plane + SaaS Coordination Plane. MIT licensed core.',
    detail: 'Core detection engine and policy gate published on GitHub. SaaS Coordination Plane provides compliance dashboards, human review queue, and audit exports. Bring your own LLM provider. Community Discord support.',
  },
];

/* ─── ArchScene ─────────────────────────────────────────────────── */

export function ArchScene() {
  const { ref, isPlaying } = useSceneAnimation();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section id="architecture" className="scroll-section py-20 px-4" style={{ background: '#0F1117' }}>
      <div ref={ref} className="mx-auto max-w-5xl">

        {/* Header */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">Two-Plane Architecture</h2>
          <p className="mt-3 text-white/50">
            Coordination and enforcement are <span style={{ color: '#10B981' }}>architecturally separated</span> — GG never sees your raw data
          </p>
        </motion.div>

        {/* SVG Diagram */}
        <SceneWrapper viewBox="0 0 800 500" maxWidth="max-w-full">

          {/* ── Coordination Plane ── */}
          <rect x={20} y={20} width={580} height={180} rx={8}
            fill="#0d0f1a" stroke="#2A4365" strokeWidth={2} />
          <text x={36} y={46} fill="#4A90D9" fontSize={11} fontWeight="700" fontFamily="sans-serif">
            Coordination Plane
          </text>
          <text x={36} y={61} fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="sans-serif">
            GG-operated cloud — never sees raw data
          </text>

          {[
            { y: 85,  label: '⚙  Policy Engine',             color: '#4A90D9' },
            { y: 105, label: '📋  Compliance Reports',        color: '#68D391' },
            { y: 125, label: '👤  Human Review Queue',        color: '#ED8936' },
            { y: 145, label: '💳  Billing / Org Settings',    color: 'rgba(255,255,255,0.45)' },
          ].map(({ y, label, color }) => (
            <text key={y} x={48} y={y} fill={color} fontSize={9.5} fontFamily="sans-serif">{label}</text>
          ))}

          {/* ── Boundary ── */}
          <line x1={20} y1={248} x2={600} y2={248}
            stroke="#4A5568" strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={220} y={240} fill="rgba(255,255,255,0.35)" fontSize={8.5} fontFamily="monospace">
            Architecturally separated.
          </text>
          <text x={220} y={263} fill="rgba(255,255,255,0.35)" fontSize={8.5} fontFamily="monospace">
            No raw data can cross.
          </text>

          {/* Red × blocking raw data */}
          <line x1={490} y1={238} x2={510} y2={258} stroke="#E53E3E" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={510} y1={238} x2={490} y2={258} stroke="#E53E3E" strokeWidth={2.5} strokeLinecap="round" />

          {/* ── Enforcement Plane ── */}
          <rect x={20} y={280} width={580} height={180} rx={8}
            fill="#0d1a0d" stroke="#276749" strokeWidth={2} />
          <text x={36} y={306} fill="#68D391" fontSize={11} fontWeight="700" fontFamily="sans-serif">
            Enforcement Plane
          </text>
          <text x={36} y={321} fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="sans-serif">
            Your VPC / K8s / on-prem
          </text>

          {[
            { y: 345, label: '🚀  Go Sidecar :8080',          color: '#3B82F6' },
            { y: 365, label: '🧠  Python Detection Brain',    color: '#9B59B6' },
            { y: 385, label: '🔑  Redis token map (TTL 1hr)', color: '#2C7A7B' },
            { y: 405, label: '📝  Audit Buffer',               color: 'rgba(255,255,255,0.45)' },
          ].map(({ y, label, color }) => (
            <text key={y} x={48} y={y} fill={color} fontSize={9.5} fontFamily="sans-serif">{label}</text>
          ))}

          {/* ── Animated data flows ── */}
          {/* Metadata upward */}
          <DataPacket
            path={[{ x: 310, y: 460 }, { x: 310, y: 200 }]}
            color="amber"
            label="metadata only"
            repeat
            duration={2.5}
            delay={0}
            playing={isPlaying}
          />
          {/* Policy update downward */}
          <DataPacket
            path={[{ x: 360, y: 200 }, { x: 360, y: 460 }]}
            color="blue"
            label="policy (encrypted)"
            repeat
            duration={2.5}
            delay={1.5}
            playing={isPlaying}
          />

          {/* ── ZK Proof panel ── */}
          <rect x={630} y={20} width={160} height={180} rx={6}
            fill="#0a0d12" stroke="#2A4365" strokeWidth={1} />
          <text x={642} y={42} fill="#68D391" fontSize={9} fontWeight="700" fontFamily="monospace">
            GG sees:
          </text>
          {[
            '{ score: 0.84,',
            '  decision: "QUEUE",',
            '  field_types:',
            '  ["SSN","ICD10"] }',
          ].map((line, i) => (
            <text key={i} x={642} y={60 + i * 14} fill="rgba(255,255,255,0.6)" fontSize={8} fontFamily="monospace">
              {line}
            </text>
          ))}

          <text x={642} y={130} fill="rgba(229,62,62,0.7)" fontSize={9} fontWeight="700" fontFamily="monospace">
            GG never sees:
          </text>
          {[
            { text: '547-82-3901', y: 148 },
            { text: 'E11.9',       y: 164 },
          ].map(({ text, y }) => (
            <g key={y}>
              <text x={642} y={y} fill="rgba(255,255,255,0.25)" fontSize={8} fontFamily="monospace">
                {text}
              </text>
              <line x1={642} y1={y - 5} x2={642 + text.length * 5.2} y2={y - 5}
                stroke="rgba(229,62,62,0.5)" strokeWidth={1} />
            </g>
          ))}
        </SceneWrapper>

        {/* ── Deployment Model Cards ── */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-white text-center mb-6">4 Deployment Models</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DEPLOYMENT_MODELS.map((model) => (
              <GlassCardDiv key={model.id} variant="default" className="cursor-pointer">
                <button
                  className="w-full text-left p-4"
                  onClick={() => setExpanded(expanded === model.id ? null : model.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white">{model.title}</span>
                        <span className="text-[10px] text-white/35 shrink-0">{model.who}</span>
                      </div>
                      <p className="mt-1 text-xs text-white/55 leading-relaxed">
                        {model.description}
                      </p>
                      {expanded === model.id && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 text-xs leading-relaxed"
                          style={{ color: 'rgba(16,185,129,0.85)' }}
                        >
                          {model.detail}
                        </motion.p>
                      )}
                    </div>
                    <span className="text-white/30 text-sm shrink-0 mt-0.5">
                      {expanded === model.id ? '▲' : '▼'}
                    </span>
                  </div>
                </button>
              </GlassCardDiv>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
