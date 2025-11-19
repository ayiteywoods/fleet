'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, Eye, Tag, FileText as DescriptionIcon, Search, Users } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewGroupModal from './ViewGroupModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Group {
  id: string
  name: string
  desc: string | null
  status: string
  created_at: string | null
  updated_at: string | null
}

interface GroupsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GroupsModal({ isOpen, onClose }: GroupsModalProps) {
  const { themeMode } = useTheme()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    status: 'active'
  })
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<keyof Group>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch groups
  useEffect(() => {
    if (isOpen) {
      fetchGroups()
    }
  }, [isOpen])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/groups', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      } else {
        console.error('Failed to fetch groups')
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGroup = async () => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Group Added!',
          message: `"${formData.name}" has been added successfully.`
        })
        
        setFormData({ name: '', desc: '', status: 'active' })
        setShowAddForm(false)
        fetchGroups()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to add group.'
        })
      }
    } catch (error) {
      console.error('Error adding group:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'An error occurred while adding the group.'
      })
    }
  }

  const handleUpdateGroup = async () => {
    if (!editingGroup) return

    try {
      const response = await fetch('/api/groups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          id: editingGroup.id,
          ...formData
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Group Updated!',
          message: `"${formData.name}" has been updated successfully.`
        })
        
        setFormData({ name: '', desc: '', status: 'active' })
        setEditingGroup(null)
        setShowAddForm(false)
        fetchGroups()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to update group.'
        })
      }
    } catch (error) {
      console.error('Error updating group:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'An error occurred while updating the group.'
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingGroup) {
      handleUpdateGroup()
    } else {
      handleAddGroup()
    }
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      desc: group.desc || '',
      status: group.status
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        const response = await fetch(`/api/groups?id=${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Group Deleted!',
            message: 'Group has been deleted successfully.'
          })
          fetchGroups()
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete group.'
          })
        }
      } catch (error) {
        console.error('Error deleting group:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'An error occurred while deleting the group.'
        })
      }
    }
  }

  const handleView = (group: Group) => {
    setSelectedGroup(group)
    setShowViewModal(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingGroup(null)
    setFormData({ name: '', desc: '', status: 'active' })
  }

  // Filter and sort groups
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.desc && group.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
    group.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAndSortedGroups = [...filteredGroups].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedGroups.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedGroups = filteredAndSortedGroups.slice(startIndex, endIndex)

  const handleSort = (field: keyof Group) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Export functions
  const handleExportExcel = () => {
    const data = groups.map(group => ({
      'Name': group.name,
      'Description': group.desc || 'N/A',
      'Status': group.status,
      'Created At': group.created_at ? new Date(group.created_at).toLocaleDateString() : 'N/A',
      'Updated At': group.updated_at ? new Date(group.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Groups')
    XLSX.writeFile(wb, 'groups.xlsx')
  }

  const handleExportCSV = () => {
    const data = groups.map(group => ({
      'Name': group.name,
      'Description': group.desc || 'N/A',
      'Status': group.status,
      'Created At': group.created_at ? new Date(group.created_at).toLocaleDateString() : 'N/A',
      'Updated At': group.updated_at ? new Date(group.updated_at).toLocaleDateString() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'groups.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Groups Report', 14, 22)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    
    // Prepare data for table
    const tableData = groups.map(group => [
      group.name,
      group.desc || 'N/A',
      group.status,
      group.created_at ? new Date(group.created_at).toLocaleDateString() : 'N/A',
      group.updated_at ? new Date(group.updated_at).toLocaleDateString() : 'N/A'
    ])

    autoTable(doc, {
      head: [['Name', 'Description', 'Status', 'Created At', 'Updated At']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    })
    
    doc.save('groups.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const tableData = filteredAndSortedGroups.map(group => `
        <tr>
          <td>${group.name}</td>
          <td>${group.desc || 'N/A'}</td>
          <td>${group.status}</td>
          <td>${group.created_at ? new Date(group.created_at).toLocaleDateString() : 'N/A'}</td>
          <td>${group.updated_at ? new Date(group.updated_at).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <html>
          <head>
            <title>Groups Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #3b82f6; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Groups Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
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
              Groups Management
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
            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-3xl bg-gray-50">
                <h3 className="text-lg font-medium mb-4">
                  {editingGroup ? 'Edit Group' : 'Add New Group'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Admin Group"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DescriptionIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.desc}
                        onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Group for admin users"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                    >
                      {editingGroup ? 'Update' : 'Add'} Group
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

            {/* Add Button */}
            {!showAddForm && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Group
                </button>
              </div>
            )}

            {/* Search and Export Controls */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="relative max-w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search groups..."
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

            {/* Groups Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading groups...</p>
                </div>
              ) : filteredAndSortedGroups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No groups match your search.' : 'No groups found. Add some to get started.'}
                </div>
              ) : (
                <>
                  <table className={`min-w-full border-collapse ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <thead>
                      <tr className={`${
                        themeMode === 'dark' 
                          ? 'bg-gray-600 border-gray-600' 
                          : 'bg-gray-500 border-gray-600'
                      }`}>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b">
                          Actions
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
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                          onClick={() => handleSort('desc')}
                        >
                          <div className="flex items-center gap-1">
                            Description
                            {sortField === 'desc' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-1">
                            Status
                            {sortField === 'status' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
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
                      themeMode === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'
                    }`}>
                      {paginatedGroups.map((group) => (
                        <tr key={group.id} className={`hover:${
                          themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(group)}
                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(group)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(group.id)}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {group.name}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {group.desc || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              group.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {group.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {group.updated_at ? new Date(group.updated_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className={`flex items-center justify-between mt-4 px-4 py-3 border-t ${
                    themeMode === 'dark' 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}>
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 text-sm font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                            themeMode === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Prev
                        </button>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          themeMode === 'dark'
                            ? 'bg-brand-500 text-white'
                            : 'bg-brand-500 text-white'
                        }`}>
                          {currentPage}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 text-sm font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                            themeMode === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                      
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className={`text-sm ${
                            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(endIndex, filteredAndSortedGroups.length)}</span> of{' '}
                            <span className="font-medium">{filteredAndSortedGroups.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="flex items-center gap-2" aria-label="Pagination">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className={`px-3 py-1 text-sm font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                                themeMode === 'dark'
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Prev
                            </button>
                            
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              themeMode === 'dark'
                                ? 'bg-brand-500 text-white'
                                : 'bg-brand-500 text-white'
                            }`}>
                              {currentPage}
                            </span>

                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className={`px-3 py-1 text-sm font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                                themeMode === 'dark'
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Next
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                </>
              )}
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
      <ViewGroupModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        group={selectedGroup}
      />
    </>
  )
}