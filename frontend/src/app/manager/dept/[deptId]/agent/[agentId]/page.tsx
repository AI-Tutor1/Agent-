'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { api, type AgentStats, type AgentHeartbeat } from '@/lib/api';

const PIPELINE_STEPS = [
  { step: 1,  label: 'Retrieve demo record' },
  { step: 2,  label: 'Initial logging' },
  { step: 3,  label: 'POUR identification' },
  { step: 4,  label: 'Qualitative review (Claude API)' },
  { step: 5,  label: 'Fetch student feedback' },
  { step: 6,  label: 'Rating standardisation' },
  { step: 7,  label: 'Export to sales sheet' },
  { step: 8,  label: 'Pull sales data' },
  { step: 9,  label: 'Compile report' },
  { step: 10, label: 'Accountability classification (Claude API)' },
  { step: 11, label: 'Update teacher progress' },
] as const;

interface SoulData {
  content: string;
  agent_name: string;
  file_type: string;
}

export default function AgentPage() {
  const router = useRouter();
  const params = useParams<{ deptId: string; agentId: string }>();

  const [soulContent, setSoulContent]     = useState<string | null>(null);
  const [soulLoading, setSoulLoading]     = useState(true);
  const [soulNotFound, setSoulNotFound]   = useState(false);

  const [stats, setStats]                 = useState<AgentStats | null>(null);
  const [heartbeat, setHeartbeat]         = useState<AgentHeartbeat | null>(null);
  const [pipelineHasRun, setPipelineHasRun] = useState(false);

  useEffect(() => {
    const agentId = params?.agentId;
    if (!agentId) return;

    // SOUL.md
    fetch(`/api/agent/files/${agentId}/SOUL`)
      .then(async (res) => {
        if (res.status === 404) { setSoulNotFound(true); return; }
        const data = await res.json() as SoulData;
        setSoulContent(data.content);
      })
      .catch(() => setSoulNotFound(true))
      .finally(() => setSoulLoading(false));

    // Performance stats
    api.dashboard.getAgentStats()
      .then(setStats)
      .catch(() => setStats(null));

    // Heartbeat / status
    api.dashboard.getHeartbeat(agentId)
      .then(setHeartbeat)
      .catch(() => setHeartbeat(null));

    // Pipeline: check if any run has happened
    api.dashboard.getPipelineLatest()
      .then((data) => setPipelineHasRun(data.steps.length > 0))
      .catch(() => setPipelineHasRun(false));
  }, [params?.agentId]);

  const statusColor = heartbeat
    ? (heartbeat.status === 'Online' ? 'var(--status-active)' : 'var(--text-muted)')
    : 'var(--text-muted)';

  return (
    <Shell breadcrumbs={[
      { label: '◆ Tuitional', path: '/manager' },
      { label: '◉ Product', path: `/manager/dept/${params.deptId}` },
      { label: '● Wajeeha' },
    ]}>
      <button
        onClick={() => router.push(`/manager/dept/${params.deptId}`)}
        className="flex items-center gap-1.5 text-sm font-['DM_Sans'] text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6"
      >
        <ArrowLeft size={16} /> Back to Department
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">

        {/* ── Left: Identity Panel ── */}
        <div className="space-y-4">

          {/* Status card */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} />
              <span className="font-['Syne'] font-bold text-lg text-[var(--text-primary)]">WAJEEHA</span>
            </div>
            <div className="text-sm font-['DM_Sans'] text-[var(--text-secondary)]">Demo-to-Conversion Analyst</div>
            <div className="text-xs font-['DM_Sans'] text-[var(--text-muted)]">Product / Counseling</div>

            <div className="mt-4 space-y-2 text-xs font-['DM_Sans']">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">STATUS</span>
                <span style={{ color: statusColor }}>
                  {heartbeat ? heartbeat.status : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">SHADOW MODE</span>
                <span style={{ color: heartbeat?.shadow_mode ? 'var(--status-shadow)' : 'var(--text-muted)' }}>
                  {heartbeat === null ? '—' : heartbeat.shadow_mode ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">UPTIME</span>
                <span className="text-[var(--text-secondary)] font-['JetBrains_Mono']">
                  {heartbeat?.uptime ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {/* SOUL.md */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h4 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">SOUL.md</h4>
            {soulLoading ? (
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-2.5 bg-[var(--bg-surface-2)] rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
                ))}
              </div>
            ) : soulNotFound ? (
              <p className="text-xs font-['DM_Sans'] text-[var(--text-muted)] italic">
                File not found — add SOUL.md to agent-files/wajeeha/
              </p>
            ) : (
              <pre className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {soulContent}
              </pre>
            )}
          </div>

          {/* Performance */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h4 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Performance (30d)</h4>
            <div className="space-y-2 text-xs font-['DM_Sans']">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Avg confidence</span>
                <span className="text-[var(--text-primary)] font-['JetBrains_Mono']">
                  {stats?.avg_confidence != null ? `${stats.avg_confidence}/10` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">First-pass approval</span>
                <span className="text-[var(--text-primary)] font-['JetBrains_Mono']">
                  {stats?.first_pass_rate != null ? `${stats.first_pass_rate}%` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Avg processing</span>
                <span className="text-[var(--text-primary)] font-['JetBrains_Mono']">
                  {stats?.avg_processing_mins != null ? `${stats.avg_processing_mins} min` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Today</span>
                <span className="text-[var(--text-primary)] font-['JetBrains_Mono']">
                  {stats != null ? `${stats.today_count} processed` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Center: Pipeline ── */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
          <h3 className="font-['Syne'] font-semibold text-sm text-[var(--text-primary)] mb-1">
            Pipeline — 11 Steps
          </h3>
          {!pipelineHasRun && (
            <p className="text-[11px] font-['DM_Sans'] text-[var(--text-muted)] mb-4">
              No pipeline runs yet. Steps will update in real-time once demos are processed.
            </p>
          )}
          <div className="space-y-3 mt-4">
            {PIPELINE_STEPS.map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 bg-[var(--bg-surface-3)] text-[var(--text-muted)]">
                  ○
                </span>
                <span className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] flex-1">
                  Step {s.step}: {s.label}
                </span>
                <span className="text-xs font-['JetBrains_Mono'] text-[var(--text-muted)]">—</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Sub-Agents ── */}
        <div className="space-y-4">
          <h3 className="font-['Syne'] font-semibold text-sm text-[var(--text-primary)]">Sub-Agents</h3>

          {[
            { id: 'demo-conv',    name: 'Demo-to-Conversion',      active: true,  step: 'Idle — awaiting demos' },
            { id: 'teacher-prog', name: 'Teacher Progress Tracker', active: false, step: 'Idle' },
          ].map((sub) => (
            <div
              key={sub.id}
              className={`bg-[var(--bg-surface-1)] border rounded-xl p-5
                ${sub.active ? 'border-[var(--gold-400)]/30' : 'border-[var(--border-subtle)]'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${sub.active ? 'bg-[var(--gold-400)]' : 'bg-[var(--text-muted)]'}`} />
                <span className="font-['Syne'] font-medium text-sm text-[var(--text-primary)]">{sub.name}</span>
              </div>
              <div className="text-xs font-['DM_Sans'] text-[var(--text-muted)] mb-3">{sub.step}</div>
              <button
                onClick={() => router.push(`/manager/dept/${params.deptId}/agent/wajeeha/sub/${sub.id}`)}
                className="text-xs font-['Syne'] font-medium text-[var(--gold-400)] flex items-center gap-1 hover:underline"
              >
                Enter Sub-Agent <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
