'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import FloatingSettings from './FloatingSettings'
import { useTheme } from '@/contexts/ThemeContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { themeMode } = useTheme()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Verify token and get user info
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Authentication failed')
      }
      return res.json()
    })
    .then(data => {
      if (data.user) {
        setUser(data.user)
      } else {
        localStorage.removeItem('token')
        router.push('/login')
      }
    })
    .catch((error) => {
      console.error('Auth error:', error)
      localStorage.removeItem('token')
      router.push('/login')
    })
    .finally(() => {
      setIsLoading(false)
    })
  }, [router])

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar}
        user={user}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col" style={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        minWidth: '0',
        flexShrink: 1
      }}>
        {/* Navbar */}
        <Navbar 
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          user={user}
        />
        
        {/* Page Content */}
        <main className={`flex-1 p-6 overflow-hidden ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`} style={{
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          minWidth: '0',
          flexShrink: 1
        }}>
          {children}
        </main>
      </div>
      
      {/* Floating Settings */}
      <FloatingSettings />
    </div>
  )
}
