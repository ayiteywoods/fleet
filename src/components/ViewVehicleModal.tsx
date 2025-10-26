'use client'

import { X, Car, Calendar, MapPin, Wrench, FileText, Printer, Download, Edit, Plus, Settings, Building2, User } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useRouter } from 'next/navigation'

interface Vehicle {
  id: number
  reg_number: string
  vin_number?: string
  trim?: string
  year?: number
  status: string
  color?: string
  engine_number?: string
  chassis_number?: string
  current_region?: string
  current_district?: string
  current_mileage?: number
  last_service_date?: string
  next_service_km?: number
  type_id?: number
  make_id?: number
  vehicle_type_name?: string
  vehicle_make_name?: string
  notes?: string
  created_at?: string
  updated_at?: string
  created_by?: number
  updated_by?: number
  spcode?: number
  subsidiary_name?: string
  assigned_driver?: {
    id: string
    name: string
    phone: string
    license_number: string
  }
  [key: string]: any
}

interface ViewVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: Vehicle | null
}

export default function ViewVehicleModal({ isOpen, onClose, vehicle }: ViewVehicleModalProps) {
  const { themeMode } = useTheme()
  const router = useRouter()

  const handleViewProfile = () => {
    if (vehicle) {
      router.push(`/vehicle-profile/${vehicle.id}`)
      onClose() // Close the modal after navigation
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Vehicle Details - ${vehicle?.reg_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1f2937; margin-bottom: 20px; }
              .section { margin-bottom: 30px; }
              .section h2 { color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
              .field { margin-bottom: 10px; }
              .field-label { font-weight: bold; color: #6b7280; }
              .field-value { color: #1f2937; margin-left: 10px; }
              .status-active { color: #059669; font-weight: bold; }
              .status-inactive { color: #dc2626; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Vehicle Details</h1>
            <div class="section">
              <h2>Basic Information</h2>
              <div class="field"><span class="field-label">Registration:</span><span class="field-value">${vehicle?.reg_number || 'N/A'}</span></div>
              <div class="field"><span class="field-label">VIN:</span><span class="field-value">${vehicle?.vin_number || 'N/A'}</span></div>
              <div class="field"><span class="field-label">Trim:</span><span class="field-value">${vehicle?.trim || 'N/A'}</span></div>
              <div class="field"><span class="field-label">Year:</span><span class="field-value">${vehicle?.year || 'N/A'}</span></div>
              <div class="field"><span class="field-label">Color:</span><span class="field-value">${vehicle?.color || 'N/A'}</span></div>
            </div>
            <div class="section">
              <h2>Status & Location</h2>
              <div class="field"><span class="field-label">Status:</span><span class="field-value ${vehicle?.status === 'Active' ? 'status-active' : 'status-inactive'}">${vehicle?.status || 'N/A'}</span></div>
              <div class="field"><span class="field-label">Region:</span><span class="field-value">${vehicle?.current_region || 'N/A'}</span></div>
              <div class="field"><span class="field-label">District:</span><span class="field-value">${vehicle?.current_district || 'N/A'}</span></div>
            </div>
            <div class="section">
              <h2>Maintenance Information</h2>
              <div class="field"><span class="field-label">Current Mileage:</span><span class="field-value">${vehicle?.current_mileage ? vehicle.current_mileage.toLocaleString() + ' km' : 'N/A'}</span></div>
              <div class="field"><span class="field-label">Last Service:</span><span class="field-value">${vehicle?.last_service_date ? new Date(vehicle.last_service_date).toLocaleDateString() : 'N/A'}</span></div>
              <div class="field"><span class="field-label">Next Service:</span><span class="field-value">${vehicle?.next_service_km ? vehicle.next_service_km.toLocaleString() + ' km' : 'N/A'}</span></div>
            </div>
            <div class="section">
              <h2>Assignment Information</h2>
              <div class="field"><span class="field-label">Subsidiary:</span><span class="field-value">${vehicle?.subsidiary_name || 'Not assigned'}</span></div>
              <div class="field"><span class="field-label">Assigned Driver:</span><span class="field-value">${vehicle?.assigned_driver ? vehicle.assigned_driver.name + ' (' + vehicle.assigned_driver.license_number + ')' : 'Not assigned'}</span></div>
            </div>
            <div class="section">
              <h2>System Information</h2>
              <div class="field"><span class="field-label">Created:</span><span class="field-value">${vehicle?.created_at ? new Date(vehicle.created_at).toLocaleDateString() : 'N/A'}</span></div>
              <div class="field"><span class="field-label">Last Updated:</span><span class="field-value">${vehicle?.updated_at ? new Date(vehicle.updated_at).toLocaleDateString() : 'N/A'}</span></div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownloadPDF = () => {
    const content = `
      Vehicle Details Report
      Generated on: ${new Date().toLocaleDateString()}
      
      Basic Information:
      - Registration: ${vehicle?.reg_number || 'N/A'}
      - VIN: ${vehicle?.vin_number || 'N/A'}
      - Trim: ${vehicle?.trim || 'N/A'}
      - Year: ${vehicle?.year || 'N/A'}
      - Color: ${vehicle?.color || 'N/A'}
      
      Status & Location:
      - Status: ${vehicle?.status || 'N/A'}
      - Region: ${vehicle?.current_region || 'N/A'}
      - District: ${vehicle?.current_district || 'N/A'}
      
      Maintenance Information:
      - Current Mileage: ${vehicle?.current_mileage ? vehicle.current_mileage.toLocaleString() + ' km' : 'N/A'}
      - Last Service: ${vehicle?.last_service_date ? new Date(vehicle.last_service_date).toLocaleDateString() : 'N/A'}
      - Next Service: ${vehicle?.next_service_km ? vehicle.next_service_km.toLocaleString() + ' km' : 'N/A'}
      
      Assignment Information:
      - Subsidiary: ${vehicle?.subsidiary_name || 'Not assigned'}
      - Assigned Driver: ${vehicle?.assigned_driver ? vehicle.assigned_driver.name + ' (' + vehicle.assigned_driver.license_number + ')' : 'Not assigned'}
      
      System Information:
      - Created: ${vehicle?.created_at ? new Date(vehicle.created_at).toLocaleDateString() : 'N/A'}
      - Last Updated: ${vehicle?.updated_at ? new Date(vehicle.updated_at).toLocaleDateString() : 'N/A'}
    `
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vehicle-${vehicle?.reg_number?.replace(/\s+/g, '-').toLowerCase() || 'details'}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!isOpen || !vehicle) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`relative ${themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-900/20 dark:to-orange-900/20 p-6 rounded-t-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Vehicle Profile Header */}
          <div className="flex items-center gap-4">
            {/* Vehicle Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              <Car className="w-12 h-12" />
            </div>
            
            {/* Vehicle Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{vehicle.reg_number || 'Unknown Vehicle'}</h2>
              <p className="text-gray-600 dark:text-gray-300">{vehicle.trim} {vehicle.year} - {vehicle.color}</p>
            </div>
            
            {/* View Profile Button */}
            <button 
              onClick={handleViewProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              View Profile
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Vehicle Information Form */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={vehicle.reg_number || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                    placeholder="Registration Number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trim/Model
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vehicle.trim || 'Not specified'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
                      placeholder="Vehicle Trim"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vehicle.year?.toString() || 'Not specified'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
                      placeholder="Vehicle Year"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={vehicle.color || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Vehicle Color"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={vehicle.company_name || 'Not specified'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Company Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Engine Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vehicle.engine_number || 'Not specified'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-8 font-mono text-sm"
                      placeholder="Engine Number"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chassis Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vehicle.chassis_number || 'Not specified'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-8 font-mono text-sm"
                      placeholder="Chassis Number"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    VIN Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vehicle.vin_number || 'Not specified'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-8 font-mono text-sm"
                      placeholder="VIN Number"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Location Management */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Status & Location</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {vehicle.current_region || 'No region specified'} - {vehicle.current_district || 'No district specified'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status: <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      vehicle.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : vehicle.status === 'In Service'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {vehicle.status || 'Unknown'}
                    </span>
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-3xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Plus className="w-4 h-4" />
                Update Location
              </button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Maintenance Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Mileage:</span>
                  <span className="text-gray-900 dark:text-white">
                    {vehicle.current_mileage ? vehicle.current_mileage.toLocaleString() + ' km' : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Service:</span>
                  <span className="text-gray-900 dark:text-white">
                    {vehicle.last_service_date ? new Date(vehicle.last_service_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Next Service:</span>
                  <span className="text-gray-900 dark:text-white">
                    {vehicle.next_service_km ? vehicle.next_service_km.toLocaleString() + ' km' : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vehicle ID:</span>
                  <span className="text-gray-900 dark:text-white font-mono text-sm">{vehicle.id}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">System Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="text-gray-900 dark:text-white">
                    {vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                  <span className="text-gray-900 dark:text-white">
                    {vehicle.updated_at ? new Date(vehicle.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subsidiary:</span>
                  <span className="text-gray-900 dark:text-white">
                    {vehicle.subsidiary_name || 'Not assigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Assigned Driver:</span>
                  <span className="text-gray-900 dark:text-white">
                    {vehicle.assigned_driver ? `${vehicle.assigned_driver.name} (${vehicle.assigned_driver.license_number})` : 'Not assigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Maintenance:</span>
                  <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    <Settings className="w-3 h-3" />
                    <span className="text-xs">Schedule</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Printer className="w-4 h-4" />
            PRINT
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}