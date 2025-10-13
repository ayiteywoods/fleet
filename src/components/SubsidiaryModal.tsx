'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  X, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Pencil, 
  Trash2, 
  Tag, 
  FileText as DescriptionIcon,
  Phone,
  MapPin,
  User,
  Building2,
  FileSpreadsheet,
  FileText,
  Printer
} from 'lucide-react'
import Notification from './Notification'
import ViewSubsidiaryModal from './ViewSubsidiaryModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Subsidiary {
  id: string
  name: string | null
  contact_no: string | null
  address: string | null
  location: string | null
  contact_person: string | null
  contact_person_no: string | null
  cluster_id: string | null
  description: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

interface SubsidiaryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SubsidiaryModal({ isOpen, onClose }: SubsidiaryModalProps) {
  const { themeMode } = useTheme()
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSubsidiary, setEditingSubsidiary] = useState<Subsidiary | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<Subsidiary | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    contact_no: '',
    address: '',
    location: '',
    contact_person: '',
    contact_person_no: '',
    cluster_id: '',
    description: '',
    notes: ''
  })
  const [clusters, setClusters] = useState<Array<{id: string, name: string}>>([])
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<keyof Subsidiary>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch subsidiaries and clusters
  useEffect(() => {
    if (isOpen) {
      fetchSubsidiaries()
      fetchClusters()
    }
  }, [isOpen])

  const fetchSubsidiaries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subsidiary')
      if (response.ok) {
        const data = await response.json()
        setSubsidiaries(data)
      } else {
        console.error('Failed to fetch subsidiaries')
      }
    } catch (error) {
      console.error('Error fetching subsidiaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClusters = async () => {
    try {
      const response = await fetch('/api/clusters')
      if (response.ok) {
        const data = await response.json()
        setClusters(data)
      }
    } catch (error) {
      console.error('Error fetching clusters:', error)
    }
  }

  const handleAddSubsidiary = async () => {
    try {
      const response = await fetch('/api/subsidiary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Subsidiary Added!',
          message: `"${formData.name || 'New subsidiary'}" has been added successfully.`
        })
        
        setFormData({ 
          name: '', 
          contact_no: '', 
          address: '', 
          location: '', 
          contact_person: '', 
          contact_person_no: '', 
          cluster_id: '', 
          description: '', 
          notes: '' 
        })
        setShowAddForm(false)
        fetchSubsidiaries()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add subsidiary.'
        })
      }
    } catch (error) {
      console.error('Error adding subsidiary:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleView = (subsidiary: Subsidiary) => {
    setSelectedSubsidiary(subsidiary)
    setShowViewModal(true)
  }

  const handleEdit = (subsidiary: Subsidiary) => {
    setEditingSubsidiary(subsidiary)
    setFormData({
      name: subsidiary.name || '',
      contact_no: subsidiary.contact_no || '',
      address: subsidiary.address || '',
      location: subsidiary.location || '',
      contact_person: subsidiary.contact_person || '',
      contact_person_no: subsidiary.contact_person_no || '',
      cluster_id: subsidiary.cluster_id || '',
      description: subsidiary.description || '',
      notes: subsidiary.notes || ''
    })
    setShowAddForm(true)
  }

  const handleUpdate = async () => {
    if (!editingSubsidiary) return

    try {
      const response = await fetch('/api/subsidiary', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingSubsidiary.id,
          ...formData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Subsidiary Updated!',
          message: `"${formData.name || 'Subsidiary'}" has been updated successfully.`
        })
        
        setFormData({ 
          name: '', 
          contact_no: '', 
          address: '', 
          location: '', 
          contact_person: '', 
          contact_person_no: '', 
          cluster_id: '', 
          description: '', 
          notes: '' 
        })
        setEditingSubsidiary(null)
        setShowAddForm(false)
        fetchSubsidiaries()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update subsidiary.'
        })
      }
    } catch (error) {
      console.error('Error updating subsidiary:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleDelete = async (subsidiary: Subsidiary) => {
    if (confirm(`Are you sure you want to delete "${subsidiary.name || `subsidiary ${subsidiary.id}`}"?`)) {
      try {
        const response = await fetch(`/api/subsidiary?id=${subsidiary.id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Subsidiary Deleted!',
            message: `"${subsidiary.name || `subsidiary ${subsidiary.id}`}" has been deleted successfully.`
          })
          
          fetchSubsidiaries()
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: result.error || 'Failed to delete subsidiary.'
          })
        }
      } catch (error) {
        console.error('Error deleting subsidiary:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: 'Network error. Please try again.'
        })
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSubsidiary) {
      handleUpdate()
    } else {
      handleAddSubsidiary()
    }
  }

  const handleCancel = () => {
    setFormData({ 
      name: '', 
      contact_no: '', 
      address: '', 
      location: '', 
      contact_person: '', 
      contact_person_no: '', 
      cluster_id: '', 
      description: '', 
      notes: '' 
    })
    setEditingSubsidiary(null)
    setShowAddForm(false)
  }

  const handleSort = (field: keyof Subsidiary) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Export functions
  const handleExportExcel = () => {
    const data = filteredAndSortedSubsidiaries.map(subsidiary => ({
      'ID': subsidiary.id,
      'Name': subsidiary.name || 'N/A',
      'Contact No': subsidiary.contact_no || 'N/A',
      'Address': subsidiary.address || 'N/A',
      'Location': subsidiary.location || 'N/A',
      'Contact Person': subsidiary.contact_person || 'N/A',
      'Contact Person No': subsidiary.contact_person_no || 'N/A',
      'Cluster ID': subsidiary.cluster_id || 'N/A',
      'Description': subsidiary.description || 'N/A',
      'Notes': subsidiary.notes || 'N/A',
      'Created At': subsidiary.created_at ? new Date(subsidiary.created_at).toLocaleDateString() : 'N/A',
      'Updated At': subsidiary.updated_at ? new Date(subsidiary.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Subsidiaries')
    XLSX.writeFile(wb, 'subsidiaries.xlsx')
  }

  const handleExportCSV = () => {
    const data = filteredAndSortedSubsidiaries.map(subsidiary => ({
      'ID': subsidiary.id,
      'Name': subsidiary.name || 'N/A',
      'Contact No': subsidiary.contact_no || 'N/A',
      'Address': subsidiary.address || 'N/A',
      'Location': subsidiary.location || 'N/A',
      'Contact Person': subsidiary.contact_person || 'N/A',
      'Contact Person No': subsidiary.contact_person_no || 'N/A',
      'Cluster ID': subsidiary.cluster_id || 'N/A',
      'Description': subsidiary.description || 'N/A',
      'Notes': subsidiary.notes || 'N/A',
      'Created At': subsidiary.created_at ? new Date(subsidiary.created_at).toLocaleDateString() : 'N/A',
      'Updated At': subsidiary.updated_at ? new Date(subsidiary.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subsidiaries.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('Subsidiaries Report', 14, 22)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    
    // Prepare table data
    const tableData = filteredAndSortedSubsidiaries.map(subsidiary => [
      subsidiary.id,
      subsidiary.name || 'N/A',
      subsidiary.contact_no || 'N/A',
      subsidiary.address || 'N/A',
      subsidiary.location || 'N/A',
      subsidiary.contact_person || 'N/A',
      subsidiary.created_at ? new Date(subsidiary.created_at).toLocaleDateString() : 'N/A',
      subsidiary.updated_at ? new Date(subsidiary.updated_at).toLocaleDateString() : 'N/A'
    ])

    // Add table
    autoTable(doc, {
      head: [['ID', 'Name', 'Contact No', 'Address', 'Location', 'Contact Person', 'Created At', 'Updated At']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    })

    doc.save('subsidiaries.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const tableData = filteredAndSortedSubsidiaries.map(subsidiary => `
        <tr>
          <td>${subsidiary.id}</td>
          <td>${subsidiary.name || 'N/A'}</td>
          <td>${subsidiary.contact_no || 'N/A'}</td>
          <td>${subsidiary.address || 'N/A'}</td>
          <td>${subsidiary.location || 'N/A'}</td>
          <td>${subsidiary.contact_person || 'N/A'}</td>
          <td>${subsidiary.created_at ? new Date(subsidiary.created_at).toLocaleDateString() : 'N/A'}</td>
          <td>${subsidiary.updated_at ? new Date(subsidiary.updated_at).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <html>
          <head>
            <title>Subsidiaries Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #3b82f6; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #428bca; color: white; }
            </style>
          </head>
          <body>
            <h1>Subsidiaries Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Contact No</th>
                  <th>Address</th>
                  <th>Location</th>
                  <th>Contact Person</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                </tr>
              </thead>
              <tbody>
                ${tableData}
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Sorting and filtering logic
  const filteredAndSortedSubsidiaries = subsidiaries
    .filter(subsidiary => 
      subsidiary.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subsidiary.name && subsidiary.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subsidiary.contact_no && subsidiary.contact_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subsidiary.address && subsidiary.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subsidiary.location && subsidiary.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subsidiary.contact_person && subsidiary.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subsidiary.description && subsidiary.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subsidiary.notes && subsidiary.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (sortDirection === 'asc') {
        return aValue && bValue ? aValue.localeCompare(bValue) : 0
      } else {
        return aValue && bValue ? bValue.localeCompare(aValue) : 0
      }
    })

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedSubsidiaries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSubsidiaries = filteredAndSortedSubsidiaries.slice(startIndex, endIndex)

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(2px)'
        }}
      >
        <div className={`relative w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-3xl shadow-xl ${
          themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${
            themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <h2 className="text-xl font-semibold text-gray-900">
              Subsidiaries Management
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Add Button */}
          {!showAddForm && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
              >
                Add New Subsidiary
              </button>
            </div>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-3xl bg-gray-50">
              <h3 className="text-lg font-medium mb-4">
                {editingSubsidiary ? 'Edit Subsidiary' : 'Add New Subsidiary'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subsidiary Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., ABC Subsidiary"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.contact_no}
                        onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., +1234567890"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 123 Main Street"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., City, State"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.contact_person_no}
                        onChange={(e) => setFormData({ ...formData, contact_person_no: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., +1234567890"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cluster
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.cluster_id}
                        onChange={(e) => setFormData({ ...formData, cluster_id: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a cluster</option>
                        {clusters.map((cluster) => (
                          <option key={cluster.id} value={cluster.id}>
                            {cluster.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    {/* Empty div to maintain grid structure */}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DescriptionIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Description of the subsidiary"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DescriptionIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Additional notes about the subsidiary"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                  >
                    {editingSubsidiary ? 'Update' : 'Add'} Subsidiary
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-3xl hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search and Export Controls */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative max-w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search subsidiaries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      themeMode === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                </div>
                
                {/* Items Per Page Selector */}
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Show:
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className={`px-3 py-1 border rounded-2xl text-sm ${
                      themeMode === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value={2}>2</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              
              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleExportExcel}
                  className={`flex items-center gap-2 px-3 py-2 rounded-3xl text-sm font-medium transition-colors ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Export to Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
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
                  <FileText className="w-4 h-4" />
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
                  <FileText className="w-4 h-4" />
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
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className={`overflow-hidden ${
            themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${
                  themeMode === 'dark' 
                    ? 'bg-gray-500 border-gray-600'
                    : 'bg-gray-500 border-gray-600'
                }`}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                      Actions
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {sortField === 'id' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                      Contact No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                      Contact Person
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                      onClick={() => handleSort('updated_at')}
                    >
                      <div className="flex items-center gap-1">
                        Updated At
                        {sortField === 'updated_at' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  themeMode === 'dark' 
                    ? 'divide-gray-700 bg-gray-800' 
                    : 'divide-gray-200 bg-white'
                }`}>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedSubsidiaries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No subsidiaries found
                      </td>
                    </tr>
                  ) : (
                    paginatedSubsidiaries.map((subsidiary) => (
                      <tr key={subsidiary.id} className={`hover:${
                        themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(subsidiary)}
                              className={`p-2 rounded-full transition-colors ${
                                themeMode === 'dark' 
                                  ? 'hover:bg-gray-600' 
                                  : 'hover:bg-gray-200'
                              }`}
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleEdit(subsidiary)}
                              className={`p-2 rounded-full transition-colors ${
                                themeMode === 'dark' 
                                  ? 'hover:bg-gray-600' 
                                  : 'hover:bg-gray-200'
                              }`}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(subsidiary)}
                              className={`p-2 rounded-full transition-colors ${
                                themeMode === 'dark' 
                                  ? 'hover:bg-gray-600' 
                                  : 'hover:bg-gray-200'
                              }`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {subsidiary.id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {subsidiary.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subsidiary.contact_no || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subsidiary.address || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subsidiary.contact_person || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subsidiary.updated_at ? new Date(subsidiary.updated_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className={`text-sm ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedSubsidiaries.length)} of {filteredAndSortedSubsidiaries.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-2xl text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : themeMode === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-brand-500 text-white'
                      : themeMode === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-2xl text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : themeMode === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />

      {/* View Modal */}
      <ViewSubsidiaryModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        subsidiary={selectedSubsidiary}
      />
    </>
  )
}
