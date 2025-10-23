'use client'

import { useState, useEffect } from 'react'
import { 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  BanknotesIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useTheme } from '@/contexts/ThemeContext'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'
import AddMaintenanceModal from '@/components/AddMaintenanceModal'
import ViewMaintenanceModal from '@/components/ViewMaintenanceModal'
import EditMaintenanceModal from '@/components/EditMaintenanceModal'
import MaintenanceScheduleModal from '@/components/MaintenanceScheduleModal'
import Notification from '@/components/Notification'

// Define Maintenance type
interface Maintenance {
  id: string
  service_date: string
  cost: string
  status: string
  service_details?: string
  service_type: string
  mileage_at_service: string
  parts_replaced?: string
  vehicle_id: string
  mechanic_id: string
  workshop_id: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  vehicles: {
    reg_number: string
    trim?: string
    year?: number
    status: string
  }
  [key: string]: any
}

export default function MaintenancePage() {
  const { themeMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false)
  const [showViewMaintenanceModal, setShowViewMaintenanceModal] = useState(false)
  const [showEditMaintenanceModal, setShowEditMaintenanceModal] = useState(false)
  const [showMaintenanceScheduleModal, setShowMaintenanceScheduleModal] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const [selectedFields, setSelectedFields] = useState([
    'service_date', 'vehicle_name', 'service_type', 'cost', 'status', 'mileage_at_service', 'mechanic_name', 'workshop_name'
  ])

  // All available fields from the maintenance_history table
  const availableFields = [
    { key: 'service_date', label: 'Service Date', type: 'date' },
    { key: 'vehicle_name', label: 'Vehicle', type: 'text' },
    { key: 'service_type', label: 'Service Type', type: 'text' },
    { key: 'cost', label: 'Cost (Ghc)', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'mileage_at_service', label: 'Mileage (Km)', type: 'number' },
    { key: 'service_details', label: 'Service Details', type: 'text' },
    { key: 'parts_replaced', label: 'Parts Replaced', type: 'text' },
    { key: 'mechanic_name', label: 'Mechanic', type: 'text' },
    { key: 'workshop_name', label: 'Workshop', type: 'text' },
    { key: 'created_at', label: 'Created At', type: 'date' },
    { key: 'updated_at', label: 'Updated At', type: 'date' }
  ]

  // Fetch maintenance records from API
  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        setLoading(true)
        console.log('Fetching maintenance records...')
        const response = await fetch('/api/maintenance')
        console.log('Maintenance API response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Maintenance records received:', data.length)
          setMaintenanceRecords(data)
        } else {
          const errorData = await response.json()
          console.error('Failed to fetch maintenance records:', errorData)
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: errorData.error || 'Failed to fetch maintenance records'
          })
        }
      } catch (error) {
        console.error('Error fetching maintenance records:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Network Error',
          message: 'Failed to connect to the server. Please check your connection.'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMaintenanceRecords()
  }, [])

  // Calculate KPI values from maintenance data
  const totalMaintenance = maintenanceRecords.length
  const completedMaintenance = maintenanceRecords.filter(m => m?.status?.toLowerCase() === 'completed').length
  const pendingMaintenance = maintenanceRecords.filter(m => m?.status?.toLowerCase() === 'pending').length
  const inProgressMaintenance = maintenanceRecords.filter(m => m?.status?.toLowerCase() === 'in_progress').length
  const totalCost = maintenanceRecords.reduce((sum, m) => sum + parseFloat(m.cost || '0'), 0)
  const avgCost = totalMaintenance > 0 ? totalCost / totalMaintenance : 0

  const kpiCards = [
    { title: 'Total', value: totalMaintenance.toString(), icon: WrenchScrewdriverIcon, color: 'blue' },
    { title: 'Completed', value: completedMaintenance.toString(), icon: CheckCircleIcon, color: 'blue' },
    { title: 'Pending', value: pendingMaintenance.toString(), icon: ClockIcon, color: 'blue' },
    { title: 'In Progress', value: inProgressMaintenance.toString(), icon: ExclamationTriangleIcon, color: 'blue' },
    { title: 'Total Cost', value: `Ghc${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: BanknotesIcon, color: 'blue' },
    { title: 'Avg Cost', value: `Ghc${avgCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: BanknotesIcon, color: 'blue' }
  ]

  const toggleFieldSelection = (fieldKey: string) => {
    if (selectedFields.includes(fieldKey)) {
      setSelectedFields(selectedFields.filter(field => field !== fieldKey))
    } else {
      setSelectedFields([...selectedFields, fieldKey])
    }
  }

  // Handle select all fields
  const handleSelectAllFields = () => {
    if (selectedFields.length === availableFields.length) {
      // If all are selected, deselect all
      setSelectedFields([])
    } else {
      // If not all are selected, select all
      setSelectedFields(availableFields.map(field => field.key))
    }
  }

  const getSelectedFieldsData = () => {
    return selectedFields.map(fieldKey => 
      availableFields.find(field => field.key === fieldKey)
    ).filter((field): field is NonNullable<typeof field> => field !== undefined)
  }

  const formatFieldValue = (fieldKey: string, value: any, fieldType?: string) => {
    if (!value && value !== 0) return '-'
    
    // Handle case where value might be an object or array
    if (typeof value === 'object' && value !== null) {
      return '-'
    }
    
    // Convert to string and clean up
    let stringValue = String(value).trim()
    
    // Clean up corrupted data - remove tab characters and extra whitespace
    stringValue = stringValue.replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim()
    
    // For other fields, limit length to prevent display issues
    if (stringValue.length > 50) {
      stringValue = stringValue.substring(0, 47) + '...'
    }
    
    switch (fieldType) {
      case 'number':
        if (fieldKey.includes('mileage') || fieldKey.includes('km')) {
          return `${Number(stringValue).toLocaleString()} km`
        }
        return Number(stringValue).toLocaleString()
      case 'currency':
        return `${Number(stringValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      case 'date':
        try {
          return new Date(stringValue).toLocaleString()
        } catch (error) {
          return stringValue
        }
      case 'status':
        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'completed':
              return 'bg-green-100 text-green-800 border-green-200'
            case 'pending':
              return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'in_progress':
              return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'cancelled':
              return 'bg-red-100 text-red-800 border-red-200'
            default:
              return 'bg-gray-100 text-gray-800 border-gray-200'
          }
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(stringValue)}`}>
            {stringValue?.charAt(0).toUpperCase() + stringValue?.slice(1).toLowerCase()}
          </span>
        )
      default:
        return stringValue
    }
  }

  // Format field value for export (always returns string)
  const formatFieldValueForExport = (fieldKey: string, value: any, fieldType?: string) => {
    if (!value && value !== 0) return '-'
    
    // Handle case where value might be an object or array
    if (typeof value === 'object' && value !== null) {
      return '-'
    }
    
    // Convert to string and clean up
    let stringValue = String(value).trim()
    
    // Clean up corrupted data - remove tab characters and extra whitespace
    stringValue = stringValue.replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim()
    
    // For other fields, limit length to prevent display issues
    if (stringValue.length > 50) {
      stringValue = stringValue.substring(0, 47) + '...'
    }
    
    switch (fieldType) {
      case 'number':
        if (fieldKey.includes('mileage') || fieldKey.includes('km')) {
          return `${Number(stringValue).toLocaleString()} km`
        }
        return Number(stringValue).toLocaleString()
      case 'currency':
        return `${Number(stringValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      case 'date':
        try {
          return new Date(stringValue).toLocaleString()
        } catch (error) {
          return stringValue
        }
      case 'status':
        return stringValue?.charAt(0).toUpperCase() + stringValue?.slice(1).toLowerCase()
      default:
        return stringValue
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return (
        <div className="flex flex-col">
          <ChevronUpIcon className="w-3 h-3 text-blue-300" />
          <ChevronDownIcon className="w-3 h-3 text-blue-300" />
        </div>
      )
    }
    
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-3 h-3 text-blue-200" />
    ) : (
      <ChevronDownIcon className="w-3 h-3 text-blue-200" />
    )
  }

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

  const filteredMaintenance = maintenanceRecords.filter(maintenance => {
    const searchTerm = searchQuery.toLowerCase()
    return (
      maintenance.service_type?.toLowerCase().includes(searchTerm) ||
      maintenance.vehicles?.reg_number?.toLowerCase().includes(searchTerm) ||
      maintenance.status?.toLowerCase().includes(searchTerm) ||
      maintenance.service_details?.toLowerCase().includes(searchTerm) ||
      maintenance.parts_replaced?.toLowerCase().includes(searchTerm)
    )
  })

  const sortedMaintenance = [...filteredMaintenance].sort((a, b) => {
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

  const paginatedMaintenance = sortedMaintenance.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  const totalPages = Math.ceil(filteredMaintenance.length / entriesPerPage)

  const handleAddMaintenance = async (maintenanceData: any) => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenanceData),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Maintenance Record Added Successfully!',
          message: `Maintenance record has been added to the database.`
        })
        
        // Refresh the maintenance data
        setTimeout(async () => {
          try {
            const response = await fetch('/api/maintenance')
            if (response.ok) {
              const data = await response.json()
              setMaintenanceRecords(data)
            }
          } catch (error) {
            console.error('Error refreshing maintenance records:', error)
          }
        }, 2000)
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add maintenance record. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error adding maintenance record:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please check your connection and try again.'
      })
    }
  }

  const handleViewMaintenance = (maintenance: Maintenance) => {
    console.log('View maintenance clicked:', maintenance)
    setSelectedMaintenance(maintenance)
    setShowViewMaintenanceModal(true)
  }

  const handlePencilIconMaintenance = (maintenance: Maintenance) => {
    console.log('PencilIcon maintenance clicked:', maintenance)
    setSelectedMaintenance(maintenance)
    setShowEditMaintenanceModal(true)
  }

  const handleUpdateMaintenance = async (maintenanceData: any) => {
    if (!selectedMaintenance?.id) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'No maintenance record selected for update.'
      })
      return
    }

    try {
      const response = await fetch(`/api/maintenance?id=${selectedMaintenance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenanceData),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Maintenance Record Updated Successfully!',
          message: `Maintenance record has been updated in the database.`
        })
        
        // Refresh the maintenance data
        setTimeout(async () => {
          try {
            const response = await fetch('/api/maintenance')
            if (response.ok) {
              const data = await response.json()
              setMaintenanceRecords(data)
            }
          } catch (error) {
            console.error('Error refreshing maintenance records:', error)
          }
        }, 1000)
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update maintenance record. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating maintenance record:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please check your connection and try again.'
      })
    }
  }

  const handleDeleteMaintenance = async (maintenance: Maintenance) => {
    console.log('Delete maintenance clicked:', maintenance)
    if (confirm(`Are you sure you want to delete this maintenance record?`)) {
      try {
        const response = await fetch(`/api/maintenance?id=${maintenance.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Maintenance Record Deleted Successfully!',
            message: `Maintenance record has been deleted from the database.`
          })
          
          // Refresh the maintenance data
          setTimeout(async () => {
            try {
              const response = await fetch('/api/maintenance')
              if (response.ok) {
                const data = await response.json()
                setMaintenanceRecords(data)
              }
            } catch (error) {
              console.error('Error refreshing maintenance records:', error)
            }
          }, 2000) // 2 second delay to let user see the notification
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: 'Failed to delete maintenance record. Please try again.'
          })
        }
      } catch (error) {
        console.error('Error deleting maintenance record:', error)
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
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['No', ...selectedFieldsData.map(field => field.label), 'Actions']
    
    const data = maintenanceRecords.map((maintenance, index) => {
      const row: (string | number)[] = [(currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        let value = maintenance[field.key]
        if (field.key.includes('.')) {
          const keys = field.key.split('.')
          value = keys.reduce((obj, key) => obj?.[key], maintenance)
        }
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      row.push('') // Actions column
      return row
    })

    const worksheet = XMarkIconLSXMarkIcon.utils.aoa_to_sheet([headers, ...data])
    const workbook = XMarkIconLSXMarkIcon.utils.book_new()
    XMarkIconLSXMarkIcon.utils.book_append_sheet(workbook, worksheet, 'Maintenance Records')
    
    // Auto-size columns
    const colWidths = headers.map((_, index) => {
      const maxLength = Math.max(
        headers[index].length,
        ...data.map(row => String(row[index] || '').length)
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    worksheet['!cols'] = colWidths

    XMarkIconLSXMarkIcon.writeFile(workbook, `maintenance-records-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Export Successful!',
      message: 'Maintenance records have been exported to Excel file.'
    })
  }

  const handleExportCSV = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['No', ...selectedFieldsData.map(field => field.label), 'Actions']
    
    const data = maintenanceRecords.map((maintenance, index) => {
      const row: (string | number)[] = [(currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        let value = maintenance[field.key]
        if (field.key.includes('.')) {
          const keys = field.key.split('.')
          value = keys.reduce((obj, key) => obj?.[key], maintenance)
        }
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      row.push('') // Actions column
      return row
    })

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `maintenance-records-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Export Successful!',
      message: 'Maintenance records have been exported to CSV file.'
    })
  }

  const handleExportPDF = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['No', ...selectedFieldsData.map(field => field.label), 'Actions']
    
    const data = maintenanceRecords.map((maintenance, index) => {
      const row: (string | number)[] = [(currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        let value = maintenance[field.key]
        if (field.key.includes('.')) {
          const keys = field.key.split('.')
          value = keys.reduce((obj, key) => obj?.[key], maintenance)
        }
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      return row
    })

    const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation
    doc.setFontSize(16)
    doc.text('Maintenance Records Report', 14, 22)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    // Add table
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }, // Blue header
      alternateRowStyles: { fillColor: [249, 250, 251] }, // Light gray alternating rows
      margin: { top: 40 }
    })

    doc.save(`maintenance-records-${new Date().toISOString().split('T')[0]}.pdf`)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Export Successful!',
      message: 'Maintenance records have been exported to PDF file.'
    })
  }

  const handlePrint = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['No', ...selectedFieldsData.map(field => field.label), 'Actions']
    
    const data = maintenanceRecords.map((maintenance, index) => {
      const row: (string | number)[] = [(currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        let value = maintenance[field.key]
        if (field.key.includes('.')) {
          const keys = field.key.split('.')
          value = keys.reduce((obj, key) => obj?.[key], maintenance)
        }
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      return row
    })

    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Maintenance Records Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; margin-bottom: 10px; }
            .date { color: #6b7280; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .status-completed { background-color: #dcfce7; color: #166534; }
            .status-pending { background-color: #fed7aa; color: #9a3412; }
            .status-in_progress { background-color: #dbeafe; color: #1e40af; }
            .status-cancelled { background-color: #fecaca; color: #991b1b; }
          </style>
        </head>
        <body>
          <h1>Maintenance Records Report</h1>
          <p class="date">Generated on: ${new Date().toLocaleDateString()}</p>
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

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(tableHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (loading) {
    return (
      <HorizonDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </HorizonDashboardLayout>
    )
  }

  return (
    <HorizonDashboardLayout>
      <div className="p-6 h-full overflow-y-auto" style={{ 
        width: '100%', 
        maxWidth: '100%', 
        overflowXMarkIcon: 'hidden',
        boxSizing: 'border-box',
        minWidth: '0',
        flexShrink: 1
      }}>
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">Maintenance Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Schedule and track vehicle maintenance</p>
          </div>
          <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {kpiCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <div key={index} className={`p-6 rounded-2xl ${
                themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    themeMode === 'dark' ? 'bg-navy-700' : 'bg-gray-100'
                  }`}>
                    <IconComponent className="w-6 h-6 text-brand-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-sm font-medium ${
                      themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {card.title}
                    </h3>
                    <p className={`text-2xl font-bold ${
                      themeMode === 'dark' ? 'text-white' : 'text-navy-700'
                    }`}>
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div className={`rounded-2xl ${
          themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
        }`} style={{
          width: '100%',
          maxWidth: '100%',
          overflowXMarkIcon: 'hidden',
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
                  onClick={() => setShowMaintenanceScheduleModal(true)}
                  className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  MAINTENANCE SCHEDULE
                </button>
              </div>

              {/* Right Side - Add Maintenance Button */}
              <button 
                onClick={() => setShowAddMaintenanceModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-sm font-medium">ADD MAINTENANCE</span>
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
                  className={`px-3 py-1 text-sm border rounded-3xl ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-gray-100 border-gray-300 text-gray-700'
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">SELECT COLUMNS ({selectedFields.length})</span>
                </button>
                
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors"
                >
                  <TableCellsIcon className="w-4 h-4" />
                  <span className="text-sm">EXCEL</span>
                </button>
                
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span className="text-sm">CSV</span>
                </button>
                
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span className="text-sm">PDF</span>
                </button>
                
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span className="text-sm">PRINT</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Search:
                </span>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search maintenance records..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`pl-10 pr-4 py-2 text-sm border rounded-3xl ${
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
              <div className={`w-96 max-h-96 rounded-2xl ${
                themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
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
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <p className={`text-sm mt-1 ${
                    themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Choose columns to display in the table (7 columns by default, more will enable horizontal scroll)
                  </p>
                </div>
                
                {/* Select All Checkbox */}
                <div className="px-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFields.length === availableFields.length}
                      onChange={handleSelectAllFields}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className={`text-sm font-medium ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Select All Columns
                    </span>
                  </label>
                  <p className={`text-xs mt-1 ml-7 ${
                    themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {selectedFields.length} of {availableFields.length} columns selected
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
        </div>

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
                               field.key === 'service_type' ? '150px' :
                               field.key === 'cost' ? '100px' :
                               field.key === 'status' ? '120px' :
                               field.key === 'mileage_at_service' ? '120px' :
                               field.key === 'service_details' ? '200px' :
                               field.key === 'parts_replaced' ? '150px' : '150px'
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {field.label}
                        {getSortIcon(field.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {console.log('Rendering maintenance:', paginatedMaintenance.length, 'records')}
                {paginatedMaintenance.map((maintenance, index) => (
                  <tr key={maintenance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewMaintenance(maintenance)}
                          className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="View"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePencilIconMaintenance(maintenance)}
                          className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                          title="PencilIcon"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMaintenance(maintenance)}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {(currentPage - 1) * entriesPerPage + index + 1}
                    </td>
                    {getSelectedFieldsData().map((field) => {
                      let value = maintenance[field.key]
                      if (field.key.includes('.')) {
                        const keys = field.key.split('.')
                        value = keys.reduce((obj, key) => obj?.[key], maintenance)
                      }
                      return (
                        <td
                          key={field.key}
                          className="px-4 py-3 text-sm text-gray-900 dark:text-white"
                          style={{
                            width: field.key === 'service_date' ? '120px' :
                                   field.key === 'vehicles.reg_number' ? '120px' :
                                   field.key === 'service_type' ? '150px' :
                                   field.key === 'cost' ? '100px' :
                                   field.key === 'status' ? '120px' :
                                   field.key === 'mileage_at_service' ? '120px' :
                                   field.key === 'service_details' ? '200px' :
                                   field.key === 'parts_replaced' ? '150px' : '150px'
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
            Showing 1 to {filteredMaintenance.length} of {filteredMaintenance.length} entries
            {searchQuery && (
              <span className="ml-2 text-blue-600">
                (filtered from {maintenanceRecords.length} total)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-full">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>

        {/* Add Maintenance Modal */}
        <AddMaintenanceModal
          isOpen={showAddMaintenanceModal}
          onClose={() => setShowAddMaintenanceModal(false)}
          onSubmit={handleAddMaintenance}
        />

        <ViewMaintenanceModal
          isOpen={showViewMaintenanceModal}
          onClose={() => setShowViewMaintenanceModal(false)}
          maintenanceRecord={selectedMaintenance}
        />

        <EditMaintenanceModal
          isOpen={showEditMaintenanceModal}
          onClose={() => setShowEditMaintenanceModal(false)}
          maintenanceRecord={selectedMaintenance}
          onSubmit={handleUpdateMaintenance}
        />

        <MaintenanceScheduleModal
          isOpen={showMaintenanceScheduleModal}
          onClose={() => setShowMaintenanceScheduleModal(false)}
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
    </HorizonDashboardLayout>
  )
}
