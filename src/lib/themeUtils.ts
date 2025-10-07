import { ThemeColor, ThemeMode } from '@/contexts/ThemeContext'

export const getThemeClasses = (themeColor: ThemeColor, themeMode: ThemeMode) => {
  const colorClasses = {
    blue: {
      primary: 'bg-blue-600 hover:bg-blue-700',
      secondary: 'bg-blue-100 text-blue-800',
      accent: 'text-blue-600',
      border: 'border-blue-200',
      ring: 'ring-blue-200'
    },
    gray: {
      primary: 'bg-gray-600 hover:bg-gray-700',
      secondary: 'bg-gray-100 text-gray-800',
      accent: 'text-gray-600',
      border: 'border-gray-200',
      ring: 'ring-gray-200'
    },
    gold: {
      primary: 'bg-yellow-600 hover:bg-yellow-700',
      secondary: 'bg-yellow-100 text-yellow-800',
      accent: 'text-yellow-600',
      border: 'border-yellow-200',
      ring: 'ring-yellow-200'
    }
  }

  const modeClasses = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200',
      sidebar: 'bg-gray-100'
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-gray-700',
      sidebar: 'bg-gray-800'
    }
  }

  return {
    color: colorClasses[themeColor],
    mode: modeClasses[themeMode]
  }
}

export const getIconColor = (themeColor: ThemeColor) => {
  return 'text-white'
}

export const getButtonColor = (themeColor: ThemeColor) => {
  const buttonColors = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    gray: 'bg-gray-600 hover:bg-gray-700 text-white',
    gold: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  }
  return buttonColors[themeColor]
}
