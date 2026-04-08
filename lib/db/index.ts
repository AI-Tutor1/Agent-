import { Pool, PoolClient } from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message)
})

// Query with exponential backoff retry (3 attempts)
export async function query(
  text: string,
  params?: (string | number | boolean | null | string[] | undefined)[]
): Promise<{ rows: Record<string, unknown>[]; rowCount: number }> {
  const maxAttempts = 3
  let lastError: Error = new Error('Unknown error')

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await pool.query(text, params)
      return { rows: result.rows, rowCount: result.rowCount ?? 0 }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < maxAttempts) {
        const delay = 100 * Math.pow(2, attempt - 1) // 100ms, 200ms, 400ms
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`Database query failed after ${maxAttempts} attempts: ${lastError.message}`)
}

// Transaction helper
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// Health check
export async function checkConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}

export const db = { query, withTransaction, checkConnection }
