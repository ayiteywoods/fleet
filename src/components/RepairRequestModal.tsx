'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Wrench, AlertTriangle, MapPin, Building, Truck, Calendar } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface RepairRequest {
  id: string
  issue_desc: string
  urgency_level: string
  region: string
  district: string
  status: string
  workshop_id: string
  vehicle_id: string
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
}

interface RepairRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RepairRequestModal({ isOpen, onClose }: RepairRequestModalProps) {
  const { themeMode } = useTheme()
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRequest, setEditingRequest] = useState<RepairRequest | null>(null)
  const [formData, setFormData] = useState({
    issue_desc: '',
    urgency_level: 'medium',
    region: '',
    district: '',
    status: 'pending',
    workshop_id: '',
    vehicle_id: ''
  })
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<keyof RepairRequest>('issue_desc')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Fetch repair requests
  useEffect(() => {
    if (isOpen) {
      fetchRepairRequests()
    }
  }, [isOpen])

  const fetchRepairRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/repair-request', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setRepairRequests(data)
      } else {
        console.error('Failed to fetch repair requests')
      }
    } catch (error) {
      console.error('Error fetching repair requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRequest = async () => {
    try {
      const response = await fetch('/api/repair-request', {
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
          title: 'Repair Request Added!',
          message: `Repair request has been added successfully.`
        })
        
        setFormData({
          issue_desc: '',
          urgency_level: 'medium',
          region: '',
          district: '',
          status: 'pending',
          workshop_id: '',
          vehicle_id: ''
        })
        setShowAddForm(false)
        fetchRepairRequests()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add repair request.'
        })
      }
    } catch (error) {
      console.error('Error adding repair request:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleEdit = (request: RepairRequest) => {
    setEditingRequest(request)
    setFormData({
      issue_desc: request.issue_desc,
      urgency_level: request.urgency_level,
      region: request.region,
      district: request.district,
      status: request.status,
      workshop_id: request.workshop_id,
      vehicle_id: request.vehicle_id
    })
    setShowAddForm(true)
  }

  const handleUpdate = async () => {
    if (!editingRequest) return

    try {
      const response = await fetch(`/api/repair-request?id=${editingRequest.id}`, {
        method: 'PUT',
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
          title: 'Repair Request Updated!',
          message: `Repair request has been updated successfully.`
        })
        
        setFormData({
          issue_desc: '',
          urgency_level: 'medium',
          region: '',
          district: '',
          status: 'pending',
          workshop_id: '',
          vehicle_id: ''
        })
        setEditingRequest(null)
        setShowAddForm(false)
        fetchRepairRequests()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update repair request.'
        })
      }
    } catch (error) {
      console.error('Error updating repair request:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleDelete = async (request: RepairRequest) => {
    if (confirm(`Are you sure you want to delete this repair request?`)) {
      try {
        const response = await fetch(`/api/repair-request?id=${request.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        const result = await response.json()

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Repair Request Deleted!',
            message: `Repair request has been deleted successfully.`
          })
          
          fetchRepairRequests()
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: result.error || 'Failed to delete repair request.'
          })
        }
      } catch (error) {
        console.error('Error deleting repair request:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: 'Network error. Please try again.'
        })
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingRequest) {
      handleUpdate()
    } else {
      handleAddRequest()
    }
  }

  const handleCancel = () => {
    setFormData({
      issue_desc: '',
      urgency_level: 'medium',
      region: '',
      district: '',
      status: 'pending',
      workshop_id: '',
      vehicle_id: ''
    })
    setEditingRequest(null)
    setShowAddForm(false)
  }

  // Export functions
  const handleExportExcel = () => {
    const data = filteredAndSortedRequests.map(request => ({
      'Issue Description': request.issue_desc,
      'Urgency Level': request.urgency_level,
      'Region': request.region,
      'District': request.district,
      'Status': request.status,
      'Workshop ID': request.workshop_id,
      'Vehicle ID': request.vehicle_id,
      'Created At': request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A',
      'Updated At': request.updated_at ? new Date(request.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Repair Requests')
    XLSX.writeFile(wb, 'repair-requests.xlsx')
  }

  const handleExportCSV = () => {
    const data = filteredAndSortedRequests.map(request => ({
      'Issue Description': request.issue_desc,
      'Urgency Level': request.urgency_level,
      'Region': request.region,
      'District': request.district,
      'Status': request.status,
      'Workshop ID': request.workshop_id,
      'Vehicle ID': request.vehicle_id,
      'Created At': request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A',
      'Updated At': request.updated_at ? new Date(request.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'repair-requests.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('Repair Requests Report', 14, 22)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    
    // Prepare table data
    const tableData = filteredAndSortedRequests.map(request => [
      request.issue_desc.length > 30 ? request.issue_desc.substring(0, 30) + '...' : request.issue_desc,
      request.urgency_level,
      request.region,
      request.district,
      request.status,
      request.workshop_id,
      request.vehicle_id,
      request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'
    ])
    
    autoTable(doc, {
      head: [['Issue Description', 'Urgency', 'Region', 'District', 'Status', 'Workshop ID', 'Vehicle ID', 'Created At']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    })
    
    doc.save('repair-requests.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const tableData = filteredAndSortedRequests.map(request => `
        <tr>
          <td>${request.issue_desc}</td>
          <td>${request.urgency_level}</td>
          <td>${request.region}</td>
          <td>${request.district}</td>
          <td>${request.status}</td>
          <td>${request.workshop_id}</td>
          <td>${request.vehicle_id}</td>
          <td>${request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <html>
          <head>
            <title>Repair Requests Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #3b82f6; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #3b82f6; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Repair Requests Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Issue Description</th>
                  <th>Urgency Level</th>
                  <th>Region</th>
                  <th>District</th>
                  <th>Status</th>
                  <th>Workshop ID</th>
                  <th>Vehicle ID</th>
                  <th>Created At</th>
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

  // Sorting and filtering logic
  const filteredAndSortedRequests = repairRequests
    .filter(request => 
      request.issue_desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.urgency_level.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.status.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField] || ''
      const bValue = b[sortField] || ''
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRequests = filteredAndSortedRequests.slice(startIndex, endIndex)

  const handleSort = (field: keyof RepairRequest) => {
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
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
        <div className={`relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-xl ${
          themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Repair Requests Management
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
                  {editingRequest ? 'Edit Repair Request' : 'Add New Repair Request'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <Wrench className="w-4 h-4" />
                        Issue Description *
                      </label>
                      <textarea
                        value={formData.issue_desc}
                        onChange={(e) => setFormData({ ...formData, issue_desc: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the repair issue"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        Urgency Level *
                      </label>
                      <select
                        value={formData.urgency_level}
                        onChange={(e) => setFormData({ ...formData, urgency_level: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="w-4 h-4" />
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4" />
                        Region *
                      </label>
                      <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter region"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4" />
                        District *
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter district"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <Building className="w-4 h-4" />
                        Workshop ID *
                      </label>
                      <input
                        type="number"
                        value={formData.workshop_id}
                        onChange={(e) => setFormData({ ...formData, workshop_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter workshop ID"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <Truck className="w-4 h-4" />
                        Vehicle ID *
                      </label>
                      <input
                        type="number"
                        value={formData.vehicle_id}
                        onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter vehicle ID"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {editingRequest ? 'Update' : 'Add'} Request
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Button */}
            {!showAddForm && (
              <div className="mb-4">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Request
                </button>
              </div>
            )}

            {/* Search and Export Controls */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search repair requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      themeMode === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white'
                    }`}
                  />
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

            {/* Repair Requests Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading repair requests...</p>
                </div>
              ) : filteredAndSortedRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No repair requests match your search.' : 'No repair requests found. Add some to get started.'}
                </div>
              ) : (
                <>
                  <table className={`min-w-full border-collapse ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <thead>
                      <tr className={`${
                        themeMode === 'dark' 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('issue_desc')}
                        >
                          <div className="flex items-center gap-1">
                            Issue Description
                            {sortField === 'issue_desc' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('urgency_level')}
                        >
                          <div className="flex items-center gap-1">
                            Urgency
                            {sortField === 'urgency_level' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-1">
                            Status
                            {sortField === 'status' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
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
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('district')}
                        >
                          <div className="flex items-center gap-1">
                            District
                            {sortField === 'district' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Workshop ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Vehicle ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      themeMode === 'dark' 
                        ? 'divide-gray-600 bg-gray-800' 
                        : 'divide-gray-200 bg-white'
                    }`}>
                      {paginatedRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-medium max-w-xs">
                            <div className="truncate" title={request.issue_desc}>
                              {request.issue_desc}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(request.urgency_level)}`}>
                              {request.urgency_level}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.region}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.district}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.workshop_id}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.vehicle_id}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(request)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(request)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(endIndex, filteredAndSortedRequests.length)}</span> of{' '}
                            <span className="font-medium">{filteredAndSortedRequests.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  page === currentPage
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                            
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  )
}
