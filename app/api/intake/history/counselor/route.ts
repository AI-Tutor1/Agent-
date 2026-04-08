import { NextRequest, NextResponse } from 'next/server'
import { validateAgentRequest } from '@/lib/auth/agent-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = validateAgentRequest(req)
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorised', reason: auth.reason }, { status: 401 })
  }

  const submittedBy = req.nextUrl.searchParams.get('submitted_by')
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '5', 10), 50)

  try {
    let queryText = `
      SELECT fs.submission_id, fs.demo_id, fs.submitted_at, fs.field_data,
             cds.teacher_name, cds.student_name, cds.analysis_status, cds.demo_date
      FROM form_submissions fs
      LEFT JOIN conducted_demo_sessions cds ON cds.demo_id = fs.demo_id
      WHERE fs.form_type = 'counselor'
    `
    const params: (string | number)[] = []

    if (submittedBy) {
      params.push(submittedBy)
      queryText += ` AND fs.submitted_by = $${params.length}`
    }

    params.push(limit)
    queryText += ` ORDER BY fs.submitted_at DESC LIMIT $${params.length}`

    const result = await db.query(queryText, params)

    return NextResponse.json({
      submissions: result.rows,
      total: result.rows.length
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
