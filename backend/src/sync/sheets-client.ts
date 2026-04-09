// sheets-client.ts — Google Sheets authentication and data fetching

import { google } from 'googleapis';
import { pool } from '../db';

interface SheetRow {
  [key: string]: string;
}

interface SheetTab {
  name: string;
  rows: SheetRow[];
}

function getAuth() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required');
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(keyJson) as Record<string, unknown>;
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON');
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

function parseRows(values: string[][]): SheetRow[] {
  if (!values || values.length < 2) return [];

  const headers = values[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return values.slice(1).map(row => {
    const obj: SheetRow = {};
    headers.forEach((header, i) => {
      obj[header] = (row[i] ?? '').trim();
    });
    return obj;
  });
}

export async function getSheetData(sheetId: string, range = ''): Promise<SheetRow[]> {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range || 'A:Z',
    });

    return parseRows((response.data.values ?? []) as string[][]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sheets-client] Failed to fetch sheet ${sheetId}: ${message}`);
    return [];
  }
}

export async function getSheetTabs(sheetId: string): Promise<SheetTab[]> {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetNames = (meta.data.sheets ?? []).map(
      s => s.properties?.title ?? ''
    ).filter(Boolean);

    const tabs: SheetTab[] = [];
    for (const name of sheetNames) {
      const rows = await getSheetData(sheetId, `${name}!A:Z`);
      tabs.push({ name, rows });
    }
    return tabs;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sheets-client] Failed to fetch tabs for sheet ${sheetId}: ${message}`);
    return [];
  }
}

export async function logSync(params: {
  sheet_name: string;
  sheet_id: string;
  rows_fetched: number;
  rows_inserted: number;
  rows_updated: number;
  errors: number;
  duration_ms: number;
  status: 'success' | 'partial' | 'failed';
}): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO sync_log
        (sheet_name, sheet_id, rows_fetched, rows_inserted, rows_updated, errors, duration_ms, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [params.sheet_name, params.sheet_id, params.rows_fetched,
       params.rows_inserted, params.rows_updated, params.errors,
       params.duration_ms, params.status]
    );
  } catch (err) {
    console.error('[sheets-client] Failed to write sync_log:', err);
  }
}

export async function flagDataIntegrity(params: {
  source_table: string;
  source_id: string;
  flag_type: 'missing_field' | 'unmatched_record' | 'duplicate' | 'format_error';
  field_name?: string;
  description: string;
}): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO data_integrity_flags
        (source_table, source_id, flag_type, field_name, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [params.source_table, params.source_id, params.flag_type,
       params.field_name ?? null, params.description]
    );
  } catch (err) {
    console.error('[sheets-client] Failed to write data_integrity_flags:', err);
  }
}
