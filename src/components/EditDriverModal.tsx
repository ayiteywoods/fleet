'use client'

import { useState, useEffect } from 'react'
import { X, User, Phone, CreditCard, MapPin, Calendar, Car, Building2 } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface EditDriverModalProps {
  isOpen: boolean
  onClose: () => void
  driver: any
  onSave: (driverData: any) => void
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

export default function EditDriverModal({ isOpen, onClose, driver, onSave }: EditDriverModalProps) {
  const { themeMode } = useTheme()
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
  const [loading, setLoading] = useState(false)
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)

  // Fetch clusters on component mount
  useEffect(() => {
    if (isOpen) {
      fetchClusters()
    }
  }, [isOpen])

  const fetchClusters = async () => {
    try {
      const response = await fetch('/api/clusters')
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
      const response = await fetch(`/api/subsidiaries?cluster_id=${clusterId}`)
      if (response.ok) {
        const data = await response.json()
        setSubsidiaries(data)
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

  useEffect(() => {
    if (driver && isOpen) {
      setFormData({
        name: driver.name || '',
        phone: driver.phone || '',
        license_number: driver.license_number || '',
        license_category: driver.license_category || '',
        license_expire: driver.license_expire || '',
        date_issued: driver.date_issued || '',
        dob: driver.dob || '',
        region: driver.region || '',
        district: driver.district || '',
        status: driver.status || 'Active',
        vehicle_id: driver.vehicle_id?.toString() || '',
        cluster: '', // Will be set after fetching clusters
        subsidiary: driver.spcode?.toString() || ''
      })
      
      // If driver has spcode, we need to find the cluster and fetch subsidiaries
      if (driver.spcode) {
        // We'll need to fetch subsidiaries and find the cluster
        // For now, just set the subsidiary
        setFormData(prev => ({ ...prev, subsidiary: driver.spcode?.toString() || '' }))
      }
    }
  }, [driver, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave({
        ...formData,
        id: driver.id
      })
      onClose()
    } catch (error) {
      console.error('Error updating driver:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !driver) return null

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`relative ${themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-6 rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Edit Driver</h2>
              <p className="text-gray-600 dark:text-gray-400">Update driver information</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Personal Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name *
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
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div>
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
              </div>
            </div>

            {/* License Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                License Information
              </h3>
              
              <div className="space-y-4">
                <div>
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

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    License Category *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      name="license_category"
                      value={formData.license_category}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                      <option value="E">E - Articulated Vehicles</option>
                    </select>
                  </div>
                </div>

                <div>
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

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    License Expiry Date *
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

                <div>
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
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Location Information
              </h3>
              
              <div className="space-y-4">
                <div>
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

                <div>
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
              </div>
            </div>

            {/* Status & Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Status & Assignment
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                </div>

                <div>
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

                <div>
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

                <div>
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
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-3xl hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
