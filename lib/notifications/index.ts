import { db } from '../db'

export interface NotificationPayload {
  recipient: string
  type: string
  payload: Record<string, unknown>
  priority?: 'low' | 'medium' | 'high'
}

const VALID_RECIPIENTS = [
  'dawood_agent',
  'sales_agent',
  'student_excellence_agent',
  'cto_agent',
  'human_dawood'
]

export async function sendNotification(notification: NotificationPayload): Promise<string | null> {
  const shadowMode = process.env.SHADOW_MODE === 'true'

  if (!VALID_RECIPIENTS.includes(notification.recipient)) {
    console.warn(`[Notifications] Unknown recipient: ${notification.recipient}`)
  }

  try {
    const result = await db.query(
      `INSERT INTO notifications (recipient, type, payload, priority, shadow_mode)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING notification_id`,
      [
        notification.recipient,
        notification.type,
        JSON.stringify(notification.payload),
        notification.priority || 'medium',
        shadowMode
      ]
    )

    const notificationId = String(result.rows[0]?.notification_id)

    if (shadowMode) {
      console.log(
        `[Notifications][SHADOW] Would send to ${notification.recipient}: ${notification.type}`,
        notification.payload
      )
    } else {
      // Live mode: actual delivery logic goes here when integrations are ready
      // e.g. POST to Dawood agent webhook, Slack, email, etc.
      console.log(`[Notifications] Sent to ${notification.recipient}: ${notification.type}`)
    }

    return notificationId
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[Notifications] Failed to write notification:', message)
    return null
  }
}
