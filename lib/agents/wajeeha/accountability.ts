import { db } from '../../db'

export type AccountabilityClassification = 'Sales' | 'Product' | 'Consumer' | 'Mixed' | null

export interface AccountabilityResult {
  classification: AccountabilityClassification
  evidence: string
  confidence: 'high' | 'medium' | 'low'
}

const VALID_CLASSIFICATIONS: AccountabilityClassification[] = [
  'Sales', 'Product', 'Consumer', 'Mixed'
]

export function validateClassification(
  raw: string | null | undefined
): AccountabilityClassification {
  if (!raw) return null
  const normalised = raw.trim() as AccountabilityClassification
  return VALID_CLASSIFICATIONS.includes(normalised) ? normalised : null
}

export async function writeAccountabilityLog(
  demo_id: string,
  analysis_id: string,
  result: AccountabilityResult
): Promise<void> {
  await db.query(
    `INSERT INTO accountability_log (demo_id, analysis_id, classification, evidence_cited, confidence)
     VALUES ($1, $2, $3, $4, $5)`,
    [demo_id, analysis_id, result.classification, result.evidence, result.confidence]
  )
}

export async function updateSheet30Accountability(
  demo_id: string,
  classification: AccountabilityClassification
): Promise<void> {
  await db.query(
    `UPDATE sheet30 SET accountability_classification = $1 WHERE demo_id = $2`,
    [classification, demo_id]
  )
}
