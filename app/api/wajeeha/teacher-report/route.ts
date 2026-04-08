import { NextRequest, NextResponse } from 'next/server'
import { validateAgentRequest } from '@/lib/auth/agent-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = validateAgentRequest(req)
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorised', reason: auth.reason }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const teacherName = searchParams.get('teacher_name')

  if (!teacherName) {
    return NextResponse.json({ error: 'teacher_name query param is required' }, { status: 400 })
  }

  try {
    const progressResult = await db.query(
      `SELECT * FROM teacher_progress WHERE LOWER(teacher_name) = LOWER($1)`,
      [teacherName]
    )

    if (progressResult.rows.length === 0) {
      return NextResponse.json(
        { error: `No progress data found for teacher: ${teacherName}` },
        { status: 404 }
      )
    }

    const stats = progressResult.rows[0]

    // Get recent demos
    const recentDemos = await db.query(
      `SELECT da.demo_date, da.student_name, da.academic_level, da.subject,
              da.analyst_rating, da.student_rating_converted, da.conversion_status,
              da.accountability_classification
       FROM demo_analysis da
       WHERE LOWER(da.teacher_name) = LOWER($1)
       ORDER BY da.demo_date DESC
       LIMIT 10`,
      [teacherName]
    )

    // Get POUR frequency breakdown
    const pourResult = await db.query(
      `SELECT pour_category, COUNT(*) as count
       FROM pour_flags pf
       JOIN demo_analysis da ON da.demo_id = pf.demo_id
       WHERE LOWER(da.teacher_name) = LOWER($1)
       GROUP BY pour_category
       ORDER BY count DESC`,
      [teacherName]
    )

    // Build markdown report
    const report = buildTeacherReport(teacherName, stats, recentDemos.rows, pourResult.rows)

    return NextResponse.json(
      {
        teacher_name: teacherName,
        report_markdown: report,
        stats,
        generated_at: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function buildTeacherReport(
  teacherName: string,
  stats: Record<string, unknown>,
  recentDemos: Record<string, unknown>[],
  pourBreakdown: Record<string, unknown>[]
): string {
  const lines: string[] = [
    `# Teacher Performance Report: ${teacherName}`,
    `*Generated: ${new Date().toISOString().split('T')[0]}*`,
    '',
    '## Summary',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total Demos | ${stats.total_demos ?? 0} |`,
    `| Converted | ${stats.converted_count ?? 0} |`,
    `| Not Converted | ${stats.not_converted_count ?? 0} |`,
    `| Pending | ${stats.pending_count ?? 0} |`,
    `| Conversion Rate | ${stats.conversion_rate != null ? stats.conversion_rate + '%' : 'N/A'} |`,
    `| Avg Student Rating | ${stats.avg_student_rating != null ? stats.avg_student_rating + '/5' : 'N/A'} |`,
    `| Avg Analyst Rating | ${stats.avg_analyst_rating != null ? stats.avg_analyst_rating + '/5' : 'N/A'} |`,
    `| Product Accountability Count | ${stats.product_accountability_count ?? 0} |`,
    `| Under Review | ${stats.review_flag ? '⚠️ YES' : 'No'} |`,
    '',
    '## POUR Issue Frequency',
  ]

  if (pourBreakdown.length > 0) {
    lines.push('| Category | Occurrences |', '|----------|-------------|')
    for (const row of pourBreakdown) {
      lines.push(`| ${row.pour_category} | ${row.count} |`)
    }
  } else {
    lines.push('*No POUR flags recorded.*')
  }

  lines.push('', '## Recent Demos (Last 10)')
  if (recentDemos.length > 0) {
    lines.push(
      '| Date | Student | Level | Subject | Student Rating | Analyst Rating | Outcome | Accountability |',
      '|------|---------|-------|---------|----------------|----------------|---------|----------------|'
    )
    for (const d of recentDemos) {
      lines.push(
        `| ${d.demo_date} | ${d.student_name} | ${d.academic_level || '—'} | ${d.subject || '—'} | ${d.student_rating_converted ?? '—'}/5 | ${d.analyst_rating ?? '—'}/5 | ${d.conversion_status || 'Pending'} | ${d.accountability_classification || '—'} |`
      )
    }
  } else {
    lines.push('*No demo analysis records found.*')
  }

  if (stats.notes) {
    lines.push('', '## Notes', String(stats.notes))
  }

  return lines.join('\n')
}
