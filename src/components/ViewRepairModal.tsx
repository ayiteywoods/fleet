'use client'

import { useState, useEffect } from 'react'
import { X, FileSpreadsheet, FileText, FileImage, Printer } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ViewRepairModalProps {
  isOpen: boolean
  onClose: () => void
  repairRecord: any
}

export default function ViewRepairModal({ isOpen, onClose, repairRecord }: ViewRepairModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen || !repairRecord) return null

  const handleExportExcel = () => {
    if (!repairRecord) return

    const data = [
      ['Field', 'Value'],
      ['Service Date', repairRecord.service_date ? new Date(repairRecord.service_date).toLocaleDateString() : 'N/A'],
      ['Status', repairRecord.status || 'N/A'],
      ['Cost', `₵${repairRecord.cost || 'N/A'}`],
      ['Vehicle Registration', repairRecord.vehicles?.reg_number || 'N/A'],
      ['Vehicle Model', repairRecord.vehicles?.trim || 'N/A'],
      ['Vehicle Year', repairRecord.vehicles?.year || 'N/A'],
      ['Created At', repairRecord.created_at ? new Date(repairRecord.created_at).toLocaleString() : 'N/A'],
      ['Last Updated', repairRecord.updated_at ? new Date(repairRecord.updated_at).toLocaleString() : 'N/A']
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Repair Details')
    
    const fileName = `repair-${repairRecord.id || 'record'}-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const handleExportCSV = () => {
    if (!repairRecord) return

    const data = [
      ['Field', 'Value'],
      ['Service Date', repairRecord.service_date ? new Date(repairRecord.service_date).toLocaleDateString() : 'N/A'],
      ['Status', repairRecord.status || 'N/A'],
      ['Cost', `₵${repairRecord.cost || 'N/A'}`],
      ['Vehicle Registration', repairRecord.vehicles?.reg_number || 'N/A'],
      ['Vehicle Model', repairRecord.vehicles?.trim || 'N/A'],
      ['Vehicle Year', repairRecord.vehicles?.year || 'N/A'],
      ['Created At', repairRecord.created_at ? new Date(repairRecord.created_at).toLocaleString() : 'N/A'],
      ['Last Updated', repairRecord.updated_at ? new Date(repairRecord.updated_at).toLocaleString() : 'N/A']
    ]

    const csvContent = data.map(row => row.map(field => `"${field}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `repair-${repairRecord.id || 'record'}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    if (!repairRecord) return

    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(18)
    doc.text('Repair Record Details', 20, 20)
    
    // Add basic information
    doc.setFontSize(12)
    doc.text('Basic Information:', 20, 40)
    doc.setFontSize(10)
    
    let yPosition = 50
    const lineHeight = 7
    
    const basicInfo = [
      `Service Date: ${repairRecord.service_date ? new Date(repairRecord.service_date).toLocaleDateString() : 'N/A'}`,
      `Status: ${repairRecord.status || 'N/A'}`,
      `Cost: ₵${repairRecord.cost || 'N/A'}`,
      `Vehicle Registration: ${repairRecord.vehicles?.reg_number || 'N/A'}`,
      `Vehicle Model: ${repairRecord.vehicles?.trim || 'N/A'}`,
      `Vehicle Year: ${repairRecord.vehicles?.year || 'N/A'}`,
      `Created At: ${repairRecord.created_at ? new Date(repairRecord.created_at).toLocaleString() : 'N/A'}`,
      `Last Updated: ${repairRecord.updated_at ? new Date(repairRecord.updated_at).toLocaleString() : 'N/A'}`
    ]
    
    basicInfo.forEach(info => {
      doc.text(info, 20, yPosition)
      yPosition += lineHeight
    })
    
    // Save the PDF
    const fileName = `repair-${repairRecord.id || 'record'}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Repair Record Details</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-item { margin-bottom: 10px; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Repair Record Details</h1>
          </div>
          
          <div class="section">
            <h3>Basic Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Service Date:</div>
                <div class="value">${repairRecord.service_date ? new Date(repairRecord.service_date).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="label">Status:</div>
                <div class="value">${repairRecord.status || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="label">Cost:</div>
                <div class="value">₵${repairRecord.cost || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="label">Vehicle Registration:</div>
                <div class="value">${repairRecord.vehicles?.reg_number || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="label">Vehicle Model:</div>
                <div class="value">${repairRecord.vehicles?.trim || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="label">Vehicle Year:</div>
                <div class="value">${repairRecord.vehicles?.year || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="label">Created At:</div>
                <div class="value">${repairRecord.created_at ? new Date(repairRecord.created_at).toLocaleString() : 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="label">Last Updated:</div>
                <div class="value">${repairRecord.updated_at ? new Date(repairRecord.updated_at).toLocaleString() : 'N/A'}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div 
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`relative w-full max-w-4xl mx-4 my-8 ${themeMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-lg`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 rounded-t-xl">
          <h2 className="text-2xl font-bold">Repair Details</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              <FileImage className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Date:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {repairRecord.service_date ? new Date(repairRecord.service_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    repairRecord.status === 'completed' ? 'bg-green-100 text-green-800' :
                    repairRecord.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    repairRecord.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {repairRecord.status || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost:</span>
                  <span className="text-sm text-gray-900 dark:text-white">₵{repairRecord.cost || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{repairRecord.vehicles?.reg_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Model:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{repairRecord.vehicles?.trim || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Year:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{repairRecord.vehicles?.year || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    repairRecord.vehicles?.status === 'active' ? 'bg-green-100 text-green-800' :
                    repairRecord.vehicles?.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {repairRecord.vehicles?.status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Record Information */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Record Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {repairRecord.created_at ? new Date(repairRecord.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {repairRecord.updated_at ? new Date(repairRecord.updated_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{repairRecord.created_by || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated By:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{repairRecord.updated_by || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}