'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (vehicleData: any) => void
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

interface VehicleType {
  id: string
  type: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

interface VehicleMake {
  id: string
  name: string
  model: string | null
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
}

interface VehicleModel {
  id: string
  name: string
  description: string | null
  vehicle_make_id: string
  created_at: string | null
  updated_at: string | null
  created_by: number | null
  updated_by: number | null
  vehicle_make: {
    id: string
    name: string
  }
}

interface Driver {
  id: string
  name: string
  phone: string
  license_number: string | null
  license_category: string | null
  license_expiry: string | null
  region: string | null
  district: string | null
  spcode: number | null
  email: string
  role: string
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export default function AddVehicleModal({ isOpen, onClose, onSubmit }: AddVehicleModalProps) {
  const { themeMode } = useTheme()
  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleType: '',
    currentMileage: '',
    location: '',
    vin: '',
    make: '',
    model: '',
    year: '',
    color: '',
    purchaseDate: '',
    nextServiceKm: '',
    additionalNotes: '',
    insuranceDocument: null as File | null,
    cluster: '',
    subsidiary: '',
    assignedTo: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([])
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch all required data on component mount
  useEffect(() => {
    if (isOpen) {
      fetchClusters()
      fetchVehicleTypes()
      fetchVehicleMakes()
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

  const fetchVehicleTypes = async () => {
    try {
      const response = await fetch('/api/vehicle-types')
      if (response.ok) {
        const data = await response.json()
        setVehicleTypes(data)
      } else {
        console.error('Failed to fetch vehicle types')
      }
    } catch (error) {
      console.error('Error fetching vehicle types:', error)
    }
  }

  const fetchVehicleMakes = async () => {
    try {
      const response = await fetch('/api/vehicle-makes')
      if (response.ok) {
        const data = await response.json()
        setVehicleMakes(data)
      } else {
        console.error('Failed to fetch vehicle makes')
      }
    } catch (error) {
      console.error('Error fetching vehicle makes:', error)
    }
  }

  const fetchVehicleModels = async (vehicleMakeId: string) => {
    if (!vehicleMakeId) {
      setVehicleModels([])
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/vehicle-models?vehicle_make_id=${vehicleMakeId}`)
      if (response.ok) {
        const data = await response.json()
        setVehicleModels(data)
        setFormData(prev => ({ ...prev, model: '' }))
      } else {
        console.error('Failed to fetch vehicle models')
      }
    } catch (error) {
      console.error('Error fetching vehicle models:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubsidiaries = async (clusterId: string) => {
    if (!clusterId) {
      setSubsidiaries([])
      setDrivers([])
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/subsidiaries?cluster_id=${clusterId}`)
      if (response.ok) {
        const data = await response.json()
        setSubsidiaries(data)
        setDrivers([]) // Clear drivers when cluster changes
        setFormData(prev => ({ ...prev, subsidiary: '', assignedTo: '' }))
      } else {
        console.error('Failed to fetch subsidiaries')
      }
    } catch (error) {
      console.error('Error fetching subsidiaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDrivers = async (subsidiaryId: string) => {
    if (!subsidiaryId) {
      setDrivers([])
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/drivers?subsidiary_id=${subsidiaryId}`)
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
        setFormData(prev => ({ ...prev, assignedTo: '' }))
      } else {
        console.error('Failed to fetch drivers')
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Handle cascade updates
    if (field === 'cluster') {
      fetchSubsidiaries(value as string)
    } else if (field === 'subsidiary') {
      fetchDrivers(value as string)
    } else if (field === 'make') {
      fetchVehicleModels(value as string)
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleFileChange = (field: 'insuranceDocument', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration Number is required'
    }
    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Vehicle Type is required'
    }
    if (!formData.vin.trim()) {
      newErrors.vin = 'VIN is required'
    }
    if (!formData.make.trim()) {
      newErrors.make = 'Make is required'
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required'
    }
    if (!formData.cluster) {
      newErrors.cluster = 'Cluster is required'
    }
    if (!formData.subsidiary) {
      newErrors.subsidiary = 'Subsidiary is required'
    }
    // assignedTo is now optional - no validation required

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
      // Reset form
      setFormData({
        registrationNumber: '',
        vehicleType: '',
        currentMileage: '',
        location: '',
        vin: '',
        make: '',
        model: '',
        year: '',
        color: '',
        purchaseDate: '',
        nextServiceKm: '',
        additionalNotes: '',
        insuranceDocument: null,
        cluster: '',
        subsidiary: '',
        assignedTo: ''
      })
      setSubsidiaries([])
      setDrivers([])
      setVehicleModels([])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(2px)' }}>
      <div className={`w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-lg ${
        themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b bg-blue-100 ${
          themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Add Vehicle
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-3xl transition-colors ${
              themeMode === 'dark' 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* First Column */}
            <div className="space-y-4">
              {/* Registration Number */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  placeholder="e.g., ABC-123"
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.registrationNumber
                      ? 'border-red-500'
                      : themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                {errors.registrationNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.registrationNumber}</p>
                )}
              </div>

              {/* Vehicle Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.vehicleType
                      ? 'border-red-500'
                      : themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">-- Select Vehicle Type --</option>
                  {vehicleTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.type}
                    </option>
                  ))}
                </select>
                {errors.vehicleType && (
                  <p className="text-red-500 text-xs mt-1">{errors.vehicleType}</p>
                )}
              </div>

              {/* Current Mileage */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Current Mileage/Km
                </label>
                <input
                  type="number"
                  value={formData.currentMileage}
                  onChange={(e) => handleInputChange('currentMileage', e.target.value)}
                  placeholder="e.g., 15000"
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Location */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Main Depot, Branch A"
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Insurance Document */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Insurance Document
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('insuranceDocument', e.target.files?.[0] || null)}
                    className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      themeMode === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${
                    themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Accepted formats: PDF, JPG, PNG (Max: 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Second Column */}
            <div className="space-y-4">
              {/* VIN */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  VIN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value)}
                  placeholder="Vehicle Identification Number"
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.vin
                      ? 'border-red-500'
                      : themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                {errors.vin && (
                  <p className="text-red-500 text-xs mt-1">{errors.vin}</p>
                )}
              </div>

              {/* Make */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Make <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.make
                      ? 'border-red-500'
                      : themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">-- Select Make --</option>
                  {vehicleMakes.map(make => (
                    <option key={make.id} value={make.id}>
                      {make.name}
                    </option>
                  ))}
                </select>
                {errors.make && (
                  <p className="text-red-500 text-xs mt-1">{errors.make}</p>
                )}
              </div>

              {/* Model */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Model <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  disabled={!formData.make || loading}
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.model
                      ? 'border-red-500'
                      : themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${!formData.make ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">-- Select Model --</option>
                  {vehicleModels.map(model => (
                    <option key={model.id} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
                {errors.model && (
                  <p className="text-red-500 text-xs mt-1">{errors.model}</p>
                )}
                {loading && (
                  <p className="text-blue-500 text-xs mt-1">Loading models...</p>
                )}
              </div>

              {/* Year */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  placeholder="e.g., 2023"
                  min="1900"
                  max="2030"
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Color */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., Red, Blue"
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Third Column */}
            <div className="space-y-4">
              {/* Purchase Date */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Next Service Km */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Next Service (Km)
                </label>
                <input
                  type="number"
                  value={formData.nextServiceKm}
                  onChange={(e) => handleInputChange('nextServiceKm', e.target.value)}
                  placeholder="e.g., 20000"
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Any additional information about the vehicle"
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Cluster */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Cluster <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.cluster}
                  onChange={(e) => handleInputChange('cluster', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cluster
                      ? 'border-red-500'
                      : themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
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
                {errors.cluster && (
                  <p className="text-red-500 text-xs mt-1">{errors.cluster}</p>
                )}
              </div>

              {/* Subsidiary */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Subsidiary <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subsidiary}
                  onChange={(e) => handleInputChange('subsidiary', e.target.value)}
                  disabled={!formData.cluster || loading}
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.subsidiary
                      ? 'border-red-500'
                      : themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
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
                {errors.subsidiary && (
                  <p className="text-red-500 text-xs mt-1">{errors.subsidiary}</p>
                )}
                {loading && (
                  <p className="text-blue-500 text-xs mt-1">Loading subsidiaries...</p>
                )}
              </div>

              {/* Assigned To (Driver) */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Assigned To
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  disabled={!formData.subsidiary || loading}
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.assignedTo
                      ? 'border-red-500'
                      : themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${!formData.subsidiary ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">-- Select Driver --</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.phone})
                    </option>
                  ))}
                </select>
                {errors.assignedTo && (
                  <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>
                )}
                {loading && (
                  <p className="text-blue-500 text-xs mt-1">Loading drivers...</p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-4 p-6 border-t ${
          themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-3xl hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            CANCEL
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  )
}
