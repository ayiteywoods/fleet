'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Building, Car, FileText } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface AddRoadworthyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (roadworthyData: any) => void
  vehicleId?: string
}

export default function AddRoadworthyModal({ isOpen, onClose, onSubmit, vehicleId }: AddRoadworthyModalProps) {
  const { themeMode } = useTheme()
  const [formData, setFormData] = useState({
    company: '',
    vehicle_number: '',
    vehicle_type: '',
    date_issued: '',
    date_expired: '',
    roadworth_status: 'valid',
    updated_by: '1'
  })
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (vehicleId) {
      setFormData(prev => ({
        ...prev,
        vehicle_number: vehicleId
      }))
    }
  }, [vehicleId])

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const response = await fetch('/api/vehicle-types')
        if (response.ok) {
          const data = await response.json()
          setVehicleTypes(data)
        }
      } catch (error) {
        console.error('Error fetching vehicle types:', error)
      }
    }

    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?simple=true')
        if (response.ok) {
          const data = await response.json()
          setVehicles(data)
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
      }
    }

    if (isOpen) {
      fetchVehicleTypes()
      fetchVehicles()
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVehicleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleId = e.target.value
    setFormData(prev => ({ ...prev, vehicle_number: vehicleId }))

    if (vehicleId) {
      try {
        setLoading(true)
        const response = await fetch(`/api/vehicles/details?id=${vehicleId}`)
        if (response.ok) {
          const vehicleDetails = await response.json()
          setFormData(prev => ({
            ...prev,
            company: vehicleDetails.subsidiary_name || '',
            vehicle_type: vehicleDetails.vehicle_type || ''
          }))
        }
      } catch (error) {
        console.error('Error fetching vehicle details:', error)
      } finally {
        setLoading(false)
      }
    } else {
      // Clear company and vehicle type when no vehicle is selected
      setFormData(prev => ({
        ...prev,
        company: '',
        vehicle_type: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      setFormData({
        company: '',
        vehicle_number: '',
        vehicle_type: '',
        date_issued: '',
        date_expired: '',
        roadworth_status: 'valid',
        updated_by: '1'
      })
      onClose()
    } catch (error) {
      console.error('Error submitting roadworthy record:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`relative p-6 rounded-xl shadow-lg w-full max-w-2xl mx-4 my-8 ${themeMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-bold">Add Roadworthy Record</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  readOnly={!!formData.vehicle_number}
                  className={`w-full pl-10 pr-4 py-2 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${formData.vehicle_number ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                />
              </div>
              {formData.vehicle_number && (
                <p className="text-green-600 text-xs">Auto-filled from vehicle selection</p>
              )}
            </div>

            {/* Vehicle Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle Number *
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={handleVehicleChange}
                  required
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-2 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.reg_number} - {vehicle.trim} ({vehicle.year})
                    </option>
                  ))}
                </select>
              </div>
              {loading && (
                <p className="text-blue-500 text-xs">Loading vehicle details...</p>
              )}
            </div>

            {/* Vehicle Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle Type *
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  required
                  disabled={!!formData.vehicle_number}
                  className={`w-full pl-10 pr-4 py-2 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${formData.vehicle_number ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Vehicle Type</option>
                  {vehicleTypes.map((type) => (
                    <option key={type.id} value={type.type}>
                      {type.type}
                    </option>
                  ))}
                </select>
              </div>
              {formData.vehicle_number && (
                <p className="text-green-600 text-xs">Auto-filled from vehicle selection</p>
              )}
            </div>

            {/* Date Issued */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Issued *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="date_issued"
                  value={formData.date_issued}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Date Expired */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Expired *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="date_expired"
                  value={formData.date_expired}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Roadworthy Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="roadworth_status"
                  value={formData.roadworth_status}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="valid">Valid</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-2xl text-sm font-medium ${
                themeMode === 'dark'
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Roadworthy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}