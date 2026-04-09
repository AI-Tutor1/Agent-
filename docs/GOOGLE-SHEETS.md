# GOOGLE-SHEETS.md — Sync Specification

## Overview
4 Google Sheets are the primary operational data sources for Tuitional.
Data flows ONE WAY: Google Sheets → PostgreSQL. The database is the source of truth once synced.
Sync runs every 15 minutes via cron. Manual trigger available at POST /api/sync/trigger.

## Authentication
- Use Google Service Account (JSON key in env: GOOGLE_SERVICE_ACCOUNT_KEY)
- Service account must have Viewer access to all 4 sheets
- Use googleapis npm package: `google.sheets({ version: 'v4', auth })`

---

## SHEET 1: Conducted Demo Sessions
- **Sheet ID**: `1mmeidiQdNMrUcgTPGAIqydjgIKoIEjvAB0DUZDHjVXo`
- **Target table**: `conducted_demo_sessions`
- **Sync key**: Composite of date + teacher + student (generates demo_id)
- **Expected columns**: Date, Month, Teacher Name, Student Name, Academic Level, Subject
- **demo_id format**: `YYYYMMDD_teacherfirstname_studentfirstname` (lowercase, no spaces)

## SHEET 2: Counseling Product (Wajeeha's Sheet)
- **Sheet ID**: `1DkNhYdGzsBNWe-hP1CTc2ySp9daFOhOiZj6yAPQnXok`
- **Contains multiple tabs**: Demo-to-Conversion, POUR flags, Sheet30
- **Target tables**: Multiple — read tab names and route accordingly

## SHEET 3: Demo Feedback Form 2.0
- **Sheet ID**: `187Y-zBiHhyW9sbSfxxQeWCZiAKgvMD5ClmKZDIN0BBk`
- **Target table**: `demo_feedback`
- **Sync key**: timestamp + tutor_name + student_name
- **Critical**: Must fuzzy-match to conducted_demo_sessions for matching

## SHEET 4: Demo to Conversion Sales
- **Sheet ID**: `1Frhd1bKUKuQXu-5hpUJ6kxJbI9iv9gInl2I8Sw-AUw0`
- **Target table**: `demo_conversion_sales`
- **Sync key**: demo_date + teacher_name + student_name

---

## Fuzzy Matching Rules
Teacher names may vary across sheets (e.g., "Inayat Karim" vs "Inayat" vs "I. Karim").
1. Normalize: lowercase, trim whitespace, remove extra spaces
2. Check teacher_profiles.name_aliases for known variations
3. If no exact match, use Levenshtein distance ≤ 3 characters
4. If still no match, flag in data_integrity_flags and continue

## Sync Logic (for each sheet)
```
1. Fetch all rows from Google Sheet
2. For each row:
   a. Generate sync key (demo_id or composite)
   b. Check if record exists in target table
   c. If exists → UPDATE only if data changed (compare checksums)
   d. If new → INSERT
   e. If any required field is missing → write to data_integrity_flags
3. Log sync results to sync_log table
4. Return summary: { rows_fetched, rows_inserted, rows_updated, errors }
```

## Cron Setup
```bash
# /scripts/sync-cron.sh — runs every 15 minutes
*/15 * * * * cd /path/to/project && node scripts/sync-sheets.js >> /var/log/tuitional-sync.log 2>&1
```
