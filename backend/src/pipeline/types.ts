// types.ts — Shared types for the 11-step pipeline

import { ConductedDemoSession, DemoFeedback, TeacherProfile } from '../types/database';

export type { ConductedDemoSession, DemoFeedback, TeacherProfile };

export class PipelineError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly demoId?: string
  ) {
    super(message);
    this.name = 'PipelineError';
  }
}

export interface PourFlag {
  category: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface SalesData {
  conversion_status: string | null;
  sales_agent: string | null;
  sales_comments: string | null;
}

export interface PipelineStepResult {
  step: number;
  success: boolean;
  error?: string;
  tokensUsed?: number;
}

export interface PipelineRunResult {
  analysis_id: string;
  demo_id: string;
  steps_completed: number;
  steps_failed: number;
  total_tokens: number;
  processing_time_ms: number;
  step_results: PipelineStepResult[];
}
