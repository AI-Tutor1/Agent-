import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env') })

async function main() {
  console.log('🔄 Starting Google Sheets sync...\n')

  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000'
  const token = process.env.AGENT_INTERNAL_TOKEN

  if (!token) {
    console.error('❌ AGENT_INTERNAL_TOKEN not set in .env')
    process.exit(1)
  }

  try {
    const response = await fetch(`${baseUrl}/api/wajeeha/sync-sheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-token': token
      }
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('❌ Sync failed:', err)
      process.exit(1)
    }

    const result = await response.json()

    console.log('📊 Sync Results:')
    console.log(`  Sheets synced: ${result.sheets_synced}`)
    console.log(`  Rows upserted: ${result.rows_upserted}`)
    console.log(`  Rows failed: ${result.rows_failed}`)
    console.log(`  Data integrity flags: ${result.data_integrity_flags_created}`)
    console.log(`  Duration: ${result.duration_ms}ms`)

    if (result.results) {
      console.log('\n📋 Per-Sheet Breakdown:')
      for (const sheet of result.results) {
        const status = sheet.rows_failed > 0 ? '⚠️' : '✅'
        console.log(`  ${status} ${sheet.sheet_name}: ${sheet.rows_upserted} upserted, ${sheet.rows_failed} failed`)
      }
    }

    console.log('\n✅ Sync complete')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('❌ Sync request failed:', message)
    console.error('   Is the Next.js server running? npm run dev')
    process.exit(1)
  }
}

main()
