'use client'

import { useState } from 'react'
import { X, User, Mail, Phone, Shield, MapPin, Calendar, FileText, Key, Printer, Download, Edit, Plus } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface User {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string
  region: string | null
  district: string | null
  license_number: string | null
  license_category: string | null
  license_expiry: string | null
  specialization: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

interface ViewUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onEdit?: (user: User) => void
}

export default function ViewUserModal({ isOpen, onClose, user, onEdit }: ViewUserModalProps) {
  const { themeMode } = useTheme()

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>User Details - ${user?.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1f2937; margin-bottom: 20px; }
              .section { margin-bottom: 30px; }
              .section h2 { color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
              .field { margin-bottom: 10px; }
              .field-label { font-weight: bold; color: #6b7280; }
              .field-value { color: #1f2937; margin-left: 10px; }
              .status-active { color: #059669; font-weight: bold; }
              .status-inactive { color: #dc2626; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>User Details</h1>
            <div class="section">
              <h2>Personal Information</h2>
              <div class="field"><span class="field-label">Name:</span><span class="field-value">${user?.name || 'N/A'}</span></div>
              <div class="field"><span class="field-label">Email:</span><span class="field-value">${user?.email || 'N/A'}</span></div>
              <div class="field"><span class="field-label">Phone:</span><span class="field-value">${user?.phone || 'N/A'}</span></div>
            </div>
            <div class="section">
              <h2>Account Information</h2>
              <div class="field"><span class="field-label">Role:</span><span class="field-value">${user?.role || 'N/A'}</span></div>
              <div class="field"><span class="field-label">Status:</span><span class="field-value ${user?.is_active ? 'status-active' : 'status-inactive'}">${user?.is_active ? 'Active' : 'Inactive'}</span></div>
            </div>
            <div class="section">
              <h2>Location Information</h2>
              <div class="field"><span class="field-label">Region:</span><span class="field-value">${user?.region || 'N/A'}</span></div>
              <div class="field"><span class="field-label">District:</span><span class="field-value">${user?.district || 'N/A'}</span></div>
              <div class="field"><span class="field-label">Specialization:</span><span class="field-value">${user?.specialization || 'N/A'}</span></div>
            </div>
            <div class="section">
              <h2>License Information</h2>
              <div class="field"><span class="field-label">License Number:</span><span class="field-value">${user?.license_number || 'N/A'}</span></div>
              <div class="field"><span class="field-label">License Category:</span><span class="field-value">${user?.license_category || 'N/A'}</span></div>
              <div class="field"><span class="field-label">License Expiry:</span><span class="field-value">${user?.license_expiry ? new Date(user.license_expiry).toLocaleDateString() : 'N/A'}</span></div>
            </div>
            <div class="section">
              <h2>System Information</h2>
              <div class="field"><span class="field-label">Created:</span><span class="field-value">${user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span></div>
              <div class="field"><span class="field-label">Last Updated:</span><span class="field-value">${user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</span></div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownloadPDF = () => {
    const content = `
      User Details Report
      Generated on: ${new Date().toLocaleDateString()}
      
      Personal Information:
      - Name: ${user?.name || 'N/A'}
      - Email: ${user?.email || 'N/A'}
      - Phone: ${user?.phone || 'N/A'}
      
      Account Information:
      - Role: ${user?.role || 'N/A'}
      - Status: ${user?.is_active ? 'Active' : 'Inactive'}
      
      Location Information:
      - Region: ${user?.region || 'N/A'}
      - District: ${user?.district || 'N/A'}
      - Specialization: ${user?.specialization || 'N/A'}
      
      License Information:
      - License Number: ${user?.license_number || 'N/A'}
      - License Category: ${user?.license_category || 'N/A'}
      - License Expiry: ${user?.license_expiry ? new Date(user.license_expiry).toLocaleDateString() : 'N/A'}
      
      System Information:
      - Created: ${user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
      - Last Updated: ${user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
    `
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `user-${user?.name?.replace(/\s+/g, '-').toLowerCase() || 'details'}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!isOpen || !user) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`relative ${themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-900/20 dark:to-orange-900/20 p-6 rounded-t-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* User Profile Header */}
          <div className="flex items-center gap-4">
            {/* Profile Picture */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || 'Unknown User'}</h2>
              <p className="text-gray-600 dark:text-gray-300">{user.email || 'No email provided'}</p>
            </div>
            
            {/* Edit Button */}
            <button 
              onClick={() => onEdit?.(user)}
              className="px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* User Information Form */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user.name || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Your First Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value="Not specified"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
                      placeholder="Your First Name"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value="English"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
                      placeholder="Your First Name"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nick Name
                  </label>
                  <input
                    type="text"
                    value={user.name?.split(' ')[0] || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Your First Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={user.region || 'Not specified'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
                      placeholder="Your First Name"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Zone
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value="UTC+0"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
                      placeholder="Your First Name"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Address Management */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">My Email Address</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{user.email || 'No email provided'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.created_at ? `${Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))} months ago` : 'Unknown'}
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-3xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Plus className="w-4 h-4" />
                Add Email Address
              </button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Account Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Role:</span>
                  <span className="text-gray-900 dark:text-white capitalize">{user.role || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                  <span className="text-gray-900 dark:text-white">{user.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Location Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Region:</span>
                  <span className="text-gray-900 dark:text-white">{user.region || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">District:</span>
                  <span className="text-gray-900 dark:text-white">{user.district || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Specialization:</span>
                  <span className="text-gray-900 dark:text-white">{user.specialization || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Printer className="w-4 h-4" />
            PRINT
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}
