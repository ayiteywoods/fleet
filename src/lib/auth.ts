import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface UserPayload {
  id: string
  email: string
  name: string
  role: string
  spcode?: string | null
  hasLiveTracking?: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch (error) {
    return null
  }
}

export async function authenticateUser(identifier: string, password: string) {
  // Accept email, phone, or username (stored as full_name or name)
  const isEmail = identifier.includes('@')
  const isLikelyPhone = /^[+]?\d[\d\s-]{3,}$/.test(identifier)

  const where = isEmail
    ? { email: identifier, is_active: true }
    : isLikelyPhone
      ? { phone: identifier, is_active: true }
      : { OR: [
            { full_name: identifier },
            { name: identifier },
            { email: identifier },
            { phone: identifier },
          ], is_active: true }

  const user = await prisma.users.findFirst({ where })

  if (!user) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.password)
  if (!isValidPassword) {
    return null
  }

  return {
    id: user.id.toString(),
    email: user.email || '',
    name: user.name,
    role: user.role,
    spcode: user.spcode != null ? user.spcode.toString() : null
  }
}

export function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
