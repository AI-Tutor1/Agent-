import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Shell } from '@/components/layout/Shell'
import { DEPARTMENTS } from '@/data/mock'

export default function DeptPage() {
  const { deptId } = useParams()
  const navigate = useNavigate()
  const dept = DEPARTMENTS.find((d) => d.id === deptId)

  if (!dept) return <Shell><p className="text-[var(--text-muted)]">Department not found</p></Shell>

  const isProduct = dept.id === 'product'

  return (
    <Shell breadcrumbs={[
      { label: '◆ Tuitional', path: '/manager' },
      { label: `◉ ${dept.name}` },
    ]}>
      <button onClick={() => navigate('/manager')} className="flex items-center gap-1.5 text-sm font-['DM_Sans'] text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6">
        <ArrowLeft size={16} /> Back to Overview
      </button>

      {/* Dept KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Agents', value: dept.totalAgents },
          { label: 'Active', value: dept.activeAgents },
          { label: 'Tasks Today', value: isProduct ? 7 : Math.floor(Math.random() * 10) },
          { label: 'Escalations', value: 0 },
        ].map((k) => (
          <div key={k.label} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-4">
            <div className="font-['JetBrains_Mono'] text-2xl font-bold text-[var(--text-primary)]">{k.value}</div>
            <div className="text-xs font-['DM_Sans'] text-[var(--text-muted)] mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Agent Cards */}
      <h2 className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)] mb-4">Agents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Head */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
            <span className="font-['Syne'] font-semibold text-[var(--text-primary)]">{dept.head}</span>
          </div>
          <div className="text-xs font-['DM_Sans'] text-[var(--text-secondary)]">Head Agent · Manager Level</div>
        </motion.div>

        {/* Sub-agents */}
        {dept.agents.map((agent, i) => {
          const isWajeeha = agent === 'Wajeeha Gul'
          return (
            <motion.div
              key={agent}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 1) * 0.1 }}
              onClick={() => isWajeeha ? navigate(`/manager/dept/${deptId}/agent/wajeeha`) : null}
              className={`bg-[var(--bg-surface-1)] border rounded-xl p-5
                ${isWajeeha ? 'border-[var(--gold-400)]/30 cursor-pointer hover:border-[var(--gold-400)]/60' : 'border-[var(--border-subtle)]'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${isWajeeha ? 'bg-[var(--status-active)] pulse-dot' : 'bg-[var(--text-muted)]'}`} />
                <span className="font-['Syne'] font-semibold text-[var(--text-primary)]">{agent}</span>
              </div>
              <div className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] mb-3">
                {isWajeeha ? 'Demo-to-Conversion Analyst' : 'Agent'}
              </div>

              {isWajeeha && (
                <>
                  <div className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] mb-2">
                    Current: "Inayat → Olimpos · IGCSE Maths"
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-['DM_Sans'] text-[var(--text-muted)]">Step 4 of 11</span>
                    <div className="flex-1 h-1.5 bg-[var(--bg-surface-3)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--gold-400)] rounded-full" style={{ width: '36%' }} />
                    </div>
                    <span className="text-xs font-['JetBrains_Mono'] text-[var(--text-muted)]">36%</span>
                  </div>
                  <div className="text-xs font-['JetBrains_Mono'] text-[var(--text-muted)] mb-3">Elapsed: 12m 44s</div>
                  <div className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] mb-3">Today: 3 processed · 1 pending · 0 escalated</div>
                  <div className="flex justify-end">
                    <span className="text-xs font-['Syne'] font-medium text-[var(--gold-400)] flex items-center gap-1">
                      Enter <ChevronRight size={14} />
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          )
        })}
      </div>
    </Shell>
  )
}
