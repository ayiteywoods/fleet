'use client'

import { useState, useEffect } from 'react'
import { 
  WrenchScrewdriverIcon, 
  ChartBarIcon, 
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import HorizonDashboardLayout from '@/components/HorizonDashboardLayout'

interface MaintenanceReportData {
  id: string
  title: string
  description: string
  lastGenerated: string
  recordCount: number
  status: 'active' | 'pending' | 'completed'
  type: 'schedule' | 'history' | 'cost' | 'overdue'
}

export default function MaintenanceReportsPage() {
  const { themeMode } = useTheme()
  const [reports, setReports] = useState<MaintenanceReportData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const maintenanceReports: MaintenanceReportData[] = [
    {
      id: '1',
      title: 'Maintenance Schedule Report',
      description: 'Upcoming and overdue maintenance schedules for all vehicles',
      lastGenerated: '2024-01-14',
      recordCount: 23,
      status: 'active',
      type: 'schedule'
    },
    {
      id: '2',
      title: 'Maintenance History Report',
      description: 'Complete maintenance history and service records',
      lastGenerated: '2024-01-12',
      recordCount: 156,
      status: 'completed',
      type: 'history'
    },
    {
      id: '3',
      title: 'Repair Cost Analysis',
      description: 'Breakdown of repair costs by vehicle type and frequency',
      lastGenerated: '2024-01-09',
      recordCount: 67,
      status: 'active',
      type: 'cost'
    },
    {
      id: '4',
      title: 'Overdue Maintenance Alert',
      description: 'Vehicles with overdue maintenance and urgent service requirements',
      lastGenerated: '2024-01-07',
      recordCount: 8,
      status: 'pending',
      type: 'overdue'
    },
    {
      id: '5',
      title: 'Preventive Maintenance Plan',
      description: 'Scheduled preventive maintenance activities and timelines',
      lastGenerated: '2024-01-05',
      recordCount: 45,
      status: 'active',
      type: 'schedule'
    },
    {
      id: '6',
      title: 'Maintenance Cost Summary',
      description: 'Monthly and annual maintenance cost analysis by vehicle',
      lastGenerated: '2024-01-03',
      recordCount: 89,
      status: 'completed',
      type: 'cost'
    },
    {
      id: '7',
      title: 'Service Provider Performance',
      description: 'Performance metrics and ratings for maintenance service providers',
      lastGenerated: '2024-01-01',
      recordCount: 12,
      status: 'active',
      type: 'history'
    },
    {
      id: '8',
      title: 'Warranty Tracking Report',
      description: 'Vehicle warranty status and expiration tracking',
      lastGenerated: '2023-12-28',
      recordCount: 34,
      status: 'pending',
      type: 'schedule'
    }
  ]

  useEffect(() => {
    setReports(maintenanceReports)
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
              .stat { background: #fff3e0; padding: 15px; border-radius: 8px; text-align: center; }
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
              <h2>Maintenance Report Summary</h2>
              <p>This report provides comprehensive analysis of maintenance activities, schedules, and cost analysis.</p>
              
              <div class="stats">
                <div class="stat">
                  <h3>${report.recordCount}</h3>
                  <p>Total Records</p>
                </div>
                <div class="stat">
                  <h3>₵45K</h3>
                  <p>Total Cost</p>
                </div>
                <div class="stat">
                  <h3>23</h3>
                  <p>Scheduled</p>
                </div>
                <div class="stat">
                  <h3>8</h3>
                  <p>Overdue</p>
                </div>
              </div>
              
              <h2>Maintenance Trends</h2>
              <div class="chart-placeholder">
                <p>🔧 Maintenance Chart - Service trends and patterns</p>
              </div>
              
              <h2>Key Insights</h2>
              <ul>
                <li>Maintenance schedule optimized for peak efficiency</li>
                <li>Preventive maintenance reduces downtime by 40%</li>
                <li>Cost per service decreased by 15% this quarter</li>
                <li>8 vehicles require immediate attention</li>
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
      
      // Create sample data for the maintenance report
      const reportData = [
        ['Service ID', 'Vehicle', 'Service Type', 'Date', 'Cost', 'Status', 'Mechanic'],
        ['S001', 'GR-1223-12', 'Oil Change', '2024-01-15', '₵150', 'Completed', 'John Doe'],
        ['S002', 'GT-8990-25', 'Brake Service', '2024-01-14', '₵300', 'Completed', 'Jane Smith'],
        ['S003', 'AS-1234-56', 'Tire Rotation', '2024-01-13', '₵80', 'Pending', 'Mike Johnson'],
        ['S004', 'WR-7890-12', 'Engine Check', '2024-01-12', '₵200', 'Completed', 'Sarah Wilson'],
        ['S005', 'ER-4567-89', 'Transmission', '2024-01-11', '₵500', 'In Progress', 'David Brown']
      ]
      
      // Create workbook and worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(reportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Report')
      
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
            <h2>Maintenance Summary</h2>
            <div class="stats">
              <div class="stat">
                <h3>${report.recordCount}</h3>
                <p>Total Services</p>
              </div>
              <div class="stat">
                <h3>₵45,000</h3>
                <p>Total Cost</p>
              </div>
              <div class="stat">
                <h3>23</h3>
                <p>Scheduled</p>
              </div>
              <div class="stat">
                <h3>8</h3>
                <p>Overdue</p>
              </div>
            </div>
            
            <h2>Service Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Service ID</th>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Date</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Mechanic</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>S001</td><td>GR-1223-12</td><td>Oil Change</td><td>2024-01-15</td><td>₵150</td><td>Completed</td><td>John Doe</td></tr>
                <tr><td>S002</td><td>GT-8990-25</td><td>Brake Service</td><td>2024-01-14</td><td>₵300</td><td>Completed</td><td>Jane Smith</td></tr>
                <tr><td>S003</td><td>AS-1234-56</td><td>Tire Rotation</td><td>2024-01-13</td><td>₵80</td><td>Pending</td><td>Mike Johnson</td></tr>
                <tr><td>S004</td><td>WR-7890-12</td><td>Engine Check</td><td>2024-01-12</td><td>₵200</td><td>Completed</td><td>Sarah Wilson</td></tr>
                <tr><td>S005</td><td>ER-4567-89</td><td>Transmission</td><td>2024-01-11</td><td>₵500</td><td>In Progress</td><td>David Brown</td></tr>
              </tbody>
            </table>
            
            <h2>Key Insights</h2>
            <ul>
              <li>Maintenance schedule optimized for peak efficiency</li>
              <li>Preventive maintenance reduces downtime by 40%</li>
              <li>Cost per service decreased by 15% this quarter</li>
              <li>8 vehicles require immediate attention</li>
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
      case 'schedule':
        return CalendarIcon
      case 'history':
        return ClockIcon
      case 'cost':
        return ChartBarIcon
      case 'overdue':
        return ExclamationTriangleIcon
      default:
        return WrenchScrewdriverIcon
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'schedule':
        return 'text-blue-600'
      case 'history':
        return 'text-gray-600'
      case 'cost':
        return 'text-green-600'
      case 'overdue':
        return 'text-red-600'
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
              <WrenchScrewdriverIcon className="w-8 h-8 text-orange-600" />
              <h1 className={`text-3xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Maintenance Reports
              </h1>
            </div>
            <p className={`text-lg ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Comprehensive maintenance tracking and analysis reports
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`rounded-xl p-6 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Scheduled</p>
                  <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>23</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-6 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Completed</p>
                  <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>156</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-6 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Overdue</p>
                  <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>8</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-6 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Cost</p>
                  <p className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>₵45K</p>
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
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <WrenchScrewdriverIcon className="w-4 h-4" />
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
