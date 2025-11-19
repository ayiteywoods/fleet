import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { getUserPermissions } from './permissions'

/**
 * Middleware to protect API routes based on permissions
 */
export function withPermission(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  requiredPermission: string | string[],
  options?: {
    requireAll?: boolean
    allowSuperAdmin?: boolean
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Get user from token
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

    // Check if super admin (if allowed)
    const allowSuperAdmin = options?.allowSuperAdmin !== false
    if (allowSuperAdmin) {
      const roleLower = (user.role || '').toLowerCase()
      const isSuperAdmin = 
        roleLower === 'super admin' || 
        roleLower === 'superadmin' || 
        roleLower === 'super_user' || 
        roleLower === 'superuser' ||
        roleLower === 'admin'
      
      if (isSuperAdmin) {
        return handler(request, user)
      }
    }

    // Get user permissions
    const permissions = await getUserPermissions(user.id)
    const normalizedPermissions = permissions.map(p => p.toLowerCase())

    // Check permissions
    const requiredPerms = Array.isArray(requiredPermission)
      ? requiredPermission.map(p => p.toLowerCase())
      : [requiredPermission.toLowerCase()]

    const requireAll = options?.requireAll || false
    const hasAccess = requireAll
      ? requiredPerms.every(perm => normalizedPermissions.includes(perm))
      : requiredPerms.some(perm => normalizedPermissions.includes(perm))

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return handler(request, user)
  }
}

/**
 * Helper to check if user has permission in API route
 */
export async function checkPermission(
  request: NextRequest,
  requiredPermission: string | string[],
  options?: {
    requireAll?: boolean
    allowSuperAdmin?: boolean
  }
): Promise<{ hasAccess: boolean; user: any }> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return { hasAccess: false, user: null }
  }

  const user = verifyToken(token)
  if (!user) {
    return { hasAccess: false, user: null }
  }

  // Check super admin
  const allowSuperAdmin = options?.allowSuperAdmin !== false
  if (allowSuperAdmin) {
    const roleLower = (user.role || '').toLowerCase()
    const isSuperAdmin = 
      roleLower === 'super admin' || 
      roleLower === 'superadmin' || 
      roleLower === 'super_user' || 
      roleLower === 'superuser' ||
      roleLower === 'admin'
    
    if (isSuperAdmin) {
      return { hasAccess: true, user }
    }
  }

  // Get permissions
  const permissions = await getUserPermissions(user.id)
  const normalizedPermissions = permissions.map(p => p.toLowerCase())

  const requiredPerms = Array.isArray(requiredPermission)
    ? requiredPermission.map(p => p.toLowerCase())
    : [requiredPermission.toLowerCase()]

  const requireAll = options?.requireAll || false
  const hasAccess = requireAll
    ? requiredPerms.every(perm => normalizedPermissions.includes(perm))
    : requiredPerms.some(perm => normalizedPermissions.includes(perm))

  return { hasAccess, user }
}

