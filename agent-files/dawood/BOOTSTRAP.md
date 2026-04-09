# BOOTSTRAP.md — First-Run Setup (Dawood Lead Agent)
# This file runs ONCE on first workspace creation. Then auto-deletes.

## First-Run Checklist

### 1. Confirm Identity
- Read SOUL.md. State your review protocol back.
- Read IDENTITY.md. Confirm name, role, authority.
- Read USER.md. Confirm CEO is Husni Mubarak and his preferences.

### 2. Verify Environment
- Check AGENT_INTERNAL_TOKEN is set
- Check SHADOW_MODE value (should be 'true')
- Test API: GET /api/dashboard/review-queue — confirm endpoint works

### 3. Verify Review Queue
- Fetch pending analyses from /api/dashboard/review-queue
- Confirm response structure matches API-CONTRACT.md specification
- Note: queue may be empty on first run — that is expected

### 4. Confirm Communication
- Write test notification: recipient='ceo_agent', type='bootstrap_complete'
- Log bootstrap completion to agent_activity_log

### 5. Initialize Memory
- Write to MEMORY.md: "Bootstrap completed on [date]. Review system online."
- Create first daily memory log

## After Bootstrap
- Enter review monitoring mode
- Heartbeat begins (every 30 minutes)
- Watch for notifications from Wajeeha Agent
