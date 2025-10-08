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
  CurrencyDollarIcon,
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
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar')
  const [chartData, setChartData] = useState<{
    monthly: { month: string; quantity: number; cost: number }[]
    fuelTypes: { type: string; count: number; totalCost: number }[]
    vehicles: { vehicle: string; quantity: number; cost: number }[]
  }>({
    monthly: [],
    fuelTypes: [],
    vehicles: []
  })

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
    { key: 'unit_cost', label: 'Unit Cost (₵)', type: 'currency' },
    { key: 'total_cost', label: 'Total Cost (₵)', type: 'currency' },
    { key: 'mileage_before', label: 'Mileage Before', type: 'number' },
    { key: 'mileage_after', label: 'Mileage After', type: 'number' },
    { key: 'fuel_type', label: 'Fuel Type', type: 'text' },
    { key: 'vendor', label: 'Vendor', type: 'text' },
    { key: 'receipt_number', label: 'Receipt Number', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' }
  ]

  // Fetch fuel logs data
  // Process chart data
  const processChartData = (data: FuelLog[]) => {
    // Monthly data
    const monthlyData: { [key: string]: { quantity: number; cost: number } } = {}
    const fuelTypeData: { [key: string]: { count: number; totalCost: number } } = {}
    const vehicleData: { [key: string]: { quantity: number; cost: number } } = {}
    
    data.forEach((log, index) => {
      try {
        const date = new Date(log.refuel_date)
        const month = date.toLocaleDateString('en-US', { month: 'short' })
        const fuelType = log.fuel_type || 'Unknown'
        const vehicle = log.vehicles?.reg_number || 'Unknown'
        
        // Validate numeric values
        const quantity = Number(log.quantity) || 0
        const cost = Number(log.total_cost) || 0
        
        // Monthly aggregation
        if (!monthlyData[month]) {
          monthlyData[month] = { quantity: 0, cost: 0 }
        }
        monthlyData[month].quantity += quantity
        monthlyData[month].cost += cost
        
        // Fuel type aggregation
        if (!fuelTypeData[fuelType]) {
          fuelTypeData[fuelType] = { count: 0, totalCost: 0 }
        }
        fuelTypeData[fuelType].count += 1
        fuelTypeData[fuelType].totalCost += cost
        
        // Vehicle aggregation
        if (!vehicleData[vehicle]) {
          vehicleData[vehicle] = { quantity: 0, cost: 0 }
        }
        vehicleData[vehicle].quantity += quantity
        vehicleData[vehicle].cost += cost
      } catch (error) {
        console.error('Error processing log:', error, log)
      }
    })
    
    // Convert to arrays
    const monthly = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      quantity: data.quantity,
      cost: data.cost
    })).sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return months.indexOf(a.month) - months.indexOf(b.month)
    })
    
    const fuelTypes = Object.entries(fuelTypeData).map(([type, data]) => ({
      type,
      count: data.count,
      totalCost: data.totalCost
    }))
    
    const vehicles = Object.entries(vehicleData).map(([vehicle, data]) => ({
      vehicle,
      quantity: data.quantity,
      cost: data.cost
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 6) // Top 6 vehicles
    
    setChartData({ monthly, fuelTypes, vehicles })
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
        processChartData(data)
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

  // Handle field selection
  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    )
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
      'Refuel Date': new Date(log.refuel_date).toLocaleDateString(),
      'Vehicle Reg No.': log.vehicles?.reg_number,
      'Driver Name': log.driver_operators?.name,
      'Fuel Type': log.fuel_type,
      'Quantity (L)': log.quantity,
      'Unit Cost (₵)': log.unit_cost,
      'Total Cost (₵)': log.total_cost,
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
      'Refuel Date': new Date(log.refuel_date).toLocaleDateString(),
      'Vehicle Reg No.': log.vehicles?.reg_number,
      'Driver Name': log.driver_operators?.name,
      'Fuel Type': log.fuel_type,
      'Quantity (L)': log.quantity,
      'Unit Cost (₵)': log.unit_cost,
      'Total Cost (₵)': log.total_cost,
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
      head: [['Refuel Date', 'Vehicle Reg No.', 'Driver Name', 'Fuel Type', 'Quantity (L)', 'Unit Cost (₵)', 'Total Cost (₵)', 'Mileage Before', 'Mileage After', 'Vendor', 'Receipt Number', 'Notes']],
      body: filteredFuelLogs.map((log: FuelLog) => [
        new Date(log.refuel_date).toLocaleDateString(),
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
                  <th>Unit Cost (₵)</th>
                  <th>Total Cost (₵)</th>
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
      return `₵${Number(value).toFixed(2)}`
    }
    if (fieldKey === 'quantity') {
      return `${Number(value).toFixed(2)}L`
    }
    if (fieldKey === 'refuel_date') {
      return new Date(value).toLocaleDateString()
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
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Fuel Management
          </h1>
          <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage fuel logs, expenses, and requests
          </p>
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
                    <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Logs</p>
                    <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-navy-700'}`}>
                      {loading ? '...' : totalFuelLogs}
                    </p>
                  </div>
                </div>
              </div>

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
                    <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Cost</p>
                    <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-navy-700'}`}>
                      {loading ? '...' : `₵${totalCost.toFixed(0)}`}
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
                    <CurrencyDollarIcon className="w-6 h-6 text-brand-500" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Avg Cost</p>
                    <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-navy-700'}`}>
                      {loading ? '...' : `₵${averageCost.toFixed(0)}`}
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
                    <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Quantity</p>
                    <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-navy-700'}`}>
                      {loading ? '...' : `${totalQuantity.toFixed(0)}L`}
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
                
                {/* Chart Type Selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      chartType === 'bar'
                        ? themeColor === 'blue' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-purple-600 text-white'
                        : themeMode === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      chartType === 'line'
                        ? themeColor === 'blue' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-purple-600 text-white'
                        : themeMode === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType('pie')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      chartType === 'pie'
                        ? themeColor === 'blue' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-purple-600 text-white'
                        : themeMode === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pie
                  </button>
                </div>
              </div>
              

              {/* Chart Content */}
              <div className="h-64">
                {chartType === 'bar' && (
                  <div className="space-y-4">
                    {/* Chart Legend */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-600"></div>
                        <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Quantity (L)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-600"></div>
                        <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Cost (₵)</span>
                      </div>
                    </div>

                    {/* Chart Bars */}
                    <div className="space-y-3 h-40 overflow-y-auto">
                      {chartData.monthly.length > 0 ? chartData.monthly.map((item, index) => {
                        const maxQuantity = Math.max(...chartData.monthly.map(d => d.quantity))
                        const maxCost = Math.max(...chartData.monthly.map(d => d.cost))
                        const quantityHeight = maxQuantity > 0 ? (item.quantity / maxQuantity) * 100 : 0
                        const costHeight = maxCost > 0 ? (item.cost / maxCost) * 100 : 0
                        
                        return (
                          <div key={item.month} className="flex items-end gap-2">
                            <div className="w-8 text-xs text-gray-500">{item.month}</div>
                            <div className="flex-1 flex items-end gap-1">
                              <div 
                                className="bg-blue-600 rounded-t"
                                style={{ height: `${Math.max(quantityHeight, 10)}%`, minHeight: '10px' }}
                                title={`Quantity: ${item.quantity.toFixed(1)}L`}
                              ></div>
                              <div 
                                className="bg-green-600 rounded-t"
                                style={{ height: `${Math.max(costHeight, 10)}%`, minHeight: '10px' }}
                                title={`Cost: ₵${item.cost.toFixed(0)}`}
                              ></div>
                            </div>
                          </div>
                        )
                      }) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No data available
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {chartType === 'line' && (
                  <div className="space-y-4">
                    {/* Chart Legend */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-600"></div>
                        <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Quantity (L)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-600"></div>
                        <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Cost (₵)</span>
                      </div>
                    </div>

                    {/* Line Chart */}
                    <div className="h-40 relative">
                      {chartData.monthly.length > 0 ? (
                        <svg className="w-full h-full" viewBox="0 0 400 160">
                          {/* Grid lines */}
                          <defs>
                            <pattern id="grid" width="40" height="32" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 32" fill="none" stroke={themeMode === 'dark' ? '#374151' : '#e5e7eb'} strokeWidth="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                          
                          {/* Quantity line */}
                          <polyline
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            points={chartData.monthly.map((item, index) => {
                              const x = chartData.monthly.length > 1 
                                ? (index / (chartData.monthly.length - 1)) * 360 + 20
                                : 200 // Center for single data point
                              const maxQuantity = Math.max(...chartData.monthly.map(d => d.quantity))
                              const y = 140 - (maxQuantity > 0 ? (item.quantity / maxQuantity) * 120 : 0)
                              return `${x},${y}`
                            }).join(' ')}
                          />
                          
                          {/* Cost line */}
                          <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            points={chartData.monthly.map((item, index) => {
                              const x = chartData.monthly.length > 1 
                                ? (index / (chartData.monthly.length - 1)) * 360 + 20
                                : 200 // Center for single data point
                              const maxCost = Math.max(...chartData.monthly.map(d => d.cost))
                              const y = 140 - (maxCost > 0 ? (item.cost / maxCost) * 120 : 0)
                              return `${x},${y}`
                            }).join(' ')}
                          />
                          
                          {/* Data points */}
                          {chartData.monthly.map((item, index) => {
                            const x = chartData.monthly.length > 1 
                              ? (index / (chartData.monthly.length - 1)) * 360 + 20
                              : 200 // Center for single data point
                            const maxQuantity = Math.max(...chartData.monthly.map(d => d.quantity))
                            const maxCost = Math.max(...chartData.monthly.map(d => d.cost))
                            const yQuantity = 140 - (maxQuantity > 0 ? (item.quantity / maxQuantity) * 120 : 0)
                            const yCost = 140 - (maxCost > 0 ? (item.cost / maxCost) * 120 : 0)
                            
                            return (
                              <g key={item.month}>
                                <circle cx={x} cy={yQuantity} r="3" fill="#3b82f6" />
                                <circle cx={x} cy={yCost} r="3" fill="#10b981" />
                                <text x={x} y="155" textAnchor="middle" className="text-xs fill-gray-500">
                                  {item.month}
                                </text>
                              </g>
                            )
                          })}
                        </svg>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No data available
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {chartType === 'pie' && (
                  <div className="space-y-4">
                    {/* Pie Chart */}
                    <div className="h-40 flex items-center justify-center">
                      {chartData.fuelTypes.length > 0 ? (
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            {(() => {
                              const total = chartData.fuelTypes.reduce((sum, item) => sum + item.count, 0)
                              let currentAngle = 0
                              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
                              
                              return chartData.fuelTypes.map((item, index) => {
                                const percentage = (item.count / total) * 100
                                const angle = (percentage / 100) * 360
                                const startAngle = currentAngle
                                const endAngle = currentAngle + angle
                                currentAngle += angle
                                
                                const startAngleRad = (startAngle - 90) * (Math.PI / 180)
                                const endAngleRad = (endAngle - 90) * (Math.PI / 180)
                                
                                const x1 = 50 + 40 * Math.cos(startAngleRad)
                                const y1 = 50 + 40 * Math.sin(startAngleRad)
                                const x2 = 50 + 40 * Math.cos(endAngleRad)
                                const y2 = 50 + 40 * Math.sin(endAngleRad)
                                
                                const largeArcFlag = angle > 180 ? 1 : 0
                                
                                const pathData = [
                                  `M 50 50`,
                                  `L ${x1} ${y1}`,
                                  `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                  `Z`
                                ].join(' ')
                                
                                return (
                                  <path
                                    key={item.type}
                                    d={pathData}
                                    fill={colors[index % colors.length]}
                                    stroke="white"
                                    strokeWidth="1"
                                  />
                                )
                              })
                            })()}
                          </svg>
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
                )}
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
                        {sortField === fieldKey && (
                          sortDirection === 'asc' ? 
                            <ChevronUpIcon className="w-4 h-4" /> : 
                            <ChevronDownIcon className="w-4 h-4" />
                        )}
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
          onSuccess={() => {
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
