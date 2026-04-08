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

  const { analysis_id } = await req.json()

  if (process.env.SHEET_SYNC_ENABLED === 'false') {
    return NextResponse.json({ message: 'Sheet sync disabled' }, { status: 202 })
  }

  const responsePromise = NextResponse.json({ message: 'Sync queued', analysis_id }, { status: 202 })

  ;(async () => {
    try {
      // Pull from sheet30 (the master compilation)
      const result = await db.query(
        `SELECT s.demo_date, s.teacher_name, s.student_name, s.academic_level,
                s.subject, s.conversion_flag, s.qualitative_notes,
                s.student_rating, s.analyst_rating, s.conversion_status,
                s.sales_comments, s.sales_agent, s.accountability_classification,
                s.demo_id
         FROM sheet30 s
         JOIN demo_analysis da ON da.demo_id = s.demo_id
         WHERE da.analysis_id = $1::uuid`,
        [analysis_id]
      )
      if (result.rows.length === 0) return

      const r = result.rows[0] as Record<string, string | number | boolean | null>
      const sheetId = process.env.SHEET_COUNSELING_PRODUCT
      if (!sheetId) return

      await appendToSheet(sheetId, 'Demo to Conversion', [
        [
          r.demo_date, r.teacher_name, r.student_name, r.academic_level,
          r.subject, r.conversion_flag, r.qualitative_notes,
          r.student_rating, r.analyst_rating, r.conversion_status,
          r.sales_comments, r.sales_agent, r.accountability_classification,
          r.demo_id
        ]
      ])

      await logAgentActivity({
        action_type: 'sheet_sync_complete',
        demo_id: r.demo_id as string,
        analysis_id,
        status: 'success',
        details: { sheet: 'sheet-3' }
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      await logAgentActivity({
        action_type: 'sheet_sync_failed',
        analysis_id,
        status: 'failed',
        error_message: message,
        details: { sheet: 'sheet-3' }
      })
    }
  })()

  return responsePromise
}
