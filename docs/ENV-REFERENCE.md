# ENV-REFERENCE.md — Complete Environment Variables Reference

## All Variables Needed for the System
Copy this to `.env.local` for development and `.env.production` for deployment.
NEVER commit .env files to git. Add to .gitignore.

```bash
# ============================================================
# DATABASE (Supabase)
# ============================================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# ============================================================
# GOOGLE SHEETS API
# ============================================================
# Paste full service account JSON as single line
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# Pre-configured Sheet IDs (do not change)
SHEET_CONDUCTED_DEMOS=1mmeidiQdNMrUcgTPGAIqydjgIKoIEjvAB0DUZDHjVXo
SHEET_COUNSELING_PRODUCT=1DkNhYdGzsBNWe-hP1CTc2ySp9daFOhOiZj6yAPQnXok
SHEET_DEMO_FEEDBACK=187Y-zBiHhyW9sbSfxxQeWCZiAKgvMD5ClmKZDIN0BBk
SHEET_DEMO_CONVERSION_SALES=1Frhd1bKUKuQXu-5hpUJ6kxJbI9iv9gInl2I8Sw-AUw0

# ============================================================
# AI MODEL (Anthropic Claude API)
# ============================================================
ANTHROPIC_API_KEY=sk-ant-...

# ============================================================
# AGENT SECURITY
# ============================================================
# Generate with: openssl rand -hex 32
AGENT_INTERNAL_TOKEN=your-64-char-hex-token
AGENT_COMMAND_WEBHOOK_SECRET=your-webhook-secret

# ============================================================
# APPLICATION MODE
# ============================================================
SHADOW_MODE=true
# true = agents run but send NO external notifications
# false = agents are live, approved outputs reach parents/teachers

# ============================================================
# OPENCLAW (configured on VPS after deployment)
# ============================================================
OPENCLAW_WORKSPACE_ID=wajeeha-product
# OpenClaw reads these from environment, not from config files

# ============================================================
# LMS INTEGRATION (mock until API docs provided)
# ============================================================
LMS_API_BASE_URL=https://mock.tuitional.lms/api
LMS_API_KEY=mock-key

# ============================================================
# AUTHENTICATION
# ============================================================
AUTH_MODE=supabase
# In production: supabase
# For initial testing without Supabase auth: mock

# ============================================================
# CRON / DAEMON
# ============================================================
SYNC_INTERVAL_MS=900000
# 900000 = 15 minutes for Google Sheets sync
POLL_INTERVAL_MS=60000
# 60000 = 60 seconds for task daemon polling
CRON_SECRET=your-cron-secret
# Used to authenticate scheduled edge function calls

# ============================================================
# SECURITY (OpenClaw specific — set on VPS)
# ============================================================
WEBUI_SECRET_KEY=your-64-char-random-string
ENABLE_SIGNUP=False
ENABLE_PIP_INSTALL_FRONTMATTER_REQUIREMENTS=False

# ============================================================
# OPTIONAL — Future Integrations
# ============================================================
# WHATSAPP_API_KEY=
# WHATSAPP_PHONE_NUMBER=
# TELEGRAM_BOT_TOKEN=
# DISCORD_BOT_TOKEN_RAY=
# DISCORD_BOT_TOKEN_DAWOOD=
# RESEND_API_KEY=
# AGENTMAIL_API_KEY=
```

## Security Rules for Environment Variables
1. NEVER put these in code, config files, or commit to git
2. Development: `.env.local` file (listed in .gitignore)
3. Production: Docker secrets or VPS environment exports
4. Rotate every 90 days minimum
5. If ANY key is accidentally exposed: revoke immediately, generate new one
6. OpenClaw agents access via `process.env.VARIABLE_NAME` — never log the value
