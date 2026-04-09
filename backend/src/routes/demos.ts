import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../db';

const router = Router();

// Static reference data
const LOST_REASONS = [
  'Price too high', 'Teacher mismatch', 'Face-to-face preferred',
  'Budget limited', 'Ghosted', 'Timing', 'Student not ready', 'Other',
];

const FOLLOW_UP_OPTIONS = [
  'Follow up in 1 week', 'Follow up in 1 month',
  'Offer another demo', 'No follow-up needed', 'Closed lost',
];

const CONVERSION_STATUSES = ['Converted', 'Not Converted', 'Pending'];

router.get('/pending', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        demo_id AS id,
        teacher_name AS teacher,
        student_name AS student,
        academic_level AS level,
        subject,
        demo_date,
        created_at
       FROM conducted_demo_sessions
       WHERE analysis_status = 'pending'
       ORDER BY demo_date DESC
       LIMIT 20`
    );
    const demos = result.rows.map(r => {
      const hoursAgo = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 3600000);
      return {
        id: r.id,
        teacher: r.teacher,
        student: r.student,
        level: r.level || '',
        subject: r.subject || '',
        loggedAgo: hoursAgo < 1 ? 'just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`,
        loggedHours: hoursAgo,
      };
    });
    res.json(demos);
  } catch (err) {
    console.error('Error fetching pending demos:', err);
    res.status(500).json({ error: 'Failed to fetch pending demos' });
  }
});

router.get('/submissions', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        TO_CHAR(demo_date, 'DD Mon') AS date,
        teacher_name AS teacher,
        student_name AS student,
        academic_level AS level,
        subject,
        analysis_status AS status
       FROM conducted_demo_sessions
       ORDER BY demo_date DESC
       LIMIT 10`
    );
    const statusMap: Record<string, string> = {
      'pending':     'Processing',
      'in_progress': 'Processing',
      'partial':     'Processing',
      'complete':    'Reviewed',
      'escalated':   'Escalated',
    };
    const submissions = result.rows.map(r => ({
      date:    r.date,
      teacher: r.teacher?.split(' ')[0] || '',
      student: r.student?.split(' ')[0] || '',
      level:   r.level?.split(' ')[0] || '',
      subject: r.subject?.split(' ')[0] || '',
      status:  statusMap[r.status] || 'Processing',
    }));
    res.json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

router.get('/lost-reasons', (_req, res) => { res.json(LOST_REASONS); });
router.get('/follow-up-options', (_req, res) => { res.json(FOLLOW_UP_OPTIONS); });

const createDemoValidation = [
  body('demoDate').isISO8601().withMessage('demoDate must be a valid date (YYYY-MM-DD)'),
  body('teacherName').isString().trim().notEmpty().isLength({ max: 200 }).withMessage('teacherName is required'),
  body('studentName').isString().trim().notEmpty().isLength({ max: 200 }).withMessage('studentName is required'),
  body('academicLevel').optional().isString().trim().isLength({ max: 100 }),
  body('subjects').optional().isArray(),
  body('subjects.*').optional().isString().trim().isLength({ max: 100 }),
  body('curriculumBoard').optional().isString().trim().isLength({ max: 100 }),
  body('curriculumCode').optional().isString().trim().isLength({ max: 50 }),
];

router.post('/', createDemoValidation, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.array() });
    return;
  }

  const {
    demoDate, teacherName, academicLevel, studentName,
    subjects, curriculumBoard, curriculumCode,
  } = req.body as {
    demoDate: string;
    teacherName: string;
    studentName: string;
    academicLevel?: string;
    subjects?: string[];
    curriculumBoard?: string;
    curriculumCode?: string;
  };

  const demoId = `${demoDate.replace(/-/g, '')}_${teacherName.split(' ')[0].toLowerCase()}_${studentName.split(' ')[0].toLowerCase()}`;

  try {
    const result = await pool.query(
      `INSERT INTO conducted_demo_sessions
        (demo_id, demo_date, teacher_name, student_name, academic_level, subject,
         curriculum_board, curriculum_code, analysis_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING demo_id`,
      [demoId, demoDate, teacherName, studentName, academicLevel,
       subjects?.join(', '), curriculumBoard, curriculumCode]
    );
    res.status(201).json({ demoId: result.rows[0].demo_id, status: 'created' });
  } catch (err) {
    console.error('Error creating demo session:', err);
    res.status(500).json({ error: 'Failed to create demo session' });
  }
});

const salesOutcomeValidation = [
  body('demoId').isString().trim().notEmpty().isLength({ max: 100 }).withMessage('demoId is required'),
  body('conversionStatus').isIn(CONVERSION_STATUSES).withMessage(`conversionStatus must be one of: ${CONVERSION_STATUSES.join(', ')}`),
  body('salesComments').optional().isString().trim().isLength({ max: 2000 }),
  body('parentContact').optional().isString().trim().isLength({ max: 200 }),
  body('salesAgent').optional().isString().trim().isLength({ max: 200 }),
];

router.post('/sales-outcome', salesOutcomeValidation, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.array() });
    return;
  }

  const { demoId, conversionStatus, salesComments, parentContact, salesAgent } = req.body as {
    demoId: string;
    conversionStatus: string;
    salesComments?: string;
    parentContact?: string;
    salesAgent?: string;
  };

  try {
    const result = await pool.query(
      `INSERT INTO demo_conversion_sales
        (demo_date, teacher_name, student_name, academic_level, subject,
         conversion_status, sales_comments, sales_agent, parent_contact, matched_demo_id)
       SELECT
         demo_date, teacher_name, student_name, academic_level, subject,
         $2, $3, $4, $5, $1
       FROM conducted_demo_sessions WHERE demo_id = $1
       RETURNING id`,
      [demoId, conversionStatus, salesComments, salesAgent, parentContact]
    );
    res.status(201).json({ id: result.rows[0]?.id, status: 'created' });
  } catch (err) {
    console.error('Error creating sales outcome:', err);
    res.status(500).json({ error: 'Failed to create sales outcome' });
  }
});

export default router;
