# PIPELINE.md — Wajeeha Demo-to-Conversion Pipeline

## Overview
This pipeline processes every conducted demo session and produces a structured analysis.
It runs automatically when new demo records are synced from Google Sheets.

**Prime Directive**: Every completed demo produces an analysis within 15 minutes.
No demo sits unprocessed. No analysis is sent without human approval.

---

## Pipeline Architecture
- Steps 1-3: Pure code (data retrieval and logging)
- Step 4: **CLAUDE API** (qualitative analysis — this is where AI is needed)
- Steps 5-9: Pure code (data matching, transforms, exports)
- Step 10: **CLAUDE API** (accountability classification — AI needed)
- Step 11: Pure code (database update)

**Token cost per demo**: ~2,500 tokens (Steps 4 and 10 only)
**Processing time target**: Under 5 minutes per demo

---

## STEP 1 — Retrieve Demo Record
**Type**: Pure Code (SQL query)
**Trigger**: New row in conducted_demo_sessions with analysis_status = 'pending'
**Input**: demo_id
**Output**: Full demo record (teacher, student, subject, level, date, curriculum)
**Error**: If demo_id not found → HARD STOP. Write to escalations table. Do not proceed.

```typescript
async function step1_retrieveDemo(demoId: string): Promise<DemoRecord> {
  const demo = await db.query('SELECT * FROM conducted_demo_sessions WHERE demo_id = $1', [demoId]);
  if (!demo) throw new PipelineError('DEMO_NOT_FOUND', `Demo ${demoId} does not exist`);
  await db.query('UPDATE conducted_demo_sessions SET analysis_status = $1 WHERE demo_id = $2', ['in_progress', demoId]);
  return demo;
}
```

---

## STEP 2 — Create Analysis Record
**Type**: Pure Code (SQL INSERT)
**Input**: Demo record from Step 1
**Output**: New row in demo_analysis with status='in_progress'

```typescript
async function step2_createAnalysis(demo: DemoRecord): Promise<string> {
  const analysisId = await db.query(`
    INSERT INTO demo_analysis (demo_id, demo_date, teacher_name, student_name, academic_level, subject, analysis_status)
    VALUES ($1, $2, $3, $4, $5, $6, 'in_progress')
    RETURNING analysis_id
  `, [demo.demo_id, demo.demo_date, demo.teacher_name, demo.student_name, demo.academic_level, demo.subject]);
  return analysisId;
}
```

---

## STEP 3 — POUR Identification
**Type**: Pure Code (rule-based pattern matching)
**Input**: Demo record, feedback data (if available)
**Output**: POUR flags written to pour_flags table

POUR categories and detection rules:
- **Video**: Recording not available (LMS returned 404 or no URL) → severity High
- **Interaction**: Student participation below threshold (fewer than 3 responses in 45 min) → severity Medium
- **Technical**: Connection issues mentioned in session notes → severity Medium
- **Cancellation**: Session cancelled or rescheduled → severity High
- **Resources**: No supplementary materials despite availability → severity Medium
- **Time**: Session significantly shorter/longer than scheduled → severity Low
- **No Show**: Student or teacher did not attend → severity High

```typescript
async function step3_identifyPOUR(demo: DemoRecord, feedback?: FeedbackRecord): Promise<POURFlag[]> {
  const flags: POURFlag[] = [];
  // Rule-based checks — no AI needed
  if (!demo.recording_url) flags.push({ category: 'Video', severity: 'High', description: 'Recording not available' });
  if (feedback?.participation === 'No') flags.push({ category: 'Interaction', severity: 'Medium', description: 'Student participation below threshold' });
  // ... more rules per POUR category
  await db.insertMany('pour_flags', flags);
  return flags;
}
```

---

## STEP 4 — Qualitative Review ⚡ REQUIRES CLAUDE API
**Type**: AI (Claude Sonnet 4)
**Input**: Demo record, feedback, POUR flags, teacher profile
**Output**: Qualitative analysis text for 6 fields
**Token budget**: ~1,500 tokens

### Claude API Prompt Template:
```
You are a senior education quality analyst at Tuitional Education, a premium online tutoring platform.

Analyze this demo tutoring session and provide structured assessment:

DEMO DATA:
- Teacher: {teacher_name}
- Student: {student_name}
- Subject: {subject} ({academic_level})
- Curriculum: {curriculum_board} — {curriculum_code}
- Date: {demo_date}
- Session Notes: {session_notes}
- Student Feedback (raw): {feedback_text}
- Student Rating: {rating}/10
- POUR Flags: {pour_flags}

RESPOND IN EXACTLY THIS JSON FORMAT:
{
  "teaching_methodology": "2-3 sentences on pedagogical approach, pacing, scaffolding",
  "topic_selection": "1-2 sentences on curriculum alignment and relevance",
  "resource_usage": "1-2 sentences on materials, tools, supplementary resources",
  "interactivity_notes": "1-2 sentences on student engagement and questioning techniques",
  "overall_effectiveness": "2-3 sentences on session quality and learning outcomes",
  "improvement_suggestions": "2-3 concrete, actionable improvements",
  "analyst_rating": <1-5 integer>,
  "confidence": <0.0-10.0 float>
}

RULES:
- Be specific. Reference actual subject content, not generic praise.
- Rate conservatively. 5/5 is exceptional. 3/5 is adequate.
- If data is insufficient, say so explicitly and lower confidence.
- Never fabricate details not present in the input.
```

---

## STEP 5 — Fetch Student Feedback
**Type**: Pure Code (SQL query + fuzzy matching)
**Input**: teacher_name, student_name, demo_date
**Output**: Matched feedback record (or null if not found)

Matching logic:
1. Exact match on teacher_name + student_name + date → match_confidence = 'exact'
2. Fuzzy match: teacher_name within ±2 characters, date within ±2 days → match_confidence = 'fuzzy'
3. No match → match_confidence = 'unmatched', log to data_integrity_flags

---

## STEP 6 — Rating Standardization
**Type**: Pure Code (math)
**Input**: Raw rating out of 10 from feedback form
**Output**: Converted rating out of 5

```typescript
function step6_convertRating(rawRating: number): number {
  return Math.ceil(rawRating / 2);  // 10→5, 9→5, 8→4, 7→4, 6→3, etc.
}
```

---

## STEP 7 — Export to Sales Sheet
**Type**: Pure Code (database write)
**Input**: Analysis data, demo data
**Output**: Record in demo_conversion_sales ready for sales team

---

## STEP 8 — Pull Sales Data
**Type**: Pure Code (SQL query)
**Input**: demo_id
**Output**: Conversion status, sales agent, sales comments from demo_conversion_sales table

---

## STEP 9 — Compile Sheet30
**Type**: Pure Code (SQL aggregation)
**Input**: All analysis data for the period
**Output**: Aggregated metrics written to analysis record

---

## STEP 10 — Accountability Classification ⚡ REQUIRES CLAUDE API
**Type**: AI (Claude Sonnet 4)
**Input**: Conversion status, sales comments, qualitative analysis, POUR flags
**Output**: Accountability classification
**Token budget**: ~1,000 tokens
**Only runs when**: conversion_status = 'Not Converted'

### Claude API Prompt Template:
```
You are an accountability analyst at Tuitional Education.
A demo session did NOT convert to a paid enrollment. Classify why.

DATA:
- Teacher: {teacher_name} — Teaching Analysis: {methodology}
- Student: {student_name} — Feedback: {feedback_text}
- Sales Agent: {sales_agent} — Sales Comments: {sales_comments}
- POUR Flags: {pour_flags}
- Conversion Status: Not Converted

CLASSIFY into exactly ONE of:
- "Sales" — Sales agent did not follow up, poor closing, missed opportunities
- "Product" — Teaching quality issues, wrong resource allocation, methodology gaps
- "Consumer" — Parent/student decided against it regardless of quality (price, timing, preference)
- "Mixed" — Multiple factors from different categories

RESPOND IN JSON:
{
  "classification": "Sales|Product|Consumer|Mixed",
  "evidence": "1-2 sentence explanation referencing specific data points",
  "confidence": "high|medium|low"
}
```

---

## STEP 11 — Update Teacher Progress
**Type**: Pure Code (SQL UPDATE)
**Input**: Analysis results, teacher_id
**Output**: Updated teacher_profiles with new averages

```typescript
async function step11_updateTeacherProgress(analysisId: string): Promise<void> {
  await db.query(`
    UPDATE teacher_profiles tp SET
      avg_analyst_rating = (SELECT AVG(analyst_rating) FROM demo_analysis WHERE teacher_name = tp.teacher_name),
      total_demos = (SELECT COUNT(*) FROM demo_analysis WHERE teacher_name = tp.teacher_name),
      conversion_rate = (SELECT
        COUNT(*) FILTER (WHERE conversion_status = 'Converted') * 100.0 / NULLIF(COUNT(*), 0)
        FROM demo_analysis WHERE teacher_name = tp.teacher_name),
      updated_at = NOW()
    WHERE teacher_name = (SELECT teacher_name FROM demo_analysis WHERE analysis_id = $1)
  `, [analysisId]);
}
```

---

## Pipeline Completion
After all 11 steps:
1. Set `demo_analysis.analysis_status = 'pending_review'`
2. Write notification: recipient='dawood_agent', type='demo_ready_for_review'
3. Log completion to agent_activity_log with total duration and tokens
4. If SHADOW_MODE=true: mark notification as shadow_mode=true
