import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../db';

const router = Router();

// GET /api/dashboard/overview
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const [pendingResult, completedResult, escalationsResult, confidenceResult, deptsResult, activityResult] =
      await Promise.all([
        pool.query(
          `SELECT COUNT(*) AS count FROM demo_analysis WHERE analysis_status = 'pending_review'`
        ),
        pool.query(
          `SELECT COUNT(*) AS count FROM demo_analysis
           WHERE analysis_status IN ('approved','rejected') AND DATE(reviewed_at) = CURRENT_DATE`
        ),
        pool.query(
          `SELECT COUNT(*) AS count FROM escalations WHERE resolved = false`
        ),
        pool.query(
          `SELECT AVG(agent_confidence) AS avg_confidence FROM demo_analysis`
        ),
        pool.query(
          `SELECT id, name, head_name, total_agents, active_agents FROM departments ORDER BY name`
        ),
        pool.query(
          `SELECT id, agent_name, action_type, status, created_at
           FROM agent_activity_log
           ORDER BY created_at DESC
           LIMIT 20`
        ),
      ]);

    res.json({
      pending_reviews: parseInt(pendingResult.rows[0]?.count ?? '0', 10),
      completed_today: parseInt(completedResult.rows[0]?.count ?? '0', 10),
      active_escalations: parseInt(escalationsResult.rows[0]?.count ?? '0', 10),
      avg_confidence: parseFloat(confidenceResult.rows[0]?.avg_confidence ?? '0') || 0,
      departments: deptsResult.rows.map((d) => ({
        id: d.id,
        name: d.name,
        head_name: d.head_name,
        active_agents: d.active_agents,
        total_agents: d.total_agents,
      })),
      recent_activity: activityResult.rows.map((r) => ({
        id: r.id,
        agent_name: r.agent_name,
        action_type: r.action_type,
        status: r.status,
        created_at: r.created_at,
      })),
    });
  } catch (err) {
    console.error('[dashboard/overview] Error:', err);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// GET /api/dashboard/review-queue?filter=all|high|low|escalated&search=text
router.get('/review-queue', async (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter as string) || 'all';
    const search = (req.query.search as string) || '';

    let whereClause = `WHERE a.analysis_status = 'pending_review'`;
    const params: (string | number)[] = [];

    if (filter === 'high') {
      whereClause += ` AND a.agent_confidence >= 8`;
    } else if (filter === 'low') {
      whereClause += ` AND a.agent_confidence < 6`;
    } else if (filter === 'escalated') {
      whereClause = `WHERE a.analysis_status = 'escalated'`;
    }

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (a.teacher_name ILIKE $${params.length} OR a.student_name ILIKE $${params.length} OR a.subject ILIKE $${params.length})`;
    }

    const result = await pool.query(
      `SELECT
        a.analysis_id,
        a.demo_id,
        a.teacher_name,
        a.student_name,
        a.academic_level,
        a.subject,
        TO_CHAR(a.demo_date, 'DD Mon YYYY') AS demo_date,
        a.agent_confidence,
        a.analysis_status,
        a.accountability_classification,
        a.accountability_evidence,
        a.accountability_confidence,
        a.teaching_methodology,
        a.topic_selection,
        a.resource_usage,
        a.interactivity_notes,
        a.overall_effectiveness,
        a.improvement_suggestions,
        a.student_rating_converted,
        a.analyst_rating,
        a.conversion_status,
        a.sales_agent,
        a.tokens_used,
        f.comments_other AS feedback_text
       FROM demo_analysis a
       LEFT JOIN demo_feedback f ON f.feedback_id = a.feedback_source_id
       ${whereClause}
       ORDER BY a.created_at DESC`,
      params
    );

    const analyses = await Promise.all(
      result.rows.map(async (r) => {
        const pourResult = await pool.query(
          `SELECT category, severity, description FROM pour_flags WHERE analysis_id = $1`,
          [r.analysis_id]
        );
        return {
          analysis_id: r.analysis_id,
          demo_id: r.demo_id,
          teacher: r.teacher_name ?? '',
          student: r.student_name ?? '',
          level: r.academic_level ?? '',
          subject: r.subject ?? '',
          date: r.demo_date ?? '',
          confidence: parseFloat(r.agent_confidence) || 0,
          analysis_status: r.analysis_status ?? 'pending_review',
          pour_flags: pourResult.rows,
          accountability: r.accountability_classification
            ? {
                classification: r.accountability_classification,
                evidence: r.accountability_evidence ?? '',
                confidence: r.accountability_confidence ?? '',
              }
            : null,
          methodology: r.teaching_methodology ?? '',
          topic_selection: r.topic_selection ?? '',
          resource_usage: r.resource_usage ?? '',
          interactivity: r.interactivity_notes ?? '',
          effectiveness: r.overall_effectiveness ?? '',
          improvements: r.improvement_suggestions ?? '',
          student_rating: r.student_rating_converted || 0,
          analyst_rating: r.analyst_rating || 0,
          conversion_status: r.conversion_status ?? 'Pending',
          sales_agent: r.sales_agent ?? '',
          feedback_text: r.feedback_text ?? '',
          tokens_used: r.tokens_used || 0,
        };
      })
    );

    // Count summary
    const [totalRes, highRes, lowRes, escalatedRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS count FROM demo_analysis WHERE analysis_status = 'pending_review'`),
      pool.query(`SELECT COUNT(*) AS count FROM demo_analysis WHERE analysis_status = 'pending_review' AND agent_confidence >= 8`),
      pool.query(`SELECT COUNT(*) AS count FROM demo_analysis WHERE analysis_status = 'pending_review' AND agent_confidence < 6`),
      pool.query(`SELECT COUNT(*) AS count FROM demo_analysis WHERE analysis_status = 'escalated'`),
    ]);

    res.json({
      analyses,
      counts: {
        total: parseInt(totalRes.rows[0]?.count ?? '0', 10),
        high_confidence: parseInt(highRes.rows[0]?.count ?? '0', 10),
        low_confidence: parseInt(lowRes.rows[0]?.count ?? '0', 10),
        escalated: parseInt(escalatedRes.rows[0]?.count ?? '0', 10),
      },
    });
  } catch (err) {
    console.error('[dashboard/review-queue] Error:', err);
    res.status(500).json({ error: 'Failed to fetch review queue' });
  }
});

// POST /api/dashboard/review/:analysisId/approve
router.post('/review/:analysisId/approve', async (req: Request, res: Response) => {
  const { analysisId } = req.params;
  const { reviewer_name, notes } = req.body as { reviewer_name?: string; notes?: string };

  if (!reviewer_name) {
    res.status(400).json({ error: 'reviewer_name is required' });
    return;
  }

  try {
    await pool.query(
      `UPDATE demo_analysis
       SET analysis_status = 'approved', reviewed_by = $1, review_notes = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE analysis_id = $3`,
      [reviewer_name, notes ?? null, analysisId]
    );

    await pool.query(
      `INSERT INTO agent_activity_log (agent_name, action_type, demo_id, details, status, created_at)
       VALUES ($1, 'review_approve', $2, $3, 'success', NOW())`,
      ['dashboard', analysisId, `Approved by ${reviewer_name}`]
    );

    res.json({ status: 'approved', analysis_id: analysisId });
  } catch (err) {
    console.error('[dashboard/review/approve] Error:', err);
    res.status(500).json({ error: 'Failed to approve analysis' });
  }
});

// POST /api/dashboard/review/:analysisId/reject
const rejectValidation = [
  body('reviewer_name').isString().trim().notEmpty().withMessage('reviewer_name is required'),
  body('reason')
    .isString().trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('reason must be between 5 and 500 characters')
    .escape(),
];

router.post('/review/:analysisId/reject', rejectValidation, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.array() });
    return;
  }

  const { analysisId } = req.params;
  const { reviewer_name, reason } = req.body as { reviewer_name: string; reason: string };

  try {
    await pool.query(
      `UPDATE demo_analysis
       SET analysis_status = 'rejected', reviewed_by = $1, review_notes = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE analysis_id = $3`,
      [reviewer_name, reason, analysisId]
    );

    await pool.query(
      `INSERT INTO agent_activity_log (agent_name, action_type, demo_id, details, status, created_at)
       VALUES ($1, 'review_reject', $2, $3, 'success', NOW())`,
      ['dashboard', analysisId, `Rejected by ${reviewer_name}: ${reason}`]
    );

    res.json({ status: 'rejected', analysis_id: analysisId });
  } catch (err) {
    console.error('[dashboard/review/reject] Error:', err);
    res.status(500).json({ error: 'Failed to reject analysis' });
  }
});

// POST /api/dashboard/review/:analysisId/redo
const redoValidation = [
  body('reviewer_name').isString().trim().notEmpty().withMessage('reviewer_name is required'),
  body('instructions')
    .isString().trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('instructions must be between 10 and 1000 characters')
    .escape(),
];

router.post('/review/:analysisId/redo', redoValidation, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.array() });
    return;
  }

  const { analysisId } = req.params;
  const { reviewer_name, instructions } = req.body as { reviewer_name: string; instructions: string };

  try {
    await pool.query(
      `UPDATE demo_analysis
       SET analysis_status = 'redo', reviewed_by = $1, review_notes = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE analysis_id = $3`,
      [reviewer_name, instructions, analysisId]
    );

    await pool.query(
      `INSERT INTO agent_activity_log (agent_name, action_type, demo_id, details, status, created_at)
       VALUES ($1, 'review_redo', $2, $3, 'success', NOW())`,
      ['dashboard', analysisId, `Redo requested by ${reviewer_name}: ${instructions}`]
    );

    res.json({ status: 'redo_requested', analysis_id: analysisId });
  } catch (err) {
    console.error('[dashboard/review/redo] Error:', err);
    res.status(500).json({ error: 'Failed to request redo' });
  }
});

// GET /api/dashboard/analytics?period=7d|30d|90d
router.get('/analytics', async (req: Request, res: Response) => {
  const period = (req.query.period as string) || '30d';
  const days = period === '90d' ? 90 : period === '7d' ? 7 : 30;

  try {
    // Use parameterized interval: CURRENT_DATE - ($1 * INTERVAL '1 day')
    const [trendResult, pourResult, accResult, teacherResult] = await Promise.all([
      pool.query(
        `SELECT
          DATE(demo_date) AS date,
          COUNT(*) FILTER (WHERE conversion_status = 'Converted') AS converted,
          COUNT(*) FILTER (WHERE conversion_status = 'Not Converted') AS not_converted,
          COUNT(*) FILTER (WHERE conversion_status = 'Pending') AS pending
         FROM demo_analysis
         WHERE demo_date >= CURRENT_DATE - ($1 * INTERVAL '1 day')
         GROUP BY DATE(demo_date)
         ORDER BY DATE(demo_date) ASC`,
        [days]
      ),
      pool.query(
        `SELECT category, COUNT(*) AS count
         FROM pour_flags pf
         JOIN demo_analysis a ON a.analysis_id = pf.analysis_id
         WHERE a.demo_date >= CURRENT_DATE - ($1 * INTERVAL '1 day')
         GROUP BY category
         ORDER BY count DESC`,
        [days]
      ),
      pool.query(
        `SELECT accountability_classification AS classification, COUNT(*) AS count
         FROM demo_analysis
         WHERE accountability_classification IS NOT NULL
           AND demo_date >= CURRENT_DATE - ($1 * INTERVAL '1 day')
         GROUP BY accountability_classification`,
        [days]
      ),
      pool.query(
        `SELECT teacher_name, AVG(analyst_rating) AS avg_analyst_rating,
                COUNT(*) AS total_demos,
                COUNT(*) FILTER (WHERE conversion_status = 'Converted') AS converted_count
         FROM demo_analysis
         WHERE demo_date >= CURRENT_DATE - ($1 * INTERVAL '1 day')
           AND teacher_name IS NOT NULL
         GROUP BY teacher_name
         ORDER BY avg_analyst_rating DESC
         LIMIT 10`,
        [days]
      ),
    ]);

    const totalAcc = accResult.rows.reduce((sum: number, r: { count: string }) => sum + parseInt(r.count, 10), 0);

    res.json({
      conversion_trend: trendResult.rows.map((r) => ({
        date: r.date,
        converted: parseInt(r.converted, 10),
        not_converted: parseInt(r.not_converted, 10),
        pending: parseInt(r.pending, 10),
      })),
      pour_frequency: pourResult.rows.map((r) => ({
        category: r.category,
        count: parseInt(r.count, 10),
      })),
      accountability_split: accResult.rows.map((r) => ({
        classification: r.classification,
        count: parseInt(r.count, 10),
        percentage: totalAcc > 0 ? Math.round((parseInt(r.count, 10) / totalAcc) * 100) : 0,
      })),
      top_teachers: teacherResult.rows.map((r) => ({
        teacher_name: r.teacher_name,
        avg_analyst_rating: parseFloat(r.avg_analyst_rating) || 0,
        total_demos: parseInt(r.total_demos, 10),
        conversion_rate:
          parseInt(r.total_demos, 10) > 0
            ? Math.round((parseInt(r.converted_count, 10) / parseInt(r.total_demos, 10)) * 100)
            : 0,
      })),
    });
  } catch (err) {
    console.error('[dashboard/analytics] Error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/dashboard/departments/:deptId
router.get('/departments/:deptId', async (req: Request, res: Response) => {
  const { deptId } = req.params;

  try {
    const deptResult = await pool.query(
      `SELECT id, name, head_name, head_agent_name, total_agents, active_agents
       FROM departments WHERE id = $1`,
      [deptId]
    );

    if (deptResult.rows.length === 0) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    const dept = deptResult.rows[0];

    const analysesResult = await pool.query(
      `SELECT a.analysis_id, a.demo_id, a.teacher_name, a.student_name, a.subject,
              a.analysis_status, a.agent_confidence, TO_CHAR(a.demo_date, 'DD Mon YYYY') AS demo_date
       FROM demo_analysis a
       WHERE a.teacher_name IN (
         SELECT agent_name FROM agent_identity WHERE department_id = $1
       )
       ORDER BY a.created_at DESC
       LIMIT 20`,
      [deptId]
    );

    res.json({
      department: dept,
      recent_analyses: analysesResult.rows,
    });
  } catch (err) {
    console.error('[dashboard/departments] Error:', err);
    res.status(500).json({ error: 'Failed to fetch department data' });
  }
});

export default router;
