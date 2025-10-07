'use client'

import { useState } from 'react'
import { X, Wrench, Calendar, Banknote, FileText, User, Building, Printer, Download } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ViewMaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  maintenance: any
  onEdit?: (maintenance: any) => void
}

export default function ViewMaintenanceModal({ isOpen, onClose, maintenance, onEdit }: ViewMaintenanceModalProps) {
  const { themeMode } = useTheme()
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  if (!isOpen || !maintenance) return null

  const handlePrint = () => {
    setIsPrinting(true)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Maintenance Record - ${maintenance.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; color: #374151; }
              .value { color: #6b7280; }
              .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
              .completed { background-color: #d1fae5; color: #065f46; }
              .pending { background-color: #fef3c7; color: #92400e; }
              .in_progress { background-color: #dbeafe; color: #1e40af; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Maintenance Record #${maintenance.id}</h1>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <h2>Service Details</h2>
              <div class="field"><span class="label">Service Date:</span> <span class="value">${new Date(maintenance.service_date).toLocaleDateString()}</span></div>
              <div class="field"><span class="label">Service Type:</span> <span class="value">${maintenance.service_type || 'N/A'}</span></div>
              <div class="field"><span class="label">Cost:</span> <span class="value">₵${Number(maintenance.cost).toLocaleString()}</span></div>
              <div class="field"><span class="label">Status:</span> <span class="value status ${maintenance.status?.toLowerCase().replace(' ', '_')}">${maintenance.status || 'N/A'}</span></div>
              <div class="field"><span class="label">Mileage at Service:</span> <span class="value">${maintenance.mileage_at_service || 0} km</span></div>
            </div>

            <div class="section">
              <h2>Service Information</h2>
              <div class="field"><span class="label">Service Details:</span> <span class="value">${maintenance.service_details || 'N/A'}</span></div>
              <div class="field"><span class="label">Parts Replaced:</span> <span class="value">${maintenance.parts_replaced || 'N/A'}</span></div>
            </div>

            <div class="section">
              <h2>Vehicle Information</h2>
              <div class="field"><span class="label">Vehicle ID:</span> <span class="value">${maintenance.vehicle_id}</span></div>
              <div class="field"><span class="label">Registration:</span> <span class="value">${maintenance.vehicles?.reg_number || 'N/A'}</span></div>
              <div class="field"><span class="label">Model:</span> <span class="value">${maintenance.vehicles?.trim || 'N/A'}</span></div>
              <div class="field"><span class="label">Year:</span> <span class="value">${maintenance.vehicles?.year || 'N/A'}</span></div>
            </div>

            <div class="section">
              <h2>Service Personnel</h2>
              <div class="field"><span class="label">Mechanic ID:</span> <span class="value">${maintenance.mechanic_id || 'N/A'}</span></div>
              <div class="field"><span class="label">Workshop ID:</span> <span class="value">${maintenance.workshop_id || 'N/A'}</span></div>
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

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(102, 126, 234)
      doc.text('Maintenance Record', 14, 22)
      
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Record ID: ${maintenance.id}`, 14, 32)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37)
      
      // Service Details
      const serviceData = [
        ['Service Date', new Date(maintenance.service_date).toLocaleDateString()],
        ['Service Type', maintenance.service_type || 'N/A'],
        ['Cost', `₵${Number(maintenance.cost).toLocaleString()}`],
        ['Status', maintenance.status || 'N/A'],
        ['Mileage at Service', `${maintenance.mileage_at_service || 0} km`],
        ['Service Details', maintenance.service_details || 'N/A'],
        ['Parts Replaced', maintenance.parts_replaced || 'N/A'],
        ['Vehicle ID', maintenance.vehicle_id],
        ['Registration', maintenance.vehicles?.reg_number || 'N/A'],
        ['Model', maintenance.vehicles?.trim || 'N/A'],
        ['Year', maintenance.vehicles?.year || 'N/A'],
        ['Mechanic ID', maintenance.mechanic_id || 'N/A'],
        ['Workshop ID', maintenance.workshop_id || 'N/A']
      ]
      
      autoTable(doc, {
        startY: 45,
        head: [['Field', 'Value']],
        body: serviceData,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] },
        styles: { fontSize: 10 }
      })
      
      doc.save(`maintenance-record-${maintenance.id}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
    setIsDownloading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto relative z-10`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Maintenance Record #{maintenance.id}</h2>
                <p className="text-blue-100">Service Date: {new Date(maintenance.service_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(maintenance)}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Service Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service Type:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{maintenance.service_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                  <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <Banknote className="w-4 h-4" />
                    ₵{Number(maintenance.cost).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    maintenance.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                    maintenance.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    maintenance.status?.toLowerCase() === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {maintenance.status || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mileage at Service:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{maintenance.mileage_at_service || 0} km</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Service Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 dark:text-gray-400 block">Service Details:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{maintenance.service_details || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400 block">Parts Replaced:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{maintenance.parts_replaced || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vehicle ID:</span>
                <span className="font-medium text-gray-900 dark:text-white">{maintenance.vehicle_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Registration:</span>
                <span className="font-medium text-gray-900 dark:text-white">{maintenance.vehicles?.reg_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Model:</span>
                <span className="font-medium text-gray-900 dark:text-white">{maintenance.vehicles?.trim || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Year:</span>
                <span className="font-medium text-gray-900 dark:text-white">{maintenance.vehicles?.year || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Service Personnel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Service Personnel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Mechanic ID:</span>
                <span className="font-medium text-gray-900 dark:text-white">{maintenance.mechanic_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Workshop ID:</span>
                <span className="font-medium text-gray-900 dark:text-white">{maintenance.workshop_id || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Created: {new Date(maintenance.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              {isPrinting ? 'Printing...' : 'Print'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
