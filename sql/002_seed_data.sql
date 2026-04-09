-- Migration 002: Seed Data for Tuitional AI OS

-- ============================================================
-- 25 Teachers from teacher_profiles
-- ============================================================
INSERT INTO teacher_profiles (teacher_id, teacher_name, subjects, status, hourly_rate_standard, hourly_rate_premium)
VALUES
  ('T001', 'Inayat Karim',     ARRAY['Mathematics', 'Further Mathematics'],                   'active', 45.00, 60.00),
  ('T002', 'Zehra Saleem',     ARRAY['English Language', 'English Literature'],               'active', 40.00, 55.00),
  ('T003', 'Ahrar',            ARRAY['Biology', 'Chemistry'],                                 'active', 40.00, 55.00),
  ('T004', 'Moazzam Malik',    ARRAY['Mathematics', 'Further Mathematics'],                   'active', 45.00, 60.00),
  ('T005', 'Vivek Madan',      ARRAY['Business Studies', 'Economics', 'Accounting'],          'active', 40.00, 55.00),
  ('T006', 'Faiza Khalid',     ARRAY['Biology', 'Chemistry'],                                 'active', 40.00, 55.00),
  ('T007', 'Alishba Shahzad',  ARRAY['English Language', 'English Literature'],               'active', 40.00, 55.00),
  ('T008', 'Nageena Arif',     ARRAY['Mathematics', 'Science', 'Biology'],                   'active', 40.00, 55.00),
  ('T009', 'Mahnoor Gul',      ARRAY['English Language', 'Mathematics'],                     'active', 40.00, 55.00),
  ('T010', 'Sophia Abid',      ARRAY['Psychology', 'Biology'],                               'active', 40.00, 55.00),
  ('T011', 'Musharraf Ramzy',  ARRAY['Chemistry', 'Biology'],                                'active', 40.00, 55.00),
  ('T012', 'Raheel Nasser',    ARRAY['Business Studies', 'Economics'],                       'active', 40.00, 55.00),
  ('T013', 'Ahmed Shaheer',    ARRAY['Biology', 'Chemistry'],                                'active', 40.00, 55.00),
  ('T014', 'Laiba Nadeem',     ARRAY['English Language', 'Science'],                         'active', 40.00, 55.00),
  ('T015', 'Abdur Rehman',     ARRAY['Business Studies', 'Accounting', 'Economics'],         'active', 40.00, 55.00),
  ('T016', 'Maryam Imran',     ARRAY['Physics', 'Science'],                                  'active', 40.00, 55.00),
  ('T017', 'Hassam Umer',      ARRAY['Mathematics', 'Physics'],                              'active', 45.00, 60.00),
  ('T018', 'Faizan Altaf',     ARRAY['Physics', 'Mathematics'],                              'active', 45.00, 60.00),
  ('T019', 'Ali Akbar',        ARRAY['Mathematics', 'Computer Science'],                     'active', 40.00, 55.00),
  ('T020', 'Basma',            ARRAY['Mathematics', 'Further Mathematics'],                  'active', 40.00, 55.00),
  ('T021', 'Dur e Kashaf',     ARRAY['Chemistry', 'Biology'],                               'active', 40.00, 55.00),
  ('T022', 'Samina Kausar',    ARRAY['Chemistry'],                                           'active', 40.00, 55.00),
  ('T023', 'Rizwan Anwer',     ARRAY['Mathematics', 'Further Mathematics'],                  'active', 45.00, 60.00),
  ('T024', 'Sara Jawaid',      ARRAY['Mathematics', 'Biology'],                              'active', 40.00, 55.00),
  ('T025', 'Hira Saeed',       ARRAY['Geography', 'ESS', 'ICT'],                            'active', 40.00, 55.00)
ON CONFLICT (teacher_id) DO NOTHING;

-- ============================================================
-- 8 Departments
-- ============================================================
INSERT INTO departments (id, name, head_name, head_agent_name, total_agents, active_agents)
VALUES
  ('cto',       'Chief Technology Officer',      'Ahmar Hussain',    'cto_agent',       4, 2),
  ('sales',     'Chief Sales Officer',           'Ahmed Shaheer',    'cso_agent',       3, 2),
  ('product',   'Head of Product / Counseling',  'Dawood Larejani',  'dawood_agent',    2, 1),
  ('excellence','Head of Student Excellence',    'Alisha Ahmed',     'excellence_agent',4, 3),
  ('finance',   'Head of Financial Planning',    'Zeeshan Shaikh',   'finance_agent',   2, 1),
  ('marketing', 'Chief Marketing Officer',       'Mirza Sinan Baig', 'marketing_agent', 3, 2),
  ('hr',        'Head of Human Resources',       'Heba',             'hr_agent',        2, 0),
  ('bizdev',    'Head of Business Development',  'Jason Mathew',     'bizdev_agent',    2, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4 Initial Users (user_profiles)
-- NOTE: user_profiles.id references auth.users(id) via Supabase Auth.
-- These inserts require matching UUIDs to exist in auth.users first.
-- On Supabase: create users via Auth dashboard or API, then run this
-- with their actual UUIDs. The values below are placeholders.
-- Uncomment and replace UUIDs after creating Supabase Auth users:
--
-- INSERT INTO user_profiles (id, full_name, role, department, email)
-- VALUES
--   ('REPLACE_WITH_SUPABASE_UUID', 'Wajeeha Gul',        'counselor', 'Product / Counseling', 'wajeeha@tuitional.ai'),
--   ('REPLACE_WITH_SUPABASE_UUID', 'Hoor ul Ain Khatri', 'sales',     'Sales',                'hoor@tuitional.ai'),
--   ('REPLACE_WITH_SUPABASE_UUID', 'Maryam Rasheeed',    'sales',     'Sales',                'maryam@tuitional.ai'),
--   ('REPLACE_WITH_SUPABASE_UUID', 'Dawood Larejani',    'manager',   'Product / Counseling', 'dawood@tuitional.ai')
-- ON CONFLICT (id) DO NOTHING;
-- ============================================================
