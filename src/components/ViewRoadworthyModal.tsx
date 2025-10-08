'use client'

import { useState } from 'react'
import { X, FileCheck, Calendar, Car, Building, Edit, Download, Printer } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface ViewRoadworthyModalProps {
  isOpen: boolean
  onClose: () => void
  roadworthy: any
  onEdit?: (roadworthy: any) => void
}

export default function ViewRoadworthyModal({ isOpen, onClose, roadworthy, onEdit }: ViewRoadworthyModalProps) {
  const { themeMode } = useTheme()
  const [isPrinting, setIsPrinting] = useState(false)

  if (!isOpen || !roadworthy) return null

  const handlePrint = () => {
    setIsPrinting(true)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Roadworthy Details - ${roadworthy.vehicle_number}</title>
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
              <h1>Roadworthy Details</h1>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="section">
              <h2>Certificate Information</h2>
              <div class="row">
                <div class="col">
                  <span class="label">Vehicle Number:</span>
                  <span class="value">${roadworthy.vehicle_number}</span>
                </div>
                <div class="col">
                  <span class="label">Company:</span>
                  <span class="value">${roadworthy.company}</span>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <span class="label">Vehicle Type:</span>
                  <span class="value">${roadworthy.vehicle_type}</span>
                </div>
                <div class="col">
                  <span class="label">Status:</span>
                  <span class="value">${roadworthy.roadworth_status}</span>
                </div>
              </div>
            </div>
            <div class="section">
              <h2>Certificate Dates</h2>
              <div class="row">
                <div class="col">
                  <span class="label">Date Issued:</span>
                  <span class="value">${new Date(roadworthy.date_issued).toLocaleDateString()}</span>
                </div>
                <div class="col">
                  <span class="label">Date Expired:</span>
                  <span class="value">${new Date(roadworthy.date_expired).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div class="section">
              <h2>Additional Information</h2>
              <div class="row">
                <div class="col">
                  <span class="label">Updated By:</span>
                  <span class="value">${roadworthy.updated_by}</span>
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
    const content = `
Roadworthy Details Report
Generated on: ${new Date().toLocaleDateString()}

Certificate Information:
Vehicle Number: ${roadworthy.vehicle_number}
Company: ${roadworthy.company}
Vehicle Type: ${roadworthy.vehicle_type}
Status: ${roadworthy.roadworth_status}

Certificate Dates:
Date Issued: ${new Date(roadworthy.date_issued).toLocaleDateString()}
Date Expired: ${new Date(roadworthy.date_expired).toLocaleDateString()}

Additional Information:
Updated By: ${roadworthy.updated_by}
    `
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roadworthy-${roadworthy.vehicle_number}-${new Date().toISOString().split('T')[0]}.txt`
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
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <FileCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{roadworthy.vehicle_number}</h2>
              <p className="text-gray-600 dark:text-gray-400">{roadworthy.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(roadworthy)}
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
          {/* Certificate Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Certificate Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Number</p>
                  <p className="font-medium">{roadworthy.vehicle_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                  <p className="font-medium">{roadworthy.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Type</p>
                  <p className="font-medium">{roadworthy.vehicle_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-medium">{roadworthy.roadworth_status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Certificate Dates
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date Issued</p>
                  <p className="font-medium">{new Date(roadworthy.date_issued).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date Expired</p>
                  <p className="font-medium">{new Date(roadworthy.date_expired).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Additional Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Updated By</p>
                  <p className="font-medium">{roadworthy.updated_by}</p>
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
