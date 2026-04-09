// Step 9 — Compile Sheet30 (Aggregate Metrics)
// Type: Pure Code. Zero AI cost.

import { pool } from '../db';

export async function step9CompileSheet30(
  analysisId: string,
  teacherName: string
): Promise<void> {
  // Aggregate context for the current teacher — used in accountability step
  const metrics = await pool.query<{
    total_analyses: string;
    avg_analyst_rating: string;
    conversion_rate: string;
    pour_count: string;
  }>(
    `SELECT
       COUNT(*)::text                                                AS total_analyses,
       AVG(analyst_rating)::text                                    AS avg_analyst_rating,
       (COUNT(*) FILTER (WHERE conversion_status = 'Converted') * 100.0
         / NULLIF(COUNT(*), 0))::text                              AS conversion_rate,
       (SELECT COUNT(*) FROM pour_flags pf
         JOIN demo_analysis da2 ON da2.analysis_id = pf.analysis_id
         WHERE da2.teacher_name = $2)::text                        AS pour_count
     FROM demo_analysis
     WHERE teacher_name = $2`,
    [analysisId, teacherName]
  );

  const row = metrics.rows[0];
  if (!row) return;

  // Store aggregated context in analysis metadata via agent_activity_log
  // (The demo_analysis table doesn't have a metrics column — log to activity)
  await pool.query(
    `INSERT INTO agent_activity_log
      (agent_name, action_type, analysis_id, status, details)
     VALUES ('wajeeha_pipeline', 'step09_compile_sheet30', $1, 'success', $2)`,
    [analysisId, JSON.stringify({
      teacher_total_analyses: row.total_analyses,
      teacher_avg_analyst_rating: row.avg_analyst_rating,
      teacher_conversion_rate: row.conversion_rate,
      teacher_pour_count: row.pour_count,
    })]
  );
}
