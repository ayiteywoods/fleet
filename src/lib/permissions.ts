import { prisma } from './prisma'

/**
 * Get all permissions for a user based on their role_id
 */
export async function getUserPermissions(userId: string | bigint): Promise<string[]> {
  try {
    const userIdBigInt = typeof userId === 'string' ? BigInt(userId) : userId
    
    // Get user with role_id
    const user = await prisma.users.findUnique({
      where: { id: userIdBigInt },
      select: { role_id: true, role: true }
    })

    if (!user) {
      console.error(`[getUserPermissions] User not found: ${userIdBigInt}`)
      return []
    }

    // Auto-sync missing role_id using the role string if available
    if (!user.role_id && user.role) {
      console.warn(
        `[getUserPermissions] User ${userIdBigInt} has no role_id set. Attempting to match role string "${user.role}".`
      )
      const matchedRole = await prisma.roles.findFirst({
        where: {
          name: {
            equals: user.role,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          guard_name: true
        }
      })

      if (matchedRole) {
        await prisma.users.update({
          where: { id: userIdBigInt },
          data: { role_id: matchedRole.id }
        })
        user.role_id = matchedRole.id
        console.log(
          `[getUserPermissions] ✅ Synced user ${userIdBigInt} role_id to ${matchedRole.id} (${matchedRole.name}).`
        )
      } else {
        console.error(
          `[getUserPermissions] ❌ Unable to match role string "${user.role}" to any record in roles table.`
        )
        return []
      }
    }

    if (!user.role_id) {
      console.warn(`[getUserPermissions] User ${userIdBigInt} still has no role_id after sync attempt.`)
      return []
    }

    console.log(`[getUserPermissions] User ${userIdBigInt} has role_id: ${user.role_id}, role string: "${user.role}"`)

    // Get all permissions for the role
    const rolePermissions = await prisma.role_has_permissions.findMany({
      where: { role_id: user.role_id },
      include: {
        permissions: {
          select: { name: true }
        }
      }
    })

    console.log(`[getUserPermissions] Found ${rolePermissions.length} permissions for role_id ${user.role_id}`)
    
    if (rolePermissions.length === 0) {
      // Check if the role exists and has a name
      const role = await prisma.roles.findUnique({
        where: { id: user.role_id },
        select: { name: true, guard_name: true }
      })
      if (role) {
        console.warn(`[getUserPermissions] Role "${role.name}" (ID: ${user.role_id}, guard: ${role.guard_name}) has no permissions assigned!`)
      } else {
        console.error(`[getUserPermissions] Role with ID ${user.role_id} not found in database!`)
      }
    }

    // Normalize all permission names to lowercase for consistent comparison
    const normalized = rolePermissions.map(rp => rp.permissions.name.toLowerCase().trim())
    console.log(`[getUserPermissions] Returning ${normalized.length} normalized permissions:`, normalized.slice(0, 5).join(', '), normalized.length > 5 ? '...' : '')
    return normalized
  } catch (error) {
    console.error('[getUserPermissions] Error fetching user permissions:', error)
    return []
  }
}

/**
 * Get all permissions for a role
 */
export async function getRolePermissions(roleId: string | bigint): Promise<string[]> {
  try {
    const roleIdBigInt = typeof roleId === 'string' ? BigInt(roleId) : roleId
    
    const rolePermissions = await prisma.role_has_permissions.findMany({
      where: { role_id: roleIdBigInt },
      include: {
        permissions: {
          select: { name: true }
        }
      }
    })

    // Normalize all permission names to lowercase for consistent comparison
    return rolePermissions.map(rp => rp.permissions.name.toLowerCase().trim())
  } catch (error) {
    console.error('Error fetching role permissions:', error)
    return []
  }
}

/**
 * Check if a user has a specific permission
 */
export async function userHasPermission(userId: string | bigint, permissionName: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  const normalizedPermission = permissionName.toLowerCase().trim()
  return permissions.includes(normalizedPermission)
}

/**
 * Check if a user has any of the specified permissions
 */
export async function userHasAnyPermission(userId: string | bigint, permissionNames: string[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  const normalizedPermissions = permissionNames.map(p => p.toLowerCase().trim())
  return normalizedPermissions.some(perm => permissions.includes(perm))
}

/**
 * Check if a user has all of the specified permissions
 */
export async function userHasAllPermissions(userId: string | bigint, permissionNames: string[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  const normalizedPermissions = permissionNames.map(p => p.toLowerCase().trim())
  return normalizedPermissions.every(perm => permissions.includes(perm))
}

/**
 * Get permission name for a module and action
 * Example: getPermissionName('driver', 'view') => 'view driver'
 */
export function getPermissionName(module: string, action: string): string {
  return `${action} ${module}`.toLowerCase()
}

/**
 * Check if permission name matches a pattern
 * Supports wildcards like 'view *' or '* driver'
 */
export function permissionMatches(permission: string, pattern: string): boolean {
  if (pattern === '*') return true
  
  const permParts = permission.toLowerCase().split(' ')
  const patternParts = pattern.toLowerCase().split(' ')
  
  if (permParts.length !== patternParts.length) return false
  
  return patternParts.every((part, index) => {
    return part === '*' || part === permParts[index]
  })
}

