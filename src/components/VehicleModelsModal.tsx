'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, Eye, Tag, FileText as DescriptionIcon, Search } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewVehicleModelModal from './ViewVehicleModelModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface VehicleModel {
  id: string
  name: string
  description: string | null
  vehicle_make_id: string
  created_at: string | null
  updated_at: string | null
  vehicle_make: {
    id: string
    name: string
  } | null
}

interface VehicleModelsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VehicleModelsModal({ isOpen, onClose }: VehicleModelsModalProps) {
  const { themeMode } = useTheme()
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVehicleModel, setEditingVehicleModel] = useState<VehicleModel | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedVehicleModel, setSelectedVehicleModel] = useState<VehicleModel | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vehicle_make_id: ''
  })
  const [vehicleMakes, setVehicleMakes] = useState<Array<{id: string, name: string}>>([])
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<keyof VehicleModel>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Fetch vehicle models and makes
  useEffect(() => {
    if (isOpen) {
      fetchVehicleModels()
      fetchVehicleMakes()
    }
  }, [isOpen])

  const fetchVehicleModels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/model', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        // Map vehicle_makes to vehicle_make for consistency
        const mappedData = data.map((item: any) => ({
          ...item,
          vehicle_make: item.vehicle_makes || item.vehicle_make || null
        }))
        setVehicleModels(mappedData)
      } else {
        console.error('Failed to fetch vehicle models')
      }
    } catch (error) {
      console.error('Error fetching vehicle models:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleMakes = async () => {
    try {
      const response = await fetch('/api/vehicle-makes', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setVehicleMakes(data)
      }
    } catch (error) {
      console.error('Error fetching vehicle makes:', error)
    }
  }

  const handleAddVehicleModel = async () => {
    try {
      const response = await fetch('/api/model', {
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
          title: 'Vehicle Model Added!',
          message: `"${formData.name}" has been added successfully.`
        })
        
        setFormData({ name: '', description: '', vehicle_make_id: '' })
        setShowAddForm(false)
        fetchVehicleModels()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add vehicle model.'
        })
      }
    } catch (error) {
      console.error('Error adding vehicle model:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleView = (vehicleModel: VehicleModel) => {
    setSelectedVehicleModel(vehicleModel)
    setShowViewModal(true)
  }

  const handleEdit = (vehicleModel: VehicleModel) => {
    setEditingVehicleModel(vehicleModel)
    setFormData({
      name: vehicleModel.name,
      description: vehicleModel.description || '',
      vehicle_make_id: vehicleModel.vehicle_make_id
    })
    setShowAddForm(true)
  }

  const handleUpdate = async () => {
    if (!editingVehicleModel) return

    try {
      const response = await fetch('/api/model', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          id: editingVehicleModel.id,
          ...formData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Vehicle Model Updated!',
          message: `"${formData.name}" has been updated successfully.`
        })
        
        setFormData({ name: '', description: '', vehicle_make_id: '' })
        setEditingVehicleModel(null)
        setShowAddForm(false)
        fetchVehicleModels()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update vehicle model.'
        })
      }
    } catch (error) {
      console.error('Error updating vehicle model:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleDelete = async (vehicleModel: VehicleModel) => {
    if (confirm(`Are you sure you want to delete "${vehicleModel.name}"?`)) {
      try {
        const response = await fetch(`/api/model?id=${vehicleModel.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        const result = await response.json()

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Vehicle Model Deleted!',
            message: `"${vehicleModel.name}" has been deleted successfully.`
          })
          
          fetchVehicleModels()
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: result.error || 'Failed to delete vehicle model.'
          })
        }
      } catch (error) {
        console.error('Error deleting vehicle model:', error)
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
    if (editingVehicleModel) {
      handleUpdate()
    } else {
      handleAddVehicleModel()
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '', vehicle_make_id: '' })
    setEditingVehicleModel(null)
    setShowAddForm(false)
  }

  // Export functions
  const handleExportExcel = () => {
    const data = filteredAndSortedVehicleModels.map(vehicleModel => ({
      'ID': vehicleModel.id,
      'Model': vehicleModel.name,
      'Make': vehicleModel.vehicle_make?.name || 'N/A',
      'Description': vehicleModel.description || 'N/A',
      'Created At': vehicleModel.created_at ? new Date(vehicleModel.created_at).toLocaleDateString() : 'N/A',
      'Updated At': vehicleModel.updated_at ? new Date(vehicleModel.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Models')
    XLSX.writeFile(wb, 'vehicle-models.xlsx')
  }

  const handleExportCSV = () => {
    const data = filteredAndSortedVehicleModels.map(vehicleModel => ({
      'ID': vehicleModel.id,
      'Model': vehicleModel.name,
      'Make': vehicleModel.vehicle_make?.name || 'N/A',
      'Description': vehicleModel.description || 'N/A',
      'Created At': vehicleModel.created_at ? new Date(vehicleModel.created_at).toLocaleDateString() : 'N/A',
      'Updated At': vehicleModel.updated_at ? new Date(vehicleModel.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vehicle-models.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('Vehicle Models Report', 14, 22)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    
    // Prepare table data
    const tableData = filteredAndSortedVehicleModels.map(vehicleModel => [
      vehicleModel.id,
      vehicleModel.name,
      vehicleModel.vehicle_make?.name || 'N/A',
      vehicleModel.description || 'N/A',
      vehicleModel.created_at ? new Date(vehicleModel.created_at).toLocaleDateString() : 'N/A',
      vehicleModel.updated_at ? new Date(vehicleModel.updated_at).toLocaleDateString() : 'N/A'
    ])

    // Add table
    autoTable(doc, {
      head: [['ID', 'Model', 'Make', 'Description', 'Created At', 'Updated At']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    })

    doc.save('vehicle-models.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const tableData = filteredAndSortedVehicleModels.map(vehicleModel => `
        <tr>
          <td>${vehicleModel.id}</td>
          <td>${vehicleModel.name}</td>
          <td>${vehicleModel.vehicle_make?.name || 'N/A'}</td>
          <td>${vehicleModel.description || 'N/A'}</td>
          <td>${vehicleModel.created_at ? new Date(vehicleModel.created_at).toLocaleDateString() : 'N/A'}</td>
          <td>${vehicleModel.updated_at ? new Date(vehicleModel.updated_at).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <html>
          <head>
            <title>Vehicle Models Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #3b82f6; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #428bca; color: white; }
            </style>
          </head>
          <body>
            <h1>Vehicle Models Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Model</th>
                  <th>Make</th>
                  <th>Description</th>
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

  // Sorting and filtering logic
  const filteredAndSortedVehicleModels = vehicleModels
    .filter(vehicleModel => 
      vehicleModel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehicleModel.vehicle_make?.name && vehicleModel.vehicle_make.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vehicleModel.description && vehicleModel.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (sortDirection === 'asc') {
        return aValue && bValue ? aValue.localeCompare(bValue) : 0
      } else {
        return aValue && bValue ? bValue.localeCompare(aValue) : 0
      }
    })

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedVehicleModels.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedVehicleModels = filteredAndSortedVehicleModels.slice(startIndex, endIndex)

  const handleSort = (field: keyof VehicleModel) => {
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

  if (!isOpen) return null

  return (
    <>
      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />

      {/* View Modal */}
      {showViewModal && selectedVehicleModel && (
        <ViewVehicleModelModal
          vehicleModel={selectedVehicleModel}
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* Main Modal */}
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(2px)'
        }}
      >
        <div 
          className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-xl bg-white`}
          style={{
            width: '90vw',
            maxWidth: '1200px',
            height: '90vh'
          }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 bg-gray-100`}>
            <h2 className="text-xl font-semibold text-gray-900">
              Vehicle Models Management
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
                  {editingVehicleModel ? 'Edit Vehicle Model' : 'Add New Vehicle Model'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Camry"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Make *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DescriptionIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={formData.vehicle_make_id}
                          onChange={(e) => setFormData({ ...formData, vehicle_make_id: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select a make</option>
                          {vehicleMakes.map((make) => (
                            <option key={make.id} value={make.id}>
                              {make.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DescriptionIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Description of the vehicle model"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                    >
                      {editingVehicleModel ? 'Update' : 'Add'} Vehicle Model
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
                  Add New Vehicle Model
                </button>
              </div>
            )}

            {/* Search and Export Controls */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search vehicle models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        themeMode === 'dark' 
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    />
                  </div>
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

            {/* Vehicle Models Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading vehicle models...</p>
                </div>
              ) : filteredAndSortedVehicleModels.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No vehicle models match your search.' : 'No vehicle models found. Add some to get started.'}
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
                            Model
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Make
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Description
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
                      themeMode === 'dark' 
                        ? 'divide-gray-600 bg-white' 
                        : 'divide-gray-200 bg-white'
                    }`}>
                      {paginatedVehicleModels.map((vehicleModel) => (
                        <tr key={vehicleModel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleView(vehicleModel)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(vehicleModel)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(vehicleModel)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            {vehicleModel.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vehicleModel.vehicle_make?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vehicleModel.description || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vehicleModel.created_at ? new Date(vehicleModel.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vehicleModel.updated_at ? new Date(vehicleModel.updated_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className={`flex items-center justify-between mt-4 px-4 py-3 border-t bg-white border-gray-200`}>
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
                            themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(endIndex, filteredAndSortedVehicleModels.length)}</span> of{' '}
                            <span className="font-medium">{filteredAndSortedVehicleModels.length}</span> results
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
    </>
  )
}