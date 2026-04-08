import { NextRequest, NextResponse } from 'next/server'
import { validateAgentRequest } from '@/lib/auth/agent-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = validateAgentRequest(req)
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorised', reason: auth.reason }, { status: 401 })
  }

  const submittedBy = req.nextUrl.searchParams.get('submitted_by')

  try {
    let queryText = `
      SELECT demo_id, demo_date, teacher_name, student_name,
             academic_level, subject, submitted_by, created_at,
             EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 AS hours_waiting
      FROM conducted_demo_sessions
      WHERE analysis_status IN ('awaiting_sales_input', 'pending')
    `
    const params: (string | null)[] = []

    if (submittedBy) {
      params.push(submittedBy)
      queryText += ` AND submitted_by = $${params.length}`
    }

    queryText += ` ORDER BY demo_date ASC`

    const result = await db.query(queryText, params)

    const demos = result.rows.map((r) => ({
      demo_id: r.demo_id,
      demo_date: r.demo_date,
      teacher_name: r.teacher_name,
      student_name: r.student_name,
      academic_level: r.academic_level,
      subjects: r.subject ? (r.subject as string).split(', ') : [],
      submitted_by: r.submitted_by,
      submitted_at: r.created_at,
      hours_waiting: Math.round(Number(r.hours_waiting) * 10) / 10
    }))

    return NextResponse.json({ demos, total: demos.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
