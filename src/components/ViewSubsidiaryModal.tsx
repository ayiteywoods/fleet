'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { X, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useState, useEffect } from 'react'

interface Subsidiary {
  id: string
  name: string | null
  contact_no: string | null
  address: string | null
  location: string | null
  contact_person: string | null
  contact_person_no: string | null
  cluster_id: string | null
  description: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

interface ViewSubsidiaryModalProps {
  isOpen: boolean
  onClose: () => void
  subsidiary: Subsidiary | null
}

export default function ViewSubsidiaryModal({ isOpen, onClose, subsidiary }: ViewSubsidiaryModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen || !subsidiary) return null

  const handleViewExportExcel = () => {
    const data = [{
      'Subsidiary ID': subsidiary.id,
      'Name': subsidiary.name || 'N/A',
      'Contact No': subsidiary.contact_no || 'N/A',
      'Address': subsidiary.address || 'N/A',
      'Location': subsidiary.location || 'N/A',
      'Contact Person': subsidiary.contact_person || 'N/A',
      'Contact Person No': subsidiary.contact_person_no || 'N/A',
      'Cluster ID': subsidiary.cluster_id || 'N/A',
      'Description': subsidiary.description || 'N/A',
      'Notes': subsidiary.notes || 'N/A',
      'Created At': subsidiary.created_at ? new Date(subsidiary.created_at).toLocaleDateString() : 'N/A',
      'Updated At': subsidiary.updated_at ? new Date(subsidiary.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Subsidiary Details')
    XLSX.writeFile(wb, `subsidiary-${subsidiary.name || subsidiary.id}.xlsx`)
  }

  const handleViewExportCSV = () => {
    const data = [{
      'Subsidiary ID': subsidiary.id,
      'Name': subsidiary.name || 'N/A',
      'Contact No': subsidiary.contact_no || 'N/A',
      'Address': subsidiary.address || 'N/A',
      'Location': subsidiary.location || 'N/A',
      'Contact Person': subsidiary.contact_person || 'N/A',
      'Contact Person No': subsidiary.contact_person_no || 'N/A',
      'Cluster ID': subsidiary.cluster_id || 'N/A',
      'Description': subsidiary.description || 'N/A',
      'Notes': subsidiary.notes || 'N/A',
      'Created At': subsidiary.created_at ? new Date(subsidiary.created_at).toLocaleDateString() : 'N/A',
      'Updated At': subsidiary.updated_at ? new Date(subsidiary.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `subsidiary-${subsidiary.name || subsidiary.id}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewExportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.text('Subsidiary Details Report', 20, 30)
    
    // Date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40)
    
    let yPosition = 60
    
    // Basic Information Section
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Basic Information', 20, yPosition)
    yPosition += 12
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Subsidiary ID:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(subsidiary.id, 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Name:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(subsidiary.name || 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Contact No:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(subsidiary.contact_no || 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Address:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(subsidiary.address || 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Location:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(subsidiary.location || 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Contact Person:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(subsidiary.contact_person || 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Contact Person No:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(subsidiary.contact_person_no || 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Cluster ID:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(subsidiary.cluster_id || 'N/A', 70, yPosition)
    yPosition += 20
    
    // Additional Information Section
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Additional Information', 20, yPosition)
    yPosition += 12
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Description:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(subsidiary.description || 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Notes:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(subsidiary.notes || 'N/A', 70, yPosition)
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
    doc.text(subsidiary.created_at ? new Date(subsidiary.created_at).toLocaleDateString() : 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Updated At:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(subsidiary.updated_at ? new Date(subsidiary.updated_at).toLocaleDateString() : 'N/A', 70, yPosition)
    
    doc.save(`subsidiary-${subsidiary.name || subsidiary.id}-details.pdf`)
  }

  const handleViewPrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Subsidiary Details Report</title>
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
                width: 150px;
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
            <h1>Subsidiary Details Report</h1>
            
            <div class="section">
              <h2>Basic Information</h2>
              <div class="field">
                <span class="label">Subsidiary ID:</span>
                <span class="value">${subsidiary.id}</span>
              </div>
              <div class="field">
                <span class="label">Name:</span>
                <span class="value">${subsidiary.name || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Contact No:</span>
                <span class="value">${subsidiary.contact_no || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Address:</span>
                <span class="value">${subsidiary.address || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Location:</span>
                <span class="value">${subsidiary.location || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Contact Person:</span>
                <span class="value">${subsidiary.contact_person || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Contact Person No:</span>
                <span class="value">${subsidiary.contact_person_no || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Cluster ID:</span>
                <span class="value">${subsidiary.cluster_id || 'N/A'}</span>
              </div>
            </div>
            
            <div class="section">
              <h2>Additional Information</h2>
              <div class="field">
                <span class="label">Description:</span>
                <span class="value">${subsidiary.description || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Notes:</span>
                <span class="value">${subsidiary.notes || 'N/A'}</span>
              </div>
            </div>
            
            <div class="section">
              <h2>Timestamps</h2>
              <div class="field">
                <span class="label">Created At:</span>
                <span class="value">${subsidiary.created_at ? new Date(subsidiary.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Updated At:</span>
                <span class="value">${subsidiary.updated_at ? new Date(subsidiary.updated_at).toLocaleDateString() : 'N/A'}</span>
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
    <div 
      className="fixed inset-0 flex items-center justify-center z-[10000]"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`w-full max-w-4xl h-[90vh] rounded-3xl shadow-3xl overflow-hidden ${
        themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${
          themeMode === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Subsidiary Details
            </h2>
            <div className="flex items-center gap-2">
              {/* Export Buttons */}
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
              <button
                onClick={onClose}
                className={`p-2 rounded-full hover:bg-opacity-80 ${
                  themeMode === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {/* Basic Information */}
          <div className={`p-4 rounded-3xl ${
            themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          } mb-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Basic Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className={`w-32 text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Subsidiary ID:
                </span>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.id}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`w-32 text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Name:
                </span>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.name || 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`w-32 text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Contact No:
                </span>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.contact_no || 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`w-32 text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Address:
                </span>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.address || 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`w-32 text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Location:
                </span>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.location || 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`w-32 text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Contact Person:
                </span>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.contact_person || 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`w-32 text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Contact Person No:
                </span>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.contact_person_no || 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`w-32 text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Cluster ID:
                </span>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.cluster_id || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className={`p-4 rounded-3xl ${
            themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          } mb-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Additional Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className={`text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Description:
                </span>
                <p className={`text-sm mt-1 ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.description || 'N/A'}
                </p>
              </div>
              <div>
                <span className={`text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Notes:
                </span>
                <p className={`text-sm mt-1 ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.notes || 'N/A'}
                </p>
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
                <span className={`w-32 text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Created At:
                </span>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.created_at ? new Date(subsidiary.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`w-32 text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Updated At:
                </span>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {subsidiary.updated_at ? new Date(subsidiary.updated_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
