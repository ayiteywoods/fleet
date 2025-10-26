'use client'

import { useState } from 'react'
import { 
  Cog6ToothIcon, 
  SunIcon, 
  MoonIcon, 
  SwatchIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import { getBrandColor } from '@/lib/themeUtils'

export default function FloatingSettings() {
  const { themeMode, setThemeMode, themeColor, setThemeColor } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  // Helper function to get theme-based classes
  const getThemeClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      green: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      purple: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      red: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      orange: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
      pink: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300',
      indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
      teal: 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300',
      gray: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300',
      gold: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
    }
    return colorMap[color] || colorMap.blue
  }

  const themeColors = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { name: 'Teal', value: 'teal', class: 'bg-teal-500' }
  ]

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark')
  }

  const handleColorChange = (color: string) => {
    setThemeColor(color as any)
  }

  return (
    <>
      {/* Floating Settings Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:scale-105"
        >
          <Cog6ToothIcon className={`w-6 h-6 ${getBrandColor(themeColor)}`} />
        </button>
      </div>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Settings
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Theme Mode Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme Mode
            </h4>
            <div className="flex space-x-3">
              <button
                onClick={() => setThemeMode('light')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  themeMode === 'light'
                    ? getThemeClasses(themeColor)
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <SunIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  themeMode === 'dark'
                    ? getThemeClasses(themeColor)
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <MoonIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Dark</span>
              </button>
            </div>
          </div>

          {/* Theme Color Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme Color
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {themeColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={`w-12 h-12 rounded-lg transition-all duration-200 hover:scale-110 ${
                    themeColor === color.value
                      ? 'ring-2 ring-gray-400 dark:ring-gray-500 ring-offset-2 dark:ring-offset-gray-800'
                      : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                  }`}
                  style={{ backgroundColor: color.value === 'blue' ? '#3b82f6' : 
                                          color.value === 'green' ? '#10b981' :
                                          color.value === 'purple' ? '#8b5cf6' :
                                          color.value === 'red' ? '#ef4444' :
                                          color.value === 'orange' ? '#f97316' :
                                          color.value === 'pink' ? '#ec4899' :
                                          color.value === 'indigo' ? '#6366f1' :
                                          color.value === 'teal' ? '#14b8a6' : '#3b82f6'
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Actions
            </h4>
            <div className="space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {themeMode === 'dark' ? (
                  <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Toggle Theme
                </span>
              </button>
              
              <button
                onClick={() => {
                  // Reset to default theme
                  setThemeMode('light')
                  setThemeColor('blue')
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <SwatchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reset to Default
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}