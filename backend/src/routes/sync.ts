import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { syncAllSheets } from '../sync/sheets-sync';
import { logSync, flagDataIntegrity } from '../sync/sheets-client';
import { matchDemoToFeedback } from '../sync/fuzzy-match';
import { webhookAuth } from '../middleware/auth';
import { syncLimiter, webhookLimiter } from '../middleware/rate-limit';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDateToISO(raw: unknown): string | null {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!str) return null;

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // DD/MM/YYYY (UAE format)
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`;
  }

  // ISO datetime from Apps Script
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) return str.split('T')[0]!;

  // Natural language
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]!;
  }

  return null;
}

function generateDemoId(dateStr: string | null, teacherName: string, studentName: string): string {
  const date = (dateStr ?? '').replace(/-/g, '');
  const teacher = (teacherName.split(' ')[0] ?? teacherName).toLowerCase().replace(/[^a-z0-9]/g, '');
  const student = (studentName.split(' ')[0] ?? studentName).toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${date}_${teacher}_${student}`;
}

function sanitizeString(val: unknown, maxLen = 500): string {
  if (val === null || val === undefined) return '';
  return String(val).slice(0, maxLen);
}

// ── POST /api/sync/trigger — pull-based sync (requires service account) ───────

router.post('/trigger', syncLimiter, async (_req: Request, res: Response) => {
  const hasServiceAccount = !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!hasServiceAccount) {
    res.json({
      message: 'Pull sync not configured. Use webhook sync from Google Apps Script instead.',
      webhook_endpoints: [
        '/api/sync/webhook/conducted-demos',
        '/api/sync/webhook/demo-feedback',
        '/api/sync/webhook/conversion-sales',
        '/api/sync/webhook/counseling-product',
      ],
    });
    return;
  }

  try {
    const summary = await syncAllSheets();
    res.json({ status: 'ok', ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sync/trigger] Error:', message);
    res.status(500).json({ error: 'Sync failed', message });
  }
});

// ── GET /api/sync/status ──────────────────────────────────────────────────────

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (sheet_name)
        sheet_name, sheet_id, rows_fetched, rows_inserted, rows_updated,
        errors, duration_ms, status, created_at AS last_synced_at
       FROM sync_log
       ORDER BY sheet_name, created_at DESC`
    );
    res.json({ sheets: result.rows });
  } catch (err) {
    console.error('[sync/status] Error:', err);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

// ── POST /api/sync/webhook/conducted-demos ────────────────────────────────────

router.post('/webhook/conducted-demos', webhookLimiter, webhookAuth, async (req: Request, res: Response) => {
  const start = Date.now();
  const rows: Record<string, unknown>[] = Array.isArray(req.body?.rows) ? req.body.rows : [];

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const teacherName = sanitizeString(row['teacher_name'] ?? row['teacher'] ?? row['tutor_name'] ?? '');
      const studentName = sanitizeString(row['student_name'] ?? row['student'] ?? '');
      const rawDate = row['date'] ?? row['demo_date'] ?? row['session_date'] ?? '';
      const demoDate = parseDateToISO(rawDate);

      if (!teacherName || !studentName || !demoDate) {
        errors++;
        await flagDataIntegrity({
          source_table: 'conducted_demo_sessions',
          source_id: String(row['demo_id'] ?? 'unknown'),
          flag_type: 'missing_field',
          description: `Missing required field — teacher: "${teacherName}", student: "${studentName}", date: "${demoDate}"`,
        });
        continue;
      }

      const demoId = generateDemoId(demoDate, teacherName, studentName);

      const existing = await pool.query(
        `SELECT demo_id FROM conducted_demo_sessions WHERE demo_id = $1`,
        [demoId]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO conducted_demo_sessions
            (demo_id, demo_date, demo_month, teacher_name, student_name,
             academic_level, subject, curriculum_board, curriculum_code, analysis_status, synced_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW())`,
          [
            demoId,
            demoDate,
            sanitizeString(row['month'] ?? row['demo_month'] ?? ''),
            teacherName,
            studentName,
            sanitizeString(row['academic_level'] ?? row['level'] ?? ''),
            sanitizeString(row['subject'] ?? ''),
            sanitizeString(row['curriculum_board'] ?? row['board'] ?? ''),
            sanitizeString(row['curriculum_code'] ?? row['code'] ?? ''),
          ]
        );
        inserted++;
      } else {
        await pool.query(
          `UPDATE conducted_demo_sessions
           SET demo_date = $2, teacher_name = $3, student_name = $4,
               academic_level = $5, subject = $6, synced_at = NOW()
           WHERE demo_id = $1`,
          [demoId, demoDate, teacherName, studentName,
           sanitizeString(row['academic_level'] ?? row['level'] ?? ''),
           sanitizeString(row['subject'] ?? '')]
        );
        updated++;
      }
    } catch (err) {
      errors++;
      console.error('[sync/conducted-demos] Row error:', err);
    }
  }

  await logSync({
    sheet_name: 'conducted_demo_sessions',
    sheet_id: process.env.SHEET_CONDUCTED_DEMOS ?? 'webhook',
    rows_fetched: rows.length,
    rows_inserted: inserted,
    rows_updated: updated,
    errors,
    duration_ms: Date.now() - start,
    status: errors === rows.length && rows.length > 0 ? 'failed' : errors > 0 ? 'partial' : 'success',
  });

  res.json({ received: rows.length, inserted, updated, errors });
});

// ── POST /api/sync/webhook/demo-feedback ──────────────────────────────────────

router.post('/webhook/demo-feedback', webhookLimiter, webhookAuth, async (req: Request, res: Response) => {
  const start = Date.now();
  const rows: Record<string, unknown>[] = Array.isArray(req.body?.rows) ? req.body.rows : [];

  let inserted = 0;
  let matched = 0;
  let unmatched = 0;
  let errors = 0;

  // Fetch demo sessions for fuzzy matching
  let demoSessions: Array<{ demo_id: string; teacher_name: string; student_name: string; demo_date: Date }> = [];
  try {
    const sessionResult = await pool.query(
      `SELECT demo_id, teacher_name, student_name, demo_date FROM conducted_demo_sessions ORDER BY demo_date DESC`
    );
    demoSessions = sessionResult.rows.map((r) => ({
      demo_id: r.demo_id as string,
      teacher_name: r.teacher_name as string,
      student_name: r.student_name as string,
      demo_date: new Date(r.demo_date as string),
    }));
  } catch (err) {
    console.error('[sync/demo-feedback] Failed to load demo sessions for matching:', err);
  }

  for (const row of rows) {
    try {
      const tutorName   = sanitizeString(row['tutor_name'] ?? row['teacher_name'] ?? '');
      const studentName = sanitizeString(row['student_name'] ?? row['student'] ?? '');
      const sessionDate = parseDateToISO(row['session_date'] ?? row['date'] ?? '');

      if (!tutorName || !studentName) {
        errors++;
        continue;
      }

      // Fuzzy-match to conducted demo
      let matchedDemoId: string | null = null;
      let matchConfidence: string = 'unmatched';

      if (sessionDate) {
        const matchResult = matchDemoToFeedback(
          tutorName, studentName, new Date(sessionDate), demoSessions
        );
        if (matchResult.match_confidence !== 'unmatched') {
          matchedDemoId    = matchResult.demo_id;
          matchConfidence  = matchResult.match_confidence;
          matched++;
        } else {
          unmatched++;
        }
      } else {
        unmatched++;
      }

      const ratingRaw = row['overall_rating_10'] ?? row['rating'] ?? null;
      const rating    = ratingRaw !== null && ratingRaw !== '' ? parseInt(String(ratingRaw), 10) : null;

      await pool.query(
        `INSERT INTO demo_feedback
          (timestamp, tutor_name, student_name, subject, session_date,
           overall_rating_10, topic_explained, participation, confusion_moments,
           discomfort_moments, positive_environment, suggestions, comments_other,
           matched_demo_id, match_confidence, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())`,
        [
          sanitizeString(row['timestamp'] ?? ''),
          tutorName,
          studentName,
          sanitizeString(row['subject'] ?? ''),
          sessionDate,
          isNaN(rating ?? NaN) ? null : rating,
          sanitizeString(row['topic_explained'] ?? ''),
          sanitizeString(row['participation'] ?? ''),
          sanitizeString(row['confusion_moments'] ?? '', 2000),
          sanitizeString(row['discomfort_moments'] ?? row['moments_of_discomfort'] ?? '', 2000),
          sanitizeString(row['positive_environment'] ?? ''),
          sanitizeString(row['suggestions'] ?? '', 2000),
          sanitizeString(row['comments_other'] ?? row['comments'] ?? '', 2000),
          matchedDemoId,
          matchConfidence,
        ]
      );
      inserted++;
    } catch (err) {
      errors++;
      console.error('[sync/demo-feedback] Row error:', err);
    }
  }

  await logSync({
    sheet_name: 'demo_feedback',
    sheet_id: process.env.SHEET_DEMO_FEEDBACK ?? 'webhook',
    rows_fetched: rows.length,
    rows_inserted: inserted,
    rows_updated: 0,
    errors,
    duration_ms: Date.now() - start,
    status: errors === rows.length && rows.length > 0 ? 'failed' : errors > 0 ? 'partial' : 'success',
  });

  res.json({ received: rows.length, inserted, matched, unmatched, errors });
});

// ── POST /api/sync/webhook/conversion-sales ───────────────────────────────────

router.post('/webhook/conversion-sales', webhookLimiter, webhookAuth, async (req: Request, res: Response) => {
  const start = Date.now();
  const rows: Record<string, unknown>[] = Array.isArray(req.body?.rows) ? req.body.rows : [];

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  // Fetch demo sessions for fuzzy matching
  let demoSessions: Array<{ demo_id: string; teacher_name: string; student_name: string; demo_date: Date }> = [];
  try {
    const sessionResult = await pool.query(
      `SELECT demo_id, teacher_name, student_name, demo_date FROM conducted_demo_sessions ORDER BY demo_date DESC`
    );
    demoSessions = sessionResult.rows.map((r) => ({
      demo_id: r.demo_id as string,
      teacher_name: r.teacher_name as string,
      student_name: r.student_name as string,
      demo_date: new Date(r.demo_date as string),
    }));
  } catch (err) {
    console.error('[sync/conversion-sales] Failed to load demo sessions for matching:', err);
  }

  for (const row of rows) {
    try {
      const teacherName      = sanitizeString(row['teacher_name'] ?? row['teacher'] ?? '');
      const studentName      = sanitizeString(row['student_name'] ?? row['student'] ?? '');
      const demoDate         = parseDateToISO(row['demo_date'] ?? row['date'] ?? '');
      const conversionStatus = sanitizeString(row['conversion_status'] ?? row['status'] ?? '');

      if (!teacherName || !studentName) {
        errors++;
        continue;
      }

      // Fuzzy-match to conducted demo
      let matchedDemoId: string | null = null;
      if (demoDate) {
        const matchResult = matchDemoToFeedback(
          teacherName, studentName, new Date(demoDate), demoSessions
        );
        if (matchResult.match_confidence !== 'unmatched') {
          matchedDemoId = matchResult.demo_id;
        }
      }

      // Upsert: if matched_demo_id exists, update; otherwise insert
      if (matchedDemoId) {
        const existing = await pool.query(
          `SELECT id FROM demo_conversion_sales WHERE matched_demo_id = $1`,
          [matchedDemoId]
        );
        if (existing.rows.length > 0) {
          await pool.query(
            `UPDATE demo_conversion_sales
             SET conversion_status = $1, sales_comments = $2, sales_agent = $3,
                 parent_contact = $4, synced_at = NOW()
             WHERE matched_demo_id = $5`,
            [
              conversionStatus,
              sanitizeString(row['sales_comments'] ?? row['comments'] ?? '', 2000),
              sanitizeString(row['sales_agent'] ?? row['agent'] ?? ''),
              sanitizeString(row['parent_contact'] ?? row['contact'] ?? ''),
              matchedDemoId,
            ]
          );
          updated++;
          continue;
        }
      }

      await pool.query(
        `INSERT INTO demo_conversion_sales
          (demo_date, teacher_name, student_name, academic_level, subject,
           conversion_status, sales_comments, sales_agent, parent_contact,
           matched_demo_id, synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        [
          demoDate,
          teacherName,
          studentName,
          sanitizeString(row['academic_level'] ?? row['level'] ?? ''),
          sanitizeString(row['subject'] ?? ''),
          conversionStatus,
          sanitizeString(row['sales_comments'] ?? row['comments'] ?? '', 2000),
          sanitizeString(row['sales_agent'] ?? row['agent'] ?? ''),
          sanitizeString(row['parent_contact'] ?? row['contact'] ?? ''),
          matchedDemoId,
        ]
      );
      inserted++;
    } catch (err) {
      errors++;
      console.error('[sync/conversion-sales] Row error:', err);
    }
  }

  await logSync({
    sheet_name: 'demo_conversion_sales',
    sheet_id: process.env.SHEET_DEMO_CONVERSION_SALES ?? 'webhook',
    rows_fetched: rows.length,
    rows_inserted: inserted,
    rows_updated: updated,
    errors,
    duration_ms: Date.now() - start,
    status: errors === rows.length && rows.length > 0 ? 'failed' : errors > 0 ? 'partial' : 'success',
  });

  res.json({ received: rows.length, inserted, updated, errors });
});

// ── POST /api/sync/webhook/counseling-product ─────────────────────────────────

router.post('/webhook/counseling-product', webhookLimiter, webhookAuth, async (req: Request, res: Response) => {
  const start = Date.now();
  const tabName: string = sanitizeString(req.body?.tab_name ?? 'unknown');
  const rows: Record<string, unknown>[] = Array.isArray(req.body?.rows) ? req.body.rows : [];

  await logSync({
    sheet_name: `counseling_product:${tabName}`,
    sheet_id: process.env.SHEET_COUNSELING_PRODUCT ?? 'webhook',
    rows_fetched: rows.length,
    rows_inserted: 0,
    rows_updated: 0,
    errors: 0,
    duration_ms: Date.now() - start,
    status: 'success',
  });

  res.json({ received: rows.length, tab: tabName });
});

export default router;
