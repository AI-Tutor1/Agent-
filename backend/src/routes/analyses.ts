import { Router } from 'express';
import { pool } from '../db';
import { MOCK_ANALYSES } from '../data/mock';

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

    if (result.rows.length > 0) {
      const analyses = await Promise.all(result.rows.map(async (r) => {
        // Fetch POUR flags for this analysis
        const pourResult = await pool.query(
          `SELECT pour_category AS category, severity, description
           FROM pour_flags WHERE analysis_id = $1`,
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
      return;
    }
    res.json(MOCK_ANALYSES);
  } catch (err) {
    console.error('Error fetching analyses:', err);
    res.json(MOCK_ANALYSES);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT analysis_id AS id, demo_id, analysis_status AS status,
              teacher_name, student_name, academic_level, subject
       FROM demo_analysis WHERE analysis_id = $1`,
      [req.params.id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
      return;
    }
    const mockAnalysis = MOCK_ANALYSES.find(a => a.id === req.params.id);
    if (mockAnalysis) {
      res.json(mockAnalysis);
      return;
    }
    res.status(404).json({ error: 'Analysis not found' });
  } catch (err) {
    console.error('Error fetching analysis:', err);
    const mockAnalysis = MOCK_ANALYSES.find(a => a.id === req.params.id);
    res.json(mockAnalysis || { error: 'Analysis not found' });
  }
});

// PATCH: Update analysis status (approve, reject, redo, escalate)
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
