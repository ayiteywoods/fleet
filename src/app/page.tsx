'use client'

import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'
import FleetDashboard from '@/components/FleetDashboard'
import { useTheme } from '@/contexts/ThemeContext'

export default function Home() {
  const { themeMode } = useTheme()
  
  return (
    <HorizonDashboardLayout>
      <div className={`space-y-6 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">Dashboard Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time insights into your fleet operations</p>
          </div>
          <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>
        
        <FleetDashboard />
      </div>
    </HorizonDashboardLayout>
  )
}
