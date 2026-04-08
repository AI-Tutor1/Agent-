import { NextRequest } from 'next/server'
import { db } from '../db'

export interface PlatformUser {
  user_id: string
  name: string
  email: string | null
  role: 'counselor' | 'sales' | 'manager' | 'dual' | 'admin'
  dept: string | null
  is_active: boolean
}

export async function getCurrentUser(req: NextRequest): Promise<PlatformUser | null> {
  const authMode = process.env.AUTH_MODE || 'mock'

  if (authMode === 'mock') {
    // In mock mode: read from x-user-id header or fall back to MOCK_USER_ID env
    const userId = req.headers.get('x-user-id') || process.env.MOCK_USER_ID || 'u1'
    const result = await db.query(
      `SELECT user_id, name, email, role, dept, is_active
       FROM platform_users WHERE user_id = $1 AND is_active = true`,
      [userId]
    )
    if (result.rows.length === 0) return null
    return result.rows[0] as unknown as PlatformUser
  }

  // JWT mode (future): decode from Authorization header
  // For now, fall back to mock
  return null
}
