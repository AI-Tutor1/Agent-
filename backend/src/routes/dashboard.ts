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
       ORDER BY a.created_at DESC
       LIMIT 20`
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

// GET /api/dashboard/agent-stats — real performance metrics for agent page
router.get('/agent-stats', async (_req: Request, res: Response) => {
  try {
    const [metricsResult, todayResult, approvalResult] = await Promise.all([
      pool.query(
        `SELECT
          AVG(agent_confidence)     AS avg_confidence,
          AVG(processing_time_mins) AS avg_processing
         FROM demo_analysis`
      ),
      pool.query(
        `SELECT COUNT(*) AS count FROM demo_analysis
         WHERE DATE(created_at) = CURRENT_DATE`
      ),
      pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE analysis_status = 'approved') AS approved,
          COUNT(*) AS total
         FROM demo_analysis`
      ),
    ]);

    const m = metricsResult.rows[0];
    const approved = parseInt(approvalResult.rows[0].approved ?? '0', 10);
    const total    = parseInt(approvalResult.rows[0].total ?? '0', 10);

    res.json({
      avg_confidence:      m.avg_confidence ? parseFloat(m.avg_confidence).toFixed(1) : null,
      avg_processing_mins: m.avg_processing  ? Math.round(parseFloat(m.avg_processing)) : null,
      today_count:         parseInt(todayResult.rows[0].count ?? '0', 10),
      first_pass_rate:     total > 0 ? Math.round((approved / total) * 100) : null,
    });
  } catch (err) {
    console.error('[dashboard/agent-stats] Error:', err);
    res.status(500).json({ error: 'Failed to fetch agent stats' });
  }
});

// GET /api/dashboard/heartbeat/:agentName — last heartbeat for status panel
router.get('/heartbeat/:agentName', async (req: Request, res: Response) => {
  const { agentName } = req.params;

  try {
    const [heartbeatResult, uptimeResult, shadowResult] = await Promise.all([
      pool.query(
        `SELECT created_at FROM agent_activity_log
         WHERE agent_name = $1 AND action_type = 'heartbeat'
         ORDER BY created_at DESC LIMIT 1`,
        [agentName]
      ),
      pool.query(
        `SELECT MIN(created_at) AS first_today FROM agent_activity_log
         WHERE agent_name = $1 AND DATE(created_at) = CURRENT_DATE`,
        [agentName]
      ),
      pool.query(`SELECT 1`), // placeholder — shadow mode comes from env
    ]);

    const lastHeartbeat = heartbeatResult.rows[0]?.created_at ?? null;
    const isOnline = lastHeartbeat
      ? (Date.now() - new Date(lastHeartbeat).getTime()) < 35 * 60 * 1000
      : false;

    const firstToday = uptimeResult.rows[0]?.first_today ?? null;
    let uptimeStr: string | null = null;
    if (firstToday) {
      const mins = Math.floor((Date.now() - new Date(firstToday).getTime()) / 60000);
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      uptimeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    }

    res.json({
      status:      isOnline ? 'Online' : 'Offline',
      shadow_mode: process.env.SHADOW_MODE === 'true',
      uptime:      uptimeStr,
      last_seen:   lastHeartbeat,
    });
  } catch (err) {
    console.error('[dashboard/heartbeat] Error:', err);
    res.status(500).json({ error: 'Failed to fetch heartbeat' });
  }
});

// GET /api/dashboard/pipeline/latest — latest pipeline run step statuses
router.get('/pipeline/latest', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT action_type, details, status, created_at, duration_ms
       FROM agent_activity_log
       WHERE action_type LIKE 'pipeline_step_%'
       ORDER BY created_at DESC
       LIMIT 11`
    );

    res.json({ steps: result.rows });
  } catch (err) {
    console.error('[dashboard/pipeline/latest] Error:', err);
    res.status(500).json({ error: 'Failed to fetch pipeline steps' });
  }
});

// GET /api/dashboard/activity-log/:demoId — pipeline trace for task detail page
router.get('/activity-log/:demoId', async (req: Request, res: Response) => {
  const { demoId } = req.params;

  try {
    const [activityResult, analysisResult] = await Promise.all([
      pool.query(
        `SELECT action_type, details, status, created_at, duration_ms
         FROM agent_activity_log
         WHERE demo_id = $1
         ORDER BY created_at ASC`,
        [demoId]
      ),
      pool.query(
        `SELECT
          feedback_source_id,
          conversion_status,
          agent_confidence,
          accountability_classification,
          processing_time_mins,
          tokens_used
         FROM demo_analysis WHERE demo_id = $1 LIMIT 1`,
        [demoId]
      ),
    ]);

    const analysis = analysisResult.rows[0] ?? null;

    const dataSources = [
      { name: 'Conducted Demo Sessions', ok: true },
      { name: 'Demo Feedback Form', ok: analysis ? analysis.feedback_source_id !== null : false },
      { name: 'Demo Conversion Sales', ok: analysis ? analysis.conversion_status !== null : false },
    ];

    res.json({
      activity_log: activityResult.rows,
      data_sources: dataSources,
      confidence:   analysis?.agent_confidence ? parseFloat(analysis.agent_confidence) : null,
      tokens_used:  analysis?.tokens_used ?? null,
    });
  } catch (err) {
    console.error('[dashboard/activity-log] Error:', err);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

export default router;
