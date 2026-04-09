import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        a.analysis_id AS id,
        a.demo_id AS "demoId",
        a.analysis_status AS status,
        a.teacher_name AS teacher,
        a.student_name AS student,
        a.academic_level AS level,
        a.subject,
        TO_CHAR(a.demo_date, 'DD Mon YYYY') AS date,
        a.sales_agent AS "salesAgent",
        a.agent_confidence AS confidence,
        a.student_rating_converted AS "studentRating",
        a.analyst_rating AS "analystRating",
        a.conversion_status AS "conversionStatus",
        a.teaching_methodology AS methodology,
        a.topic_selection AS "topicSelection",
        a.resource_usage AS "resourceUsage",
        a.interactivity_notes AS interactivity,
        a.overall_effectiveness AS effectiveness,
        a.improvement_suggestions AS improvements,
        a.accountability_classification,
        a.accountability_evidence,
        a.accountability_confidence,
        a.processing_time_mins AS "processingTime",
        a.tokens_used AS "tokensUsed",
        f.comments_other AS "feedbackText"
       FROM demo_analysis a
       LEFT JOIN demo_feedback f ON f.feedback_id = a.feedback_source_id
       ORDER BY a.created_at DESC`
    );

    const analyses = await Promise.all(result.rows.map(async (r) => {
      const pourResult = await pool.query(
        `SELECT category, severity, description FROM pour_flags WHERE analysis_id = $1`,
        [r.id]
      );

      return {
        id: r.id,
        demoId: r.demoId,
        status: r.status || 'pending_review',
        teacher: r.teacher || '',
        student: r.student || '',
        level: r.level || '',
        subject: r.subject || '',
        date: r.date || '',
        salesAgent: r.salesAgent || '',
        confidence: parseFloat(r.confidence) || 0,
        studentRating: r.studentRating || 0,
        analystRating: r.analystRating || 0,
        conversionStatus: r.conversionStatus || 'Pending',
        methodology: r.methodology || '',
        topicSelection: r.topicSelection || '',
        resourceUsage: r.resourceUsage || '',
        interactivity: r.interactivity || '',
        effectiveness: r.effectiveness || '',
        improvements: r.improvements || '',
        pourFlags: pourResult.rows,
        accountability: r.accountability_classification ? {
          classification: r.accountability_classification,
          evidence: r.accountability_evidence || '',
          confidence: r.accountability_confidence || '',
        } : null,
        processingTime: r.processingTime ? `${r.processingTime}m` : '',
        tokensUsed: r.tokensUsed || 0,
        feedbackText: r.feedbackText || '',
      };
    }));

    res.json(analyses);
  } catch (err) {
    console.error('Error fetching analyses:', err);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        a.analysis_id AS id,
        a.demo_id AS "demoId",
        a.analysis_status AS status,
        a.teacher_name AS teacher,
        a.student_name AS student,
        a.academic_level AS level,
        a.subject,
        TO_CHAR(a.demo_date, 'DD Mon YYYY') AS date,
        a.sales_agent AS "salesAgent",
        a.agent_confidence AS confidence,
        a.student_rating_converted AS "studentRating",
        a.analyst_rating AS "analystRating",
        a.conversion_status AS "conversionStatus",
        a.teaching_methodology AS methodology,
        a.topic_selection AS "topicSelection",
        a.resource_usage AS "resourceUsage",
        a.interactivity_notes AS interactivity,
        a.overall_effectiveness AS effectiveness,
        a.improvement_suggestions AS improvements,
        a.accountability_classification,
        a.accountability_evidence,
        a.accountability_confidence,
        a.processing_time_mins AS "processingTime",
        a.tokens_used AS "tokensUsed",
        f.comments_other AS "feedbackText"
       FROM demo_analysis a
       LEFT JOIN demo_feedback f ON f.feedback_id = a.feedback_source_id
       WHERE a.analysis_id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }

    const r = result.rows[0];
    const pourResult = await pool.query(
      `SELECT category, severity, description FROM pour_flags WHERE analysis_id = $1`,
      [r.id]
    );

    res.json({
      ...r,
      pourFlags: pourResult.rows,
      accountability: r.accountability_classification ? {
        classification: r.accountability_classification,
        evidence: r.accountability_evidence || '',
        confidence: r.accountability_confidence || '',
      } : null,
    });
  } catch (err) {
    console.error('Error fetching analysis:', err);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { status, reviewNotes, reviewedBy } = req.body;
  try {
    await pool.query(
      `UPDATE demo_analysis
       SET analysis_status = $1, review_notes = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
       WHERE analysis_id = $4`,
      [status, reviewNotes, reviewedBy, req.params.id]
    );
    res.json({ status: 'updated' });
  } catch (err) {
    console.error('Error updating analysis status:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
});

export default router;
