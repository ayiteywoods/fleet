'use client'

import React from 'react'
import { X, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface SparePartInventory {
  id: string
  part_name: string
  description: string
  supplier_name: string
  quantity: number
  unit_price: number
  total_value: number
  minimum_stock_level: number
  maximum_stock_level: number
  location: string
  category: string
  status: string
  created_at: string | null
  updated_at: string | null
  created_by: number | null
  updated_by: number | null
}

interface ViewSparePartInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  inventory: SparePartInventory
}

export default function ViewSparePartInventoryModal({ isOpen, onClose, inventory }: ViewSparePartInventoryModalProps) {
  const { themeMode } = useTheme()

  if (!isOpen) return null

  const handleExportExcel = () => {
    const data = [
      ['Field', 'Value'],
      ['Inventory ID', inventory.id],
      ['Part Name', inventory.part_name],
      ['Description', inventory.description],
      ['Supplier', inventory.supplier_name],
      ['Quantity', inventory.quantity],
      ['Unit Price', `₵${inventory.unit_price}`],
      ['Total Value', `₵${inventory.total_value}`],
      ['Minimum Stock Level', inventory.minimum_stock_level],
      ['Maximum Stock Level', inventory.maximum_stock_level],
      ['Location', inventory.location],
      ['Category', inventory.category],
      ['Status', inventory.status],
      ['Created At', inventory.created_at ? new Date(inventory.created_at).toLocaleString() : 'N/A'],
      ['Updated At', inventory.updated_at ? new Date(inventory.updated_at).toLocaleString() : 'N/A']
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Spare Part Inventory Details')
    XLSX.writeFile(wb, `spare-part-inventory-${inventory.id}.xlsx`)
  }

  const handleExportCSV = () => {
    const data = [
      ['Field', 'Value'],
      ['Inventory ID', inventory.id],
      ['Part Name', inventory.part_name],
      ['Description', inventory.description],
      ['Supplier', inventory.supplier_name],
      ['Quantity', inventory.quantity],
      ['Unit Price', `₵${inventory.unit_price}`],
      ['Total Value', `₵${inventory.total_value}`],
      ['Minimum Stock Level', inventory.minimum_stock_level],
      ['Maximum Stock Level', inventory.maximum_stock_level],
      ['Location', inventory.location],
      ['Category', inventory.category],
      ['Status', inventory.status],
      ['Created At', inventory.created_at ? new Date(inventory.created_at).toLocaleString() : 'N/A'],
      ['Updated At', inventory.updated_at ? new Date(inventory.updated_at).toLocaleString() : 'N/A']
    ]

    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spare-part-inventory-${inventory.id}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Spare Part Inventory Details', 20, 30)
    
    // Basic Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Basic Information', 20, 50)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Part Name: ${inventory.part_name}`, 20, 60)
    doc.text(`Description: ${inventory.description}`, 20, 70)
    doc.text(`Supplier: ${inventory.supplier_name}`, 20, 80)
    doc.text(`Status: ${inventory.status}`, 20, 90)
    
    // Stock Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Stock Information', 20, 110)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Quantity: ${inventory.quantity}`, 20, 120)
    doc.text(`Unit Price: ₵${inventory.unit_price}`, 20, 130)
    doc.text(`Total Value: ₵${inventory.total_value}`, 20, 140)
    doc.text(`Minimum Stock Level: ${inventory.minimum_stock_level}`, 20, 150)
    doc.text(`Maximum Stock Level: ${inventory.maximum_stock_level}`, 20, 160)
    
    // Location Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Location Information', 20, 180)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Location: ${inventory.location}`, 20, 190)
    doc.text(`Category: ${inventory.category}`, 20, 200)
    
    doc.save(`spare-part-inventory-${inventory.id}.pdf`)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Spare Part Inventory Details</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { font-size: 24px; font-weight: bold; margin-bottom: 30px; }
              .section { margin-bottom: 30px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; }
              .value { margin-left: 10px; }
              .status { 
                display: inline-block; 
                padding: 4px 8px; 
                border-radius: 12px; 
                font-size: 12px; 
                font-weight: bold;
                background-color: ${inventory.status === 'In Stock' ? '#d4edda' : inventory.status === 'Low Stock' ? '#fff3cd' : inventory.status === 'Out of Stock' ? '#f8d7da' : '#e2e3e5'};
                color: ${inventory.status === 'In Stock' ? '#155724' : inventory.status === 'Low Stock' ? '#856404' : inventory.status === 'Out of Stock' ? '#721c24' : '#383d41'};
              }
            </style>
          </head>
          <body>
            <div class="header">Spare Part Inventory Details</div>
            
            <div class="section">
              <div class="section-title">Basic Information</div>
              <div class="field">
                <span class="label">Part Name:</span>
                <span class="value">${inventory.part_name}</span>
              </div>
              <div class="field">
                <span class="label">Description:</span>
                <span class="value">${inventory.description}</span>
              </div>
              <div class="field">
                <span class="label">Supplier:</span>
                <span class="value">${inventory.supplier_name}</span>
              </div>
              <div class="field">
                <span class="label">Status:</span>
                <span class="value"><span class="status">${inventory.status}</span></span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Stock Information</div>
              <div class="field">
                <span class="label">Quantity:</span>
                <span class="value">${inventory.quantity}</span>
              </div>
              <div class="field">
                <span class="label">Unit Price:</span>
                <span class="value">₵${inventory.unit_price}</span>
              </div>
              <div class="field">
                <span class="label">Total Value:</span>
                <span class="value">₵${inventory.total_value}</span>
              </div>
              <div class="field">
                <span class="label">Minimum Stock Level:</span>
                <span class="value">${inventory.minimum_stock_level}</span>
              </div>
              <div class="field">
                <span class="label">Maximum Stock Level:</span>
                <span class="value">${inventory.maximum_stock_level}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Location Information</div>
              <div class="field">
                <span class="label">Location:</span>
                <span class="value">${inventory.location}</span>
              </div>
              <div class="field">
                <span class="label">Category:</span>
                <span class="value">${inventory.category}</span>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-slate-50 rounded-3xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Spare Part Inventory Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-slate-50">
          {/* Basic Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Part Name</p>
                <p className="text-gray-900">{inventory.part_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-gray-900">{inventory.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Supplier</p>
                <p className="text-gray-900">{inventory.supplier_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  inventory.status === 'In Stock' 
                    ? 'bg-green-100 text-green-800' 
                    : inventory.status === 'Low Stock'
                    ? 'bg-yellow-100 text-yellow-800'
                    : inventory.status === 'Out of Stock'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {inventory.status}
                </span>
              </div>
            </div>
          </div>

          {/* Stock Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Stock Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Quantity</p>
                <p className="text-gray-900">{inventory.quantity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Unit Price</p>
                <p className="text-gray-900">${inventory.unit_price}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Value</p>
                <p className="text-gray-900">${inventory.total_value}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Minimum Stock Level</p>
                <p className="text-gray-900">{inventory.minimum_stock_level}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Maximum Stock Level</p>
                <p className="text-gray-900">{inventory.maximum_stock_level}</p>
              </div>
            </div>
          </div>

          {/* Location Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Location Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-gray-900">{inventory.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Category</p>
                <p className="text-gray-900">{inventory.category}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}