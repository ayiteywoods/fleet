'use client'

import { useState } from 'react'
import { X, Wrench, Calendar, Banknote, FileText, Printer, Download } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ViewRepairModalProps {
  isOpen: boolean
  onClose: () => void
  repair: any
  onEdit?: (repair: any) => void
}

export default function ViewRepairModal({ isOpen, onClose, repair, onEdit }: ViewRepairModalProps) {
  const { themeMode } = useTheme()
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  if (!isOpen || !repair) return null

  const handlePrint = () => {
    setIsPrinting(true)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Repair Record - ${repair.id}</title>
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
              <h1>Repair Record #${repair.id}</h1>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <h2>Repair Details</h2>
              <div class="field"><span class="label">Service Date:</span> <span class="value">${new Date(repair.service_date).toLocaleDateString()}</span></div>
              <div class="field"><span class="label">Cost:</span> <span class="value">₵${Number(repair.cost).toLocaleString()}</span></div>
              <div class="field"><span class="label">Status:</span> <span class="value status ${repair.status?.toLowerCase().replace(' ', '_')}">${repair.status || 'N/A'}</span></div>
            </div>

            <div class="section">
              <h2>Vehicle Information</h2>
              <div class="field"><span class="label">Vehicle ID:</span> <span class="value">${repair.vehicle_id}</span></div>
              <div class="field"><span class="label">Registration:</span> <span class="value">${repair.vehicles?.reg_number || 'N/A'}</span></div>
              <div class="field"><span class="label">Model:</span> <span class="value">${repair.vehicles?.trim || 'N/A'}</span></div>
              <div class="field"><span class="label">Year:</span> <span class="value">${repair.vehicles?.year || 'N/A'}</span></div>
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
      doc.text('Repair Record', 14, 22)
      
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Record ID: ${repair.id}`, 14, 32)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37)
      
      // Repair Details
      const repairData = [
        ['Service Date', new Date(repair.service_date).toLocaleDateString()],
        ['Cost', `₵${Number(repair.cost).toLocaleString()}`],
        ['Status', repair.status || 'N/A'],
        ['Vehicle ID', repair.vehicle_id],
        ['Registration', repair.vehicles?.reg_number || 'N/A'],
        ['Model', repair.vehicles?.trim || 'N/A'],
        ['Year', repair.vehicles?.year || 'N/A']
      ]
      
      autoTable(doc, {
        startY: 45,
        head: [['Field', 'Value']],
        body: repairData,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] },
        styles: { fontSize: 10 }
      })
      
      doc.save(`repair-record-${repair.id}.pdf`)
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
      <div className={`${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto relative z-10`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Repair Record #{repair.id}</h2>
                <p className="text-blue-100">Service Date: {new Date(repair.service_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(repair)}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-3xl text-sm font-medium transition-colors"
                >
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-3xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Repair Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Repair Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date(repair.service_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                  <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <Banknote className="w-4 h-4" />
                    ₵{Number(repair.cost).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    repair.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                    repair.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    repair.status?.toLowerCase() === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {repair.status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Vehicle Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vehicle ID:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{repair.vehicle_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Registration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{repair.vehicles?.reg_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Model:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{repair.vehicles?.trim || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Year:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{repair.vehicles?.year || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Created: {new Date(repair.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              {isPrinting ? 'Printing...' : 'Print'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors disabled:opacity-50"
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
