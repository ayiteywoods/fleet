'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon,
  TruckIcon,
  UserGroupIcon,
  BoltIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  UserIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ShieldCheckIcon as RoadworthyIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import { getIconColor, getButtonColor, getBrandBgColor } from '@/lib/themeUtils'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  user?: {
    name: string
    role: string
    hasLiveTracking?: boolean
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
      icon: HomeIcon,
      active: pathname === '/'
    },
    {
      name: 'Vehicles',
      href: '/vehicles',
      icon: TruckIcon,
      active: pathname === '/vehicles' || pathname.startsWith('/vehicle-profile/')
    },
    {
      name: 'Drivers',
      href: '/drivers',
      icon: UserGroupIcon,
      active: pathname === '/drivers' || pathname.startsWith('/driver-profile/')
    },
    {
      name: 'Fuel',
      href: '/fuel',
      icon: BoltIcon,
      active: pathname === '/fuel'
    },
    {
      name: 'Insurance',
      href: '/insurance',
      icon: ShieldCheckIcon,
      active: pathname === '/insurance'
    },
    {
      name: 'Roadworthy',
      href: '/roadworthy',
      icon: RoadworthyIcon,
      active: pathname === '/roadworthy'
    },
    {
      name: 'Repairs',
      href: '/repairs',
      icon: WrenchScrewdriverIcon,
      active: pathname === '/repairs'
    },
    {
      name: 'Maintenance',
      href: '/maintenance',
      icon: Cog6ToothIcon,
      active: pathname === '/maintenance'
    }
  ]

  // If no user, definitely don't show Live Tracking
  if (!user) {
    console.log('[Sidebar] No user object - hiding Live Tracking')
  }

  // Check if user is super admin
  const isSuperAdmin = user?.role ? (
    user.role.toLowerCase() === 'super admin' ||
    user.role.toLowerCase() === 'superadmin' ||
    user.role.toLowerCase() === 'super_user' ||
    user.role.toLowerCase() === 'superuser'
  ) : false

  // Only show Live Tracking if user explicitly has access OR is super admin
  // hasLiveTracking must be strictly true (not just truthy)
  // Treat undefined, null, string 'true', or any non-boolean value as false
  const hasLiveTrackingValue = user?.hasLiveTracking
  const hasExplicitAccess = user && hasLiveTrackingValue === true && typeof hasLiveTrackingValue === 'boolean'
  const shouldShowLiveTracking = isSuperAdmin || hasExplicitAccess
  
  // Debug logging - ALWAYS log to help debug
  console.log('[Sidebar] Live Tracking visibility check:', {
    isSuperAdmin,
    hasExplicitAccess,
    hasLiveTrackingValue: hasLiveTrackingValue,
    hasLiveTrackingType: typeof hasLiveTrackingValue,
    shouldShow: shouldShowLiveTracking,
    role: user?.role,
    userHasLiveTracking: user?.hasLiveTracking
  })
  
  // Extra safeguard: if shouldShowLiveTracking is false, ensure it's really false
  if (!shouldShowLiveTracking && !isSuperAdmin) {
    console.log('[Sidebar] ❌ HIDING Live Tracking - user does not have access')
  }

  // Build additional items array - explicitly exclude Live Tracking if user doesn't have access
  const additionalItems = []
  
  // Only add Live Tracking if user explicitly has access OR is super admin
  if (shouldShowLiveTracking) {
    console.log('[Sidebar] ✅ SHOWING Live Tracking - user has access')
    additionalItems.push({
      name: 'Live Tracking',
      href: '/tracking',
      icon: MapPinIcon,
      active: pathname === '/tracking'
    })
  } else {
    console.log('[Sidebar] ❌ NOT showing Live Tracking - user does not have access')
  }
  
  // Add other items
  additionalItems.push(
    {
      name: 'Reports',
      href: '/reports',
      icon: DocumentTextIcon,
      active: pathname === '/reports',
      hasSubmenu: true,
      expanded: expandedSections.reports,
      onToggle: () => toggleSection('reports')
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      active: pathname === '/settings',
      hasSubmenu: true,
      expanded: expandedSections.settings,
      onToggle: () => toggleSection('settings')
    }
  )

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen fixed left-0 top-0 z-50 flex flex-col ${
      themeMode === 'dark' ? 'bg-navy-900 text-white' : 'bg-white'
    }`}>
      {/* Logo/Brand */}
      <div className={`px-4 py-6 border-b flex items-center justify-between ${
        themeMode === 'dark' 
          ? 'bg-navy-800 border-navy-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center">
          {/* Always keep logo visible on mobile and when expanded on desktop */}
          {(!isCollapsed || typeof window !== 'undefined' && window.innerWidth < 1024) && (
            <img 
              src="/nerafleet_logo.png" 
              alt="neraFleet Logo" 
              className="h-8 w-auto"
            />
          )}
          {isCollapsed && !(typeof window !== 'undefined' && window.innerWidth < 1024) && (
            <div className={`w-8 h-7 rounded-lg flex items-center justify-center ${getBrandBgColor(themeColor)}`}>
              <span className="text-white font-bold text-sm">NF</span>
            </div>
          )}
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className={`p-2 rounded-xl transition-colors ${
            themeMode === 'dark' 
              ? 'bg-navy-700 hover:bg-navy-600 text-gray-100' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Admin Section */}
      <div className={`p-4 border-b ${
        themeMode === 'dark' ? 'border-navy-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBrandBgColor(themeColor)}`}>
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <span className={`ml-2 text-sm font-medium ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{user?.name || 'Admin'}</span>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => toggleSection('admin')}
              className={`hover:opacity-80 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {expandedSections.admin ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
          )}
        </div>
        
        {expandedSections.admin && !isCollapsed && (
          <div className="mt-2 ml-8 space-y-1">
            <Link href="/profile" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === '/profile' 
                ? 'bg-blue-600 text-white' 
                : themeMode === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}>
              <UserIcon className="w-4 h-4" />
              My Profile
            </Link>
            <Link href="/logout" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === '/logout' 
                ? 'bg-red-600 text-white' 
                : themeMode === 'dark' ? 'text-red-400 hover:bg-gray-700 hover:text-red-300' : 'text-red-600 hover:bg-gray-100 hover:text-red-700'
            }`}>
              <span className="w-4 h-4">L</span>
              Logout
            </Link>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-4">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-3xl transition-colors ${
                    item.active
                      ? `${getBrandBgColor(themeColor)} text-white shadow-sm`
                      : themeMode === 'dark' ? 'text-gray-300 hover:bg-navy-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-1 rounded-full transition-colors ${
                    item.active
                      ? themeMode === 'dark' ? 'bg-white/20' : 'bg-white/20'
                      : themeMode === 'dark' ? 'bg-navy-800' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      item.active ? 'text-white' : themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                  </div>
                  {!isCollapsed && (
                    <span className={`ml-3 text-sm font-medium ${
                      item.active ? 'text-white' : themeMode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>{item.name}</span>
                  )}
                </Link>
                {/* Add horizontal rules after Dashboard, Drivers, and Roadworthy */}
                {!isCollapsed && (item.name === 'Dashboard' || item.name === 'Drivers' || item.name === 'Roadworthy') && (
                  <div className={`my-2 border-t ${
                    themeMode === 'dark' 
                      ? (item.name === 'Dashboard' ? 'border-blue-200/30' : 'border-navy-700')
                      : (item.name === 'Dashboard' ? 'border-blue-200/50' : 'border-gray-100')
                  }`}></div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Separator */}
        <div className={`my-4 border-t ${
          themeMode === 'dark' ? 'border-gray-200' : 'border-gray-200'
        }`}></div>

        {/* Additional Navigation */}
        <nav className="space-y-4">
          {additionalItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-1 rounded-3xl transition-colors ${
                    item.active
                      ? `${getBrandBgColor(themeColor)} text-white shadow-sm`
                      : themeMode === 'dark' ? 'text-gray-300 hover:bg-navy-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full transition-colors ${
                      item.active
                        ? themeMode === 'dark' ? 'bg-white/20' : 'bg-white/20'
                        : themeMode === 'dark' ? 'bg-navy-800' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        item.active ? 'text-white' : themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`} />
                    </div>
                    {!isCollapsed && (
                      <span className={`ml-3 text-sm font-medium ${
                        item.active ? 'text-white' : themeMode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>{item.name}</span>
                    )}
                  </div>
                  {item.hasSubmenu && !isCollapsed && (
                    <button
                      onClick={item.onToggle}
                      className={`hover:opacity-80 ${
                        item.active 
                          ? 'text-white' 
                          : themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {item.expanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                    </button>
                  )}
                </Link>
              
                {/* Submenu items would go here */}
                {item.expanded && !isCollapsed && item.name === 'Reports' && (
                  <div className="ml-8 mt-1 space-y-2">
                    <Link href="/reports/fleet" className={`block text-sm ${
                      themeMode === 'dark' ? 'text-white hover:text-blue-200' : 'text-blue-700 hover:text-blue-900'
                    }`}>
                      Fleet Reports
                    </Link>
                    <Link href="/reports/maintenance" className={`block text-sm ${
                      themeMode === 'dark' ? 'text-white hover:text-blue-200' : 'text-blue-700 hover:text-blue-900'
                    }`}>
                      Maintenance Reports
                    </Link>
                  </div>
                )}
                
                {item.expanded && !isCollapsed && item.name === 'Settings' && (
                  <div className="ml-8 mt-1 space-y-2">
                    <Link href="/settings/general" className={`block text-sm ${
                      themeMode === 'dark' ? 'text-white hover:text-blue-200' : 'text-blue-700 hover:text-blue-900'
                    }`}>
                      General Settings
                    </Link>
                    <Link href="/users" className={`block text-sm ${
                      themeMode === 'dark' ? 'text-white hover:text-blue-200' : 'text-blue-700 hover:text-blue-900'
                    }`}>
                      User Management
                    </Link>
                  </div>
                )}
                
                {/* Add separator after each item except the last one */}
                {index < additionalItems.length - 1 && (
                  <div className={`my-2 border-t ${
                    themeMode === 'dark' ? 'border-gray-200' : 'border-gray-200'
                  }`}></div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Bottom Spacing */}
      <div className="p-4">
        <div className="h-8"></div>
      </div>
    </div>
  )
}
