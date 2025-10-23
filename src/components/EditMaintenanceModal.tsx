'use client'

import { useState, useEffect } from 'react'
import { X, Wrench, Calendar, Banknote, FileText, User, Building } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface EditMaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (maintenanceData: any) => void
  maintenanceRecord: any
}

interface Vehicle {
  id: string
  reg_number: string
  trim: string
  year: number
  status: string
  color: string
  name: string
}

interface Mechanic {
  id: string
  name: string
  phone: string
  specialization: string
  experience_years: number
  workshops: Workshop[]
}

interface Workshop {
  id: string
  name: string
  location: string
  phone: string
  capacity: number
}

export default function EditMaintenanceModal({ isOpen, onClose, onSubmit, maintenanceRecord }: EditMaintenanceModalProps) {
  const { themeMode } = useTheme()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
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
  const [loading, setLoading] = useState(false)

  // Update form data when maintenanceRecord changes
  useEffect(() => {
    if (maintenanceRecord) {
      setFormData({
        service_date: maintenanceRecord.service_date ? new Date(maintenanceRecord.service_date).toISOString().split('T')[0] : '',
        cost: maintenanceRecord.cost || '',
        status: maintenanceRecord.status || 'completed',
        service_details: maintenanceRecord.service_details || '',
        service_type: maintenanceRecord.service_type || '',
        mileage_at_service: maintenanceRecord.mileage_at_service || '',
        parts_replaced: maintenanceRecord.parts_replaced || '',
        vehicle_id: maintenanceRecord.vehicle_id || '',
        mechanic_id: maintenanceRecord.mechanic_id || '',
        workshop_id: maintenanceRecord.workshop_id || ''
      })
    }
  }, [maintenanceRecord])

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setFetchLoading(true)
    try {
      const [vehiclesResponse, mechanicsResponse, workshopsResponse] = await Promise.all([
        fetch('/api/vehicles?simple=true'),
        fetch('/api/mechanics'),
        fetch('/api/workshops')
      ])

      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json()
        setVehicles(vehiclesData)
      }

      if (mechanicsResponse.ok) {
        const mechanicsData = await mechanicsResponse.json()
        setMechanics(mechanicsData)
      }

      if (workshopsResponse.ok) {
        const workshopsData = await workshopsResponse.json()
        setWorkshops(workshopsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error updating maintenance record:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Handle cascading mechanic-workshop selection
    if (name === 'mechanic_id' && value) {
      const selectedMechanic = mechanics.find(mechanic => mechanic.id === value)
      if (selectedMechanic && selectedMechanic.workshops) {
        // Since each mechanic belongs to one workshop, auto-select it
        setFormData(prev => ({
          ...prev,
          mechanic_id: value,
          workshop_id: selectedMechanic.workshops.id
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          mechanic_id: value,
          workshop_id: ''
        }))
      }
    } else if (name === 'mechanic_id' && !value) {
      // Reset workshop when no mechanic is selected
      setFormData(prev => ({
        ...prev,
        mechanic_id: '',
        workshop_id: ''
      }))
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
      <div className={`${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Maintenance Record</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Service Date *
              </label>
              <div className="relative">
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
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle *
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                required
                disabled={fetchLoading}
                className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } ${fetchLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.reg_number} - {vehicle.trim} ({vehicle.year})
                  </option>
                ))}
              </select>
              {fetchLoading && (
                <p className="text-blue-500 text-xs">Loading vehicles...</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cost (₵) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="Enter maintenance cost"
                  required
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status *
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
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
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Service Type *
              </label>
              <input
                type="text"
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                placeholder="e.g., Oil Change, Brake Service"
                required
                className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mileage at Service (Km)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="mileage_at_service"
                  value={formData.mileage_at_service}
                  onChange={handleChange}
                  placeholder="Enter mileage"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mechanic *
              </label>
              <div className="relative">
                <select
                  name="mechanic_id"
                  value={formData.mechanic_id}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">-- Select Mechanic --</option>
                  {mechanics.map(mechanic => (
                    <option key={mechanic.id} value={mechanic.id}>
                      {mechanic.name} - {mechanic.specialization}
                    </option>
                  ))}
                </select>
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Workshop *
              </label>
              <div className="relative">
                <select
                  name="workshop_id"
                  value={formData.workshop_id}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">-- Select Workshop --</option>
                  {workshops.map(workshop => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.name} - {workshop.location}
                    </option>
                  ))}
                </select>
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Full-width text areas */}
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Service Details
              </label>
              <textarea
                name="service_details"
                value={formData.service_details}
                onChange={handleChange}
                placeholder="Describe the maintenance work performed..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Parts Replaced
              </label>
              <textarea
                name="parts_replaced"
                value={formData.parts_replaced}
                onChange={handleChange}
                placeholder="List any parts that were replaced..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-3xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Maintenance Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}