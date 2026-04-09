# SECURITY.md — Non-Negotiable Security Requirements

## Context
Tuitional handles student personal data, parent financial information, and teacher contract details
for a UAE-licensed entity (Sharjah Research & Technology Park, 2022). Security is not optional.

---

## 6 Mandatory Steps (Before ANY Agent Handles Live Data)

1. **WEBUI_SECRET_KEY**: Set to 64-character random string (`openssl rand -hex 32`). Without this, login tokens are predictable.

2. **ENABLE_SIGNUP=False**: Prevent open registration. All accounts created by admin only.

3. **ENABLE_PIP_INSTALL_FRONTMATTER_REQUIREMENTS=False**: Blocks CVE-2026-0765 (CVSS 8.8, UNPATCHED).

4. **Bind all ports to 127.0.0.1**: Docker ports as `127.0.0.1:3000:8080`. Local models have zero auth by default.

5. **UFW firewall**: `default deny incoming`, allow only SSH (22), HTTP (80), HTTPS (443). Docker bypasses UFW — bind to localhost first.

6. **Caddy reverse proxy**: TLS 1.3, auto-certificate renewal, security headers (HSTS, X-Content-Type-Options, X-Frame-Options).

---

## Application Security

### API Authentication
- Dashboard endpoints: Supabase JWT (extracted from auth session)
- Agent endpoints: X-Agent-Token header matching AGENT_INTERNAL_TOKEN env var
- Webhook endpoints: X-Webhook-Secret header matching AGENT_COMMAND_WEBHOOK_SECRET
- Health endpoint: No auth (public)

### Row Level Security (Supabase)
- Every table MUST have RLS enabled
- Counselors: read/write own department data only
- Sales: read/write sales-related tables only
- Managers: read all department data, write reviews
- Admin: full access
- Service role (for agent operations): full access via service role key

### Input Sanitization
- All form inputs sanitized before database insert
- Parent/teacher WhatsApp messages sanitized before agent ingestion (prevent prompt injection)
- File uploads validated for type and size
- SQL parameters always use parameterized queries (never string concatenation)

### API Keys
- NEVER in code, config files, or git commits
- Stored in environment variables (.env.local for dev, Docker secrets for production)
- Rotated every 90 days minimum
- .env files listed in .gitignore

### Rate Limiting
- Dashboard APIs: 100 requests/minute per user
- Agent APIs: 60 requests/minute per agent
- Sync endpoints: 4 requests/hour
- Webhook endpoints: 10 requests/minute

### CORS
- Development: localhost only
- Production: specific domain only (no wildcard)

---

## Production Deployment (NemoClaw)
For production with live student data, deploy NemoClaw:
```bash
git clone https://github.com/NVIDIA/NemoClaw.git
cd NemoClaw && ./install.sh
nemoclaw launch --profile default
```
- Policy-enforced file access (least-privilege)
- All network requests allowlisted and logged
- Secrets isolated, never exposed to agent
- Full audit trail of every action
- Hardware-agnostic (no NVIDIA GPU required)

---

## Data Privacy
- Parent contact information encrypted at rest (Supabase encryption)
- Student PII stripped from agent activity logs
- UAE data residency considered for hosting decisions
- No student data in agent memory files — only anonymized references
