'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { api, type AnalyticsData } from '@/lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { BarChart2 } from 'lucide-react';

type Period = '7d' | '30d' | '90d';

const ACC_COLORS: Record<string, string> = {
  Sales: 'var(--acc-sales)',
  Product: 'var(--acc-product)',
  Consumer: 'var(--acc-consumer)',
  Mixed: 'var(--acc-mixed)',
};

function getAccColor(name: string): string {
  return ACC_COLORS[name] || 'var(--text-muted)';
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<Period>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.dashboard.getAnalytics(period)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  const periods: Period[] = ['7d', '30d', '90d'];

  const trendData = data?.conversion_trend ?? [];
  const pourData = data?.pour_frequency ?? [];
  const accData = data?.accountability_split ?? [];
  const teacherData = data?.top_teachers ?? [];

  return (
    <Shell breadcrumbs={[
      { label: '◆ Tuitional', path: '/manager' },
      { label: 'Analytics' },
    ]}>
      {/* Period selector */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-['Syne'] font-bold text-2xl text-[var(--text-primary)]">Analytics</h1>
        <div className="ml-auto flex gap-1 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-['DM_Sans'] rounded-md transition-colors
                ${period === p ? 'bg-[var(--gold-400)] text-[#080810] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-[var(--bg-surface-2)] rounded w-1/3 mb-4" />
              <div className="h-40 bg-[var(--bg-surface-2)] rounded" />
            </div>
          ))}
        </div>
      ) : !data || (trendData.length === 0 && pourData.length === 0 && accData.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart2 className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <h3 className="font-['Syne'] text-lg font-semibold text-[var(--text-primary)] mb-2">No analytics data yet</h3>
          <p className="text-[var(--text-muted)] text-sm font-['DM_Sans']">
            Analytics will populate once demos are processed and reviewed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Conversion Trend */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-xs font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-4">
              Conversion Trend ({period})
            </h3>
            {trendData.length === 0 ? (
              <p className="text-xs font-['DM_Sans'] text-[var(--text-muted)] text-center py-12">No conversion data for this period</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52526A' }} axisLine={false} tickLine={false}
                    tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#52526A' }} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="converted" stroke="var(--status-active)" strokeWidth={2} dot={false} name="Converted" />
                  <Line type="monotone" dataKey="not_converted" stroke="var(--status-error)" strokeWidth={2} dot={false} name="Not Converted" />
                  <Line type="monotone" dataKey="pending" stroke="var(--status-pending)" strokeWidth={1} dot={false} name="Pending" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* POUR Frequency */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-xs font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-4">POUR Flag Frequency</h3>
            {pourData.length === 0 ? (
              <p className="text-xs font-['DM_Sans'] text-[var(--text-muted)] text-center py-12">No POUR flags for this period</p>
            ) : (
              <div className="space-y-2">
                {pourData.map((p, i) => {
                  const maxCount = Math.max(...pourData.map((x) => x.count), 1);
                  return (
                    <div key={p.category} className="flex items-center gap-2">
                      <span className="text-[11px] font-['DM_Sans'] text-[var(--text-secondary)] w-24 text-right truncate">{p.category}</span>
                      <div className="flex-1 h-4 bg-[var(--bg-surface-2)] rounded overflow-hidden">
                        <div
                          className="h-full rounded transition-all"
                          style={{
                            width: `${(p.count / maxCount) * 100}%`,
                            backgroundColor: i % 5 === 0 ? '#60A5FA' : i % 5 === 1 ? '#FBBF24' : i % 5 === 2 ? '#F87171' : i % 5 === 3 ? '#C084FC' : '#34D399',
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-muted)] w-6">{p.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accountability Split */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-xs font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-4">Accountability Split</h3>
            {accData.length === 0 ? (
              <p className="text-xs font-['DM_Sans'] text-[var(--text-muted)] text-center py-12">No accountability data for this period</p>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={accData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" stroke="none">
                      {accData.map((d, i) => <Cell key={i} fill={getAccColor(d.classification)} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {accData.map((d) => (
                    <div key={d.classification} className="flex items-center gap-1.5 text-[11px] font-['DM_Sans'] text-[var(--text-secondary)]">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getAccColor(d.classification) }} />
                      {d.classification} {d.percentage}%
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Teachers */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5">
            <h3 className="text-xs font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-4">Top Teachers by Rating</h3>
            {teacherData.length === 0 ? (
              <p className="text-xs font-['DM_Sans'] text-[var(--text-muted)] text-center py-12">No teacher data for this period</p>
            ) : (
              <div className="space-y-3">
                {teacherData.map((t, i) => (
                  <div key={t.teacher_name} className="flex items-center gap-3">
                    <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-muted)] w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-['DM_Sans'] text-[var(--text-primary)] truncate">{t.teacher_name}</div>
                      <div className="text-[10px] font-['DM_Sans'] text-[var(--text-muted)]">
                        {t.total_demos} demos · {t.conversion_rate}% converted
                      </div>
                    </div>
                    <span className="text-sm font-['JetBrains_Mono'] text-[var(--gold-400)]">
                      {t.avg_analyst_rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}
