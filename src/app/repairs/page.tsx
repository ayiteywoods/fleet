'use client'

import { useState, useEffect } from 'react'
import { 
  Wrench, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Banknote,
  Plus,
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  Search,
  Eye,
  Edit,
  X,
  ChevronUp,
  ChevronDown,
  Settings
} from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useTheme } from '@/contexts/ThemeContext'
import DashboardLayout from '@/components/DashboardLayout'
import AddRepairModal from '@/components/AddRepairModal'
import ViewRepairModal from '@/components/ViewRepairModal'
import EditRepairModal from '@/components/EditRepairModal'
import RepairRequestModal from '@/components/RepairRequestModal'
import RepairScheduleModal from '@/components/RepairScheduleModal'
import Notification from '@/components/Notification'

// Define Repair type
interface Repair {
  id: string
  service_date: string
  cost: string
  status: string
  vehicle_id: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  vehicles: {
    reg_number: string
    trim?: string
    year?: number
    status?: string
  }
  [key: string]: any
}

export default function RepairsPage() {
  const { themeMode } = useTheme()
  const [repairRecords, setRepairRecords] = useState<Repair[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning',
    title: '',
    message: ''
  })
  const [showAddRepairModal, setShowAddRepairModal] = useState(false)
  const [showViewRepairModal, setShowViewRepairModal] = useState(false)
  const [showEditRepairModal, setShowEditRepairModal] = useState(false)
  const [showRepairRequestModal, setShowRepairRequestModal] = useState(false)
  const [showRepairScheduleModal, setShowRepairScheduleModal] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null)

  // All available fields from the repair_history table
  const availableFields = [
    { key: 'service_date', label: 'Service Date', type: 'date' },
    { key: 'vehicles.reg_number', label: 'Vehicle', type: 'text' },
    { key: 'cost', label: 'Cost', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'created_at', label: 'Created At', type: 'datetime' },
    { key: 'updated_at', label: 'Updated At', type: 'datetime' },
    { key: 'created_by', label: 'Created By', type: 'text' },
    { key: 'updated_by', label: 'Updated By', type: 'text' }
  ]

  // Default selected fields (first 7)
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'service_date',
    'vehicles.reg_number',
    'cost',
    'status',
    'created_at',
    'updated_at',
    'created_by'
  ])

  // Fetch repair records from API
  const fetchRepairs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/repairs')
      if (response.ok) {
        const data = await response.json()
        setRepairRecords(data)
      } else {
        console.error('Failed to fetch repairs')
      }
    } catch (error) {
      console.error('Error fetching repairs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRepairs()
  }, [])

  // Calculate KPI values from repair data
  const totalRepairs = repairRecords.length
  const completedRepairs = repairRecords.filter(r => r.status?.toLowerCase() === 'completed').length
  const pendingRepairs = repairRecords.filter(r => r.status?.toLowerCase() === 'pending').length
  const inProgressRepairs = repairRecords.filter(r => r.status?.toLowerCase() === 'in progress').length
  const totalCost = repairRecords.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0)
  const averageCost = totalRepairs > 0 ? totalCost / totalRepairs : 0

  const kpiCards = [
    { title: 'Total Repairs', value: totalRepairs, icon: Wrench, color: 'blue' },
    { title: 'Completed', value: completedRepairs, icon: CheckCircle, color: 'green' },
    { title: 'Pending', value: pendingRepairs, icon: Clock, color: 'yellow' },
    { title: 'In Progress', value: inProgressRepairs, icon: AlertTriangle, color: 'orange' },
    { title: 'Total Cost', value: `₵${totalCost.toLocaleString()}`, icon: Banknote, color: 'purple' },
    { title: 'Average Cost', value: `₵${averageCost.toLocaleString()}`, icon: Banknote, color: 'indigo' }
  ]

  // Format field value for display
  const formatFieldValue = (fieldKey: string, value: any, fieldType?: string) => {
    if (value === null || value === undefined) return '-'
    
    // Handle case where value might be an object or array
    let stringValue = value
    if (typeof value === 'object') {
      stringValue = JSON.stringify(value)
    } else {
      stringValue = String(value)
    }
    
    // Clean up corrupted data - remove tab characters and extra whitespace
    stringValue = stringValue.replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim()
    
    // For other fields, limit length to prevent display issues
    if (stringValue.length > 50) {
      stringValue = stringValue.substring(0, 47) + '...'
    }
    
    switch (fieldType) {
      case 'date':
        return new Date(stringValue).toLocaleDateString()
      case 'datetime':
        return new Date(stringValue).toLocaleString()
      case 'currency':
        return `₵${Number(stringValue).toLocaleString()}`
      case 'status':
        const status = stringValue.toLowerCase()
        if (status === 'completed') return <span className="text-green-600 font-medium">Completed</span>
        if (status === 'pending') return <span className="text-yellow-600 font-medium">Pending</span>
        if (status === 'in progress') return <span className="text-blue-600 font-medium">In Progress</span>
        return <span className="text-gray-600 font-medium">{stringValue}</span>
      default:
        return stringValue
    }
  }

  // Format field value for export (always returns string)
  const formatFieldValueForExport = (fieldKey: string, value: any, fieldType?: string) => {
    if (value === null || value === undefined) return '-'
    
    // Handle case where value might be an object or array
    let stringValue = value
    if (typeof value === 'object') {
      stringValue = JSON.stringify(value)
    } else {
      stringValue = String(value)
    }
    
    // Clean up corrupted data - remove tab characters and extra whitespace
    stringValue = stringValue.replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim()
    
    // For other fields, limit length to prevent display issues
    if (stringValue.length > 50) {
      stringValue = stringValue.substring(0, 47) + '...'
    }
    
    switch (fieldType) {
      case 'date':
        return new Date(stringValue).toLocaleDateString()
      case 'datetime':
        return new Date(stringValue).toLocaleString()
      case 'currency':
        return `₵${Number(stringValue).toLocaleString()}`
      case 'status':
        return stringValue
      default:
        return stringValue
    }
  }

  // Get selected fields data
  const getSelectedFieldsData = () => {
    return availableFields.filter(field => selectedFields.includes(field.key))
  }

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredRepairs = repairRecords.filter(repair => {
    const searchTerm = searchQuery.toLowerCase()
    return (
      repair.vehicles?.reg_number?.toLowerCase().includes(searchTerm) ||
      repair.status?.toLowerCase().includes(searchTerm) ||
      repair.cost?.toString().includes(searchTerm)
    )
  })

  const sortedRepairs = [...filteredRepairs].sort((a, b) => {
    if (!sortColumn) return 0
    
    let aValue = a[sortColumn]
    let bValue = b[sortColumn]
    
    // Handle nested properties
    if (sortColumn.includes('.')) {
      const keys = sortColumn.split('.')
      aValue = keys.reduce((obj, key) => obj?.[key], a)
      bValue = keys.reduce((obj, key) => obj?.[key], b)
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(filteredRepairs.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const currentRepairs = sortedRepairs.slice(startIndex, endIndex)

  // Handle add repair
  const handleAddRepair = async (repairData: any) => {
    try {
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repairData),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success!',
          message: 'Repair record added successfully.'
        })
        
        // Refresh the repair data
        setTimeout(async () => {
          const response = await fetch('/api/repairs')
          if (response.ok) {
            const data = await response.json()
            setRepairRecords(data)
          }
        }, 1000)
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: 'Failed to add repair record.'
        })
      }
    } catch (error) {
      console.error('Error adding repair:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'An error occurred while adding the repair record.'
      })
    }
  }

  const handleViewRepair = (repair: Repair) => {
    console.log('View repair clicked:', repair)
    setSelectedRepair(repair)
    setShowViewRepairModal(true)
  }

  const handleEditRepair = (repair: Repair) => {
    console.log('Edit repair clicked:', repair)
    setSelectedRepair(repair)
    setShowEditRepairModal(true)
  }

  const handleUpdateRepair = async (id: string, repairData: any) => {
    try {
      const response = await fetch(`/api/repairs?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repairData),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Repair Record Updated Successfully!',
          message: `Repair record has been updated in the database.`
        })
        
        // Refresh the repair data
        setTimeout(async () => {
          try {
            const response = await fetch('/api/repairs')
            if (response.ok) {
              const data = await response.json()
              setRepairRecords(data)
            }
          } catch (error) {
            console.error('Error refreshing repair records:', error)
          }
        }, 1000)
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update repair record. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating repair record:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please check your connection and try again.'
      })
    }
  }

  const handleDeleteRepair = async (repair: Repair) => {
    console.log('Delete repair clicked:', repair)
    if (confirm(`Are you sure you want to delete this repair record?`)) {
      try {
        const response = await fetch(`/api/repairs?id=${repair.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Repair Record Deleted Successfully!',
            message: `Repair record has been deleted from the database.`
          })
          
          // Refresh the repair data
          setTimeout(async () => {
            try {
              const response = await fetch('/api/repairs')
              if (response.ok) {
                const data = await response.json()
                setRepairRecords(data)
              }
            } catch (error) {
              console.error('Error refreshing repair records:', error)
            }
          }, 2000) // 2 second delay to let user see the notification
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: 'Failed to delete repair record. Please try again.'
          })
        }
      } catch (error) {
        console.error('Error deleting repair record:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: 'Network error. Please check your connection and try again.'
        })
      }
    }
  }


  // Export functions
  const handleExportExcel = () => {
    const headers = ['Actions', 'No', ...getSelectedFieldsData().map(field => field.label)]
    const data = currentRepairs.map((repair, index) => {
      const row = ['View/Edit/Delete', startIndex + index + 1]
      getSelectedFieldsData().forEach(field => {
        const value = field.key.includes('.') 
          ? field.key.split('.').reduce((obj, key) => obj?.[key], repair)
          : repair[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      return row
    })

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Repairs')
    
    // Auto-size columns
    const colWidths = headers.map((_, colIndex) => {
      const maxLength = Math.max(
        ...data.map(row => String(row[colIndex]).length),
        headers[colIndex].length
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, `repairs-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleExportCSV = () => {
    const headers = ['Actions', 'No', ...getSelectedFieldsData().map(field => field.label)]
    const data = currentRepairs.map((repair, index) => {
      const row = ['View/Edit/Delete', startIndex + index + 1]
      getSelectedFieldsData().forEach(field => {
        const value = field.key.includes('.') 
          ? field.key.split('.').reduce((obj, key) => obj?.[key], repair)
          : repair[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      return row
    })

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `repairs-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation
    const headers = ['Actions', 'No', ...getSelectedFieldsData().map(field => field.label)]
    const data = currentRepairs.map((repair, index) => {
      const row = ['View/Edit/Delete', startIndex + index + 1]
      getSelectedFieldsData().forEach(field => {
        const value = field.key.includes('.') 
          ? field.key.split('.').reduce((obj, key) => obj?.[key], repair)
          : repair[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      return row
    })

    // Add table
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 20,
      headStyles: { fillColor: [59, 130, 246] }, // Blue header
      alternateRowStyles: { fillColor: [249, 250, 251] }, // Light gray alternating rows
      margin: { top: 20 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 15 },
        // Dynamic column widths for other columns
        ...Object.fromEntries(
          getSelectedFieldsData().map((_, index) => [
            index + 2, 
            { cellWidth: index === 0 ? 30 : 25 } // Adjust based on field type
          ])
        )
      }
    })

    doc.save(`repairs-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const headers = ['Actions', 'No', ...getSelectedFieldsData().map(field => field.label)]
    const data = currentRepairs.map((repair, index) => {
      const row = ['View/Edit/Delete', startIndex + index + 1]
      getSelectedFieldsData().forEach(field => {
        const value = field.key.includes('.') 
          ? field.key.split('.').reduce((obj, key) => obj?.[key], repair)
          : repair[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      return row
    })

    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Repairs Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; margin-bottom: 10px; }
            .date { color: #6b7280; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .status-completed { background-color: #dcfce7; color: #166534; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-in-progress { background-color: #dbeafe; color: #1e40af; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Repairs Report</h1>
          <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(tableHTML)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Print Preview Opened!',
      message: 'Print preview has been opened in a new window.'
    })
  }

  // Toggle field selection
  const toggleFieldSelection = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 h-full overflow-y-auto" style={{ 
        width: '100%', 
        maxWidth: '100%', 
        overflowX: 'hidden',
        boxSizing: 'border-box',
        minWidth: '0',
        flexShrink: 1
      }}>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {kpiCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <div key={index} className={`p-4 rounded-lg shadow-sm ${
                themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className={`text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {card.title}
                </h3>
                <p className={`text-2xl font-bold ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {card.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div className={`rounded-lg shadow-sm ${
          themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`} style={{
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          minWidth: '0',
          flexShrink: 1
        }}>
          {/* Header Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Side - Filter Buttons */}
              <div className="flex gap-2">
                  <button 
                    onClick={() => setShowRepairRequestModal(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    REPAIR REQUEST
                  </button>
                  <button 
                    onClick={() => setShowRepairScheduleModal(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    REPAIR SCHEDULE
                  </button>
              </div>

              {/* Right Side - Add Repair Button */}
              <button 
                onClick={() => setShowAddRepairModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">ADD REPAIR</span>
              </button>
            </div>

            {/* Table Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-6">
              {/* Entries Display */}
              <div className="flex items-center gap-2">
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Show
                </span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className={`px-3 py-1 text-sm border rounded-lg ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  entries
                </span>
              </div>

              {/* Middle Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFieldSelector(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">SELECT COLUMNS ({selectedFields.length})</span>
                </button>
                
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="text-sm">EXCEL</span>
                </button>
                
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">CSV</span>
                </button>
                
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">PDF</span>
                </button>
                
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span className="text-sm">PRINT</span>
                </button>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2">
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Search:
                </span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search repairs..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`pl-10 pr-4 py-2 text-sm border rounded-lg ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Field Selector Modal */}
          {showFieldSelector && (
            <div 
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(2px)'
              }}
            >
              <div className={`w-96 max-h-96 rounded-lg shadow-lg ${
                themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className={`p-4 border-b ${
                  themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-medium ${
                      themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Select Columns to Display
                    </h3>
                    <button
                      onClick={() => setShowFieldSelector(false)}
                      className={`p-1 rounded ${
                        themeMode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className={`text-sm mt-1 ${
                    themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Choose columns to display in the table (7 columns by default, more will enable horizontal scroll)
                  </p>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-2">
                    {availableFields.map((field) => (
                      <label
                        key={field.key}
                        className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                          selectedFields.includes(field.key)
                            ? themeMode === 'dark'
                              ? 'bg-gray-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : themeMode === 'dark'
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field.key)}
                          onChange={() => toggleFieldSelection(field.key)}
                          className="mr-3"
                        />
                        <span className="text-sm">{field.label}</span>
                        <span className={`ml-auto text-xs ${
                          themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {field.type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className={`p-4 border-t ${
                  themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${
                      themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {selectedFields.length} columns selected
                    </span>
                    <button
                      onClick={() => setShowFieldSelector(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-500'} text-white`}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                      No
                    </th>
                    {getSelectedFieldsData().map((field) => (
                      <th
                        key={field.key}
                        className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                          themeMode === 'dark' ? 'hover:bg-gray-500' : 'hover:bg-gray-400'
                        }`}
                        onClick={() => handleSort(field.key)}
                        style={{
                          width: field.key === 'service_date' ? '120px' :
                                 field.key === 'vehicles.reg_number' ? '120px' :
                                 field.key === 'cost' ? '100px' :
                                 field.key === 'status' ? '120px' : '150px'
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {field.label}
                          {sortColumn === field.key && (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-4 h-4 text-blue-200" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-blue-200" />
                            )
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentRepairs.map((repair, index) => (
                    <tr key={repair.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewRepair(repair)}
                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditRepair(repair)}
                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRepair(repair)}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {startIndex + index + 1}
                      </td>
                      {getSelectedFieldsData().map((field) => {
                        const value = field.key.includes('.') 
                          ? field.key.split('.').reduce((obj, key) => obj?.[key], repair)
                          : repair[field.key]
                        return (
                          <td
                            key={field.key}
                            className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                            style={{
                              width: field.key === 'service_date' ? '120px' :
                                     field.key === 'vehicles.reg_number' ? '120px' :
                                     field.key === 'cost' ? '100px' :
                                     field.key === 'status' ? '120px' : '150px'
                            }}
                          >
                            {formatFieldValue(field.key, value, field.type)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className={`text-sm ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Showing 1 to {filteredRepairs.length} of {filteredRepairs.length} entries
              {searchQuery && (
                <span className="ml-2 text-blue-600">
                  (filtered from {repairRecords.length} total)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Add Repair Modal */}
        <AddRepairModal
          isOpen={showAddRepairModal}
          onClose={() => setShowAddRepairModal(false)}
          onSubmit={handleAddRepair}
        />

        <ViewRepairModal
          isOpen={showViewRepairModal}
          onClose={() => setShowViewRepairModal(false)}
          repair={selectedRepair}
          onEdit={handleEditRepair}
        />

        <EditRepairModal
          isOpen={showEditRepairModal}
          onClose={() => setShowEditRepairModal(false)}
          repair={selectedRepair}
          onSave={handleUpdateRepair}
        />

        <RepairRequestModal
          isOpen={showRepairRequestModal}
          onClose={() => setShowRepairRequestModal(false)}
        />

        <RepairScheduleModal
          isOpen={showRepairScheduleModal}
          onClose={() => setShowRepairScheduleModal(false)}
        />

        {/* Notification */}
        <Notification
          isOpen={notification.isOpen}
          onClose={() => setNotification({ ...notification, isOpen: false })}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      </div>
    </DashboardLayout>
  )
}