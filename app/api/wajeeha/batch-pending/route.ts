import { NextRequest, NextResponse } from 'next/server'
import { validateAgentRequest } from '@/lib/auth/agent-auth'
import { processDemoAnalysis } from '@/lib/agents/wajeeha/pipeline'
import { db } from '@/lib/db'
import { logAgentActivity } from '@/lib/db/activity-log'

export async function POST(req: NextRequest) {
  const auth = validateAgentRequest(req)
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorised', reason: auth.reason }, { status: 401 })
  }

  let limit = 10
  try {
    const body = await req.json()
    if (typeof body.limit === 'number') {
      limit = Math.min(50, Math.max(1, body.limit))
    }
  } catch {
    // body is optional — default limit applies
  }

  const startTime = Date.now()

  // Fetch pending demos ordered by date (oldest first)
  const pendingResult = await db.query(
    `SELECT demo_id FROM conducted_demo_sessions
     WHERE analysis_status = 'pending'
     ORDER BY demo_date ASC
     LIMIT $1`,
    [limit]
  )

  const results: Array<{
    demo_id: string
    status: string
    analysis_id?: string | null
    pour_flags_count?: number
    error?: string
  }> = []

  for (const row of pendingResult.rows) {
    const demoId = row.demo_id as string
    try {
      const result = await processDemoAnalysis(demoId)
      results.push({
        demo_id: demoId,
        status: result.success ? 'processed' : 'failed',
        analysis_id: result.analysis_id,
        pour_flags_count: result.pour_flags_count,
        error: result.error
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      results.push({ demo_id: demoId, status: 'failed', error: message })
    }
  }

  const succeeded = results.filter((r) => r.status === 'processed').length
  const failed = results.filter((r) => r.status === 'failed').length

  await logAgentActivity({
    action_type: 'batch_pending_complete',
    status: failed === 0 ? 'success' : 'partial',
    duration_ms: Date.now() - startTime,
    details: { processed: results.length, succeeded, failed }
  })

  return NextResponse.json(
    { processed: results.length, succeeded, failed, results },
    { status: 200 }
  )
}
