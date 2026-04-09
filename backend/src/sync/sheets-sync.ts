// sheets-sync.ts — Google Sheets to PostgreSQL sync functions

import { pool } from '../db';
import { getSheetData, getSheetTabs, logSync, flagDataIntegrity } from './sheets-client';
import { matchDemoToFeedback } from './fuzzy-match';

const SHEET_IDS = {
  CONDUCTED_DEMOS:       '1mmeidiQdNMrUcgTPGAIqydjgIKoIEjvAB0DUZDHjVXo',
  DEMO_FEEDBACK:         '187Y-zBiHhyW9sbSfxxQeWCZiAKgvMD5ClmKZDIN0BBk',
  DEMO_CONVERSION_SALES: '1Frhd1bKUKuQXu-5hpUJ6kxJbI9iv9gInl2I8Sw-AUw0',
  COUNSELING_PRODUCT:    '1DkNhYdGzsBNWe-hP1CTc2ySp9daFOhOiZj6yAPQnXok',
};

interface SyncResult {
  rows_fetched: number;
  rows_inserted: number;
  rows_updated: number;
  errors: number;
}

function generateDemoId(dateStr: string, teacherName: string, studentName: string): string {
  const date = parseDateToYYYYMMDD(dateStr);
  const teacher = (teacherName.split(' ')[0] ?? teacherName).toLowerCase().replace(/\s+/g, '');
  const student = (studentName.split(' ')[0] ?? studentName).toLowerCase().replace(/\s+/g, '');
  return `${date}_${teacher}_${student}`;
}

function parseDateToYYYYMMDD(dateStr: string): string {
  if (!dateStr) return '';
  // Handle various formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, "7 Apr 2026", etc.
  const clean = dateStr.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean.replace(/-/g, '');
  }

  // DD/MM/YYYY or MM/DD/YYYY — treat as DD/MM/YYYY (common in UAE)
  const slashMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
  }

  // Natural language: "7 Apr 2026"
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  return '';
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const yyyymmdd = parseDateToYYYYMMDD(dateStr);
  if (!yyyymmdd || yyyymmdd.length !== 8) return null;
  const y = parseInt(yyyymmdd.slice(0, 4));
  const m = parseInt(yyyymmdd.slice(4, 6)) - 1;
  const d = parseInt(yyyymmdd.slice(6, 8));
  const date = new Date(y, m, d);
  return isNaN(date.getTime()) ? null : date;
}

// ============================================================
// SYNC 1: Conducted Demo Sessions
// ============================================================
export async function syncConductedDemos(): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = { rows_fetched: 0, rows_inserted: 0, rows_updated: 0, errors: 0 };

  const rows = await getSheetData(SHEET_IDS.CONDUCTED_DEMOS);
  result.rows_fetched = rows.length;

  for (const row of rows) {
    const dateStr = row['date'] || row['demo_date'] || row['session_date'] || '';
    const teacherName = row['teacher_name'] || row['teacher'] || '';
    const studentName = row['student_name'] || row['student'] || '';
    const academicLevel = row['academic_level'] || row['level'] || '';
    const subject = row['subject'] || '';
    const demoMonth = row['month'] || row['demo_month'] || '';
    const curriculumBoard = row['curriculum_board'] || row['board'] || '';
    const curriculumCode = row['curriculum_code'] || row['code'] || '';

    // Data integrity: required fields
    if (!teacherName) {
      await flagDataIntegrity({
        source_table: 'conducted_demo_sessions',
        source_id: dateStr || 'unknown',
        flag_type: 'missing_field',
        field_name: 'teacher_name',
        description: `Row missing teacher_name. Date: ${dateStr}, Student: ${studentName}`,
      });
      result.errors++;
      continue;
    }

    if (!studentName) {
      await flagDataIntegrity({
        source_table: 'conducted_demo_sessions',
        source_id: dateStr || 'unknown',
        flag_type: 'missing_field',
        field_name: 'student_name',
        description: `Row missing student_name. Date: ${dateStr}, Teacher: ${teacherName}`,
      });
      result.errors++;
      continue;
    }

    if (!subject) {
      await flagDataIntegrity({
        source_table: 'conducted_demo_sessions',
        source_id: `${dateStr}_${teacherName}`,
        flag_type: 'missing_field',
        field_name: 'subject',
        description: `Row missing subject. Teacher: ${teacherName}, Student: ${studentName}`,
      });
      // Don't skip — subject missing is a warning, not a blocker
    }

    const demoId = generateDemoId(dateStr, teacherName, studentName);
    if (!demoId || demoId.startsWith('_')) {
      await flagDataIntegrity({
        source_table: 'conducted_demo_sessions',
        source_id: `${dateStr}_${teacherName}`,
        flag_type: 'format_error',
        description: `Could not parse date: "${dateStr}" for teacher: ${teacherName}`,
      });
      result.errors++;
      continue;
    }

    const demoDate = parseDate(dateStr);

    try {
      const existing = await pool.query(
        `SELECT demo_id, teacher_name, student_name, academic_level, subject, curriculum_board, curriculum_code
         FROM conducted_demo_sessions WHERE demo_id = $1`,
        [demoId]
      );

      if (existing.rows.length === 0) {
        // Check for duplicate demo_id conflicts (different data, same key)
        await pool.query(
          `INSERT INTO conducted_demo_sessions
            (demo_id, demo_date, demo_month, teacher_name, student_name,
             academic_level, subject, curriculum_board, curriculum_code, analysis_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')`,
          [demoId, demoDate, demoMonth || null, teacherName, studentName,
           academicLevel || null, subject || null, curriculumBoard || null, curriculumCode || null]
        );
        result.rows_inserted++;
      } else {
        const e = existing.rows[0];
        const changed =
          e.teacher_name !== teacherName ||
          e.student_name !== studentName ||
          (e.academic_level ?? '') !== academicLevel ||
          (e.subject ?? '') !== subject ||
          (e.curriculum_board ?? '') !== curriculumBoard ||
          (e.curriculum_code ?? '') !== curriculumCode;

        if (changed) {
          await pool.query(
            `UPDATE conducted_demo_sessions
             SET teacher_name=$1, student_name=$2, academic_level=$3, subject=$4,
                 curriculum_board=$5, curriculum_code=$6, synced_at=NOW()
             WHERE demo_id=$7`,
            [teacherName, studentName, academicLevel || null, subject || null,
             curriculumBoard || null, curriculumCode || null, demoId]
          );
          result.rows_updated++;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[sync-demos] Error processing row for ${demoId}: ${message}`);
      result.errors++;
    }
  }

  await logSync({
    sheet_name: 'Conducted Demo Sessions',
    sheet_id: SHEET_IDS.CONDUCTED_DEMOS,
    ...result,
    duration_ms: Date.now() - start,
    status: result.errors > 0 && result.rows_inserted + result.rows_updated === 0 ? 'failed'
           : result.errors > 0 ? 'partial' : 'success',
  });

  return result;
}

// ============================================================
// SYNC 2: Demo Feedback
// ============================================================
export async function syncDemoFeedback(): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = { rows_fetched: 0, rows_inserted: 0, rows_updated: 0, errors: 0 };

  const rows = await getSheetData(SHEET_IDS.DEMO_FEEDBACK);
  result.rows_fetched = rows.length;

  // Fetch all demo sessions for matching
  const sessionsResult = await pool.query(
    `SELECT demo_id, teacher_name, student_name, demo_date FROM conducted_demo_sessions`
  );
  const sessions = sessionsResult.rows as Array<{
    demo_id: string; teacher_name: string; student_name: string; demo_date: Date;
  }>;

  for (const row of rows) {
    const timestamp = row['timestamp'] || '';
    const tutorName = row['tutor_name'] || row['teacher_name'] || row['teacher'] || '';
    const studentName = row['student_name'] || row['student'] || '';
    const subject = row['subject'] || '';
    const sessionDate = row['session_date'] || row['date'] || '';
    const overallRating = parseInt(row['overall_rating_10'] || row['rating'] || '0') || null;
    const topicExplained = row['topic_explained'] || row['topic'] || '';
    const participation = row['participation'] || '';
    const confusionMoments = row['confusion_moments'] || row['confusion'] || '';
    const discomfortMoments = row['discomfort_moments'] || row['discomfort'] || '';
    const positiveEnvironment = parseInt(row['positive_environment'] || '0') || null;
    const suggestions = row['suggestions'] || '';
    const commentsOther = row['comments_other'] || row['comments'] || '';

    if (!tutorName || !studentName || !timestamp) {
      result.errors++;
      continue;
    }

    // Check for existing record by composite key
    const existing = await pool.query(
      `SELECT feedback_id FROM demo_feedback
       WHERE tutor_name = $1 AND student_name = $2 AND timestamp::text LIKE $3`,
      [tutorName, studentName, `%${timestamp.slice(0, 10)}%`]
    );

    if (existing.rows.length > 0) {
      // Already synced
      continue;
    }

    // Attempt fuzzy match to demo sessions
    const parsedDate = parseDate(sessionDate || timestamp.split(' ')[0] || '');
    let matchedDemoId: string | null = null;
    let matchConfidence: 'exact' | 'fuzzy' | 'unmatched' = 'unmatched';

    if (parsedDate) {
      const matchResult = matchDemoToFeedback(tutorName, studentName, parsedDate, sessions);
      matchedDemoId = matchResult.match_confidence !== 'unmatched' ? matchResult.demo_id : null;
      matchConfidence = matchResult.match_confidence;
    }

    if (matchConfidence === 'unmatched') {
      await flagDataIntegrity({
        source_table: 'demo_feedback',
        source_id: `${tutorName}_${studentName}_${timestamp}`,
        flag_type: 'unmatched_record',
        description: `Feedback from ${tutorName}/${studentName} on ${sessionDate} has no matching demo session`,
      });
    }

    try {
      await pool.query(
        `INSERT INTO demo_feedback
          (timestamp, tutor_name, student_name, subject, session_date, overall_rating_10,
           topic_explained, participation, confusion_moments, discomfort_moments,
           positive_environment, suggestions, comments_other, matched_demo_id, match_confidence)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [timestamp || null, tutorName, studentName, subject || null,
         parsedDate || null, overallRating, topicExplained || null, participation || null,
         confusionMoments || null, discomfortMoments || null, positiveEnvironment,
         suggestions || null, commentsOther || null, matchedDemoId, matchConfidence]
      );
      result.rows_inserted++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[sync-feedback] Error inserting feedback: ${message}`);
      result.errors++;
    }
  }

  await logSync({
    sheet_name: 'Demo Feedback Form 2.0',
    sheet_id: SHEET_IDS.DEMO_FEEDBACK,
    ...result,
    duration_ms: Date.now() - start,
    status: result.errors > 0 && result.rows_inserted === 0 ? 'failed'
           : result.errors > 0 ? 'partial' : 'success',
  });

  return result;
}

// ============================================================
// SYNC 3: Demo Conversion Sales
// ============================================================
export async function syncDemoConversionSales(): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = { rows_fetched: 0, rows_inserted: 0, rows_updated: 0, errors: 0 };

  const rows = await getSheetData(SHEET_IDS.DEMO_CONVERSION_SALES);
  result.rows_fetched = rows.length;

  const sessionsResult = await pool.query(
    `SELECT demo_id, teacher_name, student_name, demo_date FROM conducted_demo_sessions`
  );
  const sessions = sessionsResult.rows as Array<{
    demo_id: string; teacher_name: string; student_name: string; demo_date: Date;
  }>;

  for (const row of rows) {
    const dateStr = row['demo_date'] || row['date'] || '';
    const teacherName = row['teacher_name'] || row['teacher'] || '';
    const studentName = row['student_name'] || row['student'] || '';
    const academicLevel = row['academic_level'] || row['level'] || '';
    const subject = row['subject'] || '';
    const conversionStatus = row['conversion_status'] || row['status'] || '';
    const salesComments = row['sales_comments'] || row['comments'] || '';
    const salesAgent = row['sales_agent'] || row['agent'] || '';
    const parentContact = row['parent_contact'] || row['contact'] || '';

    if (!teacherName || !studentName || !dateStr) {
      result.errors++;
      continue;
    }

    // Check for existing record
    const parsedDate = parseDate(dateStr);
    const existing = await pool.query(
      `SELECT id FROM demo_conversion_sales
       WHERE teacher_name = $1 AND student_name = $2 AND demo_date = $3`,
      [teacherName, studentName, parsedDate]
    );

    if (existing.rows.length > 0) {
      continue;
    }

    // Match to demo session
    let matchedDemoId: string | null = null;
    if (parsedDate) {
      const matchResult = matchDemoToFeedback(teacherName, studentName, parsedDate, sessions);
      if (matchResult.match_confidence !== 'unmatched') {
        matchedDemoId = matchResult.demo_id;
      } else {
        await flagDataIntegrity({
          source_table: 'demo_conversion_sales',
          source_id: `${teacherName}_${studentName}_${dateStr}`,
          flag_type: 'unmatched_record',
          description: `Sales record for ${teacherName}/${studentName} on ${dateStr} has no matching demo session`,
        });
      }
    }

    try {
      await pool.query(
        `INSERT INTO demo_conversion_sales
          (demo_date, teacher_name, student_name, academic_level, subject,
           conversion_status, sales_comments, sales_agent, parent_contact, matched_demo_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [parsedDate, teacherName, studentName, academicLevel || null, subject || null,
         conversionStatus || null, salesComments || null, salesAgent || null,
         parentContact || null, matchedDemoId]
      );
      result.rows_inserted++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[sync-sales] Error inserting sales record: ${message}`);
      result.errors++;
    }
  }

  await logSync({
    sheet_name: 'Demo to Conversion Sales',
    sheet_id: SHEET_IDS.DEMO_CONVERSION_SALES,
    ...result,
    duration_ms: Date.now() - start,
    status: result.errors > 0 && result.rows_inserted === 0 ? 'failed'
           : result.errors > 0 ? 'partial' : 'success',
  });

  return result;
}

// ============================================================
// SYNC 4: Counseling Product (multi-tab)
// ============================================================
export async function syncCounselingProduct(): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = { rows_fetched: 0, rows_inserted: 0, rows_updated: 0, errors: 0 };

  const tabs = await getSheetTabs(SHEET_IDS.COUNSELING_PRODUCT);

  for (const tab of tabs) {
    result.rows_fetched += tab.rows.length;
    const tabName = tab.name.toLowerCase().trim();

    if (tabName.includes('demo') && tabName.includes('conversion')) {
      // Route to demo_conversion_sales processing
      for (const row of tab.rows) {
        const dateStr = row['demo_date'] || row['date'] || '';
        const teacherName = row['teacher_name'] || row['teacher'] || '';
        const studentName = row['student_name'] || row['student'] || '';
        const conversionStatus = row['conversion_status'] || row['status'] || '';
        const salesAgent = row['sales_agent'] || row['agent'] || '';

        if (!teacherName || !studentName) continue;

        const parsedDate = parseDate(dateStr);
        try {
          await pool.query(
            `INSERT INTO demo_conversion_sales
              (demo_date, teacher_name, student_name, conversion_status, sales_agent)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT DO NOTHING`,
            [parsedDate, teacherName, studentName, conversionStatus || null, salesAgent || null]
          );
          result.rows_inserted++;
        } catch {
          result.errors++;
        }
      }
    } else if (tabName.includes('pour')) {
      // POUR flags tab — log only; actual flags are generated by pipeline
      console.log(`[sync-counseling] Skipping POUR tab (${tab.name}) — managed by pipeline`);
    } else {
      // Unknown tab — log and skip
      console.log(`[sync-counseling] Unknown tab: "${tab.name}" (${tab.rows.length} rows) — skipped`);
    }
  }

  await logSync({
    sheet_name: 'Counseling Product (Wajeeha)',
    sheet_id: SHEET_IDS.COUNSELING_PRODUCT,
    ...result,
    duration_ms: Date.now() - start,
    status: result.errors > 0 && result.rows_inserted === 0 ? 'failed'
           : result.errors > 0 ? 'partial' : 'success',
  });

  return result;
}

// ============================================================
// MAIN: syncAllSheets()
// ============================================================
export interface AllSheetsSyncSummary {
  sheets_synced: number;
  total_rows: number;
  total_inserted: number;
  total_updated: number;
  errors: number;
  duration_ms: number;
  results: {
    conducted_demos: SyncResult;
    demo_feedback: SyncResult;
    demo_conversion_sales: SyncResult;
    counseling_product: SyncResult;
  };
}

export async function syncAllSheets(): Promise<AllSheetsSyncSummary> {
  const start = Date.now();
  console.log('[sync] Starting full Google Sheets sync...');

  const [demos, feedback, sales, counseling] = await Promise.allSettled([
    syncConductedDemos(),
    syncDemoFeedback(),
    syncDemoConversionSales(),
    syncCounselingProduct(),
  ]);

  const getResult = (settled: PromiseSettledResult<SyncResult>): SyncResult =>
    settled.status === 'fulfilled'
      ? settled.value
      : { rows_fetched: 0, rows_inserted: 0, rows_updated: 0, errors: 1 };

  const r = {
    conducted_demos:       getResult(demos),
    demo_feedback:         getResult(feedback),
    demo_conversion_sales: getResult(sales),
    counseling_product:    getResult(counseling),
  };

  const summary: AllSheetsSyncSummary = {
    sheets_synced: 4,
    total_rows:     r.conducted_demos.rows_fetched + r.demo_feedback.rows_fetched +
                    r.demo_conversion_sales.rows_fetched + r.counseling_product.rows_fetched,
    total_inserted: r.conducted_demos.rows_inserted + r.demo_feedback.rows_inserted +
                    r.demo_conversion_sales.rows_inserted + r.counseling_product.rows_inserted,
    total_updated:  r.conducted_demos.rows_updated + r.demo_feedback.rows_updated +
                    r.demo_conversion_sales.rows_updated + r.counseling_product.rows_updated,
    errors:         r.conducted_demos.errors + r.demo_feedback.errors +
                    r.demo_conversion_sales.errors + r.counseling_product.errors,
    duration_ms: Date.now() - start,
    results: r,
  };

  console.log(`[sync] Complete. ${summary.sheets_synced} sheets, ${summary.total_rows} rows, ` +
    `${summary.total_inserted} inserted, ${summary.total_updated} updated, ${summary.errors} errors ` +
    `(${summary.duration_ms}ms)`);

  return summary;
}
