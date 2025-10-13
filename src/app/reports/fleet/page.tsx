'use client'

import { useState, useEffect } from 'react'
import { 
  TruckIcon, 
  ChartBarIcon, 
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'

interface FleetReportData {
  id: string
  title: string
  description: string
  lastGenerated: string
  recordCount: number
  status: 'active' | 'pending' | 'completed'
  type: 'utilization' | 'performance' | 'maintenance' | 'cost'
}

export default function FleetReportsPage() {
  const { themeMode } = useTheme()
  const [reports, setReports] = useState<FleetReportData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const fleetReports: FleetReportData[] = [
    {
      id: '1',
      title: 'Fleet Utilization Report',
      description: 'Comprehensive analysis of vehicle usage, mileage, and efficiency across the fleet',
      lastGenerated: '2024-01-15',
      recordCount: 45,
      status: 'active',
      type: 'utilization'
    },
    {
      id: '2',
      title: 'Driver Performance Report',
      description: 'Driver efficiency, safety records, and performance metrics',
      lastGenerated: '2024-01-10',
      recordCount: 34,
      status: 'completed',
      type: 'performance'
    },
    {
      id: '3',
      title: 'Vehicle Maintenance Summary',
      description: 'Maintenance history, upcoming services, and cost analysis',
      lastGenerated: '2024-01-08',
      recordCount: 67,
      status: 'active',
      type: 'maintenance'
    },
    {
      id: '4',
      title: 'Fleet Cost Analysis',
      description: 'Total operational costs breakdown by vehicle and category',
      lastGenerated: '2024-01-05',
      recordCount: 89,
      status: 'pending',
      type: 'cost'
    },
    {
      id: '5',
      title: 'Vehicle Location Report',
      description: 'Current locations and movement patterns of fleet vehicles',
      lastGenerated: '2024-01-03',
      recordCount: 23,
      status: 'active',
      type: 'utilization'
    },
    {
      id: '6',
      title: 'Fuel Efficiency Report',
      description: 'Fuel consumption patterns and efficiency metrics by vehicle',
      lastGenerated: '2024-01-01',
      recordCount: 156,
      status: 'completed',
      type: 'performance'
    }
  ]

  useEffect(() => {
    setReports(fleetReports)
  }, [])

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
              <p>This report provides comprehensive analysis of fleet utilization including vehicle usage patterns, mileage efficiency, and operational metrics.</p>
              
              <div class="stats">
                <div class="stat">
                  <h3>45</h3>
                  <p>Total Vehicles</p>
                </div>
                <div class="stat">
                  <h3>89%</h3>
                  <p>Utilization Rate</p>
                </div>
                <div class="stat">
                  <h3>12,450</h3>
                  <p>Total Miles</p>
                </div>
                <div class="stat">
                  <h3>₵45,230</h3>
                  <p>Total Cost</p>
                </div>
              </div>
              
              <h2>Utilization Trends</h2>
              <div class="chart-placeholder">
                <p>📊 Utilization Chart - Monthly trends and patterns</p>
              </div>
              
              <h2>Key Insights</h2>
              <ul>
                <li>Fleet utilization has increased by 15% compared to last month</li>
                <li>Vehicle GR-1223-12 shows highest efficiency rating</li>
                <li>Peak usage occurs during weekdays 9AM-5PM</li>
                <li>Maintenance scheduling optimized for low-usage periods</li>
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
      
      // Create sample data for the report
      const reportData = [
        ['Vehicle ID', 'Registration', 'Make', 'Model', 'Utilization %', 'Miles Driven', 'Cost', 'Status'],
        ['V001', 'GR-1223-12', 'Toyota', 'Camry', '95%', '2,450', '₵1,230', 'Active'],
        ['V002', 'GT-8990-25', 'Honda', 'Accord', '87%', '2,100', '₵1,050', 'Active'],
        ['V003', 'AS-1234-56', 'Ford', 'Focus', '92%', '2,300', '₵1,150', 'Active'],
        ['V004', 'WR-7890-12', 'Nissan', 'Altima', '78%', '1,890', '₵945', 'Maintenance'],
        ['V005', 'ER-4567-89', 'Hyundai', 'Elantra', '89%', '2,200', '₵1,100', 'Active']
      ]
      
      // Create workbook and worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(reportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Fleet Utilization')
      
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
          </div>
          
          <div class="content">
            <h2>Fleet Utilization Summary</h2>
            <div class="stats">
              <div class="stat">
                <h3>45</h3>
                <p>Total Vehicles</p>
              </div>
              <div class="stat">
                <h3>89%</h3>
                <p>Average Utilization</p>
              </div>
              <div class="stat">
                <h3>12,450</h3>
                <p>Total Miles</p>
              </div>
              <div class="stat">
                <h3>₵45,230</h3>
                <p>Total Cost</p>
              </div>
            </div>
            
            <h2>Vehicle Utilization Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>Registration</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Utilization %</th>
                  <th>Miles Driven</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>V001</td><td>GR-1223-12</td><td>Toyota</td><td>Camry</td><td>95%</td><td>2,450</td><td>₵1,230</td><td>Active</td></tr>
                <tr><td>V002</td><td>GT-8990-25</td><td>Honda</td><td>Accord</td><td>87%</td><td>2,100</td><td>₵1,050</td><td>Active</td></tr>
                <tr><td>V003</td><td>AS-1234-56</td><td>Ford</td><td>Focus</td><td>92%</td><td>2,300</td><td>₵1,150</td><td>Active</td></tr>
                <tr><td>V004</td><td>WR-7890-12</td><td>Nissan</td><td>Altima</td><td>78%</td><td>1,890</td><td>₵945</td><td>Maintenance</td></tr>
                <tr><td>V005</td><td>ER-4567-89</td><td>Hyundai</td><td>Elantra</td><td>89%</td><td>2,200</td><td>₵1,100</td><td>Active</td></tr>
              </tbody>
            </table>
            
            <h2>Key Insights</h2>
            <ul>
              <li>Fleet utilization has increased by 15% compared to last month</li>
              <li>Vehicle GR-1223-12 shows highest efficiency rating</li>
              <li>Peak usage occurs during weekdays 9AM-5PM</li>
              <li>Maintenance scheduling optimized for low-usage periods</li>
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'utilization':
        return MapPinIcon
      case 'performance':
        return ChartBarIcon
      case 'maintenance':
        return ClockIcon
      case 'cost':
        return ChartBarIcon
      default:
        return TruckIcon
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'utilization':
        return 'text-blue-600'
      case 'performance':
        return 'text-green-600'
      case 'maintenance':
        return 'text-orange-600'
      case 'cost':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <HorizonDashboardLayout>
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <TruckIcon className="w-8 h-8 text-blue-600" />
              <h1 className={`text-3xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Fleet Reports
              </h1>
            </div>
            <p className={`text-lg ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Comprehensive fleet management and analysis reports
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`rounded-xl p-6 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TruckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Vehicles</p>
                  <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>45</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-6 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Active Reports</p>
                  <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>12</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-6 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pending</p>
                  <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>3</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-6 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>This Month</p>
                  <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>8</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
              const TypeIcon = getTypeIcon(report.type)
              return (
                <div
                  key={report.id}
                  className={`rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${
                    themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } hover:shadow-md transition-shadow duration-200`}
                >
                  {/* Report Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getTypeColor(report.type).replace('text-', 'bg-').replace('-600', '-100')}`}>
                        <TypeIcon className={`w-5 h-5 ${getTypeColor(report.type)}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {report.title}
                        </h3>
                        <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                          {report.description}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
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
                      <ChartBarIcon className="w-4 h-4 text-gray-400" />
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
              )
            })}
          </div>
        </div>
      </div>
    </HorizonDashboardLayout>
  )
}
