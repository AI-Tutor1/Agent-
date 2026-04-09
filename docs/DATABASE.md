# DATABASE.md — Complete Schema Specification

## Database: PostgreSQL via Supabase
## Owner: Product / Counseling Department (Agent One — Wajeeha)
## Naming Convention: snake_case for tables and columns. Plural table names.

---

## TABLE 1: conducted_demo_sessions
**Source**: Google Sheet (synced every 15 minutes)
**Purpose**: Primary record of all conducted demo tutoring sessions

```sql
CREATE TABLE IF NOT EXISTS conducted_demo_sessions (
    demo_id             VARCHAR(100) PRIMARY KEY,  -- Format: YYYYMMDD_teacher_student
    demo_date           DATE NOT NULL,
    demo_month          VARCHAR(50),
    teacher_name        VARCHAR(255) NOT NULL,
    student_name        VARCHAR(255) NOT NULL,
    academic_level      VARCHAR(50),    -- IGCSE / GCSE / AS / A2 / IB / Grade 1-8 / University
    subject             VARCHAR(255),
    curriculum_board    VARCHAR(100),   -- Pearson Edexcel / Cambridge / AQA / OCR / IB
    curriculum_code     VARCHAR(50),    -- e.g. 4EA1, 0522, 9709
    analysis_status     VARCHAR(50) DEFAULT 'pending',  -- pending / in_progress / partial / complete / escalated
    synced_at           TIMESTAMP DEFAULT NOW(),
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_demo_sessions_status ON conducted_demo_sessions(analysis_status);
CREATE INDEX idx_demo_sessions_teacher ON conducted_demo_sessions(teacher_name);
CREATE INDEX idx_demo_sessions_date ON conducted_demo_sessions(demo_date);
```

---

## TABLE 2: demo_feedback
**Source**: Demo Feedback Form 2.0 (Google Sheet, synced every 15 minutes)
**Purpose**: Student/parent feedback after demo session

```sql
CREATE TABLE IF NOT EXISTS demo_feedback (
    feedback_id             SERIAL PRIMARY KEY,
    timestamp               TIMESTAMP,
    tutor_name              VARCHAR(255),
    student_name            VARCHAR(255),
    subject                 VARCHAR(255),
    session_date            DATE,
    overall_rating_10       INTEGER,        -- Raw rating out of 10
    topic_explained         VARCHAR(10),    -- Yes / No
    participation           VARCHAR(10),    -- Yes / No
    confusion_moments       TEXT,
    discomfort_moments      TEXT,
    positive_environment    INTEGER,        -- 1-5 scale
    suggestions             TEXT,
    comments_other          TEXT,
    matched_demo_id         VARCHAR(100) REFERENCES conducted_demo_sessions(demo_id),
    match_confidence        VARCHAR(20),    -- exact / fuzzy / unmatched
    created_at              TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_tutor ON demo_feedback(tutor_name);
CREATE INDEX idx_feedback_student ON demo_feedback(student_name);
CREATE INDEX idx_feedback_date ON demo_feedback(session_date);
```

---

## TABLE 3: demo_conversion_sales
**Source**: Demo to Conversion Sales Google Sheet
**Purpose**: Sales team's conversion tracking for each demo

```sql
CREATE TABLE IF NOT EXISTS demo_conversion_sales (
    id                  SERIAL PRIMARY KEY,
    demo_date           DATE,
    teacher_name        VARCHAR(255),
    student_name        VARCHAR(255),
    academic_level      VARCHAR(50),
    subject             VARCHAR(255),
    conversion_status   VARCHAR(30),    -- Converted / Not Converted / Pending
    sales_comments      TEXT,
    sales_agent         VARCHAR(100),   -- Maryam / Hoor / Zain / Neha
    parent_contact      VARCHAR(100),   -- encrypted at rest
    matched_demo_id     VARCHAR(100) REFERENCES conducted_demo_sessions(demo_id),
    synced_at           TIMESTAMP DEFAULT NOW(),
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sales_status ON demo_conversion_sales(conversion_status);
CREATE INDEX idx_sales_agent ON demo_conversion_sales(sales_agent);
```

---

## TABLE 4: demo_analysis (CORE OUTPUT — written by Wajeeha Agent)
**Purpose**: The main analytical output. Read by Dawood Agent for review.

```sql
CREATE TABLE IF NOT EXISTS demo_analysis (
    analysis_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demo_id                 VARCHAR(100) REFERENCES conducted_demo_sessions(demo_id),
    demo_date               DATE,
    teacher_name            VARCHAR(255),
    teacher_id              VARCHAR(50),
    student_name            VARCHAR(255),
    academic_level          VARCHAR(50),
    subject                 VARCHAR(255),

    -- Qualitative Analysis (AI-generated in Step 4)
    teaching_methodology    TEXT,
    topic_selection         TEXT,
    resource_usage          TEXT,
    interactivity_notes     TEXT,
    overall_effectiveness   TEXT,
    improvement_suggestions TEXT,

    -- Ratings
    student_rating_raw      INTEGER,        -- Out of 10 from feedback form
    student_rating_converted INTEGER,       -- Out of 5 (raw/2, rounded up)
    analyst_rating          INTEGER,        -- Out of 5, AI-assigned
    feedback_source_id      INTEGER REFERENCES demo_feedback(feedback_id),

    -- POUR Summary
    pour_present            BOOLEAN DEFAULT FALSE,
    pour_categories         TEXT[],

    -- Conversion & Accountability (AI-generated in Step 10)
    conversion_status       VARCHAR(30),
    sales_agent             VARCHAR(100),
    accountability_classification VARCHAR(30),  -- Sales / Product / Consumer / Mixed
    accountability_evidence TEXT,
    accountability_confidence VARCHAR(20),      -- high / medium / low

    -- Review Status
    analysis_status         VARCHAR(30) DEFAULT 'pending_review',
    review_notes            TEXT,
    reviewed_by             VARCHAR(100),
    reviewed_at             TIMESTAMP,

    -- Agent Metadata
    agent_confidence        DECIMAL(4,2),
    human_accuracy_score    DECIMAL(4,2),
    processing_time_mins    INTEGER,
    tokens_used             INTEGER,
    pipeline_version        VARCHAR(20) DEFAULT '1.0',

    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analysis_status ON demo_analysis(analysis_status);
CREATE INDEX idx_analysis_demo ON demo_analysis(demo_id);
CREATE INDEX idx_analysis_teacher ON demo_analysis(teacher_name);
```

---

## TABLE 5: pour_flags
**Purpose**: Individual POUR quality flags per demo

```sql
CREATE TABLE IF NOT EXISTS pour_flags (
    flag_id         SERIAL PRIMARY KEY,
    analysis_id     UUID REFERENCES demo_analysis(analysis_id),
    demo_id         VARCHAR(100),
    category        VARCHAR(50) NOT NULL,  -- Video / Interaction / Technical / Cancellation / Resources / Time / No Show
    severity        VARCHAR(20) NOT NULL,  -- High / Medium / Low
    description     TEXT,
    teacher_name    VARCHAR(255),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pour_analysis ON pour_flags(analysis_id);
CREATE INDEX idx_pour_category ON pour_flags(category);
CREATE INDEX idx_pour_teacher ON pour_flags(teacher_name);
```

---

## TABLE 6: teacher_profiles
**Purpose**: Master teacher database. Read-only for Wajeeha agent.

```sql
CREATE TABLE IF NOT EXISTS teacher_profiles (
    teacher_id          VARCHAR(50) PRIMARY KEY,
    teacher_name        VARCHAR(255) NOT NULL,
    name_aliases        TEXT[],
    subjects            TEXT[],
    curriculum_codes    TEXT[],
    academic_levels     TEXT[],
    hourly_rate_standard DECIMAL(10,2),
    hourly_rate_premium  DECIMAL(10,2),
    status              VARCHAR(20) DEFAULT 'active',
    accent_notes        TEXT,
    demo_guidelines     TEXT,
    avg_student_rating  DECIMAL(4,2),
    avg_analyst_rating  DECIMAL(4,2),
    total_demos         INTEGER DEFAULT 0,
    conversion_rate     DECIMAL(5,2),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teacher_name ON teacher_profiles(LOWER(teacher_name));
CREATE INDEX idx_teacher_aliases ON teacher_profiles USING GIN(name_aliases);
```

---

## TABLE 7: notifications
**Purpose**: Internal notification queue between agents and humans

```sql
CREATE TABLE IF NOT EXISTS notifications (
    id              SERIAL PRIMARY KEY,
    recipient       VARCHAR(100) NOT NULL,   -- agent name or user email
    type            VARCHAR(50) NOT NULL,     -- demo_ready_for_review / escalation / alert / system
    title           VARCHAR(255),
    message         TEXT,
    reference_id    VARCHAR(100),             -- demo_id or analysis_id
    read            BOOLEAN DEFAULT FALSE,
    shadow_mode     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notif_recipient ON notifications(recipient, read);
```

---

## TABLE 8: agent_activity_log
**Purpose**: Audit trail for every agent action

```sql
CREATE TABLE IF NOT EXISTS agent_activity_log (
    id              SERIAL PRIMARY KEY,
    agent_name      VARCHAR(100) NOT NULL,
    action_type     VARCHAR(100) NOT NULL,
    demo_id         VARCHAR(100),
    analysis_id     UUID,
    details         JSONB,
    tokens_used     INTEGER,
    duration_ms     INTEGER,
    status          VARCHAR(20),    -- success / failed / partial / skipped
    error_message   TEXT,
    shadow_mode     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_agent ON agent_activity_log(agent_name);
CREATE INDEX idx_activity_type ON agent_activity_log(action_type);
CREATE INDEX idx_activity_date ON agent_activity_log(created_at);
```

---

## TABLE 9: escalations
**Purpose**: Issues requiring human intervention

```sql
CREATE TABLE IF NOT EXISTS escalations (
    id              SERIAL PRIMARY KEY,
    source_agent    VARCHAR(100),
    severity        VARCHAR(20),        -- critical / high / medium / low
    type            VARCHAR(50),        -- missing_data / api_failure / no_match / policy_violation
    title           VARCHAR(255),
    description     TEXT,
    reference_id    VARCHAR(100),
    resolved        BOOLEAN DEFAULT FALSE,
    resolved_by     VARCHAR(100),
    resolved_at     TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## TABLE 10: data_integrity_flags
**Purpose**: Track data quality issues found during sync

```sql
CREATE TABLE IF NOT EXISTS data_integrity_flags (
    id              SERIAL PRIMARY KEY,
    source_table    VARCHAR(100),
    source_id       VARCHAR(100),
    flag_type       VARCHAR(50),    -- missing_field / unmatched_record / duplicate / format_error
    field_name      VARCHAR(100),
    description     TEXT,
    resolved        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## TABLE 11: task_queue
**Purpose**: Kanban board task management for agent-to-agent dispatch

```sql
CREATE TABLE IF NOT EXISTS task_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    column_status   VARCHAR(30) DEFAULT 'to_do',  -- to_do / doing / needs_input / done / cancelled
    priority        VARCHAR(20) DEFAULT 'medium',  -- urgent / high / medium / low
    assignee_type   VARCHAR(20),                    -- human / agent
    assignee_name   VARCHAR(100),
    due_date        DATE,
    subtasks        JSONB DEFAULT '[]',
    metadata        JSONB DEFAULT '{}',             -- pipeline_step, demo_id, etc.
    created_by      VARCHAR(100),
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_task_assignee ON task_queue(assignee_name, column_status);
CREATE INDEX idx_task_status ON task_queue(column_status);
```

---

## TABLE 12: users (managed by Supabase Auth, extended with profile)
```sql
CREATE TABLE IF NOT EXISTS user_profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name       VARCHAR(255),
    role            VARCHAR(30) NOT NULL,    -- counselor / sales / manager / admin
    department      VARCHAR(100),
    email           VARCHAR(255),
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## TABLE 13: departments
```sql
CREATE TABLE IF NOT EXISTS departments (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    head_name       VARCHAR(255),
    head_agent_name VARCHAR(100),
    total_agents    INTEGER DEFAULT 0,
    active_agents   INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## TABLE 14: sync_log
**Purpose**: Track every Google Sheets sync operation
```sql
CREATE TABLE IF NOT EXISTS sync_log (
    id              SERIAL PRIMARY KEY,
    sheet_name      VARCHAR(100),
    sheet_id        VARCHAR(100),
    rows_fetched    INTEGER,
    rows_inserted   INTEGER,
    rows_updated    INTEGER,
    errors          INTEGER DEFAULT 0,
    duration_ms     INTEGER,
    status          VARCHAR(20),    -- success / partial / failed
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## RLS POLICIES (Applied to all tables)

```sql
-- Example for demo_analysis
ALTER TABLE demo_analysis ENABLE ROW LEVEL SECURITY;

-- Counselors can only see analyses they contributed to
CREATE POLICY counselor_read ON demo_analysis FOR SELECT
    USING (auth.jwt()->>'role' IN ('counselor') AND
           EXISTS (SELECT 1 FROM conducted_demo_sessions WHERE demo_id = demo_analysis.demo_id));

-- Managers see everything in their department
CREATE POLICY manager_read ON demo_analysis FOR SELECT
    USING (auth.jwt()->>'role' IN ('manager', 'admin'));

-- Agents can write (via service role key)
CREATE POLICY agent_write ON demo_analysis FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Apply similar patterns to all tables
```

---

## SEED DATA
Pre-populate `teacher_profiles` with the 25 teachers from the architecture document.
Pre-populate `departments` with the 8 departments and their heads.
Pre-populate `user_profiles` with Wajeeha (counselor), Hoor (sales), Maryam (sales), Dawood (manager).
