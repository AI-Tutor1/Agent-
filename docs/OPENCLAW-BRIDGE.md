# OPENCLAW-BRIDGE.md — How OpenClaw Connects

## Architecture Principle
OpenClaw is the ORCHESTRATOR. It does NOT run the pipeline directly.
The coded infrastructure (daemon + pipeline functions) handles all deterministic work.
OpenClaw is invoked ONLY when AI reasoning is needed.

---

## Connection Points (Where OpenClaw Touches the System)

### 1. Task Polling (OpenClaw reads tasks assigned to it)
- Endpoint: GET /api/agent/tasks?assignee=ray&status=to_do
- Frequency: OpenClaw's HEARTBEAT.md checks every 30 minutes (or daemon notifies via webhook)
- Auth: X-Agent-Token header with AGENT_INTERNAL_TOKEN

### 2. Pipeline AI Steps (OpenClaw provides intelligence)
When the daemon reaches Step 4 or Step 10, it can either:
- **Option A**: Call Claude API directly from the pipeline code (simpler, recommended for Phase 1)
- **Option B**: Create a task in task_queue for OpenClaw, which then calls Claude API

For Phase 1, use Option A. The pipeline code calls Claude API directly.
For Phase 2+, OpenClaw manages Claude API calls and adds its own judgment layer.

### 3. Review Decisions (OpenClaw as Lead Agent)
Dawood's OpenClaw agent reviews analyses and decides:
- Approve (POST /api/dashboard/review/:id/approve)
- Reject with reason (POST /api/dashboard/review/:id/reject)
- Request redo with instructions (POST /api/dashboard/review/:id/redo)

### 4. Cross-Department Communication
OpenClaw agents communicate via the task_queue and notifications tables:
- Wajeeha agent → creates notification for Sales when proposal ready
- Sales agent → updates conversion status in demo_conversion_sales
- CEO agent → reads weekly digest from analytics endpoint

### 5. Activity Logging
Every OpenClaw action must be logged:
- POST /api/agent/log with agent_name, action_type, details

### 6. Identity Management
OpenClaw agents update their own files via:
- POST /api/agent/identity with file_type and content

---

## Daemon → OpenClaw Notification Flow

```
daemon (cron, every 60s)
  │
  ├─ Check conducted_demo_sessions for analysis_status='pending'
  │
  ├─ If new demo found:
  │   ├─ Run Steps 1-3 (pure code)
  │   ├─ Step 4: Call Claude API directly (or notify OpenClaw)
  │   ├─ Run Steps 5-9 (pure code)
  │   ├─ Step 10: Call Claude API directly (or notify OpenClaw)
  │   ├─ Run Step 11 (pure code)
  │   ├─ Set analysis_status='pending_review'
  │   └─ Write notification for Dawood
  │
  └─ If no new demos: sleep, check again in 60s
```

---

## OpenClaw Agent Files (What to Create)

### /agent-files/wajeeha/SOUL.md
Under 100 lines. Loaded every turn. Contains:
- Prime directive: process every demo within 15 minutes
- Execution protocol: 8-minute proof checkpoint, 15-minute escalation
- Notification rules: notify Dawood when ready, CSO when approved, CEO if >60 min
- Core truths: parent persona matters, both options must differ in style not just price
- Anti-patterns: never send without approval, never omit curriculum code, never guess persona

### /agent-files/wajeeha/IDENTITY.md
Under 15 lines. Agent name, role, department, reporting structure.

### /agent-files/wajeeha/USER.md
Who Dawood Larejani is — his preferences, review style, escalation authority.

### /agent-files/wajeeha/AGENTS.md
Operating instructions: the 11-step pipeline reference, sub-agent definitions, workflow rules.
This file is shared with sub-agents.

### /agent-files/wajeeha/TOOLS.md
Available tools: SQL queries, Google Sheets API, Claude API, WhatsApp API (future).
API endpoint URLs. Environment variable references. Risky commands list.

### /agent-files/wajeeha/MEMORY.md
Initially empty. Will accumulate: lessons learned, edge cases, teacher quirks, common errors.
Keep under 3KB. Archive old entries weekly.

### /agent-files/wajeeha/HEARTBEAT.md
Every 30 minutes: check for unprocessed demos, check daemon health, report status.

---

## Environment Variables (OpenClaw needs these)
```
AGENT_INTERNAL_TOKEN=<generated with openssl rand -hex 32>
AGENT_COMMAND_API_URL=https://{domain}/api
AGENT_COMMAND_WEBHOOK_SECRET=<generated>
ANTHROPIC_API_KEY=<for Claude API calls>
SHADOW_MODE=true
```

## OpenClaw Config Additions
```json
{
  "compaction": {
    "reserveTokensFloor": 20000,
    "memoryFlush": { "enabled": true, "softThresholdTokens": 4000 }
  }
}
```
