import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Server, Box, Network } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/shared';

const codeTabs = [
  { id: 'ts', label: 'TypeScript', filename: 'guard.ts', lang: 'typescript' },
  { id: 'py', label: 'Python', filename: 'guard.py', lang: 'python' },
  { id: 'docker', label: 'Docker', filename: 'docker-compose.yml', lang: 'yaml' },
  { id: 'k8s', label: 'K8s', filename: 'sidecar.yaml', lang: 'yaml' },
  { id: 'policy', label: 'Policy YAML', filename: 'policy.yaml', lang: 'yaml' },
  { id: 'curl', label: 'cURL', filename: 'evaluate.sh', lang: 'bash' },
];

type Span = { text: string; cls: string };
type CodeLine = Span[];

const codeContent: Record<string, CodeLine[]> = {
  ts: [
    [{ text: 'import', cls: 'text-purple-400' }, { text: ' { GlobiGuard } ', cls: 'text-foreground' }, { text: 'from', cls: 'text-purple-400' }, { text: " '@globiguard/node'", cls: 'text-emerald' }],
    [],
    [{ text: 'const', cls: 'text-blue-400' }, { text: ' guard ', cls: 'text-foreground' }, { text: '=', cls: 'text-muted-foreground' }, { text: ' new ', cls: 'text-blue-400' }, { text: 'GlobiGuard', cls: 'text-yellow-400' }, { text: '({ apiKey: process.env.', cls: 'text-foreground' }, { text: 'GLOBIGUARD_KEY', cls: 'text-emerald' }, { text: ' })', cls: 'text-foreground' }],
    [],
    [{ text: '// Sanitize before the model sees it', cls: 'text-muted-foreground' }],
    [{ text: 'const', cls: 'text-blue-400' }, { text: ' safe ', cls: 'text-foreground' }, { text: '=', cls: 'text-muted-foreground' }, { text: ' await ', cls: 'text-purple-400' }, { text: 'guard.', cls: 'text-foreground' }, { text: 'sanitize', cls: 'text-yellow-400' }, { text: '(rawDocument)', cls: 'text-foreground' }],
    [{ text: '// { fieldsActedOn: 3, content: "holder [GG-7f3a] ssn [BLOCKED]" }', cls: 'text-muted-foreground' }],
    [],
    [{ text: 'const', cls: 'text-blue-400' }, { text: ' result ', cls: 'text-foreground' }, { text: '=', cls: 'text-muted-foreground' }, { text: ' await ', cls: 'text-purple-400' }, { text: 'guard.', cls: 'text-foreground' }, { text: 'evaluate', cls: 'text-yellow-400' }, { text: '(agentAction)', cls: 'text-foreground' }],
    [{ text: 'if', cls: 'text-purple-400' }, { text: ' (!result.allowed) ', cls: 'text-foreground' }, { text: 'throw', cls: 'text-red-400' }, { text: ' new ', cls: 'text-blue-400' }, { text: 'Error', cls: 'text-yellow-400' }, { text: '(result.reason)', cls: 'text-foreground' }],
  ],
  py: [
    [{ text: 'from', cls: 'text-purple-400' }, { text: ' globiguard ', cls: 'text-foreground' }, { text: 'import', cls: 'text-purple-400' }, { text: ' GlobiGuard', cls: 'text-yellow-400' }],
    [],
    [{ text: 'guard ', cls: 'text-foreground' }, { text: '=', cls: 'text-muted-foreground' }, { text: ' GlobiGuard', cls: 'text-yellow-400' }, { text: '(api_key=os.environ[', cls: 'text-foreground' }, { text: '"GLOBIGUARD_KEY"', cls: 'text-emerald' }, { text: '])', cls: 'text-foreground' }],
    [],
    [{ text: 'safe ', cls: 'text-foreground' }, { text: '=', cls: 'text-muted-foreground' }, { text: ' guard.', cls: 'text-foreground' }, { text: 'sanitize', cls: 'text-yellow-400' }, { text: '(raw_document)', cls: 'text-foreground' }],
    [{ text: 'result ', cls: 'text-foreground' }, { text: '=', cls: 'text-muted-foreground' }, { text: ' guard.', cls: 'text-foreground' }, { text: 'evaluate', cls: 'text-yellow-400' }, { text: '(agent_action)', cls: 'text-foreground' }],
    [],
    [{ text: 'if', cls: 'text-purple-400' }, { text: ' not ', cls: 'text-purple-400' }, { text: 'result.allowed:', cls: 'text-foreground' }],
    [{ text: '    raise ', cls: 'text-red-400' }, { text: 'PermissionError', cls: 'text-yellow-400' }, { text: '(result.reason)', cls: 'text-foreground' }],
  ],
  docker: [
    [{ text: 'services:', cls: 'text-amber-400' }],
    [{ text: '  globiguard:', cls: 'text-blue-400' }],
    [{ text: '    image: ', cls: 'text-muted-foreground' }, { text: 'globiguard/engine:latest', cls: 'text-emerald' }],
    [{ text: '    ports:', cls: 'text-muted-foreground' }],
    [{ text: "      - ", cls: 'text-muted-foreground' }, { text: '"8080:8080"', cls: 'text-emerald' }],
    [{ text: '    volumes:', cls: 'text-muted-foreground' }],
    [{ text: '      - ', cls: 'text-muted-foreground' }, { text: './policy.yaml:/config/policy.yaml', cls: 'text-emerald' }],
    [{ text: '    environment:', cls: 'text-muted-foreground' }],
    [{ text: '      - GLOBIGUARD_LICENSE_KEY=', cls: 'text-muted-foreground' }, { text: '${LICENSE_KEY}', cls: 'text-amber-400' }],
    [{ text: '      - DATABASE_URL=postgres://...', cls: 'text-muted-foreground' }],
    [{ text: '    restart: ', cls: 'text-muted-foreground' }, { text: 'unless-stopped', cls: 'text-emerald' }],
  ],
  k8s: [
    [{ text: 'containers:', cls: 'text-amber-400' }],
    [{ text: '  - name: ', cls: 'text-muted-foreground' }, { text: 'globiguard-sidecar', cls: 'text-blue-400' }],
    [{ text: '    image: ', cls: 'text-muted-foreground' }, { text: 'globiguard/engine:latest', cls: 'text-emerald' }],
    [{ text: '    ports:', cls: 'text-muted-foreground' }],
    [{ text: '      - containerPort: ', cls: 'text-muted-foreground' }, { text: '8080', cls: 'text-emerald' }],
    [{ text: '    env:', cls: 'text-muted-foreground' }],
    [{ text: '      - name: GLOBIGUARD_LICENSE_KEY', cls: 'text-muted-foreground' }],
    [{ text: '        valueFrom:', cls: 'text-muted-foreground' }],
    [{ text: '          secretKeyRef:', cls: 'text-muted-foreground' }],
    [{ text: '            name: ', cls: 'text-muted-foreground' }, { text: 'globiguard-secrets', cls: 'text-emerald' }],
    [{ text: '            key: ', cls: 'text-muted-foreground' }, { text: 'license-key', cls: 'text-emerald' }],
    [{ text: '    resources:', cls: 'text-muted-foreground' }],
    [{ text: '      limits: { memory: ', cls: 'text-muted-foreground' }, { text: '"256Mi"', cls: 'text-emerald' }, { text: ', cpu: ', cls: 'text-muted-foreground' }, { text: '"200m"', cls: 'text-emerald' }, { text: ' }', cls: 'text-muted-foreground' }],
  ],
  policy: [
    [{ text: 'scope: ', cls: 'text-amber-400' }, { text: 'crm', cls: 'text-emerald' }],
    [{ text: 'rules:', cls: 'text-amber-400' }],
    [{ text: '  - action: ', cls: 'text-muted-foreground' }, { text: 'write_record', cls: 'text-blue-400' }],
    [{ text: '    allow: ', cls: 'text-muted-foreground' }, { text: 'true', cls: 'text-emerald' }],
    [{ text: '    condition: ', cls: 'text-muted-foreground' }, { text: 'human_approved', cls: 'text-amber-400' }],
    [{ text: '  - action: ', cls: 'text-muted-foreground' }, { text: 'send_email', cls: 'text-blue-400' }],
    [{ text: '    allow: ', cls: 'text-muted-foreground' }, { text: 'false', cls: 'text-red-400' }],
    [{ text: '    when:', cls: 'text-muted-foreground' }],
    [{ text: '      contains_pii: ', cls: 'text-muted-foreground' }, { text: 'true', cls: 'text-red-400' }],
    [{ text: '    escalate: ', cls: 'text-muted-foreground' }, { text: 'human_review', cls: 'text-amber-400' }],
    [{ text: '  - action: ', cls: 'text-muted-foreground' }, { text: 'export_data', cls: 'text-blue-400' }],
    [{ text: '    allow: ', cls: 'text-muted-foreground' }, { text: 'false', cls: 'text-red-400' }],
    [{ text: '    reason: ', cls: 'text-muted-foreground' }, { text: '"External data transfer prohibited"', cls: 'text-emerald' }],
  ],
  curl: [
    [{ text: 'curl', cls: 'text-yellow-400' }, { text: ' -X POST https://api.globiguard.local/v1/evaluate \\', cls: 'text-foreground' }],
    [{ text: '  -H ', cls: 'text-muted-foreground' }, { text: '"Authorization: Bearer gg_live_xxx" \\', cls: 'text-emerald' }],
    [{ text: '  -H ', cls: 'text-muted-foreground' }, { text: '"Content-Type: application/json" \\', cls: 'text-emerald' }],
    [{ text: "  -d ", cls: 'text-muted-foreground' }, { text: "'{\"action\":\"send_email\",\"context\":{\"contains_pii\":true}}'", cls: 'text-emerald' }],
    [],
    [{ text: '# Response:', cls: 'text-muted-foreground' }],
    [{ text: '# { "allowed": ', cls: 'text-muted-foreground' }, { text: 'false', cls: 'text-red-400' }, { text: ', "decision": ', cls: 'text-muted-foreground' }, { text: '"BLOCK"', cls: 'text-red-400' }, { text: ',', cls: 'text-muted-foreground' }],
    [{ text: '#   "policy": ', cls: 'text-muted-foreground' }, { text: '"pii_in_outbound_email"', cls: 'text-emerald' }, { text: ',', cls: 'text-muted-foreground' }],
    [{ text: '#   "reason": ', cls: 'text-muted-foreground' }, { text: '"SSN and full_name detected"', cls: 'text-emerald' }, { text: ',', cls: 'text-muted-foreground' }],
    [{ text: '#   "auditId": ', cls: 'text-muted-foreground' }, { text: '"ev_01j9x4k2m3n"', cls: 'text-amber-400' }, { text: ', "latencyMs": ', cls: 'text-muted-foreground' }, { text: '11 }', cls: 'text-emerald' }],
  ],
};

const deployCards = [
  { icon: Cloud, title: 'Cloud Native', desc: 'Deploy to any cloud provider with native integrations and auto-scaling.', badges: ['AWS', 'GCP', 'Azure', 'Vercel'] },
  { icon: Server, title: 'Self-Hosted', desc: 'Full on-premises deployment. Your data never leaves your infrastructure.', badges: ['Docker', 'VM', 'Bare Metal'] },
  { icon: Box, title: 'K8s Sidecar', desc: 'Inject as a sidecar container. Zero application code changes required.', badges: ['Per-pod injection', 'Service mesh'] },
  { icon: Network, title: 'Hybrid', desc: 'On-prem evaluation engine with cloud dashboard for compliance reporting.', badges: ['On-prem eval', 'Cloud dashboard'] },
];

export function IntegrationSection() {
  const [activeTab, setActiveTab] = useState('ts');
  const tab = codeTabs.find(t => t.id === activeTab)!;
  const lines = codeContent[activeTab] ?? [];

  return (
    <section id="integration" className="scroll-section relative px-4 py-24 overflow-hidden">
      <div className="section-divider mb-16" />
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-blue-500/4 blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Integration</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">Works With Your Stack</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Drop in anywhere. No architectural changes. Production in minutes.</p>
        </ScrollReveal>

        {/* Code showcase */}
        <div className="gradient-border shine-effect mb-12 overflow-hidden">
          {/* Tab bar */}
          <div className="flex gap-1 p-2 border-b border-border/50 overflow-x-auto relative">
            {codeTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="relative px-3 py-1.5 rounded text-xs font-mono transition-colors flex-shrink-0"
                style={{ color: activeTab === t.id ? 'oklch(0.7 0.18 165)' : 'oklch(0.55 0.01 250)' }}
              >
                {activeTab === t.id && (
                  <motion.div
                    layoutId="activeCodeTab"
                    className="absolute inset-0 rounded bg-emerald/10 border border-emerald/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>
          {/* Window chrome */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-border/30">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-muted-foreground font-mono ml-2">{tab.filename}</span>
          </div>
          {/* Code */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4 font-mono text-sm overflow-x-auto"
            >
              {lines.map((line, i) => (
                <div key={i} className="leading-relaxed min-h-[1.6rem]">
                  {line.length === 0
                    ? <span>&nbsp;</span>
                    : line.map((span, j) => <span key={j} className={span.cls}>{span.text}</span>)
                  }
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Deploy cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" staggerDelay={0.1}>
          {deployCards.map((card, i) => (
            <StaggerItem key={i}>
              <div className="gradient-border p-5 h-full group hover:border-emerald/30 transition-all duration-300 cursor-default">
                <div className="w-9 h-9 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center mb-3">
                  <card.icon className="w-4 h-4 text-emerald" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1.5">{card.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{card.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {card.badges.map(b => (
                    <span key={b} className="text-[10px] px-1.5 py-0.5 rounded-full border border-border/50 text-muted-foreground font-mono">{b}</span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
