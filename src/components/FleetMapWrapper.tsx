'use client'

import dynamic from 'next/dynamic'
import { useTheme } from '@/contexts/ThemeContext'

// Dynamically import FleetMap to avoid SSR issues with Leaflet
const FleetMap = dynamic(() => import('./FleetMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    </div>
  )
})

export default function FleetMapWrapper() {
  const { themeMode } = useTheme()

  return (
    <div className={`p-6 rounded-2xl ${
      themeMode === 'dark' 
        ? 'bg-navy-800 border border-navy-700' 
        : 'bg-white border border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${
          themeMode === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Fleet Map
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className={`text-sm ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Active
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className={`text-sm ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Inactive
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className={`text-sm ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Maintenance
            </span>
          </div>
        </div>
      </div>
      
      <div className="h-96 rounded-xl overflow-hidden">
        <FleetMap />
      </div>
    </div>
  )
}
