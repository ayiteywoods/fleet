'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  TruckIcon, 
  WrenchScrewdriverIcon,
  BoltIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'

interface ReportData {
  id: string
  title: string
  description: string
  category: string
  lastGenerated: string
  recordCount: number
  status: 'active' | 'pending' | 'completed'
}

export default function ReportsPage() {
  const { themeMode } = useTheme()
  const [reports, setReports] = useState<ReportData[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)

  const categories = [
    { id: 'all', name: 'All Reports', icon: DocumentTextIcon },
    { id: 'fleet', name: 'Fleet Reports', icon: TruckIcon },
    { id: 'maintenance', name: 'Maintenance Reports', icon: WrenchScrewdriverIcon },
    { id: 'fuel', name: 'Fuel Reports', icon: BoltIcon },
    { id: 'insurance', name: 'Insurance Reports', icon: ShieldCheckIcon },
    { id: 'financial', name: 'Financial Reports', icon: ChartBarIcon }
  ]

  const sampleReports: ReportData[] = [
    {
      id: '1',
      title: 'Fleet Utilization Report',
      description: 'Comprehensive analysis of vehicle usage, mileage, and efficiency across the fleet',
      category: 'fleet',
      lastGenerated: '2024-01-15',
      recordCount: 45,
      status: 'active'
    },
    {
      id: '2',
      title: 'Maintenance Schedule Report',
      description: 'Upcoming and overdue maintenance schedules for all vehicles',
      category: 'maintenance',
      lastGenerated: '2024-01-14',
      recordCount: 23,
      status: 'active'
    },
    {
      id: '3',
      title: 'Fuel Consumption Analysis',
      description: 'Monthly fuel consumption trends and cost analysis',
      category: 'fuel',
      lastGenerated: '2024-01-13',
      recordCount: 156,
      status: 'completed'
    },
    {
      id: '4',
      title: 'Insurance Expiry Report',
      description: 'Insurance policies nearing expiration and renewal requirements',
      category: 'insurance',
      lastGenerated: '2024-01-12',
      recordCount: 8,
      status: 'pending'
    },
    {
      id: '5',
      title: 'Cost Analysis Report',
      description: 'Total operational costs breakdown by category and vehicle',
      category: 'financial',
      lastGenerated: '2024-01-11',
      recordCount: 89,
      status: 'active'
    },
    {
      id: '6',
      title: 'Driver Performance Report',
      description: 'Driver efficiency, safety records, and performance metrics',
      category: 'fleet',
      lastGenerated: '2024-01-10',
      recordCount: 34,
      status: 'completed'
    },
    {
      id: '7',
      title: 'Repair Cost Analysis',
      description: 'Breakdown of repair costs by vehicle type and frequency',
      category: 'maintenance',
      lastGenerated: '2024-01-09',
      recordCount: 67,
      status: 'active'
    },
    {
      id: '8',
      title: 'Roadworthy Status Report',
      description: 'Current roadworthy status and upcoming renewals',
      category: 'insurance',
      lastGenerated: '2024-01-08',
      recordCount: 45,
      status: 'pending'
    }
  ]

  useEffect(() => {
    setReports(sampleReports)
  }, [])

  const filteredReports = selectedCategory === 'all' 
    ? reports 
    : reports.filter(report => report.category === selectedCategory)

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true)
    
    try {
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update report status
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'completed', lastGenerated: new Date().toISOString().split('T')[0] }
          : report
      ))
      
      // Show success notification
      alert('Report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleViewReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (!report) return
    
    // Create a new window with report details
    const reportWindow = window.open('', '_blank', 'width=800,height=600')
    if (reportWindow) {
      reportWindow.document.write(`
        <html>
          <head>
            <title>${report.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { line-height: 1.6; }
              .stats { display: flex; gap: 20px; margin: 20px 0; }
              .stat { background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center; }
              .chart-placeholder { background: #f0f0f0; height: 300px; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${report.title}</h1>
              <p>${report.description}</p>
              <p><strong>Generated:</strong> ${report.lastGenerated}</p>
              <p><strong>Records:</strong> ${report.recordCount}</p>
            </div>
            <div class="content">
              <h2>Report Summary</h2>
              <p>This report provides comprehensive analysis based on the selected category and includes detailed insights and metrics.</p>
              
              <div class="stats">
                <div class="stat">
                  <h3>${report.recordCount}</h3>
                  <p>Total Records</p>
                </div>
                <div class="stat">
                  <h3>${report.category.toUpperCase()}</h3>
                  <p>Category</p>
                </div>
                <div class="stat">
                  <h3>${report.status.toUpperCase()}</h3>
                  <p>Status</p>
                </div>
                <div class="stat">
                  <h3>₵${Math.floor(Math.random() * 50000 + 10000)}</h3>
                  <p>Total Value</p>
                </div>
              </div>
              
              <h2>Report Details</h2>
              <div class="chart-placeholder">
                <p>📊 ${report.category.charAt(0).toUpperCase() + report.category.slice(1)} Chart - Trends and patterns</p>
              </div>
              
              <h2>Key Insights</h2>
              <ul>
                <li>Report generated successfully with ${report.recordCount} records</li>
                <li>Category: ${report.category}</li>
                <li>Status: ${report.status}</li>
                <li>Last updated: ${report.lastGenerated}</li>
              </ul>
            </div>
          </body>
        </html>
      `)
      reportWindow.document.close()
    }
  }

  const handleDownloadReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (!report) return
    
    try {
      // Import required libraries
      const XLSX = await import('xlsx')
      
      // Create sample data for the report based on category
      let reportData = []
      
      if (report.category === 'fleet') {
        reportData = [
          ['Vehicle ID', 'Registration', 'Make', 'Model', 'Status', 'Mileage', 'Cost'],
          ['V001', 'GR-1223-12', 'Toyota', 'Camry', 'Active', '2,450', '₵1,230'],
          ['V002', 'GT-8990-25', 'Honda', 'Accord', 'Active', '2,100', '₵1,050'],
          ['V003', 'AS-1234-56', 'Ford', 'Focus', 'Active', '2,300', '₵1,150']
        ]
      } else if (report.category === 'maintenance') {
        reportData = [
          ['Service ID', 'Vehicle', 'Service Type', 'Date', 'Cost', 'Status'],
          ['S001', 'GR-1223-12', 'Oil Change', '2024-01-15', '₵150', 'Completed'],
          ['S002', 'GT-8990-25', 'Brake Service', '2024-01-14', '₵300', 'Completed'],
          ['S003', 'AS-1234-56', 'Tire Rotation', '2024-01-13', '₵80', 'Pending']
        ]
      } else if (report.category === 'fuel') {
        reportData = [
          ['Log ID', 'Vehicle', 'Date', 'Quantity', 'Cost', 'Station'],
          ['F001', 'GR-1223-12', '2024-01-15', '50L', '₵400', 'Shell'],
          ['F002', 'GT-8990-25', '2024-01-14', '45L', '₵360', 'Total'],
          ['F003', 'AS-1234-56', '2024-01-13', '60L', '₵480', 'Goil']
        ]
      } else {
        reportData = [
          ['ID', 'Name', 'Value', 'Status', 'Date'],
          ['R001', 'Report Item 1', '₵1,000', 'Active', '2024-01-15'],
          ['R002', 'Report Item 2', '₵2,000', 'Completed', '2024-01-14'],
          ['R003', 'Report Item 3', '₵1,500', 'Pending', '2024-01-13']
        ]
      }
      
      // Create workbook and worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(reportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, report.category)
      
      // Generate and download file
      const filename = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, filename)
      
      alert('Report downloaded successfully!')
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report. Please try again.')
    }
  }

  const handlePrintReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (!report) return
    
    // Create print content
    const printContent = `
      <html>
        <head>
          <title>${report.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .content { line-height: 1.6; }
            .stats { display: flex; gap: 20px; margin: 20px 0; justify-content: space-around; }
            .stat { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${report.title}</h1>
            <p>${report.description}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Report ID:</strong> ${reportId}</p>
            <p><strong>Category:</strong> ${report.category}</p>
          </div>
          
          <div class="content">
            <h2>Report Summary</h2>
            <div class="stats">
              <div class="stat">
                <h3>${report.recordCount}</h3>
                <p>Total Records</p>
              </div>
              <div class="stat">
                <h3>${report.category.toUpperCase()}</h3>
                <p>Category</p>
              </div>
              <div class="stat">
                <h3>${report.status.toUpperCase()}</h3>
                <p>Status</p>
              </div>
              <div class="stat">
                <h3>₵${Math.floor(Math.random() * 50000 + 10000)}</h3>
                <p>Total Value</p>
              </div>
            </div>
            
            <h2>Report Details</h2>
            <p>This report contains ${report.recordCount} records in the ${report.category} category. The report was last generated on ${report.lastGenerated} and is currently ${report.status}.</p>
            
            <h2>Key Insights</h2>
            <ul>
              <li>Report generated successfully with ${report.recordCount} records</li>
              <li>Category: ${report.category}</li>
              <li>Status: ${report.status}</li>
              <li>Last updated: ${report.lastGenerated}</li>
            </ul>
          </div>
        </body>
      </html>
    `
    
    // Open print dialog
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'pending':
        return 'Pending'
      case 'completed':
        return 'Completed'
      default:
        return 'Unknown'
    }
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

          {/* Category Filter */}
          <div className={`rounded-xl p-6 mb-8 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border border-gray-200 dark:border-gray-700`}>
            <h2 className={`text-lg font-semibold mb-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Report Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    } ${themeMode === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <IconComponent className={`w-6 h-6 mx-auto mb-2 ${
                      selectedCategory === category.id ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      selectedCategory === category.id 
                        ? 'text-blue-600' 
                        : themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {category.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className={`rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${
                  themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
                } hover:shadow-md transition-shadow duration-200`}
              >
                {/* Report Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {report.title}
                    </h3>
                    <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                      {report.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                    {getStatusText(report.status)}
                  </span>
                </div>

                {/* Report Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      {report.lastGenerated}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                    <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      {report.recordCount} records
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={isGenerating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <ChartBarIcon className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleViewReport(report.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                    title="View Report"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                    title="Download Report"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handlePrintReport(report.id)}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-200"
                    title="Print Report"
                  >
                    <PrinterIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <div className={`text-center py-12 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl border border-gray-200 dark:border-gray-700`}>
              <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className={`text-lg font-medium mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No reports found
              </h3>
              <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                No reports available for the selected category.
              </p>
            </div>
          )}
        </div>
      </div>
    </HorizonDashboardLayout>
  )
}
