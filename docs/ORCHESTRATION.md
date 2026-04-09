# ORCHESTRATION.md — Agent Orchestration, Dispatch & Communication

## Overview
This document defines HOW agents coordinate, dispatch work, communicate, and operate autonomously.
It covers the task flow, the 8-phase autonomous pipeline, agent-to-agent communication,
the polling/daemon architecture, cron jobs, and the daily intelligence digest.

---

## 1. Task Flow — How Work Moves Through the System

```
TRIGGER (external event or cron)
    │
    ▼
DAEMON (pure code, polls every 60 seconds)
    │ Checks: new demos? new tasks? pending items?
    │ NO AI cost for polling.
    │
    ├─── Deterministic work (Steps 1-3, 5-9, 11) ──→ CODED FUNCTIONS (runs instantly)
    │
    ├─── Intelligence needed (Steps 4, 10) ──→ CLAUDE API (direct call, ~1500 tokens)
    │
    ├─── Decision needed ──→ OPENCLAW (wakes up, reads context, decides)
    │
    └─── Human review needed ──→ NOTIFICATION → DASHBOARD (Dawood reviews)
```

### Trigger Types
| Trigger | Source | What Happens |
|---------|--------|-------------|
| New demo synced | Google Sheets cron (every 15 min) | Daemon detects new row, starts pipeline |
| Task assigned | Task queue (Supabase) | Daemon polls task_queue, OpenClaw picks up |
| Heartbeat | Cron (every 30 min) | Agent health check, pending task alert |
| Webhook received | External service POST | Edge function processes, writes to queue |
| Manual trigger | Human via dashboard | API call triggers specific action |
| Scheduled cron | Supabase cron or OS cron | Daily digest, weekly report, sync |

---

## 2. The Polling Daemon (The Engine)

The daemon is a Node.js script that runs on the VPS. It is NOT an AI agent.
It is pure code. Zero tokens. Always running.

### What it does:
```
Every 60 seconds:
├── Check conducted_demo_sessions for analysis_status='pending'
│   └── If found → start pipeline (Steps 1-11)
│
├── Check task_queue for column_status='to_do' AND assignee='system'
│   └── If found → execute task (coded function or Claude API)
│
├── Check notifications for unread alerts
│   └── If any are > 2 hours old → escalate
│
└── Log heartbeat to agent_activity_log
```

### Implementation: `/scripts/task-daemon.js`
```javascript
// Pseudocode — implemented in TypeScript
const POLL_INTERVAL = 60_000; // 60 seconds

async function poll() {
  // 1. Check for new demos
  const newDemos = await db.query(
    "SELECT demo_id FROM conducted_demo_sessions WHERE analysis_status = 'pending' LIMIT 1"
  );
  if (newDemos.length > 0) {
    await runPipeline(newDemos[0].demo_id);
  }

  // 2. Check for assigned tasks
  const tasks = await db.query(
    "SELECT * FROM task_queue WHERE column_status = 'to_do' AND assignee_name = 'wajeeha' LIMIT 1"
  );
  if (tasks.length > 0) {
    await executeTask(tasks[0]);
  }

  // 3. Check stale notifications
  await checkStaleNotifications();
}

setInterval(poll, POLL_INTERVAL);
```

### Critical rule from the masterclass:
> "The system became stable when we stopped asking OpenClaw's cron to be a durable always-on
> orchestrator and instead used OpenClaw for what it's best at — agent execution, messaging,
> and task completion." — Mani Kanasani, after 15 hours of debugging

---

## 3. The 8-Phase Autonomous Build Pipeline

When OpenClaw or the daemon assigns a BUILD task (e.g., "create a proposal", "generate a report"),
the executor follows this 8-phase sequence:

| Phase | Name | What Happens | Duration |
|-------|------|-------------|----------|
| 1 | CONTEXT | Read task description. Load relevant data from database. Understand scope. | 30 sec |
| 2 | PLAN | Analyze requirements. Break into subtasks. Define approach. | 1-2 min |
| 3 | TASK | Create task record on Kanban board. Assign subtasks. Set deadline. | 30 sec |
| 4 | BUILD | Execute the actual work. Write code, generate documents, call APIs. | 5-15 min |
| 5 | VALIDATE | Test output. Check for errors. Verify against requirements. | 1-2 min |
| 6 | HEAL | If validation fails: identify error, fix it, re-validate. Auto-retry up to 3 times. | 0-5 min |
| 7 | REPORT | Generate completion report. Upload artifacts. Update task status. | 30 sec |
| 8 | CLOSE | Move task to 'done'. Send notification. Update memory. Clean up. | 30 sec |

### Anti-Stall Protocol (from masterclass):
- **8 minutes**: Proof checkpoint. A file, database record, or artifact MUST exist. Text-only updates are INVALID.
- **16 minutes**: If no artifact proof, task moves to 'needs_input'. Blocker must be stated explicitly.
- **Never** let an agent say "I'm working on it" without showing proof.

### Progress Reporting:
During Phase 4 (BUILD), report progress every 3 minutes:
```
3 min elapsed — 12% estimated
6 min elapsed — 24%
9 min elapsed — 36%
...
```
Send progress to agent_activity_log and Telegram if configured.

---

## 4. Agent-to-Agent Communication

### Method 1: SQL Bus (Primary — always available)
Agents communicate by writing structured messages to the `notifications` table:

```sql
INSERT INTO notifications (recipient, type, title, message, reference_id)
VALUES ('dawood_agent', 'demo_ready_for_review', 'New analysis: Inayat → Olimpos',
        'Analysis complete. Confidence: 8.4/10. 2 POUR flags.', 'analysis_uuid_here');
```

Recipient agent polls notifications table and acts on unread messages.

### Method 2: Task Queue (For work dispatch)
One agent creates a task for another:

```sql
INSERT INTO task_queue (title, description, assignee_name, priority, metadata)
VALUES ('Review demo analysis', 'Wajeeha completed analysis for demo #20260407',
        'dawood', 'high', '{"analysis_id": "uuid", "demo_id": "20260407_inayat_olimpos"}');
```

### Method 3: Discord (For real-time, future Phase 2+)
Each agent gets its own Discord bot token and channel.
Setup: Install discord.js, create bot per agent, dedicated channels.
Use for: Real-time alerts, agent-to-agent debate, human monitoring.

### Method 4: Agent Council (For multi-department decisions, Phase 3)
When a problem requires input from multiple departments:
1. Requesting agent creates a "council" task with the question
2. Relevant department head agents are tagged
3. Each agent provides their perspective based on their department context
4. CEO agent synthesizes and makes final decision
5. Decision is recorded and distributed

### Communication Rules:
- Every message has: sender, recipient, type, reference_id, timestamp
- Cross-department messages go through department head agents (never direct L3→L3)
- Urgent messages: marked as priority, trigger immediate OpenClaw wake-up
- SHADOW_MODE: messages are written but NOT sent externally

---

## 5. Cron Jobs & Scheduled Automations

### OS-Level Crons (run by the machine, not by AI)
```bash
# /etc/crontab or user crontab

# Google Sheets sync — every 15 minutes
*/15 * * * * cd /path/to/project && node scripts/sync-sheets.js >> /var/log/tuitional-sync.log 2>&1

# Task polling daemon — every 60 seconds (better: run as systemd service)
# See /scripts/task-daemon.js — runs as persistent process, not cron

# Database backup — every 6 hours
0 */6 * * * cd /path/to/project && node scripts/backup-db.js >> /var/log/tuitional-backup.log 2>&1

# Memory audit reminder — every Sunday at 9 AM
0 9 * * 0 cd /path/to/project && node scripts/memory-audit-reminder.js
```

### Supabase Edge Function Crons (run by Supabase scheduler)
```sql
-- Daily intelligence digest — every day at 8 AM (Pakistan time, UTC+5)
SELECT cron.schedule('daily-digest', '0 3 * * *', $$
  SELECT net.http_post(
    url := 'https://your-domain.com/api/cron/daily-digest',
    headers := '{"X-Cron-Secret": "your-cron-secret"}'::jsonb
  );
$$);

-- Weekly CEO report — every Friday at 5 PM
SELECT cron.schedule('weekly-ceo-report', '0 12 * * 5', $$
  SELECT net.http_post(
    url := 'https://your-domain.com/api/cron/weekly-report',
    headers := '{"X-Cron-Secret": "your-cron-secret"}'::jsonb
  );
$$);
```

---

## 6. Daily Intelligence Digest

Every morning at 8 AM Pakistan time, the system compiles:

### Content:
1. **Yesterday's meetings** — summaries, action items, follow-ups needed
2. **Demo pipeline** — how many demos processed, pending, escalated
3. **Conversion metrics** — conversion rate, notable wins/losses, trends
4. **Agent performance** — tasks completed, processing times, confidence scores
5. **Email campaigns** — sent, opened, clicked, replied, bounced (future: Nova agent)
6. **POUR alerts** — recurring quality issues by teacher
7. **Escalations** — unresolved items requiring attention
8. **Today's battle plan** — priorities, deadlines, scheduled demos

### Delivery:
- Email to CEO (Husni Mubarak) and relevant department heads
- Written to dashboard as a viewable report
- Logged to agent_activity_log

### Implementation:
The digest is generated by a coded function (NOT by OpenClaw burning tokens).
It queries the database, aggregates metrics, formats the report.
Only the "strategic insights" section (if any) uses Claude API for synthesis.

---

## 7. Token Optimization Stack

| Strategy | Status | Savings | Implementation |
|----------|--------|---------|---------------|
| Kill thinking mode | Mandatory from day one | 10-15x per call | Set `thinking.type: "disabled"` in config |
| Cap context window | Mandatory from day one | 20-40% | Set `contextTokens: 50000` |
| Model routing | Mandatory from day one | 80% on routine tasks | Haiku for heartbeat/logging, Sonnet for analysis |
| Sub-agent isolation | Mandatory from day one | 3.5x reduction | prepareSubagentSpawn hook, minimal context |
| Prompt caching | Mandatory from day one | 90% on repeated context | Cache SOUL.md, schemas, knowledge base |
| Lean session initiation | Mandatory from day one | 80% on startup | Load only 8KB (user, identity, today's memory) |
| Fresh sessions per task | Recommended | Prevents context bloat | Never run 5+ hour marathon sessions |
| Heartbeat to local model | Optional (200+ queries/day) | $5/day savings | Ollama for health checks |

### Model Selection by Task
| Task Type | Model | Reasoning |
|-----------|-------|-----------|
| Qualitative demo analysis | Claude Sonnet | Core intelligence, needs quality |
| Accountability classification | Claude Sonnet | Judgment required |
| Proposal generation | Claude Sonnet | Creative + analytical |
| Heartbeat/health checks | Claude Haiku or Ollama | Deterministic, no reasoning |
| Log entries, notifications | Claude Haiku | Template-based, fast |
| CEO strategic synthesis | Claude Opus or Sonnet | Highest complexity |
| Data transforms, sync | NO AI — pure code | Never burn tokens on SQL |

---

## 8. Escalation Decision Tree

```
Problem occurs at any agent level
    │
    ├── Can the agent resolve it? (within its SOUL.md authority)
    │   └── YES → resolve, log, continue
    │
    ├── Does it need Lead Agent review?
    │   └── YES → create notification for Lead Agent (e.g., Dawood)
    │       └── Lead Agent resolves or escalates to Department Head
    │
    ├── Does it cross departments?
    │   └── YES → create task for relevant department head agents
    │       └── If disagreement → escalate to Council / CEO
    │
    ├── Does it need CEO decision?
    │   └── YES → create escalation for Husni Mubarak
    │       └── Types: refund, pricing, new agent, policy change, partnership
    │
    └── Is it a system failure?
        └── YES → create escalation for CTO (Ahmar Hussain)
            └── Types: database error, API failure, security incident
```

---

## 9. Build Roadmap

### Phase 1 — Foundation (Days 1-90)
- Goal: One validated agent (Wajeeha) running in shadow mode
- Items: OpenClaw setup, security baseline, SQL schema, SOUL.md, sub-agents, shadow mode, minimal dashboard
- Success: Proposal accuracy >85% by Week 4, human edit rate <20% by Week 8

### Phase 2 — Expansion (Days 91-180)
- Goal: Five agents live, cross-agent communication working
- Items: Teacher Matching Agent, Trial Scheduling Agent, Invoice Agent, Sara BizDev Agent, full dashboard, NemoClaw production, ContextEngine plugins

### Phase 3 — Full AI OS (Days 181-365)
- Goal: All departments active, TuAI first paying client, Council layer
- Items: All 8 master agents, CEO digest, news scraper, Lumi refinement, retention prediction, full autonomy map

### What Must NOT Be Built Yet
- Autonomous parent-facing communication without human review
- AI-conducted trial lessons
- Agent-to-agent autonomous loops without human checkpoints
- Full invoice dispatch before payment integration testing
- Public-facing chatbot for parents
