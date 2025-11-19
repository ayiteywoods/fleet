# Guide: Applying Permissions to Pages

This guide shows you how to add permission checks to protect Add, Edit, Delete, and View buttons on your pages.

## Pattern to Follow

### 1. Import Required Components

Add these imports at the top of your page file:

```tsx
import PermissionGuard from '@/components/PermissionGuard'
import { usePermissions } from '@/hooks/usePermissions'
```

### 2. Protect the "Add" Button

Find your "Add" button (usually in the header) and wrap it:

```tsx
// Before
<button onClick={() => setShowAddModal(true)}>
  Add Driver
</button>

// After
<PermissionGuard permission="add driver">
  <button onClick={() => setShowAddModal(true)}>
    Add Driver
  </button>
</PermissionGuard>
```

### 3. Protect Action Buttons in Tables

Find the View/Edit/Delete buttons in your table rows:

```tsx
// Before
<td>
  <div className="flex items-center gap-2">
    <button onClick={() => handleView(item)}>
      <EyeIcon />
    </button>
    <button onClick={() => handleEdit(item)}>
      <PencilIcon />
    </button>
    <button onClick={() => handleDelete(item)}>
      <XMarkIcon />
    </button>
  </div>
</td>

// After
<td>
  <div className="flex items-center gap-2">
    <PermissionGuard permission="view driver" fallback={null}>
      <button onClick={() => handleView(item)}>
        <EyeIcon />
      </button>
    </PermissionGuard>
    <PermissionGuard permission="edit driver" fallback={null}>
      <button onClick={() => handleEdit(item)}>
        <PencilIcon />
      </button>
    </PermissionGuard>
    <PermissionGuard permission="delete driver" fallback={null}>
      <button onClick={() => handleDelete(item)}>
        <XMarkIcon />
      </button>
    </PermissionGuard>
  </div>
</td>
```

## Permission Names by Module

Use these permission names (all lowercase):

### Drivers
- `view driver`
- `add driver`
- `edit driver`
- `delete driver`
- `activate driver`
- `suspend driver`

### Vehicles
- `view vehicle`
- `add vehicle`
- `edit vehicle`
- `delete vehicle`
- `activate vehicle`
- `suspend vehicle`

### Fuel
- `view fuel`
- `add fuel`
- `edit fuel`
- `delete fuel`
- `view fuel log`
- `add fuel log`
- `edit fuel log`
- `delete fuel log`
- `view fuel request`
- `add fuel request`
- `edit fuel request`
- `delete fuel request`

### Insurance
- `view insurance`
- `add insurance`
- `edit insurance`
- `delete insurance`

### Maintenance
- `view maintenance`
- `add maintenance`
- `edit maintenance`
- `delete maintenance`

### Repairs
- `view repair`
- `add repair`
- `edit repair`
- `delete repair`

### Roadworthy
- `view roadworthy`
- `add roadworthy`
- `edit roadworthy`
- `delete roadworthy`

## Pages That Need Updates

Apply the pattern above to these pages:

1. ✅ `/src/app/drivers/page.tsx` - DONE
2. ✅ `/src/app/vehicles/page.tsx` - DONE
3. ⏳ `/src/app/fuel/page.tsx`
4. ⏳ `/src/app/insurance/page.tsx`
5. ⏳ `/src/app/maintenance/page.tsx`
6. ⏳ `/src/app/repairs/page.tsx`
7. ⏳ `/src/app/roadworthy/page.tsx`

## Quick Copy-Paste Template

For each page, use this template:

```tsx
// 1. Add imports
import PermissionGuard from '@/components/PermissionGuard'

// 2. Protect Add button
<PermissionGuard permission="add [module]">
  <button onClick={() => setShowAddModal(true)}>
    ADD [MODULE]
  </button>
</PermissionGuard>

// 3. Protect action buttons
<PermissionGuard permission="view [module]" fallback={null}>
  <button onClick={() => handleView(item)}>
    <EyeIcon />
  </button>
</PermissionGuard>
<PermissionGuard permission="edit [module]" fallback={null}>
  <button onClick={() => handleEdit(item)}>
    <PencilIcon />
  </button>
</PermissionGuard>
<PermissionGuard permission="delete [module]" fallback={null}>
  <button onClick={() => handleDelete(item)}>
    <XMarkIcon />
  </button>
</PermissionGuard>
```

Replace `[module]` with: `driver`, `vehicle`, `fuel`, `insurance`, `maintenance`, `repair`, `roadworthy`, etc.

## Testing

After applying permissions:
1. Log in with a user that has limited permissions
2. Verify buttons are hidden when user lacks permission
3. Verify buttons are visible when user has permission
4. Check browser console for permission logs

