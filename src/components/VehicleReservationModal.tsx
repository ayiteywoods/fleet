'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Calendar, Car, Clock, FileText as DescriptionIcon, Search } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewVehicleReservationModal from './ViewVehicleReservationModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface VehicleReservation {
  id: string
  justification: string
  start_date: string | null
  end_date: string | null
  duration: number
  status: string
  vehicle_id: string
  created_at: string | null
  updated_at: string | null
  vehicles: {
    id: string
    reg_number: string
    vin_number: string
    trim: string
    year: number
    status: string
    color: string
    current_region: string
    current_district: string
  }
}

interface VehicleReservationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VehicleReservationModal({ isOpen, onClose }: VehicleReservationModalProps) {
  const { themeMode } = useTheme()
  const [vehicleReservations, setVehicleReservations] = useState<VehicleReservation[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingReservation, setEditingReservation] = useState<VehicleReservation | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<VehicleReservation | null>(null)
  const [formData, setFormData] = useState({
    justification: '',
    start_date: '',
    end_date: '',
    duration: '',
    status: '',
    vehicle_id: ''
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
  const [sortField, setSortField] = useState<keyof VehicleReservation>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch vehicle reservations
  useEffect(() => {
    if (isOpen) {
      fetchVehicleReservations()
      fetchVehicles()
    }
  }, [isOpen])

  const fetchVehicleReservations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vehicle-reservation', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setVehicleReservations(data)
      } else {
        console.error('Failed to fetch vehicle reservations')
      }
    } catch (error) {
      console.error('Error fetching vehicle reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles', {
        headers: getAuthHeaders()
      })
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

  const handleAddReservation = async () => {
    try {
      const response = await fetch('/api/vehicle-reservation', {
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
          title: 'Vehicle Reservation Added!',
          message: `Reservation for "${formData.justification}" has been added successfully.`
        })
        
        setFormData({ justification: '', start_date: '', end_date: '', duration: '', status: '', vehicle_id: '' })
        setShowAddForm(false)
        fetchVehicleReservations()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add vehicle reservation'
        })
      }
    } catch (error) {
      console.error('Error adding vehicle reservation:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Failed to add vehicle reservation'
      })
    }
  }

  const handleEditReservation = async () => {
    if (!editingReservation) return

    try {
      const response = await fetch('/api/vehicle-reservation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          id: editingReservation.id,
          ...formData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Vehicle Reservation Updated!',
          message: `Reservation for "${formData.justification}" has been updated successfully.`
        })
        
        setFormData({ justification: '', start_date: '', end_date: '', duration: '', status: '', vehicle_id: '' })
        setShowAddForm(false)
        setEditingReservation(null)
        fetchVehicleReservations()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update vehicle reservation'
        })
      }
    } catch (error) {
      console.error('Error updating vehicle reservation:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Failed to update vehicle reservation'
      })
    }
  }

  const handleDeleteReservation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle reservation?')) return

    try {
      const response = await fetch(`/api/vehicle-reservation?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Vehicle Reservation Deleted!',
          message: 'Vehicle reservation has been deleted successfully.'
        })
        fetchVehicleReservations()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to delete vehicle reservation'
        })
      }
    } catch (error) {
      console.error('Error deleting vehicle reservation:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Failed to delete vehicle reservation'
      })
    }
  }

  const handleView = (reservation: VehicleReservation) => {
    setSelectedReservation(reservation)
    setShowViewModal(true)
  }

  const handleEdit = (reservation: VehicleReservation) => {
    setEditingReservation(reservation)
    
    // Helper function to safely format date for input
    const formatDateForInput = (dateValue: any) => {
      if (!dateValue) return ''
      try {
        const date = new Date(dateValue)
        if (isNaN(date.getTime())) return ''
        return date.toISOString().split('T')[0]
      } catch (error) {
        console.error('Error formatting date:', error)
        return ''
      }
    }
    
    setFormData({
      justification: reservation.justification || '',
      start_date: formatDateForInput(reservation.start_date),
      end_date: formatDateForInput(reservation.end_date),
      duration: reservation.duration?.toString() || '',
      status: reservation.status || '',
      vehicle_id: reservation.vehicle_id || ''
    })
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setFormData({ justification: '', start_date: '', end_date: '', duration: '', status: '', vehicle_id: '' })
    setEditingReservation(null)
    setShowAddForm(false)
  }

  const handleSort = (field: keyof VehicleReservation) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort vehicle reservations
  const filteredReservations = vehicleReservations.filter(reservation =>
    reservation.justification.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.vehicles.reg_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.vehicles.trim.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAndSortedReservations = [...filteredReservations].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReservations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReservations = filteredAndSortedReservations.slice(startIndex, endIndex)

  // Export functions
  const handleExportExcel = () => {
    const data = filteredAndSortedReservations.map(reservation => ({
      'Justification': reservation.justification,
      'Start Date': reservation.start_date ? (() => {
        try {
          const date = new Date(reservation.start_date)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'End Date': reservation.end_date ? (() => {
        try {
          const date = new Date(reservation.end_date)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Duration (days)': reservation.duration,
      'Status': reservation.status,
      'Vehicle': `${reservation.vehicles.reg_number} (${reservation.vehicles.trim})`,
      'Created At': reservation.created_at ? (() => {
        try {
          const date = new Date(reservation.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': reservation.updated_at ? (() => {
        try {
          const date = new Date(reservation.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Reservations')
    XLSX.writeFile(wb, 'vehicle-reservations.xlsx')
  }

  const handleExportCSV = () => {
    const data = filteredAndSortedReservations.map(reservation => ({
      'Justification': reservation.justification,
      'Start Date': reservation.start_date ? (() => {
        try {
          const date = new Date(reservation.start_date)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'End Date': reservation.end_date ? (() => {
        try {
          const date = new Date(reservation.end_date)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Duration (days)': reservation.duration,
      'Status': reservation.status,
      'Vehicle': `${reservation.vehicles.reg_number} (${reservation.vehicles.trim})`,
      'Created At': reservation.created_at ? (() => {
        try {
          const date = new Date(reservation.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': reservation.updated_at ? (() => {
        try {
          const date = new Date(reservation.updated_at)
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
    a.download = 'vehicle-reservations.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Vehicle Reservations Report', 14, 22)
    
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Records: ${filteredAndSortedReservations.length}`, 14, 38)
    
    const tableData = filteredAndSortedReservations.map(reservation => [
      reservation.justification,
      reservation.start_date ? (() => {
        try {
          const date = new Date(reservation.start_date)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      reservation.end_date ? (() => {
        try {
          const date = new Date(reservation.end_date)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      reservation.duration.toString(),
      reservation.status,
      `${reservation.vehicles.reg_number} (${reservation.vehicles.trim})`
    ])
    
    autoTable(doc, {
      head: [['Justification', 'Start Date', 'End Date', 'Duration (days)', 'Status', 'Vehicle']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [71, 85, 105] }
    })
    
    doc.save('vehicle-reservations.pdf')
  }

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Vehicle Reservations Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #475569; color: white; }
          </style>
        </head>
        <body>
          <h1>Vehicle Reservations Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Total Records: ${filteredAndSortedReservations.length}</p>
          <table>
            <thead>
              <tr>
                <th>Justification</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration (days)</th>
                <th>Status</th>
                <th>Vehicle</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAndSortedReservations.map(reservation => `
                <tr>
                  <td>${reservation.justification}</td>
                  <td>${reservation.start_date ? (() => {
                    try {
                      const date = new Date(reservation.start_date)
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                    } catch (error) {
                      return 'N/A'
                    }
                  })() : 'N/A'}</td>
                  <td>${reservation.end_date ? (() => {
                    try {
                      const date = new Date(reservation.end_date)
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                    } catch (error) {
                      return 'N/A'
                    }
                  })() : 'N/A'}</td>
                  <td>${reservation.duration}</td>
                  <td>${reservation.status}</td>
                  <td>${reservation.vehicles.reg_number} (${reservation.vehicles.trim})</td>
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
              Vehicle Reservations Management
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
                  Add New Vehicle Reservation
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
                    placeholder="Search vehicle reservations..."
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
                  {editingReservation ? 'Edit Vehicle Reservation' : 'Add New Vehicle Reservation'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Justification *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DescriptionIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.justification}
                        onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter justification"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Car className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.vehicle_id}
                        onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.reg_number} - {vehicle.trim} ({vehicle.year})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (days) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter duration"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
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
                    onClick={editingReservation ? handleEditReservation : handleAddReservation}
                    className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                  >
                    {editingReservation ? 'Update Vehicle Reservation' : 'Add Vehicle Reservation'}
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
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                          onClick={() => handleSort('start_date')}
                        >
                          <div className="flex items-center gap-1">
                            Start Date
                            {sortField === 'start_date' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                          onClick={() => handleSort('end_date')}
                        >
                          <div className="flex items-center gap-1">
                            End Date
                            {sortField === 'end_date' && (
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
                          Vehicle
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
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                  themeMode === 'dark' ? 'divide-gray-600' : 'divide-gray-200'
                }`}>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Loading...
                          </td>
                    </tr>
                  ) : currentReservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No vehicle reservations found
                          </td>
                    </tr>
                  ) : (
                    currentReservations.map((reservation) => (
                      <tr key={reservation.id} className={`hover:${
                        themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-50'
                      }`}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(reservation)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                              <button
                                onClick={() => handleEdit(reservation)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit"
                              >
                              <Edit className="h-4 w-4" />
                              </button>
                              <button
                              onClick={() => handleDeleteReservation(reservation.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                              <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reservation.justification}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reservation.start_date ? (() => {
                            try {
                              const date = new Date(reservation.start_date)
                              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                            } catch (error) {
                              return 'N/A'
                            }
                          })() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reservation.end_date ? (() => {
                            try {
                              const date = new Date(reservation.end_date)
                              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                            } catch (error) {
                              return 'N/A'
                            }
                          })() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reservation.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            reservation.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            reservation.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                            reservation.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reservation.vehicles.reg_number} ({reservation.vehicles.trim})
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reservation.created_at ? (() => {
                            try {
                              const date = new Date(reservation.created_at)
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedReservations.length)} of {filteredAndSortedReservations.length} results
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
      {showViewModal && selectedReservation && (
        <ViewVehicleReservationModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          reservation={selectedReservation}
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