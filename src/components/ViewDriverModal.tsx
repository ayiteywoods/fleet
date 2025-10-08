'use client'

import { useState } from 'react'
import { X, User, Phone, CreditCard, MapPin, Calendar, Car, Edit, Printer, Download } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface ViewDriverModalProps {
  isOpen: boolean
  onClose: () => void
  driver: any
  onEdit?: (driver: any) => void
}

export default function ViewDriverModal({ isOpen, onClose, driver, onEdit }: ViewDriverModalProps) {
  const { themeMode } = useTheme()
  const [isPrinting, setIsPrinting] = useState(false)

  if (!isOpen || !driver) return null

  const handlePrint = () => {
    setIsPrinting(true)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Driver Details - ${driver.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #3B82F6; padding-bottom: 10px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; color: #374151; }
              .value { margin-left: 10px; color: #6B7280; }
              .row { display: flex; margin-bottom: 10px; }
              .col { flex: 1; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Driver Details</h1>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="section">
              <h2>Personal Information</h2>
              <div class="row">
                <div class="col">
                  <span class="label">Name:</span>
                  <span class="value">${driver.name}</span>
                </div>
                <div class="col">
                  <span class="label">Phone:</span>
                  <span class="value">${driver.phone}</span>
                </div>
              </div>
            </div>
            <div class="section">
              <h2>License Information</h2>
              <div class="row">
                <div class="col">
                  <span class="label">License Number:</span>
                  <span class="value">${driver.license_number}</span>
                </div>
                <div class="col">
                  <span class="label">Category:</span>
                  <span class="value">${driver.license_category}</span>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <span class="label">Expiry Date:</span>
                  <span class="value">${driver.license_expire}</span>
                </div>
              </div>
            </div>
            <div class="section">
              <h2>Location Information</h2>
              <div class="row">
                <div class="col">
                  <span class="label">Region:</span>
                  <span class="value">${driver.region}</span>
                </div>
                <div class="col">
                  <span class="label">District:</span>
                  <span class="value">${driver.district}</span>
                </div>
              </div>
            </div>
            <div class="section">
              <h2>Status & Assignment</h2>
              <div class="row">
                <div class="col">
                  <span class="label">Status:</span>
                  <span class="value">${driver.status}</span>
                </div>
                <div class="col">
                  <span class="label">Vehicle ID:</span>
                  <span class="value">${driver.vehicle_id || 'Not assigned'}</span>
                </div>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      printWindow.close()
    }
    setIsPrinting(false)
  }

  const handleDownloadPDF = () => {
    // Simple PDF download implementation
    const content = `
Driver Details Report
Generated on: ${new Date().toLocaleDateString()}

Personal Information:
Name: ${driver.name}
Phone: ${driver.phone}

License Information:
License Number: ${driver.license_number}
Category: ${driver.license_category}
Expiry Date: ${driver.license_expire}

Location Information:
Region: ${driver.region}
District: ${driver.district}

Status & Assignment:
Status: ${driver.status}
Vehicle ID: ${driver.vehicle_id || 'Not assigned'}
    `
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `driver-${driver.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{driver.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{driver.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(driver)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-3xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Personal Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="font-medium">{driver.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="font-medium">{driver.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              License Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">License Number</p>
                  <p className="font-medium">{driver.license_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-medium">{driver.license_category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expiry Date</p>
                  <p className="font-medium">{driver.license_expire}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Location Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Region</p>
                  <p className="font-medium">{driver.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">District</p>
                  <p className="font-medium">{driver.district}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Status & Assignment
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-medium">{driver.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle ID</p>
                  <p className="font-medium">{driver.vehicle_id || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-3xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              {isPrinting ? 'Printing...' : 'Print'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-3xl hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
