'use client'

import dynamic from 'next/dynamic'
import { useTheme } from '@/contexts/ThemeContext'
import { useState } from 'react'
import SimpleFleetMap from './SimpleFleetMap'
import DatabaseErrorDisplay from './DatabaseErrorDisplay'

// Dynamically import GoogleFleetMap to avoid SSR issues with Google Maps
const GoogleFleetMap = dynamic(() => import('./GoogleFleetMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    </div>
  )
})

export default function GoogleFleetMapWrapper() {
  const { themeMode } = useTheme()
  const [useSimpleView, setUseSimpleView] = useState(false)

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
          Alerts Map
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setUseSimpleView(!useSimpleView)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              useSimpleView 
                ? 'bg-blue-600 text-white' 
                : themeMode === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {useSimpleView ? 'Switch to Map' : 'Simple View'}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {useSimpleView ? <SimpleFleetMap /> : <GoogleFleetMap />}
    </div>
  )
}
