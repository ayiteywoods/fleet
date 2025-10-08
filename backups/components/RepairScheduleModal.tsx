'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Calendar, User, Wrench } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface RepairSchedule {
  id: string
  schedule_date: string
  assigned_technician: string
  repair_request_id: string
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
}

interface RepairScheduleModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RepairScheduleModal({ isOpen, onClose }: RepairScheduleModalProps) {
  const { themeMode } = useTheme()
  const [repairSchedules, setRepairSchedules] = useState<RepairSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<RepairSchedule | null>(null)
  const [formData, setFormData] = useState({
    schedule_date: new Date().toISOString().slice(0, 16),
    assigned_technician: '',
    repair_request_id: ''
  })
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<keyof RepairSchedule>('schedule_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch repair schedules
  useEffect(() => {
    if (isOpen) {
      fetchRepairSchedules()
    }
  }, [isOpen])

  const fetchRepairSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/repair-schedule')
      if (response.ok) {
        const data = await response.json()
        setRepairSchedules(data)
      } else {
        console.error('Failed to fetch repair schedules')
      }
    } catch (error) {
      console.error('Error fetching repair schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSchedule = async () => {
    try {
      const response = await fetch('/api/repair-schedule', {
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
          title: 'Repair Schedule Added!',
          message: `Repair schedule has been added successfully.`
        })
        
        setFormData({
          schedule_date: new Date().toISOString().slice(0, 16),
          assigned_technician: '',
          repair_request_id: ''
        })
        setShowAddForm(false)
        fetchRepairSchedules()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add repair schedule.'
        })
      }
    } catch (error) {
      console.error('Error adding repair schedule:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleEdit = (schedule: RepairSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      schedule_date: schedule.schedule_date ? new Date(schedule.schedule_date).toISOString().slice(0, 16) : '',
      assigned_technician: schedule.assigned_technician,
      repair_request_id: schedule.repair_request_id
    })
    setShowAddForm(true)
  }

  const handleUpdate = async () => {
    if (!editingSchedule) return

    try {
      const response = await fetch(`/api/repair-schedule?id=${editingSchedule.id}`, {
        method: 'PUT',
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
          title: 'Repair Schedule Updated!',
          message: `Repair schedule has been updated successfully.`
        })
        
        setFormData({
          schedule_date: new Date().toISOString().slice(0, 16),
          assigned_technician: '',
          repair_request_id: ''
        })
        setEditingSchedule(null)
        setShowAddForm(false)
        fetchRepairSchedules()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update repair schedule.'
        })
      }
    } catch (error) {
      console.error('Error updating repair schedule:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleDelete = async (schedule: RepairSchedule) => {
    if (confirm(`Are you sure you want to delete this repair schedule?`)) {
      try {
        const response = await fetch(`/api/repair-schedule?id=${schedule.id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Repair Schedule Deleted!',
            message: `Repair schedule has been deleted successfully.`
          })
          
          fetchRepairSchedules()
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: result.error || 'Failed to delete repair schedule.'
          })
        }
      } catch (error) {
        console.error('Error deleting repair schedule:', error)
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
    if (editingSchedule) {
      handleUpdate()
    } else {
      handleAddSchedule()
    }
  }

  const handleCancel = () => {
    setFormData({
      schedule_date: new Date().toISOString().slice(0, 16),
      assigned_technician: '',
      repair_request_id: ''
    })
    setEditingSchedule(null)
    setShowAddForm(false)
  }

  // Export functions
  const handleExportExcel = () => {
    const data = filteredAndSortedSchedules.map(schedule => ({
      'Schedule Date': new Date(schedule.schedule_date).toLocaleDateString(),
      'Assigned Technician': schedule.assigned_technician,
      'Repair Request ID': schedule.repair_request_id,
      'Created At': schedule.created_at ? new Date(schedule.created_at).toLocaleDateString() : 'N/A',
      'Updated At': schedule.updated_at ? new Date(schedule.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Repair Schedules')
    XLSX.writeFile(wb, 'repair-schedules.xlsx')
  }

  const handleExportCSV = () => {
    const data = filteredAndSortedSchedules.map(schedule => ({
      'Schedule Date': new Date(schedule.schedule_date).toLocaleDateString(),
      'Assigned Technician': schedule.assigned_technician,
      'Repair Request ID': schedule.repair_request_id,
      'Created At': schedule.created_at ? new Date(schedule.created_at).toLocaleDateString() : 'N/A',
      'Updated At': schedule.updated_at ? new Date(schedule.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'repair-schedules.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('Repair Schedules Report', 14, 22)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    
    // Prepare table data
    const tableData = filteredAndSortedSchedules.map(schedule => [
      new Date(schedule.schedule_date).toLocaleDateString(),
      schedule.assigned_technician,
      schedule.repair_request_id,
      schedule.created_at ? new Date(schedule.created_at).toLocaleDateString() : 'N/A'
    ])
    
    autoTable(doc, {
      head: [['Schedule Date', 'Assigned Technician', 'Repair Request ID', 'Created At']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    })
    
    doc.save('repair-schedules.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const tableData = filteredAndSortedSchedules.map(schedule => `
        <tr>
          <td>${new Date(schedule.schedule_date).toLocaleDateString()}</td>
          <td>${schedule.assigned_technician}</td>
          <td>${schedule.repair_request_id}</td>
          <td>${schedule.created_at ? new Date(schedule.created_at).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <html>
          <head>
            <title>Repair Schedules Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #3b82f6; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #3b82f6; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Repair Schedules Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Schedule Date</th>
                  <th>Assigned Technician</th>
                  <th>Repair Request ID</th>
                  <th>Created At</th>
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
  const filteredAndSortedSchedules = repairSchedules
    .filter(schedule => 
      schedule.assigned_technician.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.repair_request_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(schedule.schedule_date).toLocaleDateString().toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField] || ''
      const bValue = b[sortField] || ''
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedSchedules.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSchedules = filteredAndSortedSchedules.slice(startIndex, endIndex)

  const handleSort = (field: keyof RepairSchedule) => {
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
        <div className={`relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-lg shadow-xl ${
          themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Repair Schedules Management
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
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-4">
                  {editingSchedule ? 'Edit Repair Schedule' : 'Add New Repair Schedule'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="w-4 h-4" />
                        Schedule Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.schedule_date}
                        onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <User className="w-4 h-4" />
                        Assigned Technician *
                      </label>
                      <input
                        type="number"
                        value={formData.assigned_technician}
                        onChange={(e) => setFormData({ ...formData, assigned_technician: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter technician ID"
                        min="1"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <Wrench className="w-4 h-4" />
                        Repair Request ID *
                      </label>
                      <input
                        type="number"
                        value={formData.repair_request_id}
                        onChange={(e) => setFormData({ ...formData, repair_request_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter repair request ID"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      {editingSchedule ? 'Update' : 'Add'} Schedule
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Button */}
            {!showAddForm && (
              <div className="mb-4">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Schedule
                </button>
              </div>
            )}

            {/* Search and Export Controls */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search repair schedules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      themeMode === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                </div>
                
                {/* Export Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleExportExcel}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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

            {/* Repair Schedules Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading repair schedules...</p>
                </div>
              ) : filteredAndSortedSchedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No repair schedules match your search.' : 'No repair schedules found. Add some to get started.'}
                </div>
              ) : (
                <>
                  <table className={`min-w-full border-collapse ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <thead>
                      <tr className={`${
                        themeMode === 'dark' 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('schedule_date')}
                        >
                          <div className="flex items-center gap-1">
                            Schedule Date
                            {sortField === 'schedule_date' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('assigned_technician')}
                        >
                          <div className="flex items-center gap-1">
                            Assigned Technician
                            {sortField === 'assigned_technician' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('repair_request_id')}
                        >
                          <div className="flex items-center gap-1">
                            Repair Request ID
                            {sortField === 'repair_request_id' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Created At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      themeMode === 'dark' 
                        ? 'divide-gray-600 bg-gray-800' 
                        : 'divide-gray-200 bg-white'
                    }`}>
                      {paginatedSchedules.map((schedule) => (
                        <tr key={schedule.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            {new Date(schedule.schedule_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schedule.assigned_technician}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schedule.repair_request_id}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schedule.created_at ? new Date(schedule.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(schedule)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(schedule)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(endIndex, filteredAndSortedSchedules.length)}</span> of{' '}
                            <span className="font-medium">{filteredAndSortedSchedules.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  page === currentPage
                                    ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                            
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  )
}
