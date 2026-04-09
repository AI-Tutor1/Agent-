// Step 5 — Fetch Student Feedback
// Type: Pure Code. Zero AI cost.

import { pool } from '../db';
import { DemoFeedback, ConductedDemoSession } from './types';
import { matchDemoToFeedback } from '../sync/fuzzy-match';
import { flagDataIntegrity } from '../sync/sheets-client';

export async function step5FetchFeedback(
  demo: ConductedDemoSession,
  analysisId: string
): Promise<DemoFeedback | null> {
  const feedbackResult = await pool.query<DemoFeedback>(
    `SELECT * FROM demo_feedback ORDER BY created_at DESC`
  );

  if (feedbackResult.rows.length === 0) {
    await flagDataIntegrity({
      source_table: 'demo_feedback',
      source_id: demo.demo_id,
      flag_type: 'unmatched_record',
      description: `No feedback records in DB for demo ${demo.demo_id} (${demo.teacher_name} / ${demo.student_name})`,
    });
    return null;
  }

  const demoDate = demo.demo_date ? new Date(demo.demo_date) : new Date();
  const sessions = [{ demo_id: demo.demo_id, teacher_name: demo.teacher_name, student_name: demo.student_name, demo_date: demoDate }];

  // Find the best matching feedback record
  let bestFeedback: DemoFeedback | null = null;
  let bestConfidence: 'exact' | 'fuzzy' | 'unmatched' = 'unmatched';
  let foundExact = false;

  for (const fb of feedbackResult.rows) {
    if (foundExact) break;
    const fbDate = fb.session_date ? new Date(fb.session_date) : demoDate;
    const matchResult = matchDemoToFeedback(
      fb.tutor_name ?? '',
      fb.student_name ?? '',
      fbDate,
      sessions
    );
    if (matchResult.match_confidence === 'exact') {
      bestFeedback = fb;
      bestConfidence = 'exact';
      foundExact = true;
    } else if (matchResult.match_confidence === 'fuzzy' && !foundExact) {
      bestFeedback = fb;
      bestConfidence = 'fuzzy';
    }
  }

  if (bestFeedback) {
    await pool.query(
      `UPDATE demo_feedback SET matched_demo_id = $1, match_confidence = $2 WHERE feedback_id = $3`,
      [demo.demo_id, bestConfidence, bestFeedback.feedback_id]
    );
    await pool.query(
      `UPDATE demo_analysis SET feedback_source_id = $1 WHERE analysis_id = $2`,
      [bestFeedback.feedback_id, analysisId]
    );
  } else {
    await flagDataIntegrity({
      source_table: 'demo_feedback',
      source_id: demo.demo_id,
      flag_type: 'unmatched_record',
      description: `No matching feedback for demo ${demo.demo_id} (${demo.teacher_name} / ${demo.student_name} on ${demo.demo_date})`,
    });
  }

  return bestFeedback;
}
