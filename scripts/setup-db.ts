import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../.env') })

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  try {
    console.log('🔌 Connecting to database...')
    await pool.query('SELECT 1')
    console.log('✅ Connected to database')

    // Run schema
    console.log('\n📋 Running schema.sql...')
    const schemaPath = path.join(__dirname, '../sql/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    await pool.query(schema)
    console.log('✅ Schema applied')

    // Run seed
    console.log('\n🌱 Running seed.sql...')
    const seedPath = path.join(__dirname, '../sql/seed.sql')
    const seed = fs.readFileSync(seedPath, 'utf8')
    await pool.query(seed)
    console.log('✅ Seed data inserted')

    // Verify tables
    console.log('\n🔍 Verifying tables...')
    const expectedTables = [
      'conducted_demo_sessions',
      'demo_feedback',
      'demo_conversion_sales',
      'teacher_profiles',
      'demo_analysis',
      'pour_flags',
      'teacher_progress',
      'sheet30',
      'accountability_log',
      'notifications',
      'escalations',
      'agent_activity_log',
      'task_queue',
      'data_integrity_flags',
      'counseling_demo_to_conversion'
    ]

    const result = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )
    const existingTables = result.rows.map((r: { tablename: string }) => r.tablename)

    let allPresent = true
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log(`  ✅ ${table}`)
      } else {
        console.log(`  ❌ ${table} — MISSING`)
        allPresent = false
      }
    }

    // Count seed records
    const seedResult = await pool.query(
      `SELECT COUNT(*) as count FROM conducted_demo_sessions`
    )
    console.log(`\n📊 Seed demos: ${seedResult.rows[0].count}`)

    const teacherResult = await pool.query(
      `SELECT COUNT(*) as count FROM teacher_profiles`
    )
    console.log(`👩‍🏫 Teacher profiles: ${teacherResult.rows[0].count}`)

    if (allPresent) {
      console.log('\n✅ Database setup complete — all tables present')
    } else {
      console.log('\n⚠️  Some tables are missing — check schema.sql')
      process.exit(1)
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('❌ Setup failed:', message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setupDatabase()
