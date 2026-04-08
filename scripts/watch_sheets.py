#!/usr/bin/env python3
"""
Tuitional Wajeeha Agent — Google Sheets Watcher v2.0
=====================================================
V2 CHANGE: Google Sheets are now OUTPUTS, not inputs.
All data entry happens via platform API endpoints.

This watcher:
  - READS only Sheet 2 (Demo Feedback Form) — students fill this externally
  - WRITES to Sheets 1, 3, 4 when called by the sync API endpoints

Usage:
    pip install -r requirements-watch.txt
    python scripts/watch_sheets.py

Environment (.env):
    DATABASE_URL
    GOOGLE_SERVICE_ACCOUNT_KEY  (full JSON as single line)
    POLL_INTERVAL               (seconds, default 30)
    NEXT_API_URL                (http://localhost:3000)
    AGENT_INTERNAL_TOKEN
"""

import os
import sys
import json
import time
import hashlib
import logging
import re
import datetime
from typing import Optional

# ── Third-party ──────────────────────────────────────────────
try:
    import psycopg2
    import psycopg2.extras
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from dotenv import load_dotenv
    import requests
except ImportError as e:
    print(f"\n[ERROR] Missing dependency: {e}")
    print("Run:  pip install -r scripts/requirements-watch.txt\n")
    sys.exit(1)

# ── Config ───────────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

POLL_INTERVAL   = int(os.getenv('POLL_INTERVAL', '30'))
NEXT_API_URL    = os.getenv('NEXT_API_URL', 'http://localhost:3000')
AGENT_TOKEN     = os.getenv('AGENT_INTERNAL_TOKEN', '')
DATABASE_URL    = os.getenv('DATABASE_URL', '')
SA_KEY_JSON     = os.getenv('GOOGLE_SERVICE_ACCOUNT_KEY', '')

# Only Sheet 2 (feedback) is read — sheets 1, 3, 4 are written by sync API
SHEET_DEMO_FEEDBACK = os.getenv('SHEET_DEMO_FEEDBACK', '187Y-zBiHhyW9sbSfxxQeWCZiAKgvMD5ClmKZDIN0BBk')

# Sheet IDs for write operations (called by sync API)
SHEET_CONDUCTED_DEMOS     = os.getenv('SHEET_CONDUCTED_DEMOS',      '1mmeidiQdNMrUcgTPGAIqydjgIKoIEjvAB0DUZDHjVXo')
SHEET_COUNSELING_PRODUCT  = os.getenv('SHEET_COUNSELING_PRODUCT',   '1DkNhYdGzsBNWe-hP1CTc2ySp9daFOhOiZj6yAPQnXok')
SHEET_DEMO_CONVERSION     = os.getenv('SHEET_DEMO_CONVERSION_SALES','1Frhd1bKUKuQXu-5hpUJ6kxJbI9iv9gInl2I8Sw-AUw0')

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s  %(levelname)-8s  %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(
            os.path.join(os.path.dirname(__file__), '..', 'logs', 'sheet_watcher.log'),
            mode='a',
            encoding='utf-8',
        ) if os.path.isdir(os.path.join(os.path.dirname(__file__), '..', 'logs')) else logging.StreamHandler(),
    ]
)
log = logging.getLogger('sheet_watcher')

# ── Row hash cache (in-memory between polls) ─────────────────
_row_hashes: dict[str, str] = {}


# ═══════════════════════════════════════════════════════════════
# GOOGLE SHEETS CLIENT
# ═══════════════════════════════════════════════════════════════

def build_sheets_client(readonly: bool = True):
    """Build authenticated Google Sheets v4 client."""
    if not SA_KEY_JSON:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_KEY is not set in .env")
    credentials_dict = json.loads(SA_KEY_JSON)
    scope = (
        'https://www.googleapis.com/auth/spreadsheets.readonly'
        if readonly else
        'https://www.googleapis.com/auth/spreadsheets'
    )
    creds = service_account.Credentials.from_service_account_info(
        credentials_dict,
        scopes=[scope]
    )
    return build('sheets', 'v4', credentials=creds, cache_discovery=False)


def read_sheet(service, spreadsheet_id: str, range_: str = 'A:Z') -> list[dict]:
    """Fetch all rows from a sheet, return list of dicts keyed by header row."""
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=range_)
        .execute()
    )
    rows = result.get('values', [])
    if len(rows) < 2:
        return []

    headers = [h.strip() for h in rows[0]]
    output = []
    for row in rows[1:]:
        obj: dict = {}
        for i, header in enumerate(headers):
            val = row[i].strip() if i < len(row) and row[i] else None
            obj[header] = val
        output.append(obj)
    return output


# ═══════════════════════════════════════════════════════════════
# DATA NORMALISATION (mirrors TypeScript helpers)
# ═══════════════════════════════════════════════════════════════

def parse_flexible_date(raw: Optional[str]) -> Optional[str]:
    """Parse DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD → YYYY-MM-DD."""
    if not raw:
        return None
    cleaned = raw.strip()

    if re.match(r'^\d{4}-\d{2}-\d{2}$', cleaned):
        return cleaned

    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})$', cleaned)
    if m:
        day, month, year = m.group(1), m.group(2), m.group(3)
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"

    m = re.match(r'^(\d{1,2})-(\d{1,2})-(\d{4})$', cleaned)
    if m:
        month, day, year = m.group(1), m.group(2), m.group(3)
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"

    try:
        d = datetime.datetime.strptime(cleaned, '%d %b %Y')
        return d.strftime('%Y-%m-%d')
    except ValueError:
        pass

    return None


def normalise_name(raw: Optional[str]) -> Optional[str]:
    """Title-case and strip name."""
    if not raw:
        return None
    return ' '.join(word.capitalize() for word in raw.strip().split())


def row_hash(row: dict) -> str:
    """SHA-256 hash of a row dict — used to detect changes."""
    serialised = json.dumps(row, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(serialised.encode()).hexdigest()


# ═══════════════════════════════════════════════════════════════
# DATABASE OPERATIONS
# ═══════════════════════════════════════════════════════════════

def get_db_conn():
    return psycopg2.connect(DATABASE_URL)


def upsert_demo_feedback(cur, row: dict):
    """Upsert one row from the Demo Feedback sheet."""
    teacher = normalise_name(row.get('Tutor Name') or row.get('Teacher Name') or row.get('Tutor'))
    student = normalise_name(row.get('Student Name') or row.get('Student'))
    raw_date = row.get('Session Date') or row.get('Date')
    session_date = parse_flexible_date(raw_date)

    raw_rating = row.get('Overall Rating') or row.get('Rating /10') or row.get('Rating')
    try:
        rating_int = int(float(raw_rating)) if raw_rating else None
    except (ValueError, TypeError):
        rating_int = None

    raw_env = row.get('Positive Environment') or row.get('positive_environment')
    try:
        env_int = int(float(raw_env)) if raw_env else None
    except (ValueError, TypeError):
        env_int = None

    cur.execute("""
        INSERT INTO demo_feedback
            (tutor_name, student_name, subject, session_date,
             overall_rating_10, topic_explained, participation,
             confusion_moments, discomfort_moments, positive_environment,
             suggestions, comments_other)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, (
        teacher,
        student,
        row.get('Subject'),
        session_date,
        rating_int,
        row.get('Was Topic Explained') or row.get('Topic Explained'),
        row.get('Participation') or row.get('Student Participation'),
        row.get('Moments of Confusion') or row.get('Confusion'),
        row.get('Moments of Discomfort') or row.get('Discomfort'),
        env_int,
        row.get('Suggestions') or row.get('Suggestion'),
        row.get('Comments') or row.get('Other'),
    ))


# ═══════════════════════════════════════════════════════════════
# SHEET WRITE FUNCTIONS (called by sync API endpoints)
# ═══════════════════════════════════════════════════════════════

def write_counselor_to_sheet1(service_rw, demo_data: dict) -> bool:
    """Writes a counselor intake record to Sheet 1 (Conducted Demos)."""
    try:
        values = [[
            str(demo_data.get('demo_date', '')),
            str(demo_data.get('demo_month', '')),
            str(demo_data.get('teacher_name', '')),
            str(demo_data.get('student_name', '')),
            str(demo_data.get('academic_level', '')),
            str(demo_data.get('subject', '')),
            str(demo_data.get('curriculum_board', '')),
            str(demo_data.get('curriculum_code', '')),
            str(demo_data.get('rate_tier', '')),
            str(demo_data.get('pain_points', '')),
            str(demo_data.get('session_notes', '')),
            str(demo_data.get('demo_id', '')),
        ]]

        service_rw.spreadsheets().values().append(
            spreadsheetId=SHEET_CONDUCTED_DEMOS,
            range='Sheet1!A:L',
            valueInputOption='USER_ENTERED',
            insertDataOption='INSERT_ROWS',
            body={'values': values}
        ).execute()

        log.info(f"  ✅ Written to Sheet 1: {demo_data.get('demo_id')}")
        return True
    except Exception as e:
        log.error(f"  ❌ Sheet 1 write failed: {e}")
        return False


def write_sales_to_sheet4(service_rw, sales_data: dict) -> bool:
    """Writes a sales conversion record to Sheet 4 (Demo Conversion Sales)."""
    try:
        values = [[
            str(sales_data.get('demo_date', '')),
            str(sales_data.get('teacher_name', '')),
            str(sales_data.get('student_name', '')),
            str(sales_data.get('academic_level', '')),
            str(sales_data.get('subject', '')),
            str(sales_data.get('conversion_status', '')),
            str(sales_data.get('sales_comments', '')),
            str(sales_data.get('sales_agent', '')),
            str(sales_data.get('parent_contact', '')),
            str(sales_data.get('student_feedback_rating', '')),
            str(sales_data.get('student_verbal_feedback', '')),
        ]]

        service_rw.spreadsheets().values().append(
            spreadsheetId=SHEET_DEMO_CONVERSION,
            range='Demos!A:K',
            valueInputOption='USER_ENTERED',
            insertDataOption='INSERT_ROWS',
            body={'values': values}
        ).execute()

        log.info(f"  ✅ Written to Sheet 4: {sales_data.get('matched_demo_id')}")
        return True
    except Exception as e:
        log.error(f"  ❌ Sheet 4 write failed: {e}")
        return False


def write_analysis_to_sheet3(service_rw, analysis_data: dict) -> bool:
    """Writes agent analysis results to Sheet 3 (Counseling Product)."""
    try:
        values = [[
            str(analysis_data.get('demo_date', '')),
            str(analysis_data.get('teacher_name', '')),
            str(analysis_data.get('student_name', '')),
            str(analysis_data.get('academic_level', '')),
            str(analysis_data.get('subject', '')),
            str(analysis_data.get('conversion_flag', '')),
            str(analysis_data.get('qualitative_notes', '')),
            str(analysis_data.get('student_rating', '')),
            str(analysis_data.get('analyst_rating', '')),
            str(analysis_data.get('conversion_status', '')),
            str(analysis_data.get('sales_comments', '')),
            str(analysis_data.get('sales_agent', '')),
            str(analysis_data.get('accountability_classification', '')),
            str(analysis_data.get('demo_id', '')),
        ]]

        service_rw.spreadsheets().values().append(
            spreadsheetId=SHEET_COUNSELING_PRODUCT,
            range='Demo to Conversion!A:N',
            valueInputOption='USER_ENTERED',
            insertDataOption='INSERT_ROWS',
            body={'values': values}
        ).execute()

        log.info(f"  ✅ Written to Sheet 3: {analysis_data.get('demo_id')}")
        return True
    except Exception as e:
        log.error(f"  ❌ Sheet 3 write failed: {e}")
        return False


# ═══════════════════════════════════════════════════════════════
# FEEDBACK SYNC (Sheet 2 — the only sheet still read)
# ═══════════════════════════════════════════════════════════════

def sync_demo_feedback(service, conn) -> tuple[int, int]:
    """Read Sheet 2 (Demo Feedback Form) and upsert to DB."""
    rows = read_sheet(service, SHEET_DEMO_FEEDBACK, 'Form Responses 1!A:Z')
    upserted = 0
    skipped = 0

    with conn.cursor() as cur:
        for row in rows:
            h = row_hash(row)
            cache_key = f"feedback_{json.dumps(row, sort_keys=True)[:80]}"

            if _row_hashes.get(cache_key) == h:
                skipped += 1
                continue

            _row_hashes[cache_key] = h
            try:
                upsert_demo_feedback(cur, row)
                upserted += 1
            except Exception as e:
                log.warning(f"  Row error (demo_feedback): {e}")

    conn.commit()
    return upserted, skipped


# ═══════════════════════════════════════════════════════════════
# MAIN WATCH LOOP
# ═══════════════════════════════════════════════════════════════

def run_sync_cycle(service, conn) -> dict:
    """Run one sync cycle — only reads Sheet 2 (feedback)."""
    start = time.time()
    log.info("── Sync cycle starting ──────────────────────────────")

    fb_up, fb_sk = sync_demo_feedback(service, conn)

    elapsed = round(time.time() - start, 2)

    log.info(
        f"── Sync complete in {elapsed}s │ "
        f"feedback: {fb_up} upserted, {fb_sk} unchanged"
    )

    return {
        'elapsed_s': elapsed,
        'feedback_upserted': fb_up,
        'feedback_skipped': fb_sk,
    }


def main():
    log.info("══════════════════════════════════════════════")
    log.info("  Tuitional — Wajeeha Sheet Watcher v2.0")
    log.info("  MODE: Read Sheet 2 (feedback) only")
    log.info("  Sheets 1, 3, 4 are now write-only (via sync API)")
    log.info(f"  Poll interval : {POLL_INTERVAL}s")
    log.info(f"  API endpoint  : {NEXT_API_URL}")
    log.info("══════════════════════════════════════════════")

    # Validate env
    if not DATABASE_URL:
        log.error("DATABASE_URL is not set. Check .env file.")
        sys.exit(1)
    if not SA_KEY_JSON:
        log.error("GOOGLE_SERVICE_ACCOUNT_KEY is not set. Check .env file.")
        sys.exit(1)

    # Build read-only client for polling feedback
    try:
        service = build_sheets_client(readonly=True)
        log.info("✅ Google Sheets API authenticated (read-only for feedback)")
    except Exception as e:
        log.error(f"❌ Google Sheets auth failed: {e}")
        sys.exit(1)

    try:
        conn = get_db_conn()
        conn.autocommit = False
        log.info("✅ PostgreSQL connected")
    except Exception as e:
        log.error(f"❌ Database connection failed: {e}")
        sys.exit(1)

    log.info(f"\nWatching Sheet 2 (feedback). Press Ctrl+C to stop.\n")

    consecutive_errors = 0

    while True:
        try:
            run_sync_cycle(service, conn)
            consecutive_errors = 0
        except psycopg2.OperationalError:
            log.warning("DB connection lost — reconnecting...")
            try:
                conn = get_db_conn()
                conn.autocommit = False
            except Exception as e:
                log.error(f"Reconnect failed: {e}")
        except Exception as e:
            consecutive_errors += 1
            log.error(f"Sync cycle error ({consecutive_errors}): {e}")
            if consecutive_errors >= 5:
                log.critical("5 consecutive errors — exiting. Check logs.")
                sys.exit(1)

        time.sleep(POLL_INTERVAL)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        log.info("\nWatcher stopped by user.")
        sys.exit(0)
