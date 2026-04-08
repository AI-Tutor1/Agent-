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

  const responsePromise = NextResponse.json({ message: 'Sync queued', demo_id }, { status: 202 })

  ;(async () => {
    try {
      const result = await db.query(
        `SELECT dcs.demo_date, dcs.teacher_name, dcs.student_name,
                dcs.academic_level, dcs.subject, dcs.conversion_status,
                dcs.sales_comments, dcs.sales_agent, dcs.parent_contact,
                dcs.student_feedback_rating, dcs.student_verbal_feedback
         FROM demo_conversion_sales dcs
         WHERE dcs.matched_demo_id = $1`,
        [demo_id]
      )
      if (result.rows.length === 0) return

      const r = result.rows[0] as Record<string, string | number | boolean | null>
      const sheetId = process.env.SHEET_DEMO_CONVERSION_SALES
      if (!sheetId) return

      await appendToSheet(sheetId, 'Demos', [
        [
          r.demo_date, r.teacher_name, r.student_name, r.academic_level,
          r.subject, r.conversion_status, r.sales_comments, r.sales_agent,
          r.parent_contact, r.student_feedback_rating, r.student_verbal_feedback
        ]
      ])

      await db.query(
        `UPDATE form_submissions SET sheet_synced = true, sheet_synced_at = NOW()
         WHERE demo_id = $1 AND form_type = 'sales'`,
        [demo_id]
      )

      await logAgentActivity({
        action_type: 'sheet_sync_complete',
        demo_id,
        status: 'success',
        details: { sheet: 'sheet-4' }
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      await logAgentActivity({
        action_type: 'sheet_sync_failed',
        demo_id,
        status: 'failed',
        error_message: message,
        details: { sheet: 'sheet-4' }
      })
    }
  })()

  return responsePromise
}
