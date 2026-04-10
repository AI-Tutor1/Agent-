// Base URL: empty string in browser (Next.js rewrites /api/* to backend)
const BASE = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { headers }),
  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), headers }),
  patch: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), headers }),

  // Auth
  auth: {
    getUsers: () => request<User[]>('/api/auth/users'),
    login: (userId: string) => request<User>('/api/auth/login', { method: 'POST', body: JSON.stringify({ userId }) }),
  },

  // Teachers
  teachers: {
    getAll: () => request<{ name: string; subjects: string[] }[]>('/api/teachers'),
    getSubjects: () => request<string[]>('/api/teachers/subjects'),
    getAcademicLevels: () => request<string[]>('/api/teachers/academic-levels'),
    getCurriculumBoards: () => request<string[]>('/api/teachers/curriculum-boards'),
    getRateTiers: () => request<string[]>('/api/teachers/rate-tiers'),
    getCurriculumHints: () => request<Record<string, Record<string, string>>>('/api/teachers/curriculum-hints'),
  },

  // Demos
  demos: {
    getPending: () => request<PendingDemo[]>('/api/demos/pending'),
    getSubmissions: () => request<RecentSubmission[]>('/api/demos/submissions'),
    getLostReasons: () => request<string[]>('/api/demos/lost-reasons'),
    getFollowUpOptions: () => request<string[]>('/api/demos/follow-up-options'),
    submit: (body: DemoSubmission) =>
      request<{ demo_id: string }>('/api/demos', { method: 'POST', body: JSON.stringify(body) }),
    submitSalesOutcome: (demoId: string, body: SalesOutcome) =>
      request<{ status: string }>(`/api/demos/sales-outcome/${demoId}`, { method: 'POST', body: JSON.stringify(body) }),
  },

  // Dashboard
  dashboard: {
    getOverview: () => request<OverviewData>('/api/dashboard/overview'),
    getReviewQueue: (filter?: string, search?: string) => {
      const params = new URLSearchParams();
      if (filter) params.set('filter', filter);
      if (search) params.set('search', search);
      const qs = params.toString();
      return request<ReviewQueueData>(`/api/dashboard/review-queue${qs ? `?${qs}` : ''}`);
    },
    approve: (analysisId: string, reviewerName: string, notes?: string) =>
      request<{ status: string; analysis_id: string }>(`/api/dashboard/review/${analysisId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ reviewer_name: reviewerName, notes }),
      }),
    reject: (analysisId: string, reviewerName: string, reason: string) =>
      request<{ status: string; analysis_id: string }>(`/api/dashboard/review/${analysisId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reviewer_name: reviewerName, reason }),
      }),
    redo: (analysisId: string, reviewerName: string, instructions: string) =>
      request<{ status: string; analysis_id: string }>(`/api/dashboard/review/${analysisId}/redo`, {
        method: 'POST',
        body: JSON.stringify({ reviewer_name: reviewerName, instructions }),
      }),
    getAnalytics: (period?: '7d' | '30d' | '90d') =>
      request<AnalyticsData>(`/api/dashboard/analytics${period ? `?period=${period}` : ''}`),
    getDepartment: (deptId: string) =>
      request<DepartmentDetail>(`/api/dashboard/departments/${deptId}`),
    getAgentStats: () =>
      request<AgentStats>('/api/dashboard/agent-stats'),
    getHeartbeat: (agentName: string) =>
      request<AgentHeartbeat>(`/api/dashboard/heartbeat/${agentName}`),
    getPipelineLatest: () =>
      request<{ steps: PipelineLogStep[] }>('/api/dashboard/pipeline/latest'),
    getActivityLog: (demoId: string) =>
      request<ActivityLogData>(`/api/dashboard/activity-log/${demoId}`),
  },

  // Analyses (legacy — for backward compat with review page)
  analyses: {
    getAll: () => request<ReviewItem[]>('/api/analyses'),
    getById: (id: string) => request<ReviewItem>(`/api/analyses/${id}`),
  },

  // Departments
  departments: {
    getAll: () => request<DeptSummary[]>('/api/departments'),
    getById: (id: string) => request<DeptSummary>(`/api/departments/${id}`),
  },
};

// ── Types ──────────────────────────────────────────────────────────────────

export type UserRole = 'counselor' | 'sales' | 'manager' | 'dual' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  dept: string;
}

export type SubmissionStatus = 'Processing' | 'Awaiting Sales' | 'Pending Review' | 'Reviewed' | 'Escalated';

export interface RecentSubmission {
  date: string;
  teacher: string;
  student: string;
  level: string;
  subject: string;
  status: SubmissionStatus;
}

export interface PendingDemo {
  id: string;
  teacher: string;
  student: string;
  level: string;
  subject: string;
  loggedAgo: string;
  loggedHours: number;
}

export interface DemoSubmission {
  demo_date: string;
  teacher_name: string;
  academic_level: string;
  student_name: string;
  subjects: string[];
  curriculum_board?: string;
  curriculum_code?: string;
  rate_tier: string;
  pain_points?: string;
  session_notes?: string;
  logged_by?: string;
}

export interface SalesOutcome {
  conversion_status: string;
  student_rating: number;
  student_feedback: string;
  sales_comments: string;
  parent_contact?: string;
  lost_reasons?: string[];
  follow_up_plan?: string;
}

export interface OverviewData {
  pending_reviews: number;
  completed_today: number;
  active_escalations: number;
  avg_confidence: number;
  departments: DeptSummary[];
  recent_activity: ActivityEntry[];
}

export interface DeptSummary {
  id: string;
  name: string;
  head_name: string;
  active_agents: number;
  total_agents: number;
}

export interface ActivityEntry {
  id: number;
  agent_name: string;
  action_type: string;
  status: string;
  created_at: string;
}

export interface ReviewItem {
  analysis_id: string;
  demo_id: string;
  teacher: string;
  student: string;
  level: string;
  subject: string;
  date: string;
  confidence: number;
  analysis_status: string;
  pour_flags: PourFlagItem[];
  accountability: AccountabilityItem | null;
  methodology: string;
  topic_selection: string;
  resource_usage: string;
  interactivity: string;
  effectiveness: string;
  improvements: string;
  student_rating: number;
  analyst_rating: number;
  conversion_status: string;
  sales_agent: string;
  feedback_text: string;
  tokens_used: number;
}

export interface PourFlagItem {
  category: string;
  severity: string;
  description: string;
}

export interface AccountabilityItem {
  classification: string;
  evidence: string;
  confidence: string;
}

export interface ReviewQueueData {
  analyses: ReviewItem[];
  counts: {
    total: number;
    high_confidence: number;
    low_confidence: number;
    escalated: number;
  };
}

export interface AnalyticsData {
  conversion_trend: ConversionPoint[];
  pour_frequency: PourFrequency[];
  accountability_split: AccountabilitySplit[];
  top_teachers: TeacherRanking[];
}

export interface ConversionPoint {
  date: string;
  converted: number;
  not_converted: number;
  pending: number;
}

export interface PourFrequency {
  category: string;
  count: number;
}

export interface AccountabilitySplit {
  classification: string;
  count: number;
  percentage: number;
}

export interface TeacherRanking {
  teacher_name: string;
  avg_analyst_rating: number;
  total_demos: number;
  conversion_rate: number;
}

export interface AgentStats {
  avg_confidence: string | null;
  avg_processing_mins: number | null;
  today_count: number;
  first_pass_rate: number | null;
}

export interface AgentHeartbeat {
  status: 'Online' | 'Offline';
  shadow_mode: boolean;
  uptime: string | null;
  last_seen: string | null;
}

export interface PipelineLogStep {
  action_type: string;
  details: string | null;
  status: string;
  created_at: string;
  duration_ms: number | null;
}

export interface ActivityLogData {
  activity_log: PipelineLogStep[];
  data_sources: { name: string; ok: boolean }[];
  confidence: number | null;
  tokens_used: number | null;
}

export interface DepartmentDetail {
  department: DeptSummary & { head_agent_name?: string };
  recent_analyses: {
    analysis_id: string;
    demo_id: string;
    teacher_name: string;
    student_name: string;
    subject: string;
    analysis_status: string;
    agent_confidence: number;
    demo_date: string;
  }[];
}
