'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Search, Eye, Edit, Trash2, FileSpreadsheet, FileText, Printer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Package, CheckCircle, FileText as FileTextIcon, MapPin, Building2, Car } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewSparePartDispatchModal from './ViewSparePartDispatchModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface SparePartDispatch {
  id: string
  quantity: number
  status: string
  spare_part_request_id: string
  created_at: string | null
  updated_at: string | null
  created_by: number | null
  updated_by: number | null
  spare_part_request: {
    id: string
    quantity: number
    justification: string
    region: string
    district: string
    status: string
    spare_part_inventory_id: string
    vehicle_id: string
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
}

interface SparePartRequest {
  id: string
  quantity: number
  justification: string
  region: string
  district: string
  status: string
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

interface SparePartDispatchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SparePartDispatchModal({ isOpen, onClose }: SparePartDispatchModalProps) {
  // Force refresh - updated to match VehicleMakesModal exactly
  const { themeMode } = useTheme()
  const [dispatches, setDispatches] = useState<SparePartDispatch[]>([])
  const [sparePartRequests, setSparePartRequests] = useState<SparePartRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDispatch, setEditingDispatch] = useState<SparePartDispatch | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<keyof SparePartDispatch>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const [formData, setFormData] = useState({
    quantity: '',
    status: '',
    spare_part_request_id: '',
    description: '',
    vehicle: '',
    region: '',
    district: ''
  })
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDispatch, setSelectedDispatch] = useState<SparePartDispatch | null>(null)
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  useEffect(() => {
    if (isOpen) {
      fetchDispatches()
      fetchSparePartRequests()
    }
  }, [isOpen])

  const fetchDispatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/spare-part-dispatch', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setDispatches(data)
      } else {
        console.error('Failed to fetch dispatches')
      }
    } catch (error) {
      console.error('Error fetching dispatches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSparePartRequests = async () => {
    try {
      const response = await fetch('/api/spare-part-request', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setSparePartRequests(data)
      }
    } catch (error) {
      console.error('Error fetching spare part requests:', error)
    }
  }

  const handleAddDispatch = async () => {
    try {
      // Validate form data
      if (!formData.quantity || !formData.status || !formData.spare_part_request_id) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Validation Error',
          message: 'Please fill in all required fields'
        })
        return
      }

      const response = await fetch('/api/spare-part-dispatch', {
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
          title: 'Dispatch Created!',
          message: `Dispatch for ${formData.quantity} units has been created successfully.`
        })
        
        setFormData({
          quantity: '',
          status: '',
          spare_part_request_id: '',
          description: '',
          vehicle: '',
          region: '',
          district: ''
        })
        setShowAddForm(false)
        fetchDispatches()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to create dispatch'
        })
      }
    } catch (error) {
      console.error('Error saving dispatch:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Error saving dispatch. Please try again.'
      })
    }
  }

  const handleEditDispatch = async () => {
    try {
      const response = await fetch('/api/spare-part-dispatch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ id: editingDispatch?.id, ...formData }),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Dispatch Updated!',
          message: `Dispatch has been updated successfully.`
        })
        
        setFormData({
          quantity: '',
          status: '',
          spare_part_request_id: '',
          description: '',
          vehicle: '',
          region: '',
          district: ''
        })
        setEditingDispatch(null)
        setShowAddForm(false)
        fetchDispatches()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update dispatch'
        })
      }
    } catch (error) {
      console.error('Error updating dispatch:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Error updating dispatch. Please try again.'
      })
    }
  }

  const handleEdit = (dispatch: SparePartDispatch) => {
    setEditingDispatch(dispatch)
    setFormData({
      quantity: dispatch.quantity.toString(),
      status: dispatch.status,
      spare_part_request_id: dispatch.spare_part_request_id,
      description: dispatch.spare_part_request.spare_part_inventory.description || '',
      vehicle: `${dispatch.spare_part_request.vehicles.reg_number} (${dispatch.spare_part_request.vehicles.trim})`,
      region: dispatch.spare_part_request.region,
      district: dispatch.spare_part_request.district
    })
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setFormData({
      quantity: '',
      status: '',
      spare_part_request_id: '',
      description: '',
      vehicle: '',
      region: '',
      district: ''
    })
    setEditingDispatch(null)
    setShowAddForm(false)
  }

  const handleRequestChange = (requestId: string) => {
    const selectedRequest = sparePartRequests.find(req => req.id === requestId)
    if (selectedRequest) {
      setFormData({
        ...formData,
        spare_part_request_id: requestId,
        description: selectedRequest.spare_part_inventory.description || '',
        vehicle: `${selectedRequest.vehicles.reg_number} (${selectedRequest.vehicles.trim})`,
        region: selectedRequest.region,
        district: selectedRequest.district
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dispatch?')) {
      try {
        const response = await fetch(`/api/spare-part-dispatch?id=${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        const result = await response.json()

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Dispatch Deleted!',
            message: 'Dispatch has been deleted successfully.'
          })
          fetchDispatches()
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: result.error || 'Failed to delete dispatch'
          })
        }
      } catch (error) {
        console.error('Error deleting dispatch:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: 'Error deleting dispatch. Please try again.'
        })
      }
    }
  }

  const handleView = (dispatch: SparePartDispatch) => {
    setSelectedDispatch(dispatch)
    setShowViewModal(true)
  }

  const handleSort = (field: keyof SparePartDispatch) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort dispatches
  const filteredDispatches = dispatches.filter(dispatch =>
    dispatch.spare_part_request.spare_part_inventory.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dispatch.spare_part_request.spare_part_inventory.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dispatch.spare_part_request.vehicles.reg_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dispatch.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAndSortedDispatches = [...filteredDispatches].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDispatches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDispatches = filteredAndSortedDispatches.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset to first page when changing items per page
  }


  // Export functions
  const handleExportExcel = () => {
    const data = filteredAndSortedDispatches.map(dispatch => ({
      'Part Name': dispatch.spare_part_request.spare_part_inventory.part_name,
      'Description': dispatch.spare_part_request.spare_part_inventory.description,
      'Supplier': dispatch.spare_part_request.spare_part_inventory.supplier_name,
      'Vehicle': `${dispatch.spare_part_request.vehicles.reg_number} (${dispatch.spare_part_request.vehicles.trim})`,
      'Quantity': dispatch.quantity,
      'Status': dispatch.status,
      'Region': dispatch.spare_part_request.region,
      'District': dispatch.spare_part_request.district,
      'Justification': dispatch.spare_part_request.justification,
      'Created At': dispatch.created_at ? (() => {
        try {
          const date = new Date(dispatch.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': dispatch.updated_at ? (() => {
        try {
          const date = new Date(dispatch.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Spare Part Dispatches')
    XLSX.writeFile(wb, 'spare_part_dispatches.xlsx')
  }

  const handleExportCSV = () => {
    const data = filteredAndSortedDispatches.map(dispatch => ({
      'Part Name': dispatch.spare_part_request.spare_part_inventory.part_name,
      'Description': dispatch.spare_part_request.spare_part_inventory.description,
      'Supplier': dispatch.spare_part_request.spare_part_inventory.supplier_name,
      'Vehicle': `${dispatch.spare_part_request.vehicles.reg_number} (${dispatch.spare_part_request.vehicles.trim})`,
      'Quantity': dispatch.quantity,
      'Status': dispatch.status,
      'Region': dispatch.spare_part_request.region,
      'District': dispatch.spare_part_request.district,
      'Justification': dispatch.spare_part_request.justification,
      'Created At': dispatch.created_at ? (() => {
        try {
          const date = new Date(dispatch.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': dispatch.updated_at ? (() => {
        try {
          const date = new Date(dispatch.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'spare_part_dispatches.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Spare Part Dispatches Report', 14, 22)
    
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Records: ${filteredAndSortedDispatches.length}`, 14, 38)
    
    const tableData = filteredAndSortedDispatches.map(dispatch => [
      dispatch.spare_part_request.spare_part_inventory.part_name,
      dispatch.spare_part_request.spare_part_inventory.description,
      dispatch.spare_part_request.spare_part_inventory.supplier_name,
      `${dispatch.spare_part_request.vehicles.reg_number} (${dispatch.spare_part_request.vehicles.trim})`,
      dispatch.quantity.toString(),
      dispatch.status,
      dispatch.spare_part_request.region,
      dispatch.spare_part_request.district
    ])
    
    autoTable(doc, {
      head: [['Part Name', 'Description', 'Supplier', 'Vehicle', 'Quantity', 'Status', 'Region', 'District']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [71, 85, 105] }
    })
    
    doc.save('spare_part_dispatches.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Spare Part Dispatches Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #475569; color: white; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Spare Part Dispatches Report</h1>
          <div class="summary">
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total Records: ${filteredAndSortedDispatches.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Description</th>
                <th>Supplier</th>
                <th>Vehicle</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Region</th>
                <th>District</th>
                <th>Justification</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAndSortedDispatches.map(dispatch => `
                <tr>
                  <td>${dispatch.spare_part_request.spare_part_inventory.part_name}</td>
                  <td>${dispatch.spare_part_request.spare_part_inventory.description}</td>
                  <td>${dispatch.spare_part_request.spare_part_inventory.supplier_name}</td>
                  <td>${dispatch.spare_part_request.vehicles.reg_number} (${dispatch.spare_part_request.vehicles.trim})</td>
                  <td>${dispatch.quantity}</td>
                  <td>${dispatch.status}</td>
                  <td>${dispatch.spare_part_request.region}</td>
                  <td>${dispatch.spare_part_request.district}</td>
                  <td>${dispatch.spare_part_request.justification}</td>
                  <td>${dispatch.created_at ? (() => {
                    try {
                      const date = new Date(dispatch.created_at)
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                    } catch (error) {
                      return 'N/A'
                    }
                  })() : 'N/A'}</td>
                  <td>${dispatch.updated_at ? (() => {
                    try {
                      const date = new Date(dispatch.updated_at)
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
              Spare Parts Dispatch Management
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

            {/* Add Button */}
            {!showAddForm && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Dispatch {/* Force refresh */}
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
                    placeholder="Search dispatches..."
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
                  {editingDispatch ? 'Edit Dispatch' : 'Add New Dispatch'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Package className="h-5 w-5 text-gray-400" />
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
                        <CheckCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spare Part Request *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileTextIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.spare_part_request_id}
                        onChange={(e) => handleRequestChange(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        required
                      >
                        <option value="">Select Request</option>
                        {sparePartRequests.map(request => (
                          <option key={request.id} value={request.id}>
                            {request.spare_part_inventory.part_name} - {request.vehicles.reg_number} ({request.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.description}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        placeholder="Auto-filled from request"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Car className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.vehicle}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        placeholder="Auto-filled from request"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.region}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        placeholder="Auto-filled from request"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.district}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        placeholder="Auto-filled from request"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingDispatch ? handleEditDispatch : handleAddDispatch}
                    className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                  >
                    {editingDispatch ? 'Update Dispatch' : 'Add Dispatch'}
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
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
                          onClick={() => handleSort('spare_part_request')}
                        >
                          <div className="flex items-center gap-1">
                            Part Name
                            {sortField === 'spare_part_request' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Vehicle
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Region
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          District
                        </th>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Created By
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Updated By
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                  themeMode === 'dark' ? 'divide-gray-600' : 'divide-gray-200'
                }`}>
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                        Loading...
                          </td>
                    </tr>
                  ) : currentDispatches.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                        No dispatches found
                          </td>
                    </tr>
                  ) : (
                    currentDispatches.map((dispatch) => (
                      <tr key={dispatch.id} className={`hover:${
                        themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                      }`}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(dispatch)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(dispatch)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dispatch.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dispatch.spare_part_request.spare_part_inventory.part_name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dispatch.spare_part_request.spare_part_inventory.description}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dispatch.spare_part_request.vehicles.reg_number} ({dispatch.spare_part_request.vehicles.trim})
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dispatch.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            dispatch.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            dispatch.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                            dispatch.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {dispatch.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dispatch.spare_part_request.region}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dispatch.spare_part_request.district}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dispatch.created_at ? new Date(dispatch.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dispatch.created_by || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dispatch.updated_at ? new Date(dispatch.updated_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dispatch.updated_by || 'N/A'}
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedDispatches.length)} of {filteredAndSortedDispatches.length} results
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
      {showViewModal && selectedDispatch && (
        <ViewSparePartDispatchModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setSelectedDispatch(null)
          }}
          dispatch={selectedDispatch}
        />
      )}
    </>
  )
}
