'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  TruckIcon, 
  WrenchScrewdriverIcon,
  BoltIcon,
  ShieldCheckIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  Cog6ToothIcon,
  TableCellsIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useTheme } from '@/contexts/ThemeContext'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'

export default function ReportsPage() {
  const { themeMode } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [companyFilter, setCompanyFilter] = useState<string>('')
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>('')
  const [yearFilter, setYearFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [registrationFilter, setRegistrationFilter] = useState<string>('')
  const [alertStatusFilter, setAlertStatusFilter] = useState<string>('')
  const [companies, setCompanies] = useState<any[]>([])
  const [subsidiaries, setSubsidiaries] = useState<any[]>([])
  const [alertTypes, setAlertTypes] = useState<string[]>([])
  const [alertStatuses, setAlertStatuses] = useState<string[]>([])
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [tempSelectedFields, setTempSelectedFields] = useState<string[]>([])
  
  const reportCategories = [
    { 
      id: 'vehicle-management', 
      name: 'Vehicle Registration', 
      icon: TruckIcon,
      description: 'Vehicle registration and management reports'
    },
    { 
      id: 'roadworthy', 
      name: 'Road-Worthy', 
      icon: ShieldCheckIcon,
      description: 'Roadworthy certificates and status reports'
    },
    { 
      id: 'insurance', 
      name: 'Insurance', 
      icon: ShieldCheckIcon,
      description: 'Insurance policies and renewals reports'
    },
    { 
      id: 'driver', 
      name: 'Driver', 
      icon: TruckIcon,
      description: 'Driver profiles and performance reports'
    },
    { 
      id: 'accident', 
      name: 'Alert', 
      icon: WrenchScrewdriverIcon,
      description: 'Alert records and analysis reports'
    },
    { 
      id: 'pool', 
      name: 'Fuel Request', 
      icon: TruckIcon,
      description: 'Fuel request management and allocation reports'
    }
  ]

  // Fetch companies and subsidiaries
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch vehicles to get unique company names
        const token = localStorage.getItem('token')
        const vehiclesResponse = await fetch('/api/vehicles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (vehiclesResponse.ok) {
          const vehiclesData = await vehiclesResponse.json()
          
          // Extract unique company names from vehicles
          const uniqueCompanies = [...new Set(
            vehiclesData
              .filter((v: any) => v.company_name)
              .map((v: any) => v.company_name)
          )].sort().map((name: string, index: number) => ({
            id: (index + 1).toString(),
            name: name
          }))
          
          setCompanies(uniqueCompanies)
          
          // Also fetch subsidiaries
          const subsidiariesResponse = await fetch('/api/subsidiaries')
          if (subsidiariesResponse.ok) {
            const subsidiariesData = await subsidiariesResponse.json()
            setSubsidiaries(subsidiariesData)
          }
        }
    } catch (error) {
        console.error('Error fetching filters:', error)
      }
    }

    fetchFilters()
  }, [])

  // Fetch alert types and statuses when accident category is selected
  useEffect(() => {
    if (selectedCategory === 'accident') {
      const fetchAlertData = async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch('/api/alerts', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            
            // Extract unique alert types
            const uniqueAlertTypes = [...new Set(
              data
                .filter((alert: any) => alert.alert_type && alert.alert_type.trim() !== '')
                .map((alert: any) => alert.alert_type)
            )].sort()
            
            // Extract unique statuses
            const uniqueStatuses = [...new Set(
              data
                .filter((alert: any) => alert.status && alert.status.trim() !== '')
                .map((alert: any) => alert.status)
            )].sort()
            
            setAlertTypes(uniqueAlertTypes)
            setAlertStatuses(uniqueStatuses)
          }
        } catch (error) {
          console.error('Error fetching alert data:', error)
        }
      }
      
      fetchAlertData()
    }
  }, [selectedCategory])

  // Update selected fields when category changes
  useEffect(() => {
    if (selectedCategory === 'roadworthy') {
      setSelectedFields(['company', 'vehicleNumber', 'vehicleType', 'dateIssued', 'dateExpired', 'status', 'createdBy', 'updatedBy'])
      setTempSelectedFields(['company', 'vehicleNumber', 'vehicleType', 'dateIssued', 'dateExpired', 'status', 'createdBy', 'updatedBy'])
    } else if (selectedCategory === 'insurance') {
      setSelectedFields(['company', 'vehicleNumber', 'vehicleType', 'insuredDate', 'expireDate', 'status', 'updatedBy', 'createdBy'])
      setTempSelectedFields(['company', 'vehicleNumber', 'vehicleType', 'insuredDate', 'expireDate', 'status', 'updatedBy', 'createdBy'])
    } else if (selectedCategory === 'driver') {
      setSelectedFields(['company', 'driverName', 'licenseNumber', 'licenseType', 'licenseExpire', 'status', 'createdBy', 'updatedBy'])
      setTempSelectedFields(['company', 'driverName', 'licenseNumber', 'licenseType', 'licenseExpire', 'status', 'createdBy', 'updatedBy'])
    } else if (selectedCategory === 'accident') {
      setSelectedFields(['unitName', 'companyName', 'unitId', 'address', 'speed', 'odometer', 'alertType', 'alertDescription'])
      setTempSelectedFields(['unitName', 'companyName', 'unitId', 'address', 'speed', 'odometer', 'alertType', 'alertDescription'])
    } else if (selectedCategory === 'pool') {
      setSelectedFields(['justification', 'vehicleRegistrationNumber', 'quantity', 'unitCost', 'totalCost', 'status', 'createdBy', 'updatedBy'])
      setTempSelectedFields(['justification', 'vehicleRegistrationNumber', 'quantity', 'unitCost', 'totalCost', 'status', 'createdBy', 'updatedBy'])
    } else {
      setSelectedFields(['registrationNumber', 'vinNumber', 'modelTrim', 'year', 'status', 'color', 'engineNumber'])
      setTempSelectedFields(['registrationNumber', 'vinNumber', 'modelTrim', 'year', 'status', 'color', 'engineNumber'])
    }
  }, [selectedCategory])

  // Available fields for column selection - dynamically set based on category
  const availableFields = selectedCategory === 'roadworthy' ? [
    { key: 'company', label: 'Company' },
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'vehicleType', label: 'Type' },
    { key: 'dateIssued', label: 'Date Issued' },
    { key: 'dateExpired', label: 'Date Expired' },
    { key: 'status', label: 'Status' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'updatedBy', label: 'Updated By' }
  ] : selectedCategory === 'insurance' ? [
    { key: 'company', label: 'Company/Subsidiary' },
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'vehicleType', label: 'Type' },
    { key: 'insuredDate', label: 'Insured Date' },
    { key: 'expireDate', label: 'Expire Date' },
    { key: 'status', label: 'Status' },
    { key: 'updatedBy', label: 'Updated By' },
    { key: 'createdBy', label: 'Created By' }
  ] : selectedCategory === 'driver' ? [
    { key: 'company', label: 'Company/Subsidiary' },
    { key: 'driverName', label: 'Driver Name' },
    { key: 'licenseNumber', label: 'License Number' },
    { key: 'licenseType', label: 'License Type' },
    { key: 'licenseExpire', label: 'License Expiry' },
    { key: 'status', label: 'Status' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'updatedBy', label: 'Updated By' }
  ] : selectedCategory === 'accident' ? [
    { key: 'unitName', label: 'Unit Name' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'unitId', label: 'Unit ID' },
    { key: 'address', label: 'Address' },
    { key: 'speed', label: 'Speed' },
    { key: 'odometer', label: 'Odometer' },
    { key: 'alertType', label: 'Alert Type' },
    { key: 'alertDescription', label: 'Alert Description' },
    { key: 'gpsTime', label: 'GPS Time' },
    { key: 'latitude', label: 'Latitude' },
    { key: 'longitude', label: 'Longitude' },
    { key: 'engineStatus', label: 'Engine Status' },
    { key: 'status', label: 'Status' }
  ] : selectedCategory === 'pool' ? [
    { key: 'justification', label: 'Justification' },
    { key: 'vehicleRegistrationNumber', label: 'Vehicle Registration Number' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unitCost', label: 'Unit Cost' },
    { key: 'totalCost', label: 'Total Cost' },
    { key: 'status', label: 'Status' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'updatedBy', label: 'Updated By' }
  ] : [
    { key: 'registrationNumber', label: 'Registration Number' },
    { key: 'vinNumber', label: 'VIN Number' },
    { key: 'modelTrim', label: 'Model/Trim' },
    { key: 'year', label: 'Year' },
    { key: 'status', label: 'Status' },
    { key: 'color', label: 'Color' },
    { key: 'engineNumber', label: 'Engine Number' },
    { key: 'chassisNumber', label: 'Chassis Number' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'currentMileage', label: 'Current Mileage' },
    { key: 'currentRegion', label: 'Current Region' },
    { key: 'currentDistrict', label: 'Current District' },
    { key: 'lastServiceDate', label: 'Last Service Date' },
    { key: 'nextServiceKm', label: 'Next Service (Km)' },
    { key: 'notes', label: 'Notes' }
  ]

  const handleFieldToggle = (fieldKey: string) => {
    if (tempSelectedFields.includes(fieldKey)) {
      setTempSelectedFields(tempSelectedFields.filter(f => f !== fieldKey))
    } else {
      setTempSelectedFields([...tempSelectedFields, fieldKey])
    }
  }

  const handleSaveColumns = () => {
    setSelectedFields(tempSelectedFields)
    setShowFieldSelector(false)
  }

  const handleCancelColumns = () => {
    setTempSelectedFields(selectedFields)
    setShowFieldSelector(false)
  }

  const getSelectedFieldsData = () => {
    return availableFields.filter(field => selectedFields.includes(field.key))
  }

  const getFieldLabel = (key: string): string => {
    const field = availableFields.find(f => f.key === key)
    return field ? field.label : key
  }

  const handleExportExcel = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['No', ...selectedFieldsData.map(field => field.label)]
    
    const data = reportData.map((row, index) => {
      const exportRow: (string | number)[] = [index + 1]
      selectedFieldsData.forEach(field => {
        exportRow.push(row[field.key] || '-')
      })
      return exportRow
    })

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')
    
    XLSX.writeFile(workbook, `report-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleExportCSV = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['No', ...selectedFieldsData.map(field => field.label)]
    
    const data = reportData.map((row, index) => {
      const exportRow: (string | number)[] = [index + 1]
      selectedFieldsData.forEach(field => {
        exportRow.push(row[field.key] || '-')
      })
      return exportRow
    })

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = ['No', ...selectedFieldsData.map(field => field.label)]
    
    const data = reportData.map((row, index) => {
      const exportRow: (string | number)[] = [index + 1]
      selectedFieldsData.forEach(field => {
        exportRow.push(row[field.key] || '-')
      })
      return exportRow
    })

    const doc = new jsPDF('l', 'mm', 'a4')
    doc.setFontSize(16)
    doc.text('Vehicle Report', 14, 22)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [107, 114, 128] }
    })

    doc.save(`report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handlePrint = () => {
    window.print()
  }

  const determineRoadworthyStatus = (dateExpired: string): string => {
    if (!dateExpired) return 'Unknown'
    
    const expiryDate = new Date(dateExpired)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    today.setHours(0, 0, 0, 0)
    thirtyDaysFromNow.setHours(0, 0, 0, 0)
    expiryDate.setHours(0, 0, 0, 0)
    
    if (expiryDate < today) return 'Expired'
    if (expiryDate >= today && expiryDate <= thirtyDaysFromNow) return 'Expiring Soon'
    return 'Valid'
  }

  const determineInsuranceStatus = (endDate: string): string => {
    if (!endDate) return 'Unknown'
    
    const expiryDate = new Date(endDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    today.setHours(0, 0, 0, 0)
    thirtyDaysFromNow.setHours(0, 0, 0, 0)
    expiryDate.setHours(0, 0, 0, 0)
    
    if (expiryDate < today) return 'Expired'
    if (expiryDate >= today && expiryDate <= thirtyDaysFromNow) return 'Expiring Soon'
    return 'Valid'
  }

  return (
    <HorizonDashboardLayout>
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <DocumentTextIcon className="w-8 h-8 text-blue-600" />
              <h1 className={`text-3xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Reports
              </h1>
            </div>
            <p className={`text-lg ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Generate and manage comprehensive fleet reports
            </p>
          </div>

          {/* Report KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportCategories.map((category) => {
                const IconComponent = category.icon
                return (
              <div
                    key={category.id}
                  className={`rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${
                  themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } transition-colors duration-200 cursor-pointer ${selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => {
                    setSelectedCategory(category.id)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20`}>
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className={`text-lg font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {category.name}
                    </h3>
                  </div>
                    <span className="text-blue-600 font-medium text-sm">Generate →</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Report Generation UI */}
          {selectedCategory && (
            <div className="mt-8">
              {/* Header with KPI name */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <h2 className={`text-lg font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {reportCategories.find(c => c.id === selectedCategory)?.name} Reports
                  </h2>
                  <hr className={`flex-grow border-1 ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
            </div>
          </div>

              {/* Filtering Options Card */}
              <div className={`rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${
                  themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="mb-4">
                  <h3 className={`text-sm font-medium px-3 py-2 rounded-lg bg-blue-50 text-blue-700 inline-block ${themeMode === 'dark' ? 'bg-blue-900/30 text-blue-300' : ''}`}>
                    Filtering Options
                    </h3>
                  </div>
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${selectedCategory === 'roadworthy' || selectedCategory === 'insurance' || selectedCategory === 'driver' || selectedCategory === 'pool' ? '3' : selectedCategory === 'accident' ? '4' : '4'} gap-4`}>
                  {/* Company Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Company/Subsidiary
                    </label>
                    <select
                      value={companyFilter}
                      onChange={(e) => setCompanyFilter(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        themeMode === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">All Companies</option>
                      {companies.map((company: any) => (
                        <option key={company.id} value={company.name}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                </div>

                  {selectedCategory === 'roadworthy' || selectedCategory === 'insurance' ? (
                    <>
                      {/* Status Filter */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            themeMode === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="">All Status</option>
                          <option value="Valid">Valid</option>
                          <option value="Expired">Expired</option>
                          <option value="Expiring Soon">Expiring Soon</option>
                        </select>
                  </div>

                      {/* Vehicle Number Filter */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Vehicle Number
                        </label>
                        <input
                          type="text"
                          value={registrationFilter}
                          onChange={(e) => setRegistrationFilter(e.target.value)}
                          placeholder="Filter by vehicle number"
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            themeMode === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                  </div>
                    </>
                  ) : selectedCategory === 'driver' ? (
                    <>
                      {/* Driver Name Filter */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Driver Name
                        </label>
                        <input
                          type="text"
                          value={yearFilter}
                          onChange={(e) => setYearFilter(e.target.value)}
                          placeholder="Filter by driver name"
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            themeMode === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                </div>

                      {/* License Number Filter */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          License Number
                        </label>
                        <input
                          type="text"
                          value={registrationFilter}
                          onChange={(e) => setRegistrationFilter(e.target.value)}
                          placeholder="Filter by license number"
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            themeMode === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    </>
                  ) : selectedCategory === 'accident' ? (
                    <>
                      {/* Unit Name Filter */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Unit Name
                        </label>
                        <input
                          type="text"
                          value={yearFilter}
                          onChange={(e) => setYearFilter(e.target.value)}
                          placeholder="Filter by unit name"
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            themeMode === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      {/* Alert Type Filter */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Alert Type
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            themeMode === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="">All Alert Types</option>
                          {alertTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Status
                        </label>
                        <select
                          value={alertStatusFilter}
                          onChange={(e) => setAlertStatusFilter(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            themeMode === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="">All Status</option>
                          {alertStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                      </>
                    ) : selectedCategory === 'pool' ? (
                      <>
                        {/* Vehicle Registration Number Filter */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Vehicle Registration Number
                          </label>
                          <input
                            type="text"
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            placeholder="Filter by registration number"
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              themeMode === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>

                        {/* Status Filter for Fuel Request */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Status
                          </label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              themeMode === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                      {/* Year Filter for Vehicles */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Year
                        </label>
                        <input
                          type="text"
                          value={yearFilter}
                          onChange={(e) => setYearFilter(e.target.value)}
                          placeholder="Filter by year"
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            themeMode === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      {/* Status Filter for Vehicles */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            themeMode === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="">All Status</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Repair">Repair</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>

                      {/* Registration Number Filter for Vehicles */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Registration Number
                        </label>
                        <input
                          type="text"
                          value={registrationFilter}
                          onChange={(e) => setRegistrationFilter(e.target.value)}
                          placeholder="Filter by reg number"
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            themeMode === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      </>
                    )}
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true)
                        
                        const token = localStorage.getItem('token')
                        let response
                        
                        if (selectedCategory === 'roadworthy') {
                          // Fetch roadworthy with filters from API
                          const params = new URLSearchParams()
                          if (companyFilter) params.append('company', companyFilter)
                          if (statusFilter) params.append('status', statusFilter)
                          if (registrationFilter) params.append('vehicle_number', registrationFilter)
                          
                          response = await fetch(`/api/roadworthy${params.toString() ? '?' + params.toString() : ''}`, {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            
                            // Transform roadworthy data to report format
                            const reportData = data.map((roadworthy: any) => ({
                              id: roadworthy.id,
                              vehicleNumber: roadworthy.vehicle_number || '-',
                              company: roadworthy.company || '-',
                              vehicleType: roadworthy.vehicle_type || '-',
                              dateIssued: roadworthy.date_issued || '-',
                              dateExpired: roadworthy.date_expired || '-',
                              status: determineRoadworthyStatus(roadworthy.date_expired),
                              createdBy: roadworthy.created_by?.toString() || '-',
                              updatedBy: roadworthy.updated_by || '-'
                            }))
                            
                            setReportData(reportData)
                            setShowResults(true)
                          }
                        } else if (selectedCategory === 'insurance') {
                          // Fetch insurance with filters from API
                          const params = new URLSearchParams()
                          if (companyFilter) params.append('company', companyFilter)
                          if (statusFilter) params.append('status', statusFilter)
                          if (registrationFilter) params.append('vehicle_number', registrationFilter)
                          
                          response = await fetch(`/api/insurance${params.toString() ? '?' + params.toString() : ''}`, {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            
                            // Transform insurance data to report format
                            const reportData = data.map((insurance: any) => ({
                              id: insurance.id,
                              vehicleNumber: insurance.vehicle_reg || '-',
                              company: insurance.vehicle_company_name || '-',
                              vehicleType: insurance.vehicle_type || '-',
                              insuredDate: insurance.start_date || '-',
                              expireDate: insurance.end_date || '-',
                              status: determineInsuranceStatus(insurance.end_date),
                              createdBy: insurance.created_by?.toString() || '-',
                              updatedBy: insurance.updated_by?.toString() || '-'
                            }))
                            
                            setReportData(reportData)
                            setShowResults(true)
                          }
                        } else if (selectedCategory === 'driver') {
                          // Fetch drivers with filters from API
                          const params = new URLSearchParams()
                          if (companyFilter) params.append('company', companyFilter)
                          if (yearFilter) params.append('name', yearFilter) // Using yearFilter for driver name
                          if (registrationFilter) params.append('license_number', registrationFilter)
                          if (statusFilter) params.append('status', statusFilter)
                          
                          response = await fetch(`/api/drivers${params.toString() ? '?' + params.toString() : ''}`, {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            
                            // Transform driver data to report format
                            const reportData = data.map((driver: any) => ({
                              id: driver.id,
                              driverName: driver.name || '-',
                              licenseNumber: driver.license_number || '-',
                              licenseType: driver.license_category || '-',
                              licenseExpire: driver.license_expire || '-',
                              company: driver.company_name || '-',
                              status: driver.status || '-',
                              createdBy: driver.created_by?.toString() || '-',
                              updatedBy: driver.updated_by?.toString() || '-'
                            }))
                            
                            setReportData(reportData)
                            setShowResults(true)
                          }
                        } else if (selectedCategory === 'accident') {
                          // Fetch alerts with filters from API
                          const params = new URLSearchParams()
                          if (companyFilter) params.append('company', companyFilter)
                          if (yearFilter) params.append('unit_name', yearFilter) // Using yearFilter for unit name
                          if (statusFilter) params.append('alert_type', statusFilter)
                          if (alertStatusFilter) params.append('status', alertStatusFilter)
                          
                          response = await fetch(`/api/alerts${params.toString() ? '?' + params.toString() : ''}`, {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            
                            // Transform alert data to report format
                            const reportData = data.map((alert: any) => ({
                              id: alert.id,
                              unitName: alert.vehicle?.reg_number || alert.unit_name || '-',
                              companyName: alert.vehicle?.company_name || '-',
                              unitId: alert.unit_uid || '-',
                              address: alert.address || '-',
                              speed: alert.speed?.toString() || '-',
                              odometer: alert.odometer?.toString() || '-',
                              alertType: alert.alert_type || '-',
                              alertDescription: alert.alert_description || '-',
                              gpsTime: alert.gps_time_utc || '-',
                              latitude: alert.latitude?.toString() || '-',
                              longitude: alert.longitude?.toString() || '-',
                              engineStatus: alert.engine_status || '-',
                              status: alert.status || '-'
                            }))
                            
                            setReportData(reportData)
                            setShowResults(true)
                          }
                        } else if (selectedCategory === 'pool') {
                          // Fetch fuel requests with filters from API
                          const params = new URLSearchParams()
                          if (yearFilter) params.append('registration_number', yearFilter) // Using yearFilter for registration number
                          if (statusFilter) params.append('status', statusFilter)
                          
                          response = await fetch(`/api/fuel-request${params.toString() ? '?' + params.toString() : ''}`, {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            
                            // Transform fuel request data to report format
                            const reportData = data.map((request: any) => ({
                              id: request.id,
                              justification: request.justification || '-',
                              vehicleRegistrationNumber: request.vehicles?.reg_number || '-',
                              quantity: request.quantity?.toString() || '-',
                              unitCost: request.unit_cost?.toString() || '-',
                              totalCost: request.total_cost?.toString() || '-',
                              status: request.status || '-',
                              createdBy: request.created_by?.toString() || '-',
                              updatedBy: request.updated_by?.toString() || '-'
                            }))
                            
                            setReportData(reportData)
                            setShowResults(true)
                          }
                        } else {
                          // Fetch vehicles with filters from API
                          const params = new URLSearchParams()
                          if (companyFilter) params.append('company', companyFilter)
                          if (subsidiaryFilter) params.append('subsidiary', subsidiaryFilter)
                          if (yearFilter) params.append('year', yearFilter)
                          if (statusFilter) params.append('status', statusFilter)
                          if (registrationFilter) params.append('registration', registrationFilter)
                          
                          response = await fetch(`/api/vehicles?${params.toString()}`, {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            
                            // Transform vehicle data to report format
                            const reportData = data.map((vehicle: any, index: number) => ({
                              id: vehicle.id,
                              registrationNumber: vehicle.reg_number || '-',
                              vinNumber: vehicle.vin_number || '-',
                              modelTrim: vehicle.trim || '-',
                              year: vehicle.year || '-',
                              status: vehicle.status || '-',
                              color: vehicle.color || '-',
                              engineNumber: vehicle.engine_number || '-',
                              chassisNumber: vehicle.chassis_number || '-',
                              companyName: vehicle.company_name || '-',
                              currentMileage: vehicle.current_mileage || '-',
                              currentRegion: vehicle.current_region || '-',
                              currentDistrict: vehicle.current_district || '-',
                              lastServiceDate: vehicle.last_service_date || '-',
                              nextServiceKm: vehicle.next_service_km || '-',
                              notes: vehicle.notes || '-'
                            }))
                            
                            setReportData(reportData)
                            setShowResults(true)
                          }
                        }
                        
                        if (!response.ok) {
                          console.error('Failed to fetch report data')
                          alert('Failed to generate report. Please try again.')
                        }
                      } catch (error) {
                        console.error('Error generating report:', error)
                        alert('Error generating report. Please try again.')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className={`${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-3xl font-medium transition-colors duration-200`}
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(null)
                      setShowResults(false)
                      setReportData([])
                      setCompanyFilter('')
                      setSubsidiaryFilter('')
                      setYearFilter('')
                      setStatusFilter('')
                      setRegistrationFilter('')
                      setAlertStatusFilter('')
                    }}
                    className={`px-6 py-2 rounded-3xl font-medium transition-colors duration-200 ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* No Data Message */}
              {showResults && reportData.length === 0 && (
                <div className="mt-6">
                  <div className={`rounded-xl p-12 border border-gray-200 dark:border-gray-700 ${
                    themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <div className="flex flex-col items-center justify-center text-center">
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className={`text-lg font-semibold mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        No Data Available
                      </h3>
                      <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        No records found matching your filters. Please try adjusting your search criteria.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Table */}
              {showResults && reportData.length > 0 && (
                <div className="mt-6">
                  <div className={`border border-gray-200 dark:border-gray-700 ${
                    themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    {/* Table Controls */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left Side - Entries Display */}
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

                        {/* Middle - Export/Print Buttons */}
                        <div className="flex gap-2">
                  <button
                            onClick={() => {
                              setTempSelectedFields(selectedFields)
                              setShowFieldSelector(!showFieldSelector)
                            }}
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
                            title="Print"
                  >
                    <PrinterIcon className="w-4 h-4" />
                            PRINT
                  </button>
                </div>

                        {/* Right Side - Search */}
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${
                            themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Search:
                          </span>
                          <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search by registration number..."
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

                    {/* Table */}
                    <div className="overflow-x-auto" style={{ 
                      width: '100%',
                      maxWidth: '100%',
                      border: '1px solid #e5e7eb',
                      boxSizing: 'border-box',
                      position: 'relative'
                    }}>
                      <table style={{
                        minWidth: '1600px',
                        width: '100%',
                        tableLayout: 'fixed',
                        boxSizing: 'border-box',
                        maxWidth: 'none'
                      }}>
                        {/* Table Header */}
                        <thead className={`${themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-500'} text-white`}>
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap" style={{ width: '60px' }}>No</th>
                            {getSelectedFieldsData().map((field) => (
                              <th 
                                key={field.key} 
                                className={`px-4 py-3 text-left text-sm font-medium ${
                                  field.key === 'address' ? '' : 'whitespace-nowrap'
                                }`}
                                style={field.key === 'address' ? { maxWidth: '300px' } : {}}
                              >
                                {field.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody className={`divide-y ${themeMode === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {reportData
                            .filter(row => {
                              if (!searchQuery) return true
                              const query = searchQuery.toLowerCase()
                              // Search in different fields based on report type
                              if (selectedCategory === 'driver') {
                                return (
                                  (row.driverName && row.driverName.toLowerCase().includes(query)) ||
                                  (row.licenseNumber && row.licenseNumber.toLowerCase().includes(query)) ||
                                  (row.licenseType && row.licenseType.toLowerCase().includes(query))
                                )
                              } else if (selectedCategory === 'accident') {
                                return (
                                  (row.unitName && row.unitName.toLowerCase().includes(query)) ||
                                  (row.alertType && row.alertType.toLowerCase().includes(query)) ||
                                  (row.alertDescription && row.alertDescription.toLowerCase().includes(query)) ||
                                  (row.address && row.address.toLowerCase().includes(query))
                                )
                              } else if (selectedCategory === 'roadworthy' || selectedCategory === 'insurance') {
                                return (
                                  (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                                )
                              } else {
                                return (
                                  (row.registrationNumber && row.registrationNumber.toLowerCase().includes(query)) ||
                                  (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                                )
                              }
                            })
                            .slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
                            .map((row, index) => (
                            <tr key={row.id} className={`hover:bg-gray-50 ${
                              themeMode === 'dark' ? 'hover:bg-gray-700' : ''
                            }`}>
                              <td className={`px-4 py-3 text-sm whitespace-nowrap ${
                                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                              }`} style={{ width: '60px', minWidth: '60px' }}>
                                {(currentPage - 1) * entriesPerPage + index + 1}
                              </td>
                              {getSelectedFieldsData().map((field) => {
                                const value = row[field.key]
                                if (field.key === 'status') {
                                  // Special handling for status with different badge colors
                                  let badgeColor = 'bg-gray-100 text-gray-800'
                                  if (value === 'Valid' || value === 'Active') {
                                    badgeColor = 'bg-green-100 text-green-800'
                                  } else if (value === 'Expired' || value === 'Inactive') {
                                    badgeColor = 'bg-red-100 text-red-800'
                                  } else if (value === 'Expiring Soon' || value === 'Expiring Soon') {
                                    badgeColor = 'bg-yellow-100 text-yellow-800'
                                  }
                                  
                                  return (
                                    <td key={field.key} className="px-4 py-3 whitespace-nowrap">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}>
                                        {value}
                                      </span>
                                    </td>
                                  )
                                }
                                
                                // Format date fields
                                if (field.key === 'dateIssued' || field.key === 'dateExpired' || field.key === 'insuredDate' || field.key === 'expireDate' || field.key === 'licenseExpire' || field.key === 'gpsTime') {
                                  return (
                                    <td key={field.key} className={`px-4 py-3 text-sm whitespace-nowrap ${
                                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                                    }`}>
                                      {value && value !== '-' ? new Date(value).toLocaleDateString() : '-'}
                                    </td>
                                  )
                                }
                                
                                // Special handling for address column to prevent overflow
                                if (field.key === 'address') {
                                  return (
                                    <td key={field.key} className={`px-4 py-3 text-sm break-words ${
                                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                                    }`} style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                                      {value || '-'}
                                    </td>
                                  )
                                }
                                
                                return (
                                  <td key={field.key} className={`px-4 py-3 text-sm whitespace-nowrap ${
                                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-900'
                                  }`}>
                                    {value || '-'}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
          </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className={`text-sm ${
                        themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, reportData.filter(row => {
                          if (!searchQuery) return true
                          const query = searchQuery.toLowerCase()
                          if (selectedCategory === 'driver') {
                            return (
                              (row.driverName && row.driverName.toLowerCase().includes(query)) ||
                              (row.licenseNumber && row.licenseNumber.toLowerCase().includes(query)) ||
                              (row.licenseType && row.licenseType.toLowerCase().includes(query))
                            )
                          } else if (selectedCategory === 'roadworthy' || selectedCategory === 'insurance') {
                            return (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                          } else {
                            return (
                              (row.registrationNumber && row.registrationNumber.toLowerCase().includes(query)) ||
                              (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                            )
                          }
                        }).length)} of {reportData.filter(row => {
                          if (!searchQuery) return true
                          const query = searchQuery.toLowerCase()
                          if (selectedCategory === 'driver') {
                            return (
                              (row.driverName && row.driverName.toLowerCase().includes(query)) ||
                              (row.licenseNumber && row.licenseNumber.toLowerCase().includes(query)) ||
                              (row.licenseType && row.licenseType.toLowerCase().includes(query))
                            )
                          } else if (selectedCategory === 'roadworthy' || selectedCategory === 'insurance') {
                            return (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                          } else {
                            return (
                              (row.registrationNumber && row.registrationNumber.toLowerCase().includes(query)) ||
                              (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                            )
                          }
                        }).length} entries
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded-2xl text-sm ${
                            currentPage === 1 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Prev
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-700">
                          Page {currentPage} of {Math.ceil(reportData.filter(row => {
                            if (!searchQuery) return true
                            const query = searchQuery.toLowerCase()
                            if (selectedCategory === 'driver') {
                              return (
                                (row.driverName && row.driverName.toLowerCase().includes(query)) ||
                                (row.licenseNumber && row.licenseNumber.toLowerCase().includes(query)) ||
                                (row.licenseType && row.licenseType.toLowerCase().includes(query))
                              )
                            } else if (selectedCategory === 'roadworthy' || selectedCategory === 'insurance') {
                              return (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                            } else {
                              return (
                                (row.registrationNumber && row.registrationNumber.toLowerCase().includes(query)) ||
                                (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                              )
                            }
                          }).length / entriesPerPage)}
                        </span>
                        <button 
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage >= Math.ceil(reportData.filter(row => {
                            if (!searchQuery) return true
                            const query = searchQuery.toLowerCase()
                            if (selectedCategory === 'driver') {
                              return (
                                (row.driverName && row.driverName.toLowerCase().includes(query)) ||
                                (row.licenseNumber && row.licenseNumber.toLowerCase().includes(query)) ||
                                (row.licenseType && row.licenseType.toLowerCase().includes(query))
                              )
                            } else if (selectedCategory === 'roadworthy' || selectedCategory === 'insurance') {
                              return (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                            } else {
                              return (
                                (row.registrationNumber && row.registrationNumber.toLowerCase().includes(query)) ||
                                (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                              )
                            }
                          }).length / entriesPerPage)}
                          className={`px-3 py-1 rounded-2xl text-sm ${
                            currentPage >= Math.ceil(reportData.filter(row => {
                              if (!searchQuery) return true
                              const query = searchQuery.toLowerCase()
                              if (selectedCategory === 'driver') {
                                return (
                                  (row.driverName && row.driverName.toLowerCase().includes(query)) ||
                                  (row.licenseNumber && row.licenseNumber.toLowerCase().includes(query)) ||
                                  (row.licenseType && row.licenseType.toLowerCase().includes(query))
                                )
                              } else if (selectedCategory === 'roadworthy' || selectedCategory === 'insurance') {
                                return (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                              } else {
                                return (
                                  (row.registrationNumber && row.registrationNumber.toLowerCase().includes(query)) ||
                                  (row.vehicleNumber && row.vehicleNumber.toLowerCase().includes(query))
                                )
                              }
                            }).length / entriesPerPage)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
            </div>
          )}
        </div>
          )}
      </div>
      </div>

      {/* Field Selector Modal */}
      {showFieldSelector && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
          onClick={() => setShowFieldSelector(false)}
        >
          <div 
            className={`w-full max-w-md max-h-[80vh] rounded-3xl p-6 overflow-hidden flex flex-col ${
              themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Select Columns
              </h3>
              <button
                onClick={() => setShowFieldSelector(false)}
                className={`p-2 rounded-full transition-colors ${
                  themeMode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 space-y-2 pr-2">
              {availableFields.map((field) => (
                <label 
                  key={field.key}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    themeMode === 'dark' 
                      ? (tempSelectedFields.includes(field.key) ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600')
                      : (tempSelectedFields.includes(field.key) ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100')
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={tempSelectedFields.includes(field.key)}
                    onChange={() => handleFieldToggle(field.key)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancelColumns}
                className={`px-4 py-2 rounded-3xl font-medium transition-colors ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveColumns}
                className="px-4 py-2 rounded-3xl font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </HorizonDashboardLayout>
  )
}
