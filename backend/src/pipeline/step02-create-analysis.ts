// Step 2 — Create Analysis Record
// Type: Pure Code. Zero AI cost.

import { pool } from '../db';
import { ConductedDemoSession } from './types';

export async function step2CreateAnalysis(demo: ConductedDemoSession): Promise<string> {
  const result = await pool.query<{ analysis_id: string }>(
    `INSERT INTO demo_analysis
      (demo_id, demo_date, teacher_name, student_name, academic_level, subject, analysis_status)
     VALUES ($1, $2, $3, $4, $5, $6, 'in_progress')
     RETURNING analysis_id`,
    [demo.demo_id, demo.demo_date, demo.teacher_name, demo.student_name,
     demo.academic_level, demo.subject]
  );

  return result.rows[0].analysis_id;
}
