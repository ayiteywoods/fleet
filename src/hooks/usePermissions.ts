'use client'

import { useState, useEffect, useMemo } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  group?: string | number | null
  permissions?: string[]
  [key: string]: any
}

/**
 * React hook for checking user permissions
 */
export function usePermissions() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    // Fetch user data with permissions
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch user data')
        }
        return res.json()
      })
      .then(data => {
        if (data.user) {
          // Ensure permissions are normalized to lowercase
          if (data.user.permissions && Array.isArray(data.user.permissions)) {
            data.user.permissions = data.user.permissions.map((p: string) => p.toLowerCase().trim())
          }
          console.log('[usePermissions] Loaded user permissions:', data.user.permissions?.length || 0, 'permissions')
          setUser(data.user)
        }
      })
      .catch(error => {
        console.error('Error fetching user permissions:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const permissions = useMemo(() => {
    return user?.permissions || []
  }, [user?.permissions])

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permissionName: string): boolean => {
    if (!permissions.length) {
      console.log(`[usePermissions] No permissions available for check: "${permissionName}"`)
      return false
    }
    const normalizedPermission = permissionName.toLowerCase().trim()
    const hasAccess = permissions.includes(normalizedPermission)
    if (!hasAccess) {
      console.log(`[usePermissions] Permission check failed: "${normalizedPermission}" not in [${permissions.slice(0, 5).join(', ')}${permissions.length > 5 ? '...' : ''}]`)
    }
    return hasAccess
  }

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (!permissions.length) return false
    const normalized = permissionNames.map(p => p.toLowerCase())
    return normalized.some(perm => permissions.includes(perm))
  }

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    if (!permissions.length) return false
    const normalized = permissionNames.map(p => p.toLowerCase())
    return normalized.every(perm => permissions.includes(perm))
  }

  /**
   * Check if user has permission for a module and action
   * Example: can('view', 'driver') checks for 'view driver' permission
   */
  const can = (action: string, module: string): boolean => {
    const permissionName = `${action} ${module}`.toLowerCase()
    return hasPermission(permissionName)
  }

  /**
   * Check if user can perform any action on a module
   * Example: canAccess('driver') checks for any '* driver' permission
   */
  const canAccess = (module: string): boolean => {
    if (!permissions.length) return false
    const moduleLower = module.toLowerCase()
    return permissions.some(perm => perm.endsWith(` ${moduleLower}`))
  }

  return {
    user,
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    canAccess
  }
}

