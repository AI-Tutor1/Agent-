// Step 6 — Rating Standardization
// Type: Pure Code. Zero AI cost. One line of math.

import { pool } from '../db';
import { DemoFeedback } from './types';

export function convertRating(rawRating: number): number {
  return Math.ceil(rawRating / 2); // 10→5, 9→5, 8→4, 7→4, 6→3, 5→3, 4→2, 3→2, 2→1, 1→1
}

export async function step6RatingStandardization(
  analysisId: string,
  feedback: DemoFeedback | null
): Promise<void> {
  if (!feedback || feedback.overall_rating_10 === null || feedback.overall_rating_10 === undefined) {
    return;
  }

  const raw = feedback.overall_rating_10;
  const converted = convertRating(raw);

  await pool.query(
    `UPDATE demo_analysis SET student_rating_raw = $1, student_rating_converted = $2 WHERE analysis_id = $3`,
    [raw, converted, analysisId]
  );
}
