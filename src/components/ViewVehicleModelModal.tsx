'use client'

import React from 'react'
import { X, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface VehicleModel {
  id: string
  name: string
  description: string | null
  vehicle_make_id: string
  created_at: string | null
  updated_at: string | null
  vehicle_make: {
    id: string
    name: string
  }
}

interface ViewVehicleModelModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleModel: VehicleModel | null
}

export default function ViewVehicleModelModal({ isOpen, onClose, vehicleModel }: ViewVehicleModelModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen || !vehicleModel) return null

  const handleExportExcel = () => {
    const data = [
      ['Field', 'Value'],
      ['Model Name', vehicleModel.name],
      ['Make', vehicleModel.vehicle_make.name],
      ['Description', vehicleModel.description || 'N/A'],
      ['Created At', vehicleModel.created_at ? new Date(vehicleModel.created_at).toLocaleString() : 'N/A'],
      ['Updated At', vehicleModel.updated_at ? new Date(vehicleModel.updated_at).toLocaleString() : 'N/A']
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Model Details')
    XLSX.writeFile(wb, `vehicle-model-${vehicleModel.id}.xlsx`)
  }

  const handleExportCSV = () => {
    const data = [
      ['Field', 'Value'],
      ['Model Name', vehicleModel.name],
      ['Make', vehicleModel.vehicle_make.name],
      ['Description', vehicleModel.description || 'N/A'],
      ['Created At', vehicleModel.created_at ? new Date(vehicleModel.created_at).toLocaleString() : 'N/A'],
      ['Updated At', vehicleModel.updated_at ? new Date(vehicleModel.updated_at).toLocaleString() : 'N/A']
    ]

    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vehicle-model-${vehicleModel.id}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Vehicle Model Details', 20, 30)
    
    // Basic Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Basic Information', 20, 50)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Model Name: ${vehicleModel.name}`, 20, 60)
    doc.text(`Make: ${vehicleModel.vehicle_make.name}`, 20, 70)
    doc.text(`Description: ${vehicleModel.description || 'N/A'}`, 20, 80)
    
    // Timestamps
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Timestamps', 20, 100)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Created At: ${vehicleModel.created_at ? new Date(vehicleModel.created_at).toLocaleString() : 'N/A'}`, 20, 110)
    doc.text(`Updated At: ${vehicleModel.updated_at ? new Date(vehicleModel.updated_at).toLocaleString() : 'N/A'}`, 20, 120)
    
    doc.save(`vehicle-model-${vehicleModel.id}.pdf`)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Vehicle Model Details</title>
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
            <div class="header">Vehicle Model Details</div>
            
            <div class="section">
              <div class="section-title">Basic Information</div>
              <div class="field">
                <span class="label">Model Name:</span>
                <span class="value">${vehicleModel.name}</span>
              </div>
              <div class="field">
                <span class="label">Make:</span>
                <span class="value">${vehicleModel.vehicle_make.name}</span>
              </div>
              <div class="field">
                <span class="label">Description:</span>
                <span class="value">${vehicleModel.description || 'N/A'}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Timestamps</div>
              <div class="field">
                <span class="label">Created At:</span>
                <span class="value">${vehicleModel.created_at ? new Date(vehicleModel.created_at).toLocaleString() : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Updated At:</span>
                <span class="value">${vehicleModel.updated_at ? new Date(vehicleModel.updated_at).toLocaleString() : 'N/A'}</span>
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
          <h2 className="text-xl font-bold text-gray-900">Vehicle Model Details</h2>
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
                <p className="text-sm font-medium text-gray-700">Model Name</p>
                <p className="text-gray-900">{vehicleModel.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Make</p>
                <p className="text-gray-900">{vehicleModel.vehicle_make.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-gray-900">{vehicleModel.description || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Timestamps</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Created At</p>
                <p className="text-gray-900">{vehicleModel.created_at ? new Date(vehicleModel.created_at).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Updated At</p>
                <p className="text-gray-900">{vehicleModel.updated_at ? new Date(vehicleModel.updated_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}