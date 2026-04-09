// Dashboard type definitions — sourced from real API responses
// No mock data. Empty DB = empty arrays.

export type SubmissionStatus = 'Processing' | 'Awaiting Sales' | 'Pending Review' | 'Reviewed' | 'Escalated';

export type UserRole = 'counselor' | 'sales' | 'manager' | 'dual' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  dept: string;
}

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
