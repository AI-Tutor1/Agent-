// Step 7 — Export to Sales Sheet
// Type: Pure Code. Zero AI cost.

import { pool } from '../db';
import { ConductedDemoSession } from './types';

export async function step7ExportToSales(
  demo: ConductedDemoSession,
  analysisId: string
): Promise<void> {
  // Write/update record in demo_conversion_sales — marks it as ready for sales team
  await pool.query(
    `INSERT INTO demo_conversion_sales
      (demo_date, teacher_name, student_name, academic_level, subject,
       conversion_status, matched_demo_id)
     VALUES ($1, $2, $3, $4, $5, 'Pending', $6)
     ON CONFLICT DO NOTHING`,
    [demo.demo_date, demo.teacher_name, demo.student_name,
     demo.academic_level, demo.subject, demo.demo_id]
  );
}
