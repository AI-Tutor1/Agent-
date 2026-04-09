# BOOT.md — Gateway Restart Hook (Dawood Lead Agent)
# Runs EVERY TIME gateway restarts. Keep lean.

## On Every Restart:
1. Read SOUL.md — confirm review protocol loaded
2. Read today's memory log if it exists
3. Read MEMORY.md for standing rules
4. Check SHADOW_MODE status
5. POST /api/agent/heartbeat
6. Check review queue: GET /api/dashboard/review-queue
   - If analyses pending > 2 hours: flag as urgent
7. Log restart to agent_activity_log

## Keep startup context under 8KB.
