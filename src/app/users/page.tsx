'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Plus, 
  Search, 
  Settings, 
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  FileText,
  Printer
} from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import AddUserModal from '@/components/AddUserModal'
import EditUserModal from '@/components/EditUserModal'
import ViewUserModal from '@/components/ViewUserModal'
import RolesModal from '@/components/RolesModal'
import PermissionsModal from '@/components/PermissionsModal'
import Notification from '@/components/Notification'

export default function UsersPage() {
  const { themeMode } = useTheme()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [selectedFields, setSelectedFields] = useState([
    'name', 'email', 'phone', 'role', 'is_active', 'created_at'
  ])
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showViewUserModal, setShowViewUserModal] = useState(false)
  const [showRolesModal, setShowRolesModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Available fields for the table
  const availableFields = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'email', label: 'Email Address', type: 'email' },
    { key: 'phone', label: 'Phone Number', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'region', label: 'Region', type: 'text' },
    { key: 'district', label: 'District', type: 'text' },
    { key: 'license_number', label: 'License Number', type: 'text' },
    { key: 'license_category', label: 'License Category', type: 'text' },
    { key: 'license_expiry', label: 'License Expiry', type: 'date' },
    { key: 'specialization', label: 'Specialization', type: 'text' },
    { key: 'is_active', label: 'Status', type: 'status' },
    { key: 'created_at', label: 'Created Date', type: 'date' },
    { key: 'updated_at', label: 'Last Updated', type: 'date' },
    { key: 'user_code', label: 'User Code', type: 'text' },
    { key: 'user_type', label: 'User Type', type: 'text' }
  ]

  // Fetch users data from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Calculate KPI values from users data
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.is_active).length
  const inactiveUsers = users.filter(u => !u.is_active).length
  const adminUsers = users.filter(u => u.role === 'admin').length
  const regularUsers = users.filter(u => u.role === 'user').length
  const usersWithLicense = users.filter(u => u.license_number).length

  const kpiCards = [
    { title: 'Total Users', value: totalUsers.toString(), icon: Users, color: 'blue' },
    { title: 'Active Users', value: activeUsers.toString(), icon: UserCheck, color: 'green' },
    { title: 'Inactive Users', value: inactiveUsers.toString(), icon: UserX, color: 'red' },
    { title: 'Admin Users', value: adminUsers.toString(), icon: Shield, color: 'purple' },
    { title: 'Regular Users', value: regularUsers.toString(), icon: Users, color: 'orange' },
    { title: 'With License', value: usersWithLicense.toString(), icon: Shield, color: 'indigo' }
  ]

  // Utility functions
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

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

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return (
        <div className="flex flex-col">
          <ChevronUp className="w-3 h-3 text-blue-300" />
          <ChevronDown className="w-3 h-3 text-blue-300" />
        </div>
      )
    }
    return sortDirection === 'asc' ? 
      <div className="flex flex-col">
        <ChevronUp className="w-3 h-3 text-white" />
        <ChevronDown className="w-3 h-3 text-blue-300" />
      </div> : 
      <div className="flex flex-col">
        <ChevronUp className="w-3 h-3 text-blue-300" />
        <ChevronDown className="w-3 h-3 text-white" />
      </div>
  }

  const handleAddUser = async (userData: any) => {
    try {
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'User Added Successfully!',
        message: `User "${userData.name}" has been added to the database. The table will refresh shortly.`
      })
      
      // Close the modal first
      setShowAddUserModal(false)
      
      // Refresh the users data after a short delay
      setTimeout(async () => {
        try {
          const response = await fetch('/api/users')
          if (response.ok) {
            const data = await response.json()
            setUsers(data)
          }
        } catch (error) {
          console.error('Error refreshing users:', error)
        }
      }, 2000) // 2 second delay to let user see the notification
    } catch (error) {
      console.error('Error adding user:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Failed to add user. Please try again.'
      })
    }
  }

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setShowViewUserModal(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setShowEditUserModal(true)
  }

  const handleUpdateUser = async (userData: any) => {
    try {
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'User Updated Successfully!',
        message: `User "${userData.name}" has been updated in the database. The table will refresh shortly.`
      })
      
      // Close the modal first
      setShowEditUserModal(false)
      
      // Refresh the users data after a short delay
      setTimeout(async () => {
        try {
          const response = await fetch('/api/users')
          if (response.ok) {
            const data = await response.json()
            setUsers(data)
          }
        } catch (error) {
          console.error('Error refreshing users:', error)
        }
      }, 2000) // 2 second delay to let user see the notification
    } catch (error) {
      console.error('Error updating user:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Failed to update user. Please try again.'
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'User Deleted Successfully!',
          message: `User "${userName}" has been deleted from the database. The table will refresh shortly.`
        })
        
        // Refresh the users data after a short delay
        setTimeout(async () => {
          try {
            const response = await fetch('/api/users')
            if (response.ok) {
              const data = await response.json()
              setUsers(data)
            }
          } catch (error) {
            console.error('Error refreshing users:', error)
          }
        }, 2000) // 2 second delay to let user see the notification
      } else {
        const result = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error!',
          message: result.error || 'Failed to delete user. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error!',
        message: 'Network error. Please check your connection and try again.'
      })
    }
  }

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return Object.values(user).some(value => 
      String(value).toLowerCase().includes(searchLower)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  return (
    <DashboardLayout>
      <div className="p-6 h-full overflow-y-auto" style={{ 
        width: '100%', 
        maxWidth: '100%', 
        overflowX: 'hidden',
        boxSizing: 'border-box',
        minWidth: '0',
        flexShrink: 1
      }}>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {kpiCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <div key={index} className={`p-4 rounded-lg shadow-sm ${
                themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className={`text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {card.title}
                </h3>
                <p className={`text-2xl font-bold ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {card.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div className={`rounded-lg shadow-sm ${
          themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`} style={{
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          minWidth: '0',
          flexShrink: 1
        }}>
          {/* Header Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Side - Filter Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowRolesModal(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ROLES
                </button>
                <button 
                  onClick={() => setShowPermissionsModal(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  PERMISSIONS
                </button>
              </div>

              {/* Right Side - Add User Button */}
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">ADD USER</span>
              </button>
            </div>

            {/* Table Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-6">
              {/* Entries Display */}
              <div className="flex items-center gap-2">
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Show
                </span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className={`px-3 py-1 border rounded text-sm ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  entries
                </span>
              </div>

              {/* Export/Print Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowFieldSelector(!showFieldSelector)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-orange-600 text-white hover:bg-orange-700"
                >
                  <Settings className="w-4 h-4" />
                  SELECT COLUMNS ({selectedFields.length})
                </button>
                <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  <FileSpreadsheet className="w-4 h-4" />
                  EXCEL
                </button>
                <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  <FileText className="w-4 h-4" />
                  CSV
                </button>
                <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  <Printer className="w-4 h-4" />
                  PRINT
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <span className={`text-sm ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Search:
                </span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className={`pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Field Selector Modal */}
          {showFieldSelector && (
            <div 
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(2px)'
              }}
            >
              <div className={`w-96 max-h-96 rounded-lg shadow-lg ${
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

          {/* Users Table */}
          <div style={{ 
            width: '100%',
            maxWidth: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
            border: '1px solid #e5e7eb',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            <table style={{
              minWidth: selectedFields.length > 7 ? '1400px' : '100%',
              width: selectedFields.length > 7 ? '1400px' : '100%',
              tableLayout: 'fixed',
              boxSizing: 'border-box',
              maxWidth: 'none'
            }}>
              <thead className={`${themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-500'} text-white`}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap" style={{ width: '120px' }}>Actions</th>
                  <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap" style={{ width: '60px' }}>No</th>
                  {getSelectedFieldsData().map((field) => (
                    <th 
                      key={field.key}
                      className={`px-4 py-3 text-left text-sm font-medium cursor-pointer ${
                        themeMode === 'dark' ? 'hover:bg-gray-500' : 'hover:bg-gray-400'
                      } whitespace-nowrap`}
                      onClick={() => handleSort(field.key)}
                      style={{ 
                        width: field.key === 'name' ? '200px' : 
                               field.key === 'email' ? '250px' :
                               field.key === 'phone' ? '150px' :
                               field.key === 'role' ? '100px' :
                               field.key === 'is_active' ? '100px' :
                               field.key === 'created_at' ? '130px' :
                               field.key === 'updated_at' ? '130px' :
                               field.key === 'license_number' ? '150px' :
                               field.key === 'license_category' ? '150px' :
                               field.key === 'license_expiry' ? '130px' :
                               field.key === 'region' ? '120px' :
                               field.key === 'district' ? '120px' :
                               field.key === 'specialization' ? '150px' :
                               field.key === 'user_code' ? '120px' :
                               field.key === 'user_type' ? '120px' : '150px',
                        minWidth: field.key === 'name' ? '200px' : 
                                 field.key === 'email' ? '250px' :
                                 field.key === 'phone' ? '150px' :
                                 field.key === 'role' ? '100px' :
                                 field.key === 'is_active' ? '100px' :
                                 field.key === 'created_at' ? '130px' :
                                 field.key === 'updated_at' ? '130px' :
                                 field.key === 'license_number' ? '150px' :
                                 field.key === 'license_category' ? '150px' :
                                 field.key === 'license_expiry' ? '130px' :
                                 field.key === 'region' ? '120px' :
                                 field.key === 'district' ? '120px' :
                                 field.key === 'specialization' ? '150px' :
                                 field.key === 'user_code' ? '120px' :
                                 field.key === 'user_type' ? '120px' : '150px'
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {field.label}
                        {getSortIcon(field.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${
                themeMode === 'dark' 
                  ? 'divide-gray-600 bg-gray-800' 
                  : 'divide-gray-200 bg-white'
              }`}>
                {loading ? (
                  <tr>
                    <td colSpan={selectedFields.length + 2} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={selectedFields.length + 2} className="px-4 py-8 text-center text-gray-500">
                      {searchQuery ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, index) => (
                    <tr key={user.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {startIndex + index + 1}
                      </td>
                      {getSelectedFieldsData().map((field) => (
                        <td key={field.key} className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
                    <span className="font-medium">{filteredUsers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={handleAddUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false)
          setSelectedUser(null)
        }}
        onUserUpdated={handleUpdateUser}
        user={selectedUser}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={showViewUserModal}
        onClose={() => {
          setShowViewUserModal(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onEdit={(user) => {
          setShowViewUserModal(false)
          setSelectedUser(user)
          setShowEditUserModal(true)
        }}
      />

      {/* Roles Modal */}
      <RolesModal
        isOpen={showRolesModal}
        onClose={() => setShowRolesModal(false)}
      />

      {/* Permissions Modal */}
      <PermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
      />

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </DashboardLayout>
  )
}
