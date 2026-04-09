# ARCHITECTURE.md — Tuitional AI Company OS — Master Overview

## What This System Is
An AI-powered company operating system for Tuitional Education (TuEd) and Tuitional AI (TuAI).
NOT a chatbot. NOT a workflow automation. A full hierarchy of AI agents that work in place of employees,
coordinate with each other, surface decisions for human review, and continuously improve.

---

## The Two Products

| Dimension | Tuitional Education (TuEd) | Tuitional AI (TuAI) |
|-----------|---------------------------|---------------------|
| Type | B2C tutoring service | B2B/B2B2C SaaS platform |
| Revenue | Session fees from Gulf parents | Institutional subscriptions |
| Market | GCC — UAE, Qatar, KSA | Schools globally |
| Curriculum | IGCSE, GCSE, A-Levels, Grades 6-8 | Any curriculum |
| Status | Live — 50,000+ students, 500+ tutors | Developed — seeking clients |
| Agent purpose | Replace ops, sales, scheduling, student success | Replace grading, analytics, content, B2B sales |
| Current volume | 20 inquiries/day, 4 trials/day, 3 conversions/day | No clients yet — pipeline from scratch |

Both share the teacher profile database and LMS backbone but are otherwise independently operated.

---

## Three-Layer Architecture (Builder → Orchestrator → Executor)

### Layer 1 — Coded Infrastructure (Built by Claude Code, runs 24/7)
- Next.js backend with API routes per master agent
- PostgreSQL database via Supabase (SQL mandatory — no exceptions)
- Google Sheets sync (cron every 15 min)
- Pipeline logic (11 steps, 9 are pure code)
- Polling daemon for task dispatch
- Webhook endpoints for external triggers
- Auth system with RLS policies
- Cost: VPS hosting only. Zero AI tokens.

### Layer 2 — OpenClaw Orchestrator (Runs on VPS, always-on)
- Decides WHAT work needs to happen and WHEN
- Dispatches tasks to coded functions or Claude API
- Monitors agent health via heartbeat
- Manages cross-department communication
- Runs daily digests and cron jobs
- Handles escalation decision trees
- Coordinates the 90-day confidence loop
- Cost: Minimal tokens (decision-making only)

### Layer 3 — Claude API Intelligence (Called on-demand)
- Qualitative demo analysis (Pipeline Step 4)
- Accountability classification (Pipeline Step 10)
- Proposal generation (two-option teacher briefs)
- Retention risk analysis
- Content generation for marketing
- CEO strategic synthesis
- Cost: ~2,500 tokens per demo (~$0.01)

---

## Platform Hierarchy (L0 to L4)

| Layer | Name | Description | Technology |
|-------|------|-------------|------------|
| L0 | Principal Platform | Root orchestration. Central file locker, global knowledge base, CEO dashboard. | Angular + Next.js + SQL |
| L1 | Master Agent | One per department. Separate git repo, database, backend. Manages sub-agents. | OpenClaw + Claude Code |
| L2 | Department Lead Agent | Mirrors department head (e.g., Dawood). Reviews sub-agent outputs. Escalates. | OpenClaw sub-agent |
| L3 | Individual Agent | Mirrors specific employee (e.g., Wajeeha). Isolated memory, defined tools, specific scope. | OpenClaw sub-agent |
| L4 | Task Sub-Agent | Spawned for specific task. Lives only for task duration. Minimal context. | Claude Code execution |

---

## Department Structure

| Department | Head | Key Agents | Priority |
|-----------|------|------------|----------|
| Product / Counseling | Dawood Larejani | Wajeeha Gul (Agent One) | Phase 1 — BUILD FIRST |
| Chief Sales Officer | Ahmed Shaheer | Maryam Rasheeed, Hoor ul Ain Khatri | Phase 2 |
| Student Excellence | Alisha Ahmed | Faizan Salfi, Waleed Kamal, Neha Ashar | Phase 2 |
| CTO | Ahmar Hussain | Mudasir Ahmed, Manzar Ahmed, Ammar Abid, Ashir Ahsan | Phase 2 |
| Finance | Zeeshan Shaikh | Ayza Shahid | Phase 2 |
| Marketing (CMO) | Mirza Sinan Baig | Ahtisham (SEO), Shiza Islam (Meta) | Phase 3 |
| HR | Heba | Areeba Zaidi | Phase 3 |
| Business Dev | Jason Mathew | Sara (TuAI outreach) | Phase 3 |
| CEO / Board | Husni Mubarak | CEO Strategic Intelligence Agent | Phase 3 |

---

## Mandatory Isolation Rules (Non-Negotiable)
1. Each master agent: own git repo, own SQL database, own Next.js backend
2. No cross-database queries without explicit API contract
3. Agent-to-agent communication via shared SQL bus message contracts only
4. New agents only after: HR Agent request → HR produces JD → CEO approves
5. SQL is the default database. Any change requires CEO + CTO decision tree approval
6. No agent edits its own SOUL.md or IDENTITY.md

---

## Knowledge Base Architecture

| Knowledge Base | Owner | Contains |
|---------------|-------|----------|
| Master KB | CEO / Principal Platform | All company policies, curriculum guides, agent SOPs, templates |
| Product / Counseling KB | Dawood Agent | Curriculum codes, teacher allocation rubric, exam board guides |
| Sales KB | CSO Agent | Lead qualification rubric, conversion benchmarks, parent personas |
| Student Excellence KB | Alisha Agent | Retention risk model, session quality rubric, progress templates |
| Finance KB | Zeeshan Agent | Rate card, invoice templates, payroll schedule, CAC model |
| Marketing KB | CMO Agent | SEO guidelines, ad copy standards, brand voice, benchmarks |
| HR KB | Heba Agent | JD templates, onboarding checklist, teacher vetting rubric |
| Technology KB | CTO Agent | System architecture, API contracts, deployment guides, security |
| BizDev KB | Jason Agent | Proposal templates, partnership criteria, LinkedIn sequences |

---

## Success Metrics

| Metric | Current | Phase 1 Target | Phase 3 Target |
|--------|---------|----------------|----------------|
| Demo-to-proposal time | Unknown | Under 15 min | Under 8 min |
| Proposal acceptance rate | Unknown | Above 80% | Above 85% |
| Trial conversion rate | ~75% | Maintain 75%+ | Above 80% |
| Invoice generation time | 24-48 hours | Under 5 min | Under 2 min |
| Task completion rate | N/A | Above 99% | Above 99% |
| First pass approval rate | N/A | Above 80% | Above 90% |
| Guard rail violation rate | N/A | Zero tolerance | Zero tolerance |
| Prompt token efficiency | N/A | Baseline | Reduce 20% |
