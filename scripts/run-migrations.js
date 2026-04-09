#!/usr/bin/env node
// run-migrations.js — Run database migrations in order

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function runFile(filePath) {
  const label = path.basename(filePath);
  const sql = fs.readFileSync(filePath, 'utf8');
  const start = Date.now();
  try {
    await pool.query(sql);
    console.log(`✓ ${label} — completed in ${Date.now() - start}ms`);
  } catch (err) {
    console.error(`✗ ${label} — FAILED: ${err.message}`);
    throw err;
  }
}

async function main() {
  const sqlDir = path.join(__dirname, '..', 'sql');
  const migrations = [
    path.join(sqlDir, '001_initial_schema.sql'),
    path.join(sqlDir, '002_seed_data.sql'),
  ];

  console.log('Starting migrations...\n');

  for (const migration of migrations) {
    if (!fs.existsSync(migration)) {
      console.error(`✗ File not found: ${migration}`);
      process.exit(1);
    }
    await runFile(migration);
  }

  console.log('\nAll migrations completed successfully.');
  await pool.end();
}

main().catch((err) => {
  console.error('\nMigration failed:', err.message);
  pool.end();
  process.exit(1);
});
