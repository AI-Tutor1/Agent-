-- ============================================================
-- SEED DATA — Wajeeha Demo-to-Conversion Agent
-- 5 test records covering different pipeline scenarios
-- Uses real teacher names, fake student contact details
-- ============================================================

-- Teacher profiles (stubs — rates/codes to be filled from real data)
INSERT INTO teacher_profiles (teacher_id, teacher_name, subjects, academic_levels, status) VALUES
('inayat_karim',      'Inayat Karim',      ARRAY['Maths'],          ARRAY['IGCSE','GCSE'],    'active'),
('alishba_shahzad',   'Alishba Shahzad',   ARRAY['English'],        ARRAY['Grade 1-8'],       'active'),
('nageena_arif',      'Nageena Arif',      ARRAY['Maths','Science'],ARRAY['Grade 1-8'],       'active'),
('mahnoor_gul',       'Mahnoor Gul',       ARRAY['English'],        ARRAY['IGCSE','GCSE'],    'active'),
('zehra_saleem',      'Zehra Saleem',      ARRAY['English'],        ARRAY['IGCSE','AS level'],'active'),
('ahrar',             'Ahrar',             ARRAY['Biology','Science'],ARRAY['IGCSE','AS level'],'active'),
('moazzam_malik',     'Moazzam Malik',     ARRAY['Maths'],          ARRAY['IGCSE','A2 Level'],'active'),
('vivek_madan',       'Vivek Madan',       ARRAY['Maths','Physics'],ARRAY['IGCSE','AS level'],'active'),
('faizan_altaf',      'Faizan Altaf',      ARRAY['Maths'],          ARRAY['IGCSE'],           'active'),
('shoaib_ahmed_ghani','Shoaib Ahmed Ghani',ARRAY['Maths','Physics'],ARRAY['IGCSE','A2 Level'],'active'),
('rizwan_anwer',      'Rizwan Anwer',      ARRAY['Chemistry'],      ARRAY['IGCSE','AS level'],'active'),
('hira_zaffar',       'Hira Zaffar',       ARRAY['English'],        ARRAY['IGCSE'],           'active'),
('rameesha',          'Rameesha',          ARRAY['English','Urdu'], ARRAY['Grade 1-8'],       'active'),
('sophia_abid',       'Sophia Abid',       ARRAY['English'],        ARRAY['IGCSE'],           'active'),
('dur_e_shahwar',     'Dur e Shahwar',     ARRAY['Maths'],          ARRAY['Grade 1-8'],       'active'),
('saad_abdul_karim',  'Saad Abdul Karim',  ARRAY['Maths'],          ARRAY['IGCSE','AS level'],'active'),
('iman_khilani',      'Iman Khilani',      ARRAY['Biology'],        ARRAY['IGCSE'],           'active'),
('ali_akbar',         'Ali Akbar',         ARRAY['Chemistry','Maths'],ARRAY['IGCSE','AS level'],'active'),
('hassam_umer',       'Hassam Umer',       ARRAY['Maths'],          ARRAY['IGCSE'],           'active'),
('john_fernandes',    'John Fernandes',    ARRAY['English'],        ARRAY['IGCSE'],           'active'),
('sarah_arshad',      'Sarah Arshad',      ARRAY['English'],        ARRAY['Grade 1-8'],       'active'),
('laiba_nadeem',      'Laiba Nadeem',      ARRAY['English','Urdu'], ARRAY['Grade 1-8'],       'active'),
('abdur_rehman',      'Abdur Rehman',      ARRAY['Maths'],          ARRAY['IGCSE'],           'active'),
('tooba_khan',        'Tooba Khan',        ARRAY['Biology'],        ARRAY['IGCSE'],           'active'),
('maha_farooq',       'Maha Farooq',       ARRAY['English'],        ARRAY['Grade 1-8'],       'active'),
('aida_chaudhry',     'Aida Chaudhry',     ARRAY['Maths','Science'],ARRAY['Grade 1-8'],       'active'),
('asia_ashraf',       'Asia Ashraf',       ARRAY['Urdu'],           ARRAY['Grade 1-8'],       'active'),
('dolan_rodriguez',   'Dolan Rodriguez',   ARRAY['English'],        ARRAY['IGCSE'],           'active'),
('basma',             'Basma',             ARRAY['Arabic'],         ARRAY['Grade 1-8'],       'active'),
('nauman_nasir',      'Nauman Nasir',      ARRAY['Maths'],          ARRAY['IGCSE'],           'active'),
('faiq_lodhi',        'Faiq Lodhi',        ARRAY['Maths','Physics'],ARRAY['IGCSE','AS level'],'active'),
('hira_saeed',        'Hira Saeed',        ARRAY['Biology'],        ARRAY['IGCSE'],           'active'),
('musharraf_ramzy',   'Musharraf Ramzy',   ARRAY['Maths'],          ARRAY['IGCSE','A2 Level'],'active'),
('faiza_khalid',      'Faiza Khalid',      ARRAY['English'],        ARRAY['Grade 1-8'],       'active'),
('maryam_imran',      'Maryam Imran',      ARRAY['Maths'],          ARRAY['Grade 1-8'],       'active')
ON CONFLICT (teacher_id) DO NOTHING;

-- ============================================================
-- SEED RECORD 1: All data present, Converted
-- Tests the happy path end-to-end
-- ============================================================
INSERT INTO conducted_demo_sessions (demo_id, demo_date, demo_month, teacher_name, student_name, academic_level, subject, recording_url, analysis_status)
VALUES ('20260101_moazzam_ahmed', '2026-01-01', 'January', 'Moazzam Malik', 'Ahmed (Test)', 'IGCSE', 'Maths', 'https://mock-lms.tuitional.com/recordings/20260101_moazzam_ahmed', 'pending')
ON CONFLICT (demo_id) DO NOTHING;

INSERT INTO demo_feedback (tutor_name, student_name, subject, session_date, overall_rating_10, topic_explained, participation, confusion_moments, discomfort_moments, positive_environment, suggestions, comments_other)
VALUES ('Moazzam Malik', 'Ahmed (Test)', 'Maths', '2026-01-01', 9, 'Yes', 'Yes', NULL, NULL, 5, 'More past paper practice', 'Great session, tutor explained algebra clearly')
ON CONFLICT DO NOTHING;

INSERT INTO demo_conversion_sales (demo_date, teacher_name, student_name, academic_level, subject, conversion_status, sales_comments, sales_agent, matched_demo_id)
VALUES ('2026-01-01', 'Moazzam Malik', 'Ahmed (Test)', 'IGCSE', 'Maths', 'Converted', 'Parent was very happy with the demo. Committed immediately after session. Secured 3 sessions per week.', 'Maryam', '20260101_moazzam_ahmed')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED RECORD 2: Missing feedback — tests feedback_not_found flag
-- ============================================================
INSERT INTO conducted_demo_sessions (demo_id, demo_date, demo_month, teacher_name, student_name, academic_level, subject, recording_url, analysis_status)
VALUES ('20260102_zehra_sara', '2026-01-02', 'January', 'Zehra Saleem', 'Sara (Test)', 'IGCSE', 'English', 'https://mock-lms.tuitional.com/recordings/20260102_zehra_sara', 'pending')
ON CONFLICT (demo_id) DO NOTHING;

-- No feedback record for this demo — intentional
INSERT INTO demo_conversion_sales (demo_date, teacher_name, student_name, academic_level, subject, conversion_status, sales_comments, sales_agent, matched_demo_id)
VALUES ('2026-01-02', 'Zehra Saleem', 'Sara (Test)', 'IGCSE', 'English', 'Pending', 'Parent requested time to decide. Following up on Friday.', 'Hoor', '20260102_zehra_sara')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED RECORD 3: Not Converted — Sales accountability
-- Decision maker absent, no commitment taken
-- ============================================================
INSERT INTO conducted_demo_sessions (demo_id, demo_date, demo_month, teacher_name, student_name, academic_level, subject, recording_url, analysis_status)
VALUES ('20260103_inayat_omar', '2026-01-03', 'January', 'Inayat Karim', 'Omar (Test)', 'GCSE', 'Maths', 'https://mock-lms.tuitional.com/recordings/20260103_inayat_omar', 'pending')
ON CONFLICT (demo_id) DO NOTHING;

INSERT INTO demo_feedback (tutor_name, student_name, subject, session_date, overall_rating_10, topic_explained, participation, confusion_moments, discomfort_moments, positive_environment, suggestions)
VALUES ('Inayat Karim', 'Omar (Test)', 'Maths', '2026-01-03', 7, 'Yes', 'Yes', NULL, NULL, 4, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO demo_conversion_sales (demo_date, teacher_name, student_name, academic_level, subject, conversion_status, sales_comments, sales_agent, matched_demo_id)
VALUES ('2026-01-03', 'Inayat Karim', 'Omar (Test)', 'GCSE', 'Maths', 'Not Converted', 'Did not include the decision maker — father was not on the call. Gave permission to book without asking for commitment. Student ghosted after 2 days.', 'Maryam', '20260103_inayat_omar')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED RECORD 4: Not Converted — Product accountability
-- Wrong resource allocation, accent mismatch
-- ============================================================
INSERT INTO conducted_demo_sessions (demo_id, demo_date, demo_month, teacher_name, student_name, academic_level, subject, recording_url, analysis_status)
VALUES ('20260104_nageena_layla', '2026-01-04', 'January', 'Nageena Arif', 'Layla (Test)', 'IGCSE', 'English', 'https://mock-lms.tuitional.com/recordings/20260104_nageena_layla', 'pending')
ON CONFLICT (demo_id) DO NOTHING;

INSERT INTO demo_feedback (tutor_name, student_name, subject, session_date, overall_rating_10, topic_explained, participation, confusion_moments, discomfort_moments, positive_environment, suggestions)
VALUES ('Nageena Arif', 'Layla (Test)', 'English', '2026-01-04', 5, 'Yes', 'No', 'Accent was hard to follow', 'Student seemed uncomfortable', 2, 'Clearer pronunciation needed')
ON CONFLICT DO NOTHING;

INSERT INTO demo_conversion_sales (demo_date, teacher_name, student_name, academic_level, subject, conversion_status, sales_comments, sales_agent, matched_demo_id)
VALUES ('2026-01-04', 'Nageena Arif', 'Layla (Test)', 'IGCSE', 'English', 'Not Converted', 'Wrong resource allocation — Nageena English demos have accent/pronunciation issues. Parent specifically requested a fluent British-accent English tutor. Should have allocated Mahnoor or Zehra instead.', 'Hoor', '20260104_nageena_layla')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED RECORD 5: No recording URL — tests Video POUR flag
-- ============================================================
INSERT INTO conducted_demo_sessions (demo_id, demo_date, demo_month, teacher_name, student_name, academic_level, subject, recording_url, analysis_status)
VALUES ('20260105_ahrar_fatima', '2026-01-05', 'January', 'Ahrar', 'Fatima (Test)', 'AS level', 'Biology', NULL, 'pending')
ON CONFLICT (demo_id) DO NOTHING;

INSERT INTO demo_feedback (tutor_name, student_name, subject, session_date, overall_rating_10, topic_explained, participation, confusion_moments, discomfort_moments, positive_environment, suggestions)
VALUES ('Ahrar', 'Fatima (Test)', 'Biology', '2026-01-05', 8, 'Yes', 'Yes', NULL, NULL, 4, 'More diagrams on the whiteboard')
ON CONFLICT DO NOTHING;

INSERT INTO demo_conversion_sales (demo_date, teacher_name, student_name, academic_level, subject, conversion_status, sales_comments, sales_agent, matched_demo_id)
VALUES ('2026-01-05', 'Ahrar', 'Fatima (Test)', 'AS level', 'Biology', 'Converted', 'Strong demo. Parent committed same evening. 2 sessions per week agreed.', 'Maryam', '20260105_ahrar_fatima')
ON CONFLICT DO NOTHING;
