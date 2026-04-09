// Step 1 — Retrieve Demo Record
// Type: Pure Code. Zero AI cost.
// HARD STOP if demo not found.

import { pool } from '../db';
import { ConductedDemoSession, PipelineError } from './types';

export async function step1RetrieveDemo(demoId: string): Promise<ConductedDemoSession> {
  const result = await pool.query<ConductedDemoSession>(
    `SELECT * FROM conducted_demo_sessions WHERE demo_id = $1`,
    [demoId]
  );

  if (result.rows.length === 0) {
    await pool.query(
      `INSERT INTO escalations (source_agent, severity, type, title, description, reference_id)
       VALUES ('wajeeha_pipeline', 'critical', 'missing_data', 'Demo not found', $1, $2)`,
      [`Pipeline triggered for demo_id ${demoId} but record does not exist`, demoId]
    );
    throw new PipelineError('DEMO_NOT_FOUND', `Demo ${demoId} does not exist`, demoId);
  }

  await pool.query(
    `UPDATE conducted_demo_sessions SET analysis_status = 'in_progress' WHERE demo_id = $1`,
    [demoId]
  );

  return result.rows[0];
}
