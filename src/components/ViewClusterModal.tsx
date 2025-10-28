'use client'

import { X, Download, Printer, FileText, FileSpreadsheet, File, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useState, useEffect } from 'react'

interface Cluster {
  id: string
  name: string | null
  description: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

interface ViewClusterModalProps {
  isOpen: boolean
  onClose: () => void
  cluster: Cluster | null
}

export default function ViewClusterModal({ isOpen, onClose, cluster }: ViewClusterModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen || !cluster) return null

  const handleViewExportExcel = () => {
    const data = [{
      'Cluster ID': cluster.id,
      'Name': cluster.name || 'N/A',
      'Description': cluster.description || 'N/A',
      'Notes': cluster.notes || 'N/A',
      'Created At': cluster.created_at ? new Date(cluster.created_at).toLocaleDateString() : 'N/A',
      'Updated At': cluster.updated_at ? new Date(cluster.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Cluster Details')
    XLSX.writeFile(wb, `cluster-${cluster.name || cluster.id}.xlsx`)
  }

  const handleViewExportCSV = () => {
    const data = [{
      'Cluster ID': cluster.id,
      'Name': cluster.name || 'N/A',
      'Description': cluster.description || 'N/A',
      'Notes': cluster.notes || 'N/A',
      'Created At': cluster.created_at ? new Date(cluster.created_at).toLocaleDateString() : 'N/A',
      'Updated At': cluster.updated_at ? new Date(cluster.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `cluster-${cluster.name || cluster.id}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewExportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.setTextColor(59, 130, 246) // Blue color
    doc.text('Cluster Details Report', 20, 30)
    
    // Generated date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40)
    
    let yPosition = 55
    
    // Basic Information Section
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Basic Information', 20, yPosition)
    yPosition += 12
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Cluster ID:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(cluster.id, 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Name:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(cluster.name || 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Description:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(cluster.description || 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Notes:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(cluster.notes || 'N/A', 70, yPosition)
    yPosition += 20
    
    // Timestamps Section
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Timestamps', 20, yPosition)
    yPosition += 12
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Created At:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(cluster.created_at ? new Date(cluster.created_at).toLocaleDateString() : 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Updated At:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(cluster.updated_at ? new Date(cluster.updated_at).toLocaleDateString() : 'N/A', 70, yPosition)
    
    doc.save(`cluster-${cluster.id}-details.pdf`)
  }

  const handleViewPrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cluster Details Report</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                line-height: 1.6;
              }
              h1 { 
                color: #3b82f6; 
                margin-bottom: 10px;
              }
              .section { 
                margin-bottom: 25px; 
              }
              .section h2 { 
                color: #374151; 
                font-size: 18px; 
                margin-bottom: 10px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 5px;
              }
              .field { 
                margin-bottom: 8px; 
                display: flex;
              }
              .label { 
                font-weight: bold; 
                color: #6b7280; 
                width: 120px;
                flex-shrink: 0;
              }
              .value { 
                color: #111827; 
              }
              .meta { 
                color: #6b7280; 
                font-size: 12px; 
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <h1>Cluster Details Report</h1>
            
            <div class="section">
              <h2>Basic Information</h2>
              <div class="field">
                <span class="label">Cluster ID:</span>
                <span class="value">${cluster.id}</span>
              </div>
              <div class="field">
                <span class="label">Name:</span>
                <span class="value">${cluster.name || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Description:</span>
                <span class="value">${cluster.description || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Notes:</span>
                <span class="value">${cluster.notes || 'N/A'}</span>
              </div>
            </div>
            
            <div class="section">
              <h2>Timestamps</h2>
              <div class="field">
                <span class="label">Created At:</span>
                <span class="value">${cluster.created_at ? new Date(cluster.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Updated At:</span>
                <span class="value">${cluster.updated_at ? new Date(cluster.updated_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            
            <div class="meta">
              Generated on: ${new Date().toLocaleDateString()}
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
      <div 
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-xl ${
          themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
        style={{
          width: '90vw',
          maxWidth: '800px',
          height: '90vh'
        }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${
          themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <h2 className="text-xl font-semibold text-gray-900">
            Cluster Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Export Buttons */}
          <div className="mb-6 flex justify-end gap-2">
            <button
              onClick={handleViewExportExcel}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl text-sm font-medium transition-colors ${
                themeMode === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Export to Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handleViewExportCSV}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl text-sm font-medium transition-colors ${
                themeMode === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Export to CSV"
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleViewExportPDF}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl text-sm font-medium transition-colors ${
                themeMode === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Export to PDF"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleViewPrint}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl text-sm font-medium transition-colors ${
                themeMode === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Print"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Cluster Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className={`p-4 rounded-3xl ${
              themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className={`w-24 text-sm font-medium ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Cluster ID:
                  </span>
                  <span className={`text-sm ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {cluster.id}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`w-24 text-sm font-medium ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Name:
                  </span>
                  <span className={`text-sm ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {cluster.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`w-24 text-sm font-medium ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Description:
                  </span>
                  <span className={`text-sm ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {cluster.description || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`w-24 text-sm font-medium ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Notes:
                  </span>
                  <span className={`text-sm ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {cluster.notes || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className={`p-4 rounded-3xl ${
              themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Timestamps
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className={`w-24 text-sm font-medium ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Created At:
                  </span>
                  <span className={`text-sm ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {cluster.created_at ? new Date(cluster.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`w-24 text-sm font-medium ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Updated At:
                  </span>
                  <span className={`text-sm ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {cluster.updated_at ? new Date(cluster.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
