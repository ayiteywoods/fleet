'use client'

import { useState, useEffect } from 'react'
import { X, Wrench, Calendar, Banknote, FileText, User, Building } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface EditMaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  maintenance: any
  onSave: (id: string, data: any) => Promise<void>
}

export default function EditMaintenanceModal({ isOpen, onClose, maintenance, onSave }: EditMaintenanceModalProps) {
  const { themeMode } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    service_date: '',
    cost: '',
    status: 'completed',
    service_details: '',
    service_type: '',
    mileage_at_service: '',
    parts_replaced: '',
    vehicle_id: '',
    mechanic_id: '',
    workshop_id: ''
  })

  useEffect(() => {
    if (maintenance) {
      setFormData({
        service_date: maintenance.service_date ? new Date(maintenance.service_date).toISOString().split('T')[0] : '',
        cost: maintenance.cost?.toString() || '',
        status: maintenance.status || 'completed',
        service_details: maintenance.service_details || '',
        service_type: maintenance.service_type || '',
        mileage_at_service: maintenance.mileage_at_service?.toString() || '',
        parts_replaced: maintenance.parts_replaced || '',
        vehicle_id: maintenance.vehicle_id?.toString() || '',
        mechanic_id: maintenance.mechanic_id?.toString() || '',
        workshop_id: maintenance.workshop_id?.toString() || ''
      })
    }
  }, [maintenance])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSave(maintenance.id, formData)
      onClose()
    } catch (error) {
      console.error('Error updating maintenance record:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !maintenance) return null

  console.log('EditMaintenanceModal rendering:', { isOpen, maintenance: maintenance?.id })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto relative z-10 border-2 border-blue-500`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Maintenance Record</h2>
                <p className="text-blue-100">Record ID: {maintenance.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                Service Date *
              </label>
              <input
                type="date"
                name="service_date"
                value={formData.service_date}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Cost */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Banknote className="w-4 h-4" />
                Cost (₵) *
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="Enter maintenance cost"
                required
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Wrench className="w-4 h-4" />
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4" />
                Service Type *
              </label>
              <input
                type="text"
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                placeholder="Enter service type"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Mileage at Service */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Wrench className="w-4 h-4" />
                Mileage at Service (km)
              </label>
              <input
                type="number"
                name="mileage_at_service"
                value={formData.mileage_at_service}
                onChange={handleChange}
                placeholder="Enter mileage"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Vehicle ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Wrench className="w-4 h-4" />
                Vehicle ID (Optional)
              </label>
              <input
                type="number"
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                placeholder="Enter vehicle ID (optional)"
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Mechanic ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4" />
                Mechanic ID
              </label>
              <input
                type="number"
                name="mechanic_id"
                value={formData.mechanic_id}
                onChange={handleChange}
                placeholder="Enter mechanic ID"
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Workshop ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Building className="w-4 h-4" />
                Workshop ID
              </label>
              <input
                type="number"
                name="workshop_id"
                value={formData.workshop_id}
                onChange={handleChange}
                placeholder="Enter workshop ID"
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Service Details */}
          <div className="mt-6 space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileText className="w-4 h-4" />
              Service Details
            </label>
            <textarea
              name="service_details"
              value={formData.service_details}
              onChange={handleChange}
              placeholder="Enter service details"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                themeMode === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Parts Replaced */}
          <div className="mt-6 space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Wrench className="w-4 h-4" />
              Parts Replaced
            </label>
            <textarea
              name="parts_replaced"
              value={formData.parts_replaced}
              onChange={handleChange}
              placeholder="Enter parts replaced"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                themeMode === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
