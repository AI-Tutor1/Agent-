import { useParams } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'
import ReviewPage from './ReviewPage'

export default function SubAgentPage() {
  const { deptId, subId } = useParams()

  if (subId === 'demo-conv') {
    // Reuse ReviewPage content but with different breadcrumbs
    return <ReviewPage />
  }

  return (
    <Shell breadcrumbs={[
      { label: '◆ Tuitional', path: '/manager' },
      { label: '◉ Product', path: `/manager/dept/${deptId}` },
      { label: '● Wajeeha', path: `/manager/dept/${deptId}/agent/wajeeha` },
      { label: '· Teacher Progress Tracker' },
    ]}>
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="font-['Syne'] font-bold text-xl text-[var(--text-primary)]">Teacher Progress Tracker</h2>
        <p className="text-sm font-['DM_Sans'] text-[var(--text-muted)] mt-2">Sub-agent idle — no current tasks</p>
      </div>
    </Shell>
  )
}
