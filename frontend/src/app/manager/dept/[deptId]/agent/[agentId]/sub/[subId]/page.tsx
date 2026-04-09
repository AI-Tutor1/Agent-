'use client';

import { useParams } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import ReviewPage from '@/app/manager/review/page'

export default function SubAgentPage() {
  const params = useParams<{ deptId: string; agentId: string; subId: string }>()

  if (params.subId === 'demo-conv') {
    return <ReviewPage />
  }

  return (
    <Shell breadcrumbs={[
      { label: '◆ Tuitional', path: '/manager' },
      { label: '◉ Product', path: `/manager/dept/${params.deptId}` },
      { label: '● Wajeeha', path: `/manager/dept/${params.deptId}/agent/wajeeha` },
      { label: '· Teacher Progress Tracker' },
    ]}>
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="font-['Syne'] font-bold text-xl text-[var(--text-primary)]">Teacher Progress Tracker</h2>
        <p className="text-sm font-['DM_Sans'] text-[var(--text-muted)] mt-2">Sub-agent idle — no current tasks</p>
      </div>
    </Shell>
  )
}
