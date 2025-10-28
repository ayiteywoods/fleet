'use client'

import React from 'react'
import { X, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Company {
  id: string
  name: string
  location: string
  loc_code: string | null
  phone: string
  description: string | null
  group_id: number | null
  group_name?: string | null
  email: string
  address: string
  contact_person: string
  contact_phone: string
  status: string
  created_at: string | null
  updated_at: string | null
}

interface ViewCompaniesModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company
}

export default function ViewCompaniesModal({ isOpen, onClose, company }: ViewCompaniesModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen) return null

  const handleExportExcel = () => {
    const data = [
      ['Field', 'Value'],
      ['Company Name', company.name],
      ['Location', company.location],
      ['Location Code', company.loc_code || 'N/A'],
      ['Phone', company.phone],
      ['Email', company.email],
      ['Address', company.address],
      ['Contact Person', company.contact_person],
      ['Contact Phone', company.contact_phone],
      ['Status', company.status],
      ['Description', company.description || 'N/A'],
      ['Group', company.group_name || company.group_id || 'N/A'],
      ['Created At', company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'],
      ['Updated At', company.updated_at ? new Date(company.updated_at).toLocaleString() : 'N/A']
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Company Details')
    XLSX.writeFile(wb, `company-${company.id}.xlsx`)
  }

  const handleExportCSV = () => {
    const data = [
      ['Field', 'Value'],
      ['Company Name', company.name],
      ['Location', company.location],
      ['Location Code', company.loc_code || 'N/A'],
      ['Phone', company.phone],
      ['Email', company.email],
      ['Address', company.address],
      ['Contact Person', company.contact_person],
      ['Contact Phone', company.contact_phone],
      ['Status', company.status],
      ['Description', company.description || 'N/A'],
      ['Group', company.group_name || company.group_id || 'N/A'],
      ['Created At', company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'],
      ['Updated At', company.updated_at ? new Date(company.updated_at).toLocaleString() : 'N/A']
    ]

    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `company-${company.id}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Company Details', 20, 30)
    
    // Basic Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Basic Information', 20, 50)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Company Name: ${company.name}`, 20, 60)
    doc.text(`Location: ${company.location}`, 20, 70)
    doc.text(`Location Code: ${company.loc_code || 'N/A'}`, 20, 80)
    doc.text(`Phone: ${company.phone}`, 20, 90)
    doc.text(`Email: ${company.email}`, 20, 100)
    doc.text(`Status: ${company.status}`, 20, 110)
    
    // Contact Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Contact Information', 20, 130)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Contact Person: ${company.contact_person}`, 20, 140)
    doc.text(`Contact Phone: ${company.contact_phone}`, 20, 150)
    doc.text(`Address: ${company.address}`, 20, 160)
    
    // Additional Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Additional Information', 20, 180)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Description: ${company.description || 'N/A'}`, 20, 190)
    doc.text(`Group: ${company.group_name || company.group_id || 'N/A'}`, 20, 200)
    
    // Timestamps
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Timestamps', 20, 220)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Created At: ${company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'}`, 20, 230)
    doc.text(`Updated At: ${company.updated_at ? new Date(company.updated_at).toLocaleString() : 'N/A'}`, 20, 240)
    
    doc.save(`company-${company.id}.pdf`)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Company Details</title>
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
                background-color: ${company.status === 'Active' ? '#d4edda' : company.status === 'Inactive' ? '#f8d7da' : '#fff3cd'};
                color: ${company.status === 'Active' ? '#155724' : company.status === 'Inactive' ? '#721c24' : '#856404'};
              }
            </style>
          </head>
          <body>
            <div class="header">Company Details</div>
            
            <div class="section">
              <div class="section-title">Basic Information</div>
              <div class="field">
                <span class="label">Company Name:</span>
                <span class="value">${company.name}</span>
              </div>
              <div class="field">
                <span class="label">Location:</span>
                <span class="value">${company.location}</span>
              </div>
              <div class="field">
                <span class="label">Location Code:</span>
                <span class="value">${company.loc_code || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Phone:</span>
                <span class="value">${company.phone}</span>
              </div>
              <div class="field">
                <span class="label">Email:</span>
                <span class="value">${company.email}</span>
              </div>
              <div class="field">
                <span class="label">Status:</span>
                <span class="value"><span class="status">${company.status}</span></span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Contact Information</div>
              <div class="field">
                <span class="label">Contact Person:</span>
                <span class="value">${company.contact_person}</span>
              </div>
              <div class="field">
                <span class="label">Contact Phone:</span>
                <span class="value">${company.contact_phone}</span>
              </div>
              <div class="field">
                <span class="label">Address:</span>
                <span class="value">${company.address}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Additional Information</div>
              <div class="field">
                <span class="label">Description:</span>
                <span class="value">${company.description || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Group ID:</span>
                <span class="value">${company.group_id || 'N/A'}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Timestamps</div>
              <div class="field">
                <span class="label">Created At:</span>
                <span class="value">${company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Updated At:</span>
                <span class="value">${company.updated_at ? new Date(company.updated_at).toLocaleString() : 'N/A'}</span>
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
          <h2 className="text-xl font-bold text-gray-900">Company Details</h2>
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
            <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Company Name</p>
                <p className="text-gray-900">{company.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-gray-900">{company.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Location Code</p>
                <p className="text-gray-900">{company.loc_code || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-gray-900">{company.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-gray-900">{company.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  company.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : company.status === 'Inactive'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {company.status}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Contact Person</p>
                <p className="text-gray-900">{company.contact_person}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Contact Phone</p>
                <p className="text-gray-900">{company.contact_phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Address</p>
                <p className="text-gray-900">{company.address}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-gray-900">{company.description || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Group</p>
                <p className="text-gray-900">{company.group_name || company.group_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Timestamps</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Created At</p>
                <p className="text-gray-900">{company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Updated At</p>
                <p className="text-gray-900">{company.updated_at ? new Date(company.updated_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
