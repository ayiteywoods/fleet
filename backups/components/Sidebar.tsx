'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Fuel, 
  Anchor, 
  Wrench, 
  MapPin, 
  FileText, 
  Settings, 
  User, 
  ChevronUp, 
  ChevronDown, 
  ChevronRight,
  Shield
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { getIconColor, getButtonColor } from '@/lib/themeUtils'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  user?: {
    name: string
    role: string
  }
}

export default function Sidebar({ isCollapsed, onToggle, user }: SidebarProps) {
  const pathname = usePathname()
  const { themeColor, themeMode } = useTheme()
  const [expandedSections, setExpandedSections] = useState({
    admin: false,
    reports: false,
    settings: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/'
    },
    {
      name: 'Vehicles',
      href: '/vehicles',
      icon: Truck,
      active: pathname === '/vehicles'
    },
    {
      name: 'Drivers',
      href: '/drivers',
      icon: Users,
      active: pathname === '/drivers'
    },
    {
      name: 'Fuel',
      href: '/fuel',
      icon: Fuel,
      active: pathname === '/fuel'
    },
    {
      name: 'Insurance',
      href: '/insurance',
      icon: Anchor,
      active: pathname === '/insurance'
    },
    {
      name: 'Roadworthy',
      href: '/roadworthy',
      icon: Shield,
      active: pathname === '/roadworthy'
    },
    {
      name: 'Repairs',
      href: '/repairs',
      icon: Wrench,
      active: pathname === '/repairs'
    },
    {
      name: 'Maintenance',
      href: '/maintenance',
      icon: Settings,
      active: pathname === '/maintenance'
    }
  ]

  const additionalItems = [
    {
      name: 'Users',
      href: '/users',
      icon: User,
      active: pathname === '/users'
    },
    {
      name: 'Live Tracking',
      href: '/tracking',
      icon: MapPin,
      active: pathname === '/tracking'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      active: pathname === '/reports',
      hasSubmenu: true,
      expanded: expandedSections.reports,
      onToggle: () => toggleSection('reports')
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings',
      hasSubmenu: true,
      expanded: expandedSections.settings,
      onToggle: () => toggleSection('settings')
    }
  ]

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen sticky top-0 flex flex-col ${
      themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
    }`}>
      {/* Logo/Brand */}
      <div className={`px-4 py-6 border-b flex items-center ${
        themeMode === 'dark' 
          ? 'bg-white border-gray-400' 
          : 'bg-white border-gray-300'
      }`}>
        {!isCollapsed && (
          <h1 className={`text-lg font-bold ${
            themeMode === 'dark' ? 'text-blue-900' : 'text-blue-900'
          }`}>neraFleet Logo</h1>
        )}
        {isCollapsed && (
          <div className={`w-8 h-7 rounded-lg flex items-center justify-center ${
            themeColor === 'blue' ? 'bg-blue-600' :
            themeColor === 'gray' ? 'bg-gray-600' :
            'bg-yellow-600'
          }`}>
            <span className="text-white font-bold text-sm">NF</span>
          </div>
        )}
      </div>

      {/* Admin Section */}
      <div className={`p-4 border-b ${
        themeMode === 'dark' ? 'border-gray-400' : 'border-gray-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              themeColor === 'blue' ? 'bg-blue-600' :
              themeColor === 'gray' ? 'bg-gray-600' :
              'bg-yellow-600'
            }`}>
              <User className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <span className={`ml-2 text-sm font-medium ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>{user?.name || 'Admin'}</span>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => toggleSection('admin')}
              className={`hover:opacity-80 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-700'
              }`}
            >
              {expandedSections.admin ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
        
        {expandedSections.admin && !isCollapsed && (
          <div className="mt-2 ml-8 space-y-1">
            <Link href="/profile" className={`block text-sm ${
              themeMode === 'dark' ? 'text-white hover:text-blue-200' : 'text-gray-700 hover:text-gray-900'
            }`}>
              MP My Profile
            </Link>
            <Link href="/logout" className={`block text-sm ${
              themeMode === 'dark' ? 'text-white hover:text-blue-200' : 'text-gray-700 hover:text-gray-900'
            }`}>
              L Logout
            </Link>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-3">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                    item.active
                      ? themeMode === 'dark' ? 'bg-gray-500 text-white shadow-sm' : 'bg-gray-400 text-gray-900 shadow-sm'
                      : themeMode === 'dark' ? 'text-white hover:bg-gray-500' : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-full transition-colors ${
                    item.active
                      ? themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-500'
                      : themeMode === 'dark' ? 'bg-gray-500' : 'bg-gray-400'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      item.active ? (themeMode === 'dark' ? 'text-white' : 'text-gray-900') : themeMode === 'dark' ? 'text-white' : 'text-gray-700'
                    }`} />
                  </div>
                  {!isCollapsed && (
                    <span className={`ml-3 text-sm font-medium ${
                      item.active ? (themeMode === 'dark' ? 'text-white' : 'text-gray-900') : themeMode === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>{item.name}</span>
                  )}
                </Link>
                {/* Add horizontal rules after Dashboard, Drivers, and Roadworthy */}
                {!isCollapsed && (item.name === 'Dashboard' || item.name === 'Drivers' || item.name === 'Roadworthy') && (
                  <div className={`my-2 border-t ${
                    themeMode === 'dark' 
                      ? (item.name === 'Dashboard' ? 'border-gray-500' : 'border-gray-400')
                      : (item.name === 'Dashboard' ? 'border-gray-400' : 'border-gray-300')
                  }`}></div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Separator */}
        <div className={`my-4 border-t ${
          themeMode === 'dark' ? 'border-gray-400' : 'border-gray-300'
        }`}></div>

        {/* Additional Navigation */}
        <nav className="space-y-3">
          {additionalItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
                    item.active
                      ? themeMode === 'dark' ? 'bg-gray-500 text-white shadow-sm' : 'bg-gray-400 text-gray-900 shadow-sm'
                      : themeMode === 'dark' ? 'text-white hover:bg-gray-500' : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full transition-colors ${
                      item.active
                        ? themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-500'
                        : themeMode === 'dark' ? 'bg-gray-500' : 'bg-gray-400'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        item.active ? (themeMode === 'dark' ? 'text-white' : 'text-gray-900') : themeMode === 'dark' ? 'text-white' : 'text-gray-700'
                      }`} />
                    </div>
                    {!isCollapsed && (
                      <span className={`ml-3 text-sm font-medium ${
                        item.active ? (themeMode === 'dark' ? 'text-white' : 'text-gray-900') : themeMode === 'dark' ? 'text-white' : 'text-gray-700'
                      }`}>{item.name}</span>
                    )}
                  </div>
                  {item.hasSubmenu && !isCollapsed && (
                    <button
                      onClick={item.onToggle}
                      className={`hover:opacity-80 ${
                        themeMode === 'dark' ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {item.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  )}
                </Link>
              
                {/* Submenu items would go here */}
                {item.expanded && !isCollapsed && item.name === 'Reports' && (
                  <div className="ml-8 mt-1 space-y-1">
                    <Link href="/reports/fleet" className={`block text-sm ${
                      themeMode === 'dark' ? 'text-white hover:text-blue-200' : 'text-gray-700 hover:text-gray-900'
                    }`}>
                      Fleet Reports
                    </Link>
                    <Link href="/reports/maintenance" className={`block text-sm ${
                      themeMode === 'dark' ? 'text-white hover:text-blue-200' : 'text-gray-700 hover:text-gray-900'
                    }`}>
                      Maintenance Reports
                    </Link>
                  </div>
                )}
                
                {item.expanded && !isCollapsed && item.name === 'Settings' && (
                  <div className="ml-8 mt-1 space-y-1">
                    <Link href="/settings/general" className={`block text-sm ${
                      themeMode === 'dark' ? 'text-white hover:text-blue-200' : 'text-gray-700 hover:text-gray-900'
                    }`}>
                      General Settings
                    </Link>
                    <Link href="/settings/users" className={`block text-sm ${
                      themeMode === 'dark' ? 'text-white hover:text-blue-200' : 'text-gray-700 hover:text-gray-900'
                    }`}>
                      User Management
                    </Link>
                  </div>
                )}
                
                {/* Add separator after each item except the last one */}
                {index < additionalItems.length - 1 && (
                  <div className={`my-2 border-t ${
                    themeMode === 'dark' ? 'border-gray-400' : 'border-gray-300'
                  }`}></div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
