'use client'

import { X, Download, Printer, FileText, FileSpreadsheet, File } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Vehicle {
  id: string
  reg_number: string
  vin_number: string | null
  trim: string | null
  year: number | null
  status: string
  color: string | null
  current_region: string | null
  current_district: string | null
}

interface Driver {
  id: string
  name: string
  license_number: string
}

interface VehicleDispatch {
  id: string
  region: string
  district: string
  first_maintenance: string | null
  assigned_to: string
  received_by: string
  purpose: string | null
  dispatch_date: string
  expected_return_date: string | null
  vehicle_id: string
  driver_id: string
  created_at: string | null
  updated_at: string | null
  vehicles?: Vehicle
}

interface ViewVehicleDispatchModalProps {
  isOpen: boolean
  onClose: () => void
  dispatch: VehicleDispatch | null
}

export default function ViewVehicleDispatchModal({ isOpen, onClose, dispatch }: ViewVehicleDispatchModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen || !dispatch) return null

  const handleViewExportExcel = () => {
    const data = [{
      'Dispatch ID': dispatch.id,
      'Region': dispatch.region,
      'District': dispatch.district,
      'Assigned To': dispatch.assigned_to,
      'Received By': dispatch.received_by,
      'Purpose': dispatch.purpose || 'N/A',
      'Dispatch Date': dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toLocaleDateString() : 'N/A',
      'Expected Return Date': dispatch.expected_return_date ? new Date(dispatch.expected_return_date).toLocaleDateString() : 'N/A',
      'First Maintenance Date': dispatch.first_maintenance ? new Date(dispatch.first_maintenance).toLocaleDateString() : 'N/A',
      'Vehicle': dispatch.vehicles ? `${dispatch.vehicles.reg_number}${dispatch.vehicles.trim ? ` (${dispatch.vehicles.trim})` : ''}${dispatch.vehicles.year ? ` - ${dispatch.vehicles.year}` : ''}` : 'N/A',
      'Driver': 'N/A',
      'Created At': dispatch.created_at ? new Date(dispatch.created_at).toLocaleDateString() : 'N/A',
      'Updated At': dispatch.updated_at ? new Date(dispatch.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Dispatch Details')
    XLSX.writeFile(wb, `dispatch-${dispatch.id}.xlsx`)
  }

  const handleViewExportCSV = () => {
    const data = [{
      'Dispatch ID': dispatch.id,
      'Region': dispatch.region,
      'District': dispatch.district,
      'Assigned To': dispatch.assigned_to,
      'Received By': dispatch.received_by,
      'Purpose': dispatch.purpose || 'N/A',
      'Dispatch Date': dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toLocaleDateString() : 'N/A',
      'Expected Return Date': dispatch.expected_return_date ? new Date(dispatch.expected_return_date).toLocaleDateString() : 'N/A',
      'First Maintenance Date': dispatch.first_maintenance ? new Date(dispatch.first_maintenance).toLocaleDateString() : 'N/A',
      'Vehicle': dispatch.vehicles ? `${dispatch.vehicles.reg_number}${dispatch.vehicles.trim ? ` (${dispatch.vehicles.trim})` : ''}${dispatch.vehicles.year ? ` - ${dispatch.vehicles.year}` : ''}` : 'N/A',
      'Driver': 'N/A',
      'Created At': dispatch.created_at ? new Date(dispatch.created_at).toLocaleDateString() : 'N/A',
      'Updated At': dispatch.updated_at ? new Date(dispatch.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dispatch-${dispatch.id}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleViewExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Vehicle Dispatch Details Report', 14, 22)
    
    // Add dispatch ID
    doc.setFontSize(16)
    doc.text(`Dispatch ID: ${dispatch.id}`, 14, 35)
    
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
    doc.text(`Dispatch ID: ${dispatch.id}`, 20, yPosition)
    yPosition += 8
    doc.text(`Region: ${dispatch.region}`, 20, yPosition)
    yPosition += 8
    doc.text(`District: ${dispatch.district}`, 20, yPosition)
    yPosition += 8
    doc.text(`Assigned To: ${dispatch.assigned_to}`, 20, yPosition)
    yPosition += 8
    doc.text(`Received By: ${dispatch.received_by}`, 20, yPosition)
    yPosition += 8
    doc.text(`Purpose: ${dispatch.purpose || 'N/A'}`, 20, yPosition)
    yPosition += 15
    
    // Dates
    doc.setFontSize(14)
    doc.text('Important Dates', 14, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Dispatch Date: ${dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toLocaleDateString() : 'N/A'}`, 20, yPosition)
    yPosition += 8
    doc.text(`Expected Return Date: ${dispatch.expected_return_date ? new Date(dispatch.expected_return_date).toLocaleDateString() : 'N/A'}`, 20, yPosition)
    yPosition += 8
    doc.text(`First Maintenance Date: ${dispatch.first_maintenance ? new Date(dispatch.first_maintenance).toLocaleDateString() : 'N/A'}`, 20, yPosition)
    yPosition += 15
    
    // Vehicle and Driver Information
    doc.setFontSize(14)
    doc.text('Vehicle & Driver Information', 14, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Vehicle: ${dispatch.vehicles ? `${dispatch.vehicles.reg_number}${dispatch.vehicles.trim ? ` (${dispatch.vehicles.trim})` : ''}${dispatch.vehicles.year ? ` - ${dispatch.vehicles.year}` : ''}` : 'N/A'}`, 20, yPosition)
    yPosition += 8
    doc.text(`Driver: N/A`, 20, yPosition)
    yPosition += 15
    
    // Timestamps
    doc.setFontSize(14)
    doc.text('Timestamps', 14, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Created At: ${dispatch.created_at ? new Date(dispatch.created_at).toLocaleDateString() : 'N/A'}`, 20, yPosition)
    yPosition += 8
    doc.text(`Updated At: ${dispatch.updated_at ? new Date(dispatch.updated_at).toLocaleDateString() : 'N/A'}`, 20, yPosition)
    
    doc.save(`dispatch-${dispatch.id}.pdf`)
  }

  const handleViewPrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Vehicle Dispatch Details Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #333; margin: 0; }
              .header h2 { color: #666; margin: 5px 0; }
              .section { margin-bottom: 25px; }
              .section h3 { color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; display: inline-block; width: 150px; }
              .value { color: #555; }
              .meta { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Vehicle Dispatch Details Report</h1>
              <h2>Dispatch ID: ${dispatch.id}</h2>
            </div>
            
            <div class="section">
              <h3>Basic Information</h3>
              <div class="field">
                <span class="label">Dispatch ID:</span>
                <span class="value">${dispatch.id}</span>
              </div>
              <div class="field">
                <span class="label">Region:</span>
                <span class="value">${dispatch.region}</span>
              </div>
              <div class="field">
                <span class="label">District:</span>
                <span class="value">${dispatch.district}</span>
              </div>
              <div class="field">
                <span class="label">Assigned To:</span>
                <span class="value">${dispatch.assigned_to}</span>
              </div>
              <div class="field">
                <span class="label">Received By:</span>
                <span class="value">${dispatch.received_by}</span>
              </div>
              <div class="field">
                <span class="label">Purpose:</span>
                <span class="value">${dispatch.purpose || 'N/A'}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>Important Dates</h3>
              <div class="field">
                <span class="label">Dispatch Date:</span>
                <span class="value">${dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Expected Return Date:</span>
                <span class="value">${dispatch.expected_return_date ? new Date(dispatch.expected_return_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">First Maintenance Date:</span>
                <span class="value">${dispatch.first_maintenance ? new Date(dispatch.first_maintenance).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>Vehicle & Driver Information</h3>
              <div class="field">
                <span class="label">Vehicle:</span>
                <span class="value">${dispatch.vehicles ? `${dispatch.vehicles.reg_number}${dispatch.vehicles.trim ? ` (${dispatch.vehicles.trim})` : ''}${dispatch.vehicles.year ? ` - ${dispatch.vehicles.year}` : ''}` : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Driver:</span>
                <span class="value">N/A</span>
              </div>
            </div>
            
            <div class="section">
              <h3>Timestamps</h3>
              <div class="field">
                <span class="label">Created At:</span>
                <span class="value">${dispatch.created_at ? new Date(dispatch.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Updated At:</span>
                <span class="value">${dispatch.updated_at ? new Date(dispatch.updated_at).toLocaleDateString() : 'N/A'}</span>
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
            Vehicle Dispatch Details
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
                  Region
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {dispatch.region}
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
                  {dispatch.district}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Assigned To
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {dispatch.assigned_to}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Received By
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {dispatch.received_by}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Purpose
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {dispatch.purpose || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div className={`p-4 rounded-3xl border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Important Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Dispatch Date
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Expected Return Date
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {dispatch.expected_return_date ? new Date(dispatch.expected_return_date).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  First Maintenance Date
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {dispatch.first_maintenance ? new Date(dispatch.first_maintenance).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle & Driver Information */}
          <div className={`p-4 rounded-3xl border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Vehicle & Driver Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Vehicle
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {dispatch.vehicles ? `${dispatch.vehicles.reg_number}${dispatch.vehicles.trim ? ` (${dispatch.vehicles.trim})` : ''}${dispatch.vehicles.year ? ` - ${dispatch.vehicles.year}` : ''}` : 'N/A'}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Driver
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  N/A
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
                  {dispatch.created_at ? new Date(dispatch.created_at).toLocaleString() : 'N/A'}
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
                  {dispatch.updated_at ? new Date(dispatch.updated_at).toLocaleString() : 'N/A'}
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
                  Dispatch ID
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {dispatch.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
