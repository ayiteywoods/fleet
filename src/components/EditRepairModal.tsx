'use client'

import { useState, useEffect } from 'react'
import { X, Wrench, Calendar, Banknote, Truck } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface EditRepairModalProps {
  isOpen: boolean
  onClose: () => void
  repair: any
  onSave: (id: string, data: any) => Promise<void>
}

export default function EditRepairModal({ isOpen, onClose, repair, onSave }: EditRepairModalProps) {
  const { themeMode } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    service_date: '',
    cost: '',
    status: 'completed',
    vehicle_id: ''
  })

  useEffect(() => {
    if (repair) {
      setFormData({
        service_date: repair.service_date ? new Date(repair.service_date).toISOString().split('T')[0] : '',
        cost: repair.cost?.toString() || '',
        status: repair.status || 'completed',
        vehicle_id: repair.vehicle_id?.toString() || ''
      })
    }
  }, [repair])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      await onSave(repair.id, formData)
      onClose()
    } catch (error) {
      console.error('Error updating repair record:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !repair) return null

  console.log('EditRepairModal rendering:', { isOpen, repair: repair?.id })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto relative z-10 border-2 border-blue-500`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Repair Record</h2>
                <p className="text-blue-100">Record ID: {repair.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-3xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                placeholder="Enter repair cost"
                required
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

            {/* Vehicle ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Truck className="w-4 h-4" />
                Vehicle ID (Optional)
              </label>
              <input
                type="number"
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                placeholder="Enter vehicle ID (optional)"
                min="1"
                className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
