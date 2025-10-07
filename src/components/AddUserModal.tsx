'use client'

import { useState } from 'react'
import { X, User, Mail, Phone, Shield, MapPin, Calendar, FileText, Key } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserAdded: (userData: any) => void
}

export default function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const { themeMode } = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    region: '',
    district: '',
    license_number: '',
    license_category: '',
    license_expiry: '',
    specialization: '',
    password: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        onUserAdded(result.user)
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: 'user',
          region: '',
          district: '',
          license_number: '',
          license_category: '',
          license_expiry: '',
          specialization: '',
          password: '',
          is_active: true
        })
        onClose()
      } else {
        setErrors({ submit: result.error || 'Failed to create user' })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`relative ${themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Add New User</h2>
          <p className="text-gray-600 dark:text-gray-400">Fill in the details to create a new user account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors.role ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="driver">Driver</option>
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Enter password"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm font-medium">
                  Active User
                </label>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="region" className="block text-sm font-medium mb-1">
                  Region
                </label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Enter region"
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium mb-1">
                  District
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Enter district"
                />
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Enter specialization"
                />
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              License Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="license_number" className="block text-sm font-medium mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  id="license_number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Enter license number"
                />
              </div>

              <div>
                <label htmlFor="license_category" className="block text-sm font-medium mb-1">
                  License Category
                </label>
                <input
                  type="text"
                  id="license_category"
                  name="license_category"
                  value={formData.license_category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Enter license category"
                />
              </div>

              <div>
                <label htmlFor="license_expiry" className="block text-sm font-medium mb-1">
                  License Expiry Date
                </label>
                <input
                  type="date"
                  id="license_expiry"
                  name="license_expiry"
                  value={formData.license_expiry}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'CREATING...' : 'CREATE USER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
