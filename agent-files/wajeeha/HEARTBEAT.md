# HEARTBEAT.md — Recurring Health Check (Every 30 Minutes)

## On Wake:
1. POST /api/agent/heartbeat with agent_name="wajeeha"
2. Check response for pending_tasks count
3. If pending_tasks > 0 and not currently processing: alert main session
4. Check shadow_mode status — respect it
5. If db_status != "ok": write to escalations, notify CTO agent

## Keep this short. Heartbeat should use minimal tokens.
## Use cheapest available model (Haiku or local Ollama).
