'use client'

import { X, Download, Printer, FileText, FileSpreadsheet, File } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Role {
  id: string
  name: string
  guard_name: string
  created_at: string | null
  updated_at: string | null
}

interface ViewRoleModalProps {
  isOpen: boolean
  onClose: () => void
  role: Role | null
}

export default function ViewRoleModal({ isOpen, onClose, role }: ViewRoleModalProps) {
  const { themeMode } = useTheme()

  // Get badge color for guard name
  const getGuardBadgeColor = (guardName: string) => {
    switch (guardName.toLowerCase()) {
      case 'web':
        return 'bg-blue-100 text-blue-800'
      case 'api':
        return 'bg-green-100 text-green-800'
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen || !role) return null

  const handleViewExportExcel = () => {
    const data = [{
      'Role ID': role.id,
      'Name': role.name,
      'Guard Name': role.guard_name,
      'Created At': role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A',
      'Updated At': role.updated_at ? new Date(role.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Role Details')
    XLSX.writeFile(wb, `role-${role.name.replace(/\s+/g, '-').toLowerCase()}.xlsx`)
  }

  const handleViewExportCSV = () => {
    const data = [{
      'Role ID': role.id,
      'Name': role.name,
      'Guard Name': role.guard_name,
      'Created At': role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A',
      'Updated At': role.updated_at ? new Date(role.updated_at).toLocaleDateString() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `role-${role.name.replace(/\s+/g, '-').toLowerCase()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleViewExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Role Details Report', 14, 22)
    
    // Add role name
    doc.setFontSize(16)
    doc.text(`Role: ${role.name}`, 14, 35)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 45)
    
    // Add content sections
    let yPosition = 60
    
    // Basic Information
    doc.setFontSize(14)
    doc.text('Basic Information', 14, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Role ID: ${role.id}`, 20, yPosition)
    yPosition += 8
    doc.text(`Name: ${role.name}`, 20, yPosition)
    yPosition += 8
    doc.text(`Guard Name: ${role.guard_name}`, 20, yPosition)
    yPosition += 15
    
    // Timestamps
    doc.setFontSize(14)
    doc.text('Timestamps', 14, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.text(`Created At: ${role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A'}`, 20, yPosition)
    yPosition += 8
    doc.text(`Updated At: ${role.updated_at ? new Date(role.updated_at).toLocaleDateString() : 'N/A'}`, 20, yPosition)
    
    doc.save(`role-${role.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  const handleViewPrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Role Details Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #333; margin: 0; }
              .header h2 { color: #666; margin: 5px 0; }
              .section { margin-bottom: 25px; }
              .section h3 { color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; display: inline-block; width: 120px; }
              .value { color: #555; }
              .meta { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Role Details Report</h1>
              <h2>${role.name}</h2>
            </div>
            
            <div class="section">
              <h3>Basic Information</h3>
              <div class="field">
                <span class="label">Role ID:</span>
                <span class="value">${role.id}</span>
              </div>
              <div class="field">
                <span class="label">Name:</span>
                <span class="value">${role.name}</span>
              </div>
              <div class="field">
                <span class="label">Guard Name:</span>
                <span class="value">${role.guard_name}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>Timestamps</h3>
              <div class="field">
                <span class="label">Created At:</span>
                <span class="value">${role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Updated At:</span>
                <span class="value">${role.updated_at ? new Date(role.updated_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            
            <div class="meta">
              Generated on: ${new Date().toLocaleDateString()}
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
            Role Details
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
                  Role Name
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {role.name}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Guard Name
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGuardBadgeColor(role.guard_name)}`}>
                    {role.guard_name}
                  </span>
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
                  {role.created_at ? new Date(role.created_at).toLocaleString() : 'N/A'}
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
                  {role.updated_at ? new Date(role.updated_at).toLocaleString() : 'N/A'}
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
                  Role ID
                </label>
                <p className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {role.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
