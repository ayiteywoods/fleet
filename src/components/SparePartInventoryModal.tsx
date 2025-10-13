'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Search, Eye, Edit, Trash2, FileSpreadsheet, FileText, Printer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Package, Building2, Hash } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewSparePartInventoryModal from './ViewSparePartInventoryModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface SparePartInventory {
  id: string
  part_name: string
  description: string
  quantity: number
  reorder_threshold: number
  supplier_name: string
  created_at: string | null
  updated_at: string | null
  created_by: number | null
  updated_by: number | null
}

interface SparePartInventoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SparePartInventoryModal({ isOpen, onClose }: SparePartInventoryModalProps) {
  const { themeMode } = useTheme()
  const [inventories, setInventories] = useState<SparePartInventory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingInventory, setEditingInventory] = useState<SparePartInventory | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<keyof SparePartInventory>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<SparePartInventory | null>(null)
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
    part_name: '',
    description: '',
    quantity: '',
    reorder_threshold: '',
    supplier_name: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchInventories()
    }
  }, [isOpen])

  const fetchInventories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/spare-part-inventory')
      if (response.ok) {
        const data = await response.json()
        setInventories(data)
      } else {
        console.error('Failed to fetch inventories')
      }
    } catch (error) {
      console.error('Error fetching inventories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddInventory = async () => {
    try {
      const response = await fetch('/api/spare-part-inventory', {
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
          message: 'Spare part inventory added successfully!'
        })
        setFormData({
          part_name: '',
          description: '',
          quantity: '',
          reorder_threshold: '',
          supplier_name: ''
        })
        setShowAddForm(false)
        fetchInventories()
      } else {
        const errorData = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: errorData.error || 'Failed to add spare part inventory'
        })
      }
    } catch (error) {
      console.error('Error adding inventory:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to add spare part inventory'
      })
    }
  }

  const handleEditInventory = async () => {
    if (!editingInventory) return

    try {
      const response = await fetch(`/api/spare-part-inventory?id=${editingInventory.id}`, {
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
          message: 'Spare part inventory updated successfully!'
        })
        setFormData({
          part_name: '',
          description: '',
          quantity: '',
          reorder_threshold: '',
          supplier_name: ''
        })
        setEditingInventory(null)
        setShowAddForm(false)
        fetchInventories()
      } else {
        const errorData = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: errorData.error || 'Failed to update spare part inventory'
        })
      }
    } catch (error) {
      console.error('Error updating inventory:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update spare part inventory'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spare part inventory?')) {
      return
    }

    try {
      const response = await fetch(`/api/spare-part-inventory?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Spare part inventory deleted successfully!'
        })
        fetchInventories()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to delete spare part inventory'
        })
      }
    } catch (error) {
      console.error('Error deleting inventory:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to delete spare part inventory'
      })
    }
  }

  const handleEdit = (inventory: SparePartInventory) => {
    setEditingInventory(inventory)
    setFormData({
      part_name: inventory.part_name,
      description: inventory.description,
      quantity: inventory.quantity.toString(),
      reorder_threshold: inventory.reorder_threshold.toString(),
      supplier_name: inventory.supplier_name
    })
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setFormData({
      part_name: '',
      description: '',
      quantity: '',
      reorder_threshold: '',
      supplier_name: ''
    })
    setEditingInventory(null)
    setShowAddForm(false)
  }

  const handleView = (inventory: SparePartInventory) => {
    setSelectedInventory(inventory)
    setShowViewModal(true)
  }

  const handleSort = (field: keyof SparePartInventory) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredInventories = inventories.filter(inventory =>
    inventory.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inventory.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inventory.supplier_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedInventories = [...filteredInventories].sort((a, b) => {
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

  const totalPages = Math.ceil(sortedInventories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInventories = sortedInventories.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Export functions
  const handleExportExcel = () => {
    const data = sortedInventories.map(inventory => ({
      'Part Name': inventory.part_name,
      'Description': inventory.description,
      'Quantity': inventory.quantity,
      'Reorder Threshold': inventory.reorder_threshold,
      'Supplier Name': inventory.supplier_name,
      'Created At': inventory.created_at ? (() => {
        try {
          const date = new Date(inventory.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': inventory.updated_at ? (() => {
        try {
          const date = new Date(inventory.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Spare Part Inventory')
    XLSX.writeFile(wb, 'spare-part-inventory.xlsx')
  }

  const handleExportCSV = () => {
    const data = sortedInventories.map(inventory => ({
      'Part Name': inventory.part_name,
      'Description': inventory.description,
      'Quantity': inventory.quantity,
      'Reorder Threshold': inventory.reorder_threshold,
      'Supplier Name': inventory.supplier_name,
      'Created At': inventory.created_at ? (() => {
        try {
          const date = new Date(inventory.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': inventory.updated_at ? (() => {
        try {
          const date = new Date(inventory.updated_at)
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
    a.download = 'spare-part-inventory.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text('Spare Part Inventory Report', 14, 22)
    
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Records: ${sortedInventories.length}`, 14, 38)

    const data = sortedInventories.map(inventory => [
      inventory.part_name,
      inventory.description,
      inventory.quantity.toString(),
      inventory.reorder_threshold.toString(),
      inventory.supplier_name,
      inventory.created_at ? (() => {
        try {
          const date = new Date(inventory.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      inventory.updated_at ? (() => {
        try {
          const date = new Date(inventory.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    ])

    autoTable(doc, {
      head: [['Part Name', 'Description', 'Quantity', 'Reorder Threshold', 'Supplier Name', 'Created At', 'Updated At']],
      body: data,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [55, 65, 81] }
    })

    doc.save('spare-part-inventory.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <html>
        <head>
          <title>Spare Part Inventory Report</title>
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
            <h1>Spare Part Inventory Report</h1>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Records:</strong> ${sortedInventories.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Reorder Threshold</th>
                <th>Supplier Name</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              ${sortedInventories.map(inventory => `
                <tr>
                  <td>${inventory.part_name}</td>
                  <td>${inventory.description}</td>
                  <td>${inventory.quantity}</td>
                  <td>${inventory.reorder_threshold}</td>
                  <td>${inventory.supplier_name}</td>
                  <td>${inventory.created_at ? (() => {
                    try {
                      const date = new Date(inventory.created_at)
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                    } catch (error) {
                      return 'N/A'
                    }
                  })() : 'N/A'}</td>
                  <td>${inventory.updated_at ? (() => {
                    try {
                      const date = new Date(inventory.updated_at)
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
            Spare Part Inventory Management
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
                Add New Inventory
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
                  placeholder="Search inventory..."
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
                {editingInventory ? 'Edit Inventory' : 'Add New Inventory'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Part Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.part_name}
                      onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter part name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description"
                      required
                    />
                  </div>
                </div>
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
                    Reorder Threshold *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.reorder_threshold}
                      onChange={(e) => setFormData({ ...formData, reorder_threshold: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter reorder threshold"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.supplier_name}
                      onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter supplier name"
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
                  onClick={editingInventory ? handleEditInventory : handleAddInventory}
                  className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                >
                  {editingInventory ? 'Update Inventory' : 'Add Inventory'}
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
                    onClick={() => handleSort('part_name')}
                  >
                    <div className="flex items-center gap-1">
                      Part Name
                      {sortField === 'part_name' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-1">
                      Description
                      {sortField === 'description' && (
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
                    onClick={() => handleSort('reorder_threshold')}
                  >
                    <div className="flex items-center gap-1">
                      Reorder Threshold
                      {sortField === 'reorder_threshold' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                    onClick={() => handleSort('supplier_name')}
                  >
                    <div className="flex items-center gap-1">
                      Supplier Name
                      {sortField === 'supplier_name' && (
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
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
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
                themeMode === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedInventories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No inventory found
                    </td>
                  </tr>
                ) : (
                  paginatedInventories.map((inventory) => (
                    <tr key={inventory.id} className={`hover:${
                      themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(inventory)}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(inventory)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(inventory.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inventory.part_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventory.description}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventory.quantity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventory.reorder_threshold}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventory.supplier_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventory.created_at ? (() => {
                          try {
                            const date = new Date(inventory.created_at)
                            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                          } catch (error) {
                            return 'N/A'
                          }
                        })() : 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventory.updated_at ? (() => {
                          try {
                            const date = new Date(inventory.updated_at)
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedInventories.length)} of {sortedInventories.length} results
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
      {showViewModal && selectedInventory && (
        <ViewSparePartInventoryModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          inventory={selectedInventory}
        />
      )}
    </div>
  )
}
