'use client'

import { useState, useEffect } from 'react'
import { 
  PlusIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BoltIcon,
  BanknotesIcon,
  CalendarIcon,
  TruckIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'
import { useTheme } from '@/contexts/ThemeContext'
import AddFuelLogModal from '../../components/AddFuelLogModal'
import ViewFuelLogModal from '../../components/ViewFuelLogModal'
import EditFuelLogModal from '../../components/EditFuelLogModal'
import FuelExpenseLogModal from '../../components/FuelExpenseLogModal'
import FuelRequestModal from '../../components/FuelRequestModal'
import Notification from '../../components/Notification'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface FuelLog {
  id: string
  refuel_date: string
  quantity: number
  unit_cost: number
  total_cost: number
  mileage_before: number
  mileage_after: number
  fuel_type: string
  vendor: string
  receipt_number?: string
  notes?: string
  vehicle_id: string
  driver_id: string
  created_at: string
  updated_at: string
  vehicles: {
    reg_number: string
    trim?: string
    year?: number
    status: string
  }
  driver_operators: {
    name: string
    phone: string
    license_number: string
  }
}

export default function FuelPage() {
  const { themeColor, themeMode } = useTheme()
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<string>('refuel_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'refuel_date', 'vehicles.reg_number', 'driver_operators.name', 'quantity', 'unit_cost', 'total_cost', 'fuel_type'
  ])
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFuelExpenseLogModal, setShowFuelExpenseLogModal] = useState(false)
  const [showFuelRequestModal, setShowFuelRequestModal] = useState(false)
  const [selectedFuelLog, setSelectedFuelLog] = useState<FuelLog | null>(null)
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })

  // KPI data
  const [totalFuelLogs, setTotalFuelLogs] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [averageCost, setAverageCost] = useState(0)
  const [totalQuantity, setTotalQuantity] = useState(0)
  const [averageQuantity, setAverageQuantity] = useState(0)
  
  // Chart data and settings
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [chartData, setChartData] = useState<{
    fuelTypes: { type: string; count: number; totalCost: number }[]
  }>({
    fuelTypes: []
  })
  const [hoveredSegment, setHoveredSegment] = useState<{ type: string; count: number; totalCost: number; percentage: number } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Filtered fuel logs
  const filteredFuelLogs = fuelLogs.filter((log: FuelLog) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      log.vehicles?.reg_number?.toLowerCase().includes(searchLower) ||
      log.driver_operators?.name?.toLowerCase().includes(searchLower) ||
      log.fuel_type?.toLowerCase().includes(searchLower) ||
      log.vendor?.toLowerCase().includes(searchLower) ||
      log.receipt_number?.toLowerCase().includes(searchLower) ||
      log.notes?.toLowerCase().includes(searchLower)
    )
  })

  // Available fields for selection
  const availableFields = [
    { key: 'refuel_date', label: 'Refuel Date', type: 'date' },
    { key: 'vehicles.reg_number', label: 'Vehicle', type: 'text' },
    { key: 'driver_operators.name', label: 'Driver', type: 'text' },
    { key: 'quantity', label: 'Quantity (L)', type: 'number' },
    { key: 'unit_cost', label: 'Unit Cost (Ghc)', type: 'currency' },
    { key: 'total_cost', label: 'Total Cost (Ghc)', type: 'currency' },
    { key: 'mileage_before', label: 'Mileage Before', type: 'number' },
    { key: 'mileage_after', label: 'Mileage After', type: 'number' },
    { key: 'fuel_type', label: 'Fuel Type', type: 'text' },
    { key: 'vendor', label: 'Vendor', type: 'text' },
    { key: 'receipt_number', label: 'Receipt Number', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' }
  ]

  // Helper function to normalize fuel types
  const normalizeFuelType = (fuelType: string): string => {
    if (!fuelType) return 'unknown'
    
    // Convert to lowercase and trim whitespace
    const normalized = fuelType.toString().toLowerCase().trim().replace(/\s+/g, ' ')
    
    // Handle common variations
    const fuelTypeMap: { [key: string]: string } = {
      'diesel': 'diesel',
      'petrol': 'petrol',
      'gasoline': 'petrol',
      'gas': 'gas',
      'lpg': 'gas',
      'cng': 'gas',
      'electric': 'electric',
      'hybrid': 'hybrid'
    }
    
    return fuelTypeMap[normalized] || normalized
  }

  // Process chart data based on time period
  const processChartData = (data: FuelLog[], period: 'weekly' | 'monthly' | 'yearly') => {
    const fuelTypeData: { [key: string]: { count: number; totalCost: number } } = {}
    
    data.forEach((log) => {
      try {
        const date = new Date(log.refuel_date)
        const fuelType = normalizeFuelType(log.fuel_type || 'Unknown')
        
        // Filter by time period
        const now = new Date()
        let shouldInclude = false
        
        switch (period) {
          case 'weekly':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            shouldInclude = date >= weekAgo
            break
          case 'monthly':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            shouldInclude = date >= monthAgo
            break
          case 'yearly':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            shouldInclude = date >= yearAgo
            break
        }
        
        if (shouldInclude) {
        if (!fuelTypeData[fuelType]) {
          fuelTypeData[fuelType] = { count: 0, totalCost: 0 }
        }
        fuelTypeData[fuelType].count += 1
          fuelTypeData[fuelType].totalCost += Number(log.total_cost) || 0
        }
      } catch (error) {
        console.error('Error processing log:', error)
      }
    })
    
    const fuelTypes = Object.entries(fuelTypeData).map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: data.count,
      totalCost: data.totalCost
    })).sort((a, b) => b.count - a.count)
    
    setChartData({ fuelTypes })
  }

  const fetchFuelLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fuel-logs')
      if (response.ok) {
        const data = await response.json()
        setFuelLogs(data)
        
        // Calculate KPIs
        const total = data.length
        const totalCostValue = data.reduce((sum: number, log: FuelLog) => sum + Number(log.total_cost), 0)
        const totalQuantityValue = data.reduce((sum: number, log: FuelLog) => sum + Number(log.quantity), 0)
        
        setTotalFuelLogs(total)
        setTotalCost(totalCostValue)
        setAverageCost(total > 0 ? totalCostValue / total : 0)
        setTotalQuantity(totalQuantityValue)
        setAverageQuantity(total > 0 ? totalQuantityValue / total : 0)
        
        // Process chart data
        processChartData(data, timePeriod)
      }
    } catch (error) {
      console.error('Error fetching fuel logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFuelLogs()
  }, [])

  useEffect(() => {
    if (fuelLogs.length > 0) {
      processChartData(fuelLogs, timePeriod)
    }
  }, [timePeriod])

  // Filter and sort data
  const filteredData = fuelLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase()
    return (
      log.vehicles.reg_number.toLowerCase().includes(searchLower) ||
      log.driver_operators.name.toLowerCase().includes(searchLower) ||
      log.fuel_type.toLowerCase().includes(searchLower) ||
      log.vendor.toLowerCase().includes(searchLower) ||
      (log.receipt_number && log.receipt_number.toLowerCase().includes(searchLower))
    )
  })

  const sortedData = [...filteredFuelLogs].sort((a, b) => {
    let aValue: any
    let bValue: any

    // Handle nested properties
    if (sortField === 'vehicles.reg_number') {
      aValue = a.vehicles?.reg_number || ''
      bValue = b.vehicles?.reg_number || ''
    } else if (sortField === 'driver_operators.name') {
      aValue = a.driver_operators?.name || ''
      bValue = b.driver_operators?.name || ''
    } else {
      aValue = (a as any)[sortField]
      bValue = (b as any)[sortField]
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
  const handleSort = (field: keyof FuelLog) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (fieldKey: string) => {
    if (sortField !== fieldKey) {
      return (
        <div className="flex flex-col">
          <ChevronUpIcon className="w-3 h-3 text-blue-200" />
          <ChevronDownIcon className="w-3 h-3 text-blue-200" />
        </div>
      )
    }
    return sortDirection === 'asc' ? (
      <div className="flex flex-col">
        <ChevronUpIcon className="w-3 h-3 text-white" />
        <ChevronDownIcon className="w-3 h-3 text-blue-200" />
      </div>
    ) : (
      <div className="flex flex-col">
        <ChevronUpIcon className="w-3 h-3 text-blue-200" />
        <ChevronDownIcon className="w-3 h-3 text-white" />
      </div>
    )
  }

  // Handle field selection
  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    )
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

  // Handle actions
  const handleView = (fuelLog: FuelLog) => {
    setSelectedFuelLog(fuelLog)
    setShowViewModal(true)
  }

  const handleEdit = (fuelLog: FuelLog) => {
    setSelectedFuelLog(fuelLog)
    setShowEditModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this fuel log?')) {
      try {
        const response = await fetch(`/api/fuel-logs?id=${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Fuel log deleted successfully!'
          })
          fetchFuelLogs()
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete fuel log'
          })
        }
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Error deleting fuel log'
        })
      }
    }
  }

  // Export functions
  const handleExportExcel = () => {
    const dataToExport = filteredFuelLogs.map((log: FuelLog) => ({
      'Refuel Date': new Date(log.refuel_date).toLocaleString(),
      'Vehicle Reg No.': log.vehicles?.reg_number,
      'Driver Name': log.driver_operators?.name,
      'Fuel Type': log.fuel_type,
      'Quantity (L)': log.quantity,
      'Unit Cost (Ghc)': log.unit_cost,
      'Total Cost (Ghc)': log.total_cost,
      'Mileage Before': log.mileage_before,
      'Mileage After': log.mileage_after,
      'Vendor': log.vendor,
      'Receipt Number': log.receipt_number,
      'Notes': log.notes,
    }))
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'FuelLogs')
    XLSX.writeFile(wb, 'fuel_logs.xlsx')
  }

  const handleExportCSV = () => {
    const dataToExport = filteredFuelLogs.map((log: FuelLog) => ({
      'Refuel Date': new Date(log.refuel_date).toLocaleString(),
      'Vehicle Reg No.': log.vehicles?.reg_number,
      'Driver Name': log.driver_operators?.name,
      'Fuel Type': log.fuel_type,
      'Quantity (L)': log.quantity,
      'Unit Cost (Ghc)': log.unit_cost,
      'Total Cost (Ghc)': log.total_cost,
      'Mileage Before': log.mileage_before,
      'Mileage After': log.mileage_after,
      'Vendor': log.vendor,
      'Receipt Number': log.receipt_number,
      'Notes': log.notes,
    }))
    const header = Object.keys(dataToExport[0]).join(',')
    const rows = dataToExport.map(row => Object.values(row).join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'fuel_logs.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    autoTable(doc as any, {
      head: [['Refuel Date', 'Vehicle Reg No.', 'Driver Name', 'Fuel Type', 'Quantity (L)', 'Unit Cost (Ghc)', 'Total Cost (Ghc)', 'Mileage Before', 'Mileage After', 'Vendor', 'Receipt Number', 'Notes']],
      body: filteredFuelLogs.map((log: FuelLog) => [
        new Date(log.refuel_date).toLocaleString(),
        log.vehicles?.reg_number || '',
        log.driver_operators?.name || '',
        log.fuel_type,
        log.quantity.toString(),
        log.unit_cost.toString(),
        log.total_cost.toString(),
        log.mileage_before.toString(),
        log.mileage_after.toString(),
        log.vendor,
        log.receipt_number || '',
        log.notes || '',
      ]),
      styles: { fillColor: themeMode === 'dark' ? [45, 55, 72] : [255, 255, 255], textColor: themeMode === 'dark' ? 255 : 0 },
      headStyles: { fillColor: themeMode === 'dark' ? [31, 41, 55] : [243, 244, 246], textColor: themeMode === 'dark' ? 255 : 0 },
      alternateRowStyles: { fillColor: themeMode === 'dark' ? [55, 65, 81] : [249, 250, 251] },
    })
    doc.save('fuel_logs.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Fuel Logs</title>
            <style>
              body { font-family: sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Fuel Logs</h1>
            <table>
              <thead>
                <tr>
                  <th>Refuel Date</th>
                  <th>Vehicle Reg No.</th>
                  <th>Driver Name</th>
                  <th>Fuel Type</th>
                  <th>Quantity (L)</th>
                  <th>Unit Cost (Ghc)</th>
                  <th>Total Cost (Ghc)</th>
                  <th>Mileage Before</th>
                  <th>Mileage After</th>
                  <th>Vendor</th>
                  <th>Receipt Number</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${filteredFuelLogs.map((log: FuelLog) => `
                  <tr>
                    <td>${new Date(log.refuel_date).toLocaleDateString()}</td>
                    <td>${log.vehicles?.reg_number}</td>
                    <td>${log.driver_operators?.name}</td>
                    <td>${log.fuel_type}</td>
                    <td>${log.quantity}</td>
                    <td>${log.unit_cost}</td>
                    <td>${log.total_cost}</td>
                    <td>${log.mileage_before}</td>
                    <td>${log.mileage_after}</td>
                    <td>${log.vendor}</td>
                    <td>${log.receipt_number || ''}</td>
                    <td>${log.notes || ''}</td>
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

  // Get field value for display
  const getFieldValue = (log: FuelLog, fieldKey: string) => {
    if (fieldKey === 'vehicles.reg_number') return log.vehicles.reg_number
    if (fieldKey === 'driver_operators.name') return log.driver_operators.name
    return log[fieldKey as keyof FuelLog]
  }

  // Format field value
  const formatFieldValue = (value: any, fieldKey: string) => {
    if (value === null || value === undefined) return '-'
    
    if (fieldKey.includes('cost')) {
      return `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    if (fieldKey === 'quantity') {
      return `${Number(value).toFixed(2)}L`
    }
    if (fieldKey === 'refuel_date') {
      return new Date(value).toLocaleString()
    }
    if (fieldKey.includes('mileage')) {
      return Number(value).toLocaleString()
    }
    return value.toString()
  }

  return (
    <HorizonDashboardLayout>
      <div className={`p-6 ${themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold text-gray-700 dark:text-white">Fuel Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monitor fuel consumption and expenses</p>
          </div>
          <hr className={`flex-1 ml-4 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Side - KPI Cards */}
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 gap-4">
              {/* Total Logs Card */}
              <div className={`p-6 rounded-2xl ${
                themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    themeMode === 'dark' ? 'bg-navy-700' : 'bg-gray-100'
                  }`}>
                    <BoltIcon className="w-6 h-6 text-brand-500" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Total Logs</p>
                    <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-navy-700'}`}>
                    {loading ? '...' : totalFuelLogs}
                  </p>
                  </div>
                </div>
              </div>

              {/* Total Quantity Card */}
              <div className={`p-6 rounded-2xl ${
                themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    themeMode === 'dark' ? 'bg-navy-700' : 'bg-gray-100'
                  }`}>
                    <BoltIcon className="w-6 h-6 text-brand-500" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Total Quantity</p>
                    <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-navy-700'}`}>
                      {loading ? '...' : `${totalQuantity.toFixed(0)}L`}
                    </p>
                  </div>
                  </div>
                </div>
              </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {/* Total Cost Card */}
              <div className={`p-6 rounded-2xl ${
                themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    themeMode === 'dark' ? 'bg-navy-700' : 'bg-gray-100'
                  }`}>
                    <BanknotesIcon className="w-6 h-6 text-brand-500" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Total Cost</p>
                    <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-navy-700'}`}>
                      {loading ? '...' : `Ghc${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Average Cost Card */}
              <div className={`p-6 rounded-2xl ${
                themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    themeMode === 'dark' ? 'bg-navy-700' : 'bg-gray-100'
                  }`}>
                    <BanknotesIcon className="w-6 h-6 text-brand-500" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Avg Cost</p>
                    <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-navy-700'}`}>
                      {loading ? '...' : `Ghc${averageCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Chart */}
          <div className="lg:col-span-2">
            <div className={`p-6 rounded-2xl ${
              themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
            } h-full`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Fuel Analytics
                </h3>
                
                {/* Time Period Selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimePeriod('weekly')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      timePeriod === 'weekly'
                        ? themeColor === 'blue' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-purple-600 text-white'
                        : themeMode === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setTimePeriod('monthly')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      timePeriod === 'monthly'
                        ? themeColor === 'blue' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-purple-600 text-white'
                        : themeMode === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setTimePeriod('yearly')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      timePeriod === 'yearly'
                        ? themeColor === 'blue' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-purple-600 text-white'
                        : themeMode === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              

              {/* Chart Content */}
              <div className="h-64 relative">
                {/* Modern Donut Chart */}
                <div className="h-40 flex items-center justify-center">
                  {chartData.fuelTypes.length > 0 ? (
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 120 120">
                        <defs>
                          {/* Gradient definitions */}
                          <linearGradient id="analyticsPetrolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                          </linearGradient>
                          <linearGradient id="analyticsDieselGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                          <linearGradient id="analyticsGasGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                          <linearGradient id="analyticsOtherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#7c3aed" />
                          </linearGradient>
                        </defs>
                        
                        {(() => {
                          const total = chartData.fuelTypes.reduce((sum, item) => sum + item.count, 0)
                          let currentAngle = 0
                          const innerRadius = 25
                          const outerRadius = 45
                          
                          return chartData.fuelTypes.map((item, index) => {
                            const percentage = (item.count / total) * 100
                            const angle = (percentage / 100) * 360
                            const startAngle = currentAngle
                            const endAngle = currentAngle + angle
                            currentAngle += angle
                            
                            const startAngleRad = (startAngle - 90) * (Math.PI / 180)
                            const endAngleRad = (endAngle - 90) * (Math.PI / 180)
                            
                            // Outer arc coordinates
                            const x1 = 60 + outerRadius * Math.cos(startAngleRad)
                            const y1 = 60 + outerRadius * Math.sin(startAngleRad)
                            const x2 = 60 + outerRadius * Math.cos(endAngleRad)
                            const y2 = 60 + outerRadius * Math.sin(endAngleRad)
                            
                            // Inner arc coordinates
                            const x3 = 60 + innerRadius * Math.cos(endAngleRad)
                            const y3 = 60 + innerRadius * Math.sin(endAngleRad)
                            const x4 = 60 + innerRadius * Math.cos(startAngleRad)
                            const y4 = 60 + innerRadius * Math.sin(startAngleRad)
                            
                            const largeArcFlag = angle > 180 ? 1 : 0
                            
                            const pathData = [
                              `M ${x1} ${y1}`,
                              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              `L ${x3} ${y3}`,
                              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                              `Z`
                            ].join(' ')
                            
                            // Get gradient ID based on fuel type
                            const getGradientId = (fuelType: string) => {
                              switch (fuelType.toLowerCase()) {
                                case 'petrol': return 'url(#analyticsPetrolGradient)'
                                case 'diesel': return 'url(#analyticsDieselGradient)'
                                case 'gas': return 'url(#analyticsGasGradient)'
                                default: return 'url(#analyticsOtherGradient)'
                              }
                            }
                            
                            return (
                              <path
                                key={item.type}
                                d={pathData}
                                fill={getGradientId(item.type)}
                                stroke="white"
                                strokeWidth="1"
                                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect()
                                  const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect()
                                  if (svgRect) {
                                    setTooltipPosition({
                                      x: rect.left - svgRect.left + rect.width / 2,
                                      y: rect.top - svgRect.top - 10
                                    })
                                    setHoveredSegment({
                                      type: item.type,
                                      count: item.count,
                                      totalCost: item.totalCost,
                                      percentage: percentage
                                    })
                                  }
                                }}
                                onMouseLeave={() => {
                                  setHoveredSegment(null)
                                }}
                              />
                            )
                          })
                        })()}
                        
                        {/* Center content */}
                        <circle cx="60" cy="60" r="20" fill="white" />
                        <circle cx="60" cy="60" r="20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                        
                        {/* Fuel icon */}
                        <g transform="translate(50, 50)">
                          <path
                            d="M20 8h-4V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2H0v2h2v10l-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            fill="#3b82f6"
                            transform="scale(0.6)"
                          />
                        </g>
                      </svg>
                      
                      {/* Tooltip */}
                      {hoveredSegment && (
                        <div 
                          className={`absolute z-10 px-3 py-2 rounded-lg shadow-lg text-sm font-medium pointer-events-none ${
                            themeMode === 'dark' 
                              ? 'bg-gray-800 text-white border border-gray-600' 
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                          style={{
                            left: `${tooltipPosition.x}px`,
                            top: `${tooltipPosition.y}px`,
                            transform: 'translateX(-50%)'
                          }}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{hoveredSegment.type}</div>
                            <div className="text-xs mt-1">
                              <div>Count: {hoveredSegment.count}</div>
                              <div>Cost: Ghc{hoveredSegment.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                              <div>Percentage: {hoveredSegment.percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
                
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {chartData.fuelTypes.map((item, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
                    return (
                      <div key={item.type} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          {item.type} ({item.count})
                        </span>
                  </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Side - Filter Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => setShowFuelExpenseLogModal(true)}
                className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                FUEL EXPENSE LOG
              </button>
              <button 
                onClick={() => setShowFuelRequestModal(true)}
                className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                FUEL REQUEST
              </button>
            </div>

            {/* Right Side - Add Fuel Log Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                themeColor === 'blue' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <PlusIcon className="w-4 h-4" />
              ADD FUEL LOG
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search fuel logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Export and Field Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TableCellsIcon className="w-4 h-4" />
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
                <DocumentTextIcon className="w-4 h-4" />
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
                <DocumentIcon className="w-4 h-4" />
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
                <PrinterIcon className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => setShowFieldSelector(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-3xl transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <EyeIcon className="w-4 h-4" />
                SELECT COLUMNS
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className={`w-full ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <thead className={`${themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-500'} text-white`}>
              <tr>
                {selectedFields.map((fieldKey) => {
                  const field = availableFields.find(f => f.key === fieldKey)
                  return (
                    <th
                      key={fieldKey}
                      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                        themeMode === 'dark' ? 'hover:bg-gray-500' : 'hover:bg-gray-400'
                      }`}
                      onClick={() => handleSort(fieldKey as keyof FuelLog)}
                    >
                      <div className="flex items-center gap-1">
                        {field?.label || fieldKey}
                        {getSortIcon(fieldKey)}
                      </div>
                    </th>
                  )
                })}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeMode === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {paginatedData.map((log) => (
                <tr key={log.id} className={`hover:${themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  {selectedFields.map((fieldKey) => (
                    <td key={fieldKey} className={`px-4 py-4 whitespace-nowrap text-sm ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {formatFieldValue(getFieldValue(log, fieldKey), fieldKey)}
                    </td>
                  ))}
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(log)}
                        className={`p-1 rounded transition-colors ${
                          themeMode === 'dark' 
                            ? 'text-blue-400 hover:bg-gray-700' 
                            : 'text-blue-600 hover:bg-gray-100'
                        }`}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(log)}
                        className={`p-1 rounded transition-colors ${
                          themeMode === 'dark' 
                            ? 'text-green-400 hover:bg-gray-700' 
                            : 'text-green-600 hover:bg-gray-100'
                        }`}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className={`p-1 rounded transition-colors ${
                          themeMode === 'dark' 
                            ? 'text-red-400 hover:bg-gray-700' 
                            : 'text-red-600 hover:bg-gray-100'
                        }`}
                      >
                        <TrashIcon className="w-4 h-4" />
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
                  : 'bg-gray-100 border-gray-300 text-gray-900'
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
              <ChevronLeftIcon className="w-4 h-4" />
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
              <ChevronRightIcon className="w-4 h-4" />
            </button>
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
            <div className={`p-6 rounded-2xl max-w-md w-full mx-4 ${
              themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Select Columns
              </h3>
              
              {/* Select All Checkbox */}
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
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableFields.map((field) => (
                  <label key={field.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => handleFieldToggle(field.key)}
                      className="rounded"
                    />
                    <span className={`text-sm ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {field.label}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowFieldSelector(false)}
                  className={`px-4 py-2 rounded text-sm ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowFieldSelector(false)}
                  className={`px-4 py-2 rounded text-sm ${
                    themeColor === 'blue' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <AddFuelLogModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={() => {
            setShowAddModal(false)
            setNotification({
              isOpen: true,
              type: 'success',
              title: 'Success',
              message: 'Fuel log added successfully!'
            })
            fetchFuelLogs()
          }}
        />

        <ViewFuelLogModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          fuelLog={selectedFuelLog}
        />

        <EditFuelLogModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          fuelLog={selectedFuelLog}
          onSuccess={() => {
            setShowEditModal(false)
            setNotification({
              isOpen: true,
              type: 'success',
              title: 'Success',
              message: 'Fuel log updated successfully!'
            })
            fetchFuelLogs()
          }}
        />

        <FuelExpenseLogModal
          isOpen={showFuelExpenseLogModal}
          onClose={() => setShowFuelExpenseLogModal(false)}
        />

        <FuelRequestModal
          isOpen={showFuelRequestModal}
          onClose={() => setShowFuelRequestModal(false)}
        />

        {/* Notification */}
        <Notification
          isOpen={notification.isOpen}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </HorizonDashboardLayout>
  )
}
