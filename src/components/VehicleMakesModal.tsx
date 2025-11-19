'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Car, FileText as DescriptionIcon, Search } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewVehicleMakeModal from './ViewVehicleMakeModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface VehicleMake {
  id: string
  name: string
  created_at: string | null
  updated_at: string | null
}

interface VehicleMakesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VehicleMakesModal({ isOpen, onClose }: VehicleMakesModalProps) {
  const { themeMode } = useTheme()
  const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMake, setEditingMake] = useState<VehicleMake | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null)
  const [formData, setFormData] = useState({
    name: ''
  })
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<keyof VehicleMake>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Fetch vehicle makes
  useEffect(() => {
    if (isOpen) {
      fetchVehicleMakes()
    }
  }, [isOpen])

  const fetchVehicleMakes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vehicle-makes', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setVehicleMakes(data)
      } else {
        console.error('Failed to fetch vehicle makes')
      }
    } catch (error) {
      console.error('Error fetching vehicle makes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMake = async () => {
    try {
      const response = await fetch('/api/vehicle-makes', {
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
          title: 'Vehicle Make Added!',
          message: `"${formData.name}" has been added successfully.`
        })
        
        setFormData({ name: '' })
        setShowAddForm(false)
        fetchVehicleMakes()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add vehicle make'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Failed to add vehicle make'
      })
    }
  }

  const handleEditMake = async () => {
    if (!editingMake) return

    try {
      const response = await fetch('/api/vehicle-makes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          id: editingMake.id,
          ...formData
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Vehicle Make Updated!',
          message: `"${formData.name}" has been updated successfully.`
        })
        
        setFormData({ name: '' })
        setEditingMake(null)
        setShowAddForm(false)
        fetchVehicleMakes()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update vehicle make'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Failed to update vehicle make'
      })
    }
  }

  const handleDeleteMake = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle make?')) return

    try {
      const response = await fetch(`/api/vehicle-makes?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Vehicle Make Deleted!',
          message: 'Vehicle make has been deleted successfully.'
          })
          fetchVehicleMakes()
        } else {
        const result = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to delete vehicle make'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Failed to delete vehicle make'
      })
    }
  }

  const handleView = (make: VehicleMake) => {
    setSelectedMake(make)
    setShowViewModal(true)
  }

  const handleEdit = (make: VehicleMake) => {
    setEditingMake(make)
    setFormData({
      name: make.name
    })
    setShowAddForm(true)
  }


  const handleCancel = () => {
    setFormData({ name: '' })
    setEditingMake(null)
    setShowAddForm(false)
  }

  const handleSort = (field: keyof VehicleMake) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort vehicle makes
  const filteredMakes = vehicleMakes.filter(make =>
    make.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAndSortedMakes = [...filteredMakes].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedMakes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMakes = filteredAndSortedMakes.slice(startIndex, endIndex)

  // Export functions
  const handleExportExcel = () => {
    const data = filteredAndSortedMakes.map(make => ({
      'Make Name': make.name,
      'Created At': make.created_at ? new Date(make.created_at).toLocaleDateString() : 'N/A',
      'Updated At': make.updated_at ? new Date(make.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Makes')
    XLSX.writeFile(wb, 'vehicle-makes.xlsx')
  }

  const handleExportCSV = () => {
    const data = filteredAndSortedMakes.map(make => ({
      'Make Name': make.name,
      'Created At': make.created_at ? new Date(make.created_at).toLocaleDateString() : 'N/A',
      'Updated At': make.updated_at ? new Date(make.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vehicle-makes.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Vehicle Makes Report', 14, 22)
    
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Records: ${filteredAndSortedMakes.length}`, 14, 38)
    
    const tableData = filteredAndSortedMakes.map(make => [
      make.name,
      make.created_at ? new Date(make.created_at).toLocaleDateString() : 'N/A',
      make.updated_at ? new Date(make.updated_at).toLocaleDateString() : 'N/A'
    ])
    
    autoTable(doc, {
      head: [['Make Name', 'Created At', 'Updated At']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [71, 85, 105] }
    })
    
    doc.save('vehicle-makes.pdf')
  }

  const handlePrint = () => {
    const printContent = `
        <html>
          <head>
            <title>Vehicle Makes Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #475569; color: white; }
            .header { margin-bottom: 20px; }
            </style>
          </head>
          <body>
          <div class="header">
            <h1>Vehicle Makes Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total Records: ${filteredAndSortedMakes.length}</p>
          </div>
            <table>
              <thead>
                <tr>
                <th>Make Name</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                </tr>
              </thead>
              <tbody>
              ${filteredAndSortedMakes.map(make => `
                <tr>
                  <td>${make.name}</td>
                  <td>${make.created_at ? new Date(make.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td>${make.updated_at ? new Date(make.updated_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
              `).join('')}
              </tbody>
            </table>
          </body>
        </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset to first page when changing items per page
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
              Vehicle Makes Management
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
                  Add New Vehicle Make
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
                    placeholder="Search vehicle makes..."
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

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className={`mb-6 p-6 rounded-3xl ${
                themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingMake ? 'Edit Vehicle Make' : 'Add New Vehicle Make'}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Make Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Car className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter make name"
                        required
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
                    onClick={editingMake ? handleEditMake : handleAddMake}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    {editingMake ? 'Update Vehicle Make' : 'Add Vehicle Make'}
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
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-1">
                        Make Name
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
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
                  themeMode === 'dark' ? 'divide-gray-600' : 'divide-gray-200'
                }`}>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Loading...
                          </td>
                    </tr>
                  ) : currentMakes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No vehicle makes found
                          </td>
                    </tr>
                  ) : (
                    currentMakes.map((make) => (
                      <tr key={make.id} className={`hover:${
                        themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                      }`}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(make)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                              <button
                                onClick={() => handleEdit(make)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit"
                              >
                              <Edit className="h-4 w-4" />
                              </button>
                              <button
                              onClick={() => handleDeleteMake(make.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                              <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {make.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {make.created_at ? new Date(make.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {make.updated_at ? new Date(make.updated_at).toLocaleDateString() : 'N/A'}
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedMakes.length)} of {filteredAndSortedMakes.length} results
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

      {/* View Modal */}
      {showViewModal && selectedMake && (
        <ViewVehicleMakeModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          make={selectedMake}
        />
      )}

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </>
  )
}