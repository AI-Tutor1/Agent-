// Step 3 — POUR Identification
// Type: Pure Code. Rule-based pattern matching. Zero AI cost.

import { pool } from '../db';
import { ConductedDemoSession, DemoFeedback, PourFlag } from './types';

function detectPourFlags(demo: ConductedDemoSession, feedback?: DemoFeedback | null): PourFlag[] {
  const flags: PourFlag[] = [];

  // Video: No matching feedback at all is treated as recording unavailable
  if (!feedback) {
    flags.push({
      category: 'Video',
      severity: 'High',
      description: 'No session recording or feedback available — video confirmation not possible',
    });
  }

  // Interaction: Student participation was explicitly noted as absent
  if (feedback?.participation === 'No' || feedback?.participation === 'no') {
    flags.push({
      category: 'Interaction',
      severity: 'Medium',
      description: 'Student participation below threshold — feedback form indicates no active participation',
    });
  }

  // Resources: Topic not explained or no materials provided
  if (feedback?.topic_explained === 'No' || feedback?.topic_explained === 'no') {
    flags.push({
      category: 'Resources',
      severity: 'Medium',
      description: 'Topic not adequately explained — no supplementary materials or inadequate coverage reported',
    });
  }

  // Technical: Very low positive environment rating suggests technical/environmental issues
  if (feedback?.positive_environment !== null &&
      feedback?.positive_environment !== undefined &&
      feedback.positive_environment <= 2) {
    flags.push({
      category: 'Technical',
      severity: 'Medium',
      description: `Low environment rating (${feedback.positive_environment}/5) — possible connection or technical issues`,
    });
  }

  // No Show: Very low rating with discomfort moments and no participation
  if (feedback &&
      feedback.overall_rating_10 !== null &&
      feedback.overall_rating_10 <= 2 &&
      feedback.discomfort_moments &&
      feedback.participation === 'No') {
    flags.push({
      category: 'No Show',
      severity: 'High',
      description: 'Combination of minimal rating, discomfort noted, and no participation suggests partial or full no-show',
    });
  }

  // Cancellation: Check subject/level missing — may indicate session was incomplete
  if (!demo.subject && !demo.academic_level) {
    flags.push({
      category: 'Cancellation',
      severity: 'High',
      description: 'Session recorded with no subject or academic level — may indicate cancellation before start',
    });
  }

  return flags;
}

export async function step3IdentifyPour(
  demo: ConductedDemoSession,
  analysisId: string,
  feedback?: DemoFeedback | null
): Promise<PourFlag[]> {
  const flags = detectPourFlags(demo, feedback);

  if (flags.length > 0) {
    for (const flag of flags) {
      await pool.query(
        `INSERT INTO pour_flags (analysis_id, demo_id, category, severity, description, teacher_name)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [analysisId, demo.demo_id, flag.category, flag.severity, flag.description, demo.teacher_name]
      );
    }

    const categories = flags.map(f => f.category);
    await pool.query(
      `UPDATE demo_analysis SET pour_present = true, pour_categories = $1 WHERE analysis_id = $2`,
      [categories, analysisId]
    );
  } else {
    await pool.query(
      `UPDATE demo_analysis SET pour_present = false, pour_categories = '{}' WHERE analysis_id = $1`,
      [analysisId]
    );
  }

  return flags;
}
