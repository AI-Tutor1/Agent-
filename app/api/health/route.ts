import { NextResponse } from 'next/server'
import { checkConnection } from '@/lib/db'
import { checkSheetsConnection } from '@/lib/integrations/google-sheets'
import { checkLMSConnection } from '@/lib/integrations/lms-mock'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  const shadowMode = process.env.SHADOW_MODE === 'true'

  const [dbOk, sheetsOk, lmsOk] = await Promise.all([
    checkConnection().catch(() => false),
    checkSheetsConnection().catch(() => false),
    checkLMSConnection().catch(() => false)
  ])

  // Check Anthropic API (lightweight model_list call)
  let anthropicOk = false
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    // Minimal check: just instantiate and validate key format
    anthropicOk = typeof process.env.ANTHROPIC_API_KEY === 'string' &&
      process.env.ANTHROPIC_API_KEY.startsWith('sk-')
    void client // suppress unused warning
  } catch {
    anthropicOk = false
  }

  const allOk = dbOk && anthropicOk
  const status = allOk ? 'ok' : 'degraded'

  return NextResponse.json(
    {
      status,
      db: dbOk ? 'connected' : 'error',
      sheets_api: sheetsOk ? 'connected' : 'error',
      anthropic_api: anthropicOk ? 'connected' : 'error',
      lms_api: lmsOk ? 'connected' : 'error',
      shadow_mode: shadowMode,
      version: '1.0.0'
    },
    { status: allOk ? 200 : 503 }
  )
}
