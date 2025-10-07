'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface FuelLog {
  id: string
  refuel_date: string
  quantity: number
  unit_cost: number
  total_cost: number
  mileage_before: number
  mileage_after: number
  fuel_type: string
  vendor: string
  receipt_number?: string
  notes?: string
  vehicle_id: string
  driver_id: string
  created_at: string
  updated_at: string
  vehicles: {
    reg_number: string
    trim?: string
    year?: number
    status: string
  }
  driver_operators: {
    name: string
    phone: string
    license_number: string
  }
}

interface EditFuelLogModalProps {
  isOpen: boolean
  onClose: () => void
  fuelLog: FuelLog | null
  onSuccess: () => void
}

interface Vehicle {
  id: string
  reg_number: string
  trim?: string
  year?: number
}

interface Driver {
  id: string
  name: string
  phone: string
}

export default function EditFuelLogModal({ isOpen, onClose, fuelLog, onSuccess }: EditFuelLogModalProps) {
  const { themeColor, themeMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [formData, setFormData] = useState({
    refuel_date: '',
    quantity: '',
    unit_cost: '',
    total_cost: '',
    mileage_before: '',
    mileage_after: '',
    fuel_type: '',
    vendor: '',
    receipt_number: '',
    notes: '',
    vehicle_id: '',
    driver_id: ''
  })

  // Initialize form data when fuelLog changes
  useEffect(() => {
    if (fuelLog) {
      setFormData({
        refuel_date: fuelLog.refuel_date ? new Date(fuelLog.refuel_date).toISOString().split('T')[0] : '',
        quantity: fuelLog.quantity.toString(),
        unit_cost: fuelLog.unit_cost.toString(),
        total_cost: fuelLog.total_cost.toString(),
        mileage_before: fuelLog.mileage_before.toString(),
        mileage_after: fuelLog.mileage_after.toString(),
        fuel_type: fuelLog.fuel_type,
        vendor: fuelLog.vendor,
        receipt_number: fuelLog.receipt_number || '',
        notes: fuelLog.notes || '',
        vehicle_id: fuelLog.vehicle_id,
        driver_id: fuelLog.driver_id
      })
    }
  }, [fuelLog])

  // Fetch vehicles and drivers
  useEffect(() => {
    if (isOpen) {
      fetchVehicles()
      fetchDrivers()
    }
  }, [isOpen])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers')
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fuelLog) return

    setLoading(true)

    try {
      const response = await fetch(`/api/fuel-logs?id=${fuelLog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update fuel log')
      }
    } catch (error) {
      console.error('Error updating fuel log:', error)
      alert('Error updating fuel log')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-calculate total cost when quantity or unit cost changes
    if (name === 'quantity' || name === 'unit_cost') {
      const quantity = name === 'quantity' ? parseFloat(value) : parseFloat(formData.quantity)
      const unitCost = name === 'unit_cost' ? parseFloat(value) : parseFloat(formData.unit_cost)
      
      if (!isNaN(quantity) && !isNaN(unitCost)) {
        setFormData(prev => ({
          ...prev,
          total_cost: (quantity * unitCost).toFixed(2)
        }))
      }
    }
  }

  if (!isOpen || !fuelLog) return null

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
        themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
          themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Edit Fuel Log
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              themeMode === 'dark' 
                ? 'text-gray-400 hover:bg-gray-700' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Refuel Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Refuel Date *
              </label>
              <input
                type="date"
                name="refuel_date"
                value={formData.refuel_date}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Vehicle */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Vehicle *
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.reg_number} {vehicle.trim && `(${vehicle.trim})`} {vehicle.year && `- ${vehicle.year}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Driver */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Driver *
              </label>
              <select
                name="driver_id"
                value={formData.driver_id}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Quantity (L) *
              </label>
              <input
                type="number"
                step="0.01"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Unit Cost */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Unit Cost (₵) *
              </label>
              <input
                type="number"
                step="0.01"
                name="unit_cost"
                value={formData.unit_cost}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Total Cost */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Total Cost (₵) *
              </label>
              <input
                type="number"
                step="0.01"
                name="total_cost"
                value={formData.total_cost}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Mileage Before */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Mileage Before *
              </label>
              <input
                type="number"
                name="mileage_before"
                value={formData.mileage_before}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Mileage After */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Mileage After *
              </label>
              <input
                type="number"
                name="mileage_after"
                value={formData.mileage_after}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Fuel Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Fuel Type *
              </label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="LPG">LPG</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            {/* Vendor */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Vendor *
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Receipt Number */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Receipt Number
              </label>
              <input
                type="text"
                name="receipt_number"
                value={formData.receipt_number}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                themeMode === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                themeMode === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                themeColor === 'blue' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              {loading ? 'Updating...' : 'Update Fuel Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
