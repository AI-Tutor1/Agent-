import { Router } from 'express';
import { pool } from '../db';
import {
  PENDING_DEMOS,
  RECENT_SUBMISSIONS,
  LOST_REASONS,
  FOLLOW_UP_OPTIONS,
} from '../data/mock';

const router = Router();

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
    if (result.rows.length > 0) {
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
      return;
    }
    res.json(PENDING_DEMOS);
  } catch (err) {
    console.error('Error fetching pending demos:', err);
    res.json(PENDING_DEMOS);
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
    if (result.rows.length > 0) {
      const statusMap: Record<string, string> = {
        'pending': 'Processing',
        'in_progress': 'Processing',
        'awaiting_sales': 'Awaiting Sales',
        'pending_review': 'Pending Review',
        'approved': 'Reviewed',
        'rejected': 'Reviewed',
        'escalated': 'Escalated',
      };
      const submissions = result.rows.map(r => ({
        date: r.date,
        teacher: r.teacher?.split(' ')[0] || '',
        student: r.student?.split(' ')[0] || '',
        level: r.level?.split(' ')[0] || '',
        subject: r.subject?.split(' ')[0] || '',
        status: statusMap[r.status] || 'Processing',
      }));
      res.json(submissions);
      return;
    }
    res.json(RECENT_SUBMISSIONS);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.json(RECENT_SUBMISSIONS);
  }
});

router.get('/lost-reasons', (_req, res) => {
  res.json(LOST_REASONS);
});

router.get('/follow-up-options', (_req, res) => {
  res.json(FOLLOW_UP_OPTIONS);
});

// POST: Create a new demo session (counselor intake form)
router.post('/', async (req, res) => {
  const {
    demoDate, teacherName, academicLevel, studentName,
    subjects, curriculumBoard, curriculumCode, rateTier,
    painPoints, sessionNotes, submittedBy
  } = req.body;

  const demoId = `${demoDate.replace(/-/g, '')}_${teacherName.split(' ')[0].toLowerCase()}_${studentName.split(' ')[0].toLowerCase()}`;

  try {
    const result = await pool.query(
      `INSERT INTO conducted_demo_sessions
        (demo_id, demo_date, teacher_name, student_name, academic_level, subject,
         curriculum_board, curriculum_code, rate_tier, pain_points, session_notes,
         submitted_by, intake_source, analysis_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'platform', 'pending')
       RETURNING demo_id`,
      [demoId, demoDate, teacherName, studentName, academicLevel,
       subjects?.join(', '), curriculumBoard, curriculumCode, rateTier,
       painPoints, sessionNotes, submittedBy]
    );
    res.status(201).json({ demoId: result.rows[0].demo_id, status: 'created' });
  } catch (err) {
    console.error('Error creating demo session:', err);
    res.status(500).json({ error: 'Failed to create demo session' });
  }
});

// POST: Submit sales outcome
router.post('/sales-outcome', async (req, res) => {
  const {
    demoId, conversionStatus, studentRating, studentFeedback,
    salesComments, parentContact, lostReasons, followUpPlan, salesAgent
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO demo_conversion_sales
        (demo_date, teacher_name, student_name, academic_level, subject,
         conversion_status, student_feedback_rating, student_verbal_feedback,
         sales_comments, sales_agent, parent_contact, lost_reasons, follow_up_plan,
         matched_demo_id, intake_source)
       SELECT
         demo_date, teacher_name, student_name, academic_level, subject,
         $2, $3, $4, $5, $6, $7, $8, $9, $1, 'platform'
       FROM conducted_demo_sessions WHERE demo_id = $1
       RETURNING id`,
      [demoId, conversionStatus, studentRating, studentFeedback,
       salesComments, salesAgent, parentContact,
       lostReasons ? JSON.stringify(lostReasons) : null, followUpPlan]
    );
    res.status(201).json({ id: result.rows[0]?.id, status: 'created' });
  } catch (err) {
    console.error('Error creating sales outcome:', err);
    res.status(500).json({ error: 'Failed to create sales outcome' });
  }
});

export default router;
