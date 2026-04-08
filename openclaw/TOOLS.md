# TOOLS.md — Wajeeha Demo-to-Conversion Agent

## Environment
- Runtime: OpenClaw v2026.3.7+
- Execution Engine: Claude Code (called for complex processing tasks)
- Database: SQL (PostgreSQL via Next.js API)
- Primary Language: TypeScript / Node.js

---

## Available Tools

### 1. google_sheets_reader
Read data from Google Sheets via the Sheets API.
```
Input: { spreadsheet_id: string, range: string, sheet_name?: string }
Output: { rows: array, headers: array }
```
**Configured sheet IDs:**
- conducted_demo_sessions: `1mmeidiQdNMrUcgTPGAIqydjgIKoIEjvAB0DUZDHjVXo`
- counseling_product_wajeeha: `1DkNhYdGzsBNWe-hP1CTc2ySp9daFOhOiZj6yAPQnXok`
- demo_feedback_form: `187Y-zBiHhyW9sbSfxxQeWCZiAKgvMD5ClmKZDIN0BBk`
- demo_conversion_sales: `1Frhd1bKUKuQXu-5hpUJ6kxJbI9iv9gInl2I8Sw-AUw0`

**IMPORTANT**: OAuth credentials are stored in environment variables. Never log credentials. Use `process.env.GOOGLE_SERVICE_ACCOUNT_KEY`.

### 2. sql_query
Execute SQL queries against the agent's database.
```
Input: { query: string, params?: array }
Output: { rows: array, rowCount: number }
```
Connection string from: `process.env.DATABASE_URL`
**Schema file**: `/sql/schema.sql`
**Risky commands**: DELETE and DROP require human confirmation. Never run without explicit approval.

### 3. sql_write
Write a single record to a SQL table with audit trail.
```
Input: { table: string, data: object, upsert_key?: string }
Output: { success: boolean, record_id: string }
```
All writes are logged to `agent_activity_log` automatically.

### 4. lms_api
Read session data from the Tuitional LMS.
```
Input: { endpoint: string, params?: object }
Output: { data: object }
```
Base URL: `process.env.LMS_API_BASE_URL`
Auth: Bearer token from `process.env.LMS_API_KEY`
READ ONLY. Cannot write to LMS from this agent.

### 5. notification_sender
Write a notification to the notifications table for another agent or human.
```
Input: { recipient: string, type: string, payload: object, priority?: 'low'|'medium'|'high' }
Output: { notification_id: string }
```
Valid recipients: `dawood_agent`, `sales_agent`, `student_excellence_agent`, `cto_agent`, `human_dawood`

### 6. claude_code_executor
Call Claude Code for complex analysis tasks that exceed simple rule application.
```
Input: { task: string, context: object, output_schema: object }
Output: { result: object, confidence: number, reasoning: string }
```
Use for: qualitative analysis of demo observations, generating improvement suggestions, synthesising patterns across multiple demos.
Do NOT use for: data retrieval, simple calculations, writing to database.

### 7. escalation_writer
Write an escalation record for human or agent review.
```
Input: { demo_id: string, escalation_type: string, reason: string, urgency: 'low'|'medium'|'high' }
Output: { escalation_id: string }
```
Always include a specific, actionable reason. "Unable to process" is not a valid reason.

---

## Path Conventions
- Agent workspace: `/home/claude/wajeeha-agent/`
- SQL schema: `/home/claude/wajeeha-agent/sql/schema.sql`
- Knowledge base: `/home/claude/wajeeha-agent/knowledge-base/`
- Prompts: `/home/claude/wajeeha-agent/prompts/`
- Daily logs: `/home/claude/wajeeha-agent/logs/YYYY-MM-DD.md`

---

## Risky Commands — Extra Caution Required
- Any SQL DELETE or UPDATE on historical records — require human approval
- Any modification to teacher_profiles table — require Dawood Agent approval
- Any Google Sheets WRITE operation — currently disabled; this agent is read-only for Sheets
- Any LMS write operation — not permitted for this agent

---

## Environment Variables Required
```
DATABASE_URL=
GOOGLE_SERVICE_ACCOUNT_KEY=
ANTHROPIC_API_KEY=
LMS_API_BASE_URL=
LMS_API_KEY=
OPENCLLAW_WORKSPACE_ID=
```
**Never hardcode these. Never log these. Store in `.env` (not committed to git). Production: use Docker secrets.**
