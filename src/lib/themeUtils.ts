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
    green: {
      primary: 'bg-green-600 hover:bg-green-700',
      secondary: 'bg-green-100 text-green-800',
      accent: 'text-green-600',
      border: 'border-green-200',
      ring: 'ring-green-200'
    },
    purple: {
      primary: 'bg-purple-600 hover:bg-purple-700',
      secondary: 'bg-purple-100 text-purple-800',
      accent: 'text-purple-600',
      border: 'border-purple-200',
      ring: 'ring-purple-200'
    },
    red: {
      primary: 'bg-red-600 hover:bg-red-700',
      secondary: 'bg-red-100 text-red-800',
      accent: 'text-red-600',
      border: 'border-red-200',
      ring: 'ring-red-200'
    },
    orange: {
      primary: 'bg-orange-600 hover:bg-orange-700',
      secondary: 'bg-orange-100 text-orange-800',
      accent: 'text-orange-600',
      border: 'border-orange-200',
      ring: 'ring-orange-200'
    },
    pink: {
      primary: 'bg-pink-600 hover:bg-pink-700',
      secondary: 'bg-pink-100 text-pink-800',
      accent: 'text-pink-600',
      border: 'border-pink-200',
      ring: 'ring-pink-200'
    },
    indigo: {
      primary: 'bg-indigo-600 hover:bg-indigo-700',
      secondary: 'bg-indigo-100 text-indigo-800',
      accent: 'text-indigo-600',
      border: 'border-indigo-200',
      ring: 'ring-indigo-200'
    },
    teal: {
      primary: 'bg-teal-600 hover:bg-teal-700',
      secondary: 'bg-teal-100 text-teal-800',
      accent: 'text-teal-600',
      border: 'border-teal-200',
      ring: 'ring-teal-200'
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
    green: 'bg-green-600 hover:bg-green-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white',
    pink: 'bg-pink-600 hover:bg-pink-700 text-white',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    teal: 'bg-teal-600 hover:bg-teal-700 text-white',
    gray: 'bg-gray-600 hover:bg-gray-700 text-white',
    gold: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  }
  return buttonColors[themeColor]
}

export const getBrandColor = (themeColor: ThemeColor) => {
  const brandColors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    red: 'text-red-500',
    orange: 'text-orange-500',
    pink: 'text-pink-500',
    indigo: 'text-indigo-500',
    teal: 'text-teal-500',
    gray: 'text-gray-500',
    gold: 'text-yellow-500'
  }
  return brandColors[themeColor]
}

export const getBrandBgColor = (themeColor: ThemeColor) => {
  const brandBgColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500',
    gray: 'bg-gray-500',
    gold: 'bg-yellow-500'
  }
  return brandBgColors[themeColor]
}
