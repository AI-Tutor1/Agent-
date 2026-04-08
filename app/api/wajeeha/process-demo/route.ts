import { NextRequest, NextResponse } from 'next/server'
import { validateAgentRequest } from '@/lib/auth/agent-auth'
import { processDemoAnalysis } from '@/lib/agents/wajeeha/pipeline'
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

  const startTime = Date.now()

  try {
    const result = await processDemoAnalysis(demo_id)

    await logAgentActivity({
      action_type: 'api_process_demo',
      demo_id,
      analysis_id: result.analysis_id,
      details: { ...result },
      tokens_used: result.tokens_used,
      duration_ms: Date.now() - startTime,
      status: result.success ? 'success' : 'failed',
      error_message: result.error
    })

    return NextResponse.json(result, { status: result.success ? 200 : 500 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    await logAgentActivity({
      action_type: 'api_process_demo_error',
      demo_id,
      status: 'failed',
      error_message: message,
      duration_ms: Date.now() - startTime
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
