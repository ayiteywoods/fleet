'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { formatDateTime } from '@/lib/dateUtils'
import { 
  BellIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function RemindersPage() {
  const { themeMode } = useTheme()
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'Driver License' | 'Insurance' | 'Roadworthy'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/reminders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter reminders based on search and type
  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reminder.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || reminder.type === filterType
    return matchesSearch && matchesType
  })

  // Pagination
  const totalPages = Math.ceil(filteredReminders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedReminders = filteredReminders.slice(startIndex, startIndex + itemsPerPage)

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      default:
        return 'text-green-500'
    }
  }

  const getUrgencyBg = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      default:
        return 'bg-green-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Driver License':
        return <UserIcon className="w-5 h-5" />
      case 'Insurance':
        return <ShieldCheckIcon className="w-5 h-5" />
      case 'Roadworthy':
        return <TruckIcon className="w-5 h-5" />
      default:
        return <BellIcon className="w-5 h-5" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Driver License':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'Insurance':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'Roadworthy':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Reminders
          </h1>
          <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Track and manage upcoming expiries for licenses, insurance, and roadworthy certificates
          </p>
        </div>

        {/* Filters */}
        <div className={`p-6 rounded-2xl mb-6 ${
          themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reminders..."
                className={`w-full px-4 py-2 rounded-lg border text-sm ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className={`w-full px-4 py-2 rounded-lg border text-sm ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Types</option>
                <option value="Driver License">Driver License</option>
                <option value="Insurance">Insurance</option>
                <option value="Roadworthy">Roadworthy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-6 rounded-2xl ${
            themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Reminders
                </p>
                <p className={`text-2xl font-bold mt-1 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {reminders.length}
                </p>
              </div>
              <BellIcon className={`w-10 h-10 ${themeMode === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${
            themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  High Priority
                </p>
                <p className={`text-2xl font-bold mt-1 text-red-500`}>
                  {reminders.filter(r => r.urgency === 'high').length}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${
            themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Medium Priority
                </p>
                <p className={`text-2xl font-bold mt-1 text-yellow-500`}>
                  {reminders.filter(r => r.urgency === 'medium').length}
                </p>
              </div>
              <ClockIcon className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${
            themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Low Priority
                </p>
                <p className={`text-2xl font-bold mt-1 text-green-500`}>
                  {reminders.filter(r => r.urgency === 'low').length}
                </p>
              </div>
              <CheckCircleIcon className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>

        {/* Reminders List */}
        <div className={`p-6 rounded-2xl ${
          themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
        }`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : paginatedReminders.length > 0 ? (
            <>
              <div className="space-y-4 mb-6">
                {paginatedReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          themeMode === 'dark' ? 'bg-gray-600' : 'bg-white'
                        }`}>
                          {getTypeIcon(reminder.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-lg font-semibold ${
                              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {reminder.title}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(reminder.type)}`}>
                              {reminder.type}
                            </span>
                          </div>
                          <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {reminder.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <p className={`text-sm font-medium ${getUrgencyColor(reminder.urgency)}`}>
                              {reminder.daysUntilExpiry === 0 ? 'Expires today' : 
                               reminder.daysUntilExpiry === 1 ? 'Expires tomorrow' : 
                               `${reminder.daysUntilExpiry} days left`}
                            </p>
                            <p className={`text-xs ${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              Expiry: {formatDateTime(new Date(reminder.expiryDate))}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getUrgencyBg(reminder.urgency)}`}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReminders.length)} of {filteredReminders.length} reminders
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Previous
                    </button>
                    <span className={`px-4 py-2 text-sm ${
                      themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BellIcon className={`w-16 h-16 mx-auto mb-4 ${
                themeMode === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No reminders found
              </h3>
              <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your filters to see more results'
                  : 'All items are up to date. No reminders at this time.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

