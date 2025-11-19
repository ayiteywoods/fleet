'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, Eye, Tag, FileText as DescriptionIcon, Search } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewCategoryModal from './ViewCategoryModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Category {
  id: string
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

interface CategoriesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CategoriesModal({ isOpen, onClose }: CategoriesModalProps) {
  const { themeMode } = useTheme()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
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
  const [sortField, setSortField] = useState<keyof Category>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch categories
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    try {
      const response = await fetch('/api/categories', {
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
          title: 'Category Added!',
          message: `"${formData.name}" has been added successfully.`
        })
        
        setFormData({ name: '', description: '' })
        setShowAddForm(false)
        fetchCategories()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add category.'
        })
      }
    } catch (error) {
      console.error('Error adding category:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleView = (category: Category) => {
    setSelectedCategory(category)
    setShowViewModal(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setShowAddForm(true)
  }

  const handleUpdate = async () => {
    if (!editingCategory) return

    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          id: editingCategory.id,
          ...formData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Category Updated!',
          message: `"${formData.name}" has been updated successfully.`
        })
        
        setFormData({ name: '', description: '' })
        setEditingCategory(null)
        setShowAddForm(false)
        fetchCategories()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update category.'
        })
      }
    } catch (error) {
      console.error('Error updating category:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleDelete = async (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        const response = await fetch(`/api/categories?id=${category.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        const result = await response.json()

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Category Deleted!',
            message: `"${category.name}" has been deleted successfully.`
          })
          
          fetchCategories()
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: result.error || 'Failed to delete category.'
          })
        }
      } catch (error) {
        console.error('Error deleting category:', error)
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
    if (editingCategory) {
      handleUpdate()
    } else {
      handleAddCategory()
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '' })
    setEditingCategory(null)
    setShowAddForm(false)
  }

  // Export functions
  const handleExportExcel = () => {
    const data = filteredAndSortedCategories.map(category => ({
      'Name': category.name,
      'Description': category.description || 'N/A',
      'Created At': category.created_at ? (() => {
        try {
          const date = new Date(category.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': category.updated_at ? (() => {
        try {
          const date = new Date(category.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Categories')
    XLSX.writeFile(wb, 'categories.xlsx')
  }

  const handleExportCSV = () => {
    const data = filteredAndSortedCategories.map(category => ({
      'Name': category.name,
      'Description': category.description || 'N/A',
      'Created At': category.created_at ? (() => {
        try {
          const date = new Date(category.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      'Updated At': category.updated_at ? (() => {
        try {
          const date = new Date(category.updated_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'categories.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('Categories Report', 14, 22)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    
    // Prepare table data
    const tableData = filteredAndSortedCategories.map(category => [
      category.name,
      category.description || 'N/A',
      category.created_at ? (() => {
        try {
          const date = new Date(category.created_at)
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
        } catch (error) {
          return 'N/A'
        }
      })() : 'N/A',
      category.updated_at ? new Date(category.updated_at).toLocaleDateString() : 'N/A'
    ])
    
    autoTable(doc, {
      head: [['Name', 'Description', 'Created At', 'Updated At']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    })
    
    doc.save('categories.pdf')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const tableData = filteredAndSortedCategories.map(category => `
        <tr>
          <td>${category.name}</td>
          <td>${category.description || 'N/A'}</td>
          <td>${category.created_at ? (() => {
            try {
              const date = new Date(category.created_at)
              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
            } catch (error) {
              return 'N/A'
            }
          })() : 'N/A'}</td>
          <td>${category.updated_at ? (() => {
            try {
              const date = new Date(category.updated_at)
              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
            } catch (error) {
              return 'N/A'
            }
          })() : 'N/A'}</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <html>
          <head>
            <title>Categories Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #3b82f6; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #3b82f6; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Categories Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
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
  const filteredAndSortedCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField] || ''
      const bValue = b[sortField] || ''
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedCategories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCategories = filteredAndSortedCategories.slice(startIndex, endIndex)

  const handleSort = (field: keyof Category) => {
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
        <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-xl ${
          themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${
            themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <h2 className="text-xl font-semibold text-gray-900">
              Categories Management
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
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name *
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
                          placeholder="e.g., Vehicle Types"
                          required
                        />
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
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Categories for vehicle classification"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                    >
                      {editingCategory ? 'Update' : 'Add'} Category
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
                  Add New Category
                </button>
              </div>
            )}

            {/* Search and Export Controls */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        themeMode === 'dark' 
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    />
                  </div>
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

            {/* Categories Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading categories...</p>
                </div>
              ) : filteredAndSortedCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No categories match your search.' : 'No categories found. Add some to get started.'}
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
                          onClick={() => handleSort('description')}
                        >
                          <div className="flex items-center gap-1">
                            Description
                            {sortField === 'description' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center gap-1">
                            Created At
                            {sortField === 'created_at' && (
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
                      themeMode === 'dark' 
                        ? 'divide-gray-600 bg-gray-800' 
                        : 'divide-gray-200 bg-white'
                    }`}>
                      {paginatedCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleView(category)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(category)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(category)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            {category.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.description || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.created_at ? (() => {
                              try {
                                const date = new Date(category.created_at)
                                return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                              } catch (error) {
                                return 'N/A'
                              }
                            })() : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.updated_at ? (() => {
                              try {
                                const date = new Date(category.updated_at)
                                return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
                              } catch (error) {
                                return 'N/A'
                              }
                            })() : 'N/A'}
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
                            themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(endIndex, filteredAndSortedCategories.length)}</span> of{' '}
                            <span className="font-medium">{filteredAndSortedCategories.length}</span> results
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
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      {/* View Category Modal */}
      <ViewCategoryModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        category={selectedCategory}
      />
    </>
  )
}
