import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shell } from '@/components/layout/Shell'
import { DEPARTMENTS } from '@/data/mock'
import { BarChart, Bar, ResponsiveContainer } from 'recharts'

/* ─── KPIs matching reference ─── */
const kpis = [
  { label: 'Total Agents Active', value: '13', sub: '/23', accent: false },
  { label: 'Tasks Today', value: '138', sub: '', accent: false },
  { label: 'Pending Reviews', value: '28', sub: '', accent: true },
  { label: 'Escalations', value: '4', sub: '', accent: false },
  { label: 'Confidence Avg', value: '8.5', sub: '/10', accent: false },
]

/* ─── Sparkline data per department ─── */
const sparkData: Record<string, number[]> = {
  cto:        [3, 5, 4, 7, 6, 8, 5, 4, 6, 7],
  sales:      [8, 6, 9, 7, 10, 8, 11, 9, 7, 10],
  product:    [2, 4, 3, 5, 6, 4, 7, 5, 6, 8],
  excellence: [5, 7, 6, 8, 9, 7, 10, 8, 6, 9],
  finance:    [1, 2, 3, 2, 4, 3, 2, 3, 4, 3],
  marketing:  [4, 6, 5, 7, 8, 6, 5, 7, 8, 6],
  hr:         [1, 1, 2, 1, 2, 3, 2, 1, 2, 1],
  bizdev:     [3, 4, 5, 3, 6, 4, 5, 7, 4, 6],
}

/* ─── Department activity blurbs ─── */
const deptActivity: Record<string, string> = {
  cto:        'Platform monitoring · 2 agents active',
  sales:      'Processing 10 demos · 3 pending follow-ups',
  product:    'Wajeeha analyzing demo #20260407 · Step 4',
  excellence: 'Student progress reports · 3 agents active',
  finance:    'Monthly reconciliation in progress',
  marketing:  'Campaign analytics · 2 agents reporting',
  hr:         'No active tasks',
  bizdev:     'Partnership pipeline · 1 agent active',
}

/* ─── Live activity feed ─── */
const liveActivity = [
  { time: '12:09', agent: 'Wajeeha', action: 'Exported sales sheet for demo #20260407', dept: 'Product' },
  { time: '12:06', agent: 'Wajeeha', action: 'Claude API analysis complete — 1,847 tokens', dept: 'Product' },
  { time: '12:04', agent: 'Wajeeha', action: 'Pipeline started for Inayat → Olimpos', dept: 'Product' },
  { time: '11:58', agent: 'Maryam', action: 'Conversion logged — Abdul Hadi (Converted)', dept: 'Sales' },
  { time: '11:45', agent: 'Faizan S.', action: 'Progress report generated for 12 students', dept: 'Excellence' },
  { time: '11:32', agent: 'Mudasir', action: 'Deployment health check — all systems OK', dept: 'CTO' },
  { time: '11:20', agent: 'Shiza', action: 'Weekly campaign report compiled', dept: 'Marketing' },
  { time: '11:15', agent: 'Sara', action: 'New partnership lead added to pipeline', dept: 'BizDev' },
  { time: '11:02', agent: 'Hoor', action: 'Demo feedback collected — Sophia / Nicole', dept: 'Sales' },
  { time: '10:48', agent: 'Waleed', action: 'Attendance anomaly flagged — 3 students', dept: 'Excellence' },
  { time: '10:30', agent: 'Ayza', action: 'Invoice batch #042 prepared for review', dept: 'Finance' },
  { time: '10:15', agent: 'Ahtisham', action: 'Social media scheduler updated — 8 posts queued', dept: 'Marketing' },
]

const deptColor: Record<string, string> = {
  Product: 'var(--gold-400)',
  Sales: 'var(--acc-sales)',
  Excellence: 'var(--status-active)',
  CTO: 'var(--status-escalated)',
  Marketing: 'var(--status-pending)',
  Finance: 'var(--pour-low)',
  BizDev: 'var(--text-secondary)',
  HR: 'var(--text-muted)',
}

export default function OverviewPage() {
  const navigate = useNavigate()

  return (
    <Shell breadcrumbs={[{ label: '◆ Tuitional' }]}>
      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <div className="flex items-baseline gap-1">
              <span className="font-['Syne'] font-bold text-3xl text-[var(--text-primary)]">{kpi.value}</span>
              {kpi.sub && <span className="text-sm font-['JetBrains_Mono'] text-[var(--text-muted)]">{kpi.sub}</span>}
            </div>
            <div className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] mt-1.5">{kpi.label}</div>
            {kpi.accent && (
              <span className="inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded font-['DM_Sans'] font-medium text-[var(--status-pending)] bg-[var(--status-pending)]/15">
                PRIORITY
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-6 flex-col xl:flex-row">
        {/* Department Grid */}
        <div className="flex-1 min-w-0">
          <h2 className="font-['Syne'] font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-4">Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEPARTMENTS.map((dept, i) => {
              const isProduct = dept.id === 'product'
              const spark = (sparkData[dept.id] || [3,4,5,3,4]).map((v, j) => ({ v, i: j }))

              return (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/manager/dept/${dept.id}`)}
                  className={`relative bg-[var(--bg-surface-1)] border rounded-xl p-5 cursor-pointer transition-all duration-150
                    ${isProduct ? 'border-[var(--gold-400)]/40' : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'}`}
                >
                  {/* Active animated border for product */}
                  {isProduct && (
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 rounded-xl"
                        style={{
                          background: `conic-gradient(from var(--angle, 0deg), transparent 0%, var(--gold-400) 10%, transparent 20%)`,
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'exclude',
                          padding: 1,
                          animation: 'spin-border 3s linear infinite',
                        }} />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dept.activeAgents > 0 ? 'bg-[var(--status-active)]' : 'bg-[var(--text-muted)]'}`} />
                      <span className="font-['Syne'] font-semibold text-sm text-[var(--text-primary)]">{dept.name}</span>
                    </div>
                    {isProduct && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-['DM_Sans'] font-bold tracking-wider text-[var(--status-shadow)] bg-[var(--status-shadow)]/15 border border-[var(--status-shadow)]/30 uppercase">
                        Shadow
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-['DM_Sans'] text-[var(--text-muted)] mb-3">Led by {dept.head}</div>

                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs font-['JetBrains_Mono'] text-[var(--text-secondary)]">{dept.activeAgents}<span className="text-[var(--text-muted)]">/{dept.totalAgents}</span> active</span>
                  </div>

                  {/* Sparkline bar chart */}
                  <div className="h-8 mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spark} barCategoryGap={2}>
                        <Bar dataKey="v" fill={isProduct ? 'var(--gold-400)' : 'var(--text-muted)'} radius={[2,2,0,0]} opacity={isProduct ? 0.7 : 0.35} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="text-[11px] font-['DM_Sans'] text-[var(--text-muted)]">{deptActivity[dept.id]}</div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="w-full xl:w-[340px] flex-shrink-0">
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5 sticky top-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--status-active)] pulse-dot" />
              <h3 className="font-['Syne'] font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wider">Live Activity</h3>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {liveActivity.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-3"
                >
                  <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-muted)] w-10 flex-shrink-0 pt-0.5">{item.time}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-['DM_Sans'] font-medium text-[var(--text-primary)]">{item.agent}</span>
                      <span className="text-[9px] px-1 py-0 rounded font-['DM_Sans']"
                        style={{ color: deptColor[item.dept] || 'var(--text-muted)', backgroundColor: `color-mix(in srgb, ${deptColor[item.dept] || 'var(--text-muted)'} 12%, transparent)` }}>
                        {item.dept}
                      </span>
                    </div>
                    <div className="text-[11px] font-['DM_Sans'] text-[var(--text-muted)] leading-relaxed">{item.action}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes spin-border { to { --angle: 360deg; } }
      `}</style>
    </Shell>
  )
}
