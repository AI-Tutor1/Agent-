import { NextRequest, NextResponse } from 'next/server'
import { validateAgentRequest } from '@/lib/auth/agent-auth'
import { db } from '@/lib/db'
import { logAgentActivity } from '@/lib/db/activity-log'
import { appendToSheet } from '@/lib/integrations/google-sheets'

export async function POST(req: NextRequest) {
  const auth = validateAgentRequest(req)
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { demo_id } = await req.json()

  if (process.env.SHEET_SYNC_ENABLED === 'false') {
    return NextResponse.json({ message: 'Sheet sync disabled' }, { status: 202 })
  }

  // Return 202 immediately, do work async
  const responsePromise = NextResponse.json({ message: 'Sync queued', demo_id }, { status: 202 })

  // Fire-and-forget sync
  ;(async () => {
    try {
      const result = await db.query(
        `SELECT demo_id, demo_date, demo_month, teacher_name, student_name,
                academic_level, subject, curriculum_board, curriculum_code,
                rate_tier, pain_points, session_notes
         FROM conducted_demo_sessions WHERE demo_id = $1`,
        [demo_id]
      )
      if (result.rows.length === 0) return

      const r = result.rows[0] as Record<string, string | number | boolean | null>
      const sheetId = process.env.SHEET_CONDUCTED_DEMOS
      if (!sheetId) return

      await appendToSheet(sheetId, 'Sheet1', [
        [
          r.demo_date, r.demo_month, r.teacher_name, r.student_name,
          r.academic_level, r.subject, r.curriculum_board, r.curriculum_code,
          r.rate_tier, r.pain_points, r.session_notes, r.demo_id
        ]
      ])

      await db.query(
        `UPDATE form_submissions SET sheet_synced = true, sheet_synced_at = NOW()
         WHERE demo_id = $1 AND form_type = 'counselor'`,
        [demo_id]
      )

      await logAgentActivity({
        action_type: 'sheet_sync_complete',
        demo_id,
        status: 'success',
        details: { sheet: 'sheet-1' }
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      await logAgentActivity({
        action_type: 'sheet_sync_failed',
        demo_id,
        status: 'failed',
        error_message: message,
        details: { sheet: 'sheet-1' }
      })
    }
  })()

  return responsePromise
}
