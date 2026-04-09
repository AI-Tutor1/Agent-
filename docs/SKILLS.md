# SKILLS.md — Agent Skills Registry

## Purpose
Every agent has defined skills — modular capabilities it can execute.
Skills are NOT personality traits. They are concrete, testable actions.
This registry defines what each agent CAN do, CANNOT do, and what skills are planned.

---

## What Makes a Skill

A skill has:
- **Name**: What it's called (e.g., "demo-analysis")
- **Type**: coded (pure function) | ai-powered (needs Claude API) | hybrid
- **Input**: What data it needs
- **Output**: What it produces
- **Owner**: Which agent has this skill
- **Dependencies**: What tools/APIs/tables it needs

---

## Wajeeha Agent — Skills

### Skill 1: demo-intake-processing
- **Type**: coded
- **Input**: New row in conducted_demo_sessions
- **Output**: Analysis record created, POUR flags identified
- **Steps**: Retrieve demo → create analysis record → identify POUR flags
- **API cost**: Zero (pure SQL/code)

### Skill 2: qualitative-demo-analysis
- **Type**: ai-powered (Claude Sonnet)
- **Input**: Demo record, feedback, POUR flags, teacher profile
- **Output**: 6-field qualitative analysis with confidence score
- **Token budget**: ~1,500 tokens per demo
- **Prompt template**: See /docs/PIPELINE.md Step 4

### Skill 3: feedback-matching
- **Type**: coded
- **Input**: Teacher name, student name, demo date
- **Output**: Matched feedback record with confidence level (exact/fuzzy/unmatched)
- **Logic**: Exact match → fuzzy (Levenshtein ≤ 3, date ±2 days) → unmatched

### Skill 4: rating-standardization
- **Type**: coded
- **Input**: Raw rating out of 10
- **Output**: Converted rating out of 5
- **Logic**: Math.ceil(raw / 2)

### Skill 5: accountability-classification
- **Type**: ai-powered (Claude Sonnet)
- **Input**: Conversion status, sales comments, analysis, POUR flags
- **Output**: Classification (Sales/Product/Consumer/Mixed) with evidence
- **Token budget**: ~1,000 tokens
- **Prompt template**: See /docs/PIPELINE.md Step 10
- **Trigger**: Only when conversion_status = 'Not Converted'

### Skill 6: teacher-progress-tracking
- **Type**: coded
- **Input**: Completed analysis
- **Output**: Updated teacher averages (rating, conversion rate, total demos)
- **Logic**: SQL aggregate queries on demo_analysis table

### Skill 7: data-sync
- **Type**: coded
- **Input**: Google Sheets API
- **Output**: Synced rows in 4 database tables
- **Frequency**: Every 15 minutes via cron
- **Spec**: See /docs/GOOGLE-SHEETS.md

---

## Dawood Agent — Skills

### Skill 1: analysis-review
- **Type**: hybrid (code for queue management, AI for quality judgment)
- **Input**: Pending analysis from Wajeeha
- **Output**: Approve / Reject (with reason) / Redo (with instructions)
- **SLA**: Within 2 hours of submission

### Skill 2: quality-audit
- **Type**: ai-powered
- **Input**: 3 random approved analyses per week
- **Output**: Quality drift assessment, recommendations
- **Frequency**: Every Wednesday

### Skill 3: weekly-reporting
- **Type**: hybrid
- **Input**: Week's metrics from analytics endpoint
- **Output**: Formatted report for CEO with metrics, escalations, recommendations
- **Frequency**: Every Friday

### Skill 4: escalation-routing
- **Type**: coded
- **Input**: Escalation from Wajeeha or system
- **Output**: Routed to correct department head or CEO
- **Logic**: Decision tree based on escalation type

### Skill 5: cross-department-coordination
- **Type**: hybrid
- **Input**: Approved proposal ready for parent
- **Output**: Task created for Sales agent with all proposal details
- **Communication**: Via task_queue and notifications tables

---

## Future Agent Skills (Phase 2+)

### Teacher Matching Agent
- curriculum-alignment-check (coded)
- teacher-shortlist-generation (ai-powered)
- proposal-formatting (coded — Tuitional brief template)
- two-option-presentation (hybrid)

### Trial Scheduling Agent
- three-way-scheduling (coded — WhatsApp API + calendar)
- reminder-management (coded — cron-based)
- schedule-conflict-detection (coded)

### Finance Agent (Ayza)
- invoice-generation (coded — PDF generation)
- payment-tracking (coded — LMS payment module)
- payroll-calculation (coded — runs 10th of each month)
- financial-reconciliation (coded — monthly)

### Sara BizDev Agent
- linkedin-prospecting (hybrid — scraping + AI personalization)
- email-campaign-creation (ai-powered — pain-agitate-solution framework)
- lead-enrichment (coded — Apify integration)
- proposal-drafting (ai-powered)
- pipeline-management (coded — CRM updates)

### CEO Strategic Intelligence Agent
- daily-digest-compilation (hybrid)
- news-scraping (coded — RSS feeds, industry news)
- cross-department-synthesis (ai-powered — Claude Opus)
- board-report-generation (ai-powered)

---

## Skill Development Rules
1. Every new skill must have: name, type, input, output, owner, test criteria
2. Skills are stored in `/agent-files/{agent}/skills/` as individual .md files
3. Coded skills must have unit tests before deployment
4. AI-powered skills must have prompt templates with example I/O
5. New skills only added after testing in shadow mode
6. Skills can be shared across agents via AGENTS.md reference
7. Skill Factory (future): agents can create new skills from API docs, videos, or templates
