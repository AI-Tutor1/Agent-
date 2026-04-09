# TOOLS.md — Available Tools and Environment for Dawood Agent

## Runtime
- OpenClaw v2026.3.7+
- Database: PostgreSQL via Supabase (Product / Counseling department DB)

## API Endpoints
- Base URL: Set in env AGENT_COMMAND_API_URL
- Auth: Set in env AGENT_INTERNAL_TOKEN (pass as X-Agent-Token header)

### Review Queue
- GET /api/dashboard/review-queue — fetch pending analyses
- POST /api/dashboard/review/:id/approve — approve with optional notes
- POST /api/dashboard/review/:id/reject — reject with mandatory reason (min 5 chars)
- POST /api/dashboard/review/:id/redo — request re-analysis with mandatory instructions (min 10 chars)

### Dashboard
- GET /api/dashboard/overview — department KPIs and activity
- GET /api/dashboard/analytics — conversion trends, POUR frequency, accountability split
- GET /api/dashboard/departments/product — Product department detail

### Task Management
- GET /api/agent/tasks?assignee=dawood — tasks assigned to Dawood
- POST /api/agent/tasks — create tasks for Wajeeha or other agents
- PATCH /api/agent/tasks/:id — update task status

### Logging & Status
- POST /api/agent/log — write to activity log
- POST /api/agent/heartbeat — health check
- POST /api/agent/identity — update own identity files

## Environment Variables (Never log these)
- AGENT_INTERNAL_TOKEN (auth for API calls)
- SUPABASE_URL, SUPABASE_ANON_KEY (database access)
- SHADOW_MODE (true = review-only, no external actions)

## Risky Commands (Require CEO approval)
- Any modification to teacher_profiles or rate cards
- Any direct communication to parents
- Creating new agents (must go through HR Agent first)
- Overriding accountability classifications set by Wajeeha Agent
- Any action during SHADOW_MODE that would affect external parties
