'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TruckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

export default function NotificationsPage() {
  const { themeMode } = useTheme()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Load read notifications from localStorage
  const getReadNotifications = (): Set<string> => {
    try {
      const read = localStorage.getItem('readNotifications')
      return read ? new Set(JSON.parse(read)) : new Set()
    } catch {
      return new Set()
    }
  }

  // Save read notifications to localStorage
  const saveReadNotifications = (readIds: Set<string>) => {
    localStorage.setItem('readNotifications', JSON.stringify(Array.from(readIds)))
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Load read state from localStorage
        const readIds = getReadNotifications()
        const notificationsWithReadState = data.map((n: any) => ({
          ...n,
          read: readIds.has(n.id)
        }))
        setNotifications(notificationsWithReadState)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token')
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds: [notificationId] })
      })

      // Save to localStorage
      const readIds = getReadNotifications()
      readIds.add(notificationId)
      saveReadNotifications(readIds)

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      
      if (unreadIds.length === 0) return
      
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds: unreadIds })
      })

      // Save all to localStorage
      const readIds = getReadNotifications()
      unreadIds.forEach(id => readIds.add(id))
      saveReadNotifications(readIds)

      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
      case 'repair':
        return <WrenchScrewdriverIcon className="w-5 h-5 text-yellow-500" />
      case 'insurance':
      case 'roadworthy':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
      case 'alert':
      case 'speed':
      case 'engine':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'vehicle':
        return <TruckIcon className="w-5 h-5 text-blue-500" />
      case 'system':
        return <InformationCircleIcon className="w-5 h-5 text-purple-500" />
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  // Pagination logic
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex)

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  return (
    <HorizonDashboardLayout>
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BellIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className={`text-3xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Notifications
                </h1>
                <p className={`text-lg ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-3xl font-medium transition-colors duration-200 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Mark All as Read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className={`rounded-xl border border-gray-200 dark:border-gray-700 ${
            themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-sm mb-6`}>
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === 'unread'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === 'read'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className={`text-lg ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Loading notifications...</p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className={`rounded-xl border border-gray-200 dark:border-gray-700 ${
              themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
            } p-12 text-center`}>
              <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className={`text-lg ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No notifications
              </p>
              <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            <>
            <div className={`rounded-xl border border-gray-200 dark:border-gray-700 ${
              themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-sm overflow-hidden`}>
              {paginatedNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="flex-shrink-0 ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      {notification.address && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          📍 {notification.address}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`mt-6 px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${
                themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
              } flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
                <div className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} of {filteredNotifications.length} notifications
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-2xl text-sm ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Previous
                  </button>
                  <span className={`px-3 py-1 text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`px-3 py-1 rounded-2xl text-sm ${
                      currentPage >= totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </HorizonDashboardLayout>
  )
}

