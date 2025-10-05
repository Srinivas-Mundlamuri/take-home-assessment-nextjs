import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export interface SessionUser {
  id: string
  username: string
}

export async function createToken(user: SessionUser): Promise<string> {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key'
  return jwt.sign(user, secret, { expiresIn: '7d' })
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as SessionUser
    return decoded
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) return null
    
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}