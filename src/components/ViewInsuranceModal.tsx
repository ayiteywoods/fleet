'use client'

import { useState } from 'react'
import { X, Calendar, DollarSign, Building, FileText, Car, FileSpreadsheet, FileText as FileTextIcon, FileImage, Printer } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ViewInsuranceModalProps {
  isOpen: boolean
  onClose: () => void
  insuranceRecord: any
}

export default function ViewInsuranceModal({ isOpen, onClose, insuranceRecord }: ViewInsuranceModalProps) {
  const { themeMode } = useTheme()

  const handleExportExcel = () => {
    if (!insuranceRecord) return

    const data = [
      ['Field', 'Value'],
      ['Policy Number', insuranceRecord.policy_number || 'N/A'],
      ['Insurance Company', insuranceRecord.insurance_company || 'N/A'],
      ['Coverage Type', insuranceRecord.coverage_type || 'N/A'],
      ['Premium Amount', `₵${insuranceRecord.premium_amount || 'N/A'}`],
      ['Start Date', insuranceRecord.start_date ? new Date(insuranceRecord.start_date).toLocaleDateString() : 'N/A'],
      ['End Date', insuranceRecord.end_date ? new Date(insuranceRecord.end_date).toLocaleDateString() : 'N/A'],
      ['Notes', insuranceRecord.notes || 'No notes available'],
      ['Vehicle Registration', insuranceRecord.vehicle?.reg_number || 'N/A'],
      ['Vehicle Model', insuranceRecord.vehicle?.trim || 'N/A'],
      ['Vehicle Year', insuranceRecord.vehicle?.year || 'N/A'],
      ['Vehicle Color', insuranceRecord.vehicle?.color || 'N/A'],
      ['Created At', insuranceRecord.created_at ? new Date(insuranceRecord.created_at).toLocaleString() : 'N/A'],
      ['Last Updated', insuranceRecord.updated_at ? new Date(insuranceRecord.updated_at).toLocaleString() : 'N/A']
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Insurance Details')
    XLSX.writeFile(workbook, `insurance-details-${insuranceRecord.policy_number || 'record'}.xlsx`)
  }

  const handleExportCSV = () => {
    if (!insuranceRecord) return

    const data = [
      ['Field', 'Value'],
      ['Policy Number', insuranceRecord.policy_number || 'N/A'],
      ['Insurance Company', insuranceRecord.insurance_company || 'N/A'],
      ['Coverage Type', insuranceRecord.coverage_type || 'N/A'],
      ['Premium Amount', `₵${insuranceRecord.premium_amount || 'N/A'}`],
      ['Start Date', insuranceRecord.start_date ? new Date(insuranceRecord.start_date).toLocaleDateString() : 'N/A'],
      ['End Date', insuranceRecord.end_date ? new Date(insuranceRecord.end_date).toLocaleDateString() : 'N/A'],
      ['Notes', insuranceRecord.notes || 'No notes available'],
      ['Vehicle Registration', insuranceRecord.vehicle?.reg_number || 'N/A'],
      ['Vehicle Model', insuranceRecord.vehicle?.trim || 'N/A'],
      ['Vehicle Year', insuranceRecord.vehicle?.year || 'N/A'],
      ['Vehicle Color', insuranceRecord.vehicle?.color || 'N/A'],
      ['Created At', insuranceRecord.created_at ? new Date(insuranceRecord.created_at).toLocaleString() : 'N/A'],
      ['Last Updated', insuranceRecord.updated_at ? new Date(insuranceRecord.updated_at).toLocaleString() : 'N/A']
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `insurance-details-${insuranceRecord.policy_number || 'record'}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    if (!insuranceRecord) return

    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('Insurance Details', 20, 20)
    
    // Add data
    const data = [
      ['Field', 'Value'],
      ['Policy Number', insuranceRecord.policy_number || 'N/A'],
      ['Insurance Company', insuranceRecord.insurance_company || 'N/A'],
      ['Coverage Type', insuranceRecord.coverage_type || 'N/A'],
      ['Premium Amount', `₵${insuranceRecord.premium_amount || 'N/A'}`],
      ['Start Date', insuranceRecord.start_date ? new Date(insuranceRecord.start_date).toLocaleDateString() : 'N/A'],
      ['End Date', insuranceRecord.end_date ? new Date(insuranceRecord.end_date).toLocaleDateString() : 'N/A'],
      ['Notes', insuranceRecord.notes || 'No notes available'],
      ['Vehicle Registration', insuranceRecord.vehicle?.reg_number || 'N/A'],
      ['Vehicle Model', insuranceRecord.vehicle?.trim || 'N/A'],
      ['Vehicle Year', insuranceRecord.vehicle?.year || 'N/A'],
      ['Vehicle Color', insuranceRecord.vehicle?.color || 'N/A']
    ]

    // @ts-ignore
    doc.autoTable({
      head: [data[0]],
      body: data.slice(1),
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    })

    doc.save(`insurance-details-${insuranceRecord.policy_number || 'record'}.pdf`)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <html>
        <head>
          <title>Insurance Details - ${insuranceRecord.policy_number || 'Record'}</title>
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
            <h1>Insurance Details</h1>
            <p>Policy Number: ${insuranceRecord.policy_number || 'N/A'}</p>
          </div>

          <div class="section">
            <div class="section-title">Policy Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Policy Number:</span>
                <span class="info-value">${insuranceRecord.policy_number || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Insurance Company:</span>
                <span class="info-value">${insuranceRecord.insurance_company || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Coverage Type:</span>
                <span class="info-value">${insuranceRecord.coverage_type || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Premium Amount:</span>
                <span class="info-value">₵${insuranceRecord.premium_amount || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Date Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Start Date:</span>
                <span class="info-value">${insuranceRecord.start_date ? new Date(insuranceRecord.start_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">End Date:</span>
                <span class="info-value">${insuranceRecord.end_date ? new Date(insuranceRecord.end_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Additional Information</div>
            <div class="info-item">
              <span class="info-label">Notes:</span>
              <div class="info-value" style="margin-top: 5px;">${insuranceRecord.notes || 'No notes available'}</div>
            </div>
          </div>

          ${insuranceRecord.vehicle ? `
          <div class="section">
            <div class="section-title">Vehicle Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Registration Number:</span>
                <span class="info-value">${insuranceRecord.vehicle.reg_number || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Vehicle Model:</span>
                <span class="info-value">${insuranceRecord.vehicle.trim || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Year:</span>
                <span class="info-value">${insuranceRecord.vehicle.year || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Color:</span>
                <span class="info-value">${insuranceRecord.vehicle.color || 'N/A'}</span>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Record Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Created At:</span>
                <span class="info-value">${insuranceRecord.created_at ? new Date(insuranceRecord.created_at).toLocaleString() : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Updated:</span>
                <span class="info-value">${insuranceRecord.updated_at ? new Date(insuranceRecord.updated_at).toLocaleString() : 'N/A'}</span>
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

  if (!isOpen || !insuranceRecord) return null

  return (
    <div 
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`relative p-6 rounded-xl shadow-lg w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto ${themeMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-bold">Insurance Details</h2>
          
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
          {/* Policy Information */}
          <div className={`p-6 rounded-xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Policy Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Policy Number</label>
                <p className="text-gray-900 dark:text-white">{insuranceRecord.policy_number || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Insurance Company</label>
                <p className="text-gray-900 dark:text-white">{insuranceRecord.insurance_company || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Coverage Type</label>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  insuranceRecord.coverage_type === 'comprehensive' ? 'bg-green-100 text-green-800' :
                  insuranceRecord.coverage_type === 'third_party' ? 'bg-blue-100 text-blue-800' :
                  insuranceRecord.coverage_type === 'fire_theft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {insuranceRecord.coverage_type || 'N/A'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Premium Amount</label>
                <p className="text-gray-900 dark:text-white">₵{insuranceRecord.premium_amount || 'N/A'}</p>
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
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                <p className="text-gray-900 dark:text-white">
                  {insuranceRecord.start_date ? new Date(insuranceRecord.start_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                <p className="text-gray-900 dark:text-white">
                  {insuranceRecord.end_date ? new Date(insuranceRecord.end_date).toLocaleDateString() : 'N/A'}
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
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</label>
              <p className="text-gray-900 dark:text-white">{insuranceRecord.notes || 'No notes available'}</p>
            </div>
          </div>

          {/* Vehicle Information */}
          {insuranceRecord.vehicle && (
            <div className={`p-6 rounded-xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Registration Number</label>
                  <p className="text-gray-900 dark:text-white">{insuranceRecord.vehicle.reg_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle Model</label>
                  <p className="text-gray-900 dark:text-white">{insuranceRecord.vehicle.trim || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Year</label>
                  <p className="text-gray-900 dark:text-white">{insuranceRecord.vehicle.year || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Color</label>
                  <p className="text-gray-900 dark:text-white">{insuranceRecord.vehicle.color || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
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