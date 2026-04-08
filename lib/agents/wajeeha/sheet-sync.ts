import { db } from '../../db'
import {
  readSheet,
  parseFlexibleDate,
  normaliseName,
  generateDemoId
} from '../../integrations/google-sheets'
import { logAgentActivity } from '../../db/activity-log'

export interface SyncStats {
  sheet_name: string
  rows_read: number
  rows_upserted: number
  rows_failed: number
  integrity_flags: number
  duration_ms: number
}

// ============================================================
// SYNC: Conducted Demo Sessions
// ============================================================
export async function syncConductedDemos(): Promise<SyncStats> {
  const start = Date.now()
  const stats: SyncStats = {
    sheet_name: 'conducted_demo_sessions',
    rows_read: 0,
    rows_upserted: 0,
    rows_failed: 0,
    integrity_flags: 0,
    duration_ms: 0
  }

  try {
    const sheetId = process.env.SHEET_CONDUCTED_DEMOS!
    const rows = await readSheet(sheetId, 'Sheet1')
    stats.rows_read = rows.length

    for (const row of rows) {
      try {
        const rawDate = row['Date'] || row['date'] || row['Demo Date'] || null
        const parsedDate = parseFlexibleDate(rawDate)
        const teacherName = normaliseName(row['Teacher Name'] || row['Tutor Name'] || null)
        const studentName = normaliseName(row['Student Name'] || row['Student'] || null)
        const month = row['Month'] || row['month'] || null
        const level = row['Level'] || row['Academic Level'] || null
        const subject = row['Subject'] || null
        let demoId = row['Demo ID'] || row['demo_id'] || null

        // Validate required fields
        if (!parsedDate || !teacherName || !studentName) {
          await db.query(
            `INSERT INTO data_integrity_flags (demo_id, issue_type, description) VALUES ($1, $2, $3)`,
            [
              demoId || 'unknown',
              'missing_required_field',
              `Row missing required field(s): date=${rawDate}, teacher=${teacherName}, student=${studentName}`
            ]
          )
          stats.integrity_flags++
          stats.rows_failed++
          continue
        }

        // Generate demo_id if not present
        if (!demoId) {
          demoId = generateDemoId(parsedDate, teacherName, studentName)
        }

        await db.query(
          `INSERT INTO conducted_demo_sessions
           (demo_id, demo_date, demo_month, teacher_name, student_name, academic_level, subject, synced_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (demo_id) DO UPDATE SET
             demo_date = EXCLUDED.demo_date,
             demo_month = EXCLUDED.demo_month,
             teacher_name = EXCLUDED.teacher_name,
             student_name = EXCLUDED.student_name,
             academic_level = EXCLUDED.academic_level,
             subject = EXCLUDED.subject,
             synced_at = NOW()`,
          [demoId, parsedDate, month, teacherName, studentName, level, subject]
        )
        stats.rows_upserted++
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        stats.rows_failed++
        await db.query(
          `INSERT INTO data_integrity_flags (issue_type, description) VALUES ($1, $2)`,
          ['sync_row_error', `Conducted demos row error: ${message}`]
        ).catch(() => {}) // non-blocking
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    stats.rows_failed++
    await logAgentActivity({
      agent_name: 'wajeeha_agent',
      action_type: 'sheet_sync_failed',
      details: { sheet: 'conducted_demo_sessions', error: message },
      status: 'failed',
      error_message: message
    })
  }

  stats.duration_ms = Date.now() - start
  return stats
}

// ============================================================
// SYNC: Demo Feedback Form
// ============================================================
export async function syncDemoFeedback(): Promise<SyncStats> {
  const start = Date.now()
  const stats: SyncStats = {
    sheet_name: 'demo_feedback',
    rows_read: 0,
    rows_upserted: 0,
    rows_failed: 0,
    integrity_flags: 0,
    duration_ms: 0
  }

  try {
    const sheetId = process.env.SHEET_DEMO_FEEDBACK!
    const rows = await readSheet(sheetId, 'Form Responses 1')
    stats.rows_read = rows.length

    for (const row of rows) {
      try {
        const timestamp = row['Timestamp'] || row['timestamp'] || null
        const tutorName = normaliseName(row['Tutor Name'] || row['Tutor'] || null)
        const studentName = normaliseName(row['Student/Parent Name'] || row['Student Name'] || null)
        const subject = row['Subject'] || null
        const rawDate = row['Date'] || row['Session Date'] || null
        const parsedDate = parseFlexibleDate(rawDate)
        const ratingRaw = row['Overall Rating (1-10)'] || row['Overall Rating'] || null
        const rating = ratingRaw ? parseInt(ratingRaw, 10) : null
        const topicExplained = row['Topic Explained (Yes/No)'] || row['Topic Explained'] || null
        const participation = row['Participation (Yes/No)'] || row['Participation'] || null
        const confusionMoments = row['Confusion Moments'] || null
        const discomfort = row['Discomfort'] || null
        const positiveEnvRaw = row['Positive Environment (1-5)'] || row['Positive Environment'] || null
        const positiveEnv = positiveEnvRaw ? parseInt(positiveEnvRaw, 10) : null
        const suggestions = row['Suggestions'] || null
        const comments = row['Comments'] || null

        if (!timestamp && !tutorName) {
          stats.rows_failed++
          continue
        }

        // Upsert on timestamp + tutor_name composite
        await db.query(
          `INSERT INTO demo_feedback
           (timestamp, tutor_name, student_name, subject, session_date, overall_rating_10,
            topic_explained, participation, confusion_moments, discomfort_moments,
            positive_environment, suggestions, comments_other)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT DO NOTHING`,
          [
            timestamp, tutorName, studentName, subject, parsedDate, rating,
            topicExplained, participation, confusionMoments, discomfort,
            positiveEnv, suggestions, comments
          ]
        )
        stats.rows_upserted++
      } catch (err: unknown) {
        stats.rows_failed++
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    await logAgentActivity({
      agent_name: 'wajeeha_agent',
      action_type: 'sheet_sync_failed',
      details: { sheet: 'demo_feedback', error: message },
      status: 'failed',
      error_message: message
    })
  }

  stats.duration_ms = Date.now() - start
  return stats
}

// ============================================================
// SYNC: Counseling Product Sheet (Demo to Conversion tab)
// ============================================================
export async function syncCounselingProduct(): Promise<SyncStats> {
  const start = Date.now()
  const stats: SyncStats = {
    sheet_name: 'counseling_demo_to_conversion',
    rows_read: 0,
    rows_upserted: 0,
    rows_failed: 0,
    integrity_flags: 0,
    duration_ms: 0
  }

  try {
    const sheetId = process.env.SHEET_COUNSELING_PRODUCT!
    const rows = await readSheet(sheetId, 'Demo to Conversion')
    stats.rows_read = rows.length

    for (const row of rows) {
      try {
        const rawDate = row['Date'] || row['date'] || null
        const parsedDate = parseFlexibleDate(rawDate)
        const teacherName = normaliseName(row['Teacher Name'] || row['Tutor Name'] || null)
        const teacherId = row['Teacher ID'] || null
        const level = row['Level'] || null
        const subject = row['Subject'] || null
        const conversionFlag = row['Conversion Flag'] || null
        const pourIssues = row['POUR Issues'] || null
        const studentName = normaliseName(row['Student Name'] || row['Student'] || null)
        const studentRatingRaw = row['Student Rating'] || null
        const studentRating = studentRatingRaw ? parseInt(studentRatingRaw, 10) : null
        const analystRatingRaw = row['Analyst Rating'] || null
        const analystRating = analystRatingRaw ? parseInt(analystRatingRaw, 10) : null

        await db.query(
          `INSERT INTO counseling_demo_to_conversion
           (demo_date, teacher_name, teacher_id, academic_level, subject, conversion_flag, pour_issues, student_name, student_rating, analyst_rating, synced_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())`,
          [parsedDate, teacherName, teacherId, level, subject, conversionFlag, pourIssues, studentName, studentRating, analystRating]
        )
        stats.rows_upserted++
      } catch {
        stats.rows_failed++
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    await logAgentActivity({
      agent_name: 'wajeeha_agent',
      action_type: 'sheet_sync_failed',
      details: { sheet: 'counseling_demo_to_conversion', error: message },
      status: 'failed',
      error_message: message
    })
  }

  stats.duration_ms = Date.now() - start
  return stats
}

// ============================================================
// SYNC: Demo to Conversion Sales
// ============================================================
export async function syncDemoConversionSales(): Promise<SyncStats> {
  const start = Date.now()
  const stats: SyncStats = {
    sheet_name: 'demo_conversion_sales',
    rows_read: 0,
    rows_upserted: 0,
    rows_failed: 0,
    integrity_flags: 0,
    duration_ms: 0
  }

  try {
    const sheetId = process.env.SHEET_DEMO_CONVERSION_SALES!
    const rows = await readSheet(sheetId, 'Demos')
    stats.rows_read = rows.length

    for (const row of rows) {
      try {
        const rawDate = row['Date'] || row['date'] || null
        const parsedDate = parseFlexibleDate(rawDate)
        const teacherName = normaliseName(row['Teacher Name'] || row['Tutor Name'] || null)
        const studentName = normaliseName(row['Student Name'] || row['Student'] || null)
        const level = row['Level'] || null
        const subject = row['Subject'] || null
        const conversionStatus = row['Conversion Status'] || row['Status'] || null
        const salesComments = row['Sales Comments'] || row['Comments'] || null
        const salesAgent = row['Sales Agent'] || row['Agent'] || null
        const parentContact = row['Parent Contact'] || null

        if (!teacherName || !studentName) {
          stats.rows_failed++
          continue
        }

        await db.query(
          `INSERT INTO demo_conversion_sales
           (demo_date, teacher_name, student_name, academic_level, subject, conversion_status, sales_comments, sales_agent, parent_contact, synced_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
           ON CONFLICT DO NOTHING`,
          [parsedDate, teacherName, studentName, level, subject, conversionStatus, salesComments, salesAgent, parentContact]
        )
        stats.rows_upserted++
      } catch {
        stats.rows_failed++
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    await logAgentActivity({
      agent_name: 'wajeeha_agent',
      action_type: 'sheet_sync_failed',
      details: { sheet: 'demo_conversion_sales', error: message },
      status: 'failed',
      error_message: message
    })
  }

  stats.duration_ms = Date.now() - start
  return stats
}

// ============================================================
// SYNC ALL — runs all 4 syncs, returns aggregate stats
// ============================================================
export async function syncAllSheets(): Promise<{
  sheets_synced: number
  rows_upserted: number
  rows_failed: number
  data_integrity_flags_created: number
  duration_ms: number
  results: SyncStats[]
}> {
  const start = Date.now()

  const results = await Promise.allSettled([
    syncConductedDemos(),
    syncDemoFeedback(),
    syncCounselingProduct(),
    syncDemoConversionSales()
  ])

  const stats = results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          sheet_name: 'unknown',
          rows_read: 0,
          rows_upserted: 0,
          rows_failed: 1,
          integrity_flags: 0,
          duration_ms: 0
        }
  )

  await logAgentActivity({
    agent_name: 'wajeeha_agent',
    action_type: 'sheets_sync_complete',
    details: { stats },
    status: 'success',
    duration_ms: Date.now() - start
  })

  return {
    sheets_synced: 4,
    rows_upserted: stats.reduce((s, r) => s + r.rows_upserted, 0),
    rows_failed: stats.reduce((s, r) => s + r.rows_failed, 0),
    data_integrity_flags_created: stats.reduce((s, r) => s + r.integrity_flags, 0),
    duration_ms: Date.now() - start,
    results: stats
  }
}
