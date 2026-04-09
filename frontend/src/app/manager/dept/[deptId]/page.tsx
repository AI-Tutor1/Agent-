'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { api, type DepartmentDetail } from '@/lib/api';

export default function DeptPage() {
  const router = useRouter();
  const params = useParams<{ deptId: string }>();
  const [detail, setDetail] = useState<DepartmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.getDepartment(params.deptId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [params.deptId]);

  if (loading) {
    return (
      <Shell>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-4 h-20" />
            ))}
          </div>
          <div className="h-4 bg-[var(--bg-surface-2)] rounded w-1/4 mt-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5 h-32" />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (!detail) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-[var(--text-muted)] text-4xl mb-4">◉</span>
          <h3 className="font-['Syne'] text-lg font-semibold text-[var(--text-primary)] mb-2">Department not found</h3>
          <p className="text-[var(--text-muted)] text-sm font-['DM_Sans']">This department does not exist in the database.</p>
          <button
            onClick={() => router.push('/manager')}
            className="mt-4 text-sm font-['Syne'] text-[var(--gold-400)] hover:underline"
          >
            Back to Overview
          </button>
        </div>
      </Shell>
    );
  }

  const dept = detail.department;
  const analyses = detail.recent_analyses;
  const isProduct = dept.name?.toLowerCase().includes('product') || dept.name?.toLowerCase().includes('counsel');

  return (
    <Shell breadcrumbs={[
      { label: '◆ Tuitional', path: '/manager' },
      { label: `◉ ${dept.name}` },
    ]}>
      <button onClick={() => router.push('/manager')} className="flex items-center gap-1.5 text-sm font-['DM_Sans'] text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6">
        <ArrowLeft size={16} /> Back to Overview
      </button>

      {/* Dept KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Agents', value: dept.total_agents },
          { label: 'Active', value: dept.active_agents },
          { label: 'Recent Analyses', value: analyses.length },
          { label: 'Head', value: dept.head_name },
        ].map((k) => (
          <div key={k.label} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-4">
            <div className="font-['JetBrains_Mono'] text-2xl font-bold text-[var(--text-primary)] truncate">{k.value}</div>
            <div className="text-xs font-['DM_Sans'] text-[var(--text-muted)] mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Analyses */}
      {analyses.length > 0 && (
        <div className="mb-8">
          <h2 className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)] mb-4">Recent Analyses</h2>
          <div className="space-y-2">
            {analyses.map((a, i) => (
              <motion.div
                key={a.analysis_id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-['JetBrains_Mono'] text-[var(--text-muted)] flex-shrink-0">{a.demo_date}</span>
                  <span className="text-sm font-['DM_Sans'] text-[var(--text-primary)] truncate">
                    {a.teacher_name} <ChevronRight size={12} className="inline text-[var(--text-muted)]" /> {a.student_name}
                  </span>
                  <span className="text-xs font-['DM_Sans'] text-[var(--text-muted)] flex-shrink-0">{a.subject}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-['JetBrains_Mono'] text-[var(--gold-400)]">
                    {parseFloat(String(a.agent_confidence)).toFixed(1)}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full border font-['DM_Sans']"
                    style={{
                      color: a.analysis_status === 'approved' ? 'var(--status-approved)' : a.analysis_status === 'escalated' ? 'var(--status-escalated)' : 'var(--status-pending)',
                      borderColor: a.analysis_status === 'approved' ? 'var(--status-approved)' : a.analysis_status === 'escalated' ? 'var(--status-escalated)' : 'var(--status-pending)',
                    }}
                  >
                    {a.analysis_status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

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
            <span className="font-['Syne'] font-semibold text-[var(--text-primary)]">{dept.head_name}</span>
          </div>
          <div className="text-xs font-['DM_Sans'] text-[var(--text-secondary)]">Head Agent · Manager Level</div>
        </motion.div>

        {/* Head agent (AI) if applicable */}
        {dept.head_agent_name && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => isProduct ? router.push(`/manager/dept/${params.deptId}/agent/wajeeha`) : undefined}
            className={`bg-[var(--bg-surface-1)] border rounded-xl p-5
              ${isProduct ? 'border-[var(--gold-400)]/30 cursor-pointer hover:border-[var(--gold-400)]/60' : 'border-[var(--border-subtle)]'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${isProduct ? 'bg-[var(--status-active)] pulse-dot' : 'bg-[var(--text-muted)]'}`} />
              <span className="font-['Syne'] font-semibold text-[var(--text-primary)]">{dept.head_agent_name}</span>
            </div>
            <div className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] mb-3">
              {isProduct ? 'Demo-to-Conversion Analyst' : 'Department Agent'}
            </div>
            {isProduct && (
              <div className="flex justify-end">
                <span className="text-xs font-['Syne'] font-medium text-[var(--gold-400)] flex items-center gap-1">
                  Enter <ChevronRight size={14} />
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Shell>
  );
}
