// database.ts — TypeScript interfaces for all 15 database tables

export interface ConductedDemoSession {
  demo_id: string;
  demo_date: Date;
  demo_month: string | null;
  teacher_name: string;
  student_name: string;
  academic_level: string | null;
  subject: string | null;
  curriculum_board: string | null;
  curriculum_code: string | null;
  analysis_status: 'pending' | 'in_progress' | 'partial' | 'complete' | 'escalated';
  synced_at: Date;
  created_at: Date;
}

export interface DemoFeedback {
  feedback_id: number;
  timestamp: Date | null;
  tutor_name: string | null;
  student_name: string | null;
  subject: string | null;
  session_date: Date | null;
  overall_rating_10: number | null;
  topic_explained: string | null;
  participation: string | null;
  confusion_moments: string | null;
  discomfort_moments: string | null;
  positive_environment: number | null;
  suggestions: string | null;
  comments_other: string | null;
  matched_demo_id: string | null;
  match_confidence: 'exact' | 'fuzzy' | 'unmatched' | null;
  created_at: Date;
}

export interface DemoConversionSale {
  id: number;
  demo_date: Date | null;
  teacher_name: string | null;
  student_name: string | null;
  academic_level: string | null;
  subject: string | null;
  conversion_status: 'Converted' | 'Not Converted' | 'Pending' | null;
  sales_comments: string | null;
  sales_agent: string | null;
  parent_contact: string | null;
  matched_demo_id: string | null;
  synced_at: Date;
  created_at: Date;
}

export interface DemoAnalysis {
  analysis_id: string;
  demo_id: string | null;
  demo_date: Date | null;
  teacher_name: string | null;
  teacher_id: string | null;
  student_name: string | null;
  academic_level: string | null;
  subject: string | null;
  teaching_methodology: string | null;
  topic_selection: string | null;
  resource_usage: string | null;
  interactivity_notes: string | null;
  overall_effectiveness: string | null;
  improvement_suggestions: string | null;
  student_rating_raw: number | null;
  student_rating_converted: number | null;
  analyst_rating: number | null;
  feedback_source_id: number | null;
  pour_present: boolean;
  pour_categories: string[] | null;
  conversion_status: 'Converted' | 'Not Converted' | 'Pending' | null;
  sales_agent: string | null;
  accountability_classification: 'Sales' | 'Product' | 'Consumer' | 'Mixed' | null;
  accountability_evidence: string | null;
  accountability_confidence: 'high' | 'medium' | 'low' | null;
  analysis_status: 'pending_review' | 'approved' | 'rejected' | 'redo' | 'escalated';
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: Date | null;
  agent_confidence: number | null;
  human_accuracy_score: number | null;
  processing_time_mins: number | null;
  tokens_used: number | null;
  pipeline_version: string;
  created_at: Date;
  updated_at: Date;
}

export interface PourFlag {
  flag_id: number;
  analysis_id: string | null;
  demo_id: string | null;
  category: 'Video' | 'Interaction' | 'Technical' | 'Cancellation' | 'Resources' | 'Time' | 'No Show';
  severity: 'High' | 'Medium' | 'Low';
  description: string | null;
  teacher_name: string | null;
  created_at: Date;
}

export interface TeacherProfile {
  teacher_id: string;
  teacher_name: string;
  name_aliases: string[] | null;
  subjects: string[] | null;
  curriculum_codes: string[] | null;
  academic_levels: string[] | null;
  hourly_rate_standard: number | null;
  hourly_rate_premium: number | null;
  status: 'active' | 'inactive' | 'suspended';
  accent_notes: string | null;
  demo_guidelines: string | null;
  avg_student_rating: number | null;
  avg_analyst_rating: number | null;
  total_demos: number;
  conversion_rate: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: number;
  recipient: string;
  type: 'demo_ready_for_review' | 'escalation' | 'alert' | 'system';
  title: string | null;
  message: string | null;
  reference_id: string | null;
  read: boolean;
  shadow_mode: boolean;
  created_at: Date;
}

export interface AgentActivityLog {
  id: number;
  agent_name: string;
  action_type: string;
  demo_id: string | null;
  analysis_id: string | null;
  details: Record<string, unknown> | null;
  tokens_used: number | null;
  duration_ms: number | null;
  status: 'success' | 'failed' | 'partial' | 'skipped' | null;
  error_message: string | null;
  shadow_mode: boolean;
  created_at: Date;
}

export interface Escalation {
  id: number;
  source_agent: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low' | null;
  type: 'missing_data' | 'api_failure' | 'no_match' | 'policy_violation' | null;
  title: string | null;
  description: string | null;
  reference_id: string | null;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: Date | null;
  created_at: Date;
}

export interface DataIntegrityFlag {
  id: number;
  source_table: string | null;
  source_id: string | null;
  flag_type: 'missing_field' | 'unmatched_record' | 'duplicate' | 'format_error' | null;
  field_name: string | null;
  description: string | null;
  resolved: boolean;
  created_at: Date;
}

export interface TaskQueue {
  id: string;
  title: string;
  description: string | null;
  column_status: 'to_do' | 'doing' | 'needs_input' | 'done' | 'cancelled';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee_type: 'human' | 'agent' | null;
  assignee_name: string | null;
  due_date: Date | null;
  subtasks: unknown[];
  metadata: Record<string, unknown>;
  created_by: string | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: 'counselor' | 'sales' | 'manager' | 'admin';
  department: string | null;
  email: string | null;
  created_at: Date;
}

export interface Department {
  id: string;
  name: string;
  head_name: string | null;
  head_agent_name: string | null;
  total_agents: number;
  active_agents: number;
  created_at: Date;
}

export interface SyncLog {
  id: number;
  sheet_name: string | null;
  sheet_id: string | null;
  rows_fetched: number | null;
  rows_inserted: number | null;
  rows_updated: number | null;
  errors: number;
  duration_ms: number | null;
  status: 'success' | 'partial' | 'failed' | null;
  created_at: Date;
}

export interface ComparisonResult {
  id: number;
  demo_id: string | null;
  analysis_id: string | null;
  field_name: string | null;
  agent_value: string | null;
  human_value: string | null;
  match_score: number | null;
  reviewer: string | null;
  review_date: Date;
}
