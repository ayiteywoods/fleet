'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type ThemeColor = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'pink' | 'indigo' | 'teal' | 'gray' | 'gold'
export type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  themeColor: ThemeColor
  themeMode: ThemeMode
  setThemeColor: (color: ThemeColor) => void
  setThemeMode: (mode: ThemeMode) => void
  toggleThemeMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeColor, setThemeColorState] = useState<ThemeColor>('blue')
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor') as ThemeColor
    const savedMode = localStorage.getItem('themeMode') as ThemeMode
    
    if (savedColor && ['blue', 'green', 'purple', 'red', 'orange', 'pink', 'indigo', 'teal', 'gray', 'gold'].includes(savedColor)) {
      setThemeColorState(savedColor)
    }
    
    if (savedMode && ['light', 'dark'].includes(savedMode)) {
      setThemeModeState(savedMode)
      // Apply dark mode class to document
      if (savedMode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('themeColor', themeColor)
  }, [themeColor])

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode)
  }, [themeMode])

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color)
  }

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode)
  }

  const toggleThemeMode = () => {
    setThemeModeState(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light'
      // Apply dark mode class to document
      if (newMode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return newMode
    })
  }

  const value: ThemeContextType = {
    themeColor,
    themeMode,
    setThemeColor,
    setThemeMode,
    toggleThemeMode
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
