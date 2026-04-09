'use client';

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Circle, XCircle } from 'lucide-react'
import { Shell } from '@/components/layout/Shell'
import { DemoAnalysisCard } from '@/components/DemoAnalysisCard'
import { api } from '@/lib/api'

interface DemoAnalysis {
  id: string
  demoId: string
  status: 'pending_review' | 'approved' | 'rejected' | 'redo' | 'escalated'
  teacher: string
  student: string
  level: string
  subject: string
  date: string
  salesAgent: string
  confidence: number
  studentRating: number
  analystRating: number
  conversionStatus: 'Converted' | 'Not Converted' | 'Pending'
  methodology: string
  topicSelection: string
  resourceUsage: string
  interactivity: string
  effectiveness: string
  improvements: string
  pourFlags: { category: string; severity: 'High' | 'Medium' | 'Low'; description: string }[]
  accountability: { classification: string; evidence: string; confidence: string } | null
  processingTime: string
  tokensUsed: number
  feedbackText: string
}

const pipelineTrace = [
  { step: 1, time: '12:04:11', label: 'Demo retrieved', status: 'done', duration: '0:22' },
  { step: 2, time: '12:04:33', label: 'Analysis record created', status: 'done', duration: '0:08' },
  { step: 3, time: '12:04:41', label: '2 POUR flags identified', status: 'done', duration: '0:45' },
  { step: 4, time: '12:06:47', label: 'Claude API called — 1,847 in / 612 out', status: 'done', duration: '2:14' },
  { step: 5, time: '12:09:01', label: 'Feedback matched (fuzzy ±2 days)', status: 'done', duration: '0:31' },
  { step: 6, time: '12:09:05', label: 'Rating converted: 5/10 → 3/5', status: 'done', duration: '0:04' },
  { step: 7, time: '12:09:16', label: 'Sales sheet exported', status: 'done', duration: '0:11' },
  { step: 8, time: '—', label: 'Awaiting sales input', status: 'waiting', duration: '—' },
  { step: 9, time: '—', label: 'Compile Sheet30', status: 'pending', duration: '—' },
  { step: 10, time: '—', label: 'Accountability classification', status: 'pending', duration: '—' },
  { step: 11, time: '—', label: 'Update teacher progress', status: 'pending', duration: '—' },
]

const dataSources = [
  { name: 'Conducted Demo Sessions', ok: true },
  { name: 'Demo Feedback Form (matched)', ok: true },
  { name: 'Demo Conversion Sales', ok: true },
  { name: 'Teacher Profiles (ID missing → flagged)', ok: false },
]

const activityLog = [
  '12:04:11  Pipeline started',
  '12:04:33  POUR:Video flagged',
  '12:06:47  Claude API called',
  '12:09:01  Feedback matched (fuzzy ±2 days)',
  '12:09:29  Sheet30 updated',
  '12:09:41  Status → pending_review',
]

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams<{ deptId: string; agentId: string; subId: string; taskId: string }>()
  const [analysis, setAnalysis] = useState<DemoAnalysis | null>(null)

  useEffect(() => {
    api.analyses.getAll().then((analyses: DemoAnalysis[]) => {
      const found = analyses.find((a) => a.id === params.taskId) || analyses[0]
      setAnalysis(found)
    })
  }, [params.taskId])

  if (!analysis) return <Shell><p className="text-[var(--text-muted)]">Loading...</p></Shell>

  return (
    <Shell breadcrumbs={[
      { label: '◆ Tuitional', path: '/manager' },
      { label: '◉ Product', path: `/manager/dept/${params.deptId}` },
      { label: '● Wajeeha', path: `/manager/dept/${params.deptId}/agent/wajeeha` },
      { label: '· Demo-to-Conversion', path: `/manager/dept/${params.deptId}/agent/wajeeha/sub/demo-conv` },
      { label: `Task ${analysis.demoId}` },
    ]}>
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-['DM_Sans'] text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex gap-6 flex-col xl:flex-row">
        {/* Left: Full Analysis */}
        <div className="flex-1 min-w-0">
          <DemoAnalysisCard analysis={analysis} expanded />
        </div>

        {/* Right: Reasoning Panel */}
        <div className="w-full xl:w-[360px] flex-shrink-0 space-y-4">
          {/* Pipeline Trace */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Pipeline Trace</h3>
            <div className="space-y-2">
              {pipelineTrace.map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  {s.status === 'done' ? <CheckCircle2 size={14} className="text-[var(--status-active)] flex-shrink-0" /> :
                   s.status === 'waiting' ? <Circle size={14} className="text-[var(--gold-400)] flex-shrink-0" /> :
                   <Circle size={14} className="text-[var(--text-muted)] flex-shrink-0" />}
                  <span className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] flex-1">Step {s.step} — {s.label}</span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">{s.duration}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Data Sources</h3>
            <div className="space-y-2">
              {dataSources.map((ds) => (
                <div key={ds.name} className="flex items-center gap-2 text-xs font-['DM_Sans']">
                  {ds.ok ? <CheckCircle2 size={12} className="text-[var(--status-active)]" /> : <XCircle size={12} className="text-[var(--status-error)]" />}
                  <span className="text-[var(--text-secondary)]">{ds.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Breakdown */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Confidence Breakdown</h3>
            <div className="space-y-2 text-xs font-['DM_Sans']">
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Overall</span><span className="text-[var(--gold-400)] font-['JetBrains_Mono']">8.4/10</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Methodology</span><span className="text-[var(--status-active)]">High</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">POUR analysis</span><span className="text-[var(--status-active)]">High</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Accountability</span><span className="text-[var(--status-pending)]">Medium</span></div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Activity Log</h3>
            <div className="space-y-1.5">
              {activityLog.map((entry, i) => (
                <div key={i} className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-muted)]">{entry}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
