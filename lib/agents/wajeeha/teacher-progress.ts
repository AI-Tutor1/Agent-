import { db } from '../../db'
import { sendNotification } from '../../notifications'
import type { PourFlag } from './pour-classifier'
import type { AccountabilityResult } from './accountability'
import type { RatingResult } from './rating-converter'

const POUR_COLUMN_MAP: Record<string, string> = {
  Video: 'pour_video_count',
  Interaction: 'pour_interaction_count',
  Technical: 'pour_technical_count',
  Cancellation: 'pour_cancellation_count',
  Resources: 'pour_resources_count',
  Time: 'pour_time_count',
  'No Show': 'pour_no_show_count'
}

function teacherIdFromName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')
}

export async function updateTeacherProgress(
  teacherName: string,
  demoDate: string,
  conversionStatus: string | null,
  ratings: RatingResult,
  pourFlags: PourFlag[],
  accountability: AccountabilityResult | null
): Promise<void> {
  const isConverted = conversionStatus === 'Converted'
  const isNotConverted = conversionStatus === 'Not Converted'
  const isPending = !isConverted && !isNotConverted

  const teacherId = teacherIdFromName(teacherName)

  // Upsert teacher_progress record
  await db.query(
    `INSERT INTO teacher_progress
     (teacher_id, teacher_name, total_demos, converted_count, not_converted_count, pending_count,
      avg_student_rating, avg_analyst_rating, last_demo_date)
     VALUES ($1, $2, 1, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (teacher_id) DO UPDATE SET
       total_demos = teacher_progress.total_demos + 1,
       converted_count = teacher_progress.converted_count + $3,
       not_converted_count = teacher_progress.not_converted_count + $4,
       pending_count = teacher_progress.pending_count + $5,
       avg_student_rating = CASE
         WHEN $6 IS NOT NULL THEN
           (COALESCE(teacher_progress.avg_student_rating, 0) * teacher_progress.total_demos + $6)
           / (teacher_progress.total_demos + 1)
         ELSE teacher_progress.avg_student_rating
       END,
       avg_analyst_rating = CASE
         WHEN $7 IS NOT NULL THEN
           (COALESCE(teacher_progress.avg_analyst_rating, 0) * teacher_progress.total_demos + $7)
           / (teacher_progress.total_demos + 1)
         ELSE teacher_progress.avg_analyst_rating
       END,
       last_demo_date = GREATEST(COALESCE(teacher_progress.last_demo_date, $8::date), $8::date),
       updated_at = NOW()`,
    [
      teacherId,
      teacherName,
      isConverted ? 1 : 0,
      isNotConverted ? 1 : 0,
      isPending ? 1 : 0,
      ratings.student_rating_converted,
      ratings.analyst_rating,
      demoDate
    ]
  )

  // Update conversion rate
  await db.query(
    `UPDATE teacher_progress SET
       conversion_rate = CASE
         WHEN (converted_count + not_converted_count) > 0
         THEN ROUND(100.0 * converted_count / (converted_count + not_converted_count), 2)
         ELSE NULL
       END
     WHERE teacher_id = $1`,
    [teacherId]
  )

  // Update POUR category counters
  for (const flag of pourFlags) {
    const col = POUR_COLUMN_MAP[flag.category]
    if (col) {
      await db.query(
        `UPDATE teacher_progress SET ${col} = ${col} + 1 WHERE teacher_id = $1`,
        [teacherId]
      )
    }
  }

  // Product accountability consecutive flag check
  const isProductFlag =
    accountability?.classification === 'Product' ||
    accountability?.classification === 'Mixed'

  if (isProductFlag) {
    await db.query(
      `UPDATE teacher_progress
       SET product_accountability_count = product_accountability_count + 1,
           consecutive_product_flags = consecutive_product_flags + 1
       WHERE teacher_id = $1`,
      [teacherId]
    )

    // Check for 3+ consecutive — set review flag and notify
    const check = await db.query(
      `SELECT consecutive_product_flags FROM teacher_progress WHERE teacher_id = $1`,
      [teacherId]
    )
    if ((check.rows[0]?.consecutive_product_flags as number) >= 3) {
      await db.query(
        `UPDATE teacher_progress SET review_flag = TRUE WHERE teacher_id = $1`,
        [teacherId]
      )
      await sendNotification({
        recipient: 'dawood_agent',
        type: 'teacher_review_required',
        payload: {
          teacher_name: teacherName,
          teacher_id: teacherId,
          reason: '3+ consecutive Product Accountability flags',
          consecutive_count: check.rows[0]?.consecutive_product_flags
        },
        priority: 'high'
      })
    }
  } else {
    // Reset consecutive counter on non-product flag
    await db.query(
      `UPDATE teacher_progress SET consecutive_product_flags = 0 WHERE teacher_id = $1`,
      [teacherId]
    )
  }
}
