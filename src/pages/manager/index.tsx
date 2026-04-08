import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import OverviewPage from './OverviewPage'
import ReviewPage from './ReviewPage'
import DeptPage from './DeptPage'
import AgentPage from './AgentPage'
import SubAgentPage from './SubAgentPage'
import TaskDetailPage from './TaskDetailPage'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="font-['Syne'] font-bold text-xl text-[var(--text-primary)]">{title}</h2>
      <p className="text-sm font-['DM_Sans'] text-[var(--text-muted)] mt-2">Coming in Phase 2</p>
    </div>
  )
}

export default function ManagerPage() {
  const navigate = useNavigate()
  const { user, viewMode } = useAuthStore()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role === 'counselor') { navigate('/counselor'); return }
    if (user.role === 'sales') { navigate('/sales'); return }
    if (user.role === 'dual' && viewMode === 'counselor') { navigate('/counselor'); return }
  }, [user, viewMode, navigate])

  if (!user) return null

  return (
    <Routes>
      <Route path="" element={<OverviewPage />} />
      <Route path="review" element={<ReviewPage />} />
      <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
      <Route path="teachers" element={<PlaceholderPage title="Teachers" />} />
      <Route path="escalations" element={<PlaceholderPage title="Escalations" />} />
      <Route path="agent-log" element={<PlaceholderPage title="Agent Log" />} />
      <Route path="intake-log" element={<PlaceholderPage title="Intake Log" />} />
      <Route path="sales-log" element={<PlaceholderPage title="Sales Outcomes" />} />
      <Route path="settings" element={<PlaceholderPage title="Settings — Coming in Phase 2" />} />
      <Route path="dept/:deptId" element={<DeptPage />} />
      <Route path="dept/:deptId/agent/:agentId" element={<AgentPage />} />
      <Route path="dept/:deptId/agent/:agentId/sub/:subId" element={<SubAgentPage />} />
      <Route path="dept/:deptId/agent/:agentId/sub/:subId/task/:taskId" element={<TaskDetailPage />} />
    </Routes>
  )
}
