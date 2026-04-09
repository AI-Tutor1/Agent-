'use client';

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { Shell } from '@/components/layout/Shell'

const pipelineSteps = [
  { step: 1, label: 'Retrieve demo record', time: '0:22', status: 'done' },
  { step: 2, label: 'Initial logging', time: '0:08', status: 'done' },
  { step: 3, label: 'POUR identification', time: '0:45', status: 'done' },
  { step: 4, label: 'Qualitative review (Claude)', time: '2:14', status: 'active' },
  { step: 5, label: 'Fetch student feedback', time: '—', status: 'pending' },
  { step: 6, label: 'Rating standardisation', time: '—', status: 'pending' },
  { step: 7, label: 'Export to sales sheet', time: '—', status: 'pending' },
  { step: 8, label: 'Pull sales data', time: '—', status: 'pending' },
  { step: 9, label: 'Compile Sheet30', time: '—', status: 'pending' },
  { step: 10, label: 'Accountability classification', time: '—', status: 'pending' },
  { step: 11, label: 'Update teacher progress', time: '—', status: 'pending' },
]

const soulPrinciples = [
  'Every demo processed within 24 hours',
  'No output without evidence',
  'Human approval required for all final decisions',
  'Graceful degradation — never hard-stop after Step 1',
  'Shadow mode respected throughout',
  'Transparency in all classifications',
  'Teacher privacy protected',
]

interface SoulData {
  content: string;
  agent_name: string;
  file_type: string;
}

export default function AgentPage() {
  const router = useRouter()
  const params = useParams<{ deptId: string; agentId: string }>()
  const [showAllPrinciples, setShowAllPrinciples] = useState(false)
  const [soulContent, setSoulContent] = useState<string | null>(null)
  const [soulLoading, setSoulLoading] = useState(true)
  const [soulNotFound, setSoulNotFound] = useState(false)

  useEffect(() => {
    const agentId = params?.agentId
    if (!agentId) return

    fetch(`/api/agent/files/${agentId}/SOUL`)
      .then(async (res) => {
        if (res.status === 404) {
          setSoulNotFound(true)
          return
        }
        const data = await res.json() as SoulData
        setSoulContent(data.content)
      })
      .catch(() => setSoulNotFound(true))
      .finally(() => setSoulLoading(false))
  }, [params?.agentId])

  return (
    <Shell breadcrumbs={[
      { label: '◆ Tuitional', path: '/manager' },
      { label: '◉ Product', path: `/manager/dept/${params.deptId}` },
      { label: '● Wajeeha' },
    ]}>
      <button onClick={() => router.push(`/manager/dept/${params.deptId}`)} className="flex items-center gap-1.5 text-sm font-['DM_Sans'] text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6">
        <ArrowLeft size={16} /> Back to Department
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
        {/* Left: Identity Panel */}
        <div className="space-y-4">
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-active)] pulse-dot" />
              <span className="font-['Syne'] font-bold text-lg text-[var(--text-primary)]">WAJEEHA</span>
            </div>
            <div className="text-sm font-['DM_Sans'] text-[var(--text-secondary)]">Demo-to-Conversion Analyst</div>
            <div className="text-xs font-['DM_Sans'] text-[var(--text-muted)]">Product / Counseling</div>

            <div className="mt-4 space-y-2 text-xs font-['DM_Sans']">
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">STATUS</span><span className="text-[var(--status-active)]">Processing</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">SHADOW MODE</span><span className="text-[var(--status-shadow)]">Active</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">UPTIME</span><span className="text-[var(--text-secondary)] font-['JetBrains_Mono']">6h 14m</span></div>
            </div>
          </div>

          {/* Soul Principles */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h4 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Soul Principles</h4>
            <ol className="space-y-1.5 text-xs font-['DM_Sans'] text-[var(--text-secondary)] list-decimal list-inside">
              {(showAllPrinciples ? soulPrinciples : soulPrinciples.slice(0, 3)).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
            <button onClick={() => setShowAllPrinciples(!showAllPrinciples)} className="text-[11px] font-['DM_Sans'] text-[var(--gold-400)] mt-2 flex items-center gap-1">
              {showAllPrinciples ? 'Show less' : `+ ${soulPrinciples.length - 3} more`} <ChevronDown size={12} />
            </button>
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
              <p className="text-xs font-['DM_Sans'] text-[var(--text-muted)] italic">File not found</p>
            ) : (
              <pre className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {soulContent}
              </pre>
            )}
          </div>

          {/* Performance */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h4 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Performance</h4>
            <div className="space-y-2 text-xs font-['DM_Sans']">
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Avg confidence</span><span className="text-[var(--text-primary)] font-['JetBrains_Mono']">8.4/10</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">First-pass approval</span><span className="text-[var(--text-primary)] font-['JetBrains_Mono']">78%</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Avg processing</span><span className="text-[var(--text-primary)] font-['JetBrains_Mono']">18 min</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Today</span><span className="text-[var(--text-primary)] font-['JetBrains_Mono']">3 processed</span></div>
            </div>
          </div>
        </div>

        {/* Center: Pipeline */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
          <h3 className="font-['Syne'] font-semibold text-sm text-[var(--text-primary)] mb-4">Current Activity — Pipeline</h3>
          <div className="space-y-3">
            {pipelineSteps.map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0
                  ${s.status === 'done' ? 'bg-[var(--status-active)]/20 text-[var(--status-active)]' :
                    s.status === 'active' ? 'bg-[var(--gold-400)]/20 text-[var(--gold-400)] pulse-dot' :
                    'bg-[var(--bg-surface-3)] text-[var(--text-muted)]'}`}>
                  {s.status === 'done' ? '✓' : s.status === 'active' ? '●' : '○'}
                </span>
                <span className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] flex-1">
                  Step {s.step}: {s.label}
                </span>
                <span className="text-xs font-['JetBrains_Mono'] text-[var(--text-muted)]">{s.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sub-Agents */}
        <div className="space-y-4">
          <h3 className="font-['Syne'] font-semibold text-sm text-[var(--text-primary)]">Sub-Agents</h3>

          {[
            { id: 'demo-conv', name: 'Demo-to-Conversion', active: true, step: 'Step 4 — Claude analysis' },
            { id: 'teacher-prog', name: 'Teacher Progress Tracker', active: false, step: 'Idle' },
          ].map((sub) => (
            <div key={sub.id} className={`bg-[var(--bg-surface-1)] border rounded-xl p-5
              ${sub.active ? 'border-[var(--gold-400)]/30' : 'border-[var(--border-subtle)]'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${sub.active ? 'bg-[var(--status-active)] pulse-dot' : 'bg-[var(--text-muted)]'}`} />
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
  )
}
