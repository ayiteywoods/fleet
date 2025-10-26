'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Download, FileText, FileSpreadsheet, File, Printer, ChevronUp, ChevronDown, Eye, User, Mail, Phone, Shield, Search, Settings } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'
import ViewUserModal from './ViewUserModal'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface User {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string
  region: string | null
  district: string | null
  spcode: number | null
  group: number | null
  email_verified_at: string | null
  password: string
  license_number: string | null
  license_category: string | null
  license_expiry: string | null
  specialization: string | null
  is_active: boolean
  remember_token: string | null
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
  profile_image: string | null
  user_code: string | null
  status: string | null
  user_type: string | null
  role_id: string | null
  api_token: string | null
  password_reset: string | null
  deleted_at: string | null
  providers: string | null
  branch_id: string | null
  user_level: string | null
  type: string | null
  full_name: string | null
  picture: string | null
  wc_id: string | null
  district_id: number | null
}

interface Role {
  id: string
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

interface Company {
  id: string
  name: string
  location: string | null
  loc_code: string | null
  phone: string | null
  description: string | null
  group_id: number | null
  email: string | null
  address: string | null
  contact_person: string | null
  contact_phone: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
  external_id: string | null
  data: any
  fetched_at: string | null
  contact_email: string | null
  notes: string | null
  contact_position: string | null
  deleted_by: string | null
  deleted_at: string | null
  service_type: string | null
}

interface UsersModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UsersModal({ isOpen, onClose }: UsersModalProps) {
  const { themeMode } = useTheme()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    is_active: true,
    region: '',
    district: '',
    spcode: '',
    group: '',
    license_number: '',
    license_category: '',
    license_expiry: '',
    specialization: '',
    user_code: '',
    user_type: '',
    user_level: '',
    type: '',
    full_name: '',
    district_id: ''
  })
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  
  // Sorting and pagination state
  const [sortField, setSortField] = useState<keyof User>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Column selection state
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [selectedFields, setSelectedFields] = useState([
    'name', 'email', 'phone', 'role', 'is_active', 'created_at'
  ])

  // Available fields for the table
  const availableFields = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'email', label: 'Email Address', type: 'email' },
    { key: 'phone', label: 'Phone Number', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'region', label: 'Region', type: 'text' },
    { key: 'district', label: 'District', type: 'text' },
    { key: 'spcode', label: 'Company', type: 'text' },
    { key: 'group', label: 'Group', type: 'number' },
    { key: 'email_verified_at', label: 'Email Verified At', type: 'date' },
    { key: 'license_number', label: 'License Number', type: 'text' },
    { key: 'license_category', label: 'License Category', type: 'text' },
    { key: 'license_expiry', label: 'License Expiry', type: 'date' },
    { key: 'specialization', label: 'Specialization', type: 'text' },
    { key: 'is_active', label: 'Status', type: 'status' },
    { key: 'created_at', label: 'Created Date', type: 'date' },
    { key: 'updated_at', label: 'Last Updated', type: 'date' },
    { key: 'created_by', label: 'Created By', type: 'text' },
    { key: 'updated_by', label: 'Updated By', type: 'text' },
    { key: 'profile_image', label: 'Profile Image', type: 'text' },
    { key: 'user_code', label: 'User Code', type: 'text' },
    { key: 'status', label: 'User Status', type: 'text' },
    { key: 'user_type', label: 'User Type', type: 'text' },
    { key: 'role_id', label: 'Role ID', type: 'text' },
    { key: 'api_token', label: 'API Token', type: 'text' },
    { key: 'password_reset', label: 'Password Reset', type: 'text' },
    { key: 'deleted_at', label: 'Deleted At', type: 'date' },
    { key: 'providers', label: 'Providers', type: 'text' },
    { key: 'branch_id', label: 'Branch ID', type: 'text' },
    { key: 'user_level', label: 'User Level', type: 'text' },
    { key: 'type', label: 'Type', type: 'text' },
    { key: 'full_name', label: 'Full Name', type: 'text' },
    { key: 'picture', label: 'Picture', type: 'text' },
    { key: 'wc_id', label: 'WC ID', type: 'text' },
    { key: 'district_id', label: 'District ID', type: 'number' }
  ]

  // Fetch users, roles, and companies
  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      fetchRoles()
      fetchCompanies()
    }
  }, [isOpen])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      } else {
        console.error('Failed to fetch roles')
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      } else {
        console.error('Failed to fetch companies')
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/users', {
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
          title: 'User Added!',
          message: `"${formData.name}" has been added successfully.`
        })
        
        setFormData({ name: '', email: '', phone: '', role: '', password: '', is_active: true })
        setShowAddForm(false)
        fetchUsers()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to add user.'
        })
      }
    } catch (error) {
      console.error('Error adding user:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/users?id=${editingUser.id}`, {
        method: 'PUT',
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
          title: 'User Updated!',
          message: `"${formData.name}" has been updated successfully.`
        })
        
        setFormData({ name: '', email: '', phone: '', role: '', password: '', is_active: true })
        setEditingUser(null)
        setShowAddForm(false)
        fetchUsers()
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to update user.'
        })
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please try again.'
      })
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      password: '', // Don't populate password for security
      is_active: user.is_active,
      region: user.region || '',
      district: user.district || '',
      spcode: user.spcode?.toString() || '',
      group: user.group?.toString() || '',
      license_number: user.license_number || '',
      license_category: user.license_category || '',
      license_expiry: user.license_expiry || '',
      specialization: user.specialization || '',
      user_code: user.user_code || '',
      user_type: user.user_type || '',
      user_level: user.user_level || '',
      type: user.type || '',
      full_name: user.full_name || '',
      district_id: user.district_id?.toString() || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users?id=${id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'User Deleted!',
            message: 'User has been deleted successfully.'
          })
          fetchUsers()
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error!',
            message: result.error || 'Failed to delete user.'
          })
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: 'Network error. Please try again.'
        })
      }
    }
  }

  const handleView = (user: User) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      handleUpdate()
    } else {
      handleAddUser()
    }
  }

  const handleCancel = () => {
    setFormData({ 
      name: '', 
      email: '', 
      phone: '', 
      role: '', 
      password: '', 
      is_active: true,
      region: '',
      district: '',
      spcode: '',
      group: '',
      license_number: '',
      license_category: '',
      license_expiry: '',
      specialization: '',
      user_code: '',
      user_type: '',
      user_level: '',
      type: '',
      full_name: '',
      district_id: ''
    })
    setEditingUser(null)
    setShowAddForm(false)
  }

  // Column selection utility functions
  const toggleField = (fieldKey: string) => {
    if (selectedFields.includes(fieldKey)) {
      setSelectedFields(selectedFields.filter(f => f !== fieldKey))
    } else {
      setSelectedFields([...selectedFields, fieldKey])
    }
  }

  const getSelectedFieldsData = () => {
    return selectedFields.map(fieldKey => 
      availableFields.find(field => field.key === fieldKey)
    ).filter(Boolean)
  }

  const formatFieldValue = (field: any, value: any) => {
    if (!value && value !== 0) return '-'
    
    if (typeof value === 'object' && value !== null) {
      return '-'
    }
    
    let stringValue = String(value).trim()
    stringValue = stringValue.replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim()
    
    if (stringValue.length > 50) {
      stringValue = stringValue.substring(0, 47) + '...'
    }
    
    // Special handling for SP Code (Company)
    if (field.key === 'spcode') {
      const company = companies.find(c => c.id === stringValue)
      return company ? company.name : stringValue
    }
    
    switch (field.type) {
      case 'number':
        return Number(stringValue).toLocaleString()
      case 'date':
        try {
          return new Date(stringValue).toLocaleDateString()
        } catch (error) {
          return stringValue
        }
      case 'status':
        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'active':
            case 'true':
              return 'bg-green-100 text-green-800 border-green-200'
            case 'inactive':
            case 'false':
              return 'bg-red-100 text-red-800 border-red-200'
            default:
              return 'bg-gray-100 text-gray-800 border-gray-200'
          }
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(stringValue)}`}>
            {stringValue === 'true' ? 'Active' : stringValue === 'false' ? 'Inactive' : stringValue?.charAt(0).toUpperCase() + stringValue?.slice(1).toLowerCase()}
          </span>
        )
      default:
        return stringValue
    }
  }

  // Export functions
  const formatFieldValueForExport = (fieldKey: string, value: any, fieldType: string) => {
    if (!value && value !== 0) return '-'
    
    if (typeof value === 'object' && value !== null) {
      return '-'
    }
    
    let stringValue = String(value).trim()
    stringValue = stringValue.replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim()
    
    // Special handling for SP Code (Company)
    if (fieldKey === 'spcode') {
      const company = companies.find(c => c.id === stringValue)
      return company ? company.name : stringValue
    }
    
    switch (fieldType) {
      case 'number':
        return Number(stringValue).toLocaleString()
      case 'date':
        try {
          return new Date(stringValue).toLocaleDateString()
        } catch (error) {
          return stringValue
        }
      case 'status':
        return stringValue === 'true' ? 'Active' : stringValue === 'false' ? 'Inactive' : stringValue?.charAt(0).toUpperCase() + stringValue?.slice(1).toLowerCase()
      default:
        return stringValue
    }
  }

  const handleExportExcel = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = selectedFieldsData.map(field => field.label)
    
    const data = currentUsers.map((user) => {
      const row: (string | number)[] = []
      selectedFieldsData.forEach(field => {
        const value = user[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      return row
    })

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
    
    XLSX.writeFile(workbook, `users-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Excel Export Successful!',
      message: 'Users data has been exported to Excel file.'
    })
  }

  const handleExportCSV = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = selectedFieldsData.map(field => field.label)
    
    const data = currentUsers.map((user) => {
      const row: (string | number)[] = []
      selectedFieldsData.forEach(field => {
        const value = user[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      return row
    })

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'CSV Export Successful!',
      message: 'Users data has been exported to CSV file.'
    })
  }

  const handleExportPDF = () => {
    const selectedFieldsData = getSelectedFieldsData()
    const headers = selectedFieldsData.map(field => field.label)
    
    const data = currentUsers.map((user) => {
      const row: (string | number)[] = []
      selectedFieldsData.forEach(field => {
        const value = user[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      return row
    })

    const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation
    doc.setFontSize(16)
    doc.text('Users Report', 14, 22)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    // Add table
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }, // Blue header
      alternateRowStyles: { fillColor: [249, 250, 251] }, // Light gray alternating rows
      margin: { top: 40 }
    })

    doc.save(`users-${new Date().toISOString().split('T')[0]}.pdf`)
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'PDF Export Successful!',
      message: 'Users data has been exported to PDF file.'
    })
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const selectedFieldsData = getSelectedFieldsData()
    const headers = selectedFieldsData.map(field => field.label)
    
    const data = currentUsers.map((user) => {
      const row: (string | number)[] = []
      selectedFieldsData.forEach(field => {
        const value = user[field.key]
        row.push(formatFieldValueForExport(field.key, value, field.type))
      })
      return row
    })

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Users Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; margin-bottom: 10px; }
          .date { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #3b82f6; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9fafb; }
          tr:hover { background-color: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>Users Report</h1>
        <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => 
              `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
    
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Print Successful!',
      message: 'Users data has been sent to printer.'
    })
  }

  // Sorting function
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort users
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.phone && user.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAndSortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className={`relative bg-white rounded-3xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden ${
          themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`px-6 py-4 flex items-center justify-between ${
            themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Add User Button */}
            {!showAddForm && (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New User
                </button>
              </div>
            )}

            {/* Search and Export Controls */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Export Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFieldSelector(!showFieldSelector)}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    SELECT COLUMNS ({selectedFields.length})
                  </button>
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
                    <File className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-3xl text-sm hover:bg-gray-200 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                </div>
              </div>
            </div>

            {/* Field Selector Modal */}
            {showFieldSelector && (
              <div 
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)'
                }}
              >
                <div className={`w-96 max-h-96 rounded-2xl ${
                  themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className={`p-4 border-b ${
                    themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium ${
                        themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Select Columns to Display
                      </h3>
                      <button
                        onClick={() => setShowFieldSelector(false)}
                        className={`p-1 rounded ${
                          themeMode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className={`text-sm mt-1 ${
                      themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Choose columns to display in the table (6 columns by default, more will enable horizontal scroll)
                    </p>
                  </div>
                  <div className="p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                      {availableFields.map((field) => (
                        <label
                          key={field.key}
                          className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                            selectedFields.includes(field.key)
                              ? themeMode === 'dark'
                                ? 'bg-orange-600 text-white'
                                : 'bg-orange-100 text-orange-900'
                              : themeMode === 'dark'
                              ? 'hover:bg-gray-700 text-gray-300'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFields.includes(field.key)}
                            onChange={() => toggleField(field.key)}
                            className="mr-3"
                          />
                          <span className="text-sm">{field.label}</span>
                          <span className={`ml-auto text-xs ${
                            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {field.type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={`p-4 border-t ${
                    themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {selectedFields.length} columns selected
                      </span>
                      <button
                        onClick={() => setShowFieldSelector(false)}
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className={`mb-6 p-6 rounded-3xl ${
                themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter name"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter email"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required
                        >
                          <option value="">Select Role</option>
                          {roles.map(role => (
                            <option key={role.id} value={role.name}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {!editingUser && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter password"
                          required={!editingUser}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.is_active ? 'active' : 'inactive'}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Additional Fields Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region
                      </label>
                      <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter region"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter district"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company (SP Code)
                      </label>
                      <select
                        value={formData.spcode}
                        onChange={(e) => setFormData({ ...formData, spcode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select Company</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group
                      </label>
                      <input
                        type="number"
                        value={formData.group}
                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter group"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={formData.license_number}
                        onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter license number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Category
                      </label>
                      <input
                        type="text"
                        value={formData.license_category}
                        onChange={(e) => setFormData({ ...formData, license_category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter license category"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Expiry
                      </label>
                      <input
                        type="date"
                        value={formData.license_expiry}
                        onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter specialization"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Code
                      </label>
                      <input
                        type="text"
                        value={formData.user_code}
                        onChange={(e) => setFormData({ ...formData, user_code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter user code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Type
                      </label>
                      <input
                        type="text"
                        value={formData.user_type}
                        onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter user type"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Level
                      </label>
                      <input
                        type="text"
                        value={formData.user_level}
                        onChange={(e) => setFormData({ ...formData, user_level: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter user level"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <input
                        type="text"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter type"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District ID
                      </label>
                      <input
                        type="number"
                        value={formData.district_id}
                        onChange={(e) => setFormData({ ...formData, district_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter district ID"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-3xl hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-500 text-white rounded-3xl hover:bg-brand-600 transition-colors"
                    >
                      {editingUser ? 'Update' : 'Add'} User
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className={`min-w-full border-collapse ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <thead className={`${
                  themeMode === 'dark' 
                    ? 'bg-gray-600 border-gray-600' 
                    : 'bg-gray-500 border-gray-600'
                }`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                    {getSelectedFieldsData().map((field) => (
                      <th 
                        key={field.key}
                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500"
                        onClick={() => handleSort(field.key)}
                      >
                        <div className="flex items-center gap-1">
                          {field.label}
                          {sortField === field.key && (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  themeMode === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                }`}>
                  {loading ? (
                    <tr>
                      <td colSpan={selectedFields.length + 1} className="px-6 py-4 text-center text-gray-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={selectedFields.length + 1} className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => (
                      <tr key={user.id} className={`hover:bg-gray-50 ${themeMode === 'dark' ? 'hover:bg-gray-700' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(user)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                        {getSelectedFieldsData().map((field) => (
                          <td key={field.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatFieldValue(field, user[field.key])}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} results
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors'
                  }`}
                >
                  Prev
                </button>

                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                  {currentPage}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedUser && (
        <ViewUserModal
          user={selectedUser}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </>
  )
}
