# Permission-Based Access Control Usage Guide

This guide explains how to use the permission system to control user access to features and pages.

## Overview

The permission system works by:
1. Users are assigned roles
2. Roles have permissions (e.g., "view driver", "add vehicle", "edit fuel")
3. When a user logs in, their permissions are fetched based on their role
4. UI components and API routes check permissions before allowing access

## Backend Usage

### Protecting API Routes

```typescript
import { withPermission } from '@/lib/routeProtection'

// Protect a route with a single permission
export const GET = withPermission(
  async (request: NextRequest, user: any) => {
    // Your handler code
    return NextResponse.json({ data: '...' })
  },
  'view driver'  // Required permission
)

// Protect with multiple permissions (user needs ANY of them)
export const POST = withPermission(
  async (request: NextRequest, user: any) => {
    // Your handler code
    return NextResponse.json({ success: true })
  },
  ['add driver', 'edit driver'],  // User needs at least one
  { requireAll: false }  // Default
)

// Protect with multiple permissions (user needs ALL of them)
export const DELETE = withPermission(
  async (request: NextRequest, user: any) => {
    // Your handler code
    return NextResponse.json({ success: true })
  },
  ['delete driver', 'suspend driver'],
  { requireAll: true }  // User needs all permissions
)
```

### Manual Permission Check in API Routes

```typescript
import { checkPermission } from '@/lib/routeProtection'

export async function GET(request: NextRequest) {
  const { hasAccess, user } = await checkPermission(request, 'view driver')
  
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  // Continue with handler
  return NextResponse.json({ data: '...' })
}
```

## Frontend Usage

### Using the PermissionGuard Component

```tsx
import PermissionGuard from '@/components/PermissionGuard'

// Hide/show UI elements based on permission
function MyComponent() {
  return (
    <div>
      {/* Only show if user has "view driver" permission */}
      <PermissionGuard permission="view driver">
        <DriverList />
      </PermissionGuard>
      
      {/* Only show if user has "add driver" permission */}
      <PermissionGuard permission="add driver">
        <button>Add Driver</button>
      </PermissionGuard>
      
      {/* Show fallback if no permission */}
      <PermissionGuard 
        permission="edit driver"
        fallback={<p>You don't have permission to edit drivers</p>}
      >
        <EditDriverButton />
      </PermissionGuard>
      
      {/* Check module + action */}
      <PermissionGuard module="vehicle" action="view">
        <VehicleList />
      </PermissionGuard>
      
      {/* Check multiple permissions (any) */}
      <PermissionGuard 
        permissions={['add driver', 'edit driver']}
        requireAll={false}
      >
        <DriverActions />
      </PermissionGuard>
    </div>
  )
}
```

### Using the usePermissions Hook

```tsx
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { 
    permissions, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    can,
    canAccess,
    loading 
  } = usePermissions()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  // Check single permission
  if (hasPermission('view driver')) {
    // Show driver list
  }
  
  // Check module + action
  if (can('view', 'driver')) {
    // Show driver list
  }
  
  // Check if user can access any driver-related feature
  if (canAccess('driver')) {
    // Show driver section
  }
  
  // Check multiple permissions
  if (hasAnyPermission(['add driver', 'edit driver'])) {
    // Show action buttons
  }
  
  if (hasAllPermissions(['delete driver', 'suspend driver'])) {
    // Show advanced actions
  }
  
  return (
    <div>
      {can('view', 'driver') && <DriverList />}
      {can('add', 'driver') && <AddDriverButton />}
    </div>
  )
}
```

### Protecting Navigation Items

```tsx
import PermissionGuard from '@/components/PermissionGuard'
import { usePermissions } from '@/hooks/usePermissions'

function Sidebar() {
  const { canAccess } = usePermissions()
  
  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Vehicles', href: '/vehicles', icon: TruckIcon },
    { name: 'Drivers', href: '/drivers', icon: UserGroupIcon },
    { name: 'Fuel', href: '/fuel', icon: BoltIcon },
    // ... more items
  ]
  
  return (
    <nav>
      {navigationItems.map(item => (
        <PermissionGuard 
          key={item.href}
          module={item.name.toLowerCase()} 
          action="view"
          fallback={null}  // Don't render if no permission
        >
          <NavLink href={item.href}>
            <item.icon />
            {item.name}
          </NavLink>
        </PermissionGuard>
      ))}
    </nav>
  )
}
```

## Permission Naming Convention

Permissions follow the pattern: `{action} {module}`

Examples:
- `view driver`
- `add driver`
- `edit driver`
- `delete driver`
- `activate driver`
- `suspend driver`
- `view vehicle`
- `add vehicle`
- `edit fuel log`
- `view maintenance`

## Super Admin Bypass

By default, users with admin/super admin roles bypass permission checks. This can be controlled:

```typescript
// Disable super admin bypass
export const GET = withPermission(
  handler,
  'view driver',
  { allowSuperAdmin: false }  // Even admins need permission
)
```

## Common Permission Patterns

### View-Only Access
```tsx
<PermissionGuard permission="view driver">
  <ReadOnlyDriverList />
</PermissionGuard>
```

### Edit Access
```tsx
<PermissionGuard permissions={['view driver', 'edit driver']} requireAll={true}>
  <EditableDriverForm />
</PermissionGuard>
```

### Admin Actions
```tsx
<PermissionGuard permissions={['delete driver', 'suspend driver']} requireAll={true}>
  <AdminActions />
</PermissionGuard>
```

## Best Practices

1. **Always check permissions on both frontend and backend** - Frontend checks improve UX, backend checks ensure security
2. **Use descriptive permission names** - Follow the `{action} {module}` pattern
3. **Group related permissions** - Use `hasAnyPermission` or `hasAllPermissions` for complex checks
4. **Provide fallback UI** - Show helpful messages when users lack permissions
5. **Cache permissions** - The `usePermissions` hook automatically caches permissions from `/api/auth/me`

## Troubleshooting

### User has no permissions
- Check if user has a `role_id` assigned
- Check if the role has permissions assigned in `role_has_permissions` table
- Verify permission names match exactly (case-insensitive)

### Permissions not updating
- Permissions are fetched on login and from `/api/auth/me`
- Refresh the page or re-login to get updated permissions
- Check browser console for permission fetch errors

