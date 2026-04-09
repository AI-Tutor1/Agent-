import { Router } from 'express';
import { pool } from '../db';
import { syncAllSheets } from '../sync/sheets-sync';

const router = Router();

// POST /api/sync/trigger — manually trigger full sync
router.post('/trigger', async (_req, res) => {
  try {
    const summary = await syncAllSheets();
    res.json({ status: 'ok', ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sync/trigger] Error:', message);
    res.status(500).json({ error: 'Sync failed', message });
  }
});

// GET /api/sync/status — last sync timestamp and status per sheet
router.get('/status', async (_req, res) => {
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

export default router;
