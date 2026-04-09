// run-pipeline.ts — 11-Step Pipeline Orchestrator
// Processes a single demo from raw data through to pending_review.

import { pool } from '../db';
import { PipelineError, PipelineRunResult, PipelineStepResult, PourFlag, SalesData } from './types';
import { ConductedDemoSession, DemoFeedback, TeacherProfile } from './types';

import { step1RetrieveDemo }          from './step01-retrieve-demo';
import { step2CreateAnalysis }         from './step02-create-analysis';
import { step3IdentifyPour }           from './step03-identify-pour';
import { step4QualitativeReview }      from './step04-qualitative-review';
import { step5FetchFeedback }          from './step05-fetch-feedback';
import { step6RatingStandardization }  from './step06-rating-standardization';
import { step7ExportToSales }          from './step07-export-to-sales';
import { step8PullSalesData }          from './step08-pull-sales-data';
import { step9CompileSheet30 }         from './step09-compile-sheet30';
import { step10Accountability }        from './step10-accountability';
import { step11UpdateTeacher }         from './step11-update-teacher';

const SHADOW_MODE = process.env.SHADOW_MODE === 'true';

async function getTeacherProfile(teacherName: string): Promise<TeacherProfile | null> {
  const result = await pool.query<TeacherProfile>(
    `SELECT * FROM teacher_profiles WHERE LOWER(teacher_name) = LOWER($1) LIMIT 1`,
    [teacherName]
  );
  return result.rows[0] ?? null;
}

function makeStep(num: number): PipelineStepResult {
  return { step: num, success: true };
}

function failStep(num: number, err: unknown): PipelineStepResult {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[pipeline] Step ${num} failed: ${message}`);
  return { step: num, success: false, error: message };
}

export async function runPipeline(demoId: string): Promise<PipelineRunResult> {
  const startTime = Date.now();
  const stepResults: PipelineStepResult[] = [];
  let stepsCompleted = 0;
  let stepsFailed = 0;
  let totalTokens = 0;
  let analysisId = '';

  // Mutable state shared across steps
  let demo: ConductedDemoSession;
  let feedback: DemoFeedback | null = null;
  let pourFlags: PourFlag[] = [];
  let salesData: SalesData | null = null;

  console.log(`[pipeline] Starting pipeline for demo: ${demoId}`);

  // ── STEP 1 — HARD STOP if demo not found ────────────────────────────────
  try {
    demo = await step1RetrieveDemo(demoId);
    stepResults.push(makeStep(1));
    stepsCompleted++;
  } catch (err) {
    if (err instanceof PipelineError && err.code === 'DEMO_NOT_FOUND') {
      throw err; // Re-throw — daemon must NOT retry this demo
    }
    throw err;
  }

  // ── STEP 2 — Create analysis record ─────────────────────────────────────
  try {
    analysisId = await step2CreateAnalysis(demo!);
    stepResults.push(makeStep(2));
    stepsCompleted++;
  } catch (err) {
    stepResults.push(failStep(2, err));
    stepsFailed++;
    // Cannot continue without analysis_id
    return finalise(demoId, analysisId, startTime, stepResults, stepsCompleted, stepsFailed, totalTokens);
  }

  // ── STEP 5 — Fetch feedback early (needed for Steps 3 and 4) ────────────
  try {
    feedback = await step5FetchFeedback(demo!, analysisId);
    stepResults.push({ step: 5, success: true });
    stepsCompleted++;
  } catch (err) {
    stepResults.push(failStep(5, err));
    stepsFailed++;
    feedback = null;
  }

  // ── STEP 3 — POUR identification ─────────────────────────────────────────
  try {
    pourFlags = await step3IdentifyPour(demo!, analysisId, feedback);
    stepResults.push(makeStep(3));
    stepsCompleted++;
  } catch (err) {
    stepResults.push(failStep(3, err));
    stepsFailed++;
    pourFlags = [];
  }

  // ── STEP 4 — Qualitative Review (Claude API) ─────────────────────────────
  try {
    const teacher = await getTeacherProfile(demo!.teacher_name);
    const tokens = await step4QualitativeReview(demo!, analysisId, feedback, pourFlags, teacher);
    totalTokens += tokens;
    stepResults.push({ step: 4, success: true, tokensUsed: tokens });
    stepsCompleted++;
  } catch (err) {
    stepResults.push(failStep(4, err));
    stepsFailed++;
  }

  // ── STEP 6 — Rating standardization ─────────────────────────────────────
  try {
    await step6RatingStandardization(analysisId, feedback);
    stepResults.push(makeStep(6));
    stepsCompleted++;
  } catch (err) {
    stepResults.push(failStep(6, err));
    stepsFailed++;
  }

  // ── STEP 7 — Export to sales ─────────────────────────────────────────────
  try {
    await step7ExportToSales(demo!, analysisId);
    stepResults.push(makeStep(7));
    stepsCompleted++;
  } catch (err) {
    stepResults.push(failStep(7, err));
    stepsFailed++;
  }

  // ── STEP 8 — Pull sales data ─────────────────────────────────────────────
  try {
    salesData = await step8PullSalesData(demoId);
    stepResults.push(makeStep(8));
    stepsCompleted++;
  } catch (err) {
    stepResults.push(failStep(8, err));
    stepsFailed++;
    salesData = null;
  }

  // ── STEP 9 — Compile Sheet30 metrics ─────────────────────────────────────
  try {
    await step9CompileSheet30(analysisId, demo!.teacher_name);
    stepResults.push(makeStep(9));
    stepsCompleted++;
  } catch (err) {
    stepResults.push(failStep(9, err));
    stepsFailed++;
  }

  // ── STEP 10 — Accountability Classification (Claude API) ─────────────────
  try {
    const tokens = await step10Accountability(demo!, analysisId, feedback, salesData, pourFlags);
    totalTokens += tokens;
    stepResults.push({ step: 10, success: true, tokensUsed: tokens });
    stepsCompleted++;
  } catch (err) {
    stepResults.push(failStep(10, err));
    stepsFailed++;
  }

  // ── STEP 11 — Update teacher profile ─────────────────────────────────────
  try {
    await step11UpdateTeacher(analysisId);
    stepResults.push(makeStep(11));
    stepsCompleted++;
  } catch (err) {
    stepResults.push(failStep(11, err));
    stepsFailed++;
  }

  return finalise(demoId, analysisId, startTime, stepResults, stepsCompleted, stepsFailed, totalTokens);
}

async function finalise(
  demoId: string,
  analysisId: string,
  startTime: number,
  stepResults: PipelineStepResult[],
  stepsCompleted: number,
  stepsFailed: number,
  totalTokens: number
): Promise<PipelineRunResult> {
  const processingTimeMs = Date.now() - startTime;
  const processingTimeMins = Math.ceil(processingTimeMs / 60000);

  // Mark analysis as pending_review
  if (analysisId) {
    try {
      await pool.query(
        `UPDATE demo_analysis
         SET analysis_status = 'pending_review', processing_time_mins = $1, tokens_used = $2, updated_at = NOW()
         WHERE analysis_id = $3`,
        [processingTimeMins, totalTokens, analysisId]
      );
    } catch (err) {
      console.error('[pipeline] Failed to set analysis to pending_review:', err);
    }
  }

  // Mark demo session as complete
  try {
    await pool.query(
      `UPDATE conducted_demo_sessions SET analysis_status = 'complete' WHERE demo_id = $1`,
      [demoId]
    );
  } catch (err) {
    console.error('[pipeline] Failed to mark demo as complete:', err);
  }

  // Write notification to Dawood agent (SQL bus)
  if (analysisId) {
    try {
      await pool.query(
        `INSERT INTO notifications (recipient, type, title, message, reference_id, shadow_mode)
         VALUES ('dawood_agent', 'demo_ready_for_review',
           $1, $2, $3, $4)`,
        [
          `Analysis ready: ${demoId}`,
          `Pipeline complete. Steps: ${stepsCompleted}/11. Tokens: ${totalTokens}. Time: ${processingTimeMins}m.`,
          analysisId,
          SHADOW_MODE,
        ]
      );
    } catch (err) {
      console.error('[pipeline] Failed to write notification:', err);
    }
  }

  // Log completion to agent_activity_log
  try {
    await pool.query(
      `INSERT INTO agent_activity_log
        (agent_name, action_type, demo_id, analysis_id, tokens_used, duration_ms, status, shadow_mode, details)
       VALUES ('wajeeha_pipeline', 'pipeline_complete', $1, $2, $3, $4, $5, $6, $7)`,
      [
        demoId, analysisId || null, totalTokens, processingTimeMs,
        stepsFailed === 0 ? 'success' : stepsFailed < 5 ? 'partial' : 'failed',
        SHADOW_MODE,
        JSON.stringify({ steps_completed: stepsCompleted, steps_failed: stepsFailed, step_results: stepResults }),
      ]
    );
  } catch (err) {
    console.error('[pipeline] Failed to log completion:', err);
  }

  console.log(`[pipeline] Done: ${demoId} | ${stepsCompleted}/11 steps | ${totalTokens} tokens | ${processingTimeMs}ms | shadow=${SHADOW_MODE}`);

  return {
    analysis_id: analysisId,
    demo_id: demoId,
    steps_completed: stepsCompleted,
    steps_failed: stepsFailed,
    total_tokens: totalTokens,
    processing_time_ms: processingTimeMs,
    step_results: stepResults,
  };
}
