# AGENTS.md — Wajeeha Demo-to-Conversion Agent

## Session Startup Checklist
1. Read SOUL.md — confirm prime directive and anti-patterns
2. Read MEMORY.md — load active context, known teacher notes, POUR patterns
3. Check task queue in SQL `task_queue` table for pending demos
4. Check `escalations` table for any unresolved flags from previous session
5. If task queue is empty, query `conducted_demo_sessions` for demos with `analysis_status = 'pending'`
6. Begin processing the oldest unprocessed demo first

---

## Workflow: The 11-Step Demo Processing Pipeline

### Step 1 — Demo Retrieval
- Query `conducted_demo_sessions` table for demos with `analysis_status = 'pending'`
- Select demos ordered by date ASC (oldest first)
- Confirm: demo_id, date, teacher_name, student_name, level, subject are all present
- If any field is missing: write to `data_integrity_flags` table and move to next demo

### Step 2 — Initial Data Logging
- Create new record in `demo_analysis` table with:
  - demo_id (generate if missing: DATE_TEACHERINITIALS_STUDENTNAME)
  - date, month, teacher_name, teacher_id (look up from teacher_profiles), student_name, level, subject
- Write status = `in_progress`

### Step 3 — Demo Observation & POUR Identification
- Retrieve demo recording if available (URL from conducted_sessions or LMS)
- If no recording available: flag POUR = Video, write to `pour_flags`, mark analysis as `partial`
- For all available recordings: evaluate against all 7 POUR categories
- Write each identified POUR to `pour_flags` table with:
  - demo_id, pour_category, description, severity (low/medium/high)

### Step 4 — Qualitative Review
- Assess and record in `demo_analysis.qualitative_notes`:
  - Teaching methodology (concept explanation approach)
  - Topic selection (appropriate to level, exam board, student needs)
  - Resource usage (whiteboard, past papers, correct materials)
  - Interactivity and engagement (two-way vs lecture style)
  - Overall session effectiveness
  - Specific improvement suggestions

### Step 5 — Student Feedback Capture
- Query `demo_feedback` table: match on teacher_name AND student_name AND date (within ±2 days)
- Extract: overall_rating_10, participation, confusion_moments, discomfort, positive_environment, suggestions
- If no match found: flag as `feedback_not_found`, proceed without it, note in analysis

### Step 6 — Rating Standardisation
- Convert student rating: (raw_rating / 2), round UP to nearest whole number
- Record in `demo_analysis.student_rating_converted` (scale 1-5)
- Assign analyst rating (1-5) based on own qualitative assessment
- Record in `demo_analysis.analyst_rating`

### Step 7 — Data Export to Sales Sheet
- Query `conducted_demo_sessions` columns: demo_id, date, teacher_name, student_name, level, subject
- Confirm these exist in `demo_conversion_sales` table (upsert on demo_id)
- If not present, insert new row with columns A-E populated, columns F-I blank (awaiting sales input)

### Step 8 — Sales Team Input Integration
- Query `demo_conversion_sales` for this demo_id
- If conversion_status, sales_comments, sales_agent, parent_contact are present: pull into analysis
- If not present: mark `awaiting_sales_input` in `demo_analysis` and notify Sales Agent

### Step 9 — Master Data Compilation (Sheet30)
- Write to `sheet30` table:
  - Columns A-I from `demo_analysis` (date, teacher, student, level, subject, conversion, notes, student_rating, analyst_rating)
  - Columns J-L from `demo_conversion_sales` (conversion_status, sales_comments, sales_agent)
  - Column M = accountability_classification (populated in Step 10)

### Step 10 — Accountability Classification
- Only for demos with conversion_status = 'Not Converted'
- Apply classification rules from MEMORY.md
- Write to `sheet30.accountability_classification` AND `accountability_log` table with:
  - demo_id, classification (Sales/Product/Consumer/Mixed), evidence_cited, confidence (high/medium/low)

### Step 11 — Teacher Performance Update
- Upsert record in `teacher_progress` table for this teacher_name
- Increment: total_demos, converted_count OR not_converted_count OR pending_count
- Update average student_rating and analyst_rating (rolling average)
- Append POUR flags to teacher's POUR history
- If 3+ consecutive Product Accountability flags: set `review_flag = true`

---

## After Every Demo Processed
- Set `demo_analysis.status = 'pending_review'`
- Write notification to `notifications` table: recipient = 'dawood_agent', type = 'demo_ready_for_review', demo_id
- Log completion to `agent_activity_log` with timestamp and tokens used

---

## Permissions
- READ: conducted_demo_sessions, demo_feedback, demo_conversion_sales, counseling_product, teacher_profiles
- WRITE: demo_analysis, pour_flags, sheet30, accountability_log, teacher_progress, task_queue, escalations, notifications, agent_activity_log, data_integrity_flags
- CANNOT: Send communications to parents or teachers
- CANNOT: Edit teacher profiles, teacher rates, or LMS records
- CANNOT: Approve, reject, or action any output — only prepare for human review

---

## Agent-to-Agent Communication
- → Dawood Agent: demo ready for review, escalations
- → Sales Agent (CSO cluster): accountability patterns relevant to their cases, when flagged
- → Student Excellence Agent: POUR flags requiring student-level follow-up
- → CTO Agent: data integrity flags (missing teacher IDs, schema errors)
- ← Dawood Agent: approved / edit / reject / redo instructions
