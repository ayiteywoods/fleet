import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export function withAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Add user to request context
    ;(request as any).user = user
    
    return handler(request, ...args)
  }
}

export function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  
  return verifyToken(token)
}
