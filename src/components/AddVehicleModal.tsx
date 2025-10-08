'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (vehicleData: any) => void
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
    insuranceDocument: null as File | null
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
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
        insuranceDocument: null
      })
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
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="bus">Bus</option>
                  <option value="motorcycle">Motorcycle</option>
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
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="e.g., Toyota, Ford"
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.make
                      ? 'border-red-500'
                      : themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
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
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., Camry, F-150"
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.model
                      ? 'border-red-500'
                      : themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                {errors.model && (
                  <p className="text-red-500 text-xs mt-1">{errors.model}</p>
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
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
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
