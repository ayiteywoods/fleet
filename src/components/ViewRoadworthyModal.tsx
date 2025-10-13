'use client'

import { useState } from 'react'
import { X, Calendar, Building, Car, FileText, FileSpreadsheet, FileText as FileTextIcon, FileImage, Printer } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ViewRoadworthyModalProps {
  isOpen: boolean
  onClose: () => void
  roadworthyRecord: any
}

export default function ViewRoadworthyModal({ isOpen, onClose, roadworthyRecord }: ViewRoadworthyModalProps) {
  const { themeMode } = useTheme()

  const handleExportExcel = () => {
    if (!roadworthyRecord) return

    const data = [
      ['Field', 'Value'],
      ['Company', roadworthyRecord.company || 'N/A'],
      ['Vehicle Number', roadworthyRecord.vehicle_number || 'N/A'],
      ['Vehicle Type', roadworthyRecord.vehicle_type || 'N/A'],
      ['Roadworthy Status', roadworthyRecord.roadworth_status || 'N/A'],
      ['Date Issued', roadworthyRecord.date_issued ? new Date(roadworthyRecord.date_issued).toLocaleDateString() : 'N/A'],
      ['Date Expired', roadworthyRecord.date_expired ? new Date(roadworthyRecord.date_expired).toLocaleDateString() : 'N/A'],
      ['Updated By', roadworthyRecord.updated_by || 'N/A'],
      ['Created At', roadworthyRecord.created_at ? new Date(roadworthyRecord.created_at).toLocaleString() : 'N/A'],
      ['Last Updated', roadworthyRecord.updated_at ? new Date(roadworthyRecord.updated_at).toLocaleString() : 'N/A']
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Roadworthy Details')
    XLSX.writeFile(workbook, `roadworthy-details-${roadworthyRecord.vehicle_number || 'record'}.xlsx`)
  }

  const handleExportCSV = () => {
    if (!roadworthyRecord) return

    const data = [
      ['Field', 'Value'],
      ['Company', roadworthyRecord.company || 'N/A'],
      ['Vehicle Number', roadworthyRecord.vehicle_number || 'N/A'],
      ['Vehicle Type', roadworthyRecord.vehicle_type || 'N/A'],
      ['Roadworthy Status', roadworthyRecord.roadworth_status || 'N/A'],
      ['Date Issued', roadworthyRecord.date_issued ? new Date(roadworthyRecord.date_issued).toLocaleDateString() : 'N/A'],
      ['Date Expired', roadworthyRecord.date_expired ? new Date(roadworthyRecord.date_expired).toLocaleDateString() : 'N/A'],
      ['Updated By', roadworthyRecord.updated_by || 'N/A'],
      ['Created At', roadworthyRecord.created_at ? new Date(roadworthyRecord.created_at).toLocaleString() : 'N/A'],
      ['Last Updated', roadworthyRecord.updated_at ? new Date(roadworthyRecord.updated_at).toLocaleString() : 'N/A']
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roadworthy-details-${roadworthyRecord.vehicle_number || 'record'}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    if (!roadworthyRecord) return

    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('Roadworthy Details', 20, 20)
    
    // Add data
    const data = [
      ['Field', 'Value'],
      ['Company', roadworthyRecord.company || 'N/A'],
      ['Vehicle Number', roadworthyRecord.vehicle_number || 'N/A'],
      ['Vehicle Type', roadworthyRecord.vehicle_type || 'N/A'],
      ['Roadworthy Status', roadworthyRecord.roadworth_status || 'N/A'],
      ['Date Issued', roadworthyRecord.date_issued ? new Date(roadworthyRecord.date_issued).toLocaleDateString() : 'N/A'],
      ['Date Expired', roadworthyRecord.date_expired ? new Date(roadworthyRecord.date_expired).toLocaleDateString() : 'N/A'],
      ['Updated By', roadworthyRecord.updated_by || 'N/A'],
      ['Created At', roadworthyRecord.created_at ? new Date(roadworthyRecord.created_at).toLocaleString() : 'N/A'],
      ['Last Updated', roadworthyRecord.updated_at ? new Date(roadworthyRecord.updated_at).toLocaleString() : 'N/A']
    ]

    // @ts-ignore
    doc.autoTable({
      head: [data[0]],
      body: data.slice(1),
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    })

    doc.save(`roadworthy-details-${roadworthyRecord.vehicle_number || 'record'}.pdf`)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <html>
        <head>
          <title>Roadworthy Details - ${roadworthyRecord.vehicle_number || 'Record'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-weight: bold; color: #555; }
            .info-value { margin-left: 10px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Roadworthy Details</h1>
            <p>Vehicle Number: ${roadworthyRecord.vehicle_number || 'N/A'}</p>
          </div>

          <div class="section">
            <div class="section-title">Roadworthy Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Company:</span>
                <span class="info-value">${roadworthyRecord.company || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Vehicle Number:</span>
                <span class="info-value">${roadworthyRecord.vehicle_number || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Vehicle Type:</span>
                <span class="info-value">${roadworthyRecord.vehicle_type || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value">${roadworthyRecord.roadworth_status || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Date Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Date Issued:</span>
                <span class="info-value">${roadworthyRecord.date_issued ? new Date(roadworthyRecord.date_issued).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date Expired:</span>
                <span class="info-value">${roadworthyRecord.date_expired ? new Date(roadworthyRecord.date_expired).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Additional Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Updated By:</span>
                <span class="info-value">${roadworthyRecord.updated_by || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Created At:</span>
                <span class="info-value">${roadworthyRecord.created_at ? new Date(roadworthyRecord.created_at).toLocaleString() : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Updated:</span>
                <span class="info-value">${roadworthyRecord.updated_at ? new Date(roadworthyRecord.updated_at).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  if (!isOpen || !roadworthyRecord) return null

  return (
    <div 
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`relative p-6 rounded-xl shadow-lg w-full max-w-4xl mx-4 my-8 ${themeMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-bold">Roadworthy Details</h2>
          
          <div className="flex items-center gap-3">
            {/* Export Buttons */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-sm font-medium">Excel</span>
            </button>
            
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              <FileTextIcon className="w-4 h-4" />
              <span className="text-sm font-medium">CSV</span>
            </button>
            
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              <FileImage className="w-4 h-4" />
              <span className="text-sm font-medium">PDF</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm font-medium">Print</span>
            </button>
            
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6">
          {/* Roadworthy Information */}
          <div className={`p-6 rounded-xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Roadworthy Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Company</label>
                <p className="text-gray-900 dark:text-white">{roadworthyRecord.company || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle Number</label>
                <p className="text-gray-900 dark:text-white">{roadworthyRecord.vehicle_number || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle Type</label>
                <p className="text-gray-900 dark:text-white">{roadworthyRecord.vehicle_type || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  roadworthyRecord.roadworth_status === 'valid' ? 'bg-green-100 text-green-800' :
                  roadworthyRecord.roadworth_status === 'expired' ? 'bg-red-100 text-red-800' :
                  roadworthyRecord.roadworth_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {roadworthyRecord.roadworth_status || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className={`p-6 rounded-xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Date Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date Issued</label>
                <p className="text-gray-900 dark:text-white">
                  {roadworthyRecord.date_issued ? new Date(roadworthyRecord.date_issued).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date Expired</label>
                <p className="text-gray-900 dark:text-white">
                  {roadworthyRecord.date_expired ? new Date(roadworthyRecord.date_expired).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className={`p-6 rounded-xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Updated By</label>
                <p className="text-gray-900 dark:text-white">{roadworthyRecord.updated_by || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created At</label>
                <p className="text-gray-900 dark:text-white">
                  {roadworthyRecord.created_at ? new Date(roadworthyRecord.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Updated At</label>
                <p className="text-gray-900 dark:text-white">
                  {roadworthyRecord.updated_at ? new Date(roadworthyRecord.updated_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-2xl text-sm font-medium ${
              themeMode === 'dark'
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}