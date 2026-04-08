import { google } from 'googleapis'

export interface SheetRow {
  [key: string]: string | null
}

function getAuth(readonly: boolean = true) {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!keyJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set')
  }

  let credentials: object
  try {
    credentials = JSON.parse(keyJson)
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON')
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      readonly
        ? 'https://www.googleapis.com/auth/spreadsheets.readonly'
        : 'https://www.googleapis.com/auth/spreadsheets'
    ]
  })
}

export async function readSheet(
  spreadsheetId: string,
  sheetName: string,
  range: string = 'A:Z'
): Promise<SheetRow[]> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!${range}`
  })

  const rows = response.data.values
  if (!rows || rows.length < 2) {
    return []
  }

  const headers = (rows[0] as string[]).map((h) => h?.trim() || '')
  const dataRows = rows.slice(1)

  return dataRows.map((row) => {
    const obj: SheetRow = {}
    headers.forEach((header, index) => {
      const rawVal = (row as string[])[index]
      obj[header] = rawVal !== undefined && rawVal !== '' ? rawVal.trim() : null
    })
    return obj
  })
}

// Flexible date parser — handles DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, and plain dates
export function parseFlexibleDate(raw: string | null): string | null {
  if (!raw) return null

  const cleaned = raw.trim()

  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned
  }

  // DD/MM/YYYY (most common in Gulf data)
  const ddmmyyyy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // MM/DD/YYYY
  const mmddyyyy = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Try native Date parse as last resort
  const d = new Date(cleaned)
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0]
  }

  return null
}

// Normalise names: trim whitespace, title case
export function normaliseName(raw: string | null): string | null {
  if (!raw) return null
  return raw
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Generate demo_id if not in sheet
export function generateDemoId(date: string, teacherName: string, studentName: string): string {
  const datePart = date.replace(/-/g, '')
  const teacherFirst = teacherName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')
  const studentFirst = studentName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')
  return `${datePart}_${teacherFirst}_${studentFirst}`
}

// Append rows to a Google Sheet (write mode)
export async function appendToSheet(
  spreadsheetId: string,
  sheetName: string,
  rows: (string | number | boolean | null)[][]
): Promise<number> {
  const auth = getAuth(false) // read-write scope
  const sheets = google.sheets({ version: 'v4', auth })

  const timeout = parseInt(process.env.SHEET_SYNC_TIMEOUT_MS || '5000', 10)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rows.map((row) => row.map((v) => (v === null ? '' : String(v))))
      }
    })

    return response.data.updates?.updatedRows || 0
  } finally {
    clearTimeout(timer)
  }
}

// Check Sheets API connectivity
export async function checkSheetsConnection(): Promise<boolean> {
  try {
    const auth = getAuth()
    await auth.getClient()
    return true
  } catch {
    return false
  }
}
