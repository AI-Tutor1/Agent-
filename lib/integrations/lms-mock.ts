// LMS mock — replace this implementation when real API docs are provided.
// The interface (getLMSRecordingUrl, getLMSSessionData) MUST NOT change.
// Only the implementation block changes when the real LMS API is integrated.

export interface LMSSession {
  demo_id: string
  duration_minutes: number
  platform: string
  recording_url: string | null
  tutor_joined: boolean
  student_joined: boolean
  join_time_offset_minutes: number
}

export async function getLMSRecordingUrl(demo_id: string): Promise<string | null> {
  // First: check our database for a recording URL already synced from the sheet
  // This is the live path — the mock below is the fallback
  try {
    const { db } = await import('../db')
    const result = await db.query(
      `SELECT recording_url FROM conducted_demo_sessions WHERE demo_id = $1`,
      [demo_id]
    )
    if (result.rows[0]?.recording_url) {
      return result.rows[0].recording_url as string
    }
  } catch {
    // Fall through to mock
  }

  // Mock: ~30% of demos have recordings (simulates real partial availability)
  const hash = demo_id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  if (hash % 3 === 0) {
    return `https://mock-lms.tuitional.com/recordings/${demo_id}`
  }

  return null
}

export async function getLMSSessionData(demo_id: string): Promise<LMSSession | null> {
  // Mock session data — replace with real LMS API call when docs arrive
  const recordingUrl = await getLMSRecordingUrl(demo_id)

  return {
    demo_id,
    duration_minutes: 45,
    platform: 'google_meet',
    recording_url: recordingUrl,
    tutor_joined: true,
    student_joined: true,
    join_time_offset_minutes: 0
  }
}

export async function checkLMSConnection(): Promise<boolean> {
  // Mock always returns true — replace with real health check
  return true
}
