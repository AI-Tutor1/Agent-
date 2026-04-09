import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { runPipeline } from '../pipeline/run-pipeline';
import { PipelineError } from '../pipeline/types';
import { webhookAuth } from '../middleware/auth';

const router = Router();

// POST /api/webhooks/demo-complete — trigger pipeline for a demo
// Requires X-Webhook-Secret header matching AGENT_COMMAND_WEBHOOK_SECRET
router.post('/demo-complete', webhookAuth, async (req: Request, res: Response) => {
  const { demo_id } = req.body as { demo_id?: string };
  if (!demo_id) {
    res.status(400).json({ error: 'demo_id is required' });
    return;
  }

  // Validate demo_id exists BEFORE responding
  try {
    const check = await pool.query(
      `SELECT demo_id FROM conducted_demo_sessions WHERE demo_id = $1`,
      [demo_id]
    );
    if (check.rows.length === 0) {
      res.status(404).json({
        error: {
          code: 'DEMO_NOT_FOUND',
          message: `Demo with ID ${demo_id} does not exist`,
          status: 404,
        },
      });
      return;
    }
  } catch (err) {
    console.error('[webhook] DB check failed:', err);
    res.status(500).json({ error: 'Database error during demo validation' });
    return;
  }

  // Respond immediately — fire and forget the pipeline
  res.json({ pipeline_started: true, demo_id });

  // Run pipeline in background (do NOT await)
  void runPipeline(demo_id).catch((err: unknown) => {
    if (err instanceof PipelineError && err.code === 'DEMO_NOT_FOUND') {
      console.error(`[webhook] Demo not found during pipeline: ${demo_id}`);
    } else {
      console.error(`[webhook] Pipeline error for ${demo_id}:`, err);
    }
  });
});

// GET /api/pipeline/status/:demoId — pipeline status for a demo
router.get('/status/:demoId', async (req: Request, res: Response) => {
  try {
    const { demoId } = req.params;

    const [demoResult, analysisResult] = await Promise.all([
      pool.query(
        `SELECT demo_id, analysis_status, teacher_name, student_name, subject, created_at
         FROM conducted_demo_sessions WHERE demo_id = $1`,
        [demoId]
      ),
      pool.query(
        `SELECT analysis_id, analysis_status, agent_confidence, processing_time_mins,
                tokens_used, pour_present, created_at, updated_at
         FROM demo_analysis WHERE demo_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [demoId]
      ),
    ]);

    if (demoResult.rows.length === 0) {
      res.status(404).json({ error: 'Demo not found' });
      return;
    }

    res.json({
      demo: demoResult.rows[0],
      analysis: analysisResult.rows[0] ?? null,
    });
  } catch (err) {
    console.error('[pipeline/status] Error:', err);
    res.status(500).json({ error: 'Failed to fetch pipeline status' });
  }
});

export default router;
