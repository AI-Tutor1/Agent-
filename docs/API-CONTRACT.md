# API-CONTRACT.md — Complete API Endpoint Specification

## Base URL: `https://{domain}/api`
## Authentication: Supabase JWT for dashboard, AGENT_INTERNAL_TOKEN header for agent endpoints
## All responses: JSON with `{ data, error, status }` envelope

---

## DASHBOARD ENDPOINTS (Human-facing, JWT auth)

### GET /api/dashboard/overview
Returns KPIs and department summary for the manager dashboard.
```json
Response: {
  "kpis": {
    "total_agents_active": 13,
    "total_agents": 23,
    "tasks_today": 138,
    "pending_reviews": 28,
    "escalations": 4,
    "avg_confidence": 8.5
  },
  "departments": [{ "id", "name", "head", "active_agents", "total_agents", "last_action" }],
  "live_activity": [{ "time", "agent", "action", "dept" }]
}
```

### GET /api/dashboard/review-queue?filter=all|high|low|escalated&search=text
Returns pending analyses for Dawood's review.
```json
Response: {
  "analyses": [DemoAnalysis],
  "counts": { "total": 5, "high_confidence": 2, "low_confidence": 1, "escalated": 1 }
}
```

### POST /api/dashboard/review/:analysisId/approve
```json
Body: { "reviewer_name": "Dawood Larejani", "notes": "optional" }
Response: { "status": "approved", "analysis_id": "..." }
Side effects: Updates demo_analysis.analysis_status, writes to agent_activity_log
```

### POST /api/dashboard/review/:analysisId/reject
```json
Body: { "reviewer_name": "Dawood Larejani", "reason": "required — min 5 chars" }
Response: { "status": "rejected" }
Side effects: Updates analysis_status='rejected', logs rejection reason
```

### POST /api/dashboard/review/:analysisId/redo
```json
Body: { "reviewer_name": "Dawood Larejani", "instructions": "required — min 10 chars, how to do it differently" }
Response: { "status": "redo_requested" }
Side effects: Updates analysis_status='redo', archives original, re-triggers pipeline Step 4
```

### GET /api/dashboard/analytics?period=7d|30d|90d
Returns conversion trends, POUR frequency, accountability split.
```json
Response: {
  "conversion_trend": [{ "date", "rate" }],
  "accountability_split": { "Sales": 35, "Product": 25, "Consumer": 30, "Mixed": 10 },
  "pour_frequency": [{ "category", "count" }],
  "teacher_rankings": [{ "name", "avg_rating", "conversion_rate", "total_demos" }]
}
```

### GET /api/dashboard/departments/:deptId
Returns department detail with agents and current activity.

### GET /api/dashboard/agents/:agentId
Returns agent identity, soul principles, performance metrics, current pipeline status.

---

## AGENT ENDPOINTS (Agent-facing, AGENT_INTERNAL_TOKEN auth)

### GET /api/agent/tasks?assignee=ray&status=to_do,doing
Poll for assigned tasks. Pure HTTP — no AI cost.
```json
Headers: { "X-Agent-Token": "{AGENT_INTERNAL_TOKEN}" }
Response: { "tasks": [{ "id", "title", "description", "priority", "due_date", "column_status", "metadata" }] }
```

### POST /api/agent/tasks
Create a new task on the Kanban board.
```json
Body: { "title", "description", "priority", "assignee_name", "due_date", "metadata": {} }
Response: { "task_id": "uuid" }
```

### PATCH /api/agent/tasks/:taskId
Update task status, move columns, add subtasks.
```json
Body: { "column_status": "doing", "started_at": "ISO timestamp" }
```

### POST /api/agent/tasks/:taskId/complete
Mark task as done with result.
```json
Body: { "result": "description of what was done", "artifacts": ["url1", "url2"] }
Side effects: Moves to 'done', sets completed_at, logs to activity
```

### POST /api/agent/log
Write to AI activity log.
```json
Body: { "agent_name", "action_type", "demo_id?", "details?", "tokens_used?", "status" }
```

### POST /api/agent/heartbeat
Agent health check — returns system status.
```json
Body: { "agent_name": "ray" }
Response: { "status": "ok", "pending_tasks": 3, "shadow_mode": true, "db_status": "ok" }
```

### POST /api/agent/identity
Update agent identity files (soul, memory, daily log).
```json
Body: { "agent_name", "file_type": "soul|identity|memory|daily_log", "content": "markdown text" }
```

---

## SYNC ENDPOINTS

### POST /api/sync/trigger
Manually trigger Google Sheets sync.
```json
Response: { "sheets_synced": 4, "total_rows": 150, "errors": 0, "duration_ms": 3200 }
```

### GET /api/sync/status
Returns last sync timestamp and health for each sheet.

---

## WEBHOOK ENDPOINTS

### POST /api/webhooks/demo-complete
Trigger pipeline for a specific demo. Called by daemon or external system.
```json
Body: { "demo_id": "20260407_inayat_olimpos" }
Headers: { "X-Webhook-Secret": "{AGENT_COMMAND_WEBHOOK_SECRET}" }
Response: { "pipeline_started": true, "analysis_id": "uuid" }
```

### GET /api/health
Public health check endpoint (no auth required).
```json
Response: {
  "status": "ok",
  "version": "1.0.0",
  "shadow_mode": true,
  "database": "connected",
  "sheets_api": "ok",
  "claude_api": "ok",
  "lms": "mock",
  "last_sync": "2026-04-09T10:30:00Z",
  "uptime_seconds": 86400
}
```

---

## ERROR RESPONSE FORMAT
All errors follow this structure:
```json
{
  "error": {
    "code": "DEMO_NOT_FOUND",
    "message": "Demo with ID 20260407_test does not exist",
    "status": 404
  }
}
```

Standard error codes: UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, PIPELINE_ERROR, SYNC_ERROR, AI_ERROR, DATABASE_ERROR, RATE_LIMITED
