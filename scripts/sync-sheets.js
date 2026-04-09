#!/usr/bin/env node
// sync-sheets.js — Cron script for Google Sheets sync
// Usage: DATABASE_URL=... GOOGLE_SERVICE_ACCOUNT_KEY='...' node scripts/sync-sheets.js
//
// Crontab entry (every 15 minutes):
// */15 * * * * cd /path/to/backend && DATABASE_URL=... GOOGLE_SERVICE_ACCOUNT_KEY=... node ../scripts/sync-sheets.js >> /var/log/tuitional/sync.log 2>&1

const path = require('path');

// Register ts-node to allow importing TypeScript modules directly
require('ts-node').register({
  project: path.join(__dirname, '..', 'backend', 'tsconfig.json'),
  transpileOnly: true,
});

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const { syncAllSheets } = require('../backend/src/sync/sheets-sync');

async function main() {
  const started = new Date().toISOString();
  console.log(`[${started}] Starting Google Sheets sync...`);

  try {
    const summary = await syncAllSheets();
    console.log(`[${new Date().toISOString()}] Sync complete:`, JSON.stringify({
      sheets_synced: summary.sheets_synced,
      total_rows: summary.total_rows,
      total_inserted: summary.total_inserted,
      total_updated: summary.total_updated,
      errors: summary.errors,
      duration_ms: summary.duration_ms,
    }));
    process.exit(0);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Sync FAILED:`, err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
