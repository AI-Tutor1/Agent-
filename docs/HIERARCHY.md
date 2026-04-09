# HIERARCHY.md — Complete Agent Hierarchy & Organizational Map

## Purpose
This is the definitive map of every person in the organization, their corresponding AI agent,
their reporting lines, communication paths, and build priority.

---

## Visual Hierarchy

```
L0 — PRINCIPAL PLATFORM (CEO Dashboard, Central Locker, Global KB)
│
├── CEO: Husni Mubarak ─── CEO Strategic Intelligence Agent
│   ├── Receives: Daily digest from all 8 departments
│   ├── Decides: Escalated problems, hiring, pricing, partnerships
│   └── Unique: News scraper feeds world/edtech news for strategic context
│
├── L1 — CTO DEPARTMENT ─── Master Agent (own repo, own DB, own backend)
│   └── L2 — Ahmar Hussain (CTO Head Agent)
│       ├── L3 — Mudasir Ahmed (Sr Full Stack Dev Agent) — 160k
│       ├── L3 — Manzar Ahmed (Frontend Dev Agent) — 100k
│       ├── L3 — Ammar Abid (Full Stack Dev Agent) — 300k
│       └── L3 — Ashir Ahsan (QA Agent) — 60k
│
├── L1 — SALES DEPARTMENT ─── Master Agent
│   └── L2 — Ahmed Shaheer (CSO Head Agent)
│       ├── L3 — Maryam Rasheeed (Sr Sales Agent) — 100k
│       └── L3 — Hoor ul Ain Khatri (Sr Sales Agent) — 92k
│
├── L1 — PRODUCT / COUNSELING DEPARTMENT ─── Master Agent ★ PHASE 1 — BUILD FIRST
│   └── L2 — Dawood Larejani (Product Head Agent)
│       └── L3 — Wajeeha Gul (Counseling Agent / Agent One) — 90k
│           ├── L4 — Demo Parser (sub-agent, Haiku)
│           ├── L4 — Teacher Shortlist Retriever (sub-agent, Sonnet)
│           ├── L4 — Proposal Generator (sub-agent, Sonnet)
│           └── L4 — Conversion Tracker (sub-agent, Haiku)
│
├── L1 — STUDENT EXCELLENCE DEPARTMENT ─── Master Agent
│   └── L2 — Alisha Ahmed (Student Excellence Head Agent)
│       ├── L3 — Faizan Salfi (Sr Officer Agent) — 100k
│       ├── L3 — Waleed Kamal (Jr Officer Agent) — 75k
│       └── L3 — Neha Ashar (Manager Agent) — 150k
│
├── L1 — FINANCE DEPARTMENT ─── Master Agent
│   └── L2 — Zeeshan Shaikh (Finance Head Agent)
│       └── L3 — Ayza Shahid (Finance Officer Agent)
│
├── L1 — MARKETING DEPARTMENT ─── Master Agent
│   └── L2 — Mirza Sinan Baig (CMO Head Agent)
│       ├── L3 — Ahtisham (SEO Manager Agent) — 180k
│       └── L3 — Shiza Islam (Meta Ad Manager Agent)
│
├── L1 — HR DEPARTMENT ─── Master Agent
│   └── L2 — Heba (HR Head Agent)
│       └── L3 — Areeba Zaidi (HR Executive Agent) — 6hr/day
│
└── L1 — BUSINESS DEVELOPMENT DEPARTMENT ─── Master Agent
    └── L2 — Jason Mathew (BizDev Head Agent)
        └── L3 — Sara (BizDev Officer Agent) — 90k
```

---

## Agent Count Summary

| Department | Head (L2) | Individual Agents (L3) | Sub-Agents (L4) | Total |
|-----------|-----------|----------------------|-----------------|-------|
| CEO / Board | — | — | — | 1 |
| CTO | Ahmar Hussain | 4 | as needed | 5 |
| Sales | Ahmed Shaheer | 2 | as needed | 3 |
| Product / Counseling | Dawood Larejani | 1 (Wajeeha) | 4 defined | 6 |
| Student Excellence | Alisha Ahmed | 3 | as needed | 4 |
| Finance | Zeeshan Shaikh | 1 (Ayza) | as needed | 2 |
| Marketing | Mirza Sinan Baig | 2 | as needed | 3 |
| HR | Heba | 1 (Areeba) | as needed | 2 |
| Business Dev | Jason Mathew | 1 (Sara) | as needed | 2 |
| **TOTAL** | **8 heads** | **15 individual** | **4+ sub** | **28+** |

---

## Communication Paths (Who Talks to Whom)

### Vertical (Up/Down within department)
```
L4 Sub-Agent → L3 Individual Agent → L2 Lead Agent → L1 Master Agent → L0 CEO
```
Every output flows UP through this chain. No L4 talks directly to L0.

### Horizontal (Cross-department)
```
L2 Head Agent ←→ L2 Head Agent (via shared SQL bus)
```
Cross-department communication ONLY happens between L2 Head Agents.
Individual agents (L3) never communicate directly across departments.

### Escalation Path
```
L3 Agent → L2 Lead Agent → L1 Master Agent → L0 CEO (if needed)
                         → Another L2 Head Agent (if cross-department)
```

### Specific Communication Flows

| From | To | When | Method |
|------|-----|------|--------|
| Wajeeha Agent | Dawood Agent | Analysis ready for review | notification table |
| Dawood Agent | CSO Agent (Ahmed) | Proposal approved, ready for parent | notification table |
| Dawood Agent | CTO Agent (Ahmar) | Data integrity issues | escalation table |
| Dawood Agent | CEO Agent | Weekly report, major escalations | notification table |
| Sales Agents | Wajeeha Agent | Conversion status updated | demo_conversion_sales table |
| Sara Agent | Jason Agent | Warm TuAI lead found | task_queue |
| Finance Agent | CSO Agent | Invoice generated for approved conversion | notification table |
| HR Agent | CEO Agent | New agent creation request with JD | escalation table |
| CEO Agent | All L2 Agents | Strategic directives, decisions | notification table |

---

## Build Priority

| Phase | Agent | Why First |
|-------|-------|-----------|
| Phase 1 (Days 1-90) | Wajeeha (Product/Counseling) | Clearest I/O contract, low risk, high impact, template value |
| Phase 2a (Days 91-120) | Teacher Matching Agent | Receives Wajeeha's output directly |
| Phase 2b (Days 91-120) | Trial Scheduling Agent | 3-way WhatsApp coordination |
| Phase 2c (Days 121-150) | Ayza (Finance) | Invoice on parent approval |
| Phase 2d (Days 121-150) | Sara (BizDev) | TuAI institutional outreach |
| Phase 2e (Days 150-180) | Sales Agents (Maryam, Hoor) | Conversion tracking |
| Phase 3 (Days 181-365) | All remaining departments | Full AI OS |

---

## Agent Creation Protocol (Mandatory for ALL new agents)
1. Request submitted to HR Agent (Heba)
2. HR Agent produces Job Description and onboarding process
3. CEO (Husni Mubarak) reviews and approves
4. CTO (Ahmar) creates git repo, database, backend instance
5. Agent files written in Claude Chat (SOUL, IDENTITY, USER, MEMORY, AGENTS, TOOLS)
6. Files committed to git, deployed to OpenClaw workspace
7. Agent enters 90-day shadow mode
8. No agent is created without this complete sequence
