// lib/agents/wajeeha/pipeline.ts
// Core 11-step demo processing pipeline
// Mirrors Wajeeha Gul's manual workflow exactly

import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'
import { db } from '../../db'
import { logAgentActivity } from '../../db/activity-log'
import { sendNotification } from '../../notifications'
import { getLMSRecordingUrl } from '../../integrations/lms-mock'
import {
  identifyEarlyPourFlags,
  mergePourFlags,
  writePourFlags,
  type DemoRecord,
  type FeedbackRecord,
  type PourFlag
} from './pour-classifier'
import { standardiseRatings, isLowRatedDemo, type RatingResult } from './rating-converter'
import {
  validateClassification,
  writeAccountabilityLog,
  updateSheet30Accountability,
  type AccountabilityResult
} from './accountability'
import { updateTeacherProgress } from './teacher-progress'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Load static prompts/knowledge at module level (cached)
function loadFile(relativePath: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
  } catch {
    return `[File not found: ${relativePath}]`
  }
}

const DEMO_ANALYSIS_PROMPT = loadFile('prompts/demo-analysis.md')
const POUR_KNOWLEDGE = loadFile('knowledge-base/POUR-framework.md')
const ACCOUNTABILITY_KNOWLEDGE = loadFile('knowledge-base/accountability-classification.md')

export interface QualitativeAnalysis {
  teaching_methodology: string | null
  topic_selection: string | null
  resource_usage: string | null
  interactivity_notes: string | null
  overall_effectiveness: string | null
  improvement_suggestions: string | null
  analyst_rating: number | null
  pour_flags: PourFlag[]
  accountability_classification: string | null
  accountability_evidence: string | null
  accountability_confidence: 'high' | 'medium' | 'low' | null
  agent_confidence: number
  notes: string | null
}

export interface SalesRecord {
  id: number
  demo_date: string | null
  teacher_name: string | null
  student_name: string | null
  academic_level: string | null
  subject: string | null
  conversion_status: string | null
  sales_comments: string | null
  sales_agent: string | null
  parent_contact: string | null
  matched_demo_id: string | null
}

export interface PipelineResult {
  success: boolean
  analysis_id: string | null
  demo_id: string
  processing_time_ms: number
  pour_flags_count: number
  conversion_status: string | null
  shadow_mode: boolean
  tokens_used: number
  status?: string
  message?: string
  error?: string
}

// ============================================================
// MAIN PIPELINE ENTRY POINT
// ============================================================
export async function processDemoAnalysis(demo_id: string): Promise<PipelineResult> {
  const startTime = Date.now()
  const shadowMode = process.env.SHADOW_MODE === 'true'
  let totalTokens = 0
  let analysisId: string | null = null

  await logAgentActivity({
    action_type: 'pipeline_start',
    demo_id,
    status: 'success',
    details: { shadow_mode: shadowMode }
  })

  // Mark as in_progress
  await db.query(
    `UPDATE conducted_demo_sessions SET analysis_status = 'in_progress' WHERE demo_id = $1`,
    [demo_id]
  )

  try {
    // STEP 1: Retrieve demo record (hard stop if not found)
    const demoRecord = await step1_retrieveDemo(demo_id)

    // STEP 2: Initial logging
    analysisId = await step2_initialLogging(demoRecord)

    // Proof checkpoint at ~8min mark: a record now exists in demo_analysis
    await logAgentActivity({
      action_type: 'proof_checkpoint',
      demo_id,
      analysis_id: analysisId,
      status: 'success',
      details: { message: 'Initial record written to demo_analysis' }
    })

    // STEP 3: POUR identification (early rule-based flags)
    const { pourFlags: earlyPourFlags, recordingAvailable } = await step3_pourIdentification(
      demoRecord,
      analysisId
    )

    // STEP 4: Fetch student feedback (needed before Claude call for context)
    const feedbackRecord = await step5_fetchStudentFeedback(demoRecord)

    // STEP 4: Qualitative review (calls Claude)
    const { analysis: qualitativeAnalysis, tokensUsed } = await step4_qualitativeReview(
      demoRecord,
      earlyPourFlags,
      feedbackRecord
    )
    totalTokens += tokensUsed

    // Merge Claude POUR flags with rule-based flags
    const claudePourFlags: PourFlag[] = (qualitativeAnalysis.pour_flags || []).filter(
      (f: PourFlag) => f && f.category
    )
    const allPourFlags = mergePourFlags(earlyPourFlags, claudePourFlags)

    // Write merged POUR flags to DB
    await writePourFlags(demo_id, analysisId, allPourFlags)

    // STEP 6: Rating standardisation
    const ratings = standardiseRatings(
      feedbackRecord?.overall_rating_10 ?? null,
      qualitativeAnalysis.analyst_rating
    )

    // Flag low-rated demo
    if (isLowRatedDemo(ratings.student_rating_raw)) {
      await sendNotification({
        recipient: 'dawood_agent',
        type: 'low_rated_demo_flagged',
        payload: {
          demo_id,
          analysis_id: analysisId,
          teacher: demoRecord.teacher_name,
          student: demoRecord.student_name,
          raw_rating: ratings.student_rating_raw
        },
        priority: 'high'
      })
    }

    // STEP 7: Export to sales sheet (upsert stub if not present)
    await step7_exportToSalesSheet(demoRecord)

    // CHECK: Is sales data already available?
    const salesAvailable = await checkSalesDataAvailable(demo_id)

    if (!salesAvailable) {
      // Pause — update status and wait for sales submission
      await db.query(
        `UPDATE conducted_demo_sessions SET analysis_status = 'awaiting_sales_input'
         WHERE demo_id = $1`,
        [demo_id]
      )
      await logAgentActivity({
        agent_name: 'wajeeha_agent',
        action_type: 'pipeline_paused_awaiting_sales',
        demo_id,
        analysis_id: analysisId,
        status: 'partial',
        tokens_used: totalTokens,
        duration_ms: Date.now() - startTime,
        details: { paused_at_step: 7, reason: 'No sales input yet' }
      })

      // Notify sales agent
      await sendNotification({
        recipient: 'sales_agent',
        type: 'sales_input_required',
        payload: {
          demo_id,
          teacher: demoRecord.teacher_name,
          student: demoRecord.student_name,
          demo_date: demoRecord.demo_date
        },
        priority: 'low'
      })

      return {
        success: true,
        analysis_id: analysisId,
        demo_id,
        processing_time_ms: Date.now() - startTime,
        pour_flags_count: allPourFlags.length,
        conversion_status: null,
        shadow_mode: shadowMode,
        tokens_used: totalTokens,
        status: 'awaiting_sales_input',
        message: 'Pipeline paused at Step 7. Will resume when sales submits.'
      }
    }

    // Sales data available — continue steps 8–11
    const salesData = await step8_pullSalesData(demo_id, demoRecord)

    // STEP 9: Compile Sheet30
    await step9_compileSheet30(demoRecord, qualitativeAnalysis, ratings, salesData, analysisId)

    // STEP 10: Accountability classification
    const accountability = await step10_classifyAccountability(
      demoRecord,
      salesData,
      qualitativeAnalysis,
      analysisId
    )

    // STEP 11: Update teacher progress
    await step11_updateTeacherProgress(
      demoRecord,
      ratings,
      allPourFlags,
      accountability,
      salesData
    )

    // Finalise the demo_analysis record
    await finaliseAnalysis(
      analysisId,
      qualitativeAnalysis,
      ratings,
      allPourFlags,
      salesData,
      accountability,
      totalTokens
    )

    // Notify Dawood Agent
    await sendNotification({
      recipient: 'dawood_agent',
      type: 'demo_ready_for_review',
      payload: {
        demo_id,
        analysis_id: analysisId,
        teacher: demoRecord.teacher_name,
        student: demoRecord.student_name,
        pour_flags_count: allPourFlags.length,
        conversion_status: salesData?.conversion_status || null,
        accountability: accountability?.classification || null,
        recording_available: recordingAvailable
      },
      priority: 'medium'
    })

    // Mark complete
    await db.query(
      `UPDATE conducted_demo_sessions SET analysis_status = 'complete' WHERE demo_id = $1`,
      [demo_id]
    )

    const processingMs = Date.now() - startTime

    await logAgentActivity({
      action_type: 'pipeline_complete',
      demo_id,
      analysis_id: analysisId,
      status: 'success',
      tokens_used: totalTokens,
      duration_ms: processingMs,
      details: {
        pour_flags_count: allPourFlags.length,
        conversion_status: salesData?.conversion_status || null,
        accountability: accountability?.classification || null
      }
    })

    return {
      success: true,
      analysis_id: analysisId,
      demo_id,
      processing_time_ms: processingMs,
      pour_flags_count: allPourFlags.length,
      conversion_status: salesData?.conversion_status || null,
      shadow_mode: shadowMode,
      tokens_used: totalTokens
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)

    // Write escalation
    await db.query(
      `INSERT INTO escalations (demo_id, escalation_type, reason, urgency)
       VALUES ($1, $2, $3, $4)`,
      [demo_id, 'pipeline_failure', message, 'high']
    ).catch(() => {})

    await db.query(
      `UPDATE conducted_demo_sessions SET analysis_status = 'escalated' WHERE demo_id = $1`,
      [demo_id]
    ).catch(() => {})

    await logAgentActivity({
      action_type: 'pipeline_failed',
      demo_id,
      analysis_id: analysisId,
      status: 'failed',
      error_message: message,
      duration_ms: Date.now() - startTime
    })

    return {
      success: false,
      analysis_id: analysisId,
      demo_id,
      processing_time_ms: Date.now() - startTime,
      pour_flags_count: 0,
      conversion_status: null,
      shadow_mode: shadowMode,
      tokens_used: totalTokens,
      error: message
    }
  }
}

// ============================================================
// STEP 1: Retrieve demo record — HARD STOP if not found
// ============================================================
async function step1_retrieveDemo(demo_id: string): Promise<DemoRecord> {
  const result = await db.query(
    `SELECT * FROM conducted_demo_sessions WHERE demo_id = $1`,
    [demo_id]
  )
  if (result.rows.length === 0) {
    throw new Error(`Demo '${demo_id}' not found in conducted_demo_sessions`)
  }

  const row = result.rows[0]

  // Validate required fields
  const missing: string[] = []
  if (!row.teacher_name) missing.push('teacher_name')
  if (!row.student_name) missing.push('student_name')
  if (!row.demo_date) missing.push('demo_date')

  if (missing.length > 0) {
    await db.query(
      `INSERT INTO data_integrity_flags (demo_id, issue_type, description)
       VALUES ($1, $2, $3)`,
      [demo_id, 'missing_required_field', `Missing: ${missing.join(', ')}`]
    )
    await db.query(
      `INSERT INTO escalations (demo_id, escalation_type, reason, urgency)
       VALUES ($1, $2, $3, $4)`,
      [
        demo_id,
        'data_integrity',
        `Demo record missing required fields: ${missing.join(', ')}`,
        'high'
      ]
    )
    throw new Error(`Demo '${demo_id}' is missing required fields: ${missing.join(', ')}`)
  }

  return row as unknown as DemoRecord
}

// ============================================================
// STEP 2: Initial logging
// ============================================================
async function step2_initialLogging(demo: DemoRecord): Promise<string> {
  // Look up teacher_id
  const teacherResult = await db.query(
    `SELECT teacher_id FROM teacher_profiles
     WHERE LOWER(teacher_name) = LOWER($1)
        OR $1 = ANY(name_aliases)
     LIMIT 1`,
    [demo.teacher_name]
  )
  const teacherId = (teacherResult.rows[0]?.teacher_id as string) || null

  if (!teacherId) {
    await db.query(
      `INSERT INTO data_integrity_flags (demo_id, issue_type, description)
       VALUES ($1, $2, $3)`,
      [
        demo.demo_id,
        'missing_teacher_id',
        `Teacher '${demo.teacher_name}' not found in teacher_profiles — proceeding with null teacher_id`
      ]
    )
  }

  const result = await db.query(
    `INSERT INTO demo_analysis
     (demo_id, demo_date, teacher_name, teacher_id, student_name, academic_level, subject, analysis_status, shadow_mode)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'in_progress', $8)
     RETURNING analysis_id`,
    [
      demo.demo_id,
      demo.demo_date,
      demo.teacher_name,
      teacherId,
      demo.student_name,
      demo.academic_level,
      demo.subject,
      process.env.SHADOW_MODE === 'true'
    ]
  )

  return String(result.rows[0].analysis_id)
}

// ============================================================
// STEP 3: POUR identification (rule-based early flags)
// ============================================================
async function step3_pourIdentification(
  demo: DemoRecord,
  analysisId: string
): Promise<{ pourFlags: PourFlag[]; recordingAvailable: boolean }> {
  const recordingUrl = await getLMSRecordingUrl(demo.demo_id)
  const recordingAvailable = !!recordingUrl

  // Fetch feedback early to use in rule-based POUR check
  const feedbackResult = await db.query(
    `SELECT * FROM demo_feedback
     WHERE LOWER(tutor_name) LIKE LOWER($1)
       AND LOWER(student_name) LIKE LOWER($2)
       AND session_date BETWEEN $3::date - 2 AND $3::date + 2
     ORDER BY ABS(session_date - $3::date) ASC
     LIMIT 1`,
    [
      `%${demo.teacher_name.split(' ')[0]}%`,
      `%${demo.student_name.split(' ')[0]}%`,
      demo.demo_date
    ]
  )
  const feedback = (feedbackResult.rows[0] as unknown as FeedbackRecord) || null

  const earlyFlags = identifyEarlyPourFlags(recordingAvailable, feedback)
  // Don't write to DB yet — will be done after Claude merges flags in pipeline
  return { pourFlags: earlyFlags, recordingAvailable }
}

// ============================================================
// STEP 4: Qualitative review (Claude API)
// ============================================================
async function step4_qualitativeReview(
  demo: DemoRecord,
  pourFlags: PourFlag[],
  feedback: FeedbackRecord | null
): Promise<{ analysis: QualitativeAnalysis; tokensUsed: number }> {
  // Get teacher history
  const teacherHistory = await db.query(
    `SELECT notes, avg_student_rating, avg_analyst_rating, product_accountability_count,
            consecutive_product_flags, review_flag
     FROM teacher_progress WHERE LOWER(teacher_name) = LOWER($1)`,
    [demo.teacher_name]
  )

  const demoContext = `
## Current Demo to Analyse
- Teacher: ${demo.teacher_name}
- Student: ${demo.student_name}
- Level: ${demo.academic_level || 'Not specified'}
- Subject: ${demo.subject || 'Not specified'}
- Date: ${demo.demo_date}
- Recording available: ${demo.recording_url ? 'Yes — ' + demo.recording_url : 'No'}

## Student Feedback (from Demo Feedback Form)
${
  feedback
    ? `- Overall rating: ${feedback.overall_rating_10}/10
- Participation: ${feedback.participation || 'Not reported'}
- Topic explained clearly: ${feedback.topic_explained || 'Not reported'}
- Confusion moments: ${feedback.confusion_moments || 'None reported'}
- Discomfort moments: ${feedback.discomfort_moments || 'None reported'}
- Positive environment: ${feedback.positive_environment}/5
- Suggestions: ${feedback.suggestions || 'None'}
- Comments: ${feedback.comments_other || 'None'}`
    : 'No feedback form match found for this demo.'
}

## Teacher Historical Context
${
  teacherHistory.rows[0]
    ? `- Avg student rating: ${teacherHistory.rows[0].avg_student_rating}/5
- Avg analyst rating: ${teacherHistory.rows[0].avg_analyst_rating}/5
- Product accountability count: ${teacherHistory.rows[0].product_accountability_count}
- Consecutive product flags: ${teacherHistory.rows[0].consecutive_product_flags}
- Under review: ${teacherHistory.rows[0].review_flag ? 'YES' : 'No'}
- Notes: ${teacherHistory.rows[0].notes || 'None'}`
    : 'No historical data available for this teacher.'
}

## Early POUR Flags Already Identified (rule-based)
${pourFlags.length > 0 ? JSON.stringify(pourFlags, null, 2) : 'None identified yet'}

Please produce the JSON analysis as specified in the prompt.
`

  let analysis: QualitativeAnalysis = {
    teaching_methodology: null,
    topic_selection: null,
    resource_usage: null,
    interactivity_notes: null,
    overall_effectiveness: null,
    improvement_suggestions: null,
    analyst_rating: null,
    pour_flags: [],
    accountability_classification: null,
    accountability_evidence: null,
    accountability_confidence: null,
    agent_confidence: 0,
    notes: null
  }
  let tokensUsed = 0

  // Retry once on failure
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contentBlocks: any[] = [
        {
          type: 'text',
          text: POUR_KNOWLEDGE,
          cache_control: { type: 'ephemeral' }
        },
        {
          type: 'text',
          text: ACCOUNTABILITY_KNOWLEDGE,
          cache_control: { type: 'ephemeral' }
        },
        {
          type: 'text',
          text: DEMO_ANALYSIS_PROMPT,
          cache_control: { type: 'ephemeral' }
        },
        {
          type: 'text',
          text: demoContext
        }
      ]

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: contentBlocks }]
      })

      tokensUsed =
        (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)

      const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { text: string }).text)
        .join('')

      // Strip markdown fences
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in Claude response')

      const parsed = JSON.parse(jsonMatch[0])

      // Populate analysis with parsed values, defaulting missing fields to null
      analysis = {
        teaching_methodology: parsed.teaching_methodology || null,
        topic_selection: parsed.topic_selection || null,
        resource_usage: parsed.resource_usage || null,
        interactivity_notes: parsed.interactivity_notes || null,
        overall_effectiveness: parsed.overall_effectiveness || null,
        improvement_suggestions: parsed.improvement_suggestions || null,
        analyst_rating: typeof parsed.analyst_rating === 'number' ? parsed.analyst_rating : null,
        pour_flags: Array.isArray(parsed.pour_flags) ? parsed.pour_flags : [],
        accountability_classification: parsed.accountability_classification || null,
        accountability_evidence: parsed.accountability_evidence || null,
        accountability_confidence: parsed.accountability_confidence || null,
        agent_confidence:
          typeof parsed.agent_confidence === 'number' ? parsed.agent_confidence : 0,
        notes: parsed.notes || null
      }

      break // success
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (attempt === 1) {
        await new Promise((r) => setTimeout(r, 2000))
      } else {
        // Second failure — degrade gracefully
        await db.query(
          `INSERT INTO escalations (demo_id, escalation_type, reason, urgency)
           VALUES ($1, $2, $3, $4)`,
          [
            'unknown',
            'claude_api_failure',
            `Claude API failed after 2 attempts: ${message}`,
            'medium'
          ]
        ).catch(() => {})
        await logAgentActivity({
          action_type: 'claude_call_failed',
          status: 'failed',
          error_message: message
        })
      }
    }
  }

  await logAgentActivity({
    action_type: 'claude_analysis_complete',
    status: 'success',
    tokens_used: tokensUsed,
    details: {
      analyst_rating: analysis.analyst_rating,
      agent_confidence: analysis.agent_confidence,
      pour_flags_from_claude: analysis.pour_flags.length
    }
  })

  return { analysis, tokensUsed }
}

// ============================================================
// STEP 5: Fetch student feedback
// ============================================================
async function step5_fetchStudentFeedback(demo: DemoRecord): Promise<FeedbackRecord | null> {
  // Try exact match first
  let result = await db.query(
    `SELECT * FROM demo_feedback
     WHERE LOWER(tutor_name) LIKE LOWER($1)
       AND LOWER(student_name) LIKE LOWER($2)
       AND session_date BETWEEN $3::date - 2 AND $3::date + 2
     ORDER BY ABS(session_date - $3::date) ASC
     LIMIT 1`,
    [
      `%${demo.teacher_name.split(' ')[0]}%`,
      `%${demo.student_name.split(' ')[0]}%`,
      demo.demo_date
    ]
  )

  if (result.rows.length > 0) {
    const feedbackId = result.rows[0].feedback_id as number
    await db.query(
      `UPDATE demo_feedback SET matched_demo_id = $1, match_confidence = 'exact'
       WHERE feedback_id = $2`,
      [demo.demo_id, feedbackId]
    )
    return result.rows[0] as unknown as FeedbackRecord
  }

  // Fuzzy match: wider date window
  result = await db.query(
    `SELECT * FROM demo_feedback
     WHERE LOWER(tutor_name) LIKE LOWER($1)
       AND session_date BETWEEN $2::date - 5 AND $2::date + 5
     ORDER BY ABS(session_date - $2::date) ASC
     LIMIT 1`,
    [`%${demo.teacher_name.split(' ')[0]}%`, demo.demo_date]
  )

  if (result.rows.length > 0) {
    const feedbackId = result.rows[0].feedback_id as number
    await db.query(
      `UPDATE demo_feedback SET matched_demo_id = $1, match_confidence = 'fuzzy'
       WHERE feedback_id = $2`,
      [demo.demo_id, feedbackId]
    )
    return result.rows[0] as unknown as FeedbackRecord
  }

  // No match
  await db.query(
    `INSERT INTO data_integrity_flags (demo_id, issue_type, description)
     VALUES ($1, $2, $3)`,
    [
      demo.demo_id,
      'feedback_not_found',
      `No matching feedback for teacher '${demo.teacher_name}' / student '${demo.student_name}' around ${demo.demo_date}`
    ]
  )
  return null
}

// ============================================================
// CHECK: Sales data available?
// ============================================================
async function checkSalesDataAvailable(demo_id: string): Promise<boolean> {
  const result = await db.query(
    `SELECT conversion_status FROM demo_conversion_sales
     WHERE matched_demo_id = $1
     AND conversion_status IS NOT NULL`,
    [demo_id]
  )
  return result.rows.length > 0
}

// ============================================================
// STEP 7: Export to sales sheet
// ============================================================
async function step7_exportToSalesSheet(demo: DemoRecord): Promise<void> {
  const existing = await db.query(
    `SELECT id FROM demo_conversion_sales WHERE matched_demo_id = $1`,
    [demo.demo_id]
  )

  if (existing.rows.length === 0) {
    await db.query(
      `INSERT INTO demo_conversion_sales
       (demo_date, teacher_name, student_name, academic_level, subject, matched_demo_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        demo.demo_date,
        demo.teacher_name,
        demo.student_name,
        demo.academic_level,
        demo.subject,
        demo.demo_id
      ]
    )
  }
  // Do not overwrite existing sales data
}

// ============================================================
// STEP 8: Pull sales team input
// ============================================================
async function step8_pullSalesData(
  demo_id: string,
  demo: DemoRecord
): Promise<SalesRecord | null> {
  const result = await db.query(
    `SELECT * FROM demo_conversion_sales WHERE matched_demo_id = $1`,
    [demo_id]
  )

  if (result.rows.length > 0 && result.rows[0].conversion_status) {
    return result.rows[0] as unknown as SalesRecord
  }

  // Notify sales agent that input is needed
  await sendNotification({
    recipient: 'sales_agent',
    type: 'sales_input_required',
    payload: {
      demo_id,
      teacher: demo.teacher_name,
      student: demo.student_name,
      demo_date: demo.demo_date
    },
    priority: 'low'
  })

  return null
}

// ============================================================
// STEP 9: Compile Sheet30
// ============================================================
async function step9_compileSheet30(
  demo: DemoRecord,
  analysis: QualitativeAnalysis,
  ratings: RatingResult,
  salesData: SalesRecord | null,
  analysisId: string
): Promise<void> {
  await db.query(
    `INSERT INTO sheet30
     (demo_date, teacher_name, student_name, academic_level, subject,
      qualitative_notes, student_rating, analyst_rating,
      conversion_status, sales_comments, sales_agent, demo_id, analysis_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (demo_id) DO UPDATE SET
       qualitative_notes = EXCLUDED.qualitative_notes,
       student_rating = EXCLUDED.student_rating,
       analyst_rating = EXCLUDED.analyst_rating,
       conversion_status = EXCLUDED.conversion_status,
       sales_comments = EXCLUDED.sales_comments,
       sales_agent = EXCLUDED.sales_agent`,
    [
      demo.demo_date,
      demo.teacher_name,
      demo.student_name,
      demo.academic_level,
      demo.subject,
      analysis.overall_effectiveness,
      ratings.student_rating_converted,
      ratings.analyst_rating,
      salesData?.conversion_status || null,
      salesData?.sales_comments || null,
      salesData?.sales_agent || null,
      demo.demo_id,
      analysisId
    ]
  )
}

// ============================================================
// STEP 10: Accountability classification
// ============================================================
async function step10_classifyAccountability(
  demo: DemoRecord,
  salesData: SalesRecord | null,
  analysis: QualitativeAnalysis,
  analysisId: string
): Promise<AccountabilityResult | null> {
  if (!salesData || salesData.conversion_status !== 'Not Converted') {
    return null
  }

  const classification = validateClassification(analysis.accountability_classification)
  const evidence = analysis.accountability_evidence || 'No evidence cited by agent'
  const confidence = analysis.accountability_confidence || 'low'

  const result: AccountabilityResult = { classification, evidence, confidence }

  await writeAccountabilityLog(demo.demo_id, analysisId, result)
  await updateSheet30Accountability(demo.demo_id, classification)

  return result
}

// ============================================================
// STEP 11: Update teacher progress
// ============================================================
async function step11_updateTeacherProgress(
  demo: DemoRecord,
  ratings: RatingResult,
  pourFlags: PourFlag[],
  accountability: AccountabilityResult | null,
  salesData: SalesRecord | null
): Promise<void> {
  await updateTeacherProgress(
    demo.teacher_name,
    String(demo.demo_date),
    salesData?.conversion_status || null,
    ratings,
    pourFlags,
    accountability
  )
}

// ============================================================
// FINALISE: Write full analysis to demo_analysis
// ============================================================
async function finaliseAnalysis(
  analysisId: string,
  analysis: QualitativeAnalysis,
  ratings: RatingResult,
  pourFlags: PourFlag[],
  salesData: SalesRecord | null,
  accountability: AccountabilityResult | null,
  tokensUsed: number
): Promise<void> {
  await db.query(
    `UPDATE demo_analysis SET
       teaching_methodology = $1,
       topic_selection = $2,
       resource_usage = $3,
       interactivity_notes = $4,
       overall_effectiveness = $5,
       improvement_suggestions = $6,
       student_rating_raw = $7,
       student_rating_converted = $8,
       analyst_rating = $9,
       pour_present = $10,
       pour_categories = $11,
       conversion_status = $12,
       sales_agent = $13,
       accountability_classification = $14,
       accountability_evidence = $15,
       accountability_confidence = $16,
       agent_confidence = $17,
       tokens_used = $18,
       analysis_status = 'pending_review',
       updated_at = NOW()
     WHERE analysis_id = $19`,
    [
      analysis.teaching_methodology,
      analysis.topic_selection,
      analysis.resource_usage,
      analysis.interactivity_notes,
      analysis.overall_effectiveness,
      analysis.improvement_suggestions,
      ratings.student_rating_raw,
      ratings.student_rating_converted,
      ratings.analyst_rating,
      pourFlags.length > 0,
      pourFlags.map((f) => f.category),
      salesData?.conversion_status || null,
      salesData?.sales_agent || null,
      accountability?.classification || null,
      accountability?.evidence || null,
      accountability?.confidence || null,
      analysis.agent_confidence,
      tokensUsed,
      analysisId
    ]
  )
}

// ============================================================
// RESUME PIPELINE FROM STEP 8 (called after sales submission)
// ============================================================
export async function resumePipelineFromStep8(demo_id: string): Promise<PipelineResult> {
  const startTime = Date.now()
  const shadowMode = process.env.SHADOW_MODE === 'true'

  await logAgentActivity({
    action_type: 'pipeline_resume_step8',
    demo_id,
    status: 'success',
    details: { shadow_mode: shadowMode }
  })

  await db.query(
    `UPDATE conducted_demo_sessions SET analysis_status = 'in_progress' WHERE demo_id = $1`,
    [demo_id]
  )

  try {
    // Retrieve demo record
    const demoRecord = await step1_retrieveDemo(demo_id)

    // Retrieve existing analysis record
    const analysisResult = await db.query(
      `SELECT analysis_id, teaching_methodology, topic_selection, resource_usage,
              interactivity_notes, overall_effectiveness, improvement_suggestions,
              analyst_rating, agent_confidence, tokens_used
       FROM demo_analysis WHERE demo_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [demo_id]
    )
    if (analysisResult.rows.length === 0) {
      throw new Error(`No existing analysis found for demo '${demo_id}' — cannot resume`)
    }
    const existingAnalysis = analysisResult.rows[0]
    const analysisId = String(existingAnalysis.analysis_id)
    const priorTokens = (existingAnalysis.tokens_used as number) || 0

    // Reconstruct the qualitative analysis from the existing record
    const qualitativeAnalysis: QualitativeAnalysis = {
      teaching_methodology: existingAnalysis.teaching_methodology as string | null,
      topic_selection: existingAnalysis.topic_selection as string | null,
      resource_usage: existingAnalysis.resource_usage as string | null,
      interactivity_notes: existingAnalysis.interactivity_notes as string | null,
      overall_effectiveness: existingAnalysis.overall_effectiveness as string | null,
      improvement_suggestions: existingAnalysis.improvement_suggestions as string | null,
      analyst_rating: existingAnalysis.analyst_rating as number | null,
      pour_flags: [],
      accountability_classification: null,
      accountability_evidence: null,
      accountability_confidence: null,
      agent_confidence: (existingAnalysis.agent_confidence as number) || 0,
      notes: null
    }

    // Retrieve existing POUR flags
    const pourResult = await db.query(
      `SELECT pour_category AS category, description, severity FROM pour_flags WHERE demo_id = $1`,
      [demo_id]
    )
    const allPourFlags: PourFlag[] = pourResult.rows as unknown as PourFlag[]

    // Retrieve feedback for ratings
    const feedbackRecord = await step5_fetchStudentFeedback(demoRecord)
    const ratings = standardiseRatings(
      feedbackRecord?.overall_rating_10 ?? null,
      qualitativeAnalysis.analyst_rating
    )

    // STEP 8: Pull sales data (now available)
    const salesData = await step8_pullSalesData(demo_id, demoRecord)

    // STEP 9: Compile Sheet30
    await step9_compileSheet30(demoRecord, qualitativeAnalysis, ratings, salesData, analysisId)

    // STEP 10: Accountability classification
    const accountability = await step10_classifyAccountability(
      demoRecord,
      salesData,
      qualitativeAnalysis,
      analysisId
    )

    // STEP 11: Update teacher progress
    await step11_updateTeacherProgress(
      demoRecord,
      ratings,
      allPourFlags,
      accountability,
      salesData
    )

    // Finalise
    await finaliseAnalysis(
      analysisId,
      qualitativeAnalysis,
      ratings,
      allPourFlags,
      salesData,
      accountability,
      priorTokens
    )

    // Notify Dawood Agent
    await sendNotification({
      recipient: 'dawood_agent',
      type: 'demo_ready_for_review',
      payload: {
        demo_id,
        analysis_id: analysisId,
        teacher: demoRecord.teacher_name,
        student: demoRecord.student_name,
        pour_flags_count: allPourFlags.length,
        conversion_status: salesData?.conversion_status || null,
        accountability: accountability?.classification || null
      },
      priority: 'medium'
    })

    await db.query(
      `UPDATE conducted_demo_sessions SET analysis_status = 'complete' WHERE demo_id = $1`,
      [demo_id]
    )

    const processingMs = Date.now() - startTime

    await logAgentActivity({
      action_type: 'pipeline_resume_complete',
      demo_id,
      analysis_id: analysisId,
      status: 'success',
      duration_ms: processingMs,
      details: {
        pour_flags_count: allPourFlags.length,
        conversion_status: salesData?.conversion_status || null,
        accountability: accountability?.classification || null
      }
    })

    return {
      success: true,
      analysis_id: analysisId,
      demo_id,
      processing_time_ms: processingMs,
      pour_flags_count: allPourFlags.length,
      conversion_status: salesData?.conversion_status || null,
      shadow_mode: shadowMode,
      tokens_used: priorTokens
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)

    await db.query(
      `UPDATE conducted_demo_sessions SET analysis_status = 'escalated' WHERE demo_id = $1`,
      [demo_id]
    ).catch(() => {})

    await logAgentActivity({
      action_type: 'pipeline_resume_failed',
      demo_id,
      status: 'failed',
      error_message: message,
      duration_ms: Date.now() - startTime
    })

    return {
      success: false,
      analysis_id: null,
      demo_id,
      processing_time_ms: Date.now() - startTime,
      pour_flags_count: 0,
      conversion_status: null,
      shadow_mode: shadowMode,
      tokens_used: 0,
      error: message
    }
  }
}
