'use client'

import { ExclamationTriangleIcon, WifiIcon, KeyIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'

interface DatabaseErrorDisplayProps {
  error: string
  onRetry?: () => void
}

export default function DatabaseErrorDisplay({ error, onRetry }: DatabaseErrorDisplayProps) {
  const { themeMode } = useTheme()

  const getErrorIcon = (errorMessage: string) => {
    if (errorMessage.includes('authentication') || errorMessage.includes('credentials')) {
      return <KeyIcon className="w-8 h-8 text-red-500" />
    }
    if (errorMessage.includes('connection') || errorMessage.includes('network')) {
      return <WifiIcon className="w-8 h-8 text-orange-500" />
    }
    return <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
  }

  const getErrorTitle = (errorMessage: string) => {
    if (errorMessage.includes('authentication') || errorMessage.includes('credentials')) {
      return 'Database Authentication Failed'
    }
    if (errorMessage.includes('connection') || errorMessage.includes('network')) {
      return 'Connection Error'
    }
    return 'Database Error'
  }

  const getErrorDescription = (errorMessage: string) => {
    if (errorMessage.includes('authentication') || errorMessage.includes('credentials')) {
      return 'The database credentials are invalid or have been changed. Please contact your system administrator to verify the database connection settings.'
    }
    if (errorMessage.includes('connection') || errorMessage.includes('network')) {
      return 'Unable to connect to the database server. Please check your network connection and ensure the database server is running.'
    }
    return 'An unexpected error occurred while accessing the database. Please try again later or contact support if the issue persists.'
  }

  return (
    <div className={`p-6 rounded-2xl border-2 border-dashed ${
      themeMode === 'dark' 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-gray-50 border-gray-300'
    }`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getErrorIcon(error)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold mb-2 ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {getErrorTitle(error)}
          </h3>
          
          <p className={`text-sm mb-4 ${
            themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {getErrorDescription(error)}
          </p>
          
          <div className={`p-3 rounded-lg ${
            themeMode === 'dark' 
              ? 'bg-gray-700 border border-gray-600' 
              : 'bg-white border border-gray-200'
          }`}>
            <p className={`text-xs font-mono ${
              themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Error: {error}
            </p>
          </div>
          
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
