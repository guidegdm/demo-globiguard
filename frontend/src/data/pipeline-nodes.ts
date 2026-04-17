/* Pipeline node click-panel content for all 14 nodes */

export interface PanelContent {
  id: string;
  title: string;
  subtitle?: string;
  decision?: 'ALLOW' | 'MODIFY' | 'QUEUE' | 'BLOCK';
  accentColor?: string;
  sections: Array<{
    heading: string;
    body?: string;
    code?: string;
    dataExample?: { before: string; after: string; label?: string };
  }>;
}

export const PIPELINE_NODES: PanelContent[] = [
  {
    id: 'data-sources',
    title: 'Data Sources',
    subtitle: 'MCP-connected enterprise systems',
    accentColor: '#4A5568',
    sections: [
      {
        heading: 'Connected Sources',
        body: 'GlobiGuard connects to any MCP-compatible data source. In this demo, an insurance claim email arrives from Gmail via the MCPConnector.',
      },
      {
        heading: 'Supported Connectors',
        body: 'Gmail, Slack, Salesforce, Epic EHR, QuickBooks, S3, Azure Blob, PostgreSQL, MongoDB — all via standardized MCP protocol.',
      },
      {
        heading: 'Payload Example',
        code: `{
  "source": "gmail",
  "type": "claim_email",
  "id": "msg_78234",
  "body": "Patient Sarah Mitchell (SSN 547-82-3901)...",
  "timestamp": "2024-01-15T09:23:11Z"
}`,
      },
    ],
  },
  {
    id: 'mcp-connector',
    title: 'MCP Connector',
    subtitle: 'Model Context Protocol bridge',
    accentColor: '#D97706',
    sections: [
      {
        heading: 'What is MCP?',
        body: 'The Model Context Protocol is an open standard for connecting AI assistants to data sources. GlobiGuard intercepts every MCP tool call — acting as a transparent proxy that enforces policy before data reaches the LLM.',
      },
      {
        heading: 'Zero-change Integration',
        body: 'Your existing MCP-compatible agents work unchanged. You point them at GlobiGuard\'s endpoint instead of the data source directly. No SDK changes required.',
      },
      {
        heading: 'Intercepted Call',
        code: `// Original MCP call
tool.call("read_email", { id: "msg_78234" })

// GlobiGuard intercepts, inspects, enforces
// Returns: tokenized payload or 202 QUEUE`,
      },
    ],
  },
  {
    id: 'go-sidecar',
    title: 'Go Sidecar :8080',
    subtitle: '6MB binary, <1ms overhead',
    accentColor: '#4299E1',
    sections: [
      {
        heading: 'The Enforcement Engine',
        body: 'A 6MB Go static binary runs as a sidecar in your VPC. It receives every LLM request, routes it through the detection pipeline, and returns a policy decision — all in under 2ms average.',
      },
      {
        heading: 'Why Go?',
        body: "Go's memory safety, goroutine concurrency, and tiny binary size make it ideal for the hot path. No JVM warmup, no Python GIL, no Node.js event loop contention.",
      },
      {
        heading: 'Performance',
        code: `// Benchmarks (P99)
Regex detection:    0.8ms
Presidio NER:       8.2ms
GLiNER:            24.7ms
Full pipeline:     28.3ms
Overhead vs base:   <2ms`,
      },
    ],
  },
  {
    id: 'regex-layer',
    title: 'Regex Layer (L1)',
    subtitle: '~70% of detections, <1ms',
    accentColor: '#38A169',
    decision: 'ALLOW',
    sections: [
      {
        heading: 'Layer 1 Detection',
        body: 'Fast regex patterns catch ~70% of PII in under 1ms. SSNs, phone numbers, ICD-10 codes, credit card numbers — deterministic and cheap.',
      },
      {
        heading: 'Pattern Library',
        code: `SSN:    /\\b\\d{3}-\\d{2}-\\d{4}\\b/
ICD-10: /\\b[A-Z]\\d{2}\\.?\\d?\\b/
CCN:    /\\b\\d{4}[- ]\\d{4}[- ]\\d{4}[- ]\\d{4}\\b/
Phone:  /\\b\\+?1?\\(?\\d{3}\\)?[-.]?\\d{3}[-.]?\\d{4}\\b/
Email:  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z]{2,}/i`,
      },
      {
        heading: 'This Request',
        body: 'ICD-10 code E11.9 detected (Type 2 Diabetes). SSN 547-82-3901 detected. Both flagged for tokenization.',
        dataExample: { before: 'ICD-10: E11.9', after: '[MASKED-ICD10-001]', label: 'L1 pattern match' },
      },
    ],
  },
  {
    id: 'presidio-ner',
    title: 'Presidio NER (L2)',
    subtitle: '~20% of detections, <10ms',
    accentColor: '#4299E1',
    sections: [
      {
        heading: 'Layer 2 Detection',
        body: 'Microsoft Presidio uses spaCy Named Entity Recognition to catch ~20% of PII that regex misses — names, addresses, organizations in natural language context.',
      },
      {
        heading: 'What Presidio Catches',
        body: '"Sarah Mitchell" identified as PERSON entity with 0.97 confidence. "Dr. Chen" identified as PERSON with 0.94 confidence.',
        dataExample: { before: 'Sarah Mitchell', after: '[MASKED-PERSON-001]', label: 'NER entity' },
      },
      {
        heading: 'Confidence Threshold',
        code: `// Only flag above threshold
if entity.confidence > 0.85:
    flag_for_tokenization(entity)
// Prevents false positives on common phrases`,
      },
    ],
  },
  {
    id: 'gliner',
    title: 'GLiNER (L3)',
    subtitle: '~10% of detections, <30ms',
    accentColor: '#9F7AEA',
    sections: [
      {
        heading: 'Layer 3 Detection',
        body: 'GLiNER catches ~10% of the hardest cases — medications, rare medical codes, domain-specific identifiers that NER misses.',
      },
      {
        heading: 'Zero-shot Entity Recognition',
        body: 'GLiNER uses a bi-encoder architecture that recognizes any entity type without training examples. Define types in plain English: "medication name", "patient identifier".',
        dataExample: { before: 'Metformin 500mg', after: '[MASKED-MED-003]', label: 'GLiNER zero-shot' },
      },
      {
        heading: 'Why Not Just GLiNER?',
        body: 'GLiNER takes ~24ms. Running it on every request would add 24ms of latency. The 3-layer cascade means only ~10% of requests need GLiNER — keeping average latency under 3ms.',
      },
    ],
  },
  {
    id: 'risk-scorer',
    title: 'Risk Scorer',
    subtitle: 'Composite risk 0.00–1.00',
    accentColor: '#FC8181',
    sections: [
      {
        heading: 'Risk Calculation',
        body: 'The risk scorer aggregates detection signals across all three layers into a single 0.00–1.00 score. Multiple PII types, sensitivity categories, and context all push the score higher.',
      },
      {
        heading: 'Score Breakdown',
        code: `SSN detected:         +0.35
ICD-10 detected:      +0.25
Person name:          +0.15
Medication:           +0.10
Context: insurance:   +0.05
──────────────────────────
Final score:          0.84  → QUEUE`,
      },
      {
        heading: 'Decision Thresholds',
        code: `ALLOW:  score < 0.40
MODIFY: 0.40 <= score < 0.70
QUEUE:  0.70 <= score < 0.90  ← this request
BLOCK:  score >= 0.90`,
      },
    ],
  },
  {
    id: 'gate',
    title: 'Policy Gate',
    subtitle: 'HTTP 202 — held for review',
    accentColor: '#ED8936',
    decision: 'QUEUE',
    sections: [
      {
        heading: 'The Gate Decision',
        body: 'The Policy Gate reads the risk score (0.84) and applies the configured policy. Score 0.84 falls in the QUEUE range (0.70–0.89). HTTP 202 Accepted is returned — processing continues under human supervision.',
      },
      {
        heading: 'HTTP Response',
        code: `HTTP/1.1 202 Accepted
X-GlobiGuard-Decision: QUEUE
X-GlobiGuard-Score: 0.84
X-GlobiGuard-Review-ID: rev_a8f3d1
Content-Type: application/json

{
  "status": "queued",
  "review_required": true,
  "estimated_wait": "< 4 hours"
}`,
      },
      {
        heading: 'Why 202?',
        body: '202 Accepted means "we got it, but it needs more work before completion." Unlike 403 Forbidden (which blocks entirely), 202 allows the AI pipeline to continue under human oversight.',
      },
    ],
  },
  {
    id: 'tokenizer',
    title: 'Tokenizer',
    subtitle: 'Reversible PII substitution',
    accentColor: '#319795',
    sections: [
      {
        heading: 'Tokenization',
        body: 'Each detected PII field is replaced with a stable, opaque token. The original value is stored in an encrypted Redis map with a 1-hour TTL. The LLM only ever sees the tokens.',
      },
      {
        heading: 'Token Format',
        body: 'Tokens are human-readable for auditability: [MASKED-TYPE-NNN]. The type shows what was masked; the number allows de-duplication within a request.',
        dataExample: { before: '547-82-3901', after: '[MASKED-SSN-001]', label: 'stable token' },
      },
      {
        heading: 'Multiple Transforms',
        code: `"Sarah Mitchell"  → [MASKED-PERSON-001]
"ICD-10: E11.9"   → [MASKED-ICD10-002]
"547-82-3901"     → [MASKED-SSN-003]
"Metformin 500mg" → [MASKED-MED-004]
"03/15/1987"      → [MASKED-DOB-005]`,
      },
    ],
  },
  {
    id: 'token-map',
    title: 'Token Map (Redis)',
    subtitle: 'Encrypted lookup, TTL 1hr',
    accentColor: '#319795',
    sections: [
      {
        heading: 'Token Registry',
        body: 'Redis stores the token→value mapping with AES-256-GCM encryption. Only the Detokenizer (running in your VPC) can reverse the mapping. GlobiGuard cloud never receives the values.',
      },
      {
        heading: 'Security Properties',
        body: 'Keys are encrypted with a per-request HMAC. The Redis instance runs in your VPC. GlobiGuard coordination plane sees only token names — never original values.',
      },
      {
        heading: 'Storage Entry',
        code: `{
  "key": "MASKED-SSN-003",
  "value": encrypt("547-82-3901"),
  "ttl": 3600,
  "created": "2024-01-15T09:23:12Z",
  "request_id": "req_78234_b9f2"
}`,
      },
    ],
  },
  {
    id: 'llm',
    title: 'LLM (masked only)',
    subtitle: 'AI processes de-identified data',
    accentColor: '#4A5568',
    sections: [
      {
        heading: 'What the LLM Sees',
        body: 'The LLM receives only the tokenized payload. It processes [MASKED-SSN-003] and [MASKED-ICD10-002] — never the actual SSN or ICD-10 code. The LLM output preserves the tokens.',
      },
      {
        heading: 'Masked Input',
        code: `Patient [MASKED-PERSON-001]
DOB: [MASKED-DOB-005]
Diagnosis: [MASKED-ICD10-002]
SSN: [MASKED-SSN-003]
Medication: [MASKED-MED-004]`,
      },
      {
        heading: 'Why This Matters',
        body: 'Even if the LLM provider stores prompts for training, they never see real patient data. HIPAA compliance is maintained even with cloud LLM providers — a previously impossible combination.',
      },
    ],
  },
  {
    id: 'detokenizer',
    title: 'Detokenizer',
    subtitle: 'Restore for authorized output',
    accentColor: '#319795',
    sections: [
      {
        heading: 'Detokenization',
        body: 'After the LLM responds with tokens in the output, the Detokenizer looks up each token in Redis and substitutes back the original values. This happens in your VPC — not in the cloud.',
        dataExample: { before: '[MASKED-SSN-003]', after: '547-82-3901', label: 'restored for output' },
      },
      {
        heading: 'Access Control',
        body: 'Detokenization can be restricted by role. A summary report might only detokenize name+DOB, but not SSN. The policy engine controls which tokens are revealed to which downstream systems.',
      },
      {
        heading: 'Audit Trail',
        code: `{
  "event": "detokenize",
  "tokens_restored": ["MASKED-PERSON-001", "MASKED-ICD10-002"],
  "tokens_redacted": ["MASKED-SSN-003"],
  "authorized_by": "policy:insurance-adjuster-v2.1",
  "timestamp": "2024-01-15T09:23:18Z"
}`,
      },
    ],
  },
  {
    id: 'audit-log',
    title: 'Audit Log',
    subtitle: 'Tamper-evident compliance record',
    accentColor: '#805AD5',
    sections: [
      {
        heading: 'Immutable Audit Trail',
        body: 'Every enforcement decision is logged with a cryptographic hash chain. Each entry references the previous entry\'s hash — making it impossible to delete or alter a record without detection.',
      },
      {
        heading: 'Log Entry',
        code: `{
  "id": "log_a8f3d1",
  "action": "QUEUE",
  "score": 0.84,
  "fields": ["SSN", "ICD10", "PERSON", "MED"],
  "policy": "insurance-hipaa-v2.1",
  "prev_hash": "sha256:8f3d...",
  "hash": "sha256:9c2e...",
  "timestamp": "2024-01-15T09:23:12Z"
}`,
      },
      {
        heading: 'Compliance Value',
        body: 'In a HIPAA audit, you provide the audit log. Every access to PHI is documented, timestamped, and verifiable. GlobiGuard generates the evidence your compliance team needs automatically.',
      },
    ],
  },
  {
    id: 'safe-output',
    title: 'Safe Output',
    subtitle: 'Compliant response to requester',
    accentColor: '#38A169',
    decision: 'ALLOW',
    sections: [
      {
        heading: 'The Final Response',
        body: 'After human review approves the tokenized processing, the LLM response is detokenized and returned to the requester. The full audit trail is attached as response headers.',
      },
      {
        heading: 'Response Headers',
        code: `HTTP/1.1 200 OK
X-GlobiGuard-Decision: ALLOW
X-GlobiGuard-Review-ID: rev_a8f3d1
X-GlobiGuard-Audit: log_a8f3d1
X-GlobiGuard-Policy: insurance-hipaa-v2.1`,
      },
      {
        heading: 'What Was Protected',
        body: '4 PII fields tokenized during AI processing. 0 incidents. Full HIPAA audit trail generated. Sarah\'s claim was processed compliantly in under 4 hours, with human oversight at the critical risk threshold.',
      },
    ],
  },
];
