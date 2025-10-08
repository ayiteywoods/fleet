'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from '@/components/Notification'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface FuelRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FuelRequest {
  id: string
  justification: string
  quantity: number
  unit_cost: number
  total_cost: number
  status: string
  vehicle_id: string
  created_at: string
  updated_at: string
  vehicles: {
    reg_number: string
    trim?: string
    year?: number
    status: string
  }
}

export default function FuelRequestModal({ isOpen, onClose }: FuelRequestModalProps) {
  const { themeColor, themeMode } = useTheme()
  const [fuelRequests, setFuelRequests] = useState<FuelRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof FuelRequest>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedFuelRequest, setSelectedFuelRequest] = useState<FuelRequest | null>(null)
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const [formData, setFormData] = useState({
    justification: '',
    quantity: '',
    unit_cost: '',
    total_cost: '',
    status: 'pending',
    vehicle_id: ''
  })
  const [vehicles, setVehicles] = useState<any[]>([])

  // Fetch fuel requests
  const fetchFuelRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fuel-request')
      if (response.ok) {
        const data = await response.json()
        setFuelRequests(data)
      }
    } catch (error) {
      console.error('Error fetching fuel requests:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch vehicles
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

  useEffect(() => {
    if (isOpen) {
      fetchFuelRequests()
      fetchVehicles()
    }
  }, [isOpen])

  // Filter and sort data
  const filteredData = fuelRequests.filter(request => {
    const searchLower = searchTerm.toLowerCase()
    return (
      request.justification.toLowerCase().includes(searchLower) ||
      request.vehicles.reg_number.toLowerCase().includes(searchLower) ||
      request.status.toLowerCase().includes(searchLower)
    )
  })

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === 'vehicles') {
      aValue = a.vehicles.reg_number
      bValue = b.vehicles.reg_number
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  // Handle sort
  const handleSort = (field: keyof FuelRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Handle actions
  const handleAdd = () => {
    setFormData({
      justification: '',
      quantity: '',
      unit_cost: '',
      total_cost: '',
      status: 'pending',
      vehicle_id: ''
    })
    setShowAddModal(true)
  }

  const handleEdit = (fuelRequest: FuelRequest) => {
    setSelectedFuelRequest(fuelRequest)
    setFormData({
      justification: fuelRequest.justification,
      quantity: fuelRequest.quantity.toString(),
      unit_cost: fuelRequest.unit_cost.toString(),
      total_cost: fuelRequest.total_cost.toString(),
      status: fuelRequest.status,
      vehicle_id: fuelRequest.vehicle_id
    })
    setShowEditModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this fuel request?')) {
      try {
        const response = await fetch(`/api/fuel-request?id=${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchFuelRequests()
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Fuel request deleted successfully!'
          })
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete fuel request'
          })
        }
      } catch (error) {
        console.error('Error deleting fuel request:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Error deleting fuel request'
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = showEditModal && selectedFuelRequest 
        ? `/api/fuel-request?id=${selectedFuelRequest.id}`
        : '/api/fuel-request'
      
      const method = showEditModal ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowAddModal(false)
        setShowEditModal(false)
        fetchFuelRequests()
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: showEditModal ? 'Fuel request updated successfully!' : 'Fuel request added successfully!'
        })
      } else {
        const error = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: error.error || 'Failed to save fuel request'
        })
      }
    } catch (error) {
      console.error('Error saving fuel request:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error saving fuel request'
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-calculate total cost when quantity or unit cost changes
    if (name === 'quantity' || name === 'unit_cost') {
      const quantity = name === 'quantity' ? parseFloat(value) : parseFloat(formData.quantity)
      const unitCost = name === 'unit_cost' ? parseFloat(value) : parseFloat(formData.unit_cost)
      
      if (!isNaN(quantity) && !isNaN(unitCost)) {
        setFormData(prev => ({
          ...prev,
          total_cost: (quantity * unitCost).toFixed(2)
        }))
      }
    }
  }

  // Export functions
  const handleExportExcel = () => {
    const dataToExport = filteredFuelRequests.map(request => ({
      'Justification': request.justification,
      'Quantity': request.quantity,
      'Unit Cost': request.unit_cost,
      'Total Cost': request.total_cost,
      'Status': request.status,
      'Vehicle': request.vehicles?.reg_number || '',
      'Created At': new Date(request.created_at).toLocaleDateString()
    }))
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'FuelRequests')
    XLSX.writeFile(wb, 'fuel_requests.xlsx')
  }

  const handleExportCSV = () => {
    const dataToExport = filteredFuelRequests.map(request => ({
      'Justification': request.justification,
      'Quantity': request.quantity,
      'Unit Cost': request.unit_cost,
      'Total Cost': request.total_cost,
      'Status': request.status,
      'Vehicle': request.vehicles?.reg_number || '',
      'Created At': new Date(request.created_at).toLocaleDateString()
    }))
    const header = Object.keys(dataToExport[0]).join(',')
    const rows = dataToExport.map(row => Object.values(row).join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'fuel_requests.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [['Justification', 'Quantity', 'Unit Cost', 'Total Cost', 'Status', 'Vehicle', 'Created At']],
      body: filteredFuelRequests.map(request => [
        request.justification,
        request.quantity,
        request.unit_cost,
        request.total_cost,
        request.status,
        request.vehicles?.reg_number || '',
        new Date(request.created_at).toLocaleDateString()
      ]),
      styles: { fillColor: themeMode === 'dark' ? [45, 55, 72] : [255, 255, 255], textColor: themeMode === 'dark' ? 255 : 0 },
      headStyles: { fillColor: themeMode === 'dark' ? [31, 41, 55] : [243, 244, 246], textColor: themeMode === 'dark' ? 255 : 0 },
      alternateRowStyles: { fillColor: themeMode === 'dark' ? [55, 65, 81] : [249, 250, 251] },
    })
    doc.save('fuel_requests.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Fuel Requests</title>
            <style>
              body { font-family: sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Fuel Requests</h1>
            <table>
              <thead>
                <tr>
                  <th>Justification</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th>Vehicle</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                ${filteredFuelRequests.map(request => `
                  <tr>
                    <td>${request.justification}</td>
                    <td>${request.quantity}</td>
                    <td>${request.unit_cost}</td>
                    <td>${request.total_cost}</td>
                    <td>${request.status}</td>
                    <td>${request.vehicles?.reg_number || ''}</td>
                    <td>${new Date(request.created_at).toLocaleDateString()}</td>
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
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`p-6 rounded-3xl shadow-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
        themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
          themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Fuel Request Management
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className={`flex items-center gap-2 px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                themeColor === 'blue' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Fuel Request
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-3xl transition-colors ${
                themeMode === 'dark' 
                  ? 'text-gray-400 hover:bg-gray-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search fuel requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={handleExportCSV}
                className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={handleExportPDF}
                className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <File className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handlePrint}
                className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className={`w-full ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <thead>
              <tr className={`border-b ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    themeMode === 'dark' 
                      ? 'text-gray-300 bg-gray-800' 
                      : 'text-gray-500 bg-gray-50'
                  }`}
                  onClick={() => handleSort('justification')}
                >
                  <div className="flex items-center gap-1">
                    Justification
                    {sortField === 'justification' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  themeMode === 'dark' 
                    ? 'text-gray-300 bg-gray-800' 
                    : 'text-gray-500 bg-gray-50'
                }`}>
                  Vehicle
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    themeMode === 'dark' 
                      ? 'text-gray-300 bg-gray-800' 
                      : 'text-gray-500 bg-gray-50'
                  }`}
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center gap-1">
                    Quantity (L)
                    {sortField === 'quantity' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    themeMode === 'dark' 
                      ? 'text-gray-300 bg-gray-800' 
                      : 'text-gray-500 bg-gray-50'
                  }`}
                  onClick={() => handleSort('unit_cost')}
                >
                  <div className="flex items-center gap-1">
                    Unit Cost (₵)
                    {sortField === 'unit_cost' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    themeMode === 'dark' 
                      ? 'text-gray-300 bg-gray-800' 
                      : 'text-gray-500 bg-gray-50'
                  }`}
                  onClick={() => handleSort('total_cost')}
                >
                  <div className="flex items-center gap-1">
                    Total Cost (₵)
                    {sortField === 'total_cost' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                    themeMode === 'dark' 
                      ? 'text-gray-300 bg-gray-800' 
                      : 'text-gray-500 bg-gray-50'
                  }`}
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  themeMode === 'dark' 
                    ? 'text-gray-300 bg-gray-800' 
                    : 'text-gray-500 bg-gray-50'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeMode === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {paginatedData.map((request) => (
                <tr key={request.id} className={`hover:${themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <td className={`px-4 py-4 text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {request.justification}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {request.vehicles.reg_number}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {Number(request.quantity).toFixed(2)}L
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    ₵{Number(request.unit_cost).toFixed(2)}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    ₵{Number(request.total_cost).toFixed(2)}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(request)}
                        className={`p-1 rounded transition-colors ${
                          themeMode === 'dark' 
                            ? 'text-green-400 hover:bg-gray-700' 
                            : 'text-green-600 hover:bg-gray-100'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(request.id)}
                        className={`p-1 rounded transition-colors ${
                          themeMode === 'dark' 
                            ? 'text-red-400 hover:bg-gray-700' 
                            : 'text-red-600 hover:bg-gray-100'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
              Show
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className={`px-2 py-1 border rounded text-sm ${
                themeMode === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
              entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded transition-colors ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : themeMode === 'dark' 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-1 rounded transition-colors ${
                currentPage === totalPages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : themeMode === 'dark' 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-60"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(2px)'
            }}
          >
            <div className={`p-6 rounded-3xl shadow-lg max-w-2xl w-full mx-4 ${
              themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {showAddModal ? 'Add Fuel Request' : 'Edit Fuel Request'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Vehicle *
                    </label>
                    <select
                      name="vehicle_id"
                      value={formData.vehicle_id}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        themeMode === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.reg_number} {vehicle.trim && `(${vehicle.trim})`} {vehicle.year && `- ${vehicle.year}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        themeMode === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Quantity (L) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        themeMode === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Unit Cost (₵) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="unit_cost"
                      value={formData.unit_cost}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        themeMode === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Total Cost (₵) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="total_cost"
                      value={formData.total_cost}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        themeMode === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Justification *
                  </label>
                  <textarea
                    name="justification"
                    value={formData.justification}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setShowEditModal(false)
                    }}
                    className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                      themeColor === 'blue' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {showAddModal ? 'Add' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
