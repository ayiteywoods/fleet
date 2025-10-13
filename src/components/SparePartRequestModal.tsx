'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Search, Eye, Edit, Trash2, FileSpreadsheet, FileText, Printer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Package, MapPin, Hash, FileText as DescriptionIcon, Calendar, User } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewSparePartRequestModal from './ViewSparePartRequestModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface SparePartRequest {
  id: string
  quantity: number
  justification: string
  region: string
  district: string
  status: string
  spare_part_inventory_id: string
  vehicle_id: string
  approved_at: string | null
  approved_by: number | null
  created_at: string | null
  updated_at: string | null
  created_by: number | null
  updated_by: number | null
  spare_part_inventory: {
    id: string
    part_name: string
    description: string
    supplier_name: string
  }
  vehicles: {
    id: string
    reg_number: string
    trim: string
    year: number
  }
}

interface SparePartInventory {
  id: string
  part_name: string
  description: string
  quantity: number
  reorder_threshold: number
  supplier_name: string
}

interface Vehicle {
  id: string
  reg_number: string
  trim: string
  year: number
}

interface SparePartRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SparePartRequestModal({ isOpen, onClose }: SparePartRequestModalProps) {
  const { themeMode } = useTheme()
  const [requests, setRequests] = useState<SparePartRequest[]>([])
  const [inventories, setInventories] = useState<SparePartInventory[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRequest, setEditingRequest] = useState<SparePartRequest | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<keyof SparePartRequest>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<SparePartRequest | null>(null)
  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  })

  const [formData, setFormData] = useState({
    quantity: '',
    justification: '',
    region: '',
    district: '',
    status: '',
    spare_part_inventory_id: '',
    vehicle_id: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchRequests()
      fetchInventories()
      fetchVehicles()
    }
  }, [isOpen])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/spare-part-request')
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      } else {
        console.error('Failed to fetch requests')
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInventories = async () => {
    try {
      const response = await fetch('/api/spare-part-inventory')
      if (response.ok) {
        const data = await response.json()
        setInventories(data)
      }
    } catch (error) {
      console.error('Error fetching inventories:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const handleAddRequest = async () => {
    try {
      const response = await fetch('/api/spare-part-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Spare part request added successfully!'
        })
        setFormData({
          quantity: '',
          justification: '',
          region: '',
          district: '',
          status: '',
          spare_part_inventory_id: '',
          vehicle_id: ''
        })
        setShowAddForm(false)
        fetchRequests()
      } else {
        const errorData = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: errorData.error || 'Failed to add spare part request'
        })
      }
    } catch (error) {
      console.error('Error adding request:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to add spare part request'
      })
    }
  }

  const handleEditRequest = async () => {
    if (!editingRequest) return

    try {
      const response = await fetch(`/api/spare-part-request?id=${editingRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Spare part request updated successfully!'
        })
        setFormData({
          quantity: '',
          justification: '',
          region: '',
          district: '',
          status: '',
          spare_part_inventory_id: '',
          vehicle_id: ''
        })
        setEditingRequest(null)
        setShowAddForm(false)
        fetchRequests()
      } else {
        const errorData = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: errorData.error || 'Failed to update spare part request'
        })
      }
    } catch (error) {
      console.error('Error updating request:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update spare part request'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spare part request?')) {
      return
    }

    try {
      const response = await fetch(`/api/spare-part-request?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Spare part request deleted successfully!'
        })
        fetchRequests()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to delete spare part request'
        })
      }
    } catch (error) {
      console.error('Error deleting request:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to delete spare part request'
      })
    }
  }

  const handleEdit = (request: SparePartRequest) => {
    setEditingRequest(request)
    setFormData({
      quantity: request.quantity.toString(),
      justification: request.justification,
      region: request.region,
      district: request.district,
      status: request.status,
      spare_part_inventory_id: request.spare_part_inventory_id,
      vehicle_id: request.vehicle_id
    })
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setFormData({
      quantity: '',
      justification: '',
      region: '',
      district: '',
      status: '',
      spare_part_inventory_id: '',
      vehicle_id: ''
    })
    setEditingRequest(null)
    setShowAddForm(false)
  }

  const handleView = (request: SparePartRequest) => {
    setSelectedRequest(request)
    setShowViewModal(true)
  }

  const handleSort = (field: keyof SparePartRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredRequests = requests.filter(request =>
    request.justification.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.spare_part_inventory.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.vehicles.reg_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedRequests = [...filteredRequests].sort((a, b) => {
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

  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRequests = sortedRequests.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Export functions
  const handleExportExcel = () => {
    const data = sortedRequests.map(request => ({
      'Part Name': request.spare_part_inventory.part_name,
      'Description': request.spare_part_inventory.description,
      'Quantity': request.quantity,
      'Justification': request.justification,
      'Region': request.region,
      'District': request.district,
      'Status': request.status,
      'Vehicle': `${request.vehicles.reg_number} - ${request.vehicles.trim} (${request.vehicles.year})`,
      'Created At': request.created_at ? (() => {
        try {
          const date = new Date(request.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': request.updated_at ? (() => {
        try {
          const date = new Date(request.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Spare Part Requests')
    XLSX.writeFile(wb, 'spare-part-requests.xlsx')
  }

  const handleExportCSV = () => {
    const data = sortedRequests.map(request => ({
      'Part Name': request.spare_part_inventory.part_name,
      'Description': request.spare_part_inventory.description,
      'Quantity': request.quantity,
      'Justification': request.justification,
      'Region': request.region,
      'District': request.district,
      'Status': request.status,
      'Vehicle': `${request.vehicles.reg_number} - ${request.vehicles.trim} (${request.vehicles.year})`,
      'Created At': request.created_at ? (() => {
        try {
          const date = new Date(request.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': request.updated_at ? (() => {
        try {
          const date = new Date(request.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    }))

    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'spare-part-requests.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text('Spare Part Requests Report', 14, 22)
    
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Records: ${sortedRequests.length}`, 14, 38)

    const data = sortedRequests.map(request => [
      request.spare_part_inventory.part_name,
      request.spare_part_inventory.description,
      request.quantity.toString(),
      request.justification,
      request.region,
      request.district,
      request.status,
      `${request.vehicles.reg_number} - ${request.vehicles.trim}`,
      request.created_at ? (() => {
        try {
          const date = new Date(request.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      request.updated_at ? (() => {
        try {
          const date = new Date(request.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    ])

    autoTable(doc, {
      head: [['Part Name', 'Description', 'Quantity', 'Justification', 'Region', 'District', 'Status', 'Vehicle', 'Created At', 'Updated At']],
      body: data,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [55, 65, 81] }
    })

    doc.save('spare-part-requests.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <html>
        <head>
          <title>Spare Part Requests Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Spare Part Requests Report</h1>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Records:</strong> ${sortedRequests.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Justification</th>
                <th>Region</th>
                <th>District</th>
                <th>Status</th>
                <th>Vehicle</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              ${sortedRequests.map(request => `
                <tr>
                  <td>${request.spare_part_inventory.part_name}</td>
                  <td>${request.spare_part_inventory.description}</td>
                  <td>${request.quantity}</td>
                  <td>${request.justification}</td>
                  <td>${request.region}</td>
                  <td>${request.district}</td>
                  <td>${request.status}</td>
                  <td>${request.vehicles.reg_number} - ${request.vehicles.trim} (${request.vehicles.year})</td>
                  <td>${request.created_at ? (() => {
                    try {
                      const date = new Date(request.created_at)
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                    } catch (error) {
                      return 'N/A'
                    }
                  })() : 'N/A'}</td>
                  <td>${request.updated_at ? (() => {
                    try {
                      const date = new Date(request.updated_at)
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                    } catch (error) {
                      return 'N/A'
                    }
                  })() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(2px)' }}
    >
      <div className={`relative w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-3xl ${
        themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          themeMode === 'dark' ? 'border-gray-700 bg-gray-100' : 'border-gray-200 bg-gray-100'
        }`}>
          <h2 className="text-xl font-semibold text-gray-900">
            Spare Part Request Management
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add Button */}
          {!showAddForm && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Request
              </button>
            </div>
          )}

          {/* Search and Export Controls */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    themeMode === 'dark' 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>
              
              {/* Right Side Controls */}
              <div className="flex items-center gap-4">
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
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className={`mb-6 p-6 rounded-3xl ${
              themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRequest ? 'Edit Request' : 'Add New Request'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quantity"
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
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Dispatched">Dispatched</option>
                    </select>
                  </div>
                </div>
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
                      placeholder="Enter region"
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
                      placeholder="Enter district"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spare Part *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={formData.spare_part_inventory_id}
                      onChange={(e) => setFormData({ ...formData, spare_part_inventory_id: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    >
                      <option value="">Select Spare Part</option>
                      {inventories.map((inventory) => (
                        <option key={inventory.id} value={inventory.id}>
                          {inventory.part_name} - {inventory.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={formData.vehicle_id}
                      onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.reg_number} - {vehicle.trim} ({vehicle.year})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Justification *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DescriptionIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      value={formData.justification}
                      onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter justification"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingRequest ? handleEditRequest : handleAddRequest}
                  className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                >
                  {editingRequest ? 'Update Request' : 'Add Request'}
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${
                  themeMode === 'dark' 
                    ? 'bg-gray-600 border-gray-600' 
                    : 'bg-gray-500 border-gray-600'
                }`}>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                    onClick={() => handleSort('spare_part_inventory')}
                  >
                    <div className="flex items-center gap-1">
                      Part Name
                      {sortField === 'spare_part_inventory' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center gap-1">
                      Quantity
                      {sortField === 'quantity' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                    onClick={() => handleSort('justification')}
                  >
                    <div className="flex items-center gap-1">
                      Justification
                      {sortField === 'justification' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
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
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                    onClick={() => handleSort('district')}
                  >
                    <div className="flex items-center gap-1">
                      District
                      {sortField === 'district' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
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
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                    onClick={() => handleSort('vehicles')}
                  >
                    <div className="flex items-center gap-1">
                      Vehicle
                      {sortField === 'vehicles' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Created At
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                themeMode === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((request) => (
                    <tr key={request.id} className={`hover:${
                      themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(request)}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(request)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(request.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.spare_part_inventory.part_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.quantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {request.justification}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.region}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.district}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.vehicles.reg_number} - {request.vehicles.trim}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.created_at ? (() => {
                          try {
                            const date = new Date(request.created_at)
                            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                          } catch (error) {
                            return 'N/A'
                          }
                        })() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedRequests.length)} of {sortedRequests.length} results
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    page === currentPage
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
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
      {showViewModal && selectedRequest && (
        <ViewSparePartRequestModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          request={selectedRequest}
        />
      )}
    </div>
  )
}
