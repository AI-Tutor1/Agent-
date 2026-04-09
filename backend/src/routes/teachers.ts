import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// Static reference data — not mock data, these are system-level constants
const ALL_SUBJECTS = [
  'Mathematics', 'Further Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English Language', 'English Literature', 'Business Studies', 'Economics',
  'Accounting', 'Computer Science', 'ICT', 'Psychology', 'History',
  'Geography', 'Arabic', 'French', 'Spanish', 'Environmental Science', 'Other',
];

const ACADEMIC_LEVELS = [
  'Grade 1-8', 'IGCSE / GCSE', 'AS Level', 'A2 Level', 'IB', 'University', 'Other',
];

const CURRICULUM_BOARDS = [
  'Pearson Edexcel', 'Cambridge IGCSE / A Level', 'AQA', 'OCR',
  'IB (MYP)', 'IB (DP)', 'CBSE', 'Other',
];

const RATE_TIERS = ['Standard Rate', 'Premium Rate', 'Flexible'];

const CURRICULUM_HINTS: Record<string, Record<string, string>> = {
  'Mathematics':      { 'Pearson Edexcel': 'Common: 9MA0 (A Level) or 4MA1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0580 (IGCSE) or 9709 (A Level)' },
  'Chemistry':        { 'Pearson Edexcel': 'Common: 9CH0 (A Level) or 4CH1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0620 (IGCSE) or 9701 (A Level)' },
  'Physics':          { 'Pearson Edexcel': 'Common: 9PH0 (A Level) or 4PH1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0625 (IGCSE) or 9702 (A Level)' },
  'Biology':          { 'Pearson Edexcel': 'Common: 9BI0 (A Level) or 4BI1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0610 (IGCSE) or 9700 (A Level)' },
  'English Language': { 'Pearson Edexcel': 'Common: 4EA1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0500 (IGCSE) or 0522 (IGCSE)' },
  'Business Studies': { 'Pearson Edexcel': 'Common: 9BS0 (A Level) or 4BS1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0450 (IGCSE) or 9609 (A Level)' },
  'Economics':        { 'Pearson Edexcel': 'Common: 9EC0 (A Level) or 4EC1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0455 (IGCSE) or 9708 (A Level)' },
  'Accounting':       { 'Pearson Edexcel': 'Common: 9AC0 (A Level) or 4AC1 (IGCSE)', 'Cambridge IGCSE / A Level': 'Common: 0452 (IGCSE) or 9706 (A Level)' },
};

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT teacher_name AS name, subjects
       FROM teacher_profiles
       WHERE status = 'active'
       ORDER BY teacher_name`
    );
    res.json(result.rows.map(r => ({ name: r.name, subjects: r.subjects || [] })));
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

router.get('/subjects', (_req, res) => { res.json(ALL_SUBJECTS); });
router.get('/academic-levels', (_req, res) => { res.json(ACADEMIC_LEVELS); });
router.get('/curriculum-boards', (_req, res) => { res.json(CURRICULUM_BOARDS); });
router.get('/rate-tiers', (_req, res) => { res.json(RATE_TIERS); });
router.get('/curriculum-hints', (_req, res) => { res.json(CURRICULUM_HINTS); });

export default router;
