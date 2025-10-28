'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentCheckIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  BuildingOfficeIcon, 
  CalendarIcon,
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
import { formatDateTime } from '@/lib/dateUtils'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'
import Notification from '@/components/Notification'
import AddRoadworthyModal from '@/components/AddRoadworthyModal'
import EditRoadworthyModal from '@/components/EditRoadworthyModal'
import ViewRoadworthyModal from '@/components/ViewRoadworthyModal'

export default function RoadworthyPage() {
  const { themeMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [showAddRoadworthyModal, setShowAddRoadworthyModal] = useState(false)
  const [showEditRoadworthyModal, setShowEditRoadworthyModal] = useState(false)
  const [showViewRoadworthyModal, setShowViewRoadworthyModal] = useState(false)
  const [selectedRoadworthy, setSelectedRoadworthy] = useState(null)
  const [roadworthyRecords, setRoadworthyRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const [selectedFields, setSelectedFields] = useState([
    'company', 'vehicle_number', 'vehicle_type', 'roadworth_status', 'date_issued', 'date_expired'
  ])

  // All available fields from the roadworthy table
  const availableFields = [
    { key: 'company', label: 'Company', type: 'text' },
    { key: 'vehicle_number', label: 'Vehicle Number', type: 'text' },
    { key: 'vehicle_type', label: 'Vehicle Type', type: 'text' },
    { key: 'date_issued', label: 'Date Issued', type: 'date' },
    { key: 'date_expired', label: 'Date Expired', type: 'date' },
    { key: 'roadworth_status', label: 'Status', type: 'status' },
    { key: 'updated_by', label: 'Updated By', type: 'text' },
    { key: 'created_at', label: 'Created At', type: 'date' },
    { key: 'updated_at', label: 'Updated At', type: 'date' }
  ]

  // Fetch roadworthy records from API
  const fetchRoadworthyRecords = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/roadworthy', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 ROADWORTHY DATA RECEIVED:', data.length, 'records')
        console.log('Sample record:', data[0])
        setRoadworthyRecords(data)
      } else {
        console.error('Failed to fetch roadworthy records')
      }
    } catch (error) {
      console.error('Error fetching roadworthy records:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoadworthyRecords()
  }, [])

  // Helper function to check if a record is expired
  const isRecordExpired = (record: any) => {
    try {
      const expiryDate = new Date(record.date_expired)
      const today = new Date()
      // Set time to start of day for accurate comparison
      today.setHours(0, 0, 0, 0)
      expiryDate.setHours(0, 0, 0, 0)
      
      const isExpiredByDate = expiryDate < today
      const isNotValidStatus = record.roadworth_status !== 'Valid'
      
      return isExpiredByDate && isNotValidStatus
    } catch (error) {
      console.error('Error parsing date:', error, record.date_expired)
      return false
    }
  }

  // Calculate KPI values from roadworthy data
  const totalRecords = roadworthyRecords.length
  
  console.log('🔍 KPI CALCULATION DEBUG:')
  console.log('Total records:', totalRecords)
  console.log('Today:', new Date().toISOString().split('T')[0])
  
  // Calculate expired records (date_expired < today)
  const expiredRecords = roadworthyRecords.filter(record => {
    const expiryDate = new Date(record.date_expired)
    const today = new Date()
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0)
    expiryDate.setHours(0, 0, 0, 0)
    const isExpired = expiryDate < today
    if (isExpired) {
      console.log('EXPIRED:', record.vehicle_number, expiryDate.toISOString().split('T')[0])
    }
    return isExpired
  }).length
  
  // Calculate expiring soon records (today <= date_expired <= today + 30 days)
  const expiringSoon = roadworthyRecords.filter(record => {
    const expiryDate = new Date(record.date_expired)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0)
    thirtyDaysFromNow.setHours(0, 0, 0, 0)
    expiryDate.setHours(0, 0, 0, 0)
    const isExpiringSoon = expiryDate >= today && expiryDate <= thirtyDaysFromNow
    if (isExpiringSoon) {
      console.log('EXPIRING SOON:', record.vehicle_number, expiryDate.toISOString().split('T')[0])
    }
    return isExpiringSoon
  }).length
  
  // Calculate valid records (date_expired > today + 30 days)
  const validRecords = roadworthyRecords.filter(record => {
    const expiryDate = new Date(record.date_expired)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0)
    thirtyDaysFromNow.setHours(0, 0, 0, 0)
    expiryDate.setHours(0, 0, 0, 0)
    const isValid = expiryDate > thirtyDaysFromNow
    if (isValid) {
      console.log('VALID:', record.vehicle_number, expiryDate.toISOString().split('T')[0])
    }
    return isValid
  }).length
  
  console.log('FINAL COUNTS - Expired:', expiredRecords, 'Expiring Soon:', expiringSoon, 'Valid:', validRecords)
  const kpiCards = [
    { title: 'Total Records', value: totalRecords.toString(), icon: DocumentCheckIcon, color: 'blue', status: null },
    { title: 'Valid', value: validRecords.toString(), icon: CheckCircleIcon, color: 'blue', status: 'valid' },
    { title: 'Expired', value: expiredRecords.toString(), icon: ExclamationTriangleIcon, color: 'blue', status: 'expired' },
    { title: 'Expiring Soon', value: expiringSoon.toString(), icon: ClockIcon, color: 'blue', status: 'expiring_soon' }
  ]

  const handleCardClick = (status: string | null) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const toggleField = (fieldKey: string) => {
    if (selectedFields.includes(fieldKey)) {
      setSelectedFields(selectedFields.filter(f => f !== fieldKey))
    } else {
      setSelectedFields([...selectedFields, fieldKey])
    }
  }

  const getSelectedFieldsData = () => {
    return selectedFields.map(fieldKey => 
      availableFields.find(field => field.key === fieldKey)
    ).filter(Boolean)
  }

  const formatFieldValue = (fieldKey: string, value: any, type: string) => {
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
    
    switch (type) {
      case 'number':
        return Number(stringValue).toLocaleString()
      case 'date':
        try {
          return formatDateTime(stringValue)
        } catch (error) {
          return stringValue
        }
      case 'status':
        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'valid':
              return 'bg-green-100 text-green-800 border-green-200'
            case 'expired':
              return 'bg-red-100 text-red-800 border-red-200'
            case 'invalid':
              return 'bg-red-100 text-red-800 border-red-200'
            case 'pending':
              return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'expiring':
              return 'bg-yellow-100 text-yellow-800 border-yellow-200'
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

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return (
        <div className="flex flex-col">
          <ChevronUpIcon className="w-3 h-3 text-blue-200" />
          <ChevronDownIcon className="w-3 h-3 text-blue-200" />
        </div>
      )
    }
    return sortDirection === 'asc' ? 
      <div className="flex flex-col">
        <ChevronUpIcon className="w-3 h-3 text-white" />
        <ChevronDownIcon className="w-3 h-3 text-blue-200" />
      </div> : 
      <div className="flex flex-col">
        <ChevronUpIcon className="w-3 h-3 text-blue-200" />
        <ChevronDownIcon className="w-3 h-3 text-white" />
      </div>
  }

  // Export functions
  const handleExportExcel = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['Actions', 'No', ...selectedFieldsData.map(field => field.label)]
    
    const data = roadworthyRecords.map((record, index) => {
      const row = ['View/Edit/Delete', (currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = record[field.key]
        row.push(formatFieldValue(field.key, value, field.type))
      })
      return row
    })

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Roadworthy')
    
    // Auto-size columns
    const colWidths = headers.map((_, index) => {
      const maxLength = Math.max(
        headers[index].length,
        ...data.map(row => String(row[index] || '').length)
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    worksheet['!cols'] = colWidths

    XLSX.writeFile(workbook, `roadworthy-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Excel Export Successful!',
      message: 'Roadworthy data has been exported to Excel file.'
    })
  }

  const handleExportCSV = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['Actions', 'No', ...selectedFieldsData.map(field => field.label)]
    
    const data = roadworthyRecords.map((record, index) => {
      const row = ['View/Edit/Delete', (currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = record[field.key]
        row.push(formatFieldValue(field.key, value, field.type))
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
    link.setAttribute('download', `roadworthy-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'CSV Export Successful!',
      message: 'Roadworthy data has been exported to CSV file.'
    })
  }

  const handleExportPDF = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['Actions', 'No', ...selectedFieldsData.map(field => field.label)]
    
    const data = roadworthyRecords.map((record, index) => {
      const row = ['View/Edit/Delete', (currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = record[field.key]
        row.push(formatFieldValue(field.key, value, field.type))
      })
      return row
    })

    const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation
    doc.setFontSize(16)
    doc.text('Roadworthy Report', 14, 22)
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

    doc.save(`roadworthy-${new Date().toISOString().split('T')[0]}.pdf`)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'PDF Export Successful!',
      message: 'Roadworthy data has been exported to PDF file.'
    })
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['Actions', 'No', ...selectedFieldsData.map(field => field.label)]
    
    const data = roadworthyRecords.map((record, index) => {
      const row = ['View/Edit/Delete', (currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = record[field.key]
        row.push(formatFieldValue(field.key, value, field.type))
      })
      return row
    })

    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Roadworthy Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; margin-bottom: 10px; }
            .date { color: #6b7280; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .status-valid { background-color: #dcfce7; color: #166534; }
            .status-expired { background-color: #fecaca; color: #991b1b; }
            .status-pending { background-color: #fed7aa; color: #9a3412; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Roadworthy Report</h1>
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

  const handleAddRoadworthy = async (roadworthyData: any) => {
    try {
      const response = await fetch('/api/roadworthy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roadworthyData),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Roadworthy Added Successfully!',
          message: `Roadworthy certificate for vehicle "${roadworthyData.vehicle_number}" has been added to the database. The table will refresh shortly.`
        })
        
        // Refresh the roadworthy data after a short delay
        setTimeout(() => {
          fetchRoadworthyRecords()
        }, 2000) // 2 second delay to let user see the notification
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add roadworthy. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error adding roadworthy:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please check your connection and try again.'
      })
    }
  }

  const handleViewRoadworthy = (record: any) => {
    setSelectedRoadworthy(record)
    setShowViewRoadworthyModal(true)
  }

  const handleEditRoadworthy = (record: any) => {
    setSelectedRoadworthy(record)
    setShowEditRoadworthyModal(true)
  }

  const handleUpdateRoadworthy = async (roadworthyData: any) => {
    try {
      console.log('Updating roadworthy with data:', roadworthyData)
      console.log('Selected roadworthy:', selectedRoadworthy)
      
      const response = await fetch(`/api/roadworthy?id=${selectedRoadworthy?.id}&vehicle_number=${selectedRoadworthy?.vehicle_number}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roadworthyData),
      })

      console.log('Update response status:', response.status)
      
      if (response.ok) {
        const updatedRecord = await response.json()
        console.log('Updated record:', updatedRecord)
        
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Roadworthy certificate updated successfully!'
        })
        fetchRoadworthyRecords()
      } else {
        const errorData = await response.json()
        console.error('Update failed:', errorData)
        throw new Error(errorData.error || 'Failed to update roadworthy certificate')
      }
    } catch (error) {
      console.error('Error updating roadworthy:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: `Failed to update roadworthy certificate: ${error.message}`
      })
    }
  }

  const handleDeleteRoadworthy = async (record: any) => {
    if (confirm(`Are you sure you want to delete roadworthy certificate for vehicle "${record.vehicle_number}"?`)) {
      try {
        const response = await fetch(`/api/roadworthy?id=${record.id}&vehicle_number=${record.vehicle_number}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Roadworthy Deleted Successfully!',
            message: `Roadworthy certificate for vehicle "${record.vehicle_number}" has been deleted from the database.`
          })
          
          // Refresh the roadworthy data
          setTimeout(() => {
            fetchRoadworthyRecords()
          }, 1000)
        } else {
          const result = await response.json()
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: result.error || 'Failed to delete roadworthy. Please try again.'
          })
        }
      } catch (error) {
        console.error('Error deleting roadworthy:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: 'Network error. Please check your connection and try again.'
        })
      }
    }
  }

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Filter roadworthy records based on search query and status filter
  const filteredRecords = roadworthyRecords.filter(record => {
    // Apply status filter
    if (statusFilter) {
      if (statusFilter === 'valid') {
        // Filter for valid records (date_expired > today + 30 days)
        const expiryDate = new Date(record.date_expired)
        const today = new Date()
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        // Set time to start of day for accurate comparison
        today.setHours(0, 0, 0, 0)
        thirtyDaysFromNow.setHours(0, 0, 0, 0)
        expiryDate.setHours(0, 0, 0, 0)
        if (expiryDate <= thirtyDaysFromNow) return false
      } else if (statusFilter === 'expired') {
        // Filter for expired records (date_expired < today)
        const expiryDate = new Date(record.date_expired)
        const today = new Date()
        // Set time to start of day for accurate comparison
        today.setHours(0, 0, 0, 0)
        expiryDate.setHours(0, 0, 0, 0)
        if (expiryDate >= today) return false
      } else if (statusFilter === 'expiring_soon') {
        // Filter for records expiring soon (today <= date_expired <= today + 30 days)
        const expiryDate = new Date(record.date_expired)
        const today = new Date()
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        // Set time to start of day for accurate comparison
        today.setHours(0, 0, 0, 0)
        thirtyDaysFromNow.setHours(0, 0, 0, 0)
        expiryDate.setHours(0, 0, 0, 0)
        if (expiryDate < today || expiryDate > thirtyDaysFromNow) return false
      }
    }
    
    // Apply search filter
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return Object.values(record).some(value => 
      String(value).toLowerCase().includes(searchLower)
    )
  })

  // Sort filtered records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (!sortColumn) return 0
    
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedRecords = sortedRecords.slice(startIndex, endIndex)

  if (loading) {
    return (
      <HorizonDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading roadworthy records...</div>
        </div>
      </HorizonDashboardLayout>
    )
  }

  return (
    <HorizonDashboardLayout>
      <div className="p-6 h-full overflow-y-auto" style={{ 
        width: '100%', 
        maxWidth: '100%', 
        overflowX: 'hidden',
        boxSizing: 'border-box',
        minWidth: '0',
        flexShrink: 1
      }}>
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold text-gray-700 dark:text-white">Roadworthy Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle roadworthiness certificates</p>
          </div>
          <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {kpiCards.map((card, index) => {
            const IconComponent = card.icon
            const isActive = statusFilter === card.status
            return (
              <div 
                key={index} 
                onClick={() => handleCardClick(card.status)}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 ${
                  themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
                } ${
                  isActive 
                    ? 'ring-2 ring-blue-500 shadow-lg transform scale-105' 
                    : 'hover:shadow-md hover:transform hover:scale-102'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-full transition-colors ${
                    themeMode === 'dark' ? 'bg-navy-700' : 'bg-gray-100'
                  } ${
                    isActive ? 'bg-blue-100' : ''
                  }`}>
                    <IconComponent className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-blue-600' : 
                      card.status === 'expired' ? 'text-red-500' : 'text-brand-500'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-sm font-medium transition-colors ${
                      themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    } ${
                      isActive ? 'text-blue-600' : ''
                    }`}>
                      {card.title}
                    </h3>
                    <p className={`text-2xl font-bold transition-colors ${
                      themeMode === 'dark' ? 'text-white' : 'text-navy-700'
                    } ${
                      isActive ? 'text-blue-600' : ''
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
          overflowX: 'hidden',
          boxSizing: 'border-box',
          minWidth: '0',
          flexShrink: 1
        }}>
          {/* Header Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end">
              {/* Add Roadworthy Button */}
              <button 
                onClick={() => setShowAddRoadworthyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-sm font-medium">ADD ROADWORTHY</span>
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
                  className={`px-3 py-1 border rounded text-sm ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-100 border-gray-300 text-gray-900'
                  }`}
                >
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

              {/* Export/Print Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowFieldSelector(!showFieldSelector)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-3xl text-sm font-medium transition-colors ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  SELECT COLUMNS ({selectedFields.length})
                </button>
                <button 
                  onClick={handleExportExcel}
                  className={`flex items-center gap-2 px-3 py-2 rounded-3xl text-sm font-medium transition-colors ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Export to Excel"
                >
                  <TableCellsIcon className="w-4 h-4" />
                  EXCEL
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
                  <DocumentTextIcon className="w-4 h-4" />
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
                  <DocumentTextIcon className="w-4 h-4" />
                  PDF
                </button>
                <button 
                  onClick={handlePrint}
                  className={`flex items-center gap-2 px-3 py-2 rounded-3xl text-sm font-medium transition-colors ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Print Report"
                >
                  <PrinterIcon className="w-4 h-4" />
                  PRINT
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search roadworthy records..."
                    className={`pl-10 pr-4 py-2 border rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Field Selector Modal */}
          {showFieldSelector && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(2px)'
              }}
              onClick={() => setShowFieldSelector(false)}
            >
              <div
                className={`relative ${themeMode === 'dark' ? 'bg-navy-800 text-white' : 'bg-white text-gray-900'} p-6 rounded-2xl w-full max-w-md`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Select Columns</h3>
                  <button
                    onClick={() => setShowFieldSelector(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableFields.map((field) => (
                    <label key={field.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field.key)}
                        onChange={() => toggleField(field.key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{field.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowFieldSelector(false)}
                    className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowFieldSelector(false)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ tableLayout: 'auto' }}>
              <thead className={`${themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-500'} text-white`}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                    No
                  </th>
                  {getSelectedFieldsData().map((field, index) => (
                    <th
                      key={index}
                      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                        themeMode === 'dark' ? 'hover:bg-gray-500' : 'hover:bg-gray-400'
                      } whitespace-nowrap`}
                      onClick={() => field && handleSort(field.key)}
                    >
                      <div className="flex items-center gap-1">
                        {field?.label}
                        {field && getSortIcon(field.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${
                themeMode === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record, index) => (
                    <tr key={index} className={`hover:${
                      themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewRoadworthy(record)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Roadworthy"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditRoadworthy(record)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit Roadworthy"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoadworthy(record)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Roadworthy"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {startIndex + index + 1}
                    </td>
                    {getSelectedFieldsData().map((field, fieldIndex) => (
                      <td key={fieldIndex} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {field ? formatFieldValue(field.key, record[field.key], field.type) : '-'}
                      </td>
                    ))}
                  </tr>
                ))
                ) : (
                  <tr>
                    <td 
                      colSpan={selectedFields.length + 1} 
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <DocumentCheckIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-sm">
                          {statusFilter === 'expired' 
                            ? 'No expired roadworthy records found'
                            : statusFilter === 'valid'
                            ? 'No valid roadworthy records found'
                            : statusFilter === 'expiring_soon'
                            ? 'No roadworthy records expiring soon'
                            : 'No roadworthy records found'
                          }
                        </span>
                        {statusFilter && (
                          <button
                            onClick={() => setStatusFilter(null)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                          >
                            Clear filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedRecords.length)} of {sortedRecords.length} entries
                {(searchQuery || statusFilter) && (
                  <span className="ml-2 text-blue-600">
                    (filtered from {roadworthyRecords.length} total)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-full">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Roadworthy Modal */}
      <AddRoadworthyModal
        isOpen={showAddRoadworthyModal}
        onClose={() => setShowAddRoadworthyModal(false)}
        onSubmit={handleAddRoadworthy}
      />

      {/* Edit Roadworthy Modal */}
      {showEditRoadworthyModal && selectedRoadworthy && (
        <EditRoadworthyModal
          isOpen={showEditRoadworthyModal}
          onClose={() => setShowEditRoadworthyModal(false)}
          onSubmit={handleUpdateRoadworthy}
          roadworthyRecord={selectedRoadworthy}
        />
      )}

      {/* View Roadworthy Modal */}
      {showViewRoadworthyModal && selectedRoadworthy && (
        <ViewRoadworthyModal
          isOpen={showViewRoadworthyModal}
          onClose={() => setShowViewRoadworthyModal(false)}
          roadworthyRecord={selectedRoadworthy}
        />
      )}

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </HorizonDashboardLayout>
  )
}