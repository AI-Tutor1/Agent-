-- ============================================================
-- MIGRATION V2: Data Flow Redesign
-- From 4 manual sheet entry points to 2 API intake endpoints
-- Google Sheets become outputs, not inputs
-- ============================================================

BEGIN;

-- ============================================================
-- 3.1 Add columns to conducted_demo_sessions
-- ============================================================
ALTER TABLE conducted_demo_sessions
  ADD COLUMN IF NOT EXISTS curriculum_board  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS curriculum_code   VARCHAR(50),
  ADD COLUMN IF NOT EXISTS rate_tier         VARCHAR(20),
  ADD COLUMN IF NOT EXISTS pain_points       TEXT,
  ADD COLUMN IF NOT EXISTS session_notes     TEXT,
  ADD COLUMN IF NOT EXISTS submitted_by      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS intake_source     VARCHAR(20) DEFAULT 'platform';

-- ============================================================
-- 3.2 Add columns to demo_conversion_sales
-- ============================================================
ALTER TABLE demo_conversion_sales
  ADD COLUMN IF NOT EXISTS student_feedback_rating  INTEGER,
  ADD COLUMN IF NOT EXISTS student_verbal_feedback  TEXT,
  ADD COLUMN IF NOT EXISTS lost_reasons             JSONB,
  ADD COLUMN IF NOT EXISTS follow_up_plan           VARCHAR(100),
  ADD COLUMN IF NOT EXISTS intake_source            VARCHAR(20) DEFAULT 'platform';

-- ============================================================
-- 3.3 Widen analysis_status to accommodate new values
-- ============================================================
ALTER TABLE conducted_demo_sessions
  ALTER COLUMN analysis_status TYPE VARCHAR(30);

ALTER TABLE demo_analysis
  ALTER COLUMN analysis_status TYPE VARCHAR(30);

-- ============================================================
-- 3.4 New table: form_submissions (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS form_submissions (
  submission_id   SERIAL PRIMARY KEY,
  demo_id         VARCHAR(100),
  form_type       VARCHAR(20) NOT NULL,
  submitted_by    VARCHAR(100) NOT NULL,
  submitted_at    TIMESTAMP DEFAULT NOW(),
  field_data      JSONB NOT NULL,
  sheet_synced    BOOLEAN DEFAULT FALSE,
  sheet_synced_at TIMESTAMP,
  pipeline_triggered BOOLEAN DEFAULT FALSE,
  ip_address      VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_form_sub_demo
  ON form_submissions(demo_id);
CREATE INDEX IF NOT EXISTS idx_form_sub_type
  ON form_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_form_sub_by
  ON form_submissions(submitted_by);

-- ============================================================
-- 3.5 New table: platform_users
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_users (
  user_id       VARCHAR(50) PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE,
  role          VARCHAR(20) NOT NULL,
  dept          VARCHAR(100),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

INSERT INTO platform_users VALUES
  ('u1', 'Wajeeha Gul',          NULL, 'counselor', 'Product / Counseling', true, NOW()),
  ('u2', 'Hoor ul Ain Khatri',   NULL, 'sales',     'Sales',               true, NOW()),
  ('u3', 'Maryam Rasheeed',      NULL, 'sales',     'Sales',               true, NOW()),
  ('u4', 'Dawood Larejani',      NULL, 'dual',      'Product / Counseling', true, NOW()),
  ('u5', 'Ahmed Shaheer',        NULL, 'manager',   'Sales',               true, NOW()),
  ('u6', 'Ahmar Hussain',        NULL, 'admin',     'Technology',          true, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- Unique partial index for sales upsert by matched_demo_id
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_matched_demo_unique
  ON demo_conversion_sales(matched_demo_id)
  WHERE matched_demo_id IS NOT NULL;

COMMIT;
