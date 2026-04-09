'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { DemoAnalysisCard } from '@/components/DemoAnalysisCard';
import { api, type ReviewItem, type ReviewQueueData } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

type FilterTab = 'all' | 'high' | 'low' | 'escalated';

const ACC_COLORS: Record<string, string> = {
  Sales: 'var(--acc-sales)',
  Product: 'var(--acc-product)',
  Consumer: 'var(--acc-consumer)',
  Mixed: 'var(--acc-mixed)',
};

export default function ReviewPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [queueData, setQueueData] = useState<ReviewQueueData | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(() => {
    setLoading(true);
    api.dashboard.getReviewQueue(filter, search)
      .then(setQueueData)
      .catch(() => setQueueData(null))
      .finally(() => setLoading(false));
  }, [filter, search]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const analyses: ReviewItem[] = queueData?.analyses ?? [];

  const handleApprove = async (id: string) => {
    const reviewerName = user?.name ?? 'Manager';
    await api.dashboard.approve(id, reviewerName).catch(console.error);
    setQueueData((prev) =>
      prev ? { ...prev, analyses: prev.analyses.filter((a) => a.analysis_id !== id) } : prev
    );
  };

  const handleReject = async (id: string, reason?: string) => {
    const reviewerName = user?.name ?? 'Manager';
    await api.dashboard.reject(id, reviewerName, reason ?? 'Rejected').catch(console.error);
    setQueueData((prev) =>
      prev ? { ...prev, analyses: prev.analyses.filter((a) => a.analysis_id !== id) } : prev
    );
  };

  const handleRedo = async (id: string, instructions?: string) => {
    const reviewerName = user?.name ?? 'Manager';
    await api.dashboard.redo(id, reviewerName, instructions ?? 'Please redo this analysis').catch(console.error);
    setQueueData((prev) =>
      prev ? { ...prev, analyses: prev.analyses.filter((a) => a.analysis_id !== id) } : prev
    );
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'High ≥8' },
    { key: 'low', label: 'Low <6' },
    { key: 'escalated', label: 'Escalated' },
  ];

  const counts = queueData?.counts;

  return (
    <Shell breadcrumbs={[
      { label: '◆ Tuitional', path: '/manager' },
      { label: 'Review Queue' },
    ]}>
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pending Review', value: loading ? '—' : String(counts?.total ?? 0) },
          { label: 'High Confidence', value: loading ? '—' : String(counts?.high_confidence ?? 0) },
          { label: 'Low Confidence', value: loading ? '—' : String(counts?.low_confidence ?? 0), highlight: (counts?.low_confidence ?? 0) > 0 },
          { label: 'Escalations', value: loading ? '—' : String(counts?.escalated ?? 0) },
        ].map((k) => (
          <div key={k.label} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-3">
            <div className={`font-['JetBrains_Mono'] text-xl font-bold ${k.highlight ? 'text-[var(--status-pending)]' : 'text-[var(--text-primary)]'}`}>
              {k.value}
            </div>
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
              type="text"
              placeholder="Search teacher, student, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--gold-400)] max-w-[240px]"
            />
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-[var(--bg-surface-2)] rounded w-3/4 mb-3" />
                  <div className="h-3 bg-[var(--bg-surface-2)] rounded w-1/2 mb-2" />
                  <div className="h-3 bg-[var(--bg-surface-2)] rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="w-12 h-12 text-[var(--text-muted)] mb-4" />
              <h3 className="font-['Syne'] text-lg font-semibold text-[var(--text-primary)] mb-2">No analyses yet</h3>
              <p className="text-[var(--text-muted)] text-sm font-['DM_Sans']">
                Analyses will appear here once the pipeline processes demos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((a, i) => (
                <DemoAnalysisCard
                  key={a.analysis_id}
                  analysis={{
                    id: a.analysis_id,
                    demoId: a.demo_id,
                    status: a.analysis_status as 'pending_review' | 'approved' | 'rejected' | 'redo' | 'escalated',
                    teacher: a.teacher,
                    student: a.student,
                    level: a.level,
                    subject: a.subject,
                    date: a.date,
                    salesAgent: a.sales_agent,
                    confidence: a.confidence,
                    studentRating: a.student_rating,
                    analystRating: a.analyst_rating,
                    conversionStatus: a.conversion_status as 'Converted' | 'Not Converted' | 'Pending',
                    methodology: a.methodology,
                    topicSelection: a.topic_selection,
                    resourceUsage: a.resource_usage,
                    interactivity: a.interactivity,
                    effectiveness: a.effectiveness,
                    improvements: a.improvements,
                    pourFlags: a.pour_flags.map((f) => ({
                      category: f.category,
                      severity: f.severity as 'High' | 'Medium' | 'Low',
                      description: f.description,
                    })),
                    accountability: a.accountability,
                    processingTime: '',
                    tokensUsed: a.tokens_used,
                    feedbackText: a.feedback_text,
                  }}
                  index={i}
                  onApprove={handleApprove}
                  onReject={(id) => handleReject(id)}
                  onRedo={(id) => handleRedo(id)}
                  onExpand={(id) => router.push(`/manager/dept/product/agent/wajeeha/sub/demo-conv/task/${id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Analytics Sidebar */}
        <div className="w-full xl:w-[340px] flex-shrink-0 space-y-6">
          {/* Accountability Donut */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-4">
            <h3 className="text-xs font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Accountability Split</h3>
            {loading ? (
              <div className="animate-pulse h-40 bg-[var(--bg-surface-2)] rounded" />
            ) : (
              <>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={queueData?.counts ? [
                          { name: 'High', value: queueData.counts.high_confidence, color: 'var(--status-active)' },
                          { name: 'Low', value: queueData.counts.low_confidence, color: 'var(--status-error)' },
                          { name: 'Escalated', value: queueData.counts.escalated, color: 'var(--status-escalated)' },
                        ] : []}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        dataKey="value"
                        stroke="none"
                      >
                        {(queueData?.counts ? [
                          { color: 'var(--status-active)' },
                          { color: 'var(--status-error)' },
                          { color: 'var(--status-escalated)' },
                        ] : []).map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {[
                    { name: 'High', color: 'var(--status-active)', value: counts?.high_confidence ?? 0 },
                    { name: 'Low', color: 'var(--status-error)', value: counts?.low_confidence ?? 0 },
                    { name: 'Escalated', color: 'var(--status-escalated)', value: counts?.escalated ?? 0 },
                  ].map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[11px] font-['DM_Sans'] text-[var(--text-secondary)]">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name} {d.value}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Trend placeholder */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-4">
            <h3 className="text-xs font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Conversion Trend</h3>
            <p className="text-xs font-['DM_Sans'] text-[var(--text-muted)] text-center py-8">
              View full analytics on the{' '}
              <button
                onClick={() => router.push('/manager/analytics')}
                className="text-[var(--gold-400)] hover:underline"
              >
                Analytics page
              </button>
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
