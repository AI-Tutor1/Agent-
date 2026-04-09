// Step 11 — Update Teacher Progress
// Type: Pure Code. Zero AI cost.

import { pool } from '../db';

export async function step11UpdateTeacher(analysisId: string): Promise<void> {
  await pool.query(
    `UPDATE teacher_profiles tp SET
       avg_analyst_rating = (
         SELECT AVG(analyst_rating)
         FROM demo_analysis
         WHERE teacher_name = tp.teacher_name AND analyst_rating IS NOT NULL
       ),
       total_demos = (
         SELECT COUNT(*)
         FROM demo_analysis
         WHERE teacher_name = tp.teacher_name
       ),
       conversion_rate = (
         SELECT COUNT(*) FILTER (WHERE conversion_status = 'Converted') * 100.0
           / NULLIF(COUNT(*), 0)
         FROM demo_analysis
         WHERE teacher_name = tp.teacher_name
       ),
       updated_at = NOW()
     WHERE teacher_name = (
       SELECT teacher_name FROM demo_analysis WHERE analysis_id = $1
     )`,
    [analysisId]
  );
}
