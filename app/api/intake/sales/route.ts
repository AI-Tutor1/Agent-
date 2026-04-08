import { NextRequest, NextResponse } from 'next/server'
import { validateAgentRequest } from '@/lib/auth/agent-auth'
import { db } from '@/lib/db'
import { logAgentActivity } from '@/lib/db/activity-log'

interface SalesIntakeRequest {
  demo_id: string
  conversion_status: string
  student_feedback_rating: number
  student_verbal_feedback: string
  sales_comments: string
  parent_contact?: string
  lost_reasons?: string[]
  follow_up_plan?: string
  submitted_by: string
}

export async function POST(req: NextRequest) {
  const auth = validateAgentRequest(req)
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorised', reason: auth.reason }, { status: 401 })
  }

  let body: SalesIntakeRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // 1. Validate required fields
  const errors: Record<string, string> = {}
  if (!body.demo_id) errors.demo_id = 'Required'
  if (!body.conversion_status) errors.conversion_status = 'Required'
  if (!['Converted', 'Not Converted', 'Pending'].includes(body.conversion_status)) {
    errors.conversion_status = 'Must be Converted, Not Converted, or Pending'
  }
  if (typeof body.student_feedback_rating !== 'number' || body.student_feedback_rating < 1 || body.student_feedback_rating > 10) {
    errors.student_feedback_rating = 'Must be integer 1-10'
  }
  if (!body.student_verbal_feedback || body.student_verbal_feedback.length < 10) {
    errors.student_verbal_feedback = 'Min 10 characters'
  }
  if (!body.sales_comments || body.sales_comments.length < 20) {
    errors.sales_comments = 'Min 20 characters'
  }
  if (!body.submitted_by) errors.submitted_by = 'Required'

  // Special: if Not Converted, lost_reasons must be non-empty
  if (body.conversion_status === 'Not Converted') {
    if (!body.lost_reasons || !Array.isArray(body.lost_reasons) || body.lost_reasons.length === 0) {
      errors.lost_reasons = 'Required when conversion_status is Not Converted'
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 })
  }

  try {
    // 2. Verify demo_id exists
    const demoResult = await db.query(
      `SELECT demo_id, teacher_name, student_name, academic_level, subject, demo_date, analysis_status
       FROM conducted_demo_sessions WHERE demo_id = $1`,
      [body.demo_id]
    )
    if (demoResult.rows.length === 0) {
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 })
    }

    const demo = demoResult.rows[0] as Record<string, string | null>
    const status = demo.analysis_status as string
    if (!['awaiting_sales_input', 'pending', 'in_progress'].includes(status)) {
      return NextResponse.json({
        error: 'Conflict — sales data already submitted or demo not in expected state',
        current_status: status
      }, { status: 409 })
    }

    // 3. UPSERT into demo_conversion_sales
    await db.query(
      `INSERT INTO demo_conversion_sales
       (demo_date, teacher_name, student_name, academic_level, subject,
        conversion_status, sales_comments, sales_agent, parent_contact,
        student_feedback_rating, student_verbal_feedback, lost_reasons,
        follow_up_plan, matched_demo_id, intake_source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'platform')
       ON CONFLICT (matched_demo_id)
       WHERE matched_demo_id IS NOT NULL
       DO UPDATE SET
         conversion_status = EXCLUDED.conversion_status,
         sales_comments = EXCLUDED.sales_comments,
         sales_agent = EXCLUDED.sales_agent,
         parent_contact = EXCLUDED.parent_contact,
         student_feedback_rating = EXCLUDED.student_feedback_rating,
         student_verbal_feedback = EXCLUDED.student_verbal_feedback,
         lost_reasons = EXCLUDED.lost_reasons,
         follow_up_plan = EXCLUDED.follow_up_plan,
         intake_source = EXCLUDED.intake_source`,
      [
        demo.demo_date, demo.teacher_name, demo.student_name,
        demo.academic_level, demo.subject,
        body.conversion_status, body.sales_comments, body.submitted_by,
        body.parent_contact || null, body.student_feedback_rating,
        body.student_verbal_feedback,
        body.lost_reasons ? JSON.stringify(body.lost_reasons) : null,
        body.follow_up_plan || null, body.demo_id
      ]
    )

    // 4. Update conducted_demo_sessions status
    await db.query(
      `UPDATE conducted_demo_sessions SET analysis_status = 'sales_submitted'
       WHERE demo_id = $1`,
      [body.demo_id]
    )

    // 5. Log activity
    await logAgentActivity({
      action_type: 'sales_intake_submitted',
      demo_id: body.demo_id,
      status: 'success',
      details: { submitted_by: body.submitted_by, conversion_status: body.conversion_status }
    })

    // Record in form_submissions audit trail
    await db.query(
      `INSERT INTO form_submissions (demo_id, form_type, submitted_by, field_data, ip_address)
       VALUES ($1, 'sales', $2, $3, $4)`,
      [
        body.demo_id,
        body.submitted_by,
        JSON.stringify(body),
        req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
      ]
    )

    // 6. Enqueue sheet sync (non-blocking)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`
    const token = process.env.AGENT_INTERNAL_TOKEN
    fetch(`${baseUrl}/api/sync/sheet-4`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-agent-token': token || '' },
      body: JSON.stringify({ demo_id: body.demo_id })
    }).catch(async (err) => {
      await logAgentActivity({
        action_type: 'sheet_sync_enqueue_failed',
        demo_id: body.demo_id,
        status: 'failed',
        error_message: err instanceof Error ? err.message : String(err),
        details: { sheet: 'sheet-4' }
      })
    })

    // 7. Continue pipeline (non-blocking)
    fetch(`${baseUrl}/api/wajeeha/process-demo/continue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-agent-token': token || '' },
      body: JSON.stringify({ demo_id: body.demo_id })
    }).catch(async (err) => {
      await logAgentActivity({
        action_type: 'pipeline_continue_failed',
        demo_id: body.demo_id,
        status: 'failed',
        error_message: err instanceof Error ? err.message : String(err)
      })
    })

    // 8. Return 200
    return NextResponse.json({
      success: true,
      demo_id: body.demo_id,
      message: 'Sales intake recorded. Pipeline continuing from Step 8.',
      sheet_sync_queued: true,
      pipeline_continued: true,
      analysis_status: 'sales_submitted'
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    await logAgentActivity({
      action_type: 'sales_intake_error',
      demo_id: body.demo_id,
      status: 'failed',
      error_message: message
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
