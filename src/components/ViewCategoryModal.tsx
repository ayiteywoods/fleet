'use client'

import { X, Download, Printer, FileText, FileSpreadsheet, File, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

interface ViewCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
}

export default function ViewCategoryModal({ isOpen, onClose, category }: ViewCategoryModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen || !category) return null


  const handleViewExportExcel = () => {
    const data = [{
      'Category Name': category.name,
      'Description': category.description || 'N/A',
      'Created At': category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A',
      'Updated At': category.updated_at ? new Date(category.updated_at).toLocaleDateString() : 'N/A',
      'Category ID': category.id
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Category Details')
    XLSX.writeFile(wb, `category-${category.name.replace(/\s+/g, '-').toLowerCase()}.xlsx`)
  }

  const handleViewExportCSV = () => {
    const data = [{
      'Category Name': category.name,
      'Description': category.description || 'N/A',
      'Created At': category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A',
      'Updated At': category.updated_at ? new Date(category.updated_at).toLocaleDateString() : 'N/A',
      'Category ID': category.id
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `category-${category.name.replace(/\s+/g, '-').toLowerCase()}.csv`)
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
    doc.text('Category Details Report', 20, 30)
    
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
    doc.text('Category Name:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(category.name, 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Description:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(category.description || 'N/A', 70, yPosition)
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
    doc.text(category.created_at ? (() => {
      try {
        const date = new Date(category.created_at)
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
      } catch (error) {
        return 'N/A'
      }
    })() : 'N/A', 70, yPosition)
    yPosition += 10
    
    doc.setTextColor(100, 100, 100)
    doc.text('Updated At:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(category.updated_at ? (() => {
      try {
        const date = new Date(category.updated_at)
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
      } catch (error) {
        return 'N/A'
      }
    })() : 'N/A', 70, yPosition)
    yPosition += 20
    
    // System Information Section
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('System Information', 20, yPosition)
    yPosition += 12
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Category ID:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.text(category.id.toString(), 70, yPosition)
    
    doc.save(`category-${category.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  const handleViewPrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Category Details Report</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background-color: #f9fafb;
                color: #111827;
              }
              .container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 24px; 
                padding: 24px; 
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              h1 { 
                color: #3b82f6; 
                font-size: 24px; 
                font-weight: 600; 
                margin: 0 0 8px 0;
              }
              .subtitle { 
                color: #6b7280; 
                font-size: 14px; 
                margin-bottom: 32px;
              }
              .section { 
                margin-bottom: 24px; 
                padding: 20px; 
                background-color: #f9fafb; 
                border: 1px solid #e5e7eb; 
                border-radius: 24px;
              }
              .section-title { 
                font-size: 18px; 
                font-weight: 600; 
                color: #111827; 
                margin: 0 0 16px 0;
              }
              .field { 
                margin-bottom: 12px; 
                display: flex; 
                flex-direction: column;
              }
              .field-label { 
                font-size: 14px; 
                font-weight: 500; 
                color: #6b7280; 
                margin-bottom: 4px;
              }
              .field-value { 
                font-size: 14px; 
                color: #111827;
              }
              .grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 16px;
              }
              @media print {
                body { background-color: white; }
                .container { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Category Details Report</h1>
              <div class="subtitle">Generated on: ${new Date().toLocaleDateString()}</div>
              
              <div class="section">
                <h3 class="section-title">Basic Information</h3>
                <div class="grid">
                  <div class="field">
                    <div class="field-label">Category Name</div>
                    <div class="field-value">${category.name}</div>
                  </div>
                  <div class="field">
                    <div class="field-label">Description</div>
                    <div class="field-value">${category.description || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              <div class="section">
                <h3 class="section-title">Timestamps</h3>
                <div class="grid">
                  <div class="field">
                    <div class="field-label">Created At</div>
                    <div class="field-value">${category.created_at ? (() => {
                      try {
                        const date = new Date(category.created_at)
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                      } catch (error) {
                        return 'N/A'
                      }
                    })() : 'N/A'}</div>
                  </div>
                  <div class="field">
                    <div class="field-label">Updated At</div>
                    <div class="field-value">${category.updated_at ? (() => {
                      try {
                        const date = new Date(category.updated_at)
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                      } catch (error) {
                        return 'N/A'
                      }
                    })() : 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              <div class="section">
                <h3 class="section-title">System Information</h3>
                <div class="grid">
                  <div class="field">
                    <div class="field-label">Category ID</div>
                    <div class="field-value">${category.id}</div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
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
      <div className={`p-6 rounded-3xl shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
        themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
          themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Category Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewExportExcel}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handleViewExportCSV}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleViewExportPDF}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <File className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleViewPrint}
              className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                themeMode === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-3xl transition-colors ${
                themeMode === 'dark' 
                  ? 'text-gray-400 hover:bg-gray-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className={`p-4 rounded-3xl border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Category Name
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {category.name}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {category.description || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className={`p-4 rounded-3xl border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Timestamps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Created At
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {category.created_at ? (() => {
                    try {
                      const date = new Date(category.created_at)
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                    } catch (error) {
                      return 'N/A'
                    }
                  })() : 'N/A'}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Updated At
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {category.updated_at ? (() => {
                    try {
                      const date = new Date(category.updated_at)
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                    } catch (error) {
                      return 'N/A'
                    }
                  })() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className={`p-4 rounded-3xl border ${
            themeMode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              System Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Category ID
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {category.id}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
              themeMode === 'dark' 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
