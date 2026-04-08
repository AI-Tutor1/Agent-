import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/user'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    return NextResponse.json(user)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
