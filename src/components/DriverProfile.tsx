'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  UserGroupIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  Cog6ToothIcon,
  PencilIcon,
  XMarkIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  MapIcon,
  ClockIcon,
  ChartBarIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import Notification from './Notification'

interface DriverProfileData {
  id: string
  name: string
  phone?: string
  license_number?: string
  license_category?: string
  license_expire?: string
  region?: string
  district?: string
  status: string
  vehicle_id?: string
  spcode?: number
  created_at?: string
  updated_at?: string
  vehicles?: {
    id: string
    reg_number: string
    vin_number?: string
    year?: number
    color?: string
    status: string
  }
  subsidiary?: {
    id: string
    name: string
    contact_no?: string
    address?: string
    location?: string
    contact_person?: string
    contact_person_no?: string
    cluster_id?: string
    description?: string
    notes?: string
  }
}

export default function DriverProfile() {
  const { themeMode } = useTheme()
  const params = useParams()
  const router = useRouter()
  const [driver, setDriver] = useState<DriverProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [subsidiaries, setSubsidiaries] = useState<any[]>([])
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    license_number: '',
    license_category: '',
    license_expire: '',
    region: '',
    district: '',
    status: '',
    vehicle: '',
    subsidiary_id: ''
  })
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const response = await fetch(`/api/drivers/${params.id}`, {
          headers: getAuthHeaders()
        })
        if (response.ok) {
          const data = await response.json()
          setDriver(data)
        } else {
          router.push('/drivers')
        }
      } catch (error) {
        console.error('Error fetching driver:', error)
        router.push('/drivers')
      } finally {
        setLoading(false)
      }
    }

    const fetchSubsidiaries = async () => {
      try {
        const subsidiariesResponse = await fetch('/api/subsidiary', {
          headers: getAuthHeaders()
        })
        if (subsidiariesResponse.ok) {
          const subsidiariesData = await subsidiariesResponse.json()
          setSubsidiaries(subsidiariesData)
        }
      } catch (error) {
        console.error('Error fetching subsidiaries:', error)
      }
    }

    if (params.id) {
      fetchDriver()
      fetchSubsidiaries()
    }
  }, [params.id, router])

  const handleEdit = () => {
    setIsEditing(true)
    if (driver) {
      setFormData({
        name: driver.name || '',
        phone: driver.phone || '',
        email: driver.email || '',
        license_number: driver.license_number || '',
        license_category: driver.license_category || '',
        license_expire: driver.license_expire || '',
        region: driver.region || '',
        district: driver.district || '',
        status: driver.status || '',
        vehicle: driver.vehicles?.reg_number || '',
        subsidiary_id: driver.spcode?.toString() || ''
      })
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/drivers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedDriver = await response.json()
        setDriver(updatedDriver)
        setIsEditing(false)
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Driver updated successfully!'
        })
      } else {
        const errorData = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: errorData.error || 'Failed to update driver'
        })
      }
    } catch (error) {
      console.error('Error updating driver:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error updating driver'
      })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (driver) {
      setFormData({
        name: driver.name || '',
        phone: driver.phone || '',
        email: driver.email || '',
        license_number: driver.license_number || '',
        status: driver.status || '',
        vehicle: driver.vehicle || ''
      })
    }
  }

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    
    if (printWindow) {
      const driverData = driver || {}
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Driver Profile - ${driverData.name || 'N/A'}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: white;
                color: #333;
              }
              .print-header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 20px;
              }
              .print-title {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 10px;
              }
              .print-subtitle {
                font-size: 16px;
                color: #6b7280;
              }
              .print-driver-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 20px;
              }
              .print-driver-info {
                display: flex;
                align-items: center;
                gap: 20px;
              }
              .print-driver-avatar {
                width: 80px;
                height: 80px;
                background: #f3f4f6;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }
              .print-avatar-placeholder {
                font-size: 32px;
              }
              .print-driver-details {
                flex: 1;
              }
              .print-driver-id {
                font-size: 20px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 12px;
              }
              .print-driver-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 12px;
              }
              .print-tag {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
              }
              .print-tag-green {
                background: #10b981;
                color: white;
              }
              .print-tag-gray {
                background: #6b7280;
                color: white;
              }
              .print-tag-blue {
                background: #dbeafe;
                color: #1e40af;
              }
              .print-driver-meta {
                font-size: 14px;
                color: #6b7280;
                line-height: 1.5;
              }
              .print-qr-section {
                width: 60px;
                height: 60px;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }
              .print-qr-code {
                font-size: 10px;
                color: #6b7280;
                text-align: center;
              }
              .print-content {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 24px;
              }
              .print-section-title {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e5e7eb;
              }
              .print-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
              }
              .print-field {
                margin-bottom: 16px;
              }
              .print-label {
                font-size: 12px;
                font-weight: 500;
                color: #6b7280;
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .print-value {
                font-size: 14px;
                color: #1f2937;
                padding: 8px 12px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
              }
              .print-footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
              }
              @media print {
                body { margin: 0; }
                .print-content { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <div class="print-title">Driver Profile</div>
              <div class="print-subtitle">Driver: ${driverData.name || 'N/A'}</div>
            </div>
            
            <!-- Driver Header Card -->
            <div class="print-driver-card">
              <div class="print-driver-info">
                <div class="print-driver-avatar">
                  <div class="print-avatar-placeholder">👤</div>
                </div>
                <div class="print-driver-details">
                  <div class="print-driver-id">${driverData.name || 'N/A'}</div>
                  <div class="print-driver-tags">
                    <span class="print-tag print-tag-green">ID ${driverData.id || 'N/A'}</span>
                    <span class="print-tag print-tag-gray">${driverData.status || 'active'}</span>
                    <span class="print-tag print-tag-blue">📞 ${driverData.phone || 'N/A'}</span>
                    <span class="print-tag print-tag-blue">📍 Fleet</span>
                    <span class="print-tag print-tag-blue">📅 ${new Date().toLocaleDateString()}</span>
                  </div>
                  <div class="print-driver-meta">
                    <div>Last Updated: ${new Date().toLocaleDateString()}</div>
                    <div>License: ${driverData.license_number || 'Not provided'}</div>
                  </div>
                </div>
                <div class="print-qr-section">
                  <div class="print-qr-code">QR Code</div>
                </div>
              </div>
            </div>
            
            <div class="print-content">
              <div class="print-section-title">Driver Information</div>
              <div class="print-grid">
                <div class="print-field">
                  <div class="print-label">Full Name</div>
                  <div class="print-value">${driverData.name || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Phone Number</div>
                  <div class="print-value">${driverData.phone || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">License Number</div>
                  <div class="print-value">${driverData.license_number || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">License Category</div>
                  <div class="print-value">${driverData.license_category || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">License Expire</div>
                  <div class="print-value">${driverData.license_expire || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Region</div>
                  <div class="print-value">${driverData.region || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">District</div>
                  <div class="print-value">${driverData.district || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Status</div>
                  <div class="print-value">${driverData.status || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Assigned Vehicle</div>
                  <div class="print-value">${driverData.vehicles?.reg_number || 'Unassigned'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">SP Code</div>
                  <div class="print-value">${driverData.spcode || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Created At</div>
                  <div class="print-value">${driverData.created_at ? new Date(driverData.created_at).toLocaleDateString() : 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Updated At</div>
                  <div class="print-value">${driverData.updated_at ? new Date(driverData.updated_at).toLocaleDateString() : 'Not specified'}</div>
                </div>
              </div>
            </div>
            <div class="print-footer">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
          </body>
        </html>
      `)
      
      printWindow.document.close()
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  const handleDeactivate = async () => {
    if (confirm('Are you sure you want to deactivate this driver?')) {
      try {
        const response = await fetch(`/api/drivers/${params.id}`, {
          method: 'PUT',
          headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
          },
          body: JSON.stringify({ status: 'Inactive' }),
        })

        if (response.ok) {
          const updatedDriver = await response.json()
          setDriver(updatedDriver)
          setFormData(prev => ({ ...prev, status: 'Inactive' }))
        } else {
          alert('Failed to deactivate driver')
        }
      } catch (error) {
        console.error('Error deactivating driver:', error)
        alert('Error deactivating driver')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Driver not found</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Header Section */}
      <div className={`p-8 rounded-2xl mb-8 border border-gray-300 dark:border-gray-600 ${themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between">
          {/* Left Section - Driver Avatar */}
          <div className="flex-shrink-0 mr-8">
            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-lg">
              <img 
                src="/driver-avatar.jpeg" 
                alt="Driver" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling.style.display = 'flex'
                }}
              />
              <div className="w-full h-full flex items-center justify-center" style={{display: 'none'}}>
                <UserGroupIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </div>
          
          {/* Center Section - Driver Details */}
          <div className="flex-1 min-w-0">
            {/* Driver Name */}
            <h1 className={`text-2xl font-bold mb-6 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {driver.name}
            </h1>
            
            {/* First Row - Key Information */}
            <div className="flex flex-wrap gap-6 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xs font-bold">ID</span>
                </div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {driver.id}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${driver.status === 'Active' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {driver.status?.toLowerCase()}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                  <UserGroupIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Driver
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                  <PhoneIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {driver.phone || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                  <TruckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {driver.vehicle || 'Unassigned'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {new Date(driver.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {/* Second Row - Additional Details */}
            <div className="flex items-center space-x-4">
              <div className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Last Updated: {new Date(driver.updated_at).toLocaleDateString()}
              </div>
              <div className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                License: {driver.license_number || 'Not provided'}
              </div>
            </div>
          </div>
          
          {/* Right Section - QR Code */}
          <div className="flex flex-col items-center space-y-6 ml-8">
            {/* QR Code */}
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-600 p-2">
              <img 
                src="/qr.png" 
                alt="QR Code" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling.style.display = 'block'
                }}
              />
              <span 
                className={`text-xs font-medium ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'} hidden`}
              >
                QR Code
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Details Section */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
            themeMode === 'dark' 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            <UserIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Profile</span>
          </button>
          
          <button className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
            themeMode === 'dark' 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            <ClockIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Work Hours</span>
          </button>
          
          <button className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
            themeMode === 'dark' 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            <ChartBarIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Performance</span>
          </button>
          
          <button className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
            themeMode === 'dark' 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            <DocumentCheckIcon className="w-5 h-5" />
            <span className="text-sm font-normal">License Status</span>
          </button>
          
          <button className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
            themeMode === 'dark' 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            <MapIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Location History</span>
          </button>
          
          <button className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
            themeMode === 'dark' 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            <BeakerIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Fuel Efficiency</span>
          </button>
        </div>
      </div>

      {/* Driver Profile Form */}
      <div className={`p-6 rounded-2xl ${themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between mb-6 p-4 rounded-xl ${themeMode === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
          <h2 className={`text-xl font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Driver Profile
          </h2>
          <button
            onClick={handleDeactivate}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl transition-colors shadow-lg"
          >
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <XMarkIcon className="w-3 h-3 text-orange-500" />
            </div>
            <span className="text-sm font-normal">DEACTIVATE / SUSPEND</span>
          </button>
        </div>

        {/* Horizontal Divider */}
        <hr className={`my-6 ${themeMode === 'dark' ? 'border-gray-600' : 'border-gray-200'}`} />

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
          {/* Full Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {driver?.name || 'Not specified'}
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {driver?.phone || 'Not specified'}
              </div>
            )}
          </div>

          {/* License Number */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              License Number
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {driver?.license_number || 'Not specified'}
              </div>
            )}
          </div>

          {/* License Category */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              License Category
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.license_category}
                onChange={(e) => setFormData(prev => ({ ...prev, license_category: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {driver?.license_category || 'Not specified'}
              </div>
            )}
          </div>

          {/* License Expire */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              License Expire
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.license_expire}
                onChange={(e) => setFormData(prev => ({ ...prev, license_expire: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {driver?.license_expire || 'Not specified'}
              </div>
            )}
          </div>

          {/* Region */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Region
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {driver?.region || 'Not specified'}
              </div>
            )}
          </div>

          {/* District */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              District
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {driver?.district || 'Not specified'}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Status
            </label>
            {isEditing ? (
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {driver?.status || 'Not specified'}
              </div>
            )}
          </div>

          {/* Assigned Vehicle */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Assigned Vehicle
            </label>
            <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {driver?.vehicles?.reg_number || 'Unassigned'}
            </div>
          </div>

          {/* SP Code */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              SP Code
            </label>
            {isEditing ? (
              <select
                value={formData.subsidiary_id}
                onChange={(e) => setFormData(prev => ({ ...prev, subsidiary_id: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              >
                <option value="">-- Select Subsidiary --</option>
                {subsidiaries.map(subsidiary => (
                  <option key={subsidiary.id} value={subsidiary.id}>
                    {subsidiary.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {driver?.subsidiary?.name || 'Not specified'}
              </div>
            )}
          </div>

          {/* Created At */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Created At
            </label>
            <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {driver?.created_at ? new Date(driver.created_at).toLocaleDateString() : 'Not specified'}
            </div>
          </div>

          {/* Updated At */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Updated At
            </label>
            <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {driver?.updated_at ? new Date(driver.updated_at).toLocaleDateString() : 'Not specified'}
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <hr className={`my-6 ${themeMode === 'dark' ? 'border-gray-600' : 'border-gray-200'}`} />

        {/* Action Buttons */}
        <div className="flex justify-end items-center mt-8 space-x-3">
          {!isEditing && (
            <>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-2xl transition-colors"
              >
                <PrinterIcon className="w-4 h-4" />
                <span className="text-sm">PRINT</span>
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span className="text-sm">EDIT DRIVER</span>
              </button>
            </>
          )}
          
          {isEditing && (
            <div className="flex space-x-4">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm">Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-colors"
              >
                <span className="text-sm">Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
