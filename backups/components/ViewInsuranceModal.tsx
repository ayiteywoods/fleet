'use client'

import { useState } from 'react'
import { X, Shield, FileText, Calendar, Banknote, Car, Edit, Download, Printer } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface ViewInsuranceModalProps {
  isOpen: boolean
  onClose: () => void
  insurance: any
  onEdit?: (insurance: any) => void
}

export default function ViewInsuranceModal({ isOpen, onClose, insurance, onEdit }: ViewInsuranceModalProps) {
  const { themeMode } = useTheme()
  const [isPrinting, setIsPrinting] = useState(false)

  if (!isOpen || !insurance) return null

  const handlePrint = () => {
    setIsPrinting(true)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Insurance Details - ${insurance.policy_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #3B82F6; padding-bottom: 10px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; color: #374151; }
              .value { margin-left: 10px; color: #6B7280; }
              .row { display: flex; margin-bottom: 10px; }
              .col { flex: 1; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Insurance Details</h1>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="section">
              <h2>Policy Information</h2>
              <div class="row">
                <div class="col">
                  <span class="label">Policy Number:</span>
                  <span class="value">${insurance.policy_number}</span>
                </div>
                <div class="col">
                  <span class="label">Insurance Company:</span>
                  <span class="value">${insurance.insurance_company}</span>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <span class="label">Coverage Type:</span>
                  <span class="value">${insurance.coverage_type}</span>
                </div>
                <div class="col">
                  <span class="label">Premium Amount:</span>
                  <span class="value">₵${Number(insurance.premium_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div class="section">
              <h2>Policy Dates</h2>
              <div class="row">
                <div class="col">
                  <span class="label">Start Date:</span>
                  <span class="value">${new Date(insurance.start_date).toLocaleDateString()}</span>
                </div>
                <div class="col">
                  <span class="label">End Date:</span>
                  <span class="value">${new Date(insurance.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div class="section">
              <h2>Additional Information</h2>
              <div class="row">
                <div class="col">
                  <span class="label">Notes:</span>
                  <span class="value">${insurance.notes || 'No notes'}</span>
                </div>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      printWindow.close()
    }
    setIsPrinting(false)
  }

  const handleDownloadPDF = () => {
    const content = `
Insurance Details Report
Generated on: ${new Date().toLocaleDateString()}

Policy Information:
Policy Number: ${insurance.policy_number}
Insurance Company: ${insurance.insurance_company}
Coverage Type: ${insurance.coverage_type}
Premium Amount: ₵${Number(insurance.premium_amount).toLocaleString()}

Policy Dates:
Start Date: ${new Date(insurance.start_date).toLocaleDateString()}
End Date: ${new Date(insurance.end_date).toLocaleDateString()}

Additional Information:
Notes: ${insurance.notes || 'No notes'}
    `
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `insurance-${insurance.policy_number}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`relative ${themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{insurance.policy_number}</h2>
              <p className="text-gray-600 dark:text-gray-400">{insurance.insurance_company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(insurance)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Policy Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Policy Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Policy Number</p>
                  <p className="font-medium">{insurance.policy_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Insurance Company</p>
                  <p className="font-medium">{insurance.insurance_company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Coverage Type</p>
                  <p className="font-medium">{insurance.coverage_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Banknote className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Premium Amount</p>
                  <p className="font-medium">₵{Number(insurance.premium_amount).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Policy Dates
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="font-medium">{new Date(insurance.start_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                  <p className="font-medium">{new Date(insurance.end_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Additional Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="font-medium">{insurance.notes || 'No notes provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              {isPrinting ? 'Printing...' : 'Print'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
