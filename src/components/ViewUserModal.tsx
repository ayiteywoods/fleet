'use client'

import React, { useState, useEffect } from 'react'
import { X, FileSpreadsheet, FileText, File, Printer, User, Mail, Phone, Shield, Calendar, MapPin, Building2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface User {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string
  region: string | null
  district: string | null
  spcode: number | null
  group: number | null
  email_verified_at: string | null
  password: string
  license_number: string | null
  license_category: string | null
  license_expiry: string | null
  specialization: string | null
  is_active: boolean
  remember_token: string | null
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
  profile_image: string | null
  user_code: string | null
  status: string | null
  user_type: string | null
  role_id: string | null
  api_token: string | null
  password_reset: string | null
  deleted_at: string | null
  providers: string | null
  branch_id: string | null
  user_level: string | null
  type: string | null
  full_name: string | null
  picture: string | null
  wc_id: string | null
  district_id: number | null
}

interface Company {
  id: string
  name: string
  location: string | null
  loc_code: string | null
  phone: string | null
  description: string | null
  group_id: number | null
  email: string | null
  address: string | null
  contact_person: string | null
  contact_phone: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
  external_id: string | null
  data: any
  fetched_at: string | null
  contact_email: string | null
  notes: string | null
  contact_position: string | null
  deleted_by: string | null
  deleted_at: string | null
  service_type: string | null
}

interface ViewUserModalProps {
  user: User
  onClose: () => void
}

export default function ViewUserModal({ user, onClose }: ViewUserModalProps) {
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      } else {
        console.error('Failed to fetch companies')
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const getCompanyName = (spcode: number | null) => {
    if (!spcode) return 'N/A'
    const company = companies.find(c => c.id === spcode.toString())
    return company ? company.name : spcode.toString()
  }
  const handleExportExcel = () => {
    const data = [{
      'Name': user.name,
      'Email': user.email || 'N/A',
      'Phone': user.phone || 'N/A',
      'Role': user.role,
      'Region': user.region || 'N/A',
      'District': user.district || 'N/A',
      'Status': user.is_active ? 'Active' : 'Inactive',
      'Created At': user.created_at ? (() => {
        try {
          const date = new Date(user.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': user.updated_at ? (() => {
        try {
          const date = new Date(user.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'User Details')
    XLSX.writeFile(wb, `user-${user.name.replace(/\s+/g, '-').toLowerCase()}.xlsx`)
  }

  const handleExportCSV = () => {
    const data = [{
      'Name': user.name,
      'Email': user.email || 'N/A',
      'Phone': user.phone || 'N/A',
      'Role': user.role,
      'Region': user.region || 'N/A',
      'District': user.district || 'N/A',
      'Status': user.is_active ? 'Active' : 'Inactive',
      'Created At': user.created_at ? (() => {
        try {
          const date = new Date(user.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': user.updated_at ? (() => {
        try {
          const date = new Date(user.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    }]

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `user-${user.name.replace(/\s+/g, '-').toLowerCase()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(18)
    doc.text('User Details Report', 14, 22)
    
    // Add user name
    doc.setFontSize(14)
    doc.text(`User: ${user.name}`, 14, 32)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40)
    
    // Prepare table data
    const tableData = [
      ['Name', user.name],
      ['Email', user.email || 'N/A'],
      ['Phone', user.phone || 'N/A'],
      ['Role', user.role],
      ['Region', user.region || 'N/A'],
      ['District', user.district || 'N/A'],
      ['Status', user.is_active ? 'Active' : 'Inactive'],
      ['Created At', user.created_at ? (() => {
        try {
          const date = new Date(user.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'],
      ['Updated At', user.updated_at ? (() => {
        try {
          const date = new Date(user.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A']
    ]
    
    autoTable(doc, {
      head: [['Field', 'Value']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [71, 85, 105] }
    })
    
    doc.save(`user-${user.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>User Details - ${user.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .status-active { color: green; font-weight: bold; }
              .status-inactive { color: red; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>User Details</h1>
            <p><strong>User:</strong> ${user.name}</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>${user.name}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>${user.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Phone</td>
                  <td>${user.phone || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Role</td>
                  <td>${user.role}</td>
                </tr>
                <tr>
                  <td>Region</td>
                  <td>${user.region || 'N/A'}</td>
                </tr>
                <tr>
                  <td>District</td>
                  <td>${user.district || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td class="${user.is_active ? 'status-active' : 'status-inactive'}">${user.is_active ? 'Active' : 'Inactive'}</td>
                </tr>
                <tr>
                  <td>Created At</td>
                  <td>${user.created_at ? (() => {
                    try {
                      const date = new Date(user.created_at)
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                    } catch (error) {
                      return 'N/A'
                    }
                  })() : 'N/A'}</td>
                </tr>
                <tr>
                  <td>Updated At</td>
                  <td>${user.updated_at ? (() => {
                    try {
                      const date = new Date(user.updated_at)
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                    } catch (error) {
                      return 'N/A'
                    }
                  })() : 'N/A'}</td>
                </tr>
              </tbody>
            </table>
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
          <h2 className="text-xl font-bold text-gray-900">User Details</h2>
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
              <File className="w-4 h-4" />
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
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-gray-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{user.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-900">{user.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Role</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-700' 
                      : user.role === 'manager'
                      ? 'bg-blue-100 text-blue-700'
                      : user.role === 'supervisor'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Location Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Region</p>
                  <p className="text-gray-900">{user.region || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">District</p>
                  <p className="text-gray-900">{user.district || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Group</p>
                  <p className="text-gray-900">{user.group || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">SP Code</p>
                  <p className="text-gray-900">{getCompanyName(user.spcode)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">District ID</p>
                  <p className="text-gray-900">{user.district_id || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">License Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">License Number</p>
                  <p className="text-gray-900">{user.license_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">License Category</p>
                  <p className="text-gray-900">{user.license_category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">License Expiry</p>
                  <p className="text-gray-900">
                    {user.license_expiry ? (() => {
                      try {
                        const date = new Date(user.license_expiry)
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                      } catch (error) {
                        return 'N/A'
                      }
                    })() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Specialization</p>
                  <p className="text-gray-900">{user.specialization || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Status Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">User Type</p>
                  <p className="text-gray-900">{user.user_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">User Code</p>
                  <p className="text-gray-900">{user.user_code || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">User Level</p>
                  <p className="text-gray-900">{user.user_level || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Type</p>
                  <p className="text-gray-900">{user.type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Full Name</p>
                  <p className="text-gray-900">{user.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Verified</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.email_verified_at 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.email_verified_at ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">User Status</p>
                  <p className="text-gray-900">{user.status || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Timestamps</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Created At</p>
                  <p className="text-gray-900">
                    {user.created_at ? (() => {
                      try {
                        const date = new Date(user.created_at)
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                      } catch (error) {
                        return 'N/A'
                      }
                    })() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Updated At</p>
                  <p className="text-gray-900">
                    {user.updated_at ? (() => {
                      try {
                        const date = new Date(user.updated_at)
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                      } catch (error) {
                        return 'N/A'
                      }
                    })() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">System Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">User ID</p>
                  <p className="text-gray-900">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Role ID</p>
                  <p className="text-gray-900">{user.role_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Branch ID</p>
                  <p className="text-gray-900">{user.branch_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">WC ID</p>
                  <p className="text-gray-900">{user.wc_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Created By</p>
                  <p className="text-gray-900">{user.created_by || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Updated By</p>
                  <p className="text-gray-900">{user.updated_by || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Profile Image</p>
                  <p className="text-gray-900">{user.profile_image ? 'Available' : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Picture</p>
                  <p className="text-gray-900">{user.picture ? 'Available' : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Providers</p>
                  <p className="text-gray-900">{user.providers || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Password Reset</p>
                  <p className="text-gray-900">{user.password_reset || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">API Token</p>
                  <p className="text-gray-900">{user.api_token ? 'Available' : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Deleted At</p>
                  <p className="text-gray-900">
                    {user.deleted_at ? (() => {
                      try {
                        const date = new Date(user.deleted_at)
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                      } catch (error) {
                        return 'N/A'
                      }
                    })() : 'N/A'}
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