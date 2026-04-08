import * as dotenv from 'dotenv'
import * as path from 'path'
import { Pool } from 'pg'

dotenv.config({ path: path.join(__dirname, '../.env') })

const TEST_DEMO_ID = '20260101_moazzam_ahmed' // Seed record 1: all data, Converted

async function main() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000'
  const token = process.env.AGENT_INTERNAL_TOKEN

  if (!token) {
    console.error('❌ AGENT_INTERNAL_TOKEN not set in .env')
    process.exit(1)
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  try {
    console.log(`🚀 Testing pipeline with demo_id: ${TEST_DEMO_ID}\n`)

    // ——— Call the API ———
    const response = await fetch(`${baseUrl}/api/wajeeha/process-demo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-token': token
      },
      body: JSON.stringify({ demo_id: TEST_DEMO_ID })
    })

    const result = await response.json()

    console.log('📦 Pipeline Result:')
    console.log(JSON.stringify(result, null, 2))

    if (!result.success) {
      console.error('\n❌ Pipeline failed:', result.error)
    }

    // ——— Fetch demo_analysis record ———
    console.log('\n📋 demo_analysis record:')
    const analysisResult = await pool.query(
      `SELECT analysis_id, demo_id, teacher_name, student_name, academic_level, subject,
              overall_effectiveness, student_rating_raw, student_rating_converted, analyst_rating,
              pour_present, pour_categories, conversion_status, accountability_classification,
              agent_confidence, tokens_used, analysis_status, shadow_mode
       FROM demo_analysis WHERE demo_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [TEST_DEMO_ID]
    )
    if (analysisResult.rows.length > 0) {
      console.log(JSON.stringify(analysisResult.rows[0], null, 2))
    } else {
      console.log('  (no record found)')
    }

    // ——— Fetch POUR flags ———
    console.log('\n🚩 POUR flags:')
    const pourResult = await pool.query(
      `SELECT pour_category, description, severity, delegated_to
       FROM pour_flags WHERE demo_id = $1`,
      [TEST_DEMO_ID]
    )
    if (pourResult.rows.length > 0) {
      console.log(JSON.stringify(pourResult.rows, null, 2))
    } else {
      console.log('  (no POUR flags)')
    }

    // ——— Fetch Sheet30 record ———
    console.log('\n📊 sheet30 record:')
    const sheet30Result = await pool.query(
      `SELECT * FROM sheet30 WHERE demo_id = $1`,
      [TEST_DEMO_ID]
    )
    if (sheet30Result.rows.length > 0) {
      console.log(JSON.stringify(sheet30Result.rows[0], null, 2))
    } else {
      console.log('  (no sheet30 record)')
    }

    // ——— Fetch notifications ———
    console.log('\n🔔 Notifications written:')
    const notifResult = await pool.query(
      `SELECT recipient, type, priority, shadow_mode, created_at
       FROM notifications ORDER BY created_at DESC LIMIT 5`
    )
    console.log(JSON.stringify(notifResult.rows, null, 2))

    // ——— Total tokens ———
    const tokenResult = await pool.query(
      `SELECT SUM(tokens_used) as total_tokens FROM agent_activity_log
       WHERE demo_id = $1 AND tokens_used IS NOT NULL`,
      [TEST_DEMO_ID]
    )
    console.log(`\n💰 Total tokens used: ${tokenResult.rows[0]?.total_tokens ?? 0}`)

    console.log('\n✅ Test complete')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('❌ Test failed:', message)
    console.error('   Is the Next.js server running? npm run dev')
  } finally {
    await pool.end()
  }
}

main()
