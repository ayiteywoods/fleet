'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from '@/components/Notification'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface FuelExpenseLogModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FuelExpenseLog {
  id: string
  vendor: string
  payment_method: string
  fuel_request_id: string
  created_at: string
  updated_at: string
  fuel_request: {
    id: string
    justification: string
    quantity: number
    unit_cost: number
    total_cost: number
    status: string
    vehicle_id: string
    vehicles: {
      reg_number: string
      trim?: string
      year?: number
    }
  }
}

export default function FuelExpenseLogModal({ isOpen, onClose }: FuelExpenseLogModalProps) {
  const { themeColor, themeMode } = useTheme()
  const [fuelExpenseLogs, setFuelExpenseLogs] = useState<FuelExpenseLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof FuelExpenseLog>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showAddModal, setShowAddModal] = useState(false)
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedExpenseLog, setSelectedExpenseLog] = useState<FuelExpenseLog | null>(null)
  const [formData, setFormData] = useState({
    vendor: '',
    payment_method: '',
    fuel_request_id: ''
  })
  const [fuelRequests, setFuelRequests] = useState<any[]>([])

  const getAuthHeaders = () => {
    if (typeof window === 'undefined') {
      return {}
    }
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Fetch fuel expense logs
  const fetchFuelExpenseLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fuel-expense-log', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setFuelExpenseLogs(data)
      }
    } catch (error) {
      console.error('Error fetching fuel expense logs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch fuel requests (including those already converted to expense logs)
  const fetchFuelRequests = async () => {
    try {
      const response = await fetch('/api/fuel-request?include_converted=true', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setFuelRequests(data)
      }
    } catch (error) {
      console.error('Error fetching fuel requests:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchFuelExpenseLogs()
      fetchFuelRequests()
    }
  }, [isOpen])

  // Filter and sort data
  const filteredData = fuelExpenseLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase()
    return (
      log.vendor.toLowerCase().includes(searchLower) ||
      log.payment_method.toLowerCase().includes(searchLower) ||
      log.fuel_request.vehicles.reg_number.toLowerCase().includes(searchLower)
    )
  })

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === 'fuel_request') {
      aValue = a.fuel_request.justification
      bValue = b.fuel_request.justification
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
  const handleSort = (field: keyof FuelExpenseLog) => {
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
      vendor: '',
      payment_method: '',
      fuel_request_id: ''
    })
    setShowAddModal(true)
  }

  const handleEdit = (expenseLog: FuelExpenseLog) => {
    setSelectedExpenseLog(expenseLog)
    setFormData({
      vendor: expenseLog.vendor,
      payment_method: expenseLog.payment_method,
      fuel_request_id: expenseLog.fuel_request_id
    })
    setShowEditModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this fuel expense log?')) {
      try {
        const response = await fetch(`/api/fuel-expense-log?id=${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
        if (response.ok) {
          fetchFuelExpenseLogs()
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Fuel expense log deleted successfully!'
          })
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete fuel expense log'
          })
        }
      } catch (error) {
        console.error('Error deleting fuel expense log:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Error deleting fuel expense log'
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = showEditModal && selectedExpenseLog 
        ? `/api/fuel-expense-log?id=${selectedExpenseLog.id}`
        : '/api/fuel-expense-log'
      
      const method = showEditModal ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowAddModal(false)
        setShowEditModal(false)
        fetchFuelExpenseLogs()
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: showEditModal ? 'Fuel expense log updated successfully!' : 'Fuel expense log added successfully!'
        })
      } else {
        const error = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: error.error || 'Failed to save fuel expense log'
        })
      }
    } catch (error) {
      console.error('Error saving fuel expense log:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error saving fuel expense log'
      })
    }
  }

  // Export functions
  const handleExportExcel = () => {
    const dataToExport = filteredFuelExpenseLogs.map(log => ({
      'Vendor': log.vendor,
      'Payment Method': log.payment_method,
      'Fuel Request ID': log.fuel_request_id,
      'Vehicle': log.fuel_request?.vehicles?.reg_number || '',
      'Justification': log.fuel_request?.justification || '',
      'Quantity': log.fuel_request?.quantity || 0,
      'Unit Cost': log.fuel_request?.unit_cost || 0,
      'Total Cost': log.fuel_request?.total_cost || 0,
      'Status': log.fuel_request?.status || '',
      'Created At': new Date(log.created_at).toLocaleDateString()
    }))
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'FuelExpenseLogs')
    XLSX.writeFile(wb, 'fuel_expense_logs.xlsx')
  }

  const handleExportCSV = () => {
    const dataToExport = filteredFuelExpenseLogs.map(log => ({
      'Vendor': log.vendor,
      'Payment Method': log.payment_method,
      'Fuel Request ID': log.fuel_request_id,
      'Vehicle': log.fuel_request?.vehicles?.reg_number || '',
      'Justification': log.fuel_request?.justification || '',
      'Quantity': log.fuel_request?.quantity || 0,
      'Unit Cost': log.fuel_request?.unit_cost || 0,
      'Total Cost': log.fuel_request?.total_cost || 0,
      'Status': log.fuel_request?.status || '',
      'Created At': new Date(log.created_at).toLocaleDateString()
    }))
    const header = Object.keys(dataToExport[0]).join(',')
    const rows = dataToExport.map(row => Object.values(row).join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'fuel_expense_logs.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [['Vendor', 'Payment Method', 'Fuel Request ID', 'Vehicle', 'Justification', 'Quantity', 'Unit Cost', 'Total Cost', 'Status', 'Created At']],
      body: filteredFuelExpenseLogs.map(log => [
        log.vendor,
        log.payment_method,
        log.fuel_request_id,
        log.fuel_request?.vehicles?.reg_number || '',
        log.fuel_request?.justification || '',
        log.fuel_request?.quantity || 0,
        log.fuel_request?.unit_cost || 0,
        log.fuel_request?.total_cost || 0,
        log.fuel_request?.status || '',
        new Date(log.created_at).toLocaleDateString()
      ]),
      styles: { fillColor: themeMode === 'dark' ? [45, 55, 72] : [255, 255, 255], textColor: themeMode === 'dark' ? 255 : 0 },
      headStyles: { fillColor: themeMode === 'dark' ? [31, 41, 55] : [243, 244, 246], textColor: themeMode === 'dark' ? 255 : 0 },
      alternateRowStyles: { fillColor: themeMode === 'dark' ? [55, 65, 81] : [249, 250, 251] },
    })
    doc.save('fuel_expense_logs.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Fuel Expense Logs</title>
            <style>
              body { font-family: sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Fuel Expense Logs</h1>
            <table>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Payment Method</th>
                  <th>Fuel Request ID</th>
                  <th>Vehicle</th>
                  <th>Justification</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                ${filteredFuelExpenseLogs.map(log => `
                  <tr>
                    <td>${log.vendor}</td>
                    <td>${log.payment_method}</td>
                    <td>${log.fuel_request_id}</td>
                    <td>${log.fuel_request?.vehicles?.reg_number || ''}</td>
                    <td>${log.fuel_request?.justification || ''}</td>
                    <td>${log.fuel_request?.quantity || 0}</td>
                    <td>${log.fuel_request?.unit_cost || 0}</td>
                    <td>${log.fuel_request?.total_cost || 0}</td>
                    <td>${log.fuel_request?.status || ''}</td>
                    <td>${new Date(log.created_at).toLocaleDateString()}</td>
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
            Fuel Expense Log Management
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
              Add Expense Log
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
                placeholder="Search fuel expense logs..."
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
                  onClick={() => handleSort('vendor')}
                >
                  <div className="flex items-center gap-1">
                    Vendor
                    {sortField === 'vendor' && (
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
                  onClick={() => handleSort('payment_method')}
                >
                  <div className="flex items-center gap-1">
                    Payment Method
                    {sortField === 'payment_method' && (
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
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  themeMode === 'dark' 
                    ? 'text-gray-300 bg-gray-800' 
                    : 'text-gray-500 bg-gray-50'
                }`}>
                  Justification
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  themeMode === 'dark' 
                    ? 'text-gray-300 bg-gray-800' 
                    : 'text-gray-500 bg-gray-50'
                }`}>
                  Total Cost (₵)
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
              {paginatedData.map((log) => (
                <tr key={log.id} className={`hover:${themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {log.vendor}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {log.payment_method}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {log.fuel_request.vehicles.reg_number}
                  </td>
                  <td className={`px-4 py-4 text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {log.fuel_request.justification}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    ₵{Number(log.fuel_request.total_cost).toFixed(2)}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(log)}
                        className={`p-1 rounded transition-colors ${
                          themeMode === 'dark' 
                            ? 'text-green-400 hover:bg-gray-700' 
                            : 'text-green-600 hover:bg-gray-100'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(log.id)}
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
            <div className={`p-6 rounded-3xl shadow-lg max-w-md w-full mx-4 ${
              themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {showAddModal ? 'Add Fuel Expense Log' : 'Edit Fuel Expense Log'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Vendor *
                  </label>
                  <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
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
                    Payment Method *
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                    required
                    className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Money">Mobile Money</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Fuel Request *
                  </label>
                  <select
                    name="fuel_request_id"
                    value={formData.fuel_request_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuel_request_id: e.target.value }))}
                    required
                    className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select Fuel Request</option>
                    {fuelRequests.map((request) => (
                      <option key={request.id} value={request.id}>
                        {request.vehicles.reg_number} - ₵{Number(request.total_cost).toFixed(2)}
                      </option>
                    ))}
                  </select>
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
