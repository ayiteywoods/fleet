'use client'

import { X, Download, Printer, FileText, FileSpreadsheet, File } from 'lucide-react'
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

interface ViewFuelLogModalProps {
  isOpen: boolean
  onClose: () => void
  fuelLog: FuelLog | null
}

export default function ViewFuelLogModal({ isOpen, onClose, fuelLog }: ViewFuelLogModalProps) {
  const { themeColor, themeMode } = useTheme()

  if (!isOpen || !fuelLog) return null

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // Implementation for PDF export
    console.log('Export to PDF')
  }

  const handleExportExcel = () => {
    // Implementation for Excel export
    console.log('Export to Excel')
  }

  const handleExportCSV = () => {
    // Implementation for CSV export
    console.log('Export to CSV')
  }

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
            Fuel Log Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handleExportCSV}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleExportPDF}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <File className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handlePrint}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
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
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className={`p-4 rounded-lg border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Refuel Date
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {new Date(fuelLog.refuel_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Fuel Type
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {fuelLog.fuel_type}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Vendor
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {fuelLog.vendor}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Receipt Number
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {fuelLog.receipt_number || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className={`p-4 rounded-lg border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Registration Number
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {fuelLog.vehicles.reg_number}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Trim
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {fuelLog.vehicles.trim || 'N/A'}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Year
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {fuelLog.vehicles.year || 'N/A'}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {fuelLog.vehicles.status}
                </p>
              </div>
            </div>
          </div>

          {/* Driver Information */}
          <div className={`p-4 rounded-lg border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Driver Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Name
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {fuelLog.driver_operators.name}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Phone
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {fuelLog.driver_operators.phone}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  License Number
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {fuelLog.driver_operators.license_number}
                </p>
              </div>
            </div>
          </div>

          {/* Fuel Details */}
          <div className={`p-4 rounded-lg border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Fuel Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Quantity (L)
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {Number(fuelLog.quantity).toFixed(2)}L
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Unit Cost (₵)
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  ₵{Number(fuelLog.unit_cost).toFixed(2)}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Total Cost (₵)
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  ₵{Number(fuelLog.total_cost).toFixed(2)}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Mileage Before
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {Number(fuelLog.mileage_before).toLocaleString()} km
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Mileage After
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {Number(fuelLog.mileage_after).toLocaleString()} km
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Distance Traveled
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {(Number(fuelLog.mileage_after) - Number(fuelLog.mileage_before)).toLocaleString()} km
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {fuelLog.notes && (
            <div className={`p-4 rounded-lg border ${
              themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Notes
              </h3>
              <p className={`text-sm ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
              }`}>
                {fuelLog.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              themeMode === 'dark' 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
