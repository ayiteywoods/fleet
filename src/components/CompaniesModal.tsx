'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Hash
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ViewCompaniesModal from './ViewCompaniesModal'

interface Company {
  id: string
  name: string
  location: string
  loc_code: string | null
  phone: string
  description: string | null
  group_id: number | null
  email: string
  address: string
  contact_person: string
  contact_phone: string
  status: string
  created_at: string | null
  updated_at: string | null
}

interface CompaniesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CompaniesModal({ isOpen, onClose }: CompaniesModalProps) {
  const { themeMode } = useTheme()
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Company>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [selectedFields, setSelectedFields] = useState([
    'name', 'location', 'loc_code', 'phone', 'email', 'group_id', 'address', 'contact_person', 'contact_phone', 'status', 'description', 'created_at', 'updated_at'
  ])

  // Available fields configuration
  const availableFields = [
    { key: 'name', label: 'Company Name' },
    { key: 'location', label: 'Location' },
    { key: 'loc_code', label: 'Location Code' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'contact_phone', label: 'Contact Phone' },
    { key: 'group_id', label: 'Group' },
    { key: 'status', label: 'Status' },
    { key: 'description', label: 'Description' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' }
  ]

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    loc_code: '',
    phone: '',
    description: '',
    group_id: '',
    email: '',
    address: '',
    contact_person: '',
    contact_phone: '',
    status: ''
  })

  useEffect(() => {
    fetchCompanies()
    fetchGroups()
  }, [])
  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups')
      if (res.ok) {
        const data = await res.json()
        setGroups(data)
      }
    } catch (e) {
      console.error('Failed to fetch groups', e)
    }
  }

  const getGroupName = (groupId: number | null) => {
    if (!groupId) return '—'
    const g = groups.find(grp => grp.id?.toString() === groupId.toString())
    return g?.name || groupId.toString()
  }

  useEffect(() => {
    let filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.contact_person && company.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.phone && company.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.address && company.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.loc_code && company.loc_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })

    setFilteredCompanies(filtered)
    setCurrentPage(1)
  }, [companies, searchTerm, sortField, sortDirection])

  const toggleField = (fieldKey: string) => {
    if (selectedFields.includes(fieldKey)) {
      setSelectedFields(selectedFields.filter(f => f !== fieldKey))
    } else {
      setSelectedFields([...selectedFields, fieldKey])
    }
  }

  const handleSelectAllFields = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields([])
    } else {
      setSelectedFields(availableFields.map(field => field.key))
    }
  }

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      } else {
        showNotification('error', 'Failed to fetch companies')
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      showNotification('error', 'Error fetching companies')
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCompany ? `/api/companies?id=${editingCompany.id}` : '/api/companies'
      const method = editingCompany ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          group_id: formData.group_id ? parseInt(formData.group_id) : null
        })
      })

      if (response.ok) {
        showNotification('success', editingCompany ? 'Company updated successfully' : 'Company created successfully')
        fetchCompanies()
        resetForm()
      } else {
        const error = await response.json()
        showNotification('error', error.error || 'Failed to save company')
      }
    } catch (error) {
      console.error('Error saving company:', error)
      showNotification('error', 'Error saving company')
    }
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      location: company.location,
      loc_code: company.loc_code || '',
      phone: company.phone,
      description: company.description || '',
      group_id: company.group_id?.toString() || '',
      email: company.email,
      address: company.address,
      contact_person: company.contact_person,
      contact_phone: company.contact_phone,
      status: company.status
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        const response = await fetch(`/api/companies?id=${id}`, { method: 'DELETE' })
        if (response.ok) {
          showNotification('success', 'Company deleted successfully')
          fetchCompanies()
        } else {
          showNotification('error', 'Failed to delete company')
        }
      } catch (error) {
        console.error('Error deleting company:', error)
        showNotification('error', 'Error deleting company')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      loc_code: '',
      phone: '',
      description: '',
      group_id: '',
      email: '',
      address: '',
      contact_person: '',
      contact_phone: '',
      status: ''
    })
    setEditingCompany(null)
    setShowAddForm(false)
  }

  const handleSort = (field: keyof Company) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleExportExcel = () => {
    const data = filteredCompanies.map(company => ({
      'Company Name': company.name,
      'Location': company.location,
      'Location Code': company.loc_code || 'N/A',
      'Phone': company.phone,
      'Email': company.email,
      'Address': company.address,
      'Contact Person': company.contact_person,
      'Contact Phone': company.contact_phone,
      'Status': company.status,
      'Created At': company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Companies')
    XLSX.writeFile(wb, 'companies.xlsx')
  }

  const handleExportCSV = () => {
    const data = filteredCompanies.map(company => ({
      'Company Name': company.name,
      'Location': company.location,
      'Location Code': company.loc_code || 'N/A',
      'Phone': company.phone,
      'Email': company.email,
      'Address': company.address,
      'Contact Person': company.contact_person,
      'Contact Phone': company.contact_phone,
      'Status': company.status,
      'Created At': company.created_at ? new Date(company.created_at).toLocaleString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'companies.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Companies Report', 20, 30)
    
    const tableData = filteredCompanies.map(company => [
      company.name,
      company.location,
      company.email,
      company.contact_person,
      company.status,
      company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'
    ])

    autoTable(doc, {
      head: [['Company Name', 'Location', 'Email', 'Contact Person', 'Status', 'Created At']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 }
    })

    doc.save('companies.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const tableRows = filteredCompanies.map(company => `
        <tr>
          <td>${company.name}</td>
          <td>${company.location}</td>
          <td>${company.email}</td>
          <td>${company.contact_person}</td>
          <td>${company.status}</td>
          <td>${company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <html>
          <head>
            <title>Companies Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Companies Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Location</th>
                  <th>Email</th>
                  <th>Contact Person</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex)

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(2px)'
        }}
      >
        <div className={`relative w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-3xl shadow-xl ${
          themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${
            themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <h2 className="text-xl font-semibold text-gray-900">
              Companies Management
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
            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-3xl bg-gray-50">
                <h3 className="text-lg font-medium mb-4">
                  {editingCompany ? 'Edit Company' : 'Add New Company'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group
                    </label>
                    <select
                      value={formData.group_id || ''}
                      onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select Group</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter location"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Hash className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.loc_code || ''}
                          onChange={(e) => setFormData({ ...formData, loc_code: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter location code"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.contact_person || ''}
                          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter contact person"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={formData.contact_phone || ''}
                          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter contact phone"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Hash className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={formData.status || ''}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required
                        >
                          <option value="">Select Status</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter address"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-3xl hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors"
                    >
                      {editingCompany ? 'Update Company' : 'Add Company'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add New Company Button */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Company
              </button>
            </div>

            {/* Search and Export Controls */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative max-w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          themeMode === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      />
                  </div>
                  
                  {/* Items Per Page Selector */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Show:
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value))
                        setCurrentPage(1)
                      }}
                      className={`px-3 py-1 border rounded-lg text-sm ${
                        themeMode === 'dark'
                          ? 'bg-gray-100 border-gray-300 text-gray-900'
                          : 'bg-gray-100 border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                
                {/* Control Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowColumnSelector(true)}
                    className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors"
                    title="Select Columns"
                  >
                    SELECT COLUMNS
                  </button>
                </div>
                
                {/* Export Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
                    title="Export to Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
                    title="Export to CSV"
                  >
                    <FileText className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
                    title="Export to PDF"
                  >
                    <FileText className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
                    title="Print"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                </div>
              </div>
            </div>

            {/* Companies Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading companies...</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No companies match your search.' : 'No companies found. Add some to get started.'}
                </div>
              ) : (
                <>
                  <table className={`min-w-full border-collapse ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <thead>
                      <tr className={`${
                        themeMode === 'dark' 
                          ? 'bg-gray-600 border-gray-600' 
                          : 'bg-gray-500 border-gray-600'
                      }`}>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Actions
                        </th>
                        {selectedFields.includes('name') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center gap-1">
                              Company Name
                              {sortField === 'name' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('location') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('location')}
                          >
                            <div className="flex items-center gap-1">
                              Location
                              {sortField === 'location' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('loc_code') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('loc_code')}
                          >
                            <div className="flex items-center gap-1">
                              Location Code
                              {sortField === 'loc_code' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('phone') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('phone')}
                          >
                            <div className="flex items-center gap-1">
                              Phone
                              {sortField === 'phone' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('email') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('email')}
                          >
                            <div className="flex items-center gap-1">
                              Email
                              {sortField === 'email' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('group_id') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('group_id')}
                          >
                            <div className="flex items-center gap-1">
                              Group
                              {sortField === 'group_id' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('contact_person') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('contact_person')}
                          >
                            <div className="flex items-center gap-1">
                              Contact Person
                              {sortField === 'contact_person' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('contact_phone') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('contact_phone')}
                          >
                            <div className="flex items-center gap-1">
                              Contact Phone
                              {sortField === 'contact_phone' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('address') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('address')}
                          >
                            <div className="flex items-center gap-1">
                              Address
                              {sortField === 'address' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('status') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center gap-1">
                              Status
                              {sortField === 'status' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('description') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('description')}
                          >
                            <div className="flex items-center gap-1">
                              Description
                              {sortField === 'description' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('created_at') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('created_at')}
                          >
                            <div className="flex items-center gap-1">
                              Created At
                              {sortField === 'created_at' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {selectedFields.includes('updated_at') && (
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                            onClick={() => handleSort('updated_at')}
                          >
                            <div className="flex items-center gap-1">
                              Updated At
                              {sortField === 'updated_at' && (
                                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      themeMode === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'
                    }`}>
                      {currentCompanies.map((company) => (
                        <tr key={company.id} className={`hover:${
                          themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewingCompany(company)}
                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(company)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(company.id)}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            </td>
                            {selectedFields.includes('name') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {company.name}
                              </td>
                            )}
                            {selectedFields.includes('location') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {company.location}
                              </td>
                            )}
                            {selectedFields.includes('loc_code') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {company.loc_code}
                              </td>
                            )}
                            {selectedFields.includes('phone') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {company.phone}
                              </td>
                            )}
                            {selectedFields.includes('email') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {company.email}
                              </td>
                            )}
                            {selectedFields.includes('group_id') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getGroupName(company.group_id)}
                              </td>
                            )}
                            {selectedFields.includes('contact_person') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {company.contact_person}
                              </td>
                            )}
                            {selectedFields.includes('contact_phone') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {company.contact_phone}
                              </td>
                            )}
                            {selectedFields.includes('address') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {company.address}
                              </td>
                            )}
                            {selectedFields.includes('status') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  company.status === 'Active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : company.status === 'Inactive'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {company.status}
                                </span>
                              </td>
                            )}
                            {selectedFields.includes('description') && (
                              <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                                <div className="truncate" title={company.description || ''}>
                                  {company.description}
                                </div>
                              </td>
                            )}
                            {selectedFields.includes('created_at') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'}
                              </td>
                            )}
                            {selectedFields.includes('updated_at') && (
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {company.updated_at ? new Date(company.updated_at).toLocaleDateString() : 'N/A'}
                              </td>
                            )}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className={`flex items-center justify-between mt-4 px-4 py-3 border-t ${
                    themeMode === 'dark' 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}>
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 text-sm font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                            themeMode === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Prev
                        </button>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          themeMode === 'dark'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {currentPage}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 text-sm font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                            themeMode === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                      
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className={`text-sm ${
                            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(endIndex, filteredCompanies.length)}</span> of{' '}
                            <span className="font-medium">{filteredCompanies.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="flex items-center gap-2" aria-label="Pagination">
                            <button
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className={`px-3 py-1 text-sm font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                                themeMode === 'dark'
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Prev
                            </button>
                            
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              themeMode === 'dark'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}>
                              {currentPage}
                            </span>

                            <button
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className={`px-3 py-1 text-sm font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                                themeMode === 'dark'
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Next
                            </button>
                          </nav>
                        </div>
                      </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewingCompany && (
        <ViewCompaniesModal
          isOpen={!!viewingCompany}
          onClose={() => setViewingCompany(null)}
          company={viewingCompany}
        />
      )}

      {/* Column Selector Modal */}
      {showColumnSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className={`rounded-lg p-6 w-96 max-h-96 overflow-y-auto ${
            themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Select Columns
              </h3>
              <button
                onClick={() => setShowColumnSelector(false)}
                className={`${
                  themeMode === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFields.length === availableFields.length}
                    onChange={handleSelectAllFields}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className={`text-sm font-medium ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Select All Columns
                  </span>
                </label>
                <p className={`text-xs mt-1 ml-7 ${
                  themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {selectedFields.length} of {availableFields.length} columns selected
                </p>
              </div>
              {availableFields.map((field) => (
                <label key={field.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.key)}
                    onChange={() => toggleField(field.key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowColumnSelector(false)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  themeMode === 'dark' 
                    ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowColumnSelector(false)}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}
    </>
  )
}