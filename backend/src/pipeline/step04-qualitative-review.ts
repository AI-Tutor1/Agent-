// Step 4 — Qualitative Review ⚡ CLAUDE API
// Type: AI-powered. ~1,500 tokens. Only step where AI is justified.

import { pool } from '../db';
import { callClaude } from '../ai/claude-client';
import { ConductedDemoSession, DemoFeedback, TeacherProfile, PourFlag } from './types';

const SYSTEM_PROMPT = `You are a senior education quality analyst at Tuitional Education, a premium online tutoring platform.

Analyze this demo tutoring session and provide structured assessment:`;

function buildUserPrompt(
  demo: ConductedDemoSession,
  feedback: DemoFeedback | null,
  pourFlags: PourFlag[],
  teacher: TeacherProfile | null
): string {
  const feedbackText = feedback?.comments_other || feedback?.suggestions || 'No feedback provided';
  const rating = feedback?.overall_rating_10 ?? 'No rating';
  const pourSummary = pourFlags.length > 0
    ? pourFlags.map(f => `${f.category} (${f.severity}): ${f.description}`).join('; ')
    : 'None';

  return `DEMO DATA:
- Teacher: ${demo.teacher_name}${teacher ? ` (subjects: ${(teacher.subjects ?? []).join(', ')})` : ''}
- Student: ${demo.student_name}
- Subject: ${demo.subject ?? 'Not specified'} (${demo.academic_level ?? 'Level not specified'})
- Curriculum: ${demo.curriculum_board ?? 'Not specified'} — ${demo.curriculum_code ?? 'Not specified'}
- Date: ${demo.demo_date ? new Date(demo.demo_date).toDateString() : 'Not specified'}
- Session Notes: ${feedback?.confusion_moments || feedback?.discomfort_moments || 'No notes available'}
- Student Feedback (raw): ${feedbackText}
- Student Rating: ${rating}/10
- Topic Explained: ${feedback?.topic_explained ?? 'Unknown'}
- Student Participation: ${feedback?.participation ?? 'Unknown'}
- POUR Flags: ${pourSummary}

RESPOND IN EXACTLY THIS JSON FORMAT:
{
  "teaching_methodology": "2-3 sentences on pedagogical approach, pacing, scaffolding",
  "topic_selection": "1-2 sentences on curriculum alignment and relevance",
  "resource_usage": "1-2 sentences on materials, tools, supplementary resources",
  "interactivity_notes": "1-2 sentences on student engagement and questioning techniques",
  "overall_effectiveness": "2-3 sentences on session quality and learning outcomes",
  "improvement_suggestions": "2-3 concrete, actionable improvements",
  "analyst_rating": 3,
  "confidence": 7.5
}

RULES:
- Be specific. Reference actual subject content, not generic praise.
- Rate conservatively. 5/5 is exceptional. 3/5 is adequate.
- If data is insufficient, say so explicitly and lower confidence.
- Never fabricate details not present in the input.`;
}

export async function step4QualitativeReview(
  demo: ConductedDemoSession,
  analysisId: string,
  feedback: DemoFeedback | null,
  pourFlags: PourFlag[],
  teacher: TeacherProfile | null
): Promise<number> {
  let tokensUsed = 0;

  try {
    const response = await callClaude(SYSTEM_PROMPT, buildUserPrompt(demo, feedback, pourFlags, teacher), 1500);
    tokensUsed = response.totalTokens;
    const d = response.data;

    await pool.query(
      `UPDATE demo_analysis SET
        teaching_methodology    = $1,
        topic_selection         = $2,
        resource_usage          = $3,
        interactivity_notes     = $4,
        overall_effectiveness   = $5,
        improvement_suggestions = $6,
        analyst_rating          = $7,
        agent_confidence        = $8,
        updated_at              = NOW()
       WHERE analysis_id = $9`,
      [
        d['teaching_methodology'] ?? null,
        d['topic_selection'] ?? null,
        d['resource_usage'] ?? null,
        d['interactivity_notes'] ?? null,
        d['overall_effectiveness'] ?? null,
        d['improvement_suggestions'] ?? null,
        typeof d['analyst_rating'] === 'number' ? Math.round(d['analyst_rating'] as number) : null,
        typeof d['confidence'] === 'number' ? d['confidence'] : null,
        analysisId,
      ]
    );

    await pool.query(
      `INSERT INTO agent_activity_log
        (agent_name, action_type, demo_id, analysis_id, tokens_used, status, details)
       VALUES ('wajeeha_pipeline', 'step04_qualitative_review', $1, $2, $3, 'success', $4)`,
      [demo.demo_id, analysisId, tokensUsed,
       JSON.stringify({ model: 'claude-sonnet-4-6', analyst_rating: d['analyst_rating'], confidence: d['confidence'] })]
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[step04] Claude API failed for ${demo.demo_id}: ${message}`);

    await pool.query(
      `UPDATE demo_analysis SET agent_confidence = 0 WHERE analysis_id = $1`,
      [analysisId]
    );

    await pool.query(
      `INSERT INTO escalations (source_agent, severity, type, title, description, reference_id)
       VALUES ('wajeeha_pipeline', 'high', 'api_failure', 'Step 4 Claude API failure', $1, $2)`,
      [message, analysisId]
    );
  }

  return tokensUsed;
}
