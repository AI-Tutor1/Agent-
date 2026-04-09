# TOOLS.md — Available Tools and Environment

## Runtime
- OpenClaw v2026.3.7+
- Execution Engine: Claude Code (for complex tasks)
- Database: PostgreSQL via Supabase

## API Endpoints
- Base URL: Set in env AGENT_COMMAND_API_URL
- Auth: Set in env AGENT_INTERNAL_TOKEN (pass as X-Agent-Token header)
- Tasks: GET /api/agent/tasks, POST /api/agent/tasks, PATCH /api/agent/tasks/:id
- Logging: POST /api/agent/log
- Heartbeat: POST /api/agent/heartbeat
- Identity: POST /api/agent/identity

## Google Sheets (Read via sync — do not access directly)
- Conducted Demos: 1mmeidiQdNMrUcgTPGAIqydjgIKoIEjvAB0DUZDHjVXo
- Counseling Product: 1DkNhYdGzsBNWe-hP1CTc2ySp9daFOhOiZj6yAPQnXok
- Feedback Form: 187Y-zBiHhyW9sbSfxxQeWCZiAKgvMD5ClmKZDIN0BBk
- Sales Conversion: 1Frhd1bKUKuQXu-5hpUJ6kxJbI9iv9gInl2I8Sw-AUw0

## Environment Variables (Never log these)
- AGENT_INTERNAL_TOKEN (auth for API calls)
- ANTHROPIC_API_KEY (for Claude API — Steps 4 and 10)
- SUPABASE_URL, SUPABASE_ANON_KEY (database access)
- SHADOW_MODE (true = no external notifications)

## Risky Commands (Require human confirmation)
- DELETE and DROP SQL statements
- Any modification to teacher_profiles
- Any direct communication to parents or external parties
- Any change to SOUL.md or IDENTITY.md
