'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Inbox } from 'lucide-react'
import { Shell } from '@/components/layout/Shell'
import { DemoAnalysisCard } from '@/components/DemoAnalysisCard'
import { api } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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

const conversionData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`, rate: 55 + Math.random() * 25,
}))

const accData = [
  { name: 'Sales', value: 35, color: 'var(--acc-sales)' },
  { name: 'Product', value: 25, color: 'var(--acc-product)' },
  { name: 'Consumer', value: 30, color: 'var(--acc-consumer)' },
  { name: 'Mixed', value: 10, color: 'var(--acc-mixed)' },
]

const pourData = [
  { category: 'Resources', count: 12, color: '#60A5FA' },
  { category: 'Interaction', count: 9, color: '#FBBF24' },
  { category: 'Technical', count: 7, color: '#F87171' },
  { category: 'Video', count: 6, color: '#C084FC' },
  { category: 'Time', count: 4, color: '#34D399' },
  { category: 'Cancellation', count: 3, color: '#FB923C' },
  { category: 'No Show', count: 2, color: '#94A3B8' },
]

type FilterTab = 'all' | 'high' | 'low' | 'escalated'

export default function ReviewPage() {
  const router = useRouter()
  const [analyses, setAnalyses] = useState<DemoAnalysis[]>([])
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.analyses.getAll().then((data: DemoAnalysis[]) => setAnalyses(data))
  }, [])

  const filtered = analyses.filter((a) => {
    if (filter === 'high' && a.confidence < 8) return false
    if (filter === 'low' && a.confidence >= 6) return false
    if (filter === 'escalated' && a.status !== 'escalated') return false
    if (search) {
      const q = search.toLowerCase()
      return a.teacher.toLowerCase().includes(q) || a.student.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q)
    }
    return true
  })

  const handleApprove = (id: string) => {
    setAnalyses((prev) => prev.filter((a) => a.id !== id))
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'High ≥8' },
    { key: 'low', label: 'Low <6' },
    { key: 'escalated', label: 'Escalated' },
  ]

  return (
    <Shell breadcrumbs={[
      { label: '◆ Tuitional', path: '/manager' },
      { label: 'Review Queue' },
    ]}>
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Processed Today', value: '3' },
          { label: 'Awaiting Counselor', value: '1' },
          { label: 'Awaiting Sales', value: '2', highlight: true },
          { label: 'Pending Review', value: String(analyses.length) },
          { label: 'Escalations', value: '0' },
        ].map((k) => (
          <div key={k.label} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-3">
            <div className={`font-['JetBrains_Mono'] text-xl font-bold ${k.highlight ? 'text-[var(--status-pending)]' : 'text-[var(--text-primary)]'}`}>{k.value}</div>
            <div className="text-[11px] font-['DM_Sans'] text-[var(--text-muted)]">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 flex-col xl:flex-row">
        {/* Left: Queue */}
        <div className="flex-1 min-w-0">
          {/* Filter Bar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex gap-1 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`px-3 py-1.5 text-xs font-['DM_Sans'] rounded-md transition-colors
                    ${filter === t.key ? 'bg-[var(--gold-400)] text-[#080810] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >{t.label}</button>
              ))}
            </div>
            <input
              type="text" placeholder="Search..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--gold-400)] max-w-[200px]"
            />
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Inbox size={40} className="mx-auto text-[var(--text-muted)] mb-3" />
              <p className="font-['Syne'] font-medium text-[var(--text-primary)]">Queue clear</p>
              <p className="text-sm font-['DM_Sans'] text-[var(--text-muted)]">All analyses reviewed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((a, i) => (
                <DemoAnalysisCard
                  key={a.id}
                  analysis={a}
                  index={i}
                  onApprove={handleApprove}
                  onReject={(id) => setAnalyses((prev) => prev.filter((x) => x.id !== id))}
                  onRedo={(id) => console.log('redo', id)}
                  onExpand={(id) => router.push(`/manager/dept/product/agent/wajeeha/sub/demo-conv/task/${id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Analytics Sidebar */}
        <div className="w-full xl:w-[340px] flex-shrink-0 space-y-6">
          {/* Conversion Trend */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-4">
            <h3 className="text-xs font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Conversion Trend (30d)</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#52526A' }} axisLine={false} domain={[40, 90]} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" stroke="#D4A849" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Accountability Donut */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-4">
            <h3 className="text-xs font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Accountability Split</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={accData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                    {accData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {accData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[11px] font-['DM_Sans'] text-[var(--text-secondary)]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />{d.name} {d.value}%
                </div>
              ))}
            </div>
          </div>

          {/* POUR Frequency */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-4">
            <h3 className="text-xs font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">POUR Frequency</h3>
            <div className="space-y-2">
              {pourData.map((p) => (
                <div key={p.category} className="flex items-center gap-2">
                  <span className="text-[11px] font-['DM_Sans'] text-[var(--text-secondary)] w-20 text-right">{p.category}</span>
                  <div className="flex-1 h-4 bg-[var(--bg-surface-2)] rounded overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${(p.count / 12) * 100}%`, backgroundColor: p.color }} />
                  </div>
                  <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-muted)] w-6">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
