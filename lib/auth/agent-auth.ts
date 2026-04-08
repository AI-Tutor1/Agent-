import { NextRequest } from 'next/server'

export interface AuthResult {
  valid: boolean
  reason?: string
}

export function validateAgentRequest(req: NextRequest): AuthResult {
  const token = req.headers.get('x-agent-token')

  if (!token) {
    return { valid: false, reason: 'No x-agent-token header provided' }
  }

  const expectedToken = process.env.AGENT_INTERNAL_TOKEN
  if (!expectedToken) {
    console.error('[Auth] AGENT_INTERNAL_TOKEN is not set — all requests will be rejected')
    return { valid: false, reason: 'Server misconfiguration' }
  }

  if (token !== expectedToken) {
    return { valid: false, reason: 'Invalid token' }
  }

  return { valid: true }
}
