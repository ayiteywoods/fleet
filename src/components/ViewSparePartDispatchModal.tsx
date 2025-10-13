'use client'

import React from 'react'
import { X, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface SparePartDispatch {
  id: string
  quantity: number
  status: string
  spare_part_request_id: string
  created_at: string | null
  updated_at: string | null
  created_by: number | null
  updated_by: number | null
  spare_part_request: {
    id: string
    quantity: number
    justification: string
    region: string
    district: string
    status: string
    spare_part_inventory_id: string
    vehicle_id: string
    spare_part_inventory: {
      id: string
      part_name: string
      description: string
      supplier_name: string
    }
    vehicles: {
      id: string
      reg_number: string
      trim: string
      year: number
    }
  }
}

interface ViewSparePartDispatchModalProps {
  isOpen: boolean
  onClose: () => void
  dispatch: SparePartDispatch
}

export default function ViewSparePartDispatchModal({ isOpen, onClose, dispatch }: ViewSparePartDispatchModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen) return null

  const handleExportExcel = () => {
    const data = [
      ['Field', 'Value'],
      ['Dispatch ID', dispatch.id],
      ['Quantity', dispatch.quantity],
      ['Status', dispatch.status],
      ['Part Name', dispatch.spare_part_request.spare_part_inventory.part_name],
      ['Supplier', dispatch.spare_part_request.spare_part_inventory.supplier_name],
      ['Justification', dispatch.spare_part_request.justification],
      ['Region', dispatch.spare_part_request.region],
      ['District', dispatch.spare_part_request.district],
      ['Vehicle', `${dispatch.spare_part_request.vehicles.reg_number} (${dispatch.spare_part_request.vehicles.trim})`],
      ['Year', dispatch.spare_part_request.vehicles.year],
      ['Created At', dispatch.created_at ? new Date(dispatch.created_at).toLocaleString() : 'N/A'],
      ['Updated At', dispatch.updated_at ? new Date(dispatch.updated_at).toLocaleString() : 'N/A']
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Spare Part Dispatch Details')
    XLSX.writeFile(wb, `spare-part-dispatch-${dispatch.id}.xlsx`)
  }

  const handleExportCSV = () => {
    const data = [
      ['Field', 'Value'],
      ['Dispatch ID', dispatch.id],
      ['Quantity', dispatch.quantity],
      ['Status', dispatch.status],
      ['Part Name', dispatch.spare_part_request.spare_part_inventory.part_name],
      ['Supplier', dispatch.spare_part_request.spare_part_inventory.supplier_name],
      ['Justification', dispatch.spare_part_request.justification],
      ['Region', dispatch.spare_part_request.region],
      ['District', dispatch.spare_part_request.district],
      ['Vehicle', `${dispatch.spare_part_request.vehicles.reg_number} (${dispatch.spare_part_request.vehicles.trim})`],
      ['Year', dispatch.spare_part_request.vehicles.year],
      ['Created At', dispatch.created_at ? new Date(dispatch.created_at).toLocaleString() : 'N/A'],
      ['Updated At', dispatch.updated_at ? new Date(dispatch.updated_at).toLocaleString() : 'N/A']
    ]

    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spare-part-dispatch-${dispatch.id}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Spare Part Dispatch Details', 20, 30)
    
    // Basic Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Basic Information', 20, 50)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Quantity: ${dispatch.quantity}`, 20, 60)
    doc.text(`Status: ${dispatch.status}`, 20, 70)
    doc.text(`Part Name: ${dispatch.spare_part_request.spare_part_inventory.part_name}`, 20, 80)
    doc.text(`Supplier: ${dispatch.spare_part_request.spare_part_inventory.supplier_name}`, 20, 90)
    
    // Request Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Request Information', 20, 110)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Justification: ${dispatch.spare_part_request.justification}`, 20, 120)
    doc.text(`Region: ${dispatch.spare_part_request.region}`, 20, 130)
    doc.text(`District: ${dispatch.spare_part_request.district}`, 20, 140)
    
    // Vehicle Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Vehicle Information', 20, 160)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Vehicle: ${dispatch.spare_part_request.vehicles.reg_number} (${dispatch.spare_part_request.vehicles.trim})`, 20, 170)
    doc.text(`Year: ${dispatch.spare_part_request.vehicles.year}`, 20, 180)
    
    doc.save(`spare-part-dispatch-${dispatch.id}.pdf`)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Spare Part Dispatch Details</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { font-size: 24px; font-weight: bold; margin-bottom: 30px; }
              .section { margin-bottom: 30px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; }
              .value { margin-left: 10px; }
              .status { 
                display: inline-block; 
                padding: 4px 8px; 
                border-radius: 12px; 
                font-size: 12px; 
                font-weight: bold;
                background-color: ${dispatch.status === 'Approved' ? '#d4edda' : dispatch.status === 'Pending' ? '#fff3cd' : '#f8d7da'};
                color: ${dispatch.status === 'Approved' ? '#155724' : dispatch.status === 'Pending' ? '#856404' : '#721c24'};
              }
            </style>
          </head>
          <body>
            <div class="header">Spare Part Dispatch Details</div>
            
            <div class="section">
              <div class="section-title">Basic Information</div>
              <div class="field">
                <span class="label">Quantity:</span>
                <span class="value">${dispatch.quantity}</span>
              </div>
              <div class="field">
                <span class="label">Status:</span>
                <span class="value"><span class="status">${dispatch.status}</span></span>
              </div>
              <div class="field">
                <span class="label">Part Name:</span>
                <span class="value">${dispatch.spare_part_request.spare_part_inventory.part_name}</span>
              </div>
              <div class="field">
                <span class="label">Supplier:</span>
                <span class="value">${dispatch.spare_part_request.spare_part_inventory.supplier_name}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Request Information</div>
              <div class="field">
                <span class="label">Justification:</span>
                <span class="value">${dispatch.spare_part_request.justification}</span>
              </div>
              <div class="field">
                <span class="label">Region:</span>
                <span class="value">${dispatch.spare_part_request.region}</span>
              </div>
              <div class="field">
                <span class="label">District:</span>
                <span class="value">${dispatch.spare_part_request.district}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Vehicle Information</div>
              <div class="field">
                <span class="label">Vehicle:</span>
                <span class="value">${dispatch.spare_part_request.vehicles.reg_number} (${dispatch.spare_part_request.vehicles.trim})</span>
              </div>
              <div class="field">
                <span class="label">Year:</span>
                <span class="value">${dispatch.spare_part_request.vehicles.year}</span>
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
          <h2 className="text-xl font-bold text-gray-900">Spare Part Dispatch Details</h2>
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
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Quantity</p>
                  <p className="text-gray-900">{dispatch.quantity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    dispatch.status === 'Approved' 
                      ? 'bg-green-100 text-green-700' 
                      : dispatch.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {dispatch.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Part Name</p>
                  <p className="text-gray-900">{dispatch.spare_part_request.spare_part_inventory.part_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Supplier</p>
                  <p className="text-gray-900">{dispatch.spare_part_request.spare_part_inventory.supplier_name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Request Information */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Request Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Justification</p>
                  <p className="text-gray-900">{dispatch.spare_part_request.justification}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Region</p>
                  <p className="text-gray-900">{dispatch.spare_part_request.region}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">District</p>
                  <p className="text-gray-900">{dispatch.spare_part_request.district}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Vehicle</p>
                  <p className="text-gray-900">{dispatch.spare_part_request.vehicles.reg_number} ({dispatch.spare_part_request.vehicles.trim})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Timestamps</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Created At</p>
                  <p className="text-gray-900">
                    {dispatch.created_at ? (() => {
                      try {
                        const date = new Date(dispatch.created_at)
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                      } catch (error) {
                        return 'N/A'
                      }
                    })() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Updated At</p>
                  <p className="text-gray-900">
                    {dispatch.updated_at ? (() => {
                      try {
                        const date = new Date(dispatch.updated_at)
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                      } catch (error) {
                        return 'N/A'
                      }
                    })() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">System Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Dispatch ID</p>
                  <p className="text-gray-900">{dispatch.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}