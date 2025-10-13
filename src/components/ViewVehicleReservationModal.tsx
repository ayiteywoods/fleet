'use client'

import { useState } from 'react'
import { X, Download, FileText, FileSpreadsheet, File, Printer, Calendar, Car, Clock } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface VehicleReservation {
  id: string
  justification: string
  start_date: string | null
  end_date: string | null
  duration: number
  status: string
  vehicle_id: string
  created_at: string | null
  updated_at: string | null
  vehicles: {
    id: string
    reg_number: string
    vin_number: string
    trim: string
    year: number
    status: string
    color: string
    current_region: string
    current_district: string
  }
}

interface ViewVehicleReservationModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: VehicleReservation
}

export default function ViewVehicleReservationModal({ isOpen, onClose, reservation }: ViewVehicleReservationModalProps) {
  const { themeMode } = useTheme()
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  const handleExportExcel = () => {
    setIsExporting(true)
    try {
      const data = [
        {
          'Justification': reservation.justification,
          'Start Date': reservation.start_date ? (() => {
            try {
              const date = new Date(reservation.start_date)
              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
            } catch (error) {
              return 'N/A'
            }
          })() : 'N/A',
          'End Date': reservation.end_date ? (() => {
            try {
              const date = new Date(reservation.end_date)
              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
            } catch (error) {
              return 'N/A'
            }
          })() : 'N/A',
          'Duration (days)': reservation.duration,
          'Status': reservation.status,
          'Vehicle': `${reservation.vehicles.reg_number} (${reservation.vehicles.trim})`,
          'Created At': reservation.created_at ? (() => {
            try {
              const date = new Date(reservation.created_at)
              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
            } catch (error) {
              return 'N/A'
            }
          })() : 'N/A',
          'Updated At': reservation.updated_at ? (() => {
            try {
              const date = new Date(reservation.updated_at)
              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
            } catch (error) {
              return 'N/A'
            }
          })() : 'N/A'
        }
      ]
      
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Reservation Details')
      XLSX.writeFile(wb, `vehicle-reservation-${reservation.id}-details.xlsx`)
    } catch (error) {
      console.error('Error exporting Excel:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = () => {
    setIsExporting(true)
    try {
      const data = [
        {
          'Justification': reservation.justification,
          'Start Date': reservation.start_date ? (() => {
            try {
              const date = new Date(reservation.start_date)
              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
            } catch (error) {
              return 'N/A'
            }
          })() : 'N/A',
          'End Date': reservation.end_date ? (() => {
            try {
              const date = new Date(reservation.end_date)
              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
            } catch (error) {
              return 'N/A'
            }
          })() : 'N/A',
          'Duration (days)': reservation.duration,
          'Status': reservation.status,
          'Vehicle': `${reservation.vehicles.reg_number} (${reservation.vehicles.trim})`,
          'Created At': reservation.created_at ? (() => {
            try {
              const date = new Date(reservation.created_at)
              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
            } catch (error) {
              return 'N/A'
            }
          })() : 'N/A',
          'Updated At': reservation.updated_at ? (() => {
            try {
              const date = new Date(reservation.updated_at)
              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
            } catch (error) {
              return 'N/A'
            }
          })() : 'N/A'
        }
      ]
      
      const ws = XLSX.utils.json_to_sheet(data)
      const csv = XLSX.utils.sheet_to_csv(ws)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vehicle-reservation-${reservation.id}-details.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting CSV:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.text('Vehicle Reservation Details Report', 20, 30)
      
      // Basic Information Section
      doc.setFontSize(16)
      doc.text('Basic Information', 20, 50)
      
      doc.setFontSize(12)
      doc.text('Justification:', 20, 65)
      doc.text(reservation.justification, 80, 65)
      
      doc.text('Status:', 20, 80)
      doc.text(reservation.status, 80, 80)
      
      // Reservation Dates Section
      doc.setFontSize(16)
      doc.text('Reservation Dates', 20, 100)
      
      doc.setFontSize(12)
      doc.text('Start Date:', 20, 115)
      doc.text(reservation.start_date ? (() => {
        try {
          const date = new Date(reservation.start_date)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A', 80, 115)
      
      doc.text('End Date:', 20, 130)
      doc.text(reservation.end_date ? (() => {
        try {
          const date = new Date(reservation.end_date)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A', 80, 130)
      
      doc.text('Duration:', 20, 145)
      doc.text(`${reservation.duration} days`, 80, 145)
      
      // Vehicle Information Section
      doc.setFontSize(16)
      doc.text('Vehicle Information', 20, 165)
      
      doc.setFontSize(12)
      doc.text('Vehicle:', 20, 180)
      doc.text(`${reservation.vehicles.reg_number} (${reservation.vehicles.trim})`, 80, 180)
      
      doc.text('Year:', 20, 195)
      doc.text(reservation.vehicles.year.toString(), 80, 195)
      
      doc.text('Color:', 20, 210)
      doc.text(reservation.vehicles.color, 80, 210)
      
      // Timestamps Section
      doc.setFontSize(16)
      doc.text('Timestamps', 20, 230)
      
      doc.setFontSize(12)
      doc.text('Created At:', 20, 245)
      doc.text(reservation.created_at ? (() => {
        try {
          const date = new Date(reservation.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A', 80, 245)
      
      doc.text('Updated At:', 20, 260)
      doc.text(reservation.updated_at ? (() => {
        try {
          const date = new Date(reservation.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A', 80, 260)
      
      doc.save(`vehicle-reservation-${reservation.id}-details.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Vehicle Reservation Details Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #333; }
            .field { margin-bottom: 8px; }
            .label { font-weight: bold; color: #666; }
            .value { margin-left: 10px; color: #333; }
          </style>
        </head>
        <body>
          <h1>Vehicle Reservation Details Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          
          <div class="section">
            <div class="section-title">Basic Information</div>
            <div class="field">
              <span class="label">Justification:</span>
              <span class="value">${reservation.justification}</span>
            </div>
            <div class="field">
              <span class="label">Status:</span>
              <span class="value">${reservation.status}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Reservation Dates</div>
            <div class="field">
              <span class="label">Start Date:</span>
              <span class="value">${reservation.start_date ? (() => {
                try {
                  const date = new Date(reservation.start_date)
                  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                } catch (error) {
                  return 'N/A'
                }
              })() : 'N/A'}</span>
            </div>
            <div class="field">
              <span class="label">End Date:</span>
              <span class="value">${reservation.end_date ? (() => {
                try {
                  const date = new Date(reservation.end_date)
                  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                } catch (error) {
                  return 'N/A'
                }
              })() : 'N/A'}</span>
            </div>
            <div class="field">
              <span class="label">Duration:</span>
              <span class="value">${reservation.duration} days</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Vehicle Information</div>
            <div class="field">
              <span class="label">Vehicle:</span>
              <span class="value">${reservation.vehicles.reg_number} (${reservation.vehicles.trim})</span>
            </div>
            <div class="field">
              <span class="label">Year:</span>
              <span class="value">${reservation.vehicles.year}</span>
            </div>
            <div class="field">
              <span class="label">Color:</span>
              <span class="value">${reservation.vehicles.color}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Timestamps</div>
            <div class="field">
              <span class="label">Created At:</span>
              <span class="value">${reservation.created_at ? (() => {
                try {
                  const date = new Date(reservation.created_at)
                  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                } catch (error) {
                  return 'N/A'
                }
              })() : 'N/A'}</span>
            </div>
            <div class="field">
              <span class="label">Updated At:</span>
              <span class="value">${reservation.updated_at ? (() => {
                try {
                  const date = new Date(reservation.updated_at)
                  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                } catch (error) {
                  return 'N/A'
                }
              })() : 'N/A'}</span>
            </div>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-slate-50 rounded-3xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Vehicle Reservation Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
            
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <FileText className="h-4 w-4" />
              CSV
            </button>
            
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <File className="h-4 w-4" />
              PDF
            </button>
            
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-white">
          {/* Basic Information Card */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Justification</label>
                <p className="text-gray-800">{reservation.justification}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-gray-800">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reservation.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    reservation.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    reservation.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                    reservation.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reservation.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Reservation Dates Card */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reservation Dates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Start Date</label>
                <p className="text-gray-800">{reservation.start_date ? (() => {
                  try {
                    const date = new Date(reservation.start_date)
                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                  } catch (error) {
                    return 'N/A'
                  }
                })() : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">End Date</label>
                <p className="text-gray-800">{reservation.end_date ? (() => {
                  try {
                    const date = new Date(reservation.end_date)
                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                  } catch (error) {
                    return 'N/A'
                  }
                })() : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <p className="text-gray-800">{reservation.duration} days</p>
              </div>
            </div>
          </div>

          {/* Vehicle Information Card */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Vehicle</label>
                <p className="text-gray-800">{reservation.vehicles.reg_number} ({reservation.vehicles.trim})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Year</label>
                <p className="text-gray-800">{reservation.vehicles.year}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Color</label>
                <p className="text-gray-800">{reservation.vehicles.color}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-gray-800">{reservation.vehicles.current_region}, {reservation.vehicles.current_district}</p>
              </div>
            </div>
          </div>

          {/* Timestamps Card */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Timestamps</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Created At</label>
                <p className="text-gray-800">{reservation.created_at ? (() => {
                  try {
                    const date = new Date(reservation.created_at)
                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                  } catch (error) {
                    return 'N/A'
                  }
                })() : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Updated At</label>
                <p className="text-gray-800">{reservation.updated_at ? (() => {
                  try {
                    const date = new Date(reservation.updated_at)
                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
                  } catch (error) {
                    return 'N/A'
                  }
                })() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}