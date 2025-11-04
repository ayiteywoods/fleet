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
        // Ensure hasLiveTracking is explicitly set (not undefined/null)
        const userData = {
          ...data.user,
          hasLiveTracking: data.user.hasLiveTracking === true  // Explicitly boolean
        }
        setUser(userData)
        console.log('[DashboardLayout] User loaded:', { 
          name: userData.name, 
          role: userData.role, 
          hasLiveTracking: userData.hasLiveTracking 
        })
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

  // Periodically re-verify external tracking access using session-stored password
  useEffect(() => {
    if (!user) return

    let cancelled = false
    const checkNow = async () => {
      try {
        const token = localStorage.getItem('token')
        const password = typeof window !== 'undefined' ? sessionStorage.getItem('lastLoginPassword') : null
        if (!token || !password) return
        const res = await fetch('/api/auth/check-tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ password })
        })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && typeof data.hasLiveTracking === 'boolean') {
          // Always update with the explicit boolean value from the API
          // This ensures we use the fresh check result, not stale token data
          setUser((prev: any) => prev ? { ...prev, hasLiveTracking: data.hasLiveTracking } : prev)
        } else if (!cancelled) {
          // If the response doesn't have hasLiveTracking, set it to false
          setUser((prev: any) => prev ? { ...prev, hasLiveTracking: false } : prev)
        }
      } catch {}
    }

    // Run immediately and then every 5 minutes
    checkNow()
    const interval = setInterval(checkNow, 5 * 60 * 1000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [user])

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
