'use client'

import { X, Download, Printer, FileText, FileSpreadsheet, File } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Workshop {
  id: string
  name: string
}

interface Mechanic {
  id: string
  name: string
  specialization: string
  region: string
  district: string
  status: string
  workshop_id: string
  created_at: string | null
  updated_at: string | null
  workshops?: Workshop
}

interface ViewMechanicModalProps {
  isOpen: boolean
  onClose: () => void
  mechanic: Mechanic | null
}

export default function ViewMechanicModal({ isOpen, onClose, mechanic }: ViewMechanicModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen || !mechanic) return null

  const handleViewExportExcel = () => {
    const data = [{
      'Mechanic ID': mechanic.id,
      'Name': mechanic.name,
      'Specialization': mechanic.specialization,
      'Region': mechanic.region,
      'District': mechanic.district,
      'Status': mechanic.status,
      'Workshop': mechanic.workshops?.name || 'N/A',
      'Created At': mechanic.created_at ? new Date(mechanic.created_at).toLocaleDateString() : 'N/A',
      'Updated At': mechanic.updated_at ? new Date(mechanic.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Mechanic Details')
    XLSX.writeFile(wb, `mechanic-${mechanic.name.replace(/\s+/g, '-').toLowerCase()}.xlsx`)
  }

  const handleViewExportCSV = () => {
    const data = [{
      'Mechanic ID': mechanic.id,
      'Name': mechanic.name,
      'Specialization': mechanic.specialization,
      'Region': mechanic.region,
      'District': mechanic.district,
      'Status': mechanic.status,
      'Workshop': mechanic.workshops?.name || 'N/A',
      'Created At': mechanic.created_at ? new Date(mechanic.created_at).toLocaleDateString() : 'N/A',
      'Updated At': mechanic.updated_at ? new Date(mechanic.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mechanic-${mechanic.name.replace(/\s+/g, '-').toLowerCase()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleViewExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Mechanic Details Report', 14, 22)
    
    // Add mechanic name
    doc.setFontSize(16)
    doc.text(`Mechanic: ${mechanic.name}`, 14, 35)
    
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
    doc.text(`Mechanic ID: ${mechanic.id}`, 20, yPosition)
    yPosition += 8
    doc.text(`Name: ${mechanic.name}`, 20, yPosition)
    yPosition += 8
    doc.text(`Specialization: ${mechanic.specialization}`, 20, yPosition)
    yPosition += 8
    doc.text(`Status: ${mechanic.status}`, 20, yPosition)
    yPosition += 8
    doc.text(`Workshop: ${mechanic.workshops?.name || 'N/A'}`, 20, yPosition)
    yPosition += 15
    
    // Location Information
    doc.setFontSize(14)
    doc.text('Location Information', 14, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Region: ${mechanic.region}`, 20, yPosition)
    yPosition += 8
    doc.text(`District: ${mechanic.district}`, 20, yPosition)
    yPosition += 15
    
    // Timestamps
    doc.setFontSize(14)
    doc.text('Timestamps', 14, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Created At: ${mechanic.created_at ? new Date(mechanic.created_at).toLocaleDateString() : 'N/A'}`, 20, yPosition)
    yPosition += 8
    doc.text(`Updated At: ${mechanic.updated_at ? new Date(mechanic.updated_at).toLocaleDateString() : 'N/A'}`, 20, yPosition)
    
    doc.save(`mechanic-${mechanic.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  const handleViewPrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Mechanic Details Report</title>
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
              <h1>Mechanic Details Report</h1>
              <h2>${mechanic.name}</h2>
            </div>
            
            <div class="section">
              <h3>Basic Information</h3>
              <div class="field">
                <span class="label">Mechanic ID:</span>
                <span class="value">${mechanic.id}</span>
              </div>
              <div class="field">
                <span class="label">Name:</span>
                <span class="value">${mechanic.name}</span>
              </div>
              <div class="field">
                <span class="label">Specialization:</span>
                <span class="value">${mechanic.specialization}</span>
              </div>
              <div class="field">
                <span class="label">Status:</span>
                <span class="value">${mechanic.status}</span>
              </div>
              <div class="field">
                <span class="label">Workshop:</span>
                <span class="value">${mechanic.workshops?.name || 'N/A'}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>Location Information</h3>
              <div class="field">
                <span class="label">Region:</span>
                <span class="value">${mechanic.region}</span>
              </div>
              <div class="field">
                <span class="label">District:</span>
                <span class="value">${mechanic.district}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>Timestamps</h3>
              <div class="field">
                <span class="label">Created At:</span>
                <span class="value">${mechanic.created_at ? new Date(mechanic.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Updated At:</span>
                <span class="value">${mechanic.updated_at ? new Date(mechanic.updated_at).toLocaleDateString() : 'N/A'}</span>
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
            Mechanic Details
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
                  Mechanic Name
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {mechanic.name}
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
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    mechanic.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {mechanic.status}
                  </span>
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Specialization
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {mechanic.specialization}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Workshop
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {mechanic.workshops?.name || 'N/A'}
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
                  {mechanic.region}
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
                  {mechanic.district}
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
                  {mechanic.created_at ? new Date(mechanic.created_at).toLocaleString() : 'N/A'}
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
                  {mechanic.updated_at ? new Date(mechanic.updated_at).toLocaleString() : 'N/A'}
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
                  Mechanic ID
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {mechanic.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
