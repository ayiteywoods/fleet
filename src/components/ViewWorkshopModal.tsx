'use client'

import { X, Download, Printer, FileText, FileSpreadsheet, File } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Supervisor {
  id: string
  name: string
}

interface Workshop {
  id: string
  name: string
  region: string
  district: string
  supervisor_id: string
  created_at: string | null
  updated_at: string | null
  supervisors?: Supervisor
}

interface ViewWorkshopModalProps {
  isOpen: boolean
  onClose: () => void
  workshop: Workshop | null
}

export default function ViewWorkshopModal({ isOpen, onClose, workshop }: ViewWorkshopModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen || !workshop) return null

  const handleViewExportExcel = () => {
    const data = [{
      'Workshop ID': workshop.id,
      'Name': workshop.name,
      'Region': workshop.region,
      'District': workshop.district,
      'Supervisor': workshop.supervisors?.name || 'N/A',
      'Created At': workshop.created_at ? new Date(workshop.created_at).toLocaleDateString() : 'N/A',
      'Updated At': workshop.updated_at ? new Date(workshop.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Workshop Details')
    XLSX.writeFile(wb, `workshop-${workshop.name.replace(/\s+/g, '-').toLowerCase()}.xlsx`)
  }

  const handleViewExportCSV = () => {
    const data = [{
      'Workshop ID': workshop.id,
      'Name': workshop.name,
      'Region': workshop.region,
      'District': workshop.district,
      'Supervisor': workshop.supervisors?.name || 'N/A',
      'Created At': workshop.created_at ? new Date(workshop.created_at).toLocaleDateString() : 'N/A',
      'Updated At': workshop.updated_at ? new Date(workshop.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workshop-${workshop.name.replace(/\s+/g, '-').toLowerCase()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleViewExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Workshop Details Report', 14, 22)
    
    // Add workshop name
    doc.setFontSize(16)
    doc.text(`Workshop: ${workshop.name}`, 14, 35)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 45)
    
    // Add content sections
    let yPosition = 60
    
    // Basic Information
    doc.setFontSize(14)
    doc.text('Basic Information', 14, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Workshop ID: ${workshop.id}`, 20, yPosition)
    yPosition += 8
    doc.text(`Name: ${workshop.name}`, 20, yPosition)
    yPosition += 8
    doc.text(`Supervisor: ${workshop.supervisors?.name || 'N/A'}`, 20, yPosition)
    yPosition += 15
    
    // Location Information
    doc.setFontSize(14)
    doc.text('Location Information', 14, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Region: ${workshop.region}`, 20, yPosition)
    yPosition += 8
    doc.text(`District: ${workshop.district}`, 20, yPosition)
    yPosition += 15
    
    // Timestamps
    doc.setFontSize(14)
    doc.text('Timestamps', 14, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Created At: ${workshop.created_at ? new Date(workshop.created_at).toLocaleDateString() : 'N/A'}`, 20, yPosition)
    yPosition += 8
    doc.text(`Updated At: ${workshop.updated_at ? new Date(workshop.updated_at).toLocaleDateString() : 'N/A'}`, 20, yPosition)
    
    doc.save(`workshop-${workshop.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  const handleViewPrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Workshop Details Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #333; margin: 0; }
              .header h2 { color: #666; margin: 5px 0; }
              .section { margin-bottom: 25px; }
              .section h3 { color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; display: inline-block; width: 120px; }
              .value { color: #555; }
              .meta { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Workshop Details Report</h1>
              <h2>${workshop.name}</h2>
            </div>
            
            <div class="section">
              <h3>Basic Information</h3>
              <div class="field">
                <span class="label">Workshop ID:</span>
                <span class="value">${workshop.id}</span>
              </div>
              <div class="field">
                <span class="label">Name:</span>
                <span class="value">${workshop.name}</span>
              </div>
              <div class="field">
                <span class="label">Supervisor:</span>
                <span class="value">${workshop.supervisors?.name || 'N/A'}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>Location Information</h3>
              <div class="field">
                <span class="label">Region:</span>
                <span class="value">${workshop.region}</span>
              </div>
              <div class="field">
                <span class="label">District:</span>
                <span class="value">${workshop.district}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>Timestamps</h3>
              <div class="field">
                <span class="label">Created At:</span>
                <span class="value">${workshop.created_at ? new Date(workshop.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Updated At:</span>
                <span class="value">${workshop.updated_at ? new Date(workshop.updated_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            
            <div class="meta">
              Generated on: ${new Date().toLocaleDateString()}
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[10000]"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`p-6 rounded-3xl shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
        themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
          themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Workshop Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewExportExcel}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handleViewExportCSV}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleViewExportPDF}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <File className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleViewPrint}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
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
              className={`p-2 rounded-3xl transition-colors ${
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
          <div className={`p-4 rounded-3xl border ${
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
                  Workshop Name
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {workshop.name}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Supervisor
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {workshop.supervisors?.name || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className={`p-4 rounded-3xl border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Region
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {workshop.region}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  District
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {workshop.district}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className={`p-4 rounded-3xl border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Timestamps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Created At
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {workshop.created_at ? new Date(workshop.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Updated At
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {workshop.updated_at ? new Date(workshop.updated_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className={`p-4 rounded-3xl border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              System Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Workshop ID
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {workshop.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
