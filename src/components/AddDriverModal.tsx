'use client'

import { useState, useEffect } from 'react'
import { X, User, Phone, CreditCard, MapPin, Calendar, Car, Building2 } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface AddDriverModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (driverData: any) => void
}

interface Cluster {
  id: string
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

interface Subsidiary {
  id: string
  name: string
  contact_no: string
  address: string
  location: string | null
  contact_person: string
  contact_person_no: string
  cluster_id: string | null
  description: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export default function AddDriverModal({ isOpen, onClose, onAdd }: AddDriverModalProps) {
  const { themeMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    license_number: '',
    license_category: '',
    license_expire: '',
    date_issued: '',
    dob: '',
    region: '',
    district: '',
    status: 'Active',
    vehicle_id: '',
    cluster: '',
    subsidiary: ''
  })

  const [clusters, setClusters] = useState<Cluster[]>([])
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Fetch clusters on component mount
  useEffect(() => {
    if (isOpen) {
      fetchClusters()
    }
  }, [isOpen])

  // Reset form data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        phone: '',
        license_number: '',
        license_category: '',
        license_expire: '',
        date_issued: '',
        dob: '',
        region: '',
        district: '',
        status: 'Active',
        vehicle_id: '',
        cluster: '',
        subsidiary: ''
      })
    }
  }, [isOpen])

  const fetchClusters = async () => {
    try {
      const response = await fetch('/api/clusters', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setClusters(data)
      } else {
        console.error('Failed to fetch clusters')
      }
    } catch (error) {
      console.error('Error fetching clusters:', error)
    }
  }

  const fetchSubsidiaries = async (clusterId: string) => {
    if (!clusterId) {
      setSubsidiaries([])
      return
    }

    try {
      setFetchLoading(true)
      const response = await fetch(`/api/subsidiaries?cluster_id=${clusterId}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setSubsidiaries(data)
        setFormData(prev => ({ ...prev, subsidiary: '' }))
      } else {
        console.error('Failed to fetch subsidiaries')
      }
    } catch (error) {
      console.error('Error fetching subsidiaries:', error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Handle cascade updates
    if (field === 'cluster') {
      fetchSubsidiaries(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onAdd(formData)
      setFormData({
        name: '',
        phone: '',
        license_number: '',
        license_category: '',
        license_expire: '',
        date_issued: '',
        dob: '',
        region: '',
        district: '',
        status: 'Active',
        vehicle_id: '',
        cluster: '',
        subsidiary: ''
      })
      setSubsidiaries([])
      onClose()
    } catch (error) {
      console.error('Error adding driver:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <div
        className={`relative ${themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-6 rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-3xl">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Add New Driver</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enter driver information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-3xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Driver Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Driver Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter driver name"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* License Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                License Number *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter license number"
                />
              </div>
            </div>

            {/* License Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                License Category *
              </label>
              <select
                name="license_category"
                value={formData.license_category}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select category</option>
                <option value="A">A - Motorcycles</option>
                <option value="B">B - Light Vehicles</option>
                <option value="C">C - Medium Vehicles</option>
                <option value="D">D - Heavy Vehicles</option>
                <option value="E">E - Heavy Articulated</option>
              </select>
            </div>

            {/* License Issue Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                License Issue Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="date_issued"
                  value={formData.date_issued}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* License Expiry */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                License Expiry *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="license_expire"
                  value={formData.license_expire}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Region */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Region *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter region"
                />
              </div>
            </div>

            {/* District */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                District *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter district"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Cluster */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cluster *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="cluster"
                  value={formData.cluster}
                  onChange={(e) => handleInputChange('cluster', e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">-- Select Cluster --</option>
                  {clusters.map(cluster => (
                    <option key={cluster.id} value={cluster.id}>
                      {cluster.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subsidiary */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Subsidiary *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="subsidiary"
                  value={formData.subsidiary}
                  onChange={(e) => handleInputChange('subsidiary', e.target.value)}
                  disabled={!formData.cluster || fetchLoading}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${!formData.cluster ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">-- Select Subsidiary --</option>
                  {subsidiaries.map(subsidiary => (
                    <option key={subsidiary.id} value={subsidiary.id}>
                      {subsidiary.name}
                    </option>
                  ))}
                </select>
                {fetchLoading && (
                  <p className="text-blue-500 text-xs mt-1">Loading subsidiaries...</p>
                )}
              </div>
            </div>

            {/* Vehicle ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle ID (Optional)
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter vehicle ID"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-3xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'ADDING...' : 'ADD DRIVER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
