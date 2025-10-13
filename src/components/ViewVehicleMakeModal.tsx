'use client'

import React from 'react'
import { X, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface VehicleMake {
  id: string
  name: string
  created_at: string
  updated_at: string
}

interface ViewVehicleMakeModalProps {
  isOpen: boolean
  onClose: () => void
  make: VehicleMake
}

export default function ViewVehicleMakeModal({ isOpen, onClose, make }: ViewVehicleMakeModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen) return null

  const handleExportExcel = () => {
    const data = [
      ['Field', 'Value'],
      ['Make Name', make.name],
      ['Created At', new Date(make.created_at).toLocaleString()],
      ['Updated At', new Date(make.updated_at).toLocaleString()]
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Make Details')
    XLSX.writeFile(wb, `vehicle-make-${make.id}.xlsx`)
  }

  const handleExportCSV = () => {
    const data = [
      ['Field', 'Value'],
      ['Make Name', make.name],
      ['Created At', new Date(make.created_at).toLocaleString()],
      ['Updated At', new Date(make.updated_at).toLocaleString()]
    ]

    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vehicle-make-${make.id}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Vehicle Make Details', 20, 30)
    
    // Basic Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Basic Information', 20, 50)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Make Name: ${make.name}`, 20, 60)
    
    // Timestamps
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Timestamps', 20, 80)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Created At: ${new Date(make.created_at).toLocaleString()}`, 20, 90)
    doc.text(`Updated At: ${new Date(make.updated_at).toLocaleString()}`, 20, 100)
    
    doc.save(`vehicle-make-${make.id}.pdf`)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Vehicle Make Details</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { font-size: 24px; font-weight: bold; margin-bottom: 30px; }
              .section { margin-bottom: 30px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; }
              .value { margin-left: 10px; }
            </style>
          </head>
          <body>
            <div class="header">Vehicle Make Details</div>
            
            <div class="section">
              <div class="section-title">Basic Information</div>
              <div class="field">
                <span class="label">Make Name:</span>
                <span class="value">${make.name}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Timestamps</div>
              <div class="field">
                <span class="label">Created At:</span>
                <span class="value">${new Date(make.created_at).toLocaleString()}</span>
              </div>
              <div class="field">
                <span class="label">Updated At:</span>
                <span class="value">${new Date(make.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-slate-50 rounded-3xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Vehicle Make Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-slate-50">
          {/* Basic Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Make Name</p>
                <p className="text-gray-900">{make.name}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Timestamps</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Created At</p>
                <p className="text-gray-900">{new Date(make.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Updated At</p>
                <p className="text-gray-900">{new Date(make.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}