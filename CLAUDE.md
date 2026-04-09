# CLAUDE.md — Tuitional AI Company Operating System

## Who You Are
You are the senior full-stack engineer building the Tuitional AI Company OS.
You are building production infrastructure — not a prototype, not a demo, not a UI mockup.
Every file you create will be deployed on a VPS and run 24/7 with real student data.

## What You Are Building
An AI-powered company operating system for Tuitional Education (Dubai-based online tutoring, 50K+ students, 500+ tutors).
The system has THREE layers:
1. **Coded Infrastructure** (you build this) — Next.js backend, PostgreSQL database, API routes, Google Sheets sync, pipeline logic, webhook endpoints, cron jobs, polling daemon. Runs 24/7 with ZERO AI cost.
2. **OpenClaw Orchestrator** (configured later) — Dispatches tasks, makes decisions, manages agent coordination. You prepare the hooks for it.
3. **Claude API Intelligence** (called sparingly) — Only for tasks requiring reasoning: qualitative analysis, accountability classification, proposal generation. You write the integration points.

## The Golden Rule
**Code everything that CAN be coded. Use AI only for what REQUIRES intelligence.**
- SQL queries = code. Database writes = code. Data transforms = code. API calls = code.
- Analyzing teaching quality from session notes = AI. Classifying accountability for non-conversion = AI.
- If a step can be an if/else or a SQL query, it MUST be code, not an AI call.

## Stack
- **Runtime**: Node.js + TypeScript (strict mode)
- **Backend**: Next.js API routes (one instance per master agent)
- **Database**: PostgreSQL via Supabase (SQL is mandatory — no other DB without CEO/CTO approval)
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **External APIs**: Google Sheets API, Anthropic Claude API, WhatsApp Business API (future)
- **Auth**: Supabase Auth with RLS policies
- **Deployment**: VPS (Ubuntu), Caddy reverse proxy, Docker optional

## Before You Write ANY Code
1. Read `/docs/ARCHITECTURE.md` — master overview. Two products, three layers, departments.
2. Read `/docs/CONTEXT.md` — Tuitional business brain. Products, customers, pricing, communication style, business rules.
3. Read `/docs/HIERARCHY.md` — complete org chart. Every person → agent → sub-agent → reporting line.
4. Read `/docs/BUILD-SEQUENCE.md` — phased build plan. WHAT to build and in WHAT order.
5. For database work, read `/docs/DATABASE.md` — every table, column, index, RLS policy.
6. For pipeline work, read `/docs/PIPELINE.md` — the 11-step Wajeeha agent pipeline.
7. For API work, read `/docs/API-CONTRACT.md` — every endpoint, request/response format.
8. For integrations, read `/docs/GOOGLE-SHEETS.md` or `/docs/OPENCLAW-BRIDGE.md`.
9. For orchestration, read `/docs/ORCHESTRATION.md` — task flow, 8-phase pipeline, agent communication, cron jobs, daily digest, token optimization, escalation tree.
10. For shadow mode, read `/docs/SHADOW-MODE.md` — 90-day confidence loop, scoring, comparison engine, graduation criteria.
11. For skills, read `/docs/SKILLS.md` — what each agent can do, skill definitions, development rules.
12. For security, read `/docs/SECURITY.md` — non-negotiable requirements.
13. For ANY UI work, read `/docs/DESIGN.md` — complete design system. Colors, fonts, components, layout. No exceptions.
14. For environment variables, read `/docs/ENV-REFERENCE.md` — every variable, security rules.
15. For deployment, read `/docs/DEPLOYMENT.md` — VPS setup, systemd services, Caddy, cron, NemoClaw.
16. For memory engine, read `/docs/CONTEXTENGINE.md` — the 6 lifecycle hooks, compaction protection, RAG, sub-agent isolation, memory backup protocol.

## Architecture Rules (Non-Negotiable)
- Each master agent gets its own git repo, database, and backend. No shared codebases.
- Agent-to-agent communication via defined message contracts in shared SQL bus. No direct function calls.
- New agents only after HR Agent request → CEO approval sequence.
- All API keys in environment variables or Docker secrets. NEVER in config files or code.
- Every database write must have a timestamp. Every agent action must be logged.
- Shadow mode must be respected: when SHADOW_MODE=true, no external notifications, no parent-facing actions.

## Error Handling Rules
- Never throw from a pipeline step (except Step 1 — demo not found is a hard stop).
- All other steps degrade gracefully: log error, set field to null, continue.
- Database failures: retry 3x with exponential backoff (100ms, 200ms, 400ms).
- Claude API failures: retry once after 2 seconds. On second failure, set confidence=0, write to escalations.
- Google Sheets failures: log and skip that sheet. Never fail the entire sync.

## What You Must NEVER Do
- Never use localStorage or sessionStorage for data persistence. Use Supabase.
- Never hardcode mock data in production code. All data comes from the database.
- Never skip RLS policies. Every table must have row-level security.
- Never put API keys in code, config files, or commit them to git.
- Never build UI-only features. Every UI element must connect to a real API endpoint.
- Never use `any` type in TypeScript. Strict types for everything.
- Never skip error handling. Every async operation needs try/catch.
- Never modify the database schema without updating `/docs/DATABASE.md`.

## File Organization
```
/src
  /app              — Next.js pages and API routes
    /api             — All backend API endpoints
      /agent         — Agent-facing endpoints (task polling, status updates)
      /dashboard     — Dashboard-facing endpoints (review queue, analytics)
      /sync          — Google Sheets sync endpoints
      /webhooks      — Incoming webhook handlers
  /components        — React UI components
  /lib               — Shared utilities, database client, API helpers
    /db              — Database queries and migrations
    /pipeline        — Pipeline step implementations
    /sync            — Google Sheets sync logic
    /ai              — Claude API integration (ONLY for steps that need AI)
  /types             — TypeScript type definitions
  /config            — Configuration and constants
/docs                — Architecture and specification documents
/scripts             — Deployment scripts, cron jobs, daemon
/sql                 — Database migrations
/agent-files         — OpenClaw agent configuration (SOUL.md, IDENTITY.md, etc.)
```

## Commit Discipline
- Every commit must have a meaningful message describing what was built.
- Group related changes in one commit. Database schema + API route + types = one commit.
- Never commit `.env` files, API keys, or secrets.
- Tag releases: v0.1.0 = database + auth, v0.2.0 = pipeline, v0.3.0 = dashboard, etc.

## When In Doubt
Read the relevant `/docs` file. The specification documents are the source of truth.
If the spec doesn't cover your question, ask — don't assume.
