'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { X, FileSpreadsheet, FileText, FileImage, Printer } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ViewFuelLogModalProps {
  isOpen: boolean
  onClose: () => void
  fuelLogRecord: any
}

export default function ViewFuelLogModal({ isOpen, onClose, fuelLogRecord }: ViewFuelLogModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen || !fuelLogRecord) return null

  const handleExportExcel = () => {
    if (!fuelLogRecord) return

    const data = [
      ['Field', 'Value'],
      ['Refuel Date', fuelLogRecord.refuel_date ? new Date(fuelLogRecord.refuel_date).toLocaleDateString() : 'N/A'],
      ['Fuel Type', fuelLogRecord.fuel_type || 'N/A'],
      ['Vendor', fuelLogRecord.vendor || 'N/A'],
      ['Receipt Number', fuelLogRecord.receipt_number || 'N/A'],
      ['Quantity', fuelLogRecord.quantity ? `${fuelLogRecord.quantity} L` : 'N/A'],
      ['Unit Cost', fuelLogRecord.unit_cost ? `₵${fuelLogRecord.unit_cost}` : 'N/A'],
      ['Total Cost', fuelLogRecord.total_cost ? `₵${fuelLogRecord.total_cost}` : 'N/A'],
      ['Mileage Before', fuelLogRecord.mileage_before ? `${fuelLogRecord.mileage_before} KM` : 'N/A'],
      ['Mileage After', fuelLogRecord.mileage_after ? `${fuelLogRecord.mileage_after} KM` : 'N/A'],
      ['Distance Traveled', fuelLogRecord.mileage_before && fuelLogRecord.mileage_after ? `${fuelLogRecord.mileage_after - fuelLogRecord.mileage_before} KM` : 'N/A'],
      ['Fuel Efficiency', fuelLogRecord.mileage_before && fuelLogRecord.mileage_after && fuelLogRecord.quantity ? `${((fuelLogRecord.mileage_after - fuelLogRecord.mileage_before) / fuelLogRecord.quantity).toFixed(2)} KM/L` : 'N/A'],
      ['Driver', fuelLogRecord.driver_operators?.name || 'N/A'],
      ['Vehicle', fuelLogRecord.vehicles?.reg_number || 'N/A'],
      ['Notes', fuelLogRecord.notes || 'No notes available'],
      ['Created At', fuelLogRecord.created_at ? new Date(fuelLogRecord.created_at).toLocaleString() : 'N/A'],
      ['Last Updated', fuelLogRecord.updated_at ? new Date(fuelLogRecord.updated_at).toLocaleString() : 'N/A']
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fuel Log Details')
    XLSX.writeFile(workbook, `fuel-log-details-${fuelLogRecord.receipt_number || 'record'}.xlsx`)
  }

  const handleExportCSV = () => {
    if (!fuelLogRecord) return

    const data = [
      ['Field', 'Value'],
      ['Refuel Date', fuelLogRecord.refuel_date ? new Date(fuelLogRecord.refuel_date).toLocaleDateString() : 'N/A'],
      ['Fuel Type', fuelLogRecord.fuel_type || 'N/A'],
      ['Vendor', fuelLogRecord.vendor || 'N/A'],
      ['Receipt Number', fuelLogRecord.receipt_number || 'N/A'],
      ['Quantity', fuelLogRecord.quantity ? `${fuelLogRecord.quantity} L` : 'N/A'],
      ['Unit Cost', fuelLogRecord.unit_cost ? `₵${fuelLogRecord.unit_cost}` : 'N/A'],
      ['Total Cost', fuelLogRecord.total_cost ? `₵${fuelLogRecord.total_cost}` : 'N/A'],
      ['Mileage Before', fuelLogRecord.mileage_before ? `${fuelLogRecord.mileage_before} KM` : 'N/A'],
      ['Mileage After', fuelLogRecord.mileage_after ? `${fuelLogRecord.mileage_after} KM` : 'N/A'],
      ['Distance Traveled', fuelLogRecord.mileage_before && fuelLogRecord.mileage_after ? `${fuelLogRecord.mileage_after - fuelLogRecord.mileage_before} KM` : 'N/A'],
      ['Fuel Efficiency', fuelLogRecord.mileage_before && fuelLogRecord.mileage_after && fuelLogRecord.quantity ? `${((fuelLogRecord.mileage_after - fuelLogRecord.mileage_before) / fuelLogRecord.quantity).toFixed(2)} KM/L` : 'N/A'],
      ['Driver', fuelLogRecord.driver_operators?.name || 'N/A'],
      ['Vehicle', fuelLogRecord.vehicles?.reg_number || 'N/A'],
      ['Notes', fuelLogRecord.notes || 'No notes available'],
      ['Created At', fuelLogRecord.created_at ? new Date(fuelLogRecord.created_at).toLocaleString() : 'N/A'],
      ['Last Updated', fuelLogRecord.updated_at ? new Date(fuelLogRecord.updated_at).toLocaleString() : 'N/A']
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fuel-log-details-${fuelLogRecord.receipt_number || 'record'}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    if (!fuelLogRecord) return

    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('Fuel Log Details', 20, 20)
    
    // Add data
    const data = [
      ['Field', 'Value'],
      ['Refuel Date', fuelLogRecord.refuel_date ? new Date(fuelLogRecord.refuel_date).toLocaleDateString() : 'N/A'],
      ['Fuel Type', fuelLogRecord.fuel_type || 'N/A'],
      ['Vendor', fuelLogRecord.vendor || 'N/A'],
      ['Receipt Number', fuelLogRecord.receipt_number || 'N/A'],
      ['Quantity', fuelLogRecord.quantity ? `${fuelLogRecord.quantity} L` : 'N/A'],
      ['Unit Cost', fuelLogRecord.unit_cost ? `₵${fuelLogRecord.unit_cost}` : 'N/A'],
      ['Total Cost', fuelLogRecord.total_cost ? `₵${fuelLogRecord.total_cost}` : 'N/A'],
      ['Mileage Before', fuelLogRecord.mileage_before ? `${fuelLogRecord.mileage_before} KM` : 'N/A'],
      ['Mileage After', fuelLogRecord.mileage_after ? `${fuelLogRecord.mileage_after} KM` : 'N/A'],
      ['Distance Traveled', fuelLogRecord.mileage_before && fuelLogRecord.mileage_after ? `${fuelLogRecord.mileage_after - fuelLogRecord.mileage_before} KM` : 'N/A'],
      ['Fuel Efficiency', fuelLogRecord.mileage_before && fuelLogRecord.mileage_after && fuelLogRecord.quantity ? `${((fuelLogRecord.mileage_after - fuelLogRecord.mileage_before) / fuelLogRecord.quantity).toFixed(2)} KM/L` : 'N/A'],
      ['Driver', fuelLogRecord.driver_operators?.name || 'N/A'],
      ['Vehicle', fuelLogRecord.vehicles?.reg_number || 'N/A'],
      ['Notes', fuelLogRecord.notes || 'No notes available']
    ]

    // @ts-ignore
    doc.autoTable({
      head: [data[0]],
      body: data.slice(1),
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    })

    doc.save(`fuel-log-details-${fuelLogRecord.receipt_number || 'record'}.pdf`)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <html>
        <head>
          <title>Fuel Log Details - ${fuelLogRecord.receipt_number || 'Record'}</title>
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
            <h1>Fuel Log Details</h1>
            <p>Receipt Number: ${fuelLogRecord.receipt_number || 'N/A'}</p>
          </div>

          <div class="section">
            <div class="section-title">Basic Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Refuel Date:</span>
                <span class="info-value">${fuelLogRecord.refuel_date ? new Date(fuelLogRecord.refuel_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Fuel Type:</span>
                <span class="info-value">${fuelLogRecord.fuel_type || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Vendor:</span>
                <span class="info-value">${fuelLogRecord.vendor || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Receipt Number:</span>
                <span class="info-value">${fuelLogRecord.receipt_number || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Cost Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Quantity:</span>
                <span class="info-value">${fuelLogRecord.quantity ? `${fuelLogRecord.quantity} L` : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Unit Cost:</span>
                <span class="info-value">${fuelLogRecord.unit_cost ? `₵${fuelLogRecord.unit_cost}` : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total Cost:</span>
                <span class="info-value">${fuelLogRecord.total_cost ? `₵${fuelLogRecord.total_cost}` : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Cost per Liter:</span>
                <span class="info-value">${fuelLogRecord.unit_cost ? `₵${fuelLogRecord.unit_cost}` : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Mileage Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Mileage Before:</span>
                <span class="info-value">${fuelLogRecord.mileage_before ? `${fuelLogRecord.mileage_before} KM` : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Mileage After:</span>
                <span class="info-value">${fuelLogRecord.mileage_after ? `${fuelLogRecord.mileage_after} KM` : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Distance Traveled:</span>
                <span class="info-value">${fuelLogRecord.mileage_before && fuelLogRecord.mileage_after ? `${fuelLogRecord.mileage_after - fuelLogRecord.mileage_before} KM` : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Fuel Efficiency:</span>
                <span class="info-value">${fuelLogRecord.mileage_before && fuelLogRecord.mileage_after && fuelLogRecord.quantity ? `${((fuelLogRecord.mileage_after - fuelLogRecord.mileage_before) / fuelLogRecord.quantity).toFixed(2)} KM/L` : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Additional Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Driver:</span>
                <span class="info-value">${fuelLogRecord.driver_operators?.name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Vehicle:</span>
                <span class="info-value">${fuelLogRecord.vehicles?.reg_number || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Created:</span>
                <span class="info-value">${fuelLogRecord.created_at ? new Date(fuelLogRecord.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Updated:</span>
                <span class="info-value">${fuelLogRecord.updated_at ? new Date(fuelLogRecord.updated_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          ${fuelLogRecord.notes ? `
          <div class="section">
            <div class="section-title">Notes</div>
            <div class="info-item">
              <span class="info-label">Notes:</span>
              <div class="info-value" style="margin-top: 5px;">${fuelLogRecord.notes}</div>
            </div>
          </div>
          ` : ''}
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

  return (
    <div 
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`${themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} px-6 py-4 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Fuel Log Details
            </h2>
            
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
                <FileText className="w-4 h-4" />
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
              
              <button
                onClick={onClose}
                className={`p-2 rounded-full ${themeMode === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className={`${themeMode === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-xl border border-gray-200 dark:border-gray-600 p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Refuel Date:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.refuel_date ? new Date(fuelLogRecord.refuel_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Fuel Type:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.fuel_type || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Vendor:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.vendor || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Receipt Number:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.receipt_number || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost Information */}
            <div className={`${themeMode === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-xl border border-gray-200 dark:border-gray-600 p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Cost Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Quantity:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.quantity ? `${fuelLogRecord.quantity} L` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Unit Cost:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.unit_cost ? `₵${fuelLogRecord.unit_cost}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Cost:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.total_cost ? `₵${fuelLogRecord.total_cost}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Cost per Liter:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.unit_cost ? `₵${fuelLogRecord.unit_cost}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mileage Information */}
            <div className={`${themeMode === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-xl border border-gray-200 dark:border-gray-600 p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Mileage Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Mileage Before:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.mileage_before ? `${fuelLogRecord.mileage_before} KM` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Mileage After:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.mileage_after ? `${fuelLogRecord.mileage_after} KM` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Distance Traveled:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.mileage_before && fuelLogRecord.mileage_after 
                      ? `${fuelLogRecord.mileage_after - fuelLogRecord.mileage_before} KM` 
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Fuel Efficiency:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.mileage_before && fuelLogRecord.mileage_after && fuelLogRecord.quantity
                      ? `${((fuelLogRecord.mileage_after - fuelLogRecord.mileage_before) / fuelLogRecord.quantity).toFixed(2)} KM/L`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className={`${themeMode === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-xl border border-gray-200 dark:border-gray-600 p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Additional Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Driver:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.driver_operators?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Vehicle:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.vehicles?.reg_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Created:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.created_at ? new Date(fuelLogRecord.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Last Updated:</span>
                  <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {fuelLogRecord.updated_at ? new Date(fuelLogRecord.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {fuelLogRecord.notes && (
            <div className={`${themeMode === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-xl border border-gray-200 dark:border-gray-600 p-6 mt-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Notes
              </h3>
              <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {fuelLogRecord.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}