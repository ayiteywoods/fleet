'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGuardProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  module?: string
  action?: string
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Component that conditionally renders children based on user permissions
 */
export default function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  module,
  action,
  fallback = null,
  children
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, can, loading } = usePermissions()

  if (loading) {
    return null // Or a loading spinner
  }

  let hasAccess = false

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission)
  }
  // Check multiple permissions
  else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }
  // Check module + action
  else if (module && action) {
    hasAccess = can(action, module)
  }
  // Default: no access if no permission specified
  else {
    hasAccess = false
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

