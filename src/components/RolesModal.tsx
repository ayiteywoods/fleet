'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Shield
} from 'lucide-react'
import Notification from './Notification'
import { useTheme } from '@/contexts/ThemeContext'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Role {
  id: string
  name: string
  guard_name: string
  created_at: Date | null
  updated_at: Date | null
}

interface RolesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RolesModal({ isOpen, onClose }: RolesModalProps) {
  const { themeMode } = useTheme()
  const [roles, setRoles] = useState<Role[]>([])
  const [newRoleName, setNewRoleName] = useState('')
  const [newGuardName, setNewGuardName] = useState('web')
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const [sortField, setSortField] = useState<keyof Role>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchRoles()
    }
  }, [isOpen])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/roles')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setRoles(data)
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: `Failed to fetch roles: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Input Required',
        message: 'Role name cannot be empty.'
      })
      return
    }

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoleName, guard_name: newGuardName })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: `Role "${newRoleName}" added successfully!`
      })
      setNewRoleName('')
      setNewGuardName('web')
      fetchRoles()
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: `Failed to add role: ${error.message}`
      })
    }
  }

  const handleEditClick = (role: Role) => {
    setEditingRole(role)
    setNewRoleName(role.name)
    setNewGuardName(role.guard_name)
  }

  const handleUpdateRole = async () => {
    if (!editingRole || !newRoleName.trim()) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Input Required',
        message: 'Role name cannot be empty.'
      })
      return
    }

    try {
      const response = await fetch(`/api/roles?id=${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoleName, guard_name: newGuardName })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: `Role "${newRoleName}" updated successfully!`
      })
      setEditingRole(null)
      setNewRoleName('')
      setNewGuardName('web')
      fetchRoles()
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: `Failed to update role: ${error.message}`
      })
    }
  }

  const handleDeleteRole = async (id: string, roleName: string) => {
    if (!window.confirm(`Are you sure you want to delete role "${roleName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/roles?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: `Role "${roleName}" deleted successfully!`
      })
      fetchRoles()
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: `Failed to delete role: ${error.message}`
      })
    }
  }

  const handleSort = (field: keyof Role) => {
    const isAsc = sortField === field && sortDirection === 'asc'
    setSortDirection(isAsc ? 'desc' : 'asc')
    setSortField(field)
  }

  const sortedRoles = [...roles].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1
    if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }
    return 0
  })

  const filteredRoles = sortedRoles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.guard_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRoles.map(({ id, name, guard_name }) => ({
      ID: id,
      Name: name,
      'Guard Name': guard_name
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Roles')
    XLSX.writeFile(wb, 'roles.xlsx')
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Export Successful',
      message: 'Roles exported to Excel.'
    })
  }

  const handleExportCSV = () => {
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(filteredRoles.map(({ id, name, guard_name }) => ({
      ID: id,
      Name: name,
      'Guard Name': guard_name
    }))))
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'roles.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Export Successful',
      message: 'Roles exported to CSV.'
    })
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [['ID', 'Name', 'Guard Name']],
      body: filteredRoles.map(({ id, name, guard_name }) => [id, name, guard_name]),
      startY: 20,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: themeMode === 'dark' ? '#374151' : '#E5E7EB',
        textColor: themeMode === 'dark' ? '#F9FAFB' : '#1F2937',
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: themeMode === 'dark' ? '#4B5563' : '#F9FAFB'
      },
      bodyStyles: {
        textColor: themeMode === 'dark' ? '#F9FAFB' : '#1F2937'
      }
    })
    doc.save('roles.pdf')
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Export Successful',
      message: 'Roles exported to PDF.'
    })
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Roles</title>
            <style>
              body { font-family: sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Roles</h1>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Guard Name</th>
                </tr>
              </thead>
              <tbody>
                ${filteredRoles.map(role => `
                  <tr>
                    <td>${role.id}</td>
                    <td>${role.name}</td>
                    <td>${role.guard_name}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Print Successful',
        message: 'Roles sent to printer.'
      })
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className={`relative ${themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-6 rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        <button
          onClick={() => {
            onClose()
            setEditingRole(null)
            setNewRoleName('')
            setNewGuardName('web')
            setSearchQuery('')
            setCurrentPage(1)
          }}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Manage Roles</h2>

        {/* Add/Edit Form */}
        <div className={`mb-6 p-4 rounded-3xl ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h3 className="text-xl font-semibold mb-3">{editingRole ? 'Edit Role' : 'Add New Role'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="roleName" className="block text-sm font-medium mb-1">Role Name</label>
              <input
                type="text"
                id="roleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className={`w-full px-3 py-2 rounded-md border ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="e.g., Admin"
              />
            </div>
            <div>
              <label htmlFor="guardName" className="block text-sm font-medium mb-1">Guard Name</label>
              <input
                type="text"
                id="guardName"
                value={newGuardName}
                onChange={(e) => setNewGuardName(e.target.value)}
                className={`w-full px-3 py-2 rounded-md border ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="e.g., web"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            {editingRole && (
              <button
                onClick={() => {
                  setEditingRole(null)
                  setNewRoleName('')
                  setNewGuardName('web')
                }}
                className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-gray-600 text-white hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            )}
            <button
              onClick={editingRole ? handleUpdateRole : handleAddRole}
              className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                themeMode === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {editingRole ? 'Update Role' : 'Add Role'}
            </button>
          </div>
        </div>

        {/* Search and Export */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-3 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className={`w-full pl-10 pr-4 py-2 rounded-3xl border ${
                themeMode === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-900'
              }`}
            />
          </div>
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

        {/* Roles Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading roles...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-3xl shadow-md">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <tr>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                        themeMode === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      }`}
                      onClick={() => handleSort('name')}
                    >
                      Name
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ChevronUp className="inline-block w-4 h-4 ml-1" /> : <ChevronDown className="inline-block w-4 h-4 ml-1" />
                      )}
                    </th>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                        themeMode === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      }`}
                      onClick={() => handleSort('guard_name')}
                    >
                      Guard Name
                      {sortField === 'guard_name' && (
                        sortDirection === 'asc' ? <ChevronUp className="inline-block w-4 h-4 ml-1" /> : <ChevronDown className="inline-block w-4 h-4 ml-1" />
                      )}
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedRoles.length > 0 ? (
                    paginatedRoles.map((role) => (
                      <tr key={role.id} className={`${themeMode === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 mr-2 text-blue-600" />
                            {role.name}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          {role.guard_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(role)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600 mr-3"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className={`px-6 py-4 text-center text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        No roles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredRoles.length > itemsPerPage && (
              <div className="flex justify-between items-center mt-4">
                <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredRoles.length)} of {filteredRoles.length} entries
                </span>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${
                      themeMode === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-600 text-white border-blue-600'
                          : `${themeMode === 'dark' ? 'bg-gray-700 border-gray-300 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`
                      } text-sm font-medium`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                      themeMode === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  )
}
