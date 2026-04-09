'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { Shell } from '@/components/layout/Shell';
import { api, type OverviewData, type DeptSummary, type ActivityEntry } from '@/lib/api';

// 35-minute threshold for agent online/offline
const ONLINE_THRESHOLD_MS = 35 * 60 * 1000;

interface AgentStatusEntry {
  agent_name: string;
  last_active: string | null;
  online: boolean;
}

function AgentStatusSection({ recentActivity }: { recentActivity: ActivityEntry[] }) {
  // Derive agent status from recent_activity: find last activity per unique agent
  const agentMap = new Map<string, string>();
  for (const entry of recentActivity) {
    if (!agentMap.has(entry.agent_name)) {
      agentMap.set(entry.agent_name, entry.created_at);
    }
  }

  const now = Date.now();
  const agents: AgentStatusEntry[] = Array.from(agentMap.entries()).map(([name, ts]) => {
    const last = new Date(ts).getTime();
    return {
      agent_name: name,
      last_active: ts,
      online: now - last < ONLINE_THRESHOLD_MS,
    };
  });

  if (agents.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="font-['Syne'] font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-4">Agent Status</h2>
      <div className="flex flex-wrap gap-3">
        {agents.map((agent) => {
          const timeStr = agent.last_active
            ? new Date(agent.last_active).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            : '—';
          return (
            <div
              key={agent.agent_name}
              className="flex items-center gap-3 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-4 py-3"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${agent.online ? 'bg-[var(--status-active)] pulse-dot' : 'bg-[var(--text-muted)]'}`} />
              <div>
                <div className="font-['Syne'] font-semibold text-xs text-[var(--text-primary)] capitalize">{agent.agent_name}</div>
                <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">
                  {agent.online ? 'Online' : 'Offline'} · {timeStr}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const deptColor: Record<string, string> = {
  Product: 'var(--gold-400)',
  Sales: 'var(--acc-sales)',
  Excellence: 'var(--status-active)',
  CTO: 'var(--status-escalated)',
  Marketing: 'var(--status-pending)',
  Finance: 'var(--pour-low)',
  BizDev: 'var(--text-secondary)',
  HR: 'var(--text-muted)',
};

function getDeptColor(name: string): string {
  const key = Object.keys(deptColor).find((k) => name.toLowerCase().includes(k.toLowerCase()));
  return key ? deptColor[key] : 'var(--text-muted)';
}

export default function OverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.getOverview()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data
    ? [
        { label: 'Pending Reviews', value: String(data.pending_reviews), sub: '', accent: true },
        { label: 'Completed Today', value: String(data.completed_today), sub: '', accent: false },
        { label: 'Active Escalations', value: String(data.active_escalations), sub: '', accent: false },
        { label: 'Avg Confidence', value: data.avg_confidence.toFixed(1), sub: '/10', accent: false },
        { label: 'Departments', value: String(data.departments.length), sub: '', accent: false },
      ]
    : [];

  return (
    <Shell breadcrumbs={[{ label: '◆ Tuitional' }]}>
      {/* KPI Strip */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5 animate-pulse">
              <div className="h-8 bg-[var(--bg-surface-2)] rounded w-16 mb-2" />
              <div className="h-3 bg-[var(--bg-surface-2)] rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
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
      )}

      {/* Agent Status */}
      {!loading && data && data.recent_activity.length > 0 && (
        <AgentStatusSection recentActivity={data.recent_activity} />
      )}

      <div className="flex gap-6 flex-col xl:flex-row">
        {/* Department Grid */}
        <div className="flex-1 min-w-0">
          <h2 className="font-['Syne'] font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-4">Departments</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-[var(--bg-surface-2)] rounded w-3/4 mb-3" />
                  <div className="h-3 bg-[var(--bg-surface-2)] rounded w-1/2 mb-4" />
                  <div className="h-8 bg-[var(--bg-surface-2)] rounded mb-3" />
                  <div className="h-3 bg-[var(--bg-surface-2)] rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : data && data.departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-[var(--text-muted)] text-4xl mb-4">◉</span>
              <h3 className="font-['Syne'] text-lg font-semibold text-[var(--text-primary)] mb-2">No departments yet</h3>
              <p className="text-[var(--text-muted)] text-sm font-['DM_Sans']">Departments will appear here once configured in the database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data?.departments ?? []).map((dept: DeptSummary, i: number) => {
                const isProduct = dept.name.toLowerCase().includes('product') || dept.name.toLowerCase().includes('counsel');
                const spark = Array.from({ length: 10 }, (_, j) => ({ v: Math.floor(Math.random() * 8) + 2, i: j }));

                return (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -3 }}
                    onClick={() => router.push(`/manager/dept/${dept.id}`)}
                    className={`relative bg-[var(--bg-surface-1)] border rounded-xl p-5 cursor-pointer transition-all duration-150
                      ${isProduct ? 'border-[var(--gold-400)]/40' : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'}`}
                  >
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
                        <span className={`w-2 h-2 rounded-full ${dept.active_agents > 0 ? 'bg-[var(--status-active)]' : 'bg-[var(--text-muted)]'}`} />
                        <span className="font-['Syne'] font-semibold text-sm text-[var(--text-primary)]">{dept.name}</span>
                      </div>
                      {isProduct && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-['DM_Sans'] font-bold tracking-wider text-[var(--status-shadow)] bg-[var(--status-shadow)]/15 border border-[var(--status-shadow)]/30 uppercase">
                          Shadow
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-['DM_Sans'] text-[var(--text-muted)] mb-3">Led by {dept.head_name}</div>

                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs font-['JetBrains_Mono'] text-[var(--text-secondary)]">
                        {dept.active_agents}<span className="text-[var(--text-muted)]">/{dept.total_agents}</span> active
                      </span>
                    </div>

                    <div className="h-8 mb-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={spark} barCategoryGap={2}>
                          <Bar dataKey="v" fill={isProduct ? 'var(--gold-400)' : 'var(--text-muted)'} radius={[2, 2, 0, 0]} opacity={isProduct ? 0.7 : 0.35} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="w-full xl:w-[340px] flex-shrink-0">
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl p-5 sticky top-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--status-active)] pulse-dot" />
              <h3 className="font-['Syne'] font-semibold text-sm text-[var(--text-primary)] uppercase tracking-wider">Live Activity</h3>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-3 bg-[var(--bg-surface-2)] rounded w-10 flex-shrink-0 mt-1" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-[var(--bg-surface-2)] rounded w-1/2" />
                      <div className="h-2.5 bg-[var(--bg-surface-2)] rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data && data.recent_activity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm font-['DM_Sans'] text-[var(--text-muted)]">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {(data?.recent_activity ?? []).map((item: ActivityEntry, i: number) => {
                  const timeStr = new Date(item.created_at).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex gap-3"
                    >
                      <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-muted)] w-10 flex-shrink-0 pt-0.5">{timeStr}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-['DM_Sans'] font-medium text-[var(--text-primary)]">{item.agent_name}</span>
                          <span
                            className="text-[9px] px-1 py-0 rounded font-['DM_Sans']"
                            style={{
                              color: getDeptColor(item.agent_name),
                              backgroundColor: `color-mix(in srgb, ${getDeptColor(item.agent_name)} 12%, transparent)`,
                            }}
                          >
                            {item.action_type}
                          </span>
                        </div>
                        <div className="text-[11px] font-['DM_Sans'] text-[var(--text-muted)] leading-relaxed">
                          {item.status}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes spin-border { to { --angle: 360deg; } }
      `}</style>
    </Shell>
  );
}
