-- ============================================================
-- WAJEEHA DEMO-TO-CONVERSION AGENT — SQL SCHEMA
-- Database: PostgreSQL
-- Owner: Product / Counseling Department
-- Agent: Wajeeha Demo-to-Conversion Agent
-- Version: 1.0 | April 2026
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE 1: conducted_demo_sessions
-- Source: Google Sheet (synced daily)
-- Primary source of truth for all conducted demos
-- ============================================================
CREATE TABLE IF NOT EXISTS conducted_demo_sessions (
    demo_id             VARCHAR(100) PRIMARY KEY,
    demo_date           DATE NOT NULL,
    demo_month          VARCHAR(50),
    teacher_name        VARCHAR(255) NOT NULL,
    student_name        VARCHAR(255) NOT NULL,
    academic_level      VARCHAR(50),
    -- IGCSE / GCSE / AS level / A2 Level / IB / Grade 1-8 / PCE / University
    subject             VARCHAR(255),
    recording_url       TEXT,
    analysis_status     VARCHAR(50) DEFAULT 'pending',
    -- pending / in_progress / partial / complete / escalated
    synced_at           TIMESTAMP DEFAULT NOW(),
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demo_sessions_status ON conducted_demo_sessions(analysis_status);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_teacher ON conducted_demo_sessions(teacher_name);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_date ON conducted_demo_sessions(demo_date);


-- ============================================================
-- TABLE 2: demo_feedback
-- Source: Demo Feedback Form 2.0 (Google Sheet, synced daily)
-- ============================================================
CREATE TABLE IF NOT EXISTS demo_feedback (
    feedback_id             SERIAL PRIMARY KEY,
    timestamp               TIMESTAMP,
    tutor_name              VARCHAR(255),
    student_name            VARCHAR(255),
    subject                 VARCHAR(255),
    session_date            DATE,
    overall_rating_10       INTEGER,
    topic_explained         VARCHAR(10),
    participation           VARCHAR(10),
    confusion_moments       TEXT,
    discomfort_moments      TEXT,
    positive_environment    INTEGER,
    suggestions             TEXT,
    comments_other          TEXT,
    matched_demo_id         VARCHAR(100) REFERENCES conducted_demo_sessions(demo_id) ON DELETE SET NULL,
    match_confidence        VARCHAR(20),    -- exact / fuzzy / unmatched
    created_at              TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_tutor ON demo_feedback(tutor_name);
CREATE INDEX IF NOT EXISTS idx_feedback_student ON demo_feedback(student_name);
CREATE INDEX IF NOT EXISTS idx_feedback_date ON demo_feedback(session_date);


-- ============================================================
-- TABLE 3: demo_conversion_sales
-- Source: Demo to Conversion Sales Google Sheet
-- Updated by Sales team
-- ============================================================
CREATE TABLE IF NOT EXISTS demo_conversion_sales (
    id                  SERIAL PRIMARY KEY,
    demo_date           DATE,
    teacher_name        VARCHAR(255),
    student_name        VARCHAR(255),
    academic_level      VARCHAR(50),
    subject             VARCHAR(255),
    conversion_status   VARCHAR(30),    -- Converted / Not Converted / Pending
    sales_comments      TEXT,
    sales_agent         VARCHAR(100),
    parent_contact      VARCHAR(100),   -- encrypted at rest in production
    matched_demo_id     VARCHAR(100) REFERENCES conducted_demo_sessions(demo_id) ON DELETE SET NULL,
    synced_at           TIMESTAMP DEFAULT NOW(),
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_status ON demo_conversion_sales(conversion_status);
CREATE INDEX IF NOT EXISTS idx_sales_agent ON demo_conversion_sales(sales_agent);
CREATE INDEX IF NOT EXISTS idx_sales_demo_id ON demo_conversion_sales(matched_demo_id);


-- ============================================================
-- TABLE 4: teacher_profiles
-- Master teacher registry — pre-populated with known teachers
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_profiles (
    teacher_id              VARCHAR(50) PRIMARY KEY,
    teacher_name            VARCHAR(255) NOT NULL,
    name_aliases            TEXT[],
    subjects                TEXT[],
    curriculum_codes        TEXT[],
    academic_levels         TEXT[],
    hourly_rate_standard    DECIMAL(10,2),
    hourly_rate_premium     DECIMAL(10,2),
    status                  VARCHAR(20) DEFAULT 'active',
    accent_notes            TEXT,
    demo_guidelines         TEXT,
    avg_student_rating      DECIMAL(4,2),
    avg_analyst_rating      DECIMAL(4,2),
    total_demos             INTEGER DEFAULT 0,
    conversion_rate         DECIMAL(5,2),
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teacher_name ON teacher_profiles(LOWER(teacher_name));
CREATE INDEX IF NOT EXISTS idx_teacher_aliases ON teacher_profiles USING GIN(name_aliases);


-- ============================================================
-- TABLE 5: demo_analysis
-- CORE OUTPUT TABLE — Written by Wajeeha Agent
-- Read by Dawood Agent for review
-- ============================================================
CREATE TABLE IF NOT EXISTS demo_analysis (
    analysis_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demo_id                 VARCHAR(100) REFERENCES conducted_demo_sessions(demo_id),
    demo_date               DATE,
    teacher_name            VARCHAR(255),
    teacher_id              VARCHAR(50),
    student_name            VARCHAR(255),
    academic_level          VARCHAR(50),
    subject                 VARCHAR(255),

    -- Qualitative Analysis (agent-generated)
    teaching_methodology    TEXT,
    topic_selection         TEXT,
    resource_usage          TEXT,
    interactivity_notes     TEXT,
    overall_effectiveness   TEXT,
    improvement_suggestions TEXT,

    -- Ratings
    student_rating_raw      INTEGER,
    student_rating_converted INTEGER,
    analyst_rating          INTEGER,
    feedback_source_id      INTEGER REFERENCES demo_feedback(feedback_id),

    -- POUR Summary
    pour_present            BOOLEAN DEFAULT FALSE,
    pour_categories         TEXT[],

    -- Conversion & Accountability
    conversion_status       VARCHAR(30),
    sales_agent             VARCHAR(100),
    accountability_classification VARCHAR(30),
    accountability_evidence TEXT,
    accountability_confidence VARCHAR(20),

    -- Status & Review
    analysis_status         VARCHAR(30) DEFAULT 'pending_review',
    -- pending_review / approved / rejected / redo
    review_notes            TEXT,
    reviewed_by             VARCHAR(100),
    reviewed_at             TIMESTAMP,

    -- Agent metadata
    agent_confidence        DECIMAL(4,2),
    human_accuracy_score    DECIMAL(4,2),
    processing_time_mins    INTEGER,
    tokens_used             INTEGER,
    shadow_mode             BOOLEAN DEFAULT TRUE,

    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_demo_id ON demo_analysis(demo_id);
CREATE INDEX IF NOT EXISTS idx_analysis_teacher ON demo_analysis(teacher_name);
CREATE INDEX IF NOT EXISTS idx_analysis_status ON demo_analysis(analysis_status);
CREATE INDEX IF NOT EXISTS idx_analysis_conversion ON demo_analysis(conversion_status);
CREATE INDEX IF NOT EXISTS idx_analysis_accountability ON demo_analysis(accountability_classification);


-- ============================================================
-- TABLE 6: pour_flags
-- Granular POUR records — one row per POUR per demo
-- ============================================================
CREATE TABLE IF NOT EXISTS pour_flags (
    pour_id         SERIAL PRIMARY KEY,
    demo_id         VARCHAR(100) REFERENCES conducted_demo_sessions(demo_id),
    analysis_id     UUID REFERENCES demo_analysis(analysis_id),
    pour_category   VARCHAR(30) NOT NULL,
    -- Video/Interaction/Technical/Cancellation/Resources/Time/No Show
    description     TEXT,
    severity        VARCHAR(10),    -- low / medium / high
    delegated_to    VARCHAR(50),    -- Admin / Counselor / Tech / HR
    resolved        BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pour_demo_id ON pour_flags(demo_id);
CREATE INDEX IF NOT EXISTS idx_pour_category ON pour_flags(pour_category);


-- ============================================================
-- TABLE 7: teacher_progress
-- Cumulative teacher performance — updated after every demo
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_progress (
    teacher_id              VARCHAR(50) PRIMARY KEY,
    teacher_name            VARCHAR(255) NOT NULL,
    total_demos             INTEGER DEFAULT 0,
    converted_count         INTEGER DEFAULT 0,
    not_converted_count     INTEGER DEFAULT 0,
    pending_count           INTEGER DEFAULT 0,
    conversion_rate         DECIMAL(5,2),
    avg_student_rating      DECIMAL(4,2),
    avg_analyst_rating      DECIMAL(4,2),
    pour_video_count        INTEGER DEFAULT 0,
    pour_interaction_count  INTEGER DEFAULT 0,
    pour_technical_count    INTEGER DEFAULT 0,
    pour_cancellation_count INTEGER DEFAULT 0,
    pour_resources_count    INTEGER DEFAULT 0,
    pour_time_count         INTEGER DEFAULT 0,
    pour_no_show_count      INTEGER DEFAULT 0,
    product_accountability_count INTEGER DEFAULT 0,
    consecutive_product_flags INTEGER DEFAULT 0,
    review_flag             BOOLEAN DEFAULT FALSE,
    last_demo_date          DATE,
    notes                   TEXT,
    updated_at              TIMESTAMP DEFAULT NOW()
);


-- ============================================================
-- TABLE 8: sheet30
-- Master compilation table — mirrors the Sheet30 tab
-- ============================================================
CREATE TABLE IF NOT EXISTS sheet30 (
    id              SERIAL PRIMARY KEY,
    demo_date       DATE,
    teacher_name    VARCHAR(255),
    student_name    VARCHAR(255),
    academic_level  VARCHAR(50),
    subject         VARCHAR(255),
    conversion_flag VARCHAR(10),
    qualitative_notes TEXT,
    student_rating  INTEGER,
    analyst_rating  INTEGER,
    conversion_status VARCHAR(30),
    sales_comments  TEXT,
    sales_agent     VARCHAR(100),
    accountability_classification VARCHAR(30),
    demo_id         VARCHAR(100) UNIQUE,
    analysis_id     UUID,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sheet30_demo_id ON sheet30(demo_id);
CREATE INDEX IF NOT EXISTS idx_sheet30_teacher ON sheet30(teacher_name);


-- ============================================================
-- TABLE 9: accountability_log
-- Audit trail for all accountability classifications
-- ============================================================
CREATE TABLE IF NOT EXISTS accountability_log (
    log_id              SERIAL PRIMARY KEY,
    demo_id             VARCHAR(100),
    analysis_id         UUID,
    classification      VARCHAR(30),
    evidence_cited      TEXT,
    confidence          VARCHAR(20),
    classified_at       TIMESTAMP DEFAULT NOW(),
    reviewed_by         VARCHAR(100),
    review_outcome      VARCHAR(20)
);


-- ============================================================
-- TABLE 10: notifications
-- Agent-to-agent and agent-to-human notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id     SERIAL PRIMARY KEY,
    recipient           VARCHAR(100),
    type                VARCHAR(50),
    payload             JSONB,
    priority            VARCHAR(10) DEFAULT 'medium',
    status              VARCHAR(20) DEFAULT 'unread',
    shadow_mode         BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW(),
    read_at             TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);


-- ============================================================
-- TABLE 11: escalations
-- Escalation records requiring human or agent review
-- ============================================================
CREATE TABLE IF NOT EXISTS escalations (
    escalation_id       SERIAL PRIMARY KEY,
    demo_id             VARCHAR(100),
    escalation_type     VARCHAR(50),
    reason              TEXT NOT NULL,
    urgency             VARCHAR(10) DEFAULT 'medium',
    status              VARCHAR(20) DEFAULT 'open',
    assigned_to         VARCHAR(100),
    resolution_notes    TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    resolved_at         TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_escalations_demo_id ON escalations(demo_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations(status);


-- ============================================================
-- TABLE 12: agent_activity_log
-- Audit trail for every agent action
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_activity_log (
    log_id          SERIAL PRIMARY KEY,
    agent_name      VARCHAR(50) DEFAULT 'wajeeha_agent',
    action_type     VARCHAR(50),
    demo_id         VARCHAR(100),
    analysis_id     UUID,
    details         JSONB,
    tokens_used     INTEGER,
    duration_ms     INTEGER,
    status          VARCHAR(20),    -- success / failed / partial / skipped
    error_message   TEXT,
    shadow_mode     BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_demo ON agent_activity_log(demo_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON agent_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON agent_activity_log(created_at);


-- ============================================================
-- TABLE 13: task_queue
-- Pending tasks for the agent
-- ============================================================
CREATE TABLE IF NOT EXISTS task_queue (
    task_id         SERIAL PRIMARY KEY,
    task_type       VARCHAR(50),
    demo_id         VARCHAR(100),
    priority        INTEGER DEFAULT 5,
    status          VARCHAR(20) DEFAULT 'queued',
    created_at      TIMESTAMP DEFAULT NOW(),
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_queue_status ON task_queue(status);


-- ============================================================
-- TABLE 14: data_integrity_flags
-- Flags for missing or inconsistent data
-- ============================================================
CREATE TABLE IF NOT EXISTS data_integrity_flags (
    flag_id         SERIAL PRIMARY KEY,
    demo_id         VARCHAR(100),
    issue_type      VARCHAR(50),
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'open',
    resolved_by     VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrity_demo ON data_integrity_flags(demo_id);
CREATE INDEX IF NOT EXISTS idx_integrity_status ON data_integrity_flags(status);


-- ============================================================
-- TABLE 15: counseling_demo_to_conversion
-- Source: Counseling Product Sheet (Demo to Conversion tab)
-- ============================================================
CREATE TABLE IF NOT EXISTS counseling_demo_to_conversion (
    id              SERIAL PRIMARY KEY,
    demo_date       DATE,
    teacher_name    VARCHAR(255),
    teacher_id      VARCHAR(50),
    academic_level  VARCHAR(50),
    subject         VARCHAR(255),
    conversion_flag VARCHAR(10),
    pour_issues     TEXT,
    student_name    VARCHAR(255),
    student_rating  INTEGER,
    analyst_rating  INTEGER,
    matched_demo_id VARCHAR(100),
    synced_at       TIMESTAMP DEFAULT NOW(),
    created_at      TIMESTAMP DEFAULT NOW()
);
