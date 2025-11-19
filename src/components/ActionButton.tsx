'use client'

import { ReactNode } from 'react'
import PermissionGuard from './PermissionGuard'

interface ActionButtonProps {
  permission: string
  onClick: () => void
  className?: string
  title?: string
  children: ReactNode
  disabled?: boolean
}

/**
 * A button that only renders if user has the required permission
 */
export default function ActionButton({
  permission,
  onClick,
  className = '',
  title,
  children,
  disabled = false
}: ActionButtonProps) {
  return (
    <PermissionGuard permission={permission} fallback={null}>
      <button
        onClick={onClick}
        className={className}
        title={title}
        disabled={disabled}
      >
        {children}
      </button>
    </PermissionGuard>
  )
}

