'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Wifi, WifiOff } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';

// ── Types ─────────────────────────────────────────────────────────────────────

interface HealthData {
  status: string;
  version: string;
  shadow_mode: boolean;
  database: string;
  sheets_api: string;
  claude_api: string;
  lms: string;
  last_sync: string | null;
  uptime_seconds: number;
}

interface SyncStatus {
  last_sync: string | null;
  status?: string;
}

// ── Copy Button ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {/* clipboard not available */});
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[11px] font-['DM_Sans'] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors duration-150 px-2 py-1 rounded hover:bg-[var(--bg-surface-3)]"
    >
      {copied ? <Check size={12} className="text-[var(--status-active)]" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ── Method Badge ──────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: 'GET' | 'POST' | 'PATCH' | 'DELETE' }) {
  const colors: Record<string, string> = {
    GET: 'text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/30',
    POST: 'text-[var(--status-active)] bg-[var(--status-active)]/10 border-[var(--status-active)]/30',
    PATCH: 'text-[var(--status-pending)] bg-[var(--status-pending)]/10 border-[var(--status-pending)]/30',
    DELETE: 'text-[var(--status-error)] bg-[var(--status-error)]/10 border-[var(--status-error)]/30',
  };
  return (
    <span className={`text-[10px] font-['JetBrains_Mono'] font-bold px-2 py-0.5 rounded border ${colors[method] ?? 'text-[var(--text-muted)] border-[var(--border-subtle)]'}`}>
      {method}
    </span>
  );
}

// ── Code Block ────────────────────────────────────────────────────────────────

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="mt-2 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] overflow-hidden">
      {label && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-subtle)]">
          <span className="text-[10px] font-['DM_Sans'] text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
          <CopyButton text={code} />
        </div>
      )}
      {!label && (
        <div className="flex justify-end px-3 py-1.5 border-b border-[var(--border-subtle)]">
          <CopyButton text={code} />
        </div>
      )}
      <pre className="p-3 text-[11px] font-['JetBrains_Mono'] text-[var(--text-secondary)] overflow-x-auto whitespace-pre leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

// ── Endpoint Card ─────────────────────────────────────────────────────────────

interface EndpointCardProps {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  description: string;
  authHeader?: string;
  requestBody?: string;
  response?: string;
  curl: string;
}

function EndpointCard({ method, endpoint, description, authHeader, requestBody, response, curl }: EndpointCardProps) {
  return (
    <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-strong)] transition-all duration-150">
      <div className="flex items-center gap-3 mb-3">
        <MethodBadge method={method} />
        <span className="font-['JetBrains_Mono'] text-sm text-[var(--text-primary)]">{endpoint}</span>
      </div>
      <p className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] mb-3">{description}</p>

      {authHeader && (
        <div className="mb-2">
          <span className="text-[10px] font-['Syne'] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Auth Header</span>
          <div className="mt-1 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
            <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-secondary)]">{authHeader}</span>
          </div>
        </div>
      )}

      {requestBody && <CodeBlock code={requestBody} label="Request Body" />}
      {response && <CodeBlock code={response} label="Response" />}
      <CodeBlock code={curl} label="curl" />
    </div>
  );
}

// ── Pipeline Step ─────────────────────────────────────────────────────────────

function PipelineStepItem({ step, name, type, description }: { step: number; name: string; type: 'Pure Code' | 'Claude API'; description: string }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-['JetBrains_Mono'] font-bold text-[var(--text-muted)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex-shrink-0">
        {step}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-['Syne'] font-semibold text-[var(--text-primary)]">{name}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-['DM_Sans'] font-bold uppercase tracking-wider border ${
            type === 'Claude API'
              ? 'text-[var(--gold-400)] bg-[var(--gold-dim)] border-[var(--gold-400)]/30'
              : 'text-[var(--text-muted)] bg-[var(--bg-surface-3)] border-[var(--border-subtle)]'
          }`}>
            {type}
          </span>
        </div>
        <p className="text-xs font-['DM_Sans'] text-[var(--text-muted)]">{description}</p>
      </div>
    </div>
  );
}

// ── Env Var Table ─────────────────────────────────────────────────────────────

const envVars = [
  { name: 'AGENT_INTERNAL_TOKEN', purpose: 'Auth token for all agent API calls (X-Agent-Token header)', example: 'openssl rand -hex 32' },
  { name: 'AGENT_COMMAND_WEBHOOK_SECRET', purpose: 'Auth secret for webhook calls (X-Webhook-Secret header)', example: 'openssl rand -hex 32' },
  { name: 'AGENT_COMMAND_API_URL', purpose: 'Base URL for the backend API', example: 'https://yourdomain.com/api' },
  { name: 'ANTHROPIC_API_KEY', purpose: 'Anthropic Claude API key — used for Steps 4 and 10', example: 'sk-ant-...' },
  { name: 'SHADOW_MODE', purpose: 'When true, agents process but send NO external notifications', example: 'true' },
  { name: 'OPENCLAW_WORKSPACE_ID', purpose: 'OpenClaw workspace identifier for this agent', example: 'wajeeha-product' },
  { name: 'SUPABASE_URL', purpose: 'Supabase project URL for direct DB access', example: 'https://xxx.supabase.co' },
  { name: 'SUPABASE_ANON_KEY', purpose: 'Supabase anon key (public)', example: 'eyJ...' },
];

// ── Pipeline Steps Data ───────────────────────────────────────────────────────

const pipelineSteps: { step: number; name: string; type: 'Pure Code' | 'Claude API'; description: string }[] = [
  { step: 1, name: 'Retrieve Demo Record', type: 'Pure Code', description: 'Fetch conducted_demo_sessions row by demo_id. Hard stop if not found.' },
  { step: 2, name: 'Initial Logging', type: 'Pure Code', description: 'Write pipeline start event to agent_activity_log and set analysis_status=processing.' },
  { step: 3, name: 'POUR Identification', type: 'Pure Code', description: 'Detect quality flags (Video missing, Interaction low, Technical issues, etc.) from session data.' },
  { step: 4, name: 'Qualitative Review', type: 'Claude API', description: 'Claude analyzes session notes and produces structured qualitative assessment with confidence score.' },
  { step: 5, name: 'Fetch Student Feedback', type: 'Pure Code', description: 'Pull student rating and feedback text from demo_feedback sheet/table.' },
  { step: 6, name: 'Rating Standardisation', type: 'Pure Code', description: 'Normalise student and analyst ratings to a unified 0–10 scale.' },
  { step: 7, name: 'Export to Sales Sheet', type: 'Pure Code', description: 'Write structured output to Google Sheets (demo_conversion_sales tab).' },
  { step: 8, name: 'Pull Sales Data', type: 'Pure Code', description: 'Read conversion outcome and sales comments back from the sales sheet.' },
  { step: 9, name: 'Compile Sheet30', type: 'Pure Code', description: 'Aggregate 30-day rolling data into the Sheet30 summary for analytics.' },
  { step: 10, name: 'Accountability Classification', type: 'Claude API', description: 'Claude classifies non-conversion reason: Sales / Product / Consumer / Mixed with evidence.' },
  { step: 11, name: 'Update Teacher Progress', type: 'Pure Code', description: 'Write final teacher performance record and set analysis_status=pending_review. Notify Dawood.' },
];

// ── Endpoints Data ────────────────────────────────────────────────────────────

const BASE = 'https://{domain}/api';

const endpoints: EndpointCardProps[] = [
  {
    method: 'GET',
    endpoint: `${BASE}/agent/tasks?assignee=wajeeha&status=to_do`,
    description: 'Poll for tasks assigned to an agent. Filter by status (comma-separated). No AI cost.',
    authHeader: 'X-Agent-Token: {AGENT_INTERNAL_TOKEN}',
    response: `{
  "tasks": [
    {
      "id": "uuid",
      "title": "Process demo: 20260409_aisha_edexcel",
      "description": "...",
      "priority": "high",
      "due_date": "2026-04-09T15:00:00Z",
      "column_status": "to_do",
      "assignee_name": "wajeeha",
      "metadata": {}
    }
  ]
}`,
    curl: `curl -s "${BASE}/agent/tasks?assignee=wajeeha&status=to_do" \\
  -H "X-Agent-Token: \${AGENT_INTERNAL_TOKEN}"`,
  },
  {
    method: 'POST',
    endpoint: `${BASE}/agent/tasks`,
    description: 'Create a new task on the Kanban board.',
    authHeader: 'X-Agent-Token: {AGENT_INTERNAL_TOKEN}',
    requestBody: `{
  "title": "Follow up: 20260409_rania_igcse",
  "description": "Parent not responded in 24h",
  "priority": "high",
  "assignee_name": "wajeeha",
  "due_date": "2026-04-10T09:00:00Z",
  "metadata": { "demo_id": "20260409_rania_igcse" }
}`,
    response: `{ "task_id": "uuid" }`,
    curl: `curl -s -X POST "${BASE}/agent/tasks" \\
  -H "X-Agent-Token: \${AGENT_INTERNAL_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"...", "assignee_name":"wajeeha"}'`,
  },
  {
    method: 'PATCH',
    endpoint: `${BASE}/agent/tasks/:taskId`,
    description: 'Update task status, move columns, or add details.',
    authHeader: 'X-Agent-Token: {AGENT_INTERNAL_TOKEN}',
    requestBody: `{
  "column_status": "doing",
  "started_at": "2026-04-09T10:30:00Z"
}`,
    response: `{ "status": "updated" }`,
    curl: `curl -s -X PATCH "${BASE}/agent/tasks/{taskId}" \\
  -H "X-Agent-Token: \${AGENT_INTERNAL_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{"column_status":"doing"}'`,
  },
  {
    method: 'POST',
    endpoint: `${BASE}/agent/tasks/:taskId/complete`,
    description: 'Mark a task as done. Moves to done column, sets completed_at, logs to activity.',
    authHeader: 'X-Agent-Token: {AGENT_INTERNAL_TOKEN}',
    requestBody: `{
  "result": "Analysis completed. Confidence: 8.7. Proposal ready for Dawood review.",
  "artifacts": ["https://sheets.google.com/..."]
}`,
    response: `{ "status": "done", "task_id": "uuid" }`,
    curl: `curl -s -X POST "${BASE}/agent/tasks/{taskId}/complete" \\
  -H "X-Agent-Token: \${AGENT_INTERNAL_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{"result":"Done", "artifacts":[]}'`,
  },
  {
    method: 'POST',
    endpoint: `${BASE}/agent/log`,
    description: 'Write an action to the AI activity log.',
    authHeader: 'X-Agent-Token: {AGENT_INTERNAL_TOKEN}',
    requestBody: `{
  "agent_name": "wajeeha",
  "action_type": "pipeline_step",
  "demo_id": "20260409_aisha_edexcel",
  "details": "Completed Step 4 — qualitative review",
  "tokens_used": 1240,
  "status": "success"
}`,
    response: `{ "status": "logged" }`,
    curl: `curl -s -X POST "${BASE}/agent/log" \\
  -H "X-Agent-Token: \${AGENT_INTERNAL_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{"agent_name":"wajeeha","action_type":"step","status":"success"}'`,
  },
  {
    method: 'POST',
    endpoint: `${BASE}/agent/heartbeat`,
    description: 'Agent health check — returns system status, pending task count, shadow mode state.',
    authHeader: 'X-Agent-Token: {AGENT_INTERNAL_TOKEN}',
    requestBody: `{ "agent_name": "wajeeha" }`,
    response: `{
  "status": "ok",
  "pending_tasks": 3,
  "shadow_mode": true,
  "db_status": "ok",
  "uptime_seconds": 86400
}`,
    curl: `curl -s -X POST "${BASE}/agent/heartbeat" \\
  -H "X-Agent-Token: \${AGENT_INTERNAL_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{"agent_name":"wajeeha"}'`,
  },
  {
    method: 'POST',
    endpoint: `${BASE}/agent/identity`,
    description: 'Update agent identity file (soul, memory, daily_log). Logs to activity log.',
    authHeader: 'X-Agent-Token: {AGENT_INTERNAL_TOKEN}',
    requestBody: `{
  "agent_name": "wajeeha",
  "file_type": "memory",
  "content": "Lesson learned: when parent_persona is empty..."
}`,
    response: `{ "status": "logged", "agent_name": "wajeeha", "file_type": "memory" }`,
    curl: `curl -s -X POST "${BASE}/agent/identity" \\
  -H "X-Agent-Token: \${AGENT_INTERNAL_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{"agent_name":"wajeeha","file_type":"memory","content":"..."}'`,
  },
  {
    method: 'POST',
    endpoint: `${BASE}/agent/notify`,
    description: 'Write a notification for an agent or human. Respects shadow_mode from environment.',
    authHeader: 'X-Agent-Token: {AGENT_INTERNAL_TOKEN}',
    requestBody: `{
  "recipient": "dawood",
  "type": "demo_ready_for_review",
  "title": "Analysis ready: 20260409_aisha_edexcel",
  "message": "Confidence 8.7 — no POUR flags. Ready for approval.",
  "reference_id": "analysis-uuid"
}`,
    response: `{
  "notification_id": "uuid",
  "shadow_mode": true
}`,
    curl: `curl -s -X POST "${BASE}/agent/notify" \\
  -H "X-Agent-Token: \${AGENT_INTERNAL_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{"recipient":"dawood","type":"demo_ready_for_review","title":"...","message":"..."}'`,
  },
  {
    method: 'POST',
    endpoint: `${BASE}/agent/register`,
    description: 'Register a new agent instance. Logs registration to agent_activity_log.',
    authHeader: 'X-Agent-Token: {AGENT_INTERNAL_TOKEN}',
    requestBody: `{
  "agent_name": "wajeeha",
  "agent_type": "demo_analyst",
  "department": "Product/Counseling",
  "status": "active"
}`,
    response: `{ "registered": true, "agent_name": "wajeeha" }`,
    curl: `curl -s -X POST "${BASE}/agent/register" \\
  -H "X-Agent-Token: \${AGENT_INTERNAL_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{"agent_name":"wajeeha","agent_type":"demo_analyst","department":"Product/Counseling"}'`,
  },
  {
    method: 'POST',
    endpoint: `${BASE}/webhooks/demo-complete`,
    description: 'Trigger the 11-step pipeline for a demo. Validates demo_id first. Returns immediately; pipeline runs in background.',
    authHeader: 'X-Webhook-Secret: {AGENT_COMMAND_WEBHOOK_SECRET}',
    requestBody: `{ "demo_id": "20260409_aisha_edexcel" }`,
    response: `{ "pipeline_started": true, "demo_id": "20260409_aisha_edexcel" }`,
    curl: `curl -s -X POST "${BASE}/webhooks/demo-complete" \\
  -H "X-Webhook-Secret: \${AGENT_COMMAND_WEBHOOK_SECRET}" \\
  -H "Content-Type: application/json" \\
  -d '{"demo_id":"20260409_aisha_edexcel"}'`,
  },
  {
    method: 'GET',
    endpoint: `${BASE}/pipeline/status/:demoId`,
    description: 'Get current pipeline and analysis status for a demo.',
    authHeader: '(no auth required)',
    response: `{
  "demo": {
    "demo_id": "20260409_aisha_edexcel",
    "analysis_status": "pending_review",
    "teacher_name": "Nadia Hassan",
    "student_name": "Aisha Tariq"
  },
  "analysis": {
    "analysis_id": "uuid",
    "analysis_status": "pending_review",
    "agent_confidence": 8.7,
    "processing_time_mins": 12.4,
    "tokens_used": 3820
  }
}`,
    curl: `curl -s "${BASE}/pipeline/status/20260409_aisha_edexcel"`,
  },
  {
    method: 'GET',
    endpoint: `${BASE}/sync/status`,
    description: 'Returns last Google Sheets sync timestamp and health for each configured sheet.',
    authHeader: '(no auth required)',
    response: `{
  "last_sync": "2026-04-09T10:30:00Z",
  "sheets": [
    { "name": "conducted_demos", "status": "ok", "rows": 450 },
    { "name": "demo_feedback", "status": "ok", "rows": 280 }
  ]
}`,
    curl: `curl -s "${BASE}/sync/status"`,
  },
  {
    method: 'POST',
    endpoint: `${BASE}/sync/trigger`,
    description: 'Manually trigger a Google Sheets sync for all configured sheets.',
    authHeader: '(no auth required)',
    response: `{
  "sheets_synced": 4,
  "total_rows": 150,
  "errors": 0,
  "duration_ms": 3200
}`,
    curl: `curl -s -X POST "${BASE}/sync/trigger"`,
  },
];

// ── Live Status ───────────────────────────────────────────────────────────────

function LiveStatus() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const [h, s] = await Promise.all([
        fetch('/api/health').then((r) => r.json() as Promise<HealthData>),
        fetch('/api/sync/status').then((r) => r.json() as Promise<SyncStatus>).catch(() => null),
      ]);
      setHealth(h);
      setSyncStatus(s);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-4 h-20" />
        ))}
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const dbOk = health?.database === 'connected';
  const lastSync = syncStatus?.last_sync ?? health?.last_sync;

  const statusItems = [
    {
      label: 'Database',
      value: dbOk ? 'Connected' : 'Error',
      icon: dbOk ? <Wifi size={16} className="text-[var(--status-active)]" /> : <WifiOff size={16} className="text-[var(--status-error)]" />,
      color: dbOk ? 'var(--status-active)' : 'var(--status-error)',
    },
    {
      label: 'Shadow Mode',
      value: health?.shadow_mode ? 'ON' : 'OFF',
      icon: null,
      color: health?.shadow_mode ? 'var(--status-shadow)' : 'var(--status-active)',
    },
    {
      label: 'Last Sync',
      value: lastSync ? new Date(lastSync).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Never',
      icon: null,
      color: 'var(--text-secondary)',
    },
    {
      label: 'Uptime',
      value: health ? formatUptime(health.uptime_seconds) : '—',
      icon: null,
      color: 'var(--text-secondary)',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {statusItems.map((item) => (
        <div key={item.label} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            {item.icon}
            <span className="text-[10px] font-['Syne'] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{item.label}</span>
          </div>
          <span className="font-['JetBrains_Mono'] text-sm font-medium" style={{ color: item.color }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IntegrationPage() {
  return (
    <Shell breadcrumbs={[{ label: '◆ Tuitional', path: '/manager' }, { label: 'Integration' }]}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-10"
      >
        {/* Header */}
        <div>
          <h1 className="font-['Syne'] font-bold text-2xl text-[var(--text-primary)] mb-1">Integration Reference</h1>
          <p className="text-sm font-['DM_Sans'] text-[var(--text-secondary)]">
            Complete API reference for connecting OpenClaw agents to the Tuitional AI OS backend.
          </p>
        </div>

        {/* Live Status */}
        <section>
          <h2 className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)] mb-4">Live System Status</h2>
          <LiveStatus />
        </section>

        {/* Authentication */}
        <section>
          <h2 className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)] mb-4">Authentication</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
              <h3 className="font-['Syne'] font-semibold text-sm text-[var(--text-primary)] mb-2">Agent Auth</h3>
              <p className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] mb-3">
                All <code className="font-['JetBrains_Mono'] text-[var(--gold-400)]">/api/agent/*</code> endpoints require this header.
              </p>
              <div className="px-3 py-2 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                <span className="font-['JetBrains_Mono'] text-xs text-[var(--text-secondary)]">
                  X-Agent-Token: {'${AGENT_INTERNAL_TOKEN}'}
                </span>
              </div>
            </div>
            <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
              <h3 className="font-['Syne'] font-semibold text-sm text-[var(--text-primary)] mb-2">Webhook Auth</h3>
              <p className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] mb-3">
                All <code className="font-['JetBrains_Mono'] text-[var(--gold-400)]">/api/webhooks/*</code> endpoints require this header.
              </p>
              <div className="px-3 py-2 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                <span className="font-['JetBrains_Mono'] text-xs text-[var(--text-secondary)]">
                  X-Webhook-Secret: {'${AGENT_COMMAND_WEBHOOK_SECRET}'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section>
          <h2 className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)] mb-4">API Reference</h2>
          <div className="space-y-4">
            {endpoints.map((ep, i) => (
              <motion.div
                key={ep.endpoint}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <EndpointCard {...ep} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Environment Variables */}
        <section>
          <h2 className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)] mb-4">Environment Variables</h2>
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
            <table className="w-full text-xs font-['DM_Sans']">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left px-5 py-3 font-['Syne'] font-semibold text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Variable</th>
                  <th className="text-left px-5 py-3 font-['Syne'] font-semibold text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Purpose</th>
                  <th className="text-left px-5 py-3 font-['Syne'] font-semibold text-[10px] uppercase tracking-wider text-[var(--text-muted)] hidden md:table-cell">Example</th>
                </tr>
              </thead>
              <tbody>
                {envVars.map((v, i) => (
                  <tr key={v.name} className={`border-b border-[var(--border-subtle)] last:border-0 ${i % 2 === 0 ? '' : 'bg-[var(--bg-surface-2)]/40'}`}>
                    <td className="px-5 py-3 font-['JetBrains_Mono'] text-[11px] text-[var(--gold-400)] whitespace-nowrap">{v.name}</td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">{v.purpose}</td>
                    <td className="px-5 py-3 font-['JetBrains_Mono'] text-[10px] text-[var(--text-muted)] hidden md:table-cell">{v.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pipeline Steps */}
        <section>
          <h2 className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)] mb-4">Pipeline Steps</h2>
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            {pipelineSteps.map((s) => (
              <PipelineStepItem key={s.step} {...s} />
            ))}
          </div>
        </section>
      </motion.div>
    </Shell>
  );
}
