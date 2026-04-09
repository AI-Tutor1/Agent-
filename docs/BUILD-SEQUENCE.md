# BUILD-SEQUENCE.md — Phased Build Plan

## Overview
This project is built in 6 phases. Each phase MUST be complete and tested before the next begins.
Do NOT skip ahead. Do NOT start Phase 3 before Phase 2 is verified.

---

## PHASE 1 — Foundation (Database + Auth + Project Setup)
**Goal**: A running Next.js app connected to Supabase with all tables, RLS policies, and authentication.

### Steps:
1. Initialize Next.js project with TypeScript strict mode
2. Connect Supabase client (read env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
3. Run ALL database migrations from `/docs/DATABASE.md` — every table, index, and constraint
4. Configure Supabase Auth — email/password signup, role-based users (counselor, sales, manager, admin)
5. Implement RLS policies — counselors see their own submissions, managers see their department, admin sees all
6. Create TypeScript types for every database table (in `/src/types/`)
7. Create database query helpers (in `/src/lib/db/`)
8. Create seed data script with real Tuitional teacher names and department structure
9. Deploy frontend with real auth (login page, role-based routing, session persistence)
10. Remove ALL mock data files. Remove ALL test/question-bank orphan components.

### Verification:
- Can create a user with role=counselor → redirects to counselor page
- Can create a user with role=manager → redirects to manager dashboard
- Can query teachers table and get results
- Can insert a demo session and retrieve it
- RLS blocks counselor from seeing other counselors' data
- Zero hardcoded mock data anywhere in the codebase

---

## PHASE 2 — Google Sheets Sync
**Goal**: A cron-based sync that pulls data from 4 Google Sheets into PostgreSQL every 15 minutes.

### Steps:
1. Set up Google Sheets API client using service account key (from env: GOOGLE_SERVICE_ACCOUNT_KEY)
2. Build sync functions for each sheet:
   - `syncConductedDemos()` — Sheet ID: 1mmeidiQdNMrUcgTPGAIqydjgIKoIEjvAB0DUZDHjVXo
   - `syncCounselingProduct()` — Sheet ID: 1DkNhYdGzsBNWe-hP1CTc2ySp9daFOhOiZj6yAPQnXok
   - `syncDemoFeedback()` — Sheet ID: 187Y-zBiHhyW9sbSfxxQeWCZiAKgvMD5ClmKZDIN0BBk
   - `syncDemoConversionSales()` — Sheet ID: 1Frhd1bKUKuQXu-5hpUJ6kxJbI9iv9gInl2I8Sw-AUw0
3. Implement upsert logic — don't duplicate rows, match on demo_id or composite key
4. Implement fuzzy name matching for cross-sheet reconciliation (teacher names may have spelling variations)
5. Write data integrity checks — flag missing fields, unmatched records
6. Create `/api/sync/trigger` endpoint for manual sync
7. Create cron script (`/scripts/sync-cron.sh`) that runs every 15 minutes
8. Log every sync operation to `agent_activity_log` table

### Verification:
- Run sync → database has rows matching Google Sheets data
- Run sync again → no duplicates created
- Manually add row to Google Sheet → appears in database after next sync
- Missing fields flagged in `data_integrity_flags` table
- Activity log shows sync timestamps and row counts

---

## PHASE 3 — The 11-Step Pipeline (Core Intelligence)
**Goal**: The complete Wajeeha Demo-to-Conversion pipeline running end-to-end.

### Steps:
1. Read `/docs/PIPELINE.md` for the complete specification
2. Build each step as an isolated TypeScript function in `/src/lib/pipeline/`
3. Steps 1-3 (retrieve, log, POUR) — pure code, no AI
4. Step 4 (qualitative review) — Claude API call with structured prompt
5. Steps 5-9 (feedback, rating, export, sales, Sheet30) — pure code
6. Step 10 (accountability classification) — Claude API call
7. Step 11 (teacher progress update) — pure code
8. Build pipeline orchestrator that runs all 11 steps in sequence
9. Build the polling daemon (`/scripts/task-daemon.sh`) that:
   - Checks for new unprocessed demos every 60 seconds
   - Triggers pipeline for each new demo
   - Does NOT use AI for polling — pure HTTP/SQL
   - Notifies OpenClaw only when steps 4 or 10 need AI (or runs Claude API directly)
10. Implement shadow mode: when SHADOW_MODE=true, pipeline runs but sends no external notifications
11. Log every step to `agent_activity_log` with timestamp, duration, tokens used

### Verification:
- Insert a demo record → pipeline processes all 11 steps automatically
- demo_analysis table has complete qualitative analysis
- pour_flags table has correct POUR flags
- accountability_log has classification for non-converted demos
- Shadow mode ON → no notifications sent
- Pipeline completes in under 5 minutes for a single demo

---

## PHASE 4 — API Layer + Dashboard Wiring
**Goal**: Every dashboard UI element connected to real API endpoints reading real database data.

### Steps:
1. Read `/docs/API-CONTRACT.md` for all endpoint specifications
2. Build dashboard API routes:
   - `GET /api/dashboard/overview` — KPIs, department stats, live activity
   - `GET /api/dashboard/review-queue` — pending analyses for Dawood
   - `POST /api/dashboard/review/:id/approve` — approve analysis
   - `POST /api/dashboard/review/:id/reject` — reject with reason
   - `POST /api/dashboard/review/:id/redo` — request re-analysis with instructions
   - `GET /api/dashboard/analytics` — conversion trends, POUR frequency, accountability split
3. Build agent API routes (for OpenClaw to call):
   - `GET /api/agent/tasks` — poll for assigned tasks
   - `POST /api/agent/tasks/:id/start` — mark task as in-progress
   - `POST /api/agent/tasks/:id/complete` — mark task as done with result
   - `POST /api/agent/log` — write to AI activity log
   - `POST /api/agent/heartbeat` — agent health check
4. Build webhook endpoints:
   - `POST /api/webhooks/demo-complete` — trigger pipeline for new demo
   - `POST /api/webhooks/sheets-updated` — trigger sync on sheet change
5. Wire every frontend component to real API calls (replace ALL mock data)
6. Implement real-time updates using Supabase Realtime subscriptions
7. Add proper loading states, error states, empty states throughout UI

### Verification:
- Dashboard shows real data from database, not mock data
- Approve an analysis → database updated, card removed from queue
- Reject an analysis → reason saved, analyst notified
- Agent polls /api/agent/tasks → gets list of assigned tasks
- Page refresh preserves all data
- Loading spinners show while data fetches

---

## PHASE 5 — Agent Files + OpenClaw Bridge
**Goal**: Complete OpenClaw agent configuration files ready for deployment.

### Steps:
1. Read `/docs/OPENCLAW-BRIDGE.md` for how OpenClaw connects
2. Create `/agent-files/wajeeha/` directory with:
   - `SOUL.md` — behavioral constitution (under 100 lines)
   - `IDENTITY.md` — external presentation (under 15 lines)
   - `USER.md` — Dawood Larejani's preferences and authority
   - `MEMORY.md` — initial empty template with correct structure
   - `AGENTS.md` — operating instructions, workflow rules, pipeline reference
   - `TOOLS.md` — available tools, API endpoints, environment notes
   - `HEARTBEAT.md` — recurring health check (every 30 min)
3. Create `/agent-files/dawood/` directory (Lead Agent who reviews Wajeeha's output)
4. Create integration documentation page in the dashboard showing:
   - All API endpoints with curl examples
   - Environment variables needed
   - Authentication flow for agents
   - Webhook URLs
5. Build the notification bridge — when pipeline needs AI (steps 4, 10), it writes to a queue that OpenClaw polls

### Verification:
- All .md files are syntactically correct and under line limits
- SOUL.md has prime directive, execution protocol, notification rules, core truths, anti-patterns
- Integration page shows complete API documentation
- Agent can authenticate and poll for tasks via API

---

## PHASE 6 — Security + Deployment
**Goal**: Production-ready deployment on VPS with all security hardening.

### Steps:
1. Read `/docs/SECURITY.md` for all requirements
2. Implement rate limiting on all API endpoints
3. Implement input sanitization on all form submissions (prevent prompt injection via parent messages)
4. Ensure all Supabase tables have RLS policies
5. Ensure CORS is configured for production domain only
6. Create Docker Compose file for deployment
7. Configure Caddy reverse proxy with TLS 1.3
8. Create deployment script (`/scripts/deploy.sh`)
9. Set up UFW firewall rules
10. Configure NemoClaw if available (enterprise security sandbox)
11. Create health check endpoint at `/api/health`
12. Set up monitoring for daemon process

### Verification:
- Cannot access API without authentication
- Cannot access other users' data (RLS working)
- All ports bound to localhost except 80/443
- TLS certificate active
- Health endpoint returns system status
- Daemon restarts automatically on crash
