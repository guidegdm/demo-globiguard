export type StepType =
  | 'READ_DATA'
  | 'DETECT_PII'
  | 'CALL_LLM'
  | 'GATE_CHECK'
  | 'WRITE_RECORD'
  | 'SEND_MESSAGE'
  | 'REQUIRE_APPROVAL'
  | 'NOTIFY';

export interface WorkflowStep {
  id: string;
  type: StepType;
  label: string;
  description: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  label?: string;
  variant?: 'allow' | 'queue' | 'block' | 'default';
}

export interface WorkflowConfig {
  id: string;
  label: string;
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
}

export const STEP_COLORS: Record<StepType, string> = {
  READ_DATA:        '#2B4C8C',
  DETECT_PII:       '#6B46C1',
  CALL_LLM:         '#4A5568',
  GATE_CHECK:       '#ED8936',
  WRITE_RECORD:     '#276749',
  SEND_MESSAGE:     '#276749',
  REQUIRE_APPROVAL: '#ED8936',
  NOTIFY:           '#553C9A',
};

export const WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'insurance',
    label: 'Insurance',
    steps: [
      { id: 'read',    type: 'READ_DATA',        label: 'Read Claim',       description: 'Pull claim_78234.json from MCP connector' },
      { id: 'detect',  type: 'DETECT_PII',       label: 'Detect PII',       description: 'Cascade: Regex -> Presidio -> GLiNER' },
      { id: 'llm',     type: 'CALL_LLM',         label: 'Call LLM',         description: 'GPT-4o - only tokenized context' },
      { id: 'gate',    type: 'GATE_CHECK',       label: 'Gate Check',       description: 'Policy: risk > 0.8 -> QUEUE' },
      { id: 'allow',   type: 'SEND_MESSAGE',     label: 'Send Email',       description: 'Email adjuster@meridian.com (tokenized)' },
      { id: 'queue',   type: 'REQUIRE_APPROVAL', label: 'Human Review',     description: 'HTTP 202 * Human review dashboard' },
      { id: 'block',   type: 'NOTIFY',           label: 'Block & Notify',   description: 'Incident logged * SOC notified' },
      { id: 'resolve', type: 'SEND_MESSAGE',     label: 'Deliver Claim',    description: 'Tokenized claim delivered' },
    ],
    edges: [
      { from: 'read',   to: 'detect' },
      { from: 'detect', to: 'llm' },
      { from: 'llm',    to: 'gate' },
      { from: 'gate',   to: 'allow',   label: 'ALLOW', variant: 'allow' },
      { from: 'gate',   to: 'queue',   label: 'QUEUE', variant: 'queue' },
      { from: 'gate',   to: 'block',   label: 'BLOCK', variant: 'block' },
      { from: 'queue',  to: 'resolve' },
    ],
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    steps: [
      { id: 'read',    type: 'READ_DATA',        label: 'Epic EHR',         description: 'Pull patient_med_list from Epic MCP connector' },
      { id: 'detect',  type: 'DETECT_PII',       label: 'Detect PHI',       description: 'Cascade: Regex -> Presidio -> GLiNER (HIPAA 164.512)' },
      { id: 'llm',     type: 'CALL_LLM',         label: 'Reconcile',        description: 'Claude 3.5 - medication reconciliation report' },
      { id: 'gate',    type: 'GATE_CHECK',       label: 'Gate Check',       description: 'Policy: risk > 0.8 -> QUEUE' },
      { id: 'allow',   type: 'WRITE_RECORD',     label: 'Write Record',     description: 'De-identified record written to Epic' },
      { id: 'queue',   type: 'REQUIRE_APPROVAL', label: 'Clinician Review', description: 'HTTP 202 * Clinician review dashboard' },
      { id: 'block',   type: 'NOTIFY',           label: 'Block & Audit',    description: 'HIPAA audit entry * compliance officer notified' },
      { id: 'resolve', type: 'WRITE_RECORD',     label: 'Patient Summary',  description: 'Approved de-identified summary delivered' },
    ],
    edges: [
      { from: 'read',   to: 'detect' },
      { from: 'detect', to: 'llm' },
      { from: 'llm',    to: 'gate' },
      { from: 'gate',   to: 'allow',   label: 'ALLOW', variant: 'allow' },
      { from: 'gate',   to: 'queue',   label: 'QUEUE', variant: 'queue' },
      { from: 'gate',   to: 'block',   label: 'BLOCK', variant: 'block' },
      { from: 'queue',  to: 'resolve' },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    steps: [
      { id: 'read',    type: 'READ_DATA',        label: 'QuickBooks',       description: 'Pull Q4 payroll ledger from QuickBooks API' },
      { id: 'detect',  type: 'DETECT_PII',       label: 'Detect NPI',       description: 'Cascade: Regex -> Presidio -> GLiNER (GLBA 501)' },
      { id: 'llm',     type: 'CALL_LLM',         label: 'Analyze',          description: 'GPT-4o - trend + anomaly analysis (masked)' },
      { id: 'gate',    type: 'GATE_CHECK',       label: 'Gate Check',       description: 'Policy: risk > 0.8 -> QUEUE' },
      { id: 'allow',   type: 'SEND_MESSAGE',     label: 'CFO Report',       description: 'Masked financials delivered to CFO dashboard' },
      { id: 'queue',   type: 'REQUIRE_APPROVAL', label: 'CFO Review',       description: 'HTTP 202 * CFO review dashboard' },
      { id: 'block',   type: 'NOTIFY',           label: 'Block & Log',      description: 'Compliance incident logged * GLBA alert' },
      { id: 'resolve', type: 'SEND_MESSAGE',     label: 'Deliver Report',   description: 'Approved masked CFO report delivered' },
    ],
    edges: [
      { from: 'read',   to: 'detect' },
      { from: 'detect', to: 'llm' },
      { from: 'llm',    to: 'gate' },
      { from: 'gate',   to: 'allow',   label: 'ALLOW', variant: 'allow' },
      { from: 'gate',   to: 'queue',   label: 'QUEUE', variant: 'queue' },
      { from: 'gate',   to: 'block',   label: 'BLOCK', variant: 'block' },
      { from: 'queue',  to: 'resolve' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    steps: [
      { id: 'read',    type: 'READ_DATA',        label: 'Bloomberg Feed',   description: 'Pull trade order #TR-9921 from Bloomberg MCP' },
      { id: 'detect',  type: 'DETECT_PII',       label: 'Detect PAN',       description: 'Cascade: Regex -> Presidio -> GLiNER (PCI DSS 3.4)' },
      { id: 'llm',     type: 'CALL_LLM',         label: 'Risk Model',       description: 'Internal risk model - position sizing inference' },
      { id: 'gate',    type: 'GATE_CHECK',       label: 'Gate Check',       description: 'Policy: risk > 0.8 -> QUEUE' },
      { id: 'allow',   type: 'WRITE_RECORD',     label: 'Auto Execute',     description: 'Trade executed with full audit trail' },
      { id: 'queue',   type: 'REQUIRE_APPROVAL', label: 'Officer Review',   description: 'HTTP 202 * Compliance officer review dashboard' },
      { id: 'block',   type: 'NOTIFY',           label: 'Block & Alert',    description: 'PCI DSS incident logged * CISO notified' },
      { id: 'resolve', type: 'WRITE_RECORD',     label: 'Execute Trade',    description: 'Approved tokenized position executed' },
    ],
    edges: [
      { from: 'read',   to: 'detect' },
      { from: 'detect', to: 'llm' },
      { from: 'llm',    to: 'gate' },
      { from: 'gate',   to: 'allow',   label: 'ALLOW', variant: 'allow' },
      { from: 'gate',   to: 'queue',   label: 'QUEUE', variant: 'queue' },
      { from: 'gate',   to: 'block',   label: 'BLOCK', variant: 'block' },
      { from: 'queue',  to: 'resolve' },
    ],
  },
];
