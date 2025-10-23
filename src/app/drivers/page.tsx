'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon,
  CheckCircleIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  UserMinusIcon,
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
import Notification from '@/components/Notification'
import AddDriverModal from '@/components/AddDriverModal'
import ViewDriverModal from '@/components/ViewDriverModal'
import EditDriverModal from '@/components/EditDriverModal'

export default function DriversPage() {
  const { themeMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [showAddDriverModal, setShowAddDriverModal] = useState(false)
  const [showViewDriverModal, setShowViewDriverModal] = useState(false)
  const [showEditDriverModal, setShowEditDriverModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const [selectedFields, setSelectedFields] = useState([
    'name', 'phone', 'license_number', 'license_category', 'status', 'region', 'subsidiary_name', 'vehicle_reg_number'
  ])

  // All available fields from the driver_operators table
  const availableFields = [
    { key: 'name', label: 'Driver Name', type: 'text' },
    { key: 'phone', label: 'Phone Number', type: 'text' },
    { key: 'license_number', label: 'License Number', type: 'text' },
    { key: 'license_category', label: 'License Category', type: 'text' },
    { key: 'license_expire', label: 'License Expiry', type: 'date' },
    { key: 'date_issued', label: 'License Issue Date', type: 'date' },
    { key: 'dob', label: 'Date of Birth', type: 'date' },
    { key: 'region', label: 'Region', type: 'text' },
    { key: 'district', label: 'District', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'subsidiary_name', label: 'Subsidiary', type: 'text' },
    { key: 'vehicle_reg_number', label: 'Vehicle Registration', type: 'text' },
    { key: 'created_at', label: 'Created At', type: 'date' },
    { key: 'updated_at', label: 'Updated At', type: 'date' },
    { key: 'created_by', label: 'Created By', type: 'text' },
    { key: 'updated_by', label: 'Updated By', type: 'text' }
  ]

  // Fetch drivers data from API
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/drivers')
        if (response.ok) {
          const data = await response.json()
          setDrivers(data)
        } else {
          console.error('Failed to fetch drivers')
        }
      } catch (error) {
        console.error('Error fetching drivers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  // Calculate KPI values from drivers data
  const totalDrivers = drivers.length
  const activeDrivers = drivers.filter(d => d.status === 'Active').length
  const inactiveDrivers = drivers.filter(d => d.status === 'Inactive').length
  const expiredLicenses = drivers.filter(d => {
    if (!d.license_expire) return false
    const expiryDate = new Date(d.license_expire)
    const today = new Date()
    return expiryDate < today
  }).length
  const regionalDrivers = drivers.filter(d => d.region).length
  const districtDrivers = drivers.filter(d => d.district).length

  const kpiCards = [
    { title: 'Total', value: totalDrivers.toString(), icon: UserGroupIcon, color: 'blue', status: null },
    { title: 'Active', value: activeDrivers.toString(), icon: CheckCircleIcon, color: 'blue', status: 'Active' },
    { title: 'Inactive', value: inactiveDrivers.toString(), icon: UserMinusIcon, color: 'blue', status: 'Inactive' },
    { title: 'Expired Licenses', value: expiredLicenses.toString(), icon: ExclamationTriangleIcon, color: 'blue', status: 'expired' },
    { title: 'Regional', value: regionalDrivers.toString(), icon: UserIcon, color: 'blue', status: 'regional' },
    { title: 'District', value: districtDrivers.toString(), icon: WrenchScrewdriverIcon, color: 'blue', status: 'district' }
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

  const handleSelectAllFields = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields([])
    } else {
      setSelectedFields(availableFields.map(field => field.key))
    }
  }

  const getSelectedFieldsData = () => {
    return selectedFields.map(fieldKey => 
      availableFields.find(field => field.key === fieldKey)
    ).filter(Boolean)
  }

  const formatFieldValue = (fieldKey: string, value: any, type: string) => {
    // Special handling for name field - don't return '-' for empty names
    if (fieldKey === 'name') {
      return value || 'No Name'
    }
    
    // Special handling for vehicle registration - show "No Vehicle Assigned" if empty
    if (fieldKey === 'vehicle_reg_number') {
      return value || 'No Vehicle Assigned'
    }
    
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
          return new Date(stringValue).toLocaleDateString()
        } catch (error) {
          return stringValue
        }
      case 'status':
        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'active':
              return 'bg-green-100 text-green-800 border-green-200'
            case 'inactive':
              return 'bg-red-100 text-red-800 border-red-200'
            case 'suspended':
              return 'bg-orange-100 text-orange-800 border-orange-200'
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
    
    const data = drivers.map((driver, index) => {
      const row = ['View/Edit/Delete', (currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = driver[field.key]
        row.push(formatFieldValue(field.key, value, field.type))
      })
      return row
    })

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Drivers')
    
    // Auto-size columns
    const colWidths = headers.map((_, index) => {
      const maxLength = Math.max(
        headers[index].length,
        ...data.map(row => String(row[index] || '').length)
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    worksheet['!cols'] = colWidths

    XLSX.writeFile(workbook, `drivers-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Excel Export Successful!',
      message: 'Drivers data has been exported to Excel file.'
    })
  }

  const handleExportCSV = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['Actions', 'No', ...selectedFieldsData.map(field => field.label)]
    
    const data = drivers.map((driver, index) => {
      const row = ['View/Edit/Delete', (currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = driver[field.key]
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
    link.setAttribute('download', `drivers-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'CSV Export Successful!',
      message: 'Drivers data has been exported to CSV file.'
    })
  }

  const handleExportPDF = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['Actions', 'No', ...selectedFieldsData.map(field => field.label)]
    
    const data = drivers.map((driver, index) => {
      const row = ['View/Edit/Delete', (currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = driver[field.key]
        row.push(formatFieldValue(field.key, value, field.type))
      })
      return row
    })

    const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation
    doc.setFontSize(16)
    doc.text('Drivers Report', 14, 22)
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

    doc.save(`drivers-${new Date().toISOString().split('T')[0]}.pdf`)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'PDF Export Successful!',
      message: 'Drivers data has been exported to PDF file.'
    })
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['Actions', 'No', ...selectedFieldsData.map(field => field.label)]
    
    const data = drivers.map((driver, index) => {
      const row = ['View/Edit/Delete', (currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = driver[field.key]
        row.push(formatFieldValue(field.key, value, field.type))
      })
      return row
    })

    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Drivers Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; margin-bottom: 10px; }
            .date { color: #6b7280; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .status-active { background-color: #dcfce7; color: #166534; }
            .status-inactive { background-color: #fecaca; color: #991b1b; }
            .status-suspended { background-color: #fed7aa; color: #9a3412; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Drivers Report</h1>
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

  const handleAddDriver = async (driverData: any) => {
    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Driver Added Successfully!',
          message: `Driver "${driverData.name}" has been added to the database. The table will refresh shortly.`
        })
        
        // Refresh the drivers data after a short delay
        setTimeout(async () => {
          try {
            const response = await fetch('/api/drivers')
            if (response.ok) {
              const data = await response.json()
              setDrivers(data)
            }
          } catch (error) {
            console.error('Error refreshing drivers:', error)
          }
        }, 2000) // 2 second delay to let user see the notification
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add driver. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error adding driver:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please check your connection and try again.'
      })
    }
  }

  const handleViewDriver = (driver: any) => {
    setSelectedDriver(driver)
    setShowViewDriverModal(true)
  }

  const handleEditDriver = (driver: any) => {
    setSelectedDriver(driver)
    setShowEditDriverModal(true)
  }

  const handleUpdateDriver = async (driverData: any) => {
    try {
      const response = await fetch(`/api/drivers?id=${driverData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Driver Updated Successfully!',
          message: `Driver "${driverData.name}" has been updated in the database.`
        })
        
        // Refresh the drivers data
        setTimeout(async () => {
          try {
            const response = await fetch('/api/drivers')
            if (response.ok) {
              const data = await response.json()
              setDrivers(data)
            }
          } catch (error) {
            console.error('Error refreshing drivers:', error)
          }
        }, 1000)
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update driver. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating driver:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please check your connection and try again.'
      })
    }
  }

  const handleDeleteDriver = async (driver: any) => {
    if (confirm(`Are you sure you want to delete driver "${driver.name}"?`)) {
      try {
        const response = await fetch(`/api/drivers?id=${driver.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Driver Deleted Successfully!',
            message: `Driver "${driver.name}" has been deleted from the database.`
          })
          
          // Refresh the drivers data
          setTimeout(async () => {
            try {
              const response = await fetch('/api/drivers')
              if (response.ok) {
                const data = await response.json()
                setDrivers(data)
              }
            } catch (error) {
              console.error('Error refreshing drivers:', error)
            }
          }, 1000)
        } else {
          const result = await response.json()
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: result.error || 'Failed to delete driver. Please try again.'
          })
        }
      } catch (error) {
        console.error('Error deleting driver:', error)
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

  // Filter drivers based on search query and status filter
  const filteredDrivers = drivers.filter(driver => {
    // Apply status filter
    if (statusFilter) {
      if (statusFilter === 'expired') {
        // Filter for expired licenses
        if (!driver.license_expire) return false
        const expiryDate = new Date(driver.license_expire)
        const today = new Date()
        if (expiryDate >= today) return false
      } else if (statusFilter === 'regional') {
        // Filter for drivers with region
        if (!driver.region) return false
      } else if (statusFilter === 'district') {
        // Filter for drivers with district
        if (!driver.district) return false
      } else {
        // Filter by exact status match
        if (driver.status !== statusFilter) return false
      }
    }
    
    // Apply search filter
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    // Search specifically by license_number
    return driver.license_number && 
           String(driver.license_number).toLowerCase().includes(searchLower)
  })

  // Sort filtered drivers
  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    if (!sortColumn) return 0
    
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedDrivers.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedDrivers = sortedDrivers.slice(startIndex, endIndex)

  if (loading) {
    return (
      <HorizonDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading drivers...</div>
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
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">Driver Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Driver management and performance tracking</p>
          </div>
          <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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
                      isActive ? 'text-blue-600' : 'text-brand-500'
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Side - Filter Buttons */}
              <div className="flex gap-2">
                <button className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  ALL
                </button>
                <button className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  ACTIVE
                </button>
                <button className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  INACTIVE
                </button>
              </div>

              {/* Right Side - Add Driver Button */}
              <button 
                onClick={() => setShowAddDriverModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-sm font-medium">ADD DRIVER</span>
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
                  className="flex items-center gap-2 px-3 py-2 rounded-3xl text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-300"
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
                    placeholder="Search by license number..."
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
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
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
                {paginatedDrivers.map((driver, index) => (
                  <tr key={index} className={`hover:${
                    themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDriver(driver)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Driver"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDriver(driver)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit Driver"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Driver"
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
                        {field ? formatFieldValue(field.key, driver[field.key], field.type) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedDrivers.length)} of {sortedDrivers.length} entries
                {(searchQuery || statusFilter) && (
                  <span className="ml-2 text-blue-600">
                    (filtered from {drivers.length} total)
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

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={showAddDriverModal}
        onClose={() => setShowAddDriverModal(false)}
        onAdd={handleAddDriver}
      />

      {/* View Driver Modal */}
      {showViewDriverModal && selectedDriver && (
        <ViewDriverModal
          isOpen={showViewDriverModal}
          onClose={() => setShowViewDriverModal(false)}
          driver={selectedDriver}
          onEdit={(driver) => {
            setShowViewDriverModal(false)
            setSelectedDriver(driver)
            setShowEditDriverModal(true)
          }}
        />
      )}

      {/* Edit Driver Modal */}
      {showEditDriverModal && selectedDriver && (
        <EditDriverModal
          isOpen={showEditDriverModal}
          onClose={() => setShowEditDriverModal(false)}
          driver={selectedDriver}
          onSave={handleUpdateDriver}
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