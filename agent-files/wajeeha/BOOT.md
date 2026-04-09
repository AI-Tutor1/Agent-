# BOOT.md — Gateway Restart Hook (Wajeeha Agent)
# This runs EVERY TIME the OpenClaw gateway restarts. Keep it lean.

## On Every Restart:
1. Read SOUL.md — confirm prime directive is loaded
2. Read today's memory log (memory/YYYY-MM-DD.md) if it exists
3. Read MEMORY.md for standing rules and lessons learned
4. Check SHADOW_MODE status
5. POST /api/agent/heartbeat — confirm system is alive
6. Check task_queue for any tasks that were in-progress before restart
   - If found: resume from last known step
   - If not: wait for daemon to assign new work
7. Log restart to agent_activity_log: "Gateway restarted at [timestamp]"

## Do NOT:
- Do NOT reload full conversation history
- Do NOT load BOOTSTRAP.md (that's first-run only)
- Do NOT run sync or pipeline — the daemon handles those
- Keep total context under 8KB on startup
