import { NextRequest, NextResponse } from 'next/server'
import { validateAgentRequest } from '@/lib/auth/agent-auth'
import { db } from '@/lib/db'
import { logAgentActivity } from '@/lib/db/activity-log'
import { generateDemoId } from '@/lib/integrations/google-sheets'

interface CounselorIntakeRequest {
  demo_date: string
  teacher_name: string
  student_name: string
  academic_level: string
  subjects: string[]
  curriculum_board?: string
  curriculum_code?: string
  rate_tier: string
  pain_points?: string
  session_notes?: string
  submitted_by: string
}

export async function POST(req: NextRequest) {
  const auth = validateAgentRequest(req)
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorised', reason: auth.reason }, { status: 401 })
  }

  let body: CounselorIntakeRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // 1. Validate required fields
  const errors: Record<string, string> = {}
  if (!body.demo_date) errors.demo_date = 'Required'
  if (!body.teacher_name) errors.teacher_name = 'Required'
  if (!body.student_name) errors.student_name = 'Required'
  if (!body.academic_level) errors.academic_level = 'Required'
  if (!body.subjects || !Array.isArray(body.subjects) || body.subjects.length === 0) {
    errors.subjects = 'At least one subject required'
  }
  if (!body.rate_tier) errors.rate_tier = 'Required'
  if (!body.submitted_by) errors.submitted_by = 'Required'

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 })
  }

  try {
    // 2. Check teacher exists
    const teacherCheck = await db.query(
      `SELECT teacher_id FROM teacher_profiles
       WHERE LOWER(teacher_name) = LOWER($1)
          OR $1 = ANY(name_aliases)
       LIMIT 1`,
      [body.teacher_name]
    )
    if (teacherCheck.rows.length === 0) {
      await db.query(
        `INSERT INTO data_integrity_flags (demo_id, issue_type, description)
         VALUES ($1, $2, $3)`,
        ['pending', 'missing_teacher_id', `Teacher '${body.teacher_name}' not found in teacher_profiles`]
      )
    }

    // 3. Generate demo_id with collision handling
    const baseDemoId = generateDemoId(body.demo_date, body.teacher_name, body.student_name)
    let demoId = baseDemoId
    let suffix = 1
    while (true) {
      const existing = await db.query(
        `SELECT demo_id FROM conducted_demo_sessions WHERE demo_id = $1`,
        [demoId]
      )
      if (existing.rows.length === 0) break
      suffix++
      demoId = `${baseDemoId}_${suffix}`
    }

    // Derive demo_month from date
    const demoDate = new Date(body.demo_date)
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    const demoMonth = `${monthNames[demoDate.getMonth()]} ${demoDate.getFullYear()}`

    const subjectStr = body.subjects.join(', ')

    // 4. INSERT into conducted_demo_sessions
    await db.query(
      `INSERT INTO conducted_demo_sessions
       (demo_id, demo_date, demo_month, teacher_name, student_name,
        academic_level, subject, curriculum_board, curriculum_code,
        rate_tier, pain_points, session_notes, submitted_by,
        intake_source, analysis_status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'platform','pending',NOW())`,
      [
        demoId, body.demo_date, demoMonth, body.teacher_name, body.student_name,
        body.academic_level, subjectStr, body.curriculum_board || null,
        body.curriculum_code || null, body.rate_tier, body.pain_points || null,
        body.session_notes || null, body.submitted_by
      ]
    )

    // Update the integrity flag with actual demo_id
    if (teacherCheck.rows.length === 0) {
      await db.query(
        `UPDATE data_integrity_flags SET demo_id = $1
         WHERE demo_id = 'pending' AND issue_type = 'missing_teacher_id'
         AND description LIKE $2`,
        [demoId, `%${body.teacher_name}%`]
      ).catch(() => {})
    }

    // 5. Log to agent_activity_log
    await logAgentActivity({
      action_type: 'counselor_intake_submitted',
      demo_id: demoId,
      status: 'success',
      details: { submitted_by: body.submitted_by, field_count: Object.keys(body).length }
    })

    // Record in form_submissions audit trail
    await db.query(
      `INSERT INTO form_submissions (demo_id, form_type, submitted_by, field_data, ip_address)
       VALUES ($1, 'counselor', $2, $3, $4)`,
      [
        demoId,
        body.submitted_by,
        JSON.stringify(body),
        req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
      ]
    )

    // 6. Enqueue sheet sync (non-blocking)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`
    const token = process.env.AGENT_INTERNAL_TOKEN
    fetch(`${baseUrl}/api/sync/sheet-1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-agent-token': token || '' },
      body: JSON.stringify({ demo_id: demoId })
    }).catch(async (err) => {
      await logAgentActivity({
        action_type: 'sheet_sync_enqueue_failed',
        demo_id: demoId,
        status: 'failed',
        error_message: err instanceof Error ? err.message : String(err),
        details: { sheet: 'sheet-1' }
      })
    })

    // 7. Trigger pipeline (non-blocking)
    fetch(`${baseUrl}/api/wajeeha/process-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-agent-token': token || '' },
      body: JSON.stringify({ demo_id: demoId })
    }).catch(async (err) => {
      await logAgentActivity({
        action_type: 'pipeline_trigger_failed',
        demo_id: demoId,
        status: 'failed',
        error_message: err instanceof Error ? err.message : String(err)
      })
    })

    // 8. Return 201
    return NextResponse.json({
      success: true,
      demo_id: demoId,
      message: 'Counselor intake recorded. Pipeline triggered.',
      sheet_sync_queued: true,
      pipeline_triggered: true
    }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    await logAgentActivity({
      action_type: 'counselor_intake_error',
      status: 'failed',
      error_message: message
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
