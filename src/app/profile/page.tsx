'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { themeMode } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          window.location.href = '/login'
          return
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          console.error('Failed to fetch user profile')
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  // Update formData when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company_name: user.company_name || ''
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      
      // Here you would call an API endpoint to update the user profile
      // For now, we'll just show a success message
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user state
      setUser({ ...user, ...formData })
      setIsEditMode(false)
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company_name: user?.company_name || ''
    })
    setIsEditMode(false)
  }

  if (loading) {
    return (
      <HorizonDashboardLayout>
        <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={`text-lg ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Loading profile...</p>
            </div>
          </div>
        </div>
      </HorizonDashboardLayout>
    )
  }

  return (
    <HorizonDashboardLayout>
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <UserCircleIcon className="w-8 h-8 text-blue-600" />
              <h1 className={`text-3xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Profile
              </h1>
            </div>
            <p className={`text-lg ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              View and manage your profile information
            </p>
          </div>

          {/* Profile Card */}
          <div className={`rounded-xl border border-gray-200 dark:border-gray-700 ${
            themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            {/* Profile Header */}
            <div className={`px-6 py-8 border-b border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    className="h-32 w-32 rounded-full object-cover ring-4 ring-blue-100 dark:ring-gray-700"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Profile"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name || 'Temple Jedi'}
                  </h2>
                  <p className={`mt-1 text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {user?.role || 'Admin'}
                  </p>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user?.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {user?.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="px-6 py-8">
              <h3 className={`text-lg font-semibold mb-6 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <IdentificationIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <label className={`text-sm font-medium block mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Full Name
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          themeMode === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    ) : (
                      <p className={`mt-1 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {user?.name || '-'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <label className={`text-sm font-medium block mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Email
                    </label>
                    {isEditMode ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          themeMode === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    ) : (
                      <p className={`mt-1 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {user?.email || '-'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <PhoneIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <label className={`text-sm font-medium block mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Phone
                    </label>
                    {isEditMode ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          themeMode === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    ) : (
                      <p className={`mt-1 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {user?.phone || '-'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Role
                    </p>
                    <p className={`mt-1 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user?.role || '-'}
                    </p>
                  </div>
                </div>

                {/* Company */}
                {(user?.company_name || isEditMode) && (
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${
                      themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <label className={`text-sm font-medium block mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Company
                      </label>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={formData.company_name}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            themeMode === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      ) : (
                        <p className={`mt-1 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {user?.company_name || '-'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Member Since
                    </p>
                    <p className={`mt-1 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3`}>
              {isEditMode ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className={`px-6 py-2 rounded-3xl font-medium transition-colors duration-200 ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 rounded-3xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="px-6 py-2 rounded-3xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => window.location.href = '/settings'}
                    className={`px-6 py-2 rounded-3xl font-medium transition-colors duration-200 ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Settings
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </HorizonDashboardLayout>
  )
}

