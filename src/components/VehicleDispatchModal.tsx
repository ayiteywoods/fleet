'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, Eye, MapPin, User, Calendar, Car, Users, Search } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewVehicleDispatchModal from './ViewVehicleDispatchModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Vehicle {
  id: string
  reg_number: string
  vin_number: string | null
  trim: string | null
  year: number | null
  status: string
  color: string | null
  current_region: string | null
  current_district: string | null
}

interface Driver {
  id: string
  name: string
  license_number: string
}

interface VehicleDispatch {
  id: string
  region: string
  district: string
  first_maintenance: string | null
  assigned_to: string
  received_by: string
  purpose: string | null
  dispatch_date: string
  expected_return_date: string | null
  vehicle_id: string
  driver_id: string
  created_at: string | null
  updated_at: string | null
  vehicles?: Vehicle
}

interface VehicleDispatchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VehicleDispatchModal({ isOpen, onClose }: VehicleDispatchModalProps) {
  const { themeMode } = useTheme()
  const [vehicleDispatches, setVehicleDispatches] = useState<VehicleDispatch[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDispatch, setEditingDispatch] = useState<VehicleDispatch | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDispatch, setSelectedDispatch] = useState<VehicleDispatch | null>(null)
  const [formData, setFormData] = useState({
    region: '',
    district: '',
    first_maintenance: '',
    assigned_to: '',
    received_by: '',
    purpose: '',
    dispatch_date: '',
    expected_return_date: '',
    vehicle_id: '',
    driver_id: ''
  })
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<keyof VehicleDispatch>('dispatch_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch data
  useEffect(() => {
    if (isOpen) {
      fetchVehicleDispatches()
      fetchVehicles()
      fetchDrivers()
    }
  }, [isOpen])

  const fetchVehicleDispatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vehicle-dispatch')
      if (response.ok) {
        const data = await response.json()
        setVehicleDispatches(data)
      } else {
        console.error('Failed to fetch vehicle dispatches')
      }
    } catch (error) {
      console.error('Error fetching vehicle dispatches:', error)
    } finally {
      setLoading(false)
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

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers')
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
      } else {
        console.error('Failed to fetch drivers')
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const handleAddDispatch = async () => {
    try {
      const response = await fetch('/api/vehicle-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Vehicle Dispatch Added!',
          message: `Dispatch has been added successfully.`
        })
        
        setFormData({
          region: '',
          district: '',
          first_maintenance: '',
          assigned_to: '',
          received_by: '',
          purpose: '',
          dispatch_date: '',
          expected_return_date: '',
          vehicle_id: '',
          driver_id: ''
        })
        setShowAddForm(false)
        fetchVehicleDispatches()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to add vehicle dispatch.'
        })
      }
    } catch (error) {
      console.error('Error adding vehicle dispatch:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'An error occurred while adding the vehicle dispatch.'
      })
    }
  }

  const handleUpdateDispatch = async () => {
    if (!editingDispatch) return

    try {
      const response = await fetch('/api/vehicle-dispatch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingDispatch.id,
          ...formData
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Vehicle Dispatch Updated!',
          message: `Dispatch has been updated successfully.`
        })
        
        setFormData({
          region: '',
          district: '',
          first_maintenance: '',
          assigned_to: '',
          received_by: '',
          purpose: '',
          dispatch_date: '',
          expected_return_date: '',
          vehicle_id: '',
          driver_id: ''
        })
        setEditingDispatch(null)
        setShowAddForm(false)
        fetchVehicleDispatches()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to update vehicle dispatch.'
        })
      }
    } catch (error) {
      console.error('Error updating vehicle dispatch:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'An error occurred while updating the vehicle dispatch.'
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingDispatch) {
      handleUpdateDispatch()
    } else {
      handleAddDispatch()
    }
  }

  const handleEdit = (dispatch: VehicleDispatch) => {
    setEditingDispatch(dispatch)
    setFormData({
      region: dispatch.region,
      district: dispatch.district,
      first_maintenance: dispatch.first_maintenance ? dispatch.first_maintenance.split('T')[0] : '',
      assigned_to: dispatch.assigned_to,
      received_by: dispatch.received_by,
      purpose: dispatch.purpose || '',
      dispatch_date: dispatch.dispatch_date.split('T')[0],
      expected_return_date: dispatch.expected_return_date ? dispatch.expected_return_date.split('T')[0] : '',
      vehicle_id: dispatch.vehicle_id,
      driver_id: dispatch.driver_id
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle dispatch?')) {
      try {
        const response = await fetch(`/api/vehicle-dispatch?id=${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Vehicle Dispatch Deleted!',
            message: 'Vehicle dispatch has been deleted successfully.'
          })
          fetchVehicleDispatches()
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete vehicle dispatch.'
          })
        }
      } catch (error) {
        console.error('Error deleting vehicle dispatch:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'An error occurred while deleting the vehicle dispatch.'
        })
      }
    }
  }

  const handleView = (dispatch: VehicleDispatch) => {
    setSelectedDispatch(dispatch)
    setShowViewModal(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingDispatch(null)
    setFormData({
      region: '',
      district: '',
      first_maintenance: '',
      assigned_to: '',
      received_by: '',
      purpose: '',
      dispatch_date: '',
      expected_return_date: '',
      vehicle_id: '',
      driver_id: ''
    })
  }

  // Filter and sort dispatches
  const filteredDispatches = vehicleDispatches.filter(dispatch =>
    dispatch.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dispatch.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dispatch.assigned_to.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dispatch.received_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dispatch.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    (dispatch.vehicles?.reg_number.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    (dispatch.vehicles?.vin_number?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
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

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedDispatches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDispatches = filteredAndSortedDispatches.slice(startIndex, endIndex)

  const handleSort = (field: keyof VehicleDispatch) => {
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
    const data = vehicleDispatches.map(dispatch => ({
      'Region': dispatch.region,
      'District': dispatch.district,
      'Assigned To': dispatch.assigned_to,
      'Received By': dispatch.received_by,
      'Purpose': dispatch.purpose || 'N/A',
      'Dispatch Date': dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toLocaleDateString() : 'N/A',
      'Expected Return': dispatch.expected_return_date ? new Date(dispatch.expected_return_date).toLocaleDateString() : 'N/A',
      'Vehicle': dispatch.vehicles ? `${dispatch.vehicles.reg_number}${dispatch.vehicles.trim ? ` (${dispatch.vehicles.trim})` : ''}${dispatch.vehicles.year ? ` - ${dispatch.vehicles.year}` : ''}` : 'N/A',
      'Driver': 'N/A',
      'Created At': dispatch.created_at ? new Date(dispatch.created_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Dispatches')
    XLSX.writeFile(wb, 'vehicle-dispatches.xlsx')
  }

  const handleExportCSV = () => {
    const data = vehicleDispatches.map(dispatch => ({
      'Region': dispatch.region,
      'District': dispatch.district,
      'Assigned To': dispatch.assigned_to,
      'Received By': dispatch.received_by,
      'Purpose': dispatch.purpose || 'N/A',
      'Dispatch Date': dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toLocaleDateString() : 'N/A',
      'Expected Return': dispatch.expected_return_date ? new Date(dispatch.expected_return_date).toLocaleDateString() : 'N/A',
      'Vehicle': dispatch.vehicles ? `${dispatch.vehicles.reg_number}${dispatch.vehicles.trim ? ` (${dispatch.vehicles.trim})` : ''}${dispatch.vehicles.year ? ` - ${dispatch.vehicles.year}` : ''}` : 'N/A',
      'Driver': 'N/A',
      'Created At': dispatch.created_at ? new Date(dispatch.created_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vehicle-dispatches.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Vehicle Dispatch Report', 14, 22)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    
    // Prepare data for table
    const tableData = vehicleDispatches.map(dispatch => [
      dispatch.region,
      dispatch.district,
      dispatch.assigned_to,
      dispatch.received_by,
      dispatch.purpose || 'N/A',
      dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toLocaleDateString() : 'N/A',
      dispatch.expected_return_date ? new Date(dispatch.expected_return_date).toLocaleDateString() : 'N/A',
      dispatch.vehicle ? `${dispatch.vehicle.make} ${dispatch.vehicle.model}` : 'N/A',
      dispatch.driver ? dispatch.driver.name : 'N/A'
    ])

    autoTable(doc, {
      head: [['Region', 'District', 'Assigned To', 'Received By', 'Purpose', 'Dispatch Date', 'Expected Return', 'Vehicle', 'Driver']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [59, 130, 246] }
    })
    
    doc.save('vehicle-dispatches.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const tableData = filteredAndSortedDispatches.map(dispatch => `
        <tr>
          <td>${dispatch.region}</td>
          <td>${dispatch.district}</td>
          <td>${dispatch.assigned_to}</td>
          <td>${dispatch.received_by}</td>
          <td>${dispatch.purpose || 'N/A'}</td>
          <td>${dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toLocaleDateString() : 'N/A'}</td>
          <td>${dispatch.expected_return_date ? new Date(dispatch.expected_return_date).toLocaleDateString() : 'N/A'}</td>
          <td>${dispatch.vehicles ? `${dispatch.vehicles.reg_number}${dispatch.vehicles.trim ? ` (${dispatch.vehicles.trim})` : ''}${dispatch.vehicles.year ? ` - ${dispatch.vehicles.year}` : ''}` : 'N/A'}</td>
          <td>N/A</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <html>
          <head>
            <title>Vehicle Dispatch Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #3b82f6; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Vehicle Dispatch Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Region</th>
                  <th>District</th>
                  <th>Assigned To</th>
                  <th>Received By</th>
                  <th>Purpose</th>
                  <th>Dispatch Date</th>
                  <th>Expected Return</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
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
              Vehicle Dispatch Management
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
                  {editingDispatch ? 'Edit Vehicle Dispatch' : 'Add New Vehicle Dispatch'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                          placeholder="e.g., Central Region"
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
                          placeholder="e.g., Kampala"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned To *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.assigned_to}
                          onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., John Doe"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Received By *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.received_by}
                          onChange={(e) => setFormData({ ...formData, received_by: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Jane Smith"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purpose
                      </label>
                      <input
                        type="text"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Field work, Delivery"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dispatch Date *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={formData.dispatch_date}
                          onChange={(e) => setFormData({ ...formData, dispatch_date: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Return Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={formData.expected_return_date}
                          onChange={(e) => setFormData({ ...formData, expected_return_date: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Maintenance Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={formData.first_maintenance}
                          onChange={(e) => setFormData({ ...formData, first_maintenance: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          <option value="">Select a vehicle</option>
                          {vehicles.length > 0 ? vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.reg_number}{vehicle.trim ? ` (${vehicle.trim})` : ''}{vehicle.year ? ` - ${vehicle.year}` : ''}
                            </option>
                          )) : (
                            <option disabled>No vehicles available</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driver *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={formData.driver_id}
                          onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select a driver</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name} - {driver.license_number}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                    >
                      {editingDispatch ? 'Update' : 'Add'} Dispatch
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
                  Add New Dispatch
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

            {/* Dispatches Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading dispatches...</p>
                </div>
              ) : filteredAndSortedDispatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No dispatches match your search.' : 'No dispatches found. Add some to get started.'}
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
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                          onClick={() => handleSort('assigned_to')}
                        >
                          <div className="flex items-center gap-1">
                            Assigned To
                            {sortField === 'assigned_to' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                          onClick={() => handleSort('dispatch_date')}
                        >
                          <div className="flex items-center gap-1">
                            Dispatch Date
                            {sortField === 'dispatch_date' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                          onClick={() => handleSort('expected_return_date')}
                        >
                          <div className="flex items-center gap-1">
                            Expected Return
                            {sortField === 'expected_return_date' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Vehicle
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Driver
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      themeMode === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'
                    }`}>
                      {paginatedDispatches.map((dispatch) => (
                        <tr key={dispatch.id} className={`hover:${
                          themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(dispatch)}
                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(dispatch)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(dispatch.id)}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {dispatch.region}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dispatch.district}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dispatch.assigned_to}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dispatch.expected_return_date ? new Date(dispatch.expected_return_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dispatch.vehicles ? `${dispatch.vehicles.reg_number}${dispatch.vehicles.trim ? ` (${dispatch.vehicles.trim})` : ''}` : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            N/A
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
                            <span className="font-medium">{Math.min(endIndex, filteredAndSortedDispatches.length)}</span> of{' '}
                            <span className="font-medium">{filteredAndSortedDispatches.length}</span> results
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
      <ViewVehicleDispatchModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        dispatch={selectedDispatch}
      />
    </>
  )
}
