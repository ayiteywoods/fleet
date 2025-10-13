'use client'

import { useState, useEffect } from 'react'
import { X, FileSpreadsheet, FileText, FileImage, Printer } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ViewMaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  maintenanceRecord: any
}

export default function ViewMaintenanceModal({ isOpen, onClose, maintenanceRecord }: ViewMaintenanceModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen || !maintenanceRecord) return null

  const handleExportExcel = () => {
    if (!maintenanceRecord) return

    const data = [
      ['Field', 'Value'],
      ['Service Date', maintenanceRecord.service_date ? new Date(maintenanceRecord.service_date).toLocaleDateString() : 'N/A'],
      ['Service Type', maintenanceRecord.service_type || 'N/A'],
      ['Status', maintenanceRecord.status || 'N/A'],
      ['Cost', `₵${maintenanceRecord.cost || 'N/A'}`],
      ['Registration Number', maintenanceRecord.vehicle_name?.split(' - ')[0] || 'N/A'],
      ['Vehicle Model', maintenanceRecord.vehicle_name?.split(' - ')[1]?.split(' (')[0] || 'N/A'],
      ['Year', maintenanceRecord.vehicle_name?.split('(')[1]?.split(')')[0] || 'N/A'],
      ['Mileage at Service', maintenanceRecord.mileage_at_service ? `${maintenanceRecord.mileage_at_service} km` : 'N/A'],
      ['Mechanic Name', maintenanceRecord.mechanic_name || 'N/A'],
      ['Workshop', maintenanceRecord.workshop_name || 'N/A'],
      ['Service Details', maintenanceRecord.service_details || 'No details provided'],
      ['Parts Replaced', maintenanceRecord.parts_replaced || 'No parts replaced'],
      ['Created At', maintenanceRecord.created_at ? new Date(maintenanceRecord.created_at).toLocaleString() : 'N/A'],
      ['Last Updated', maintenanceRecord.updated_at ? new Date(maintenanceRecord.updated_at).toLocaleString() : 'N/A']
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Maintenance Details')
    
    const fileName = `maintenance-${maintenanceRecord.id || 'record'}-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const handleExportCSV = () => {
    if (!maintenanceRecord) return

    const data = [
      ['Field', 'Value'],
      ['Service Date', maintenanceRecord.service_date ? new Date(maintenanceRecord.service_date).toLocaleDateString() : 'N/A'],
      ['Service Type', maintenanceRecord.service_type || 'N/A'],
      ['Status', maintenanceRecord.status || 'N/A'],
      ['Cost', `₵${maintenanceRecord.cost || 'N/A'}`],
      ['Registration Number', maintenanceRecord.vehicle_name?.split(' - ')[0] || 'N/A'],
      ['Vehicle Model', maintenanceRecord.vehicle_name?.split(' - ')[1]?.split(' (')[0] || 'N/A'],
      ['Year', maintenanceRecord.vehicle_name?.split('(')[1]?.split(')')[0] || 'N/A'],
      ['Mileage at Service', maintenanceRecord.mileage_at_service ? `${maintenanceRecord.mileage_at_service} km` : 'N/A'],
      ['Mechanic Name', maintenanceRecord.mechanic_name || 'N/A'],
      ['Workshop', maintenanceRecord.workshop_name || 'N/A'],
      ['Service Details', maintenanceRecord.service_details || 'No details provided'],
      ['Parts Replaced', maintenanceRecord.parts_replaced || 'No parts replaced'],
      ['Created At', maintenanceRecord.created_at ? new Date(maintenanceRecord.created_at).toLocaleString() : 'N/A'],
      ['Last Updated', maintenanceRecord.updated_at ? new Date(maintenanceRecord.updated_at).toLocaleString() : 'N/A']
    ]

    const csvContent = data.map(row => row.map(field => `"${field}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `maintenance-${maintenanceRecord.id || 'record'}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    if (!maintenanceRecord) return

    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(18)
    doc.text('Maintenance Record Details', 20, 20)
    
    // Add basic information
    doc.setFontSize(12)
    doc.text('Basic Information:', 20, 40)
    doc.setFontSize(10)
    
    let yPosition = 50
    const lineHeight = 7
    
    const basicInfo = [
      `Service Date: ${maintenanceRecord.service_date ? new Date(maintenanceRecord.service_date).toLocaleDateString() : 'N/A'}`,
      `Service Type: ${maintenanceRecord.service_type || 'N/A'}`,
      `Status: ${maintenanceRecord.status || 'N/A'}`,
      `Cost: ₵${maintenanceRecord.cost || 'N/A'}`
    ]
    
    basicInfo.forEach(info => {
      doc.text(info, 20, yPosition)
      yPosition += lineHeight
    })
    
    // Add vehicle information
    yPosition += 5
    doc.setFontSize(12)
    doc.text('Vehicle Information:', 20, yPosition)
    doc.setFontSize(10)
    yPosition += lineHeight
    
    const vehicleInfo = [
      `Registration Number: ${maintenanceRecord.vehicle_name?.split(' - ')[0] || 'N/A'}`,
      `Vehicle Model: ${maintenanceRecord.vehicle_name?.split(' - ')[1]?.split(' (')[0] || 'N/A'}`,
      `Year: ${maintenanceRecord.vehicle_name?.split('(')[1]?.split(')')[0] || 'N/A'}`,
      `Mileage at Service: ${maintenanceRecord.mileage_at_service ? `${maintenanceRecord.mileage_at_service} km` : 'N/A'}`
    ]
    
    vehicleInfo.forEach(info => {
      doc.text(info, 20, yPosition)
      yPosition += lineHeight
    })
    
    // Add mechanic information
    yPosition += 5
    doc.setFontSize(12)
    doc.text('Mechanic Information:', 20, yPosition)
    doc.setFontSize(10)
    yPosition += lineHeight
    
    const mechanicInfo = [
      `Mechanic Name: ${maintenanceRecord.mechanic_name || 'N/A'}`,
      `Workshop: ${maintenanceRecord.workshop_name || 'N/A'}`
    ]
    
    mechanicInfo.forEach(info => {
      doc.text(info, 20, yPosition)
      yPosition += lineHeight
    })
    
    // Add service details
    yPosition += 5
    doc.setFontSize(12)
    doc.text('Service Details:', 20, yPosition)
    doc.setFontSize(10)
    yPosition += lineHeight
    
    const serviceDetails = [
      `Service Description: ${maintenanceRecord.service_details || 'No details provided'}`,
      `Parts Replaced: ${maintenanceRecord.parts_replaced || 'No parts replaced'}`
    ]
    
    serviceDetails.forEach(info => {
      // Split long text into multiple lines
      const lines = doc.splitTextToSize(info, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, yPosition)
        yPosition += lineHeight
      })
    })
    
    // Add timestamps
    yPosition += 5
    doc.setFontSize(12)
    doc.text('Record Information:', 20, yPosition)
    doc.setFontSize(10)
    yPosition += lineHeight
    
    const recordInfo = [
      `Created At: ${maintenanceRecord.created_at ? new Date(maintenanceRecord.created_at).toLocaleString() : 'N/A'}`,
      `Last Updated: ${maintenanceRecord.updated_at ? new Date(maintenanceRecord.updated_at).toLocaleString() : 'N/A'}`
    ]
    
    recordInfo.forEach(info => {
      doc.text(info, 20, yPosition)
      yPosition += lineHeight
    })
    
    const fileName = `maintenance-${maintenanceRecord.id || 'record'}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  const handlePrint = () => {
    if (!maintenanceRecord) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Maintenance Record - ${maintenanceRecord.id || 'Record'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .info-item {
              margin-bottom: 8px;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .info-value {
              margin-left: 10px;
            }
            @media print {
              body { margin: 0; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Maintenance Record Details</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <div class="section-title">Basic Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Service Date:</span>
                <span class="info-value">${maintenanceRecord.service_date ? new Date(maintenanceRecord.service_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Service Type:</span>
                <span class="info-value">${maintenanceRecord.service_type || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value">${maintenanceRecord.status || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Cost:</span>
                <span class="info-value">₵${maintenanceRecord.cost || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Vehicle Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Registration Number:</span>
                <span class="info-value">${maintenanceRecord.vehicle_name?.split(' - ')[0] || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Vehicle Model:</span>
                <span class="info-value">${maintenanceRecord.vehicle_name?.split(' - ')[1]?.split(' (')[0] || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Year:</span>
                <span class="info-value">${maintenanceRecord.vehicle_name?.split('(')[1]?.split(')')[0] || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Mileage at Service:</span>
                <span class="info-value">${maintenanceRecord.mileage_at_service ? `${maintenanceRecord.mileage_at_service} km` : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Mechanic Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Mechanic Name:</span>
                <span class="info-value">${maintenanceRecord.mechanic_name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Workshop:</span>
                <span class="info-value">${maintenanceRecord.workshop_name || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Service Details</div>
            <div class="info-item">
              <span class="info-label">Service Description:</span>
              <div class="info-value" style="margin-top: 5px;">${maintenanceRecord.service_details || 'No details provided'}</div>
            </div>
            <div class="info-item" style="margin-top: 10px;">
              <span class="info-label">Parts Replaced:</span>
              <div class="info-value" style="margin-top: 5px;">${maintenanceRecord.parts_replaced || 'No parts replaced'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Record Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Created At:</span>
                <span class="info-value">${maintenanceRecord.created_at ? new Date(maintenanceRecord.created_at).toLocaleString() : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Updated:</span>
                <span class="info-value">${maintenanceRecord.updated_at ? new Date(maintenanceRecord.updated_at).toLocaleString() : 'N/A'}</span>
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

  return (
    <div 
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Details</h2>
          
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
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Date:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {maintenanceRecord.service_date ? new Date(maintenanceRecord.service_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Type:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {maintenanceRecord.service_type || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {maintenanceRecord.status || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    ₵{maintenanceRecord.cost || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information Card */}
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Registration Number:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {maintenanceRecord.vehicle_name?.split(' - ')[0] || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicle Model:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {maintenanceRecord.vehicle_name?.split(' - ')[1]?.split(' (')[0] || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Year:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {maintenanceRecord.vehicle_name?.split('(')[1]?.split(')')[0] || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mileage at Service:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {maintenanceRecord.mileage_at_service ? `${maintenanceRecord.mileage_at_service} km` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mechanic Information Card */}
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Mechanic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {maintenanceRecord.mechanic_name || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Workshop:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {maintenanceRecord.workshop_name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details Card */}
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Service Details</h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Description:</span>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {maintenanceRecord.service_details || 'No details provided'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Parts Replaced:</span>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {maintenanceRecord.parts_replaced || 'No parts replaced'}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps Card */}
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Record Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {maintenanceRecord.created_at ? new Date(maintenanceRecord.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated:</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {maintenanceRecord.updated_at ? new Date(maintenanceRecord.updated_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}