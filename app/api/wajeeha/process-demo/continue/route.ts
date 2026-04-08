import { NextRequest, NextResponse } from 'next/server'
import { validateAgentRequest } from '@/lib/auth/agent-auth'
import { resumePipelineFromStep8 } from '@/lib/agents/wajeeha/pipeline'
import { db } from '@/lib/db'
import { logAgentActivity } from '@/lib/db/activity-log'

export async function POST(req: NextRequest) {
  const auth = validateAgentRequest(req)
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorised', reason: auth.reason }, { status: 401 })
  }

  let body: { demo_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { demo_id } = body
  if (!demo_id) {
    return NextResponse.json({ error: 'demo_id is required' }, { status: 400 })
  }

  try {
    // Validate status
    const record = await db.query(
      `SELECT analysis_status FROM conducted_demo_sessions WHERE demo_id = $1`,
      [demo_id]
    )
    if (record.rows.length === 0) {
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 })
    }

    const status = record.rows[0].analysis_status as string
    if (!['awaiting_sales_input', 'sales_submitted'].includes(status)) {
      return NextResponse.json(
        { error: 'Demo not in awaiting state', current_status: status },
        { status: 409 }
      )
    }

    const result = await resumePipelineFromStep8(demo_id)

    await logAgentActivity({
      action_type: 'api_continue_demo',
      demo_id,
      analysis_id: result.analysis_id,
      details: { success: result.success },
      duration_ms: result.processing_time_ms,
      status: result.success ? 'success' : 'failed',
      error_message: result.error
    })

    return NextResponse.json(result, { status: result.success ? 200 : 500 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    await logAgentActivity({
      action_type: 'api_continue_demo_error',
      demo_id,
      status: 'failed',
      error_message: message
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
