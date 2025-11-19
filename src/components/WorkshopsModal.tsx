'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, Eye, Tag, FileText as DescriptionIcon, Search, Users, MapPin, Building } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewWorkshopModal from './ViewWorkshopModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Supervisor {
  id: string
  name: string
}

interface Workshop {
  id: string
  name: string
  region: string
  district: string
  supervisor_id: string
  created_at: string | null
  updated_at: string | null
  supervisors?: Supervisor
}

interface WorkshopsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WorkshopsModal({ isOpen, onClose }: WorkshopsModalProps) {
  const { themeMode } = useTheme()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    district: '',
    supervisor_id: ''
  })
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<keyof Workshop>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch workshops and supervisors
  useEffect(() => {
    if (isOpen) {
      fetchWorkshops()
      fetchSupervisors()
    }
  }, [isOpen])

  const fetchWorkshops = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workshops', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setWorkshops(data)
      } else {
        console.error('Failed to fetch workshops')
      }
    } catch (error) {
      console.error('Error fetching workshops:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSupervisors = async () => {
    try {
      const response = await fetch('/api/supervisors', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setSupervisors(data)
      } else {
        console.error('Failed to fetch supervisors')
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error)
    }
  }

  const handleAddWorkshop = async () => {
    try {
      const response = await fetch('/api/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Workshop Added!',
          message: `"${formData.name}" has been added successfully.`
        })
        
        setFormData({ name: '', region: '', district: '', supervisor_id: '' })
        setShowAddForm(false)
        fetchWorkshops()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to add workshop.'
        })
      }
    } catch (error) {
      console.error('Error adding workshop:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'An error occurred while adding the workshop.'
      })
    }
  }

  const handleUpdateWorkshop = async () => {
    if (!editingWorkshop) return

    try {
      const response = await fetch('/api/workshops', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          id: editingWorkshop.id,
          ...formData
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Workshop Updated!',
          message: `"${formData.name}" has been updated successfully.`
        })
        
        setFormData({ name: '', region: '', district: '', supervisor_id: '' })
        setEditingWorkshop(null)
        setShowAddForm(false)
        fetchWorkshops()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to update workshop.'
        })
      }
    } catch (error) {
      console.error('Error updating workshop:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'An error occurred while updating the workshop.'
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingWorkshop) {
      handleUpdateWorkshop()
    } else {
      handleAddWorkshop()
    }
  }

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop)
    setFormData({
      name: workshop.name,
      region: workshop.region,
      district: workshop.district,
      supervisor_id: workshop.supervisor_id
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      try {
        const response = await fetch(`/api/workshops?id=${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Workshop Deleted!',
            message: 'Workshop has been deleted successfully.'
          })
          fetchWorkshops()
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete workshop.'
          })
        }
      } catch (error) {
        console.error('Error deleting workshop:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'An error occurred while deleting the workshop.'
        })
      }
    }
  }

  const handleView = (workshop: Workshop) => {
    setSelectedWorkshop(workshop)
    setShowViewModal(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingWorkshop(null)
    setFormData({ name: '', region: '', district: '', supervisor_id: '' })
  }

  // Filter and sort workshops
  const filteredWorkshops = workshops.filter(workshop =>
    workshop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workshop.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workshop.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (workshop.supervisors && workshop.supervisors.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredAndSortedWorkshops = [...filteredWorkshops].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedWorkshops.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedWorkshops = filteredAndSortedWorkshops.slice(startIndex, endIndex)

  const handleSort = (field: keyof Workshop) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Export functions
  const handleExportExcel = () => {
    const data = workshops.map(workshop => ({
      'Name': workshop.name,
      'Region': workshop.region,
      'District': workshop.district,
      'Supervisor': workshop.supervisors?.name || 'N/A',
      'Created At': workshop.created_at ? new Date(workshop.created_at).toLocaleDateString() : 'N/A',
      'Updated At': workshop.updated_at ? new Date(workshop.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Workshops')
    XLSX.writeFile(wb, 'workshops.xlsx')
  }

  const handleExportCSV = () => {
    const data = workshops.map(workshop => ({
      'Name': workshop.name,
      'Region': workshop.region,
      'District': workshop.district,
      'Supervisor': workshop.supervisors?.name || 'N/A',
      'Created At': workshop.created_at ? new Date(workshop.created_at).toLocaleDateString() : 'N/A',
      'Updated At': workshop.updated_at ? new Date(workshop.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workshops.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Workshops Report', 14, 22)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    
    // Prepare data for table
    const tableData = workshops.map(workshop => [
      workshop.name,
      workshop.region,
      workshop.district,
      workshop.supervisors?.name || 'N/A',
      workshop.created_at ? new Date(workshop.created_at).toLocaleDateString() : 'N/A',
      workshop.updated_at ? new Date(workshop.updated_at).toLocaleDateString() : 'N/A'
    ])

    autoTable(doc, {
      head: [['Name', 'Region', 'District', 'Supervisor', 'Created At', 'Updated At']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    })
    
    doc.save('workshops.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const tableData = filteredAndSortedWorkshops.map(workshop => `
        <tr>
          <td>${workshop.name}</td>
          <td>${workshop.region}</td>
          <td>${workshop.district}</td>
          <td>${workshop.supervisors?.name || 'N/A'}</td>
          <td>${workshop.created_at ? new Date(workshop.created_at).toLocaleDateString() : 'N/A'}</td>
          <td>${workshop.updated_at ? new Date(workshop.updated_at).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <html>
          <head>
            <title>Workshops Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #3b82f6; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Workshops Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Region</th>
                  <th>District</th>
                  <th>Supervisor</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                </tr>
              </thead>
              <tbody>
                ${tableData}
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

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
              Workshops Management
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
                  {editingWorkshop ? 'Edit Workshop' : 'Add New Workshop'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Workshop Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Accra Central Workshop"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supervisor *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={formData.supervisor_id}
                          onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select a supervisor</option>
                          {supervisors.map((supervisor) => (
                            <option key={supervisor.id} value={supervisor.id}>
                              {supervisor.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Greater Accra"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Accra Metropolitan"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                    >
                      {editingWorkshop ? 'Update' : 'Add'} Workshop
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-500 text-white rounded-3xl hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Button */}
            {!showAddForm && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Workshop
                </button>
              </div>
            )}

            {/* Search and Export Controls */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="relative max-w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search workshops..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className={`px-3 py-1 border rounded-2xl text-sm ${
                      themeMode === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value={2}>2</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                
                {/* Export Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleExportExcel}
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
                    onClick={handleExportCSV}
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
                    onClick={handleExportPDF}
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
                    onClick={handlePrint}
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
              </div>
            </div>

            {/* Workshops Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading workshops...</p>
                </div>
              ) : filteredAndSortedWorkshops.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No workshops match your search.' : 'No workshops found. Add some to get started.'}
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
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-1">
                            Name
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                          onClick={() => handleSort('region')}
                        >
                          <div className="flex items-center gap-1">
                            Region
                            {sortField === 'region' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                          onClick={() => handleSort('district')}
                        >
                          <div className="flex items-center gap-1">
                            District
                            {sortField === 'district' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Supervisor
                        </th>
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
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      themeMode === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'
                    }`}>
                      {paginatedWorkshops.map((workshop) => (
                        <tr key={workshop.id} className={`hover:${
                          themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(workshop)}
                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(workshop)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(workshop.id)}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {workshop.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {workshop.region}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {workshop.district}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {workshop.supervisors?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {workshop.updated_at ? new Date(workshop.updated_at).toLocaleDateString() : 'N/A'}
                          </td>
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
                          onClick={() => handlePageChange(currentPage - 1)}
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
                            ? 'bg-brand-500 text-white'
                            : 'bg-brand-500 text-white'
                        }`}>
                          {currentPage}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
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
                            <span className="font-medium">{Math.min(endIndex, filteredAndSortedWorkshops.length)}</span> of{' '}
                            <span className="font-medium">{filteredAndSortedWorkshops.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="flex items-center gap-2" aria-label="Pagination">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
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
                                ? 'bg-brand-500 text-white'
                                : 'bg-brand-500 text-white'
                            }`}>
                              {currentPage}
                            </span>

                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
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

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />

      {/* View Modal */}
      <ViewWorkshopModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        workshop={selectedWorkshop}
      />
    </>
  )
}
