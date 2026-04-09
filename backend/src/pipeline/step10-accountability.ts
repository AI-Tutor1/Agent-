// Step 10 — Accountability Classification ⚡ CLAUDE API
// Type: AI-powered. ~1,000 tokens.
// ONLY runs when conversion_status = 'Not Converted'.

import { pool } from '../db';
import { callClaude } from '../ai/claude-client';
import { ConductedDemoSession, DemoFeedback, PourFlag, SalesData } from './types';

const SYSTEM_PROMPT = `You are an accountability analyst at Tuitional Education.
A demo session did NOT convert to a paid enrollment. Classify why.`;

function buildUserPrompt(
  demo: ConductedDemoSession,
  feedback: DemoFeedback | null,
  salesData: SalesData,
  pourFlags: PourFlag[],
  methodology: string | null
): string {
  const feedbackText = feedback?.comments_other || feedback?.suggestions || 'No feedback provided';
  const pourSummary = pourFlags.length > 0
    ? pourFlags.map(f => `${f.category} (${f.severity}): ${f.description}`).join('; ')
    : 'None';

  return `DATA:
- Teacher: ${demo.teacher_name} — Teaching Analysis: ${methodology ?? 'Not available'}
- Student: ${demo.student_name} — Feedback: ${feedbackText}
- Sales Agent: ${salesData.sales_agent ?? 'Unknown'} — Sales Comments: ${salesData.sales_comments ?? 'No comments'}
- POUR Flags: ${pourSummary}
- Conversion Status: Not Converted

CLASSIFY into exactly ONE of:
- "Sales" — Sales agent did not follow up, poor closing, missed opportunities
- "Product" — Teaching quality issues, wrong resource allocation, methodology gaps
- "Consumer" — Parent/student decided against it regardless of quality (price, timing, preference)
- "Mixed" — Multiple factors from different categories

RESPOND IN JSON:
{
  "classification": "Sales|Product|Consumer|Mixed",
  "evidence": "1-2 sentence explanation referencing specific data points",
  "confidence": "high|medium|low"
}`;
}

export async function step10Accountability(
  demo: ConductedDemoSession,
  analysisId: string,
  feedback: DemoFeedback | null,
  salesData: SalesData | null,
  pourFlags: PourFlag[]
): Promise<number> {
  // Only runs for 'Not Converted'
  if (!salesData) {
    await pool.query(
      `UPDATE demo_analysis SET accountability_classification = 'awaiting_sales_input', updated_at = NOW()
       WHERE analysis_id = $1`,
      [analysisId]
    );
    return 0;
  }

  if (salesData.conversion_status !== 'Not Converted') {
    return 0; // Skip — converted or pending, no accountability classification needed
  }

  // Fetch the methodology written in step 4
  const methodResult = await pool.query<{ teaching_methodology: string }>(
    `SELECT teaching_methodology FROM demo_analysis WHERE analysis_id = $1`,
    [analysisId]
  );
  const methodology = methodResult.rows[0]?.teaching_methodology ?? null;

  let tokensUsed = 0;

  try {
    const response = await callClaude(
      SYSTEM_PROMPT,
      buildUserPrompt(demo, feedback, salesData, pourFlags, methodology),
      1000
    );
    tokensUsed = response.totalTokens;
    const d = response.data;

    await pool.query(
      `UPDATE demo_analysis SET
        conversion_status             = $1,
        sales_agent                   = $2,
        accountability_classification = $3,
        accountability_evidence       = $4,
        accountability_confidence     = $5,
        updated_at                    = NOW()
       WHERE analysis_id = $6`,
      [
        salesData.conversion_status,
        salesData.sales_agent,
        d['classification'] ?? null,
        d['evidence'] ?? null,
        d['confidence'] ?? null,
        analysisId,
      ]
    );

    await pool.query(
      `INSERT INTO agent_activity_log
        (agent_name, action_type, demo_id, analysis_id, tokens_used, status, details)
       VALUES ('wajeeha_pipeline', 'step10_accountability', $1, $2, $3, 'success', $4)`,
      [demo.demo_id, analysisId, tokensUsed,
       JSON.stringify({ model: 'claude-sonnet-4-6', classification: d['classification'], confidence: d['confidence'] })]
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[step10] Claude API failed for ${demo.demo_id}: ${message}`);

    await pool.query(
      `INSERT INTO escalations (source_agent, severity, type, title, description, reference_id)
       VALUES ('wajeeha_pipeline', 'high', 'api_failure', 'Step 10 Claude API failure', $1, $2)`,
      [message, analysisId]
    );
  }

  return tokensUsed;
}
