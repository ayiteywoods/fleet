import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Calendar, Truck, Search } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface MaintenanceSchedule {
  id: string
  due_date: string
  vehicle_id: string
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
  vehicles?: {
    reg_number: string
    trim?: string
    year?: number
    status?: string
  }
}

interface MaintenanceScheduleModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MaintenanceScheduleModal({ isOpen, onClose }: MaintenanceScheduleModalProps) {
  const { themeMode } = useTheme()
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<MaintenanceSchedule | null>(null)
  const [formData, setFormData] = useState({
    due_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD format
    vehicle_id: ''
  })
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<keyof MaintenanceSchedule>('due_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch maintenance schedules
  const fetchMaintenanceSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/maintenance-schedule')
      if (response.ok) {
        const data = await response.json()
        setMaintenanceSchedules(data)
      } else {
        console.error('Failed to fetch maintenance schedules')
      }
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMaintenanceSchedules()
    }
  }, [isOpen])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle add schedule
  const handleAddSchedule = async () => {
    try {
      const response = await fetch('/api/maintenance-schedule', {
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
          message: 'Maintenance schedule added successfully!'
        })
        setFormData({
          due_date: new Date().toISOString().slice(0, 10),
          vehicle_id: ''
        })
        setShowAddForm(false)
        fetchMaintenanceSchedules()
      } else {
        const error = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: error.error || 'Failed to add maintenance schedule'
        })
      }
    } catch (error) {
      console.error('Error adding maintenance schedule:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to add maintenance schedule'
      })
    }
  }

  // Handle edit schedule
  const handleEditSchedule = (schedule: MaintenanceSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      due_date: schedule.due_date.split('T')[0], // Convert to YYYY-MM-DD format
      vehicle_id: schedule.vehicle_id
    })
    setShowAddForm(true)
  }

  // Handle update schedule
  const handleUpdate = async () => {
    if (!editingSchedule) return

    try {
      const response = await fetch(`/api/maintenance-schedule?id=${editingSchedule.id}`, {
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
          message: 'Maintenance schedule updated successfully!'
        })
        setFormData({
          due_date: new Date().toISOString().slice(0, 10),
          vehicle_id: ''
        })
        setEditingSchedule(null)
        setShowAddForm(false)
        fetchMaintenanceSchedules()
      } else {
        const error = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: error.error || 'Failed to update maintenance schedule'
        })
      }
    } catch (error) {
      console.error('Error updating maintenance schedule:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update maintenance schedule'
      })
    }
  }

  // Handle delete schedule
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance schedule?')) return

    try {
      const response = await fetch(`/api/maintenance-schedule?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Maintenance schedule deleted successfully!'
        })
        fetchMaintenanceSchedules()
      } else {
        const error = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: error.error || 'Failed to delete maintenance schedule'
        })
      }
    } catch (error) {
      console.error('Error deleting maintenance schedule:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to delete maintenance schedule'
      })
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      due_date: new Date().toISOString().slice(0, 10),
      vehicle_id: ''
    })
    setEditingSchedule(null)
    setShowAddForm(false)
  }

  // Handle sort
  const handleSort = (field: keyof MaintenanceSchedule) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort data
  const filteredSchedules = maintenanceSchedules.filter(schedule =>
    schedule.vehicles?.reg_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.vehicles?.trim?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.due_date.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedSchedules.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSchedules = sortedSchedules.slice(startIndex, startIndex + itemsPerPage)

  // Export functions
  const handleExportExcel = () => {
    const data = sortedSchedules.map(schedule => ({
      'Due Date': new Date(schedule.due_date).toLocaleDateString(),
      'Vehicle Registration': schedule.vehicles?.reg_number || 'N/A',
      'Vehicle Model': schedule.vehicles?.trim || 'N/A',
      'Vehicle Year': schedule.vehicles?.year || 'N/A',
      'Vehicle Status': schedule.vehicles?.status || 'N/A',
      'Created At': schedule.created_at ? new Date(schedule.created_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Maintenance Schedules')
    XLSX.writeFile(wb, 'maintenance-schedules.xlsx')
  }

  const handleExportCSV = () => {
    const data = sortedSchedules.map(schedule => ({
      'Due Date': new Date(schedule.due_date).toLocaleDateString(),
      'Vehicle Registration': schedule.vehicles?.reg_number || 'N/A',
      'Vehicle Model': schedule.vehicles?.trim || 'N/A',
      'Vehicle Year': schedule.vehicles?.year || 'N/A',
      'Vehicle Status': schedule.vehicles?.status || 'N/A',
      'Created At': schedule.created_at ? new Date(schedule.created_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'maintenance-schedules.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Maintenance Schedules', 14, 22)
    
    const data = sortedSchedules.map(schedule => [
      new Date(schedule.due_date).toLocaleDateString(),
      schedule.vehicles?.reg_number || 'N/A',
      schedule.vehicles?.trim || 'N/A',
      schedule.vehicles?.year?.toString() || 'N/A',
      schedule.vehicles?.status || 'N/A'
    ])

    autoTable(doc, {
      head: [['Due Date', 'Vehicle Registration', 'Vehicle Model', 'Vehicle Year', 'Vehicle Status']],
      body: data,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    })

    doc.save('maintenance-schedules.pdf')
  }

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative z-10 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-xl ${
        themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Maintenance Schedule Management
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {showAddForm ? (
            /* Add/Edit Form */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      themeMode === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Truck className="w-4 h-4" />
                    Vehicle ID *
                  </label>
                  <input
                    type="number"
                    name="vehicle_id"
                    value={formData.vehicle_id}
                    onChange={handleChange}
                    placeholder="Enter vehicle ID"
                    min="1"
                    required
                    className={`w-full px-3 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      themeMode === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={editingSchedule ? handleUpdate : handleAddSchedule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors"
                >
                  {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded-3xl hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Table View */
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Schedule
                  </button>
                </div>

                <div className="flex gap-2">
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

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search maintenance schedules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    themeMode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th 
                        className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 transition-colors"
                        onClick={() => handleSort('due_date')}
                      >
                        <div className="flex items-center gap-2">
                          Due Date
                          {sortField === 'due_date' && (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">Vehicle Registration</th>
                      <th className="px-4 py-3 text-left">Vehicle Model</th>
                      <th className="px-4 py-3 text-left">Vehicle Year</th>
                      <th className="px-4 py-3 text-left">Vehicle Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : paginatedSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No maintenance schedules found
                        </td>
                      </tr>
                    ) : (
                      paginatedSchedules.map((schedule) => (
                        <tr key={schedule.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3">
                            {new Date(schedule.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            {schedule.vehicles?.reg_number || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            {schedule.vehicles?.trim || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            {schedule.vehicles?.year || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              schedule.vehicles?.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {schedule.vehicles?.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditSchedule(schedule)}
                                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(schedule.id)}
                                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedSchedules.length)} of {sortedSchedules.length} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-2 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  )
}
