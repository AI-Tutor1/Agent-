import { db } from '../../db'

export interface PourFlag {
  category: 'Video' | 'Interaction' | 'Technical' | 'Cancellation' | 'Resources' | 'Time' | 'No Show'
  description: string
  severity: 'low' | 'medium' | 'high'
  delegated_to: 'Admin' | 'Counselor' | 'Tech' | 'HR' | 'Product Head'
}

export interface DemoRecord {
  demo_id: string
  demo_date: string
  teacher_name: string
  student_name: string
  academic_level: string | null
  subject: string | null
  recording_url: string | null
  analysis_status: string
}

export interface FeedbackRecord {
  feedback_id: number
  tutor_name: string | null
  student_name: string | null
  subject: string | null
  session_date: string | null
  overall_rating_10: number | null
  topic_explained: string | null
  participation: string | null
  confusion_moments: string | null
  discomfort_moments: string | null
  positive_environment: number | null
  suggestions: string | null
  comments_other: string | null
}

// Write all identified POUR flags to the database
export async function writePourFlags(
  demo_id: string,
  analysis_id: string,
  flags: PourFlag[]
): Promise<void> {
  for (const flag of flags) {
    await db.query(
      `INSERT INTO pour_flags (demo_id, analysis_id, pour_category, description, severity, delegated_to)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [demo_id, analysis_id, flag.category, flag.description, flag.severity, flag.delegated_to]
    )
  }
}

// Rule-based POUR pre-check before Claude analysis
// Claude will perform full POUR analysis — this catches definitive flags early
export function identifyEarlyPourFlags(
  recordingAvailable: boolean,
  feedback: FeedbackRecord | null
): PourFlag[] {
  const flags: PourFlag[] = []

  // VIDEO: recording not available
  if (!recordingAvailable) {
    flags.push({
      category: 'Video',
      description: 'Demo recording not available in LMS or conducted sessions sheet',
      severity: 'high',
      delegated_to: 'Admin'
    })
  }

  // INTERACTION: very low positive environment or explicit discomfort
  if (feedback) {
    if (
      feedback.positive_environment !== null &&
      feedback.positive_environment <= 2
    ) {
      flags.push({
        category: 'Interaction',
        description: `Student rated positive environment ${feedback.positive_environment}/5 — indicates discomfort or low engagement`,
        severity: feedback.positive_environment <= 1 ? 'high' : 'medium',
        delegated_to: 'Counselor'
      })
    }

    if (
      feedback.discomfort_moments &&
      feedback.discomfort_moments.trim().length > 3
    ) {
      flags.push({
        category: 'Interaction',
        description: `Student reported discomfort: "${feedback.discomfort_moments.trim()}"`,
        severity: 'medium',
        delegated_to: 'Counselor'
      })
    }

    if (
      feedback.participation !== null &&
      feedback.participation.toLowerCase() === 'no'
    ) {
      flags.push({
        category: 'Interaction',
        description: 'Feedback form indicates student did not actively participate in session',
        severity: 'medium',
        delegated_to: 'Counselor'
      })
    }
  }

  return flags
}

// Merge rule-based flags with Claude-generated flags, deduplicate by category
export function mergePourFlags(
  ruleFlags: PourFlag[],
  claudeFlags: PourFlag[]
): PourFlag[] {
  const merged = [...ruleFlags]

  for (const cf of claudeFlags) {
    // Only add if not already flagged by rules (prefer rule-based descriptions for known flags)
    const alreadyFlagged = ruleFlags.some((rf) => rf.category === cf.category)
    if (!alreadyFlagged) {
      merged.push(cf)
    }
  }

  return merged
}
