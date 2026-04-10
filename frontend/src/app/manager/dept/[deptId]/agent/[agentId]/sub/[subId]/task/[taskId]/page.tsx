'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { DemoAnalysisCard } from '@/components/DemoAnalysisCard';
import { api, type ActivityLogData } from '@/lib/api';

interface DemoAnalysis {
  id: string;
  demoId: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'redo' | 'escalated';
  teacher: string;
  student: string;
  level: string;
  subject: string;
  date: string;
  salesAgent: string;
  confidence: number;
  studentRating: number;
  analystRating: number;
  conversionStatus: 'Converted' | 'Not Converted' | 'Pending';
  methodology: string;
  topicSelection: string;
  resourceUsage: string;
  interactivity: string;
  effectiveness: string;
  improvements: string;
  pourFlags: { category: string; severity: 'High' | 'Medium' | 'Low'; description: string }[];
  accountability: { classification: string; evidence: string; confidence: string } | null;
  processingTime: string;
  tokensUsed: number;
  feedbackText: string;
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams<{ deptId: string; agentId: string; subId: string; taskId: string }>();

  const [analysis, setAnalysis]     = useState<DemoAnalysis | null>(null);
  const [logData, setLogData]       = useState<ActivityLogData | null>(null);
  const [logLoading, setLogLoading] = useState(true);

  useEffect(() => {
    // Fetch the analysis record
    api.analyses.getAll().then((items) => {
      const mapped: DemoAnalysis[] = items.map((r) => ({
        id: r.analysis_id,
        demoId: r.demo_id,
        status: r.analysis_status as DemoAnalysis['status'],
        teacher: r.teacher,
        student: r.student,
        level: r.level,
        subject: r.subject,
        date: r.date,
        salesAgent: r.sales_agent,
        confidence: r.confidence,
        studentRating: r.student_rating,
        analystRating: r.analyst_rating,
        conversionStatus: r.conversion_status as DemoAnalysis['conversionStatus'],
        methodology: r.methodology,
        topicSelection: r.topic_selection,
        resourceUsage: r.resource_usage,
        interactivity: r.interactivity,
        effectiveness: r.effectiveness,
        improvements: r.improvements,
        pourFlags: r.pour_flags.map((f) => ({
          category: f.category,
          severity: f.severity as 'High' | 'Medium' | 'Low',
          description: f.description,
        })),
        accountability: r.accountability,
        processingTime: '',
        tokensUsed: r.tokens_used,
        feedbackText: r.feedback_text,
      }));
      const found = mapped.find((a) => a.id === params.taskId) || mapped[0];
      setAnalysis(found ?? null);

      // Fetch activity log using the demo_id of the found analysis
      const demoId = found?.demoId;
      if (demoId) {
        api.dashboard.getActivityLog(demoId)
          .then(setLogData)
          .catch(() => setLogData(null))
          .finally(() => setLogLoading(false));
      } else {
        setLogLoading(false);
      }
    }).catch(() => setLogLoading(false));
  }, [params.taskId]);

  if (!analysis) {
    return (
      <Shell>
        <p className="text-[var(--text-muted)] font-['DM_Sans'] text-sm">Loading task...</p>
      </Shell>
    );
  }

  const hasLog = (logData?.activity_log?.length ?? 0) > 0;

  return (
    <Shell breadcrumbs={[
      { label: '◆ Tuitional', path: '/manager' },
      { label: '◉ Product', path: `/manager/dept/${params.deptId}` },
      { label: '● Wajeeha', path: `/manager/dept/${params.deptId}/agent/wajeeha` },
      { label: '· Demo-to-Conversion', path: `/manager/dept/${params.deptId}/agent/wajeeha/sub/demo-conv` },
      { label: `Task ${analysis.demoId}` },
    ]}>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-['DM_Sans'] text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex gap-6 flex-col xl:flex-row">
        {/* Left: Full Analysis Card */}
        <div className="flex-1 min-w-0">
          <DemoAnalysisCard analysis={analysis} expanded />
        </div>

        {/* Right: Reasoning Panel */}
        <div className="w-full xl:w-[360px] flex-shrink-0 space-y-4">

          {/* Pipeline Trace */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Pipeline Trace</h3>
            {logLoading ? (
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-3 bg-[var(--bg-surface-2)] rounded w-full" />
                ))}
              </div>
            ) : !hasLog ? (
              <p className="text-xs font-['DM_Sans'] text-[var(--text-muted)] italic">
                No pipeline trace available for this task.
              </p>
            ) : (
              <div className="space-y-2">
                {logData!.activity_log.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[var(--status-active)] flex-shrink-0" />
                    <span className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] flex-1">
                      {entry.action_type.replace(/_/g, ' ')}
                      {entry.details ? ` — ${entry.details}` : ''}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] flex-shrink-0">
                      {entry.duration_ms != null ? `${(entry.duration_ms / 1000).toFixed(1)}s` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data Sources */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Data Sources</h3>
            {logData ? (
              <div className="space-y-2">
                {logData.data_sources.map((ds) => (
                  <div key={ds.name} className="flex items-center gap-2 text-xs font-['DM_Sans']">
                    {ds.ok
                      ? <CheckCircle2 size={12} className="text-[var(--status-active)]" />
                      : <XCircle size={12} className="text-[var(--status-error)]" />}
                    <span className="text-[var(--text-secondary)]">{ds.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-['DM_Sans'] text-[var(--text-muted)] italic">No source data available.</p>
            )}
          </div>

          {/* Confidence Breakdown */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Confidence Breakdown</h3>
            <div className="space-y-2 text-xs font-['DM_Sans']">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Overall</span>
                <span className="text-[var(--gold-400)] font-['JetBrains_Mono']">
                  {analysis.confidence > 0 ? `${analysis.confidence.toFixed(1)}/10` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">POUR flags</span>
                <span className="font-['JetBrains_Mono']" style={{
                  color: analysis.pourFlags.length > 0 ? 'var(--status-pending)' : 'var(--status-active)',
                }}>
                  {analysis.pourFlags.length > 0 ? `${analysis.pourFlags.length} flagged` : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Accountability</span>
                <span className="text-[var(--text-secondary)] font-['JetBrains_Mono']">
                  {analysis.accountability?.classification ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Tokens used</span>
                <span className="text-[var(--text-muted)] font-['JetBrains_Mono']">
                  {analysis.tokensUsed > 0 ? analysis.tokensUsed.toLocaleString() : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-3">Activity Log</h3>
            {logLoading ? (
              <div className="animate-pulse space-y-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-3 bg-[var(--bg-surface-2)] rounded w-full" />
                ))}
              </div>
            ) : !hasLog ? (
              <p className="text-xs font-['DM_Sans'] text-[var(--text-muted)] italic">No activity recorded yet.</p>
            ) : (
              <div className="space-y-1.5">
                {logData!.activity_log.map((entry, i) => {
                  const ts = new Date(entry.created_at).toLocaleTimeString('en-GB', {
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                  });
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <Circle size={8} className="text-[var(--text-muted)] mt-1 flex-shrink-0" />
                      <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-muted)]">
                        {ts}{'  '}{entry.action_type}
                        {entry.details ? `  ${entry.details}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
