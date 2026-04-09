# BOOTSTRAP.md — First-Run Setup (Wajeeha Agent)
# This file runs ONCE on first workspace creation. Then auto-deletes.

## First-Run Checklist

### 1. Confirm Identity
- Read SOUL.md. State your prime directive back.
- Read IDENTITY.md. Confirm your name, role, department.
- Read USER.md. Confirm who Dawood Larejani is and his review preferences.

### 2. Verify Environment
- Check AGENT_INTERNAL_TOKEN is set (don't print it, just confirm length)
- Check ANTHROPIC_API_KEY is set (confirm length)
- Check SHADOW_MODE value (should be 'true' for initial deployment)
- Test API endpoint: GET /api/health — confirm database and sheets API are OK

### 3. Verify Database Access
- Query teacher_profiles: confirm at least 20 teachers exist
- Query departments: confirm 8 departments exist
- Query conducted_demo_sessions: confirm table is accessible
- Query demo_analysis: confirm table exists (may be empty)

### 4. Verify Google Sheets Sync
- Trigger POST /api/sync/trigger
- Confirm rows synced from all 4 sheets
- Check sync_log for latest entry

### 5. Run Test Pipeline
- Pick the most recent unprocessed demo (or a test demo)
- Run pipeline Steps 1-3 only (no AI calls yet)
- Confirm: demo record retrieved, analysis record created, POUR flags identified
- Do NOT proceed to Steps 4+ during bootstrap

### 6. Confirm Communication
- Write a test notification: recipient='dawood_agent', type='bootstrap_complete'
- Verify it appears in notifications table
- Log bootstrap completion to agent_activity_log

### 7. Initialize Memory
- Write to MEMORY.md: "Bootstrap completed on [date]. Environment verified. Ready for shadow mode."
- Create first daily memory log: memory/[today's date].md

## After Bootstrap
- This file is no longer needed
- Agent enters normal operating mode
- Heartbeat begins (every 30 minutes)
- Pipeline polling begins (every 60 seconds via daemon)
