'use client'

import { useState } from 'react'
import { Settings, Palette, Sun, Moon, X } from 'lucide-react'
import { useTheme, ThemeColor, ThemeMode } from '@/contexts/ThemeContext'

export default function FloatingSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const { themeColor, themeMode, setThemeColor, setThemeMode, toggleThemeMode } = useTheme()

  const themeColors = [
    { name: 'Blue', value: 'blue' as ThemeColor, color: 'bg-blue-600' },
    { name: 'Gray', value: 'gray' as ThemeColor, color: 'bg-gray-600' },
    { name: 'Gold', value: 'gold' as ThemeColor, color: 'bg-yellow-600' }
  ]

  const getThemeClasses = () => {
    const baseClasses = 'bg-white border border-gray-200 shadow-lg rounded-3xl'
    const darkClasses = themeMode === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : ''
    return `${baseClasses} ${darkClasses}`
  }

  const getButtonClasses = () => {
    const baseClasses = 'fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50'
    const colorClasses = {
      blue: 'bg-blue-600 hover:bg-blue-700 text-white',
      gray: 'bg-gray-600 hover:bg-gray-700 text-white',
      gold: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    }
    return `${baseClasses} ${colorClasses[themeColor]}`
  }

  const getPanelClasses = () => {
    const baseClasses = 'fixed bottom-20 right-6 w-80 p-6 z-50 transition-all duration-300'
    const darkClasses = themeMode === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
    return `${baseClasses} ${darkClasses} border shadow-xl rounded-3xl`
  }

  return (
    <>
      {/* Floating Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={getButtonClasses()}
        aria-label="Open settings"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}>
          <div className={getPanelClasses()} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Color Section */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <Palette className="w-5 h-5 mr-2" />
                <h4 className="font-medium">Theme Color</h4>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {themeColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setThemeColor(color.value)}
                    className={`p-3 rounded-3xl border-2 transition-all ${
                      themeColor === color.value
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${themeMode === 'dark' ? 'border-gray-600' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${color.color} mx-auto mb-2`}></div>
                    <span className="text-sm font-medium">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Mode Section */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                {themeMode === 'light' ? (
                  <Sun className="w-5 h-5 mr-2" />
                ) : (
                  <Moon className="w-5 h-5 mr-2" />
                )}
                <h4 className="font-medium">Theme Mode</h4>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setThemeMode('light')}
                  className={`flex-1 p-3 rounded-3xl border-2 transition-all ${
                    themeMode === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Sun className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setThemeMode('dark')}
                  className={`flex-1 p-3 rounded-3xl border-2 transition-all ${
                    themeMode === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Moon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
              </div>
            </div>

            {/* Quick Toggle */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleThemeMode}
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-3xl transition-colors"
              >
                <div className="flex items-center justify-center">
                  {themeMode === 'light' ? (
                    <Moon className="w-5 h-5 mr-2" />
                  ) : (
                    <Sun className="w-5 h-5 mr-2" />
                  )}
                  <span className="font-medium">
                    Switch to {themeMode === 'light' ? 'Dark' : 'Light'} Mode
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
