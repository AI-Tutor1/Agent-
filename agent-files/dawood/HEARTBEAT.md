# HEARTBEAT.md — Recurring Health Check (Every 30 Minutes)

## On Wake:
1. POST /api/agent/heartbeat with agent_name="dawood"
2. Check response for pending_reviews count
3. If pending_reviews > 0 and oldest review is > 2 hours old: send self alert
4. If pending_reviews > 5: flag as backlog, consider prioritizing by confidence (low first)
5. Check shadow_mode status — respect it
6. If any escalations are unresolved for > 4 hours: alert CEO agent

## Review SLA:
- Target: every analysis reviewed within 2 hours of submission
- Alert threshold: any analysis sitting > 2 hours without review action
- Escalation threshold: any analysis sitting > 6 hours → notify CEO

## Keep this short. Use cheapest available model.
