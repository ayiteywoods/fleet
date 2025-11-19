'use client'

import { useEffect, useMemo, useState } from 'react'
import { X, Shield, Search, CheckSquare, Square, Loader2 } from 'lucide-react'
import Notification from './Notification'
import { useTheme } from '@/contexts/ThemeContext'

interface Permission {
  id: string
  name: string
  guard_name: string
}

interface Role {
  id: string
  name: string
  guard_name: string
}

interface RolePermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  role: Role | null
}

interface PermissionGroup {
  key: string
  label: string
  permissions: {
    id: string
    label: string
  }[]
}

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const deriveGroupLabel = (permissionName: string) => {
  const parts = permissionName.split(' ').filter(Boolean)
  if (parts.length <= 1) {
    return 'General'
  }
  return toTitleCase(parts.slice(1).join(' '))
}

const labelizePermission = (name: string) =>
  toTitleCase(name.replace(/\s+/g, ' ').trim())

export default function RolePermissionsModal({
  isOpen,
  onClose,
  role
}: RolePermissionsModalProps) {
  const { themeMode } = useTheme()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const resetState = () => {
    setPermissions([])
    setSelectedIds(new Set())
    setSearchQuery('')
  }

  useEffect(() => {
    if (isOpen && role?.id) {
      loadData(role.id)
    } else if (!isOpen) {
      resetState()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, role?.id])

  const loadData = async (roleId: string) => {
    try {
      setLoading(true)
      const headers = getAuthHeaders()
      const [permissionsRes, rolePermissionsRes] = await Promise.all([
        fetch('/api/permissions', { headers }),
        fetch(`/api/role-permissions?roleId=${roleId}`, { headers })
      ])

      if (!permissionsRes.ok) {
        throw new Error('Failed to load permissions catalogue')
      }
      const permissionsData: Permission[] = await permissionsRes.json()
      setPermissions(permissionsData)

      if (rolePermissionsRes.ok) {
        const rolePermissions = await rolePermissionsRes.json()
        setSelectedIds(new Set(rolePermissions.permissionIds ?? []))
      } else {
        setSelectedIds(new Set())
      }
    } catch (error) {
      console.error('Error loading role permissions:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Load Failed',
        message: 'Unable to load permissions for this role.'
      })
    } finally {
      setLoading(false)
    }
  }

  const groupedPermissions = useMemo<PermissionGroup[]>(() => {
    const groups: Record<string, PermissionGroup> = {}

    permissions.forEach((permission) => {
      const key = deriveGroupLabel(permission.name).toLowerCase() || 'general'
      if (!groups[key]) {
        groups[key] = {
          key,
          label: deriveGroupLabel(permission.name),
          permissions: []
        }
      }
      groups[key].permissions.push({
        id: permission.id,
        label: labelizePermission(permission.name)
      })
    })

    const normalizedSearch = searchQuery.trim().toLowerCase()

    return Object.values(groups)
      .map((group) => ({
        ...group,
        permissions: group.permissions.sort((a, b) =>
          a.label.localeCompare(b.label)
        )
      }))
      .filter((group) => {
        if (!normalizedSearch) return true
        if (group.label.toLowerCase().includes(normalizedSearch)) {
          return true
        }
        return group.permissions.some((perm) =>
          perm.label.toLowerCase().includes(normalizedSearch)
        )
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [permissions, searchQuery])

  const handleTogglePermission = (permissionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.add(permissionId)
      }
      return next
    })
  }

  const handleToggleGroup = (group: PermissionGroup) => {
    const groupIds = group.permissions.map((perm) => perm.id)
    const hasAll = groupIds.every((id) => selectedIds.has(id))

    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (hasAll) {
        groupIds.forEach((id) => next.delete(id))
      } else {
        groupIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const handleSelectAll = () => {
    const allIds = permissions.map((perm) => perm.id)
    setSelectedIds(new Set(allIds))
  }

  const handleClearAll = () => {
    setSelectedIds(new Set())
  }

  const handleSave = async () => {
    if (!role?.id) return
    try {
      setSaving(true)
      const response = await fetch('/api/role-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          roleId: role.id,
          permissionIds: Array.from(selectedIds)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update role permissions')
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Permissions Updated',
        message: `Saved permissions for ${role.name}.`
      })
    } catch (error) {
      console.error('Error saving role permissions:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Save Failed',
        message: 'Unable to save permissions. Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !role) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', backdropFilter: 'blur(2px)' }}
      >
        <div
          className={`relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-xl ${
            themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          }`}
        >
          <div
            className={`flex items-center justify-between p-6 border-b ${
              themeMode === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div>
              <p className="text-sm text-gray-500">
                Please choose the applicable permissions for this role:
              </p>
              <h2 className="text-2xl font-semibold">
                {role.name}{' '}
                <span className="text-sm font-normal text-gray-500">
                  ({role.guard_name})
                </span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search permissions or groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-brand-50 text-brand-600 hover:bg-brand-100 text-sm font-medium"
                >
                  <CheckSquare className="w-4 h-4" />
                  Select all
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
                >
                  <Square className="w-4 h-4" />
                  Clear all
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-500 gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                Loading permissions...
              </div>
            ) : groupedPermissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No permissions found for the current filters.
              </div>
            ) : (
              groupedPermissions.map((group) => {
                const groupIds = group.permissions.map((perm) => perm.id)
                const checkedCount = groupIds.filter((id) => selectedIds.has(id)).length
                const isAllSelected = checkedCount === groupIds.length
                const isPartiallySelected =
                  checkedCount > 0 && checkedCount < groupIds.length

                return (
                  <div
                    key={group.key}
                    className={`rounded-3xl border ${
                      themeMode === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'
                    } p-5 space-y-4`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-brand-500" />
                          <h3 className="text-lg font-semibold">{group.label}</h3>
                        </div>
                        <p className="text-sm text-gray-500">
                          {checkedCount} of {groupIds.length} permissions selected
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleGroup(group)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium ${
                          isAllSelected
                            ? 'bg-brand-100 text-brand-700'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        {isAllSelected ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                        {isAllSelected ? 'Unselect group' : 'Select group'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.permissions.map((permission) => (
                        <label
                          key={permission.id}
                          className={`flex items-center gap-3 rounded-2xl border px-3 py-2 cursor-pointer ${
                            themeMode === 'dark'
                              ? 'border-gray-800 bg-gray-800 hover:bg-gray-700'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-brand-600"
                            checked={selectedIds.has(permission.id)}
                            onChange={() => handleTogglePermission(permission.id)}
                          />
                          <span
                            className={`text-sm font-medium ${
                              themeMode === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}
                          >
                            {permission.label}
                          </span>
                        </label>
                      ))}
                    </div>

                    {isPartiallySelected && (
                      <p className="text-xs text-brand-600">
                        Partially selected
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <div
            className={`flex items-center justify-between p-6 border-t ${
              themeMode === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <p className="text-sm text-gray-500">
              {selectedIds.size} permission(s) selected
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-3xl bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-3xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save permissions'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </>
  )
}


