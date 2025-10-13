'use client'

import { useState, useEffect } from 'react'
import { 
  TruckIcon,
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
import AddVehicleModal from '@/components/AddVehicleModal'
import ViewVehicleModal from '@/components/ViewVehicleModal'
import EditVehicleModal from '@/components/EditVehicleModal'
import VehicleMakesModal from '@/components/VehicleMakesModal'
import VehicleTypesModal from '@/components/VehicleTypesModal'
import Notification from '@/components/Notification'

// Define Vehicle type
interface Vehicle {
  id: number
  reg_number: string
  vin_number?: string
  trim?: string
  year?: number
  status: string
  color?: string
  engine_number?: string
  chassis_number?: string
  current_region?: string
  current_district?: string
  current_mileage?: number
  last_service_date?: string
  next_service_km?: number
  type_id?: number
  make_id?: number
  notes?: string
  created_at?: string
  updated_at?: string
  created_by?: number
  updated_by?: number
  spcode?: number
  subsidiary_name?: string
  [key: string]: any // Add index signature for dynamic property access
}

export default function VehiclesPage() {
  const { themeMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [showViewVehicleModal, setShowViewVehicleModal] = useState(false)
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false)
  const [showVehicleMakesModal, setShowVehicleMakesModal] = useState(false)
  const [showVehicleTypesModal, setShowVehicleTypesModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const [selectedFields, setSelectedFields] = useState([
    'reg_number', 'vin_number', 'trim', 'year', 'status', 'color', 'vehicle_type_name', 'vehicle_make_name', 'spcode'
  ])

  // All available fields from the vehicles table
  const availableFields = [
    { key: 'reg_number', label: 'Registration Number', type: 'text' },
    { key: 'vin_number', label: 'VIN Number', type: 'text' },
    { key: 'trim', label: 'Model/Trim', type: 'text' },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'color', label: 'Color', type: 'text' },
    { key: 'engine_number', label: 'Engine Number', type: 'text' },
    { key: 'chassis_number', label: 'Chassis Number', type: 'text' },
    { key: 'current_region', label: 'Current Region', type: 'text' },
    { key: 'current_district', label: 'Current District', type: 'text' },
    { key: 'current_mileage', label: 'Current Mileage (Km)', type: 'number' },
    { key: 'last_service_date', label: 'Last Service Date', type: 'date' },
    { key: 'next_service_km', label: 'Next Service (Km)', type: 'number' },
    { key: 'vehicle_type_name', label: 'Vehicle Type', type: 'text' },
    { key: 'vehicle_make_name', label: 'Make', type: 'text' },
    { key: 'spcode', label: 'Subsidiary', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' },
    { key: 'created_at', label: 'Created At', type: 'date' },
    { key: 'updated_at', label: 'Updated At', type: 'date' }
  ]

  // Fetch vehicles data from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/vehicles')
        if (response.ok) {
          const data = await response.json()
          setVehicles(data)
        } else {
          console.error('Failed to fetch vehicles')
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  // Calculate KPI values from vehicles data
  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter(v => v?.status?.toLowerCase() === 'active').length
  const maintenanceVehicles = vehicles.filter(v => v?.status?.toLowerCase() === 'maintenance').length
  const repairVehicles = vehicles.filter(v => v?.status?.toLowerCase() === 'repair').length
  const inactiveVehicles = vehicles.filter(v => v?.status?.toLowerCase() === 'inactive').length
  const dispatchedVehicles = vehicles.filter(v => v?.status?.toLowerCase() === 'dispatched').length

  const kpiCards = [
    { title: 'Total', value: totalVehicles.toString(), icon: TruckIcon, color: 'blue' },
    { title: 'Active', value: activeVehicles.toString(), icon: CheckCircleIcon, color: 'blue' },
    { title: 'Maintenance', value: maintenanceVehicles.toString(), icon: WrenchScrewdriverIcon, color: 'blue' },
    { title: 'Repair', value: repairVehicles.toString(), icon: ExclamationTriangleIcon, color: 'blue' },
    { title: 'Dispatched', value: dispatchedVehicles.toString(), icon: TruckIcon, color: 'blue' },
    { title: 'Inactive', value: inactiveVehicles.toString(), icon: UserMinusIcon, color: 'blue' }
  ]

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
    ).filter((field): field is NonNullable<typeof field> => field !== undefined)
  }

  const formatFieldValue = (fieldKey: string, value: any, fieldType?: string, vehicle?: Vehicle) => {
    if (!value && value !== 0) return '-'
    
    // Handle case where value might be an object or array
    if (typeof value === 'object' && value !== null) {
      return '-'
    }
    
    // Special handling for spcode field - display subsidiary name instead of ID
    if (fieldKey === 'spcode' && vehicle?.subsidiary_name) {
      return vehicle.subsidiary_name
    }
    
    // Convert to string and clean up
    let stringValue = String(value).trim()
    
    // Clean up corrupted data - remove tab characters and extra whitespace
    stringValue = stringValue.replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim()
    
    // For VIN numbers, extract only the actual VIN part (first part before any spaces)
    if (fieldKey === 'vin_number' && stringValue.includes(' ')) {
      stringValue = stringValue.split(' ')[0]
    }
    
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
            case 'maintenance':
              return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'repair':
              return 'bg-red-100 text-red-800 border-red-200'
            case 'inactive':
              return 'bg-gray-100 text-gray-800 border-gray-200'
            case 'dispatched':
              return 'bg-purple-100 text-purple-800 border-purple-200'
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
  const formatFieldValueForExport = (fieldKey: string, value: any, fieldType?: string, vehicle?: Vehicle) => {
    if (!value && value !== 0) return '-'
    
    // Handle case where value might be an object or array
    if (typeof value === 'object' && value !== null) {
      return '-'
    }
    
    // Special handling for spcode field - export subsidiary name instead of ID
    if (fieldKey === 'spcode' && vehicle?.subsidiary_name) {
      return vehicle.subsidiary_name
    }
    
    // Convert to string and clean up
    let stringValue = String(value).trim()
    
    // Clean up corrupted data - remove tab characters and extra whitespace
    stringValue = stringValue.replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim()
    
    // For VIN numbers, extract only the actual VIN part (first part before any spaces)
    if (fieldKey === 'vin_number' && stringValue.includes(' ')) {
      stringValue = stringValue.split(' ')[0]
    }
    
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
      case 'date':
        try {
          return new Date(stringValue).toLocaleDateString()
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
    return sortDirection === 'asc' ? 
      <div className="flex flex-col">
        <ChevronUpIcon className="w-3 h-3 text-white" />
        <ChevronDownIcon className="w-3 h-3 text-blue-300" />
      </div> : 
      <div className="flex flex-col">
        <ChevronUpIcon className="w-3 h-3 text-blue-300" />
        <ChevronDownIcon className="w-3 h-3 text-white" />
      </div>
  }

  const handleAddVehicle = async (vehicleData: any) => {
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Vehicle Added Successfully!',
          message: `Vehicle "${vehicleData.registrationNumber}" has been added to the database. The table will refresh shortly.`
        })
        
        // Close the modal first
        setShowAddVehicleModal(false)
        
        // Refresh the vehicles data after a short delay
        setTimeout(async () => {
          try {
            const response = await fetch('/api/vehicles')
            if (response.ok) {
              const data = await response.json()
              setVehicles(data)
            }
          } catch (error) {
            console.error('Error refreshing vehicles:', error)
          }
        }, 2000) // 2 second delay to let user see the notification
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add vehicle. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error adding vehicle:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please check your connection and try again.'
      })
    }
  }

  const handleViewVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setShowViewVehicleModal(true)
  }

  const handleEditVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setShowEditVehicleModal(true)
  }

  const handleUpdateVehicle = async (vehicleData: any) => {
    console.log('Update vehicle data:', vehicleData) // Debug log
    try {
      const response = await fetch('/api/vehicles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      })

      const result = await response.json()
      console.log('Update response:', result) // Debug log

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Vehicle Updated Successfully!',
          message: `Vehicle "${vehicleData.registrationNumber}" has been updated in the database. The table will refresh shortly.`
        })
        
        // Close the modal first
        setShowEditVehicleModal(false)
        
        // Refresh the vehicles data after a short delay
        setTimeout(async () => {
          try {
            const response = await fetch('/api/vehicles')
            if (response.ok) {
              const data = await response.json()
              setVehicles(data)
            }
          } catch (error) {
            console.error('Error refreshing vehicles:', error)
          }
        }, 2000) // 2 second delay to let user see the notification
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update vehicle. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating vehicle:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please check your connection and try again.'
      })
    }
  }

  const handleDeleteVehicle = async (vehicle: any) => {
    console.log('Delete vehicle:', vehicle) // Debug log
    if (confirm(`Are you sure you want to delete vehicle ${vehicle.reg_number}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/vehicles?id=${vehicle.id}`, {
          method: 'DELETE',
        })

        const result = await response.json()
        console.log('Delete response:', result) // Debug log

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Vehicle Deleted Successfully!',
            message: `Vehicle "${vehicle.reg_number}" has been permanently removed from the database. The table will refresh shortly.`
          })
          
          // Refresh the vehicles data after a short delay
          setTimeout(async () => {
            try {
              const response = await fetch('/api/vehicles')
              if (response.ok) {
                const data = await response.json()
                setVehicles(data)
              }
            } catch (error) {
              console.error('Error refreshing vehicles:', error)
            }
          }, 2000) // 2 second delay to let user see the notification
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: result.error || 'Failed to delete vehicle. Please try again.'
          })
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error)
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
    
    const data = vehicles.map((vehicle, index) => {
      const row: (string | number)[] = [(currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = vehicle[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type, vehicle))
      })
      row.push('') // Actions column
      return row
    })

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicles')
    
    // Auto-size columns
    const colWidths = headers.map((_, index) => {
      const maxLength = Math.max(
        headers[index].length,
        ...data.map(row => String(row[index] || '').length)
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    worksheet['!cols'] = colWidths

    XLSX.writeFile(workbook, `vehicles-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Excel Export Successful!',
      message: 'Vehicles data has been exported to Excel file.'
    })
  }

  const handleExportCSV = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['No', ...selectedFieldsData.map(field => field.label), 'Actions']
    
    const data = vehicles.map((vehicle, index) => {
      const row: (string | number)[] = [(currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = vehicle[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type, vehicle))
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
    link.setAttribute('download', `vehicles-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'CSV Export Successful!',
      message: 'Vehicles data has been exported to CSV file.'
    })
  }

  const handleExportPDF = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['No', ...selectedFieldsData.map(field => field.label)]
    
    const data = vehicles.map((vehicle, index) => {
      const row: (string | number)[] = [(currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = vehicle[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type, vehicle))
      })
      return row
    })

    const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation
    doc.setFontSize(16)
    doc.text('Vehicles Report', 14, 22)
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

    doc.save(`vehicles-${new Date().toISOString().split('T')[0]}.pdf`)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'PDF Export Successful!',
      message: 'Vehicles data has been exported to PDF file.'
    })
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['No', ...selectedFieldsData.map(field => field.label)]
    
    const data = vehicles.map((vehicle, index) => {
      const row: (string | number)[] = [(currentPage - 1) * entriesPerPage + index + 1]
      selectedFieldsData.forEach(field => {
        const value = vehicle[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type, vehicle))
      })
      return row
    })

    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vehicles Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; margin-bottom: 10px; }
            .date { color: #6b7280; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .status-active { background-color: #dcfce7; color: #166534; }
            .status-maintenance { background-color: #fed7aa; color: #9a3412; }
            .status-repair { background-color: #fecaca; color: #991b1b; }
            .status-inactive { background-color: #f3f4f6; color: #374151; }
            .status-dispatched { background-color: #e9d5ff; color: #7c3aed; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Vehicles Report</h1>
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

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return Object.values(vehicle).some(value => 
      String(value).toLowerCase().includes(searchLower)
    )
  })

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
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">Vehicle Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track your vehicle fleet</p>
          </div>
          <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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
                    <IconComponent className={`w-6 h-6 text-brand-500`} />
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
                  onClick={() => setShowVehicleMakesModal(true)}
                  className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  MAKE
                </button>
                <button className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  MODEL
                </button>
                <button 
                  onClick={() => setShowVehicleTypesModal(true)}
                  className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  TYPE
                </button>
              </div>

              {/* Right Side - Add Vehicle Button */}
              <button 
                onClick={() => setShowAddVehicleModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-sm font-medium">ADD VEHICLE</span>
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
                    placeholder="Search vehicles..."
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
                    Choose columns to display in the table (6 columns by default, more will enable horizontal scroll)
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
                          onChange={() => toggleField(field.key)}
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

          {/* Vehicle Table */}
          <div className="overflow-x-auto" style={{ 
            width: '100%',
            maxWidth: '100%',
            border: '1px solid #e5e7eb',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            <table style={{
              minWidth: selectedFields.length > 8 ? '1600px' : '100%',
              width: selectedFields.length > 8 ? '1600px' : '100%',
              tableLayout: 'fixed',
              boxSizing: 'border-box',
              maxWidth: 'none'
            }}>
              <thead className={`${themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-500'} text-white`}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap" style={{ width: '120px' }}>Actions</th>
                  <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap" style={{ width: '60px' }}>No</th>
                  {getSelectedFieldsData().map((field) => (
                    <th 
                      key={field.key}
                      className={`px-4 py-3 text-left text-sm font-medium cursor-pointer ${
                        themeMode === 'dark' ? 'hover:bg-gray-500' : 'hover:bg-gray-400'
                      } whitespace-nowrap`}
                      onClick={() => handleSort(field.key)}
                      style={{ 
                        width: field.key === 'reg_number' ? '150px' : 
                               field.key === 'vin_number' ? '180px' :
                               field.key === 'status' ? '100px' :
                               field.key === 'current_region' ? '120px' :
                               field.key === 'current_district' ? '120px' :
                               field.key === 'last_service_date' ? '130px' :
                               field.key === 'current_mileage' ? '120px' :
                               field.key === 'year' ? '80px' :
                               field.key === 'color' ? '100px' :
                               field.key === 'trim' ? '120px' :
                               field.key === 'spcode' ? '120px' : '150px',
                        minWidth: field.key === 'reg_number' ? '150px' : 
                                 field.key === 'vin_number' ? '180px' :
                                 field.key === 'status' ? '100px' :
                                 field.key === 'current_region' ? '120px' :
                                 field.key === 'current_district' ? '120px' :
                                 field.key === 'last_service_date' ? '130px' :
                                 field.key === 'current_mileage' ? '120px' :
                                 field.key === 'year' ? '80px' :
                                 field.key === 'color' ? '100px' :
                                 field.key === 'trim' ? '120px' :
                                 field.key === 'spcode' ? '120px' : '150px'
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
              <tbody className={`divide-y ${
                themeMode === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className={`hover:bg-gray-50 ${
                    themeMode === 'dark' ? 'hover:bg-gray-700' : ''
                  }`}>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ width: '120px', minWidth: '120px' }}>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewVehicle(vehicle)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Vehicle Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditVehicle(vehicle)}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          title="Edit Vehicle"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteVehicle(vehicle)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Vehicle"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm whitespace-nowrap ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`} style={{ width: '60px', minWidth: '60px' }}>
                      {vehicle.id}
                    </td>
                    {getSelectedFieldsData().map((field) => (
                      <td key={field.key} className={`px-4 py-3 text-sm whitespace-nowrap ${
                        themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`} style={{ 
                        width: field.key === 'reg_number' ? '150px' : 
                               field.key === 'vin_number' ? '180px' :
                               field.key === 'status' ? '100px' :
                               field.key === 'current_region' ? '120px' :
                               field.key === 'current_district' ? '120px' :
                               field.key === 'last_service_date' ? '130px' :
                               field.key === 'current_mileage' ? '120px' :
                               field.key === 'year' ? '80px' :
                               field.key === 'color' ? '100px' :
                               field.key === 'trim' ? '120px' : '150px',
                        minWidth: field.key === 'reg_number' ? '150px' : 
                                 field.key === 'vin_number' ? '180px' :
                                 field.key === 'status' ? '100px' :
                                 field.key === 'current_region' ? '120px' :
                                 field.key === 'current_district' ? '120px' :
                                 field.key === 'last_service_date' ? '130px' :
                                 field.key === 'current_mileage' ? '120px' :
                                 field.key === 'year' ? '80px' :
                                 field.key === 'color' ? '100px' :
                                 field.key === 'trim' ? '120px' : '150px'
                      }}>
                        {formatFieldValue(field.key, vehicle[field.key as keyof typeof vehicle], field.type, vehicle)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className={`text-sm ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Showing 1 to {filteredVehicles.length} of {filteredVehicles.length} entries
              {searchQuery && (
                <span className="ml-2 text-blue-600">
                  (filtered from {vehicles.length} total)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-2xl text-sm ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Prev
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                1
              </button>
              <button 
                disabled={true}
                className="px-3 py-1 bg-gray-100 text-gray-400 rounded-2xl text-sm cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Add Vehicle Modal */}
        <AddVehicleModal
          isOpen={showAddVehicleModal}
          onClose={() => setShowAddVehicleModal(false)}
          onSubmit={handleAddVehicle}
        />

        {/* View Vehicle Modal */}
        <ViewVehicleModal
          isOpen={showViewVehicleModal}
          onClose={() => setShowViewVehicleModal(false)}
          vehicle={selectedVehicle as any}
          onEdit={(vehicle) => {
            setShowViewVehicleModal(false)
            setSelectedVehicle(vehicle as any)
            setShowEditVehicleModal(true)
          }}
        />

        {/* Edit Vehicle Modal */}
        <EditVehicleModal
          isOpen={showEditVehicleModal}
          onClose={() => setShowEditVehicleModal(false)}
          onSubmit={handleUpdateVehicle}
          vehicle={selectedVehicle}
        />

        {/* Vehicle Makes Modal */}
        <VehicleMakesModal
          isOpen={showVehicleMakesModal}
          onClose={() => setShowVehicleMakesModal(false)}
        />

        {/* Vehicle Types Modal */}
        <VehicleTypesModal
          isOpen={showVehicleTypesModal}
          onClose={() => setShowVehicleTypesModal(false)}
        />

        {/* Notification */}
        <Notification
          isOpen={notification.isOpen}
          onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.type === 'success' ? 10000 : 8000}
        />
      </div>
    </HorizonDashboardLayout>
  )
}
