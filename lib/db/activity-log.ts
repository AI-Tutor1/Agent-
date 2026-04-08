import { db } from './index'

export interface ActivityLogEntry {
  agent_name?: string
  action_type: string
  demo_id?: string | null
  analysis_id?: string | null
  details?: Record<string, unknown>
  tokens_used?: number
  duration_ms?: number
  status: 'success' | 'failed' | 'partial' | 'skipped'
  error_message?: string
  shadow_mode?: boolean
}

export async function logAgentActivity(entry: ActivityLogEntry): Promise<void> {
  const shadowMode =
    entry.shadow_mode !== undefined ? entry.shadow_mode : process.env.SHADOW_MODE === 'true'

  try {
    await db.query(
      `INSERT INTO agent_activity_log
       (agent_name, action_type, demo_id, analysis_id, details, tokens_used, duration_ms, status, error_message, shadow_mode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        entry.agent_name || 'wajeeha_agent',
        entry.action_type,
        entry.demo_id || null,
        entry.analysis_id || null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.tokens_used || null,
        entry.duration_ms || null,
        entry.status,
        entry.error_message || null,
        shadowMode
      ]
    )
  } catch (err: unknown) {
    // Logging must never throw — degrade silently
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ActivityLog] Failed to write log entry:', message)
  }
}
