'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Search, Eye, Edit, Trash2, FileSpreadsheet, FileText, Printer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Package, MapPin, Hash, FileText as DescriptionIcon, Calendar, User } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewSparePartReceiptModal from './ViewSparePartReceiptModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface SparePartReceipt {
  id: string
  spare_part_dispatch_id: string
  vehicle_id: string
  quantity: number
  justification: string
  region: string
  district: string
  status: string
  received_at: string | null
  received_by: number | null
  created_at: string | null
  updated_at: string | null
  created_by: number | null
  updated_by: number | null
  spare_part_dispatch: {
    id: string
    spare_part_request: {
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
  }
  vehicles: {
    id: string
    reg_number: string
    trim: string
    year: number
  }
}

interface SparePartDispatch {
  id: string
  spare_part_request: {
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
}

interface Vehicle {
  id: string
  reg_number: string
  trim: string
  year: number
}

interface SparePartReceiptModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SparePartReceiptModal({ isOpen, onClose }: SparePartReceiptModalProps) {
  const { themeMode } = useTheme()
  const [receipts, setReceipts] = useState<SparePartReceipt[]>([])
  const [dispatches, setDispatches] = useState<SparePartDispatch[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingReceipt, setEditingReceipt] = useState<SparePartReceipt | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<keyof SparePartReceipt>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<SparePartReceipt | null>(null)
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
    spare_part_dispatch_id: '',
    vehicle_id: '',
    quantity: '',
    justification: '',
    region: '',
    district: '',
    status: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchReceipts(),
        fetchDispatches(),
        fetchVehicles()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReceipts = async () => {
    try {
      const response = await fetch('/api/spare-part-receipt')
      if (response.ok) {
        const data = await response.json()
        setReceipts(data)
      } else {
        console.error('Failed to fetch receipts')
      }
    } catch (error) {
      console.error('Error fetching receipts:', error)
    }
  }

  const fetchDispatches = async () => {
    try {
      const response = await fetch('/api/spare-part-dispatch')
      if (response.ok) {
        const data = await response.json()
        setDispatches(data)
      } else {
        console.error('Failed to fetch dispatches')
      }
    } catch (error) {
      console.error('Error fetching dispatches:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      } else {
        console.error('Failed to fetch vehicles')
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const handleAddReceipt = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/spare-part-receipt', {
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
          message: 'Spare part receipt created successfully!'
        })
        setFormData({ 
          spare_part_dispatch_id: '', 
          vehicle_id: '', 
          quantity: '', 
          justification: '', 
          region: '', 
          district: '', 
          status: '' 
        })
        setShowAddForm(false)
        fetchReceipts()
      } else {
        const error = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: error.error || 'Failed to create spare part receipt'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to create spare part receipt'
      })
    }
  }

  const handleEditReceipt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReceipt) return

    try {
      const response = await fetch(`/api/spare-part-receipt?id=${editingReceipt.id}`, {
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
          message: 'Spare part receipt updated successfully!'
        })
        setFormData({ 
          spare_part_dispatch_id: '', 
          vehicle_id: '', 
          quantity: '', 
          justification: '', 
          region: '', 
          district: '', 
          status: '' 
        })
        setEditingReceipt(null)
        setShowAddForm(false)
        fetchReceipts()
      } else {
        const error = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: error.error || 'Failed to update spare part receipt'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update spare part receipt'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return

    try {
      const response = await fetch(`/api/spare-part-receipt?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Spare part receipt deleted successfully!'
        })
        fetchReceipts()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to delete spare part receipt'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to delete spare part receipt'
      })
    }
  }

  const handleView = (receipt: SparePartReceipt) => {
    setSelectedReceipt(receipt)
    setShowViewModal(true)
  }

  const handleEdit = (receipt: SparePartReceipt) => {
    setEditingReceipt(receipt)
    setFormData({
      spare_part_dispatch_id: receipt.spare_part_dispatch_id,
      vehicle_id: receipt.vehicle_id,
      quantity: receipt.quantity?.toString() || '',
      justification: receipt.justification || '',
      region: receipt.region || '',
      district: receipt.district || '',
      status: receipt.status || ''
    })
    setShowAddForm(true)
  }

  const handleSort = (field: keyof SparePartReceipt) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1)
  }

  const filteredReceipts = receipts.filter(receipt => {
    const searchLower = searchQuery.toLowerCase()
    return (
      receipt.spare_part_dispatch.spare_part_request.spare_part_inventory.part_name.toLowerCase().includes(searchLower) ||
      receipt.spare_part_dispatch.spare_part_request.spare_part_inventory.supplier_name.toLowerCase().includes(searchLower) ||
      receipt.vehicles.reg_number.toLowerCase().includes(searchLower) ||
      receipt.spare_part_dispatch.spare_part_request.region.toLowerCase().includes(searchLower) ||
      receipt.spare_part_dispatch.spare_part_request.district.toLowerCase().includes(searchLower)
    )
  })

  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    if (sortField === 'created_at' || sortField === 'updated_at') {
      aValue = aValue ? new Date(aValue).getTime() : 0
      bValue = bValue ? new Date(bValue).getTime() : 0
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const totalPages = Math.ceil(sortedReceipts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedReceipts = sortedReceipts.slice(startIndex, startIndex + itemsPerPage)

  const handleExportExcel = () => {
    const data = sortedReceipts.map(receipt => ({
      'Receipt ID': receipt.id,
      'Part Name': receipt.spare_part_dispatch.spare_part_request.spare_part_inventory.part_name,
      'Supplier': receipt.spare_part_dispatch.spare_part_request.spare_part_inventory.supplier_name,
      'Quantity': receipt.spare_part_dispatch.spare_part_request.quantity,
      'Vehicle': `${receipt.vehicles.reg_number} - ${receipt.vehicles.trim}`,
      'Region': receipt.spare_part_dispatch.spare_part_request.region,
      'District': receipt.spare_part_dispatch.spare_part_request.district,
      'Status': receipt.spare_part_dispatch.spare_part_request.status,
      'Created At': receipt.created_at ? (() => {
        try {
          const date = new Date(receipt.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': receipt.updated_at ? (() => {
        try {
          const date = new Date(receipt.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Spare Part Receipts')
    XLSX.writeFile(wb, 'spare_part_receipts.xlsx')
  }

  const handleExportCSV = () => {
    const data = sortedReceipts.map(receipt => ({
      'Receipt ID': receipt.id,
      'Part Name': receipt.spare_part_dispatch.spare_part_request.spare_part_inventory.part_name,
      'Supplier': receipt.spare_part_dispatch.spare_part_request.spare_part_inventory.supplier_name,
      'Quantity': receipt.spare_part_dispatch.spare_part_request.quantity,
      'Vehicle': `${receipt.vehicles.reg_number} - ${receipt.vehicles.trim}`,
      'Region': receipt.spare_part_dispatch.spare_part_request.region,
      'District': receipt.spare_part_dispatch.spare_part_request.district,
      'Status': receipt.spare_part_dispatch.spare_part_request.status,
      'Created At': receipt.created_at ? (() => {
        try {
          const date = new Date(receipt.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': receipt.updated_at ? (() => {
        try {
          const date = new Date(receipt.updated_at)
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
    a.download = 'spare_part_receipts.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Spare Part Receipts Report', 14, 22)
    
    const tableData = sortedReceipts.map(receipt => [
      receipt.id,
      receipt.spare_part_dispatch.spare_part_request.spare_part_inventory.part_name,
      receipt.spare_part_dispatch.spare_part_request.spare_part_inventory.supplier_name,
      receipt.spare_part_dispatch.spare_part_request.quantity,
      `${receipt.vehicles.reg_number} - ${receipt.vehicles.trim}`,
      receipt.spare_part_dispatch.spare_part_request.region,
      receipt.spare_part_dispatch.spare_part_request.district,
      receipt.spare_part_dispatch.spare_part_request.status,
      receipt.created_at ? (() => {
        try {
          const date = new Date(receipt.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    ])
    
    autoTable(doc, {
      head: [['Receipt ID', 'Part Name', 'Supplier', 'Quantity', 'Vehicle', 'Region', 'District', 'Status', 'Created At']],
      body: tableData,
      startY: 30,
    })
    
    doc.save('spare_part_receipts.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Spare Part Receipts Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Spare Part Receipts Report</h1>
            <table>
              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Part Name</th>
                  <th>Supplier</th>
                  <th>Quantity</th>
                  <th>Vehicle</th>
                  <th>Region</th>
                  <th>District</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                ${sortedReceipts.map(receipt => `
                  <tr>
                    <td>${receipt.id}</td>
                    <td>${receipt.spare_part_dispatch.spare_part_request.spare_part_inventory.part_name}</td>
                    <td>${receipt.spare_part_dispatch.spare_part_request.spare_part_inventory.supplier_name}</td>
                    <td>${receipt.spare_part_dispatch.spare_part_request.quantity}</td>
                    <td>${receipt.vehicles.reg_number} - ${receipt.vehicles.trim}</td>
                    <td>${receipt.spare_part_dispatch.spare_part_request.region}</td>
                    <td>${receipt.spare_part_dispatch.spare_part_request.district}</td>
                    <td>${receipt.spare_part_dispatch.spare_part_request.status}</td>
                    <td>${receipt.created_at ? (() => {
                      try {
                        const date = new Date(receipt.created_at)
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
      `)
      printWindow.document.close()
      printWindow.print()
    }
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
            Spare Part Receipt Management
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
                Add New Receipt
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
                  placeholder="Search receipts..."
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
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
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
                    <Printer className="w-4 h-4" />
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
                {editingReceipt ? 'Edit Receipt' : 'Add New Receipt'}
              </h3>
              <form onSubmit={editingReceipt ? handleEditReceipt : handleAddReceipt} className="space-y-4">
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
                        <option value="Received">Received</option>
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
                      Spare Part Dispatch *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.spare_part_dispatch_id}
                        onChange={(e) => setFormData({ ...formData, spare_part_dispatch_id: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                      >
                        <option value="">Select Dispatch</option>
                        {dispatches.map((dispatch) => (
                          <option key={dispatch.id} value={dispatch.id}>
                            {dispatch.spare_part_request.spare_part_inventory.part_name} - {dispatch.spare_part_request.spare_part_inventory.supplier_name}
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
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingReceipt(null)
                      setFormData({ 
          spare_part_dispatch_id: '', 
          vehicle_id: '', 
          quantity: '', 
          justification: '', 
          region: '', 
          district: '', 
          status: '' 
        })
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                  >
                    {editingReceipt ? 'Update Receipt' : 'Add Receipt'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className={`min-w-full border-collapse ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <thead className={`${themeMode === 'dark' ? 'bg-gray-600 border-gray-600' : 'bg-gray-500 border-gray-600'}`}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Part Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Justification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('created_at')}>
                    Created At
                    {sortField === 'created_at' && (
                      <span className="ml-1">{sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${themeMode === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                {paginatedReceipts.map((receipt) => (
                  <tr key={receipt.id} className={`hover:bg-gray-50 ${themeMode === 'dark' ? 'hover:bg-gray-700' : ''}`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(receipt)}
                          className="text-green-600 hover:text-green-900"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(receipt)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(receipt.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {receipt.spare_part_dispatch.spare_part_request.spare_part_inventory.part_name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {receipt.quantity}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {receipt.justification}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {receipt.region}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {receipt.district}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        receipt.status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : receipt.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : receipt.status === 'Received'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {receipt.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {receipt.vehicles.reg_number} - {receipt.vehicles.trim}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {receipt.created_at ? (() => {
                        try {
                          const date = new Date(receipt.created_at)
                          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                        } catch (error) {
                          return 'N/A'
                        }
                      })() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 ${
            themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedReceipts.length)} of {sortedReceipts.length} results
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  themeMode === 'dark'
                    ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-full text-sm ${
                    page === currentPage
                      ? 'bg-brand-500 text-white'
                      : themeMode === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  themeMode === 'dark'
                    ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
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
      <ViewSparePartReceiptModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        receipt={selectedReceipt}
      />
    </div>
  )
}