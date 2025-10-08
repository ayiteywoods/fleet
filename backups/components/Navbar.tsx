'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, Search, Bell, User } from 'lucide-react'
import { LuListCollapse } from 'react-icons/lu'
import { useTheme } from '@/contexts/ThemeContext'
import { getIconColor, getButtonColor } from '@/lib/themeUtils'

interface NavbarProps {
  onToggleSidebar: () => void
  isSidebarCollapsed: boolean
  user?: {
    firstName: string
    lastName: string
    role: string
  }
}

export default function Navbar({ onToggleSidebar, isSidebarCollapsed, user }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()
  const { themeColor, themeMode } = useTheme()

  const notifications = [
    {
      id: 1,
      title: 'Vehicle Maintenance Due',
      message: 'Vehicle GE 1245-19 requires maintenance in 2 days',
      time: '2 hours ago',
      type: 'warning'
    },
    {
      id: 2,
      title: 'New Driver Assignment',
      message: 'Driver John Doe has been assigned to Vehicle ABC 123',
      time: '5 hours ago',
      type: 'info'
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  return (
    <nav className={`border-b px-4 py-3 flex items-center justify-between ${
      themeMode === 'dark' 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Breadcrumb */}
        <div className={`flex items-center ${
          themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <span className="text-sm">🏢 / Dashboard</span>
        </div>
        
        {/* Hamburger Menu */}
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors ${
            themeMode === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
          aria-label="Toggle sidebar"
        >
          <LuListCollapse className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search here"
            className={`w-64 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
              themeMode === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
            }`}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:opacity-80 text-blue-600"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg transition-colors ${
              themeMode === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <Bell className="w-5 h-5 text-blue-600" />
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {notifications.length}
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border py-2 z-50 ${
              themeMode === 'dark' 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-300'
            }`}>
              <div className={`px-4 py-2 border-b ${
                themeMode === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <h3 className={`text-sm font-medium ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`px-4 py-3 border-b ${
                    themeMode === 'dark' 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                        notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{notification.title}</p>
                        <p className={`text-xs mt-1 ${
                          themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>{notification.message}</p>
                        <p className={`text-xs mt-1 ${
                          themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`px-4 py-2 ${
                themeMode === 'dark' ? 'border-t border-gray-600' : 'border-t border-gray-300'
              }`}>
                <button className={`text-sm text-blue-600 hover:text-blue-800 ${
                  themeMode === 'dark' ? 'hover:text-blue-400' : ''
                }`}>
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
              themeMode === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              themeColor === 'blue' ? 'bg-blue-600' :
              themeColor === 'gray' ? 'bg-gray-600' :
              'bg-yellow-600'
            }`}>
              <User className="w-4 h-4 text-white" />
            </div>
            {user && (
              <div className="text-left">
                <p className={`text-base font-medium ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {user.firstName} {user.lastName}
                </p>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>{user.role}</p>
              </div>
            )}
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50 ${
              themeMode === 'dark' 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-300'
            }`}>
              <Link
                href="/profile"
                className={`block px-4 py-3 text-sm hover:bg-opacity-10 ${
                  themeMode === 'dark' 
                    ? 'text-gray-300 hover:bg-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setShowUserMenu(false)}
              >
                My Profile
              </Link>
              <Link
                href="/settings"
                className={`block px-4 py-3 text-sm hover:bg-opacity-10 ${
                  themeMode === 'dark' 
                    ? 'text-gray-300 hover:bg-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setShowUserMenu(false)}
              >
                Settings
              </Link>
              <hr className={`my-2 ${
                themeMode === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`} />
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  handleLogout()
                }}
                className={`block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-opacity-10 ${
                  themeMode === 'dark' 
                    ? 'hover:bg-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
