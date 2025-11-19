'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  TruckIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  PencilIcon,
  XMarkIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  MapIcon,
  UserIcon,
  WrenchIcon,
  PrinterIcon,
  CpuChipIcon,
  MapPinIcon as TrackingIcon,
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  DocumentIcon,
  MapPinIcon as LocationIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import { formatDateTime } from '@/lib/dateUtils'
import Notification from './Notification'
import GoogleMapsModal from './GoogleMapsModal'
import AddMaintenanceModal from './AddMaintenanceModal'
import EditMaintenanceModal from './EditMaintenanceModal'
import ViewMaintenanceModal from './ViewMaintenanceModal'
import AddRepairModal from './AddRepairModal'
import EditRepairModal from './EditRepairModal'
import ViewRepairModal from './ViewRepairModal'
import AddInsuranceModal from './AddInsuranceModal'
import EditInsuranceModal from './EditInsuranceModal'
import ViewInsuranceModal from './ViewInsuranceModal'
import AddRoadworthyModal from './AddRoadworthyModal'
import EditRoadworthyModal from './EditRoadworthyModal'
import ViewRoadworthyModal from './ViewRoadworthyModal'
import AddFuelLogModal from './AddFuelLogModal'
import EditFuelLogModal from './EditFuelLogModal'
import ViewFuelLogModal from './ViewFuelLogModal'

interface VehicleProfileData {
  id: string
  reg_number: string
  vin_number?: string
  year?: number
  color?: string
  engine_number?: string
  chassis_number?: string
  current_region?: string
  current_district?: string
  current_mileage?: any
  last_service_date?: string
  next_service_km?: number
  status: string
  notes?: string
  type_id?: string
  make_id?: string
  spcode?: string
  created_at?: string
  updated_at?: string
  vehicle_types?: {
    id: string
    type: string
    description?: string
  }
  vehicle_makes?: {
    id: string
    name: string
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
  driver_operators?: Array<{
    id: string
    name: string
    phone: string
    license_number: string
    license_category: string
    license_expire: string
    region: string
    district: string
    status: string
    vehicle_id: string
    spcode?: number
  }>
}

export default function VehicleProfile() {
  const { themeMode } = useTheme()
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<VehicleProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activeButton, setActiveButton] = useState('Profile')
  const [maintenanceData, setMaintenanceData] = useState<any[]>([])
  const [repairData, setRepairData] = useState<any[]>([])
  const [insuranceData, setInsuranceData] = useState<any[]>([])
  const [roadworthyData, setRoadworthyData] = useState<any[]>([])
  const [fuelLogsData, setFuelLogsData] = useState<any[]>([])
  const [sensorData, setSensorData] = useState<any[]>([])
  const [sensorSearchQuery, setSensorSearchQuery] = useState('')
  const [sensorCurrentPage, setSensorCurrentPage] = useState(1)
  const [sensorEntriesPerPage, setSensorEntriesPerPage] = useState(10)
  const [sensorSortField, setSensorSortField] = useState<string>('')
  const [sensorSortDirection, setSensorSortDirection] = useState<'asc' | 'desc'>('asc')
  const [trackingData, setTrackingData] = useState<any[]>([])
  const [trackingSearchQuery, setTrackingSearchQuery] = useState('')
  const [trackingCurrentPage, setTrackingCurrentPage] = useState(1)
  const [trackingEntriesPerPage, setTrackingEntriesPerPage] = useState(10)
  const [trackingSortField, setTrackingSortField] = useState<string>('')
  const [trackingSortDirection, setTrackingSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Google Maps Modal state
  const [isMapsModalOpen, setIsMapsModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    latitude?: number
    longitude?: number
  } | null>(null)

  // Google Maps Modal handlers
  const handleOpenMapsModal = (tracking: any) => {
    setSelectedLocation({
      address: tracking.address || 'Unknown Location',
      latitude: tracking.latitude,
      longitude: tracking.longitude
    })
    setIsMapsModalOpen(true)
  }

  const handleCloseMapsModal = () => {
    setIsMapsModalOpen(false)
    setSelectedLocation(null)
  }

  const [latestTrackingData, setLatestTrackingData] = useState<any>(null)
  const [latestSensorData, setLatestSensorData] = useState<any>(null)
  const [isAddMaintenanceModalOpen, setIsAddMaintenanceModalOpen] = useState(false)
  const [isEditMaintenanceModalOpen, setIsEditMaintenanceModalOpen] = useState(false)
  const [isViewMaintenanceModalOpen, setIsViewMaintenanceModalOpen] = useState(false)
  const [isAddRepairModalOpen, setIsAddRepairModalOpen] = useState(false)
  const [isEditRepairModalOpen, setIsEditRepairModalOpen] = useState(false)
  const [isViewRepairModalOpen, setIsViewRepairModalOpen] = useState(false)
  const [isAddInsuranceModalOpen, setIsAddInsuranceModalOpen] = useState(false)
  const [isEditInsuranceModalOpen, setIsEditInsuranceModalOpen] = useState(false)
  const [isViewInsuranceModalOpen, setIsViewInsuranceModalOpen] = useState(false)
  const [isAddRoadworthyModalOpen, setIsAddRoadworthyModalOpen] = useState(false)
  const [isEditRoadworthyModalOpen, setIsEditRoadworthyModalOpen] = useState(false)
  const [isViewRoadworthyModalOpen, setIsViewRoadworthyModalOpen] = useState(false)
  const [isAddFuelLogModalOpen, setIsAddFuelLogModalOpen] = useState(false)
  const [isEditFuelLogModalOpen, setIsEditFuelLogModalOpen] = useState(false)
  const [isViewFuelLogModalOpen, setIsViewFuelLogModalOpen] = useState(false)
  const [selectedMaintenanceRecord, setSelectedMaintenanceRecord] = useState<any>(null)
  const [selectedRepairRecord, setSelectedRepairRecord] = useState<any>(null)
  const [selectedInsuranceRecord, setSelectedInsuranceRecord] = useState<any>(null)
  const [selectedRoadworthyRecord, setSelectedRoadworthyRecord] = useState<any>(null)
  const [selectedFuelLogRecord, setSelectedFuelLogRecord] = useState<any>(null)
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([])
  const [vehicleMakes, setVehicleMakes] = useState<any[]>([])
  const [subsidiaries, setSubsidiaries] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [hoveredMaintenanceSegment, setHoveredMaintenanceSegment] = useState<{ type: string; count: number; percentage: number } | null>(null)
  const [maintenanceTooltipPosition, setMaintenanceTooltipPosition] = useState({ x: 0, y: 0 })
  const [hoveredRepairSegment, setHoveredRepairSegment] = useState<{ type: string; count: number; percentage: number } | null>(null)
  const [repairTooltipPosition, setRepairTooltipPosition] = useState({ x: 0, y: 0 })
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
  const [formData, setFormData] = useState({
    name: '',
    reg_number: '',
    vehicle_type_id: '',
    vehicle_make_id: '',
    vin_number: '',
    year: '',
    color: '',
    engine_number: '',
    chassis_number: '',
    current_region: '',
    current_district: '',
    current_mileage: '',
    last_service_date: '',
    next_service_km: '',
    status: '',
    spcode: '',
    driver_id: '',
    notes: ''
  })

  const fetchMaintenanceData = async () => {
    try {
      const response = await fetch(`/api/maintenance?vehicle_id=${params.id}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setMaintenanceData(data)
      }
    } catch (error) {
      console.error('Error fetching maintenance data:', error)
    }
  }

  const fetchRepairData = async () => {
    try {
      const response = await fetch(`/api/repairs?vehicle_id=${params.id}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setRepairData(data)
      }
    } catch (error) {
      console.error('Error fetching repair data:', error)
    }
  }

  const fetchInsuranceData = async () => {
    try {
      const response = await fetch(`/api/insurance?vehicle_id=${params.id}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setInsuranceData(data)
      }
    } catch (error) {
      console.error('Error fetching insurance data:', error)
    }
  }

  const fetchRoadworthyData = async () => {
    try {
      const response = await fetch(`/api/roadworthy?vehicle_id=${params.id}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setRoadworthyData(data)
      }
    } catch (error) {
      console.error('Error fetching roadworthy data:', error)
    }
  }

  const fetchFuelLogsData = async () => {
    try {
      const response = await fetch(`/api/fuel-logs?vehicle_id=${params.id}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setFuelLogsData(data)
      }
    } catch (error) {
      console.error('Error fetching fuel logs data:', error)
    }
  }

  const fetchSensorData = async () => {
    try {
      const response = await fetch(`/api/sensor-data?vehicle_id=${params.id}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setSensorData(data)
        // Set the latest fuel level sensor data - look for fuel-related sensors
        const fuelSensor = data.find(sensor => 
          sensor.sensor_type?.toLowerCase().includes('fuel') ||
          sensor.name?.toLowerCase().includes('fuel') ||
          sensor.sensor_type === 'Fuel Level'
        )
        
        // If no fuel sensor found, use battery as fallback for demonstration
        const fallbackSensor = fuelSensor || data.find(sensor => sensor.sensor_type === 'Battery')
        setLatestSensorData(fallbackSensor || null)
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error)
    }
  }

  const fetchTrackingData = async () => {
    try {
      const response = await fetch(`/api/positions-data?vehicle_id=${params.id}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setTrackingData(data)
        // Set the latest tracking data (most recent GPS time)
        if (data.length > 0) {
          const latest = data.reduce((latest, current) => {
            return new Date(current.gps_time_utc) > new Date(latest.gps_time_utc) ? current : latest
          })
          setLatestTrackingData(latest)
        }
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error)
    }
  }

  // Filter sensor data based on search query
  const filteredSensorData = sensorData.filter(sensor => {
    if (!sensorSearchQuery) return true
    const searchLower = sensorSearchQuery.toLowerCase()
    return (
      sensor.sensor_type?.toLowerCase().includes(searchLower) ||
      sensor.name?.toLowerCase().includes(searchLower) ||
      sensor.value !== null && sensor.value !== undefined ? 
        (typeof sensor.value === 'object' ? sensor.value.toString().toLowerCase() : sensor.value.toString().toLowerCase()).includes(searchLower) : false ||
      sensor.measurement_sign?.toLowerCase().includes(searchLower)
    )
  })

  // Filter tracking data based on search query
  const filteredTrackingData = trackingData.filter(tracking => {
    if (!trackingSearchQuery) return true
    const searchLower = trackingSearchQuery.toLowerCase()
    return (
      tracking.address?.toLowerCase().includes(searchLower) ||
      tracking.speed?.toString().toLowerCase().includes(searchLower) ||
      tracking.odometer?.toString().toLowerCase().includes(searchLower) ||
      tracking.engine_status?.toLowerCase().includes(searchLower)
    )
  })

  // Calculate pagination for sensor data
  // Apply sorting for sensor data
  const sortedSensorData = (() => {
    if (!sensorSortField) return filteredSensorData
    const dir = sensorSortDirection === 'asc' ? 1 : -1
    return [...filteredSensorData].sort((a, b) => {
      const av = a?.[sensorSortField]
      const bv = b?.[sensorSortField]
      const as = (av ?? '').toString().toLowerCase()
      const bs = (bv ?? '').toString().toLowerCase()
      if (as < bs) return -1 * dir
      if (as > bs) return 1 * dir
      return 0
    })
  })()

  const sensorTotalPages = Math.ceil(sortedSensorData.length / sensorEntriesPerPage)
  const sensorStartIndex = (sensorCurrentPage - 1) * sensorEntriesPerPage
  const sensorEndIndex = sensorStartIndex + sensorEntriesPerPage
  const paginatedSensorData = sortedSensorData.slice(sensorStartIndex, sensorEndIndex)

  // Calculate pagination for tracking data
  // Apply sorting for tracking data
  const sortedTrackingData = (() => {
    if (!trackingSortField) return filteredTrackingData
    const dir = trackingSortDirection === 'asc' ? 1 : -1
    return [...filteredTrackingData].sort((a, b) => {
      const av = a?.[trackingSortField]
      const bv = b?.[trackingSortField]
      // special mapping for nested or derived
      const as = (av ?? '').toString().toLowerCase()
      const bs = (bv ?? '').toString().toLowerCase()
      if (as < bs) return -1 * dir
      if (as > bs) return 1 * dir
      return 0
    })
  })()

  const trackingTotalPages = Math.ceil(sortedTrackingData.length / trackingEntriesPerPage)
  const trackingStartIndex = (trackingCurrentPage - 1) * trackingEntriesPerPage
  const trackingEndIndex = trackingStartIndex + trackingEntriesPerPage
  const paginatedTrackingData = sortedTrackingData.slice(trackingStartIndex, trackingEndIndex)

  // Reset sensor page when search changes
  useEffect(() => {
    setSensorCurrentPage(1)
  }, [sensorSearchQuery])

  // Reset tracking page when search changes
  useEffect(() => {
    setTrackingCurrentPage(1)
  }, [trackingSearchQuery])

  // Export functions for sensor data
  const exportSensorToExcel = () => {
    const data = paginatedSensorData.map((sensor, index) => [
      sensorStartIndex + index + 1,
      sensor.sensor_type,
      sensor.name,
      sensor.value !== null && sensor.value !== undefined ? 
        `${typeof sensor.value === 'object' ? sensor.value.toString() : sensor.value}${sensor.measurement_sign || ''}` : 'N/A',
        sensor.reading_time_local ? formatDateTime(sensor.reading_time_local) : 'N/A'
    ])
    
    const csvContent = [
      ['No', 'Sensor Type', 'Name', 'Value', 'Reading Time'],
      ...data
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `sensor-data-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportSensorToCSV = () => {
    exportSensorToExcel() // Same implementation for now
  }

  const exportSensorToPDF = () => {
    // Placeholder for PDF export
    alert('PDF export functionality will be implemented soon!')
  }

  const printSensorData = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <html>
        <head>
          <title>Sensor Data Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Sensor Data Report</h2>
          <p>Generated on: ${formatDateTime(new Date())}</p>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Sensor Type</th>
                <th>Name</th>
                <th>Value</th>
                <th>Reading Time</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedSensorData.map((sensor, index) => `
                <tr>
                  <td>${sensorStartIndex + index + 1}</td>
                  <td>${sensor.sensor_type}</td>
                  <td>${sensor.name}</td>
                  <td>${sensor.value !== null && sensor.value !== undefined ? 
                    `${typeof sensor.value === 'object' ? sensor.value.toString() : sensor.value}${sensor.measurement_sign || ''}` : 'N/A'}</td>
                  <td>${sensor.reading_time_local ? formatDateTime(sensor.reading_time_local) : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // Export functions for tracking data
  const exportTrackingToExcel = () => {
    const data = paginatedTrackingData.map((tracking, index) => [
      trackingStartIndex + index + 1,
      tracking.address,
      tracking.speed?.toString(),
      tracking.odometer?.toString(),
      tracking.engine_status,
      tracking.gps_time_utc ? formatDateTime(tracking.gps_time_utc) : 'N/A'
    ])
    
    const csvContent = [
      ['No', 'Address', 'Speed', 'Odometer', 'Engine Status', 'GPS Time'],
      ...data
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `tracking-data-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportTrackingToCSV = () => {
    exportTrackingToExcel() // Same implementation for now
  }

  const exportTrackingToPDF = () => {
    // Placeholder for PDF export
    alert('PDF export functionality will be implemented soon!')
  }

  const printTrackingData = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <html>
        <head>
          <title>Tracking Data Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Tracking Data Report</h2>
          <p>Generated on: ${formatDateTime(new Date())}</p>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Address</th>
                <th>Speed</th>
                <th>Odometer</th>
                <th>Engine Status</th>
                <th>GPS Time</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedTrackingData.map((tracking, index) => `
                <tr>
                  <td>${trackingStartIndex + index + 1}</td>
                  <td>${tracking.address}</td>
                  <td>${tracking.speed?.toString() || '0'}</td>
                  <td>${tracking.odometer?.toString() || '0'}</td>
                  <td>${tracking.engine_status}</td>
                  <td>${tracking.gps_time_utc ? formatDateTime(tracking.gps_time_utc) : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/vehicles/${params.id}`, {
          headers: getAuthHeaders()
        })
        if (response.ok) {
          const data = await response.json()
          setVehicle(data)
        } else {
          router.push('/vehicles')
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error)
        router.push('/vehicles')
      } finally {
        setLoading(false)
      }
    }

    const fetchDropdownData = async () => {
      try {
        // Fetch vehicle types
        const typesResponse = await fetch('/api/vehicle-types', {
          headers: getAuthHeaders()
        })
        if (typesResponse.ok) {
          const typesData = await typesResponse.json()
          setVehicleTypes(typesData)
        }

        // Fetch vehicle makes
        const makesResponse = await fetch('/api/vehicle-makes', {
          headers: getAuthHeaders()
        })
        if (makesResponse.ok) {
          const makesData = await makesResponse.json()
          setVehicleMakes(makesData)
        }

        // Fetch subsidiaries
        const subsidiariesResponse = await fetch('/api/subsidiary', {
          headers: getAuthHeaders()
        })
        if (subsidiariesResponse.ok) {
          const subsidiariesData = await subsidiariesResponse.json()
          setSubsidiaries(subsidiariesData)
        }

        // Fetch drivers
        const driversResponse = await fetch('/api/drivers', {
          headers: getAuthHeaders()
        })
        if (driversResponse.ok) {
          const driversData = await driversResponse.json()
          setDrivers(driversData)
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
      }
    }

    if (params.id) {
      fetchVehicle()
      fetchDropdownData()
      fetchTrackingData()
      fetchSensorData()
    }
  }, [params.id, router])

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName)
    if (buttonName === 'Maintenance') {
      fetchMaintenanceData()
    } else if (buttonName === 'Repairs') {
      fetchRepairData()
    } else if (buttonName === 'Insurance') {
      fetchInsuranceData()
    } else if (buttonName === 'Roadworthy') {
      fetchRoadworthyData()
    } else if (buttonName === 'Fuel Logs') {
      fetchFuelLogsData()
    } else if (buttonName === 'Sensor') {
      fetchSensorData()
    } else if (buttonName === 'Tracking') {
      fetchTrackingData()
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    if (vehicle) {
      setFormData({
        name: vehicle.reg_number || '',
        reg_number: vehicle.reg_number || '',
        vehicle_type_id: vehicle.type_id?.toString() || '',
        vehicle_make_id: vehicle.make_id?.toString() || '',
        vin_number: vehicle.vin_number || '',
        year: vehicle.year?.toString() || '',
        color: vehicle.color || '',
        engine_number: vehicle.engine_number || '',
        chassis_number: vehicle.chassis_number || '',
        current_region: vehicle.current_region || '',
        current_district: vehicle.current_district || '',
        current_mileage: vehicle.current_mileage?.toString() || '',
        last_service_date: vehicle.last_service_date ? new Date(vehicle.last_service_date).toISOString().split('T')[0] : '',
        next_service_km: vehicle.next_service_km?.toString() || '',
        status: vehicle.status || '',
        spcode: vehicle.spcode?.toString() || '',
        driver_id: vehicle.driver_operators?.[0]?.id?.toString() || '',
        notes: vehicle.notes || ''
      })
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/vehicles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedVehicle = await response.json()
        setVehicle(updatedVehicle)
        setIsEditing(false)
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Vehicle updated successfully!'
        })
      } else {
        const errorData = await response.json()
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: errorData.error || 'Failed to update vehicle'
        })
      }
    } catch (error) {
      console.error('Error updating vehicle:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error updating vehicle'
      })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (vehicle) {
      setFormData({
        name: vehicle.reg_number || '',
        reg_number: vehicle.reg_number || '',
        vehicle_type_id: vehicle.type_id?.toString() || '',
        vehicle_make_id: vehicle.make_id?.toString() || '',
        vin_number: vehicle.vin_number || '',
        year: vehicle.year?.toString() || '',
        color: vehicle.color || '',
        engine_number: vehicle.engine_number || '',
        chassis_number: vehicle.chassis_number || '',
        current_region: vehicle.current_region || '',
        current_district: vehicle.current_district || '',
        current_mileage: vehicle.current_mileage?.toString() || '',
        last_service_date: vehicle.last_service_date ? new Date(vehicle.last_service_date).toISOString().split('T')[0] : '',
        next_service_km: vehicle.next_service_km?.toString() || '',
        status: vehicle.status || '',
        spcode: vehicle.spcode?.toString() || '',
        driver_id: vehicle.driver_operators?.[0]?.id?.toString() || '',
        notes: vehicle.notes || ''
      })
    }
  }

  const handleAddMaintenance = () => {
    setIsAddMaintenanceModalOpen(true)
  }

  const handleMaintenanceSubmit = async (maintenanceData: any) => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          ...maintenanceData,
          vehicle_id: vehicle?.id
        }),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Maintenance record added successfully'
        })
        setIsAddMaintenanceModalOpen(false)
        // Refresh maintenance data
        if (activeButton === 'Maintenance') {
          fetchMaintenanceData()
        }
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to add maintenance record'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to add maintenance record'
      })
    }
  }

  const handleEditMaintenance = (maintenanceRecord: any) => {
    setSelectedMaintenanceRecord(maintenanceRecord)
    setIsEditMaintenanceModalOpen(true)
  }

  const handleViewMaintenance = (maintenanceRecord: any) => {
    setSelectedMaintenanceRecord(maintenanceRecord)
    setIsViewMaintenanceModalOpen(true)
  }

  const handleMaintenanceUpdate = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/maintenance?id=${selectedMaintenanceRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Maintenance record updated successfully'
        })
        setIsEditMaintenanceModalOpen(false)
        setSelectedMaintenanceRecord(null)
        // Refresh maintenance data
        if (activeButton === 'Maintenance') {
          fetchMaintenanceData()
        }
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to update maintenance record'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update maintenance record'
      })
    }
  }

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        const response = await fetch(`/api/maintenance?id=${maintenanceId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Maintenance record deleted successfully'
          })
          // Refresh maintenance data
          if (activeButton === 'Maintenance') {
            fetchMaintenanceData()
          }
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete maintenance record'
          })
        }
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to delete maintenance record'
        })
      }
    }
  }

  // Repair handlers
  const handleAddRepair = () => {
    setIsAddRepairModalOpen(true)
  }

  const handleRepairSubmit = async (repairData: any) => {
    try {
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          ...repairData,
          vehicle_id: vehicle?.id
        }),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Repair record added successfully'
        })
        setIsAddRepairModalOpen(false)
        // Refresh repair data
        if (activeButton === 'Repairs') {
          fetchRepairData()
        }
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to add repair record'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to add repair record'
      })
    }
  }

  const handleEditRepair = (repairRecord: any) => {
    setSelectedRepairRecord(repairRecord)
    setIsEditRepairModalOpen(true)
  }

  const handleViewRepair = (repairRecord: any) => {
    setSelectedRepairRecord(repairRecord)
    setIsViewRepairModalOpen(true)
  }

  const handleRepairUpdate = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/repairs?id=${selectedRepairRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Repair record updated successfully'
        })
        setIsEditRepairModalOpen(false)
        setSelectedRepairRecord(null)
        // Refresh repair data
        if (activeButton === 'Repairs') {
          fetchRepairData()
        }
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to update repair record'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update repair record'
      })
    }
  }

  const handleDeleteRepair = async (repairId: string) => {
    if (window.confirm('Are you sure you want to delete this repair record?')) {
      try {
        const response = await fetch(`/api/repairs?id=${repairId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Repair record deleted successfully'
          })
          // Refresh repair data
          if (activeButton === 'Repairs') {
            fetchRepairData()
          }
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete repair record'
          })
        }
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to delete repair record'
        })
      }
    }
  }

  // Insurance handlers
  const handleAddInsurance = () => {
    setIsAddInsuranceModalOpen(true)
  }

  const handleInsuranceSubmit = async (insuranceData: any) => {
    try {
      const response = await fetch('/api/insurance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          ...insuranceData,
          vehicle_id: vehicle?.id
        }),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Insurance record added successfully'
        })
        setIsAddInsuranceModalOpen(false)
        // Refresh insurance data
        if (activeButton === 'Insurance') {
          fetchInsuranceData()
        }
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to add insurance record'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to add insurance record'
      })
    }
  }

  const handleEditInsurance = (insuranceRecord: any) => {
    setSelectedInsuranceRecord(insuranceRecord)
    setIsEditInsuranceModalOpen(true)
  }

  const handleViewInsurance = (insuranceRecord: any) => {
    setSelectedInsuranceRecord(insuranceRecord)
    setIsViewInsuranceModalOpen(true)
  }

  const handleInsuranceUpdate = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/insurance?id=${selectedInsuranceRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Insurance record updated successfully'
        })
        setIsEditInsuranceModalOpen(false)
        setSelectedInsuranceRecord(null)
        // Refresh insurance data
        if (activeButton === 'Insurance') {
          fetchInsuranceData()
        }
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to update insurance record'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update insurance record'
      })
    }
  }

  const handleDeleteInsurance = async (insuranceId: string) => {
    if (window.confirm('Are you sure you want to delete this insurance record?')) {
      try {
        const response = await fetch(`/api/insurance?id=${insuranceId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Insurance record deleted successfully'
          })
          // Refresh insurance data
          if (activeButton === 'Insurance') {
            fetchInsuranceData()
          }
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete insurance record'
          })
        }
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to delete insurance record'
        })
      }
    }
  }

  // Roadworthy handlers
  const handleAddRoadworthy = () => {
    setIsAddRoadworthyModalOpen(true)
  }

  const handleRoadworthySubmit = async (roadworthyData: any) => {
    try {
      const response = await fetch('/api/roadworthy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          ...roadworthyData,
          vehicle_number: vehicle?.id,
          updated_by: roadworthyData.updated_by || 1
        }),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Roadworthy record added successfully'
        })
        setIsAddRoadworthyModalOpen(false)
        // Refresh roadworthy data
        if (activeButton === 'Roadworthy') {
          fetchRoadworthyData()
        }
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to add roadworthy record'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to add roadworthy record'
      })
    }
  }

  const handleEditRoadworthy = (roadworthyRecord: any) => {
    setSelectedRoadworthyRecord(roadworthyRecord)
    setIsEditRoadworthyModalOpen(true)
  }

  const handleViewRoadworthy = (roadworthyRecord: any) => {
    setSelectedRoadworthyRecord(roadworthyRecord)
    setIsViewRoadworthyModalOpen(true)
  }

  const handleRoadworthyUpdate = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/roadworthy?id=${selectedRoadworthyRecord.id}&vehicle_number=${selectedRoadworthyRecord.vehicle_number}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Roadworthy record updated successfully'
        })
        setIsEditRoadworthyModalOpen(false)
        setSelectedRoadworthyRecord(null)
        // Refresh roadworthy data
        if (activeButton === 'Roadworthy') {
          fetchRoadworthyData()
        }
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to update roadworthy record'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update roadworthy record'
      })
    }
  }

  const handleDeleteRoadworthy = async (roadworthyId: string, vehicleNumber: string) => {
    if (window.confirm('Are you sure you want to delete this roadworthy record?')) {
      try {
        const response = await fetch(`/api/roadworthy?id=${roadworthyId}&vehicle_number=${vehicleNumber}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Roadworthy record deleted successfully'
          })
          // Refresh roadworthy data
          if (activeButton === 'Roadworthy') {
            fetchRoadworthyData()
          }
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete roadworthy record'
          })
        }
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to delete roadworthy record'
        })
      }
    }
  }

  // Fuel Logs handlers
  const handleAddFuelLog = () => {
    setIsAddFuelLogModalOpen(true)
  }

  const handleFuelLogSubmit = async (fuelLogData: any) => {
    try {
      const response = await fetch('/api/fuel-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          ...fuelLogData,
          vehicle_id: vehicle?.id,
          driver_id: fuelLogData.driver_id || 1
        }),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Fuel log added successfully'
        })
        setIsAddFuelLogModalOpen(false)
        // Refresh fuel logs data
        if (activeButton === 'Fuel Logs') {
          fetchFuelLogsData()
        }
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to add fuel log'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to add fuel log'
      })
    }
  }

  const handleEditFuelLog = (fuelLogRecord: any) => {
    setSelectedFuelLogRecord(fuelLogRecord)
    setIsEditFuelLogModalOpen(true)
  }

  const handleViewFuelLog = (fuelLogRecord: any) => {
    setSelectedFuelLogRecord(fuelLogRecord)
    setIsViewFuelLogModalOpen(true)
  }

  const handleFuelLogUpdate = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/fuel-logs?id=${selectedFuelLogRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Fuel log updated successfully'
        })
        setIsEditFuelLogModalOpen(false)
        setSelectedFuelLogRecord(null)
        // Refresh fuel logs data
        if (activeButton === 'Fuel Logs') {
          fetchFuelLogsData()
        }
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to update fuel log'
        })
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update fuel log'
      })
    }
  }

  const handleDeleteFuelLog = async (fuelLogId: string) => {
    if (window.confirm('Are you sure you want to delete this fuel log?')) {
      try {
        const response = await fetch(`/api/fuel-logs?id=${fuelLogId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        if (response.ok) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Fuel log deleted successfully'
          })
          // Refresh fuel logs data
          if (activeButton === 'Fuel Logs') {
            fetchFuelLogsData()
          }
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete fuel log'
          })
        }
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to delete fuel log'
        })
      }
    }
  }

  // Export functionality
  const handleExport = async (section: string, format: string) => {
    try {
      let data: any[] = []
      let filename = ''
      
      switch (section) {
        case 'maintenance':
          data = maintenanceData
          filename = `maintenance-data-${vehicle?.reg_number || 'vehicle'}`
          break
        case 'repairs':
          data = repairData
          filename = `repairs-data-${vehicle?.reg_number || 'vehicle'}`
          break
        case 'insurance':
          data = insuranceData
          filename = `insurance-data-${vehicle?.reg_number || 'vehicle'}`
          break
        case 'roadworthy':
          data = roadworthyData
          filename = `roadworthy-data-${vehicle?.reg_number || 'vehicle'}`
          break
        case 'fuel-logs':
          data = fuelLogsData
          filename = `fuel-logs-data-${vehicle?.reg_number || 'vehicle'}`
          break
        default:
          return
      }

      if (data.length === 0) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'No Data',
          message: 'No data available to export'
        })
        return
      }

      switch (format) {
        case 'excel':
          await exportToExcel(data, filename)
          break
        case 'csv':
          await exportToCSV(data, filename)
          break
        case 'pdf':
          await exportToPDF(data, filename)
          break
        case 'print':
          await printData(data, section)
          break
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Export Error',
        message: 'Failed to export data'
      })
    }
  }

  // Export functions
  const exportToExcel = async (data: any[], filename: string) => {
    const XLSX = await import('xlsx')
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  const exportToCSV = async (data: any[], filename: string) => {
    const XLSX = await import('xlsx')
    const worksheet = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = async (data: any[], filename: string) => {
    const { jsPDF } = await import('jspdf')
    const autoTable = await import('jspdf-autotable')
    
    const doc = new jsPDF()
    const tableData = data.map(item => Object.values(item))
    const headers = data.length > 0 ? Object.keys(data[0]) : []
    
    autoTable.default(doc, {
      head: [headers],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    })
    
    doc.save(`${filename}.pdf`)
  }

  const printData = async (data: any[], section: string) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const tableHtml = `
      <html>
        <head>
          <title>${section.charAt(0).toUpperCase() + section.slice(1)} Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>${section.charAt(0).toUpperCase() + section.slice(1)} Report</h1>
          <p>Vehicle: ${vehicle?.reg_number || 'N/A'}</p>
          <p>Generated: ${formatDateTime(new Date())}</p>
          <table>
            <thead>
              <tr>
                ${data.length > 0 ? Object.keys(data[0]).map(key => `<th>${key}</th>`).join('') : ''}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => 
                `<tr>${Object.values(row).map(value => `<td>${value || ''}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(tableHtml)
    printWindow.document.close()
    printWindow.print()
  }

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    
    if (printWindow) {
      const vehicleData = vehicle || {}
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Vehicle Profile - ${vehicleData.reg_number || 'N/A'}</title>
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
              .print-vehicle-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 20px;
              }
              .print-vehicle-info {
                display: flex;
                align-items: center;
                gap: 20px;
              }
              .print-vehicle-avatar {
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
              .print-vehicle-details {
                flex: 1;
              }
              .print-vehicle-id {
                font-size: 20px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 12px;
              }
              .print-vehicle-tags {
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
              .print-vehicle-meta {
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
              <div class="print-title">Vehicle Profile</div>
              <div class="print-subtitle">Registration: ${vehicleData.reg_number || 'N/A'}</div>
            </div>
            
            <!-- Vehicle Header Card -->
            <div class="print-vehicle-card">
              <div class="print-vehicle-info">
                <div class="print-vehicle-avatar">
                  <div class="print-avatar-placeholder">🚗</div>
                </div>
                <div class="print-vehicle-details">
                  <div class="print-vehicle-id">${vehicleData.reg_number || 'N/A'}</div>
                  <div class="print-vehicle-tags">
                    <span class="print-tag print-tag-green">ID ${vehicleData.id || 'N/A'}</span>
                    <span class="print-tag print-tag-gray">${vehicleData.status || 'active'}</span>
                    <span class="print-tag print-tag-blue">📞 ${vehicleData.reg_number || 'N/A'}</span>
                    <span class="print-tag print-tag-blue">📍 Fleet</span>
                    <span class="print-tag print-tag-blue">📅 ${formatDateTime(new Date())}</span>
                  </div>
                  <div class="print-vehicle-meta">
                    <div>Last Updated: ${formatDateTime(new Date())}</div>
                    <div>Driver: ${vehicleData.driver || 'Unassigned'}</div>
                  </div>
                </div>
                <div class="print-qr-section">
                  <div class="print-qr-code">QR Code</div>
                </div>
              </div>
            </div>
            
            <div class="print-content">
              <div class="print-section-title">Vehicle Information</div>
              <div class="print-grid">
                <div class="print-field">
                  <div class="print-label">Vehicle Type</div>
                  <div class="print-value">${vehicleData.vehicle_types?.type || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Vehicle Make</div>
                  <div class="print-value">${vehicleData.vehicle_makes?.name || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Registration Number</div>
                  <div class="print-value">${vehicleData.reg_number || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">VIN Number</div>
                  <div class="print-value">${vehicleData.vin_number || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Year</div>
                  <div class="print-value">${vehicleData.year || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Color</div>
                  <div class="print-value">${vehicleData.color || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Engine Number</div>
                  <div class="print-value">${vehicleData.engine_number || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Chassis Number</div>
                  <div class="print-value">${vehicleData.chassis_number || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Current Region</div>
                  <div class="print-value">${vehicleData.current_region || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Current District</div>
                  <div class="print-value">${vehicleData.current_district || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Current Mileage</div>
                  <div class="print-value">${vehicleData.current_mileage || '0'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Last Service Date</div>
                  <div class="print-value">${vehicleData.last_service_date ? formatDateTime(vehicleData.last_service_date) : 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Next Service KM</div>
                  <div class="print-value">${vehicleData.next_service_km || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Status</div>
                  <div class="print-value">${vehicleData.status || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Subsidiary</div>
                  <div class="print-value">${vehicleData.subsidiary?.name || 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Assigned Driver</div>
                  <div class="print-value">${vehicleData.driver_operators?.[0]?.name || 'Unassigned'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Notes</div>
                  <div class="print-value">${vehicleData.notes || 'No notes'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Created At</div>
                  <div class="print-value">${vehicleData.created_at ? formatDateTime(vehicleData.created_at) : 'Not specified'}</div>
                </div>
                <div class="print-field">
                  <div class="print-label">Updated At</div>
                  <div class="print-value">${vehicleData.updated_at ? formatDateTime(vehicleData.updated_at) : 'Not specified'}</div>
                </div>
              </div>
            </div>
            <div class="print-footer">
              Generated on ${formatDateTime(new Date())}
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
    if (confirm('Are you sure you want to deactivate this vehicle?')) {
      try {
        const response = await fetch(`/api/vehicles/${params.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ status: 'Inactive' }),
        })

        if (response.ok) {
          const updatedVehicle = await response.json()
          setVehicle(updatedVehicle)
          setFormData(prev => ({ ...prev, status: 'Inactive' }))
        } else {
          alert('Failed to deactivate vehicle')
        }
      } catch (error) {
        console.error('Error deactivating vehicle:', error)
        alert('Error deactivating vehicle')
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

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Vehicle not found</div>
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
          {/* Left Section - Vehicle Avatar */}
          <div className="flex-shrink-0 mr-8">
            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-lg">
              <img 
                src="/vehicle-avatar.png" 
                alt="Vehicle" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling.style.display = 'flex'
                }}
              />
              <div className="w-full h-full flex items-center justify-center" style={{display: 'none'}}>
                <TruckIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </div>
          
          {/* Center Section - Vehicle Details */}
          <div className="flex-1 min-w-0">
            {/* First Row - Key Information */}
            <div className="flex flex-wrap gap-6 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center" title="Registration Number">
                  <TruckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-bold ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {vehicle.reg_number || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-start space-x-3 w-full max-w-md">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center flex-shrink-0 mt-0.5" title="Address">
                  <MapPinIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'} break-words leading-relaxed min-w-0 flex-1`}>
                  {latestTrackingData?.address || 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Second Row - GPS Time, Speed, Odometer, Fuel Level */}
            <div className="flex flex-wrap gap-6 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center" title="GPS Time">
                  <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {latestTrackingData?.gps_time_utc ? formatDateTime(latestTrackingData.gps_time_utc) : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center" title="Speed">
                  <CpuChipIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {latestTrackingData?.speed ? `${latestTrackingData.speed} km/h` : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center" title="Odometer">
                  <TruckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {latestTrackingData?.odometer ? `${latestTrackingData.odometer} km` : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center" title={latestSensorData?.sensor_type === 'Battery' ? 'Battery Level' : 'Fuel Level'}>
                  <BeakerIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {latestSensorData?.value ? `${latestSensorData.value}${latestSensorData.measurement_sign || '%'}` : 'No Data'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center" title="Assigned Driver">
                  <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {vehicle.driver || 'Unassigned'}
                </span>
              </div>
            </div>
            
          </div>
          
          {/* Right Section - Active Status */}
          <div className="flex flex-col items-center space-y-6 ml-8">
            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                vehicle.status === 'Active' ? 'bg-green-500' : 
                vehicle.status === 'Inactive' ? 'bg-red-500' : 
                'bg-gray-400'
              }`}></div>
              <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {vehicle.status?.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <button 
            onClick={() => handleButtonClick('Profile')}
            className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
              activeButton === 'Profile'
                ? 'bg-gray-600 text-white'
                : themeMode === 'dark' 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            <TruckIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Profile</span>
          </button>
          
          <button 
            onClick={() => handleButtonClick('Maintenance')}
            className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
              activeButton === 'Maintenance'
                ? 'bg-gray-600 text-white'
                : themeMode === 'dark' 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            <WrenchScrewdriverIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Maintenance</span>
          </button>
          
          <button 
            onClick={() => handleButtonClick('Repairs')}
            className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
              activeButton === 'Repairs'
                ? 'bg-gray-600 text-white'
                : themeMode === 'dark' 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            <WrenchIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Repairs</span>
          </button>
          
          <button 
            onClick={() => handleButtonClick('Fuel Logs')}
            className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
              activeButton === 'Fuel Logs'
                ? 'bg-gray-600 text-white'
                : themeMode === 'dark' 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            <BeakerIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Fuel Logs</span>
          </button>
          
          <button 
            onClick={() => handleButtonClick('Insurance')}
            className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
              activeButton === 'Insurance'
                ? 'bg-gray-600 text-white'
                : themeMode === 'dark' 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            <ShieldCheckIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Insurance</span>
          </button>
          
          <button 
            onClick={() => handleButtonClick('Roadworthy')}
            className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
              activeButton === 'Roadworthy'
                ? 'bg-gray-600 text-white'
                : themeMode === 'dark' 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            <DocumentCheckIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Roadworthy</span>
          </button>
          
          <button 
            onClick={() => handleButtonClick('Sensor')}
            className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
              activeButton === 'Sensor'
                ? 'bg-gray-600 text-white'
                : themeMode === 'dark' 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            <CpuChipIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Sensor</span>
          </button>
          
          <button 
            onClick={() => handleButtonClick('Tracking')}
            className={`p-2 rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 ${
              activeButton === 'Tracking'
                ? 'bg-gray-600 text-white'
                : themeMode === 'dark' 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            <TrackingIcon className="w-5 h-5" />
            <span className="text-sm font-normal">Tracking</span>
          </button>
        </div>
      </div>

      {/* Vehicle Profile Form */}
      <div className={`p-6 rounded-2xl ${themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between mb-6 p-4 rounded-xl ${themeMode === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
          <h2 className={`text-xl font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {activeButton === 'Maintenance' ? 'Vehicle Maintenance' : 
             activeButton === 'Repairs' ? 'Vehicle Repairs' :
             activeButton === 'Fuel Logs' ? 'Vehicle Fuel Logs' :
             activeButton === 'Insurance' ? 'Vehicle Insurance' :
             activeButton === 'Roadworthy' ? 'Vehicle Roadworthy' :
             activeButton === 'Sensor' ? 'Vehicle Sensors' :
             activeButton === 'Tracking' ? 'Vehicle Tracking' :
             'Vehicle Profile'}
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
        {activeButton === 'Profile' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
          {/* Vehicle Type */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Vehicle Type
            </label>
            {isEditing ? (
              <select
                value={formData.vehicle_type_id}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicle_type_id: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              >
                <option value="">-- Select Vehicle Type --</option>
                {vehicleTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.type}
                  </option>
                ))}
              </select>
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {vehicle?.vehicle_types?.type || 'Not specified'}
              </div>
            )}
          </div>

          {/* Vehicle Make */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Vehicle Make
            </label>
            {isEditing ? (
              <select
                value={formData.vehicle_make_id}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicle_make_id: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              >
                <option value="">-- Select Vehicle Make --</option>
                {vehicleMakes.map(make => (
                  <option key={make.id} value={make.id}>
                    {make.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {vehicle?.vehicle_makes?.name || 'Not specified'}
              </div>
            )}
          </div>

          {/* Registration Number */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Registration Number
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.reg_number}
                onChange={(e) => setFormData(prev => ({ ...prev, reg_number: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {vehicle?.reg_number || 'Not specified'}
              </div>
            )}
          </div>

          {/* VIN Number */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              VIN Number
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.vin_number}
                onChange={(e) => setFormData(prev => ({ ...prev, vin_number: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {vehicle?.vin_number || 'Not specified'}
              </div>
            )}
          </div>

          {/* Year */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Year
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {vehicle?.year || 'Not specified'}
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Color
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {vehicle?.color || 'Not specified'}
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
                <option value="Maintenance">Maintenance</option>
                <option value="Repair">Repair</option>
              </select>
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {vehicle?.status || 'Not specified'}
              </div>
            )}
          </div>

          {/* Subsidiary */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Subsidiary
            </label>
            {isEditing ? (
              <select
                value={formData.spcode}
                onChange={(e) => setFormData(prev => ({ ...prev, spcode: e.target.value }))}
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
                {vehicle?.subsidiary?.name || 'Not specified'}
              </div>
            )}
          </div>

          {/* Assigned Driver */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Assigned Driver
            </label>
            {isEditing ? (
              <select
                value={formData.driver_id}
                onChange={(e) => setFormData(prev => ({ ...prev, driver_id: e.target.value }))}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              >
                <option value="">-- Select Driver --</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.license_number}
                  </option>
                ))}
              </select>
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {vehicle?.driver_operators?.[0]?.name || 'Unassigned'}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="col-span-4">
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Notes
            </label>
            {isEditing ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className={`w-full p-3 rounded-2xl border ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            ) : (
              <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {vehicle?.notes || 'No notes'}
              </div>
            )}
          </div>

          {/* Created At */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Created At
            </label>
            <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {vehicle?.created_at ? formatDateTime(vehicle.created_at) : 'Not specified'}
            </div>
          </div>

          {/* Updated At */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              Updated At
            </label>
            <div className={`p-3 rounded-2xl ${themeMode === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {vehicle?.updated_at ? formatDateTime(vehicle.updated_at) : 'Not specified'}
            </div>
          </div>
        </div>
        ) : activeButton === 'Maintenance' ? (
          <div className="p-6">
            {/* Top Header Buttons */}
            <div className="flex items-center justify-between mb-6">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors">
                MAINTENANCE SCHEDULE
              </button>
              <button onClick={handleAddMaintenance} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-3xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ADD MAINTENANCE
              </button>
            </div>

            {/* Table Header Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Entries Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <select className="px-3 py-1 text-sm border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
                
                {/* Export Controls */}
                <div className="flex items-center gap-2">
             <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
               SELECT COLUMNS ({maintenanceData.length})
             </button>
             <button onClick={() => handleExport('maintenance', 'excel')} className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                 <line x1="3" y1="9" x2="21" y2="9"></line>
                 <line x1="3" y1="15" x2="21" y2="15"></line>
                 <line x1="9" y1="3" x2="9" y2="21"></line>
                 <line x1="15" y1="3" x2="15" y2="21"></line>
               </svg>
               EXCEL
             </button>
             <button onClick={() => handleExport('maintenance', 'csv')} className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                 <polyline points="14 2 14 8 20 8"></polyline>
                 <line x1="16" y1="13" x2="8" y2="13"></line>
                 <line x1="16" y1="17" x2="8" y2="17"></line>
                 <line x1="10" y1="9" x2="8" y2="9"></line>
               </svg>
               CSV
             </button>
             <button onClick={() => handleExport('maintenance', 'pdf')} className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                 <polyline points="14 2 14 8 20 8"></polyline>
                 <path d="M12 17V9"></path>
                 <path d="m8 13 4 4 4-4"></path>
               </svg>
               PDF
             </button>
             <button onClick={() => handleExport('maintenance', 'print')} className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
               </svg>
               PRINT
             </button>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Search:</span>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search maintenance records.."
                    className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-500">
                      <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          ACTIONS
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          NO
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          SERVICE DATE
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          VEHICLE
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          SERVICE TYPE
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          COST (¢)
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          STATUS
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          MILEAGE (KM)
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          MECHANIC
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          WORKSHOP
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {maintenanceData.length > 0 ? (
                      maintenanceData.map((maintenance, index) => (
                        <tr key={maintenance.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleViewMaintenance(maintenance)} 
                                className="text-blue-600 hover:text-blue-900 transition-colors" 
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleEditMaintenance(maintenance)} 
                                className="text-green-600 hover:text-green-900 transition-colors" 
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteMaintenance(maintenance.id)} 
                                className="text-red-600 hover:text-red-900 transition-colors" 
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {maintenance.service_date ? formatDateTime(maintenance.service_date) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vehicle?.reg_number || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {maintenance.service_type || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {maintenance.cost ? `₵${maintenance.cost}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              maintenance.status === 'Completed' 
                                ? 'bg-green-100 text-green-800' 
                                : maintenance.status === 'In Progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : maintenance.status === 'Pending'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {maintenance.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {maintenance.mileage_at_service || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {maintenance.mechanic_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {maintenance.workshop_name || 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                          No maintenance records found for this vehicle.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing 1 to {maintenanceData.length} of {maintenanceData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  disabled
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
                >
                  Prev
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-full">
                  1
                </button>
                <button 
                  disabled
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Line Graph - Maintenance Cost Over Time */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Maintenance Cost Trend</h3>
                <div className="h-64">
                  <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Chart area */}
                    <rect x="40" y="20" width="320" height="160" fill="none" stroke="#d1d5db" strokeWidth="1"/>
                    
                    {/* Y-axis labels */}
                    {(() => {
                      const maxCost = Math.max(...maintenanceData.map(m => parseFloat(m.cost) || 0))
                      const minCost = Math.min(...maintenanceData.map(m => parseFloat(m.cost) || 0))
                      const range = maxCost - minCost || 1
                      const step = range / 4
                      
                      return Array.from({length: 5}, (_, i) => {
                        const value = minCost + (step * i)
                        const y = 180 - (i * 40)
                        return (
                          <g key={i}>
                            <text x="35" y={y + 5} textAnchor="end" className="text-xs fill-gray-600 dark:fill-gray-400">
                              ₵{value.toFixed(0)}
                            </text>
                            <line x1="40" y1={y} x2="360" y2={y} stroke="#e5e7eb" strokeWidth="0.5"/>
                          </g>
                        )
                      })
                    })()}
                    
                    {/* X-axis labels */}
                    {maintenanceData.slice(0, 8).map((maintenance, index) => {
                      const x = 40 + (index * 40)
                      const date = new Date(maintenance.service_date)
                      return (
                        <g key={index}>
                          <text x={x} y="195" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">
                            {date.getMonth() + 1}/{date.getDate()}
                          </text>
                          <line x1={x} y1="20" x2={x} y2="180" stroke="#e5e7eb" strokeWidth="0.5"/>
                        </g>
                      )
                    })}
                    
                    {/* Line chart */}
                    {(() => {
                      if (maintenanceData.length === 0) return null
                      
                      const maxCost = Math.max(...maintenanceData.map(m => parseFloat(m.cost) || 0))
                      const minCost = Math.min(...maintenanceData.map(m => parseFloat(m.cost) || 0))
                      const range = maxCost - minCost || 1
                      
                      const points = maintenanceData.slice(0, 8).map((maintenance, index) => {
                        const x = 40 + (index * 40)
                        const cost = parseFloat(maintenance.cost) || 0
                        const y = 180 - ((cost - minCost) / range) * 160
                        return `${x},${y}`
                      }).join(' ')
                      
                      return (
                        <g>
                          <polyline
                            points={points}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />
                          {maintenanceData.slice(0, 8).map((maintenance, index) => {
                            const x = 40 + (index * 40)
                            const cost = parseFloat(maintenance.cost) || 0
                            const y = 180 - ((cost - minCost) / range) * 160
                            return (
                              <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#3b82f6"
                                stroke="white"
                                strokeWidth="2"
                              />
                            )
                          })}
                        </g>
                      )
                    })()}
                  </svg>
                </div>
              </div>

              {/* Modern Donut Chart - Maintenance Status Distribution */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Maintenance Status Distribution</h3>
                <div className="h-80 flex flex-col items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible mb-4 drop-shadow-lg">
                    <defs>
                      {/* Gradient definitions */}
                      <linearGradient id="completedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="pendingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                      <linearGradient id="inProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <linearGradient id="cancelledGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient id="scheduledGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                    
                    {(() => {
                      if (maintenanceData.length === 0) {
                        return (
                          <g>
                            <circle cx="100" cy="100" r="60" fill="white" />
                            <circle cx="100" cy="100" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                            <text x="100" y="100" textAnchor="middle" className="text-sm fill-gray-500">
                              No data available
                            </text>
                          </g>
                        )
                      }
                      
                      // Calculate status distribution
                      const statusCounts = maintenanceData.reduce((acc, maintenance) => {
                        const status = maintenance.status || 'unknown'
                        acc[status] = (acc[status] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                      
                      const statuses = Object.keys(statusCounts)
                      const total = maintenanceData.length
                      let currentAngle = 0
                      const innerRadius = 50
                      const outerRadius = 80
                      const centerX = 100
                      const centerY = 100
                      
                      return (
                        <g>
                          {statuses.map((status, index) => {
                            const count = statusCounts[status]
                            const percentage = (count / total) * 100
                            const angle = (count / total) * 360
                            
                            const startAngle = currentAngle
                            const endAngle = currentAngle + angle
                            
                            const startAngleRad = (startAngle - 90) * (Math.PI / 180)
                            const endAngleRad = (endAngle - 90) * (Math.PI / 180)
                            
                            // Outer arc coordinates
                            const x1 = centerX + outerRadius * Math.cos(startAngleRad)
                            const y1 = centerY + outerRadius * Math.sin(startAngleRad)
                            const x2 = centerX + outerRadius * Math.cos(endAngleRad)
                            const y2 = centerY + outerRadius * Math.sin(endAngleRad)
                            
                            // Inner arc coordinates
                            const x3 = centerX + innerRadius * Math.cos(endAngleRad)
                            const y3 = centerY + innerRadius * Math.sin(endAngleRad)
                            const x4 = centerX + innerRadius * Math.cos(startAngleRad)
                            const y4 = centerY + innerRadius * Math.sin(startAngleRad)
                            
                            const largeArcFlag = angle > 180 ? 1 : 0
                            
                            const pathData = [
                              `M ${x1} ${y1}`,
                              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              `L ${x3} ${y3}`,
                              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                              `Z`
                            ].join(' ')
                            
                            // Get gradient ID based on status
                            const getGradientId = (status: string) => {
                              switch (status.toLowerCase()) {
                                case 'completed': return 'url(#completedGradient)'
                                case 'pending': return 'url(#pendingGradient)'
                                case 'in_progress': return 'url(#inProgressGradient)'
                                case 'cancelled': return 'url(#cancelledGradient)'
                                case 'scheduled': return 'url(#scheduledGradient)'
                                default: return 'url(#pendingGradient)'
                              }
                            }
                            
                            currentAngle += angle
                            
                            return (
                              <path
                                key={status}
                                d={pathData}
                                fill={getGradientId(status)}
                                stroke="white"
                                strokeWidth="1"
                                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect()
                                  const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect()
                                  if (svgRect) {
                                    setMaintenanceTooltipPosition({
                                      x: rect.left - svgRect.left + rect.width / 2,
                                      y: rect.top - svgRect.top - 10
                                    })
                                    setHoveredMaintenanceSegment({
                                      type: status,
                                      count: statusCounts[status],
                                      percentage: percentage
                                    })
                                  }
                                }}
                                onMouseLeave={() => {
                                  setHoveredMaintenanceSegment(null)
                                }}
                              />
                            )
                          })}
                          
                          {/* Center content */}
                          <circle cx="100" cy="100" r="45" fill="white" />
                          <circle cx="100" cy="100" r="45" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                          
                          {/* Maintenance icon */}
                          <g transform="translate(85, 85)">
                            <path
                              d="M30 4h-4V2c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2H0v2h2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6h2V4h-4zM6 2h16v2H6V2zm16 20H4V6h18v16z"
                              fill="#3b82f6"
                              transform="scale(0.8)"
                            />
                          </g>
                          
                        </g>
                      )
                    })()}
                  </svg>
                  
                  {/* Modern Legend */}
                  <div className="grid grid-cols-1 gap-2 mt-4 w-full max-w-xs">
                    {(() => {
                      if (maintenanceData.length === 0) return null
                      
                      const statusCounts = maintenanceData.reduce((acc, maintenance) => {
                        const status = maintenance.status || 'unknown'
                        acc[status] = (acc[status] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                      
                      const statuses = Object.keys(statusCounts)
                      const total = maintenanceData.length
                      
                      const getStatusColor = (status: string) => {
                        switch (status.toLowerCase()) {
                          case 'completed': return '#10b981'
                          case 'pending': return '#f59e0b'
                          case 'in_progress': return '#3b82f6'
                          case 'cancelled': return '#ef4444'
                          case 'scheduled': return '#8b5cf6'
                          default: return '#f59e0b'
                        }
                      }
                      
                      return statuses.map((status, index) => {
                        const count = statusCounts[status]
                        const percentage = ((count / total) * 100).toFixed(0)
                        const color = getStatusColor(status)
                        
                        return (
                          <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-gray-900 dark:text-white">
                                {count}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {percentage}%
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeButton === 'Repairs' ? (
          <div className="p-6">
            {/* Top Header Buttons */}
            <div className="flex items-center justify-between mb-6">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors">
                REPAIR SCHEDULE
              </button>
              <button onClick={handleAddRepair} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-3xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ADD REPAIR
              </button>
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                  <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-3xl bg-white dark:bg-gray-700 text-sm">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
                <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                  SELECT COLUMNS
                </button>
                <button onClick={() => handleExport('repairs', 'excel')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  EXCEL
                </button>
                <button onClick={() => handleExport('repairs', 'csv')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </button>
                <button onClick={() => handleExport('repairs', 'pdf')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF
                </button>
                <button onClick={() => handleExport('repairs', 'print')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  PRINT
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Search:</span>
                <input
                  type="text"
                  placeholder="Search repairs..."
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-3xl bg-white dark:bg-gray-700 text-sm w-48"
                />
              </div>
            </div>

            {/* Repair Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-500">
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        ACTIONS
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        NO
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        SERVICE DATE
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        VEHICLE
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        COST (¢)
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        STATUS
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {repairData.length > 0 ? (
                    repairData.map((repair, index) => (
                      <tr key={repair.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewRepair(repair)} 
                              className="text-blue-600 hover:text-blue-900 transition-colors" 
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleEditRepair(repair)} 
                              className="text-green-600 hover:text-green-900 transition-colors" 
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteRepair(repair.id)} 
                              className="text-red-600 hover:text-red-900 transition-colors" 
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {repair.service_date ? formatDateTime(repair.service_date) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicle?.reg_number || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₵{repair.cost || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            repair.status === 'completed' ? 'bg-green-100 text-green-800' :
                            repair.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            repair.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {repair.status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        No repair records found for this vehicle.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing 1 to {repairData.length} of {repairData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  disabled
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
                >
                  Prev
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-full">
                  1
                </button>
                <button 
                  disabled
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Line Graph - Repair Cost Over Time */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Repair Cost Trend</h3>
                <div className="h-64">
                  <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="repair-grid" width="40" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#repair-grid)" />
                    
                    {/* Chart area */}
                    <rect x="40" y="20" width="320" height="160" fill="none" stroke="#d1d5db" strokeWidth="1"/>
                    
                    {/* Y-axis labels */}
                    {(() => {
                      const maxCost = Math.max(...repairData.map(r => parseFloat(r.cost) || 0))
                      const minCost = Math.min(...repairData.map(r => parseFloat(r.cost) || 0))
                      const range = maxCost - minCost || 1
                      const step = range / 4
                      
                      return Array.from({length: 5}, (_, i) => {
                        const value = minCost + (step * i)
                        const y = 180 - (i * 40)
                        return (
                          <g key={i}>
                            <text x="35" y={y + 5} textAnchor="end" className="text-xs fill-gray-600 dark:fill-gray-400">
                              ₵{value.toFixed(0)}
                            </text>
                            <line x1="40" y1={y} x2="360" y2={y} stroke="#e5e7eb" strokeWidth="0.5"/>
                          </g>
                        )
                      })
                    })()}
                    
                    {/* X-axis labels */}
                    {repairData.slice(0, 8).map((repair, index) => {
                      const x = 40 + (index * 40)
                      const date = new Date(repair.service_date)
                      return (
                        <g key={index}>
                          <text x={x} y="195" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">
                            {date.getMonth() + 1}/{date.getDate()}
                          </text>
                          <line x1={x} y1="20" x2={x} y2="180" stroke="#e5e7eb" strokeWidth="0.5"/>
                        </g>
                      )
                    })}
                    
                    {/* Line chart */}
                    {(() => {
                      if (repairData.length === 0) return null
                      
                      const maxCost = Math.max(...repairData.map(r => parseFloat(r.cost) || 0))
                      const minCost = Math.min(...repairData.map(r => parseFloat(r.cost) || 0))
                      const range = maxCost - minCost || 1
                      
                      const points = repairData.slice(0, 8).map((repair, index) => {
                        const x = 40 + (index * 40)
                        const cost = parseFloat(repair.cost) || 0
                        const y = 180 - ((cost - minCost) / range) * 160
                        return `${x},${y}`
                      }).join(' ')
                      
                      return (
                        <g>
                          <polyline
                            points={points}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                          />
                          {repairData.slice(0, 8).map((repair, index) => {
                            const x = 40 + (index * 40)
                            const cost = parseFloat(repair.cost) || 0
                            const y = 180 - ((cost - minCost) / range) * 160
                            return (
                              <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#ef4444"
                                stroke="white"
                                strokeWidth="2"
                              />
                            )
                          })}
                        </g>
                      )
                    })()}
                  </svg>
                </div>
              </div>

              {/* Modern Donut Chart - Repair Status Distribution */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Repair Status Distribution</h3>
                <div className="h-80 flex flex-col items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible mb-4 drop-shadow-lg">
                    <defs>
                      {/* Gradient definitions */}
                      <linearGradient id="repairCompletedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="repairPendingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <linearGradient id="repairInProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                      <linearGradient id="repairCancelledGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient id="repairScheduledGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                    
                    {(() => {
                      if (repairData.length === 0) {
                        return (
                          <g>
                            <circle cx="100" cy="100" r="60" fill="white" />
                            <circle cx="100" cy="100" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                            <text x="100" y="100" textAnchor="middle" className="text-sm fill-gray-500">
                              No data available
                            </text>
                          </g>
                        )
                      }
                      
                      // Calculate status distribution
                      const statusCounts = repairData.reduce((acc, repair) => {
                        const status = repair.status || 'unknown'
                        acc[status] = (acc[status] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                      
                      const statuses = Object.keys(statusCounts)
                      const total = repairData.length
                      let currentAngle = 0
                      const innerRadius = 50
                      const outerRadius = 80
                      const centerX = 100
                      const centerY = 100
                      
                      return (
                        <g>
                          {statuses.map((status, index) => {
                            const count = statusCounts[status]
                            const percentage = (count / total) * 100
                            const angle = (count / total) * 360
                            
                            const startAngle = currentAngle
                            const endAngle = currentAngle + angle
                            
                            const startAngleRad = (startAngle - 90) * (Math.PI / 180)
                            const endAngleRad = (endAngle - 90) * (Math.PI / 180)
                            
                            // Outer arc coordinates
                            const x1 = centerX + outerRadius * Math.cos(startAngleRad)
                            const y1 = centerY + outerRadius * Math.sin(startAngleRad)
                            const x2 = centerX + outerRadius * Math.cos(endAngleRad)
                            const y2 = centerY + outerRadius * Math.sin(endAngleRad)
                            
                            // Inner arc coordinates
                            const x3 = centerX + innerRadius * Math.cos(endAngleRad)
                            const y3 = centerY + innerRadius * Math.sin(endAngleRad)
                            const x4 = centerX + innerRadius * Math.cos(startAngleRad)
                            const y4 = centerY + innerRadius * Math.sin(startAngleRad)
                            
                            const largeArcFlag = angle > 180 ? 1 : 0
                            
                            const pathData = [
                              `M ${x1} ${y1}`,
                              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              `L ${x3} ${y3}`,
                              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                              `Z`
                            ].join(' ')
                            
                            // Get gradient ID based on status
                            const getGradientId = (status: string) => {
                              switch (status.toLowerCase()) {
                                case 'completed': return 'url(#repairCompletedGradient)'
                                case 'pending': return 'url(#repairPendingGradient)'
                                case 'in_progress': return 'url(#repairInProgressGradient)'
                                case 'cancelled': return 'url(#repairCancelledGradient)'
                                case 'scheduled': return 'url(#repairScheduledGradient)'
                                default: return 'url(#repairPendingGradient)'
                              }
                            }
                            
                            currentAngle += angle
                            
                            return (
                              <path
                                key={status}
                                d={pathData}
                                fill={getGradientId(status)}
                                stroke="white"
                                strokeWidth="1"
                                className="transition-all duration-300 hover:opacity-80"
                              />
                            )
                          })}
                          
                          {/* Center content */}
                          <circle cx="100" cy="100" r="45" fill="white" />
                          <circle cx="100" cy="100" r="45" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                          
                          {/* Repair icon */}
                          <g transform="translate(85, 85)">
                            <path
                              d="M30 4h-4V2c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2H0v2h2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6h2V4h-4zM6 2h16v2H6V2zm16 20H4V6h18v16z"
                              fill="#ef4444"
                              transform="scale(0.8)"
                            />
                          </g>
                          
                        </g>
                      )
                    })()}
                  </svg>
                  
                  {/* Modern Legend */}
                  <div className="grid grid-cols-1 gap-2 mt-4 w-full max-w-xs">
                    {(() => {
                      if (repairData.length === 0) return null
                      
                      const statusCounts = repairData.reduce((acc, repair) => {
                        const status = repair.status || 'unknown'
                        acc[status] = (acc[status] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                      
                      const statuses = Object.keys(statusCounts)
                      const total = repairData.length
                      
                      const getStatusColor = (status: string) => {
                        switch (status.toLowerCase()) {
                          case 'completed': return '#10b981'
                          case 'pending': return '#3b82f6'
                          case 'in_progress': return '#f59e0b'
                          case 'cancelled': return '#ef4444'
                          case 'scheduled': return '#8b5cf6'
                          default: return '#3b82f6'
                        }
                      }
                      
                      return statuses.map((status, index) => {
                        const count = statusCounts[status]
                        const percentage = ((count / total) * 100).toFixed(0)
                        const color = getStatusColor(status)
                        
                        return (
                          <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-gray-900 dark:text-white">
                                {count}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {percentage}%
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeButton === 'Insurance' ? (
          <div className="p-6">
            {/* Top Header Buttons */}
            <div className="flex items-center justify-between mb-6">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors">
                INSURANCE SCHEDULE
              </button>
              <button onClick={handleAddInsurance} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-3xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ADD INSURANCE
              </button>
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                  <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-3xl bg-white dark:bg-gray-700 text-sm">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
                <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                  SELECT COLUMNS
                </button>
                <button onClick={() => handleExport('insurance', 'excel')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  EXCEL
                </button>
                <button onClick={() => handleExport('insurance', 'csv')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </button>
                <button onClick={() => handleExport('insurance', 'pdf')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF
                </button>
                <button onClick={() => handleExport('insurance', 'print')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  PRINT
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Search:</span>
                <input
                  type="text"
                  placeholder="Search insurance..."
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-3xl bg-white dark:bg-gray-700 text-sm w-48"
                />
              </div>
            </div>

            {/* Insurance Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-500">
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        ACTIONS
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        NO
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        POLICY NUMBER
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        INSURANCE COMPANY
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        PREMIUM (¢)
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        COVERAGE TYPE
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {insuranceData.length > 0 ? (
                    insuranceData.map((insurance, index) => (
                      <tr key={insurance.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewInsurance(insurance)} 
                              className="text-blue-600 hover:text-blue-900 transition-colors" 
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleEditInsurance(insurance)} 
                              className="text-green-600 hover:text-green-900 transition-colors" 
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteInsurance(insurance.id)} 
                              className="text-red-600 hover:text-red-900 transition-colors" 
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {insurance.policy_number || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {insurance.insurance_company || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₵{insurance.premium_amount || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            insurance.coverage_type === 'comprehensive' ? 'bg-green-100 text-green-800' :
                            insurance.coverage_type === 'third_party' ? 'bg-blue-100 text-blue-800' :
                            insurance.coverage_type === 'fire_theft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {insurance.coverage_type || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        No insurance records found for this vehicle.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing 1 to {insuranceData.length} of {insuranceData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  disabled
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
                >
                  Prev
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-full">
                  1
                </button>
                <button 
                  disabled
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Line Graph - Insurance Premium Over Time */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Insurance Premium Trend</h3>
                <div className="h-64">
                  <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="insurance-grid" width="40" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#insurance-grid)" />
                    
                    {/* Chart area */}
                    <rect x="40" y="20" width="320" height="160" fill="none" stroke="#d1d5db" strokeWidth="1"/>
                    
                    {/* Y-axis labels */}
                    {(() => {
                      const maxPremium = Math.max(...insuranceData.map(i => parseFloat(i.premium_amount) || 0))
                      const minPremium = Math.min(...insuranceData.map(i => parseFloat(i.premium_amount) || 0))
                      const range = maxPremium - minPremium || 1
                      const step = range / 4
                      
                      return Array.from({length: 5}, (_, i) => {
                        const value = minPremium + (step * i)
                        const y = 180 - (i * 40)
                        return (
                          <g key={i}>
                            <text x="35" y={y + 5} textAnchor="end" className="text-xs fill-gray-600 dark:fill-gray-400">
                              ₵{value.toFixed(0)}
                            </text>
                            <line x1="40" y1={y} x2="360" y2={y} stroke="#e5e7eb" strokeWidth="0.5"/>
                          </g>
                        )
                      })
                    })()}
                    
                    {/* X-axis labels */}
                    {insuranceData.slice(0, 8).map((insurance, index) => {
                      const x = 40 + (index * 40)
                      const date = new Date(insurance.start_date)
                      return (
                        <g key={index}>
                          <text x={x} y="195" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">
                            {date.getMonth() + 1}/{date.getDate()}
                          </text>
                          <line x1={x} y1="20" x2={x} y2="180" stroke="#e5e7eb" strokeWidth="0.5"/>
                        </g>
                      )
                    })}
                    
                    {/* Line chart */}
                    {(() => {
                      if (insuranceData.length === 0) return null
                      
                      const maxPremium = Math.max(...insuranceData.map(i => parseFloat(i.premium_amount) || 0))
                      const minPremium = Math.min(...insuranceData.map(i => parseFloat(i.premium_amount) || 0))
                      const range = maxPremium - minPremium || 1
                      
                      const points = insuranceData.slice(0, 8).map((insurance, index) => {
                        const x = 40 + (index * 40)
                        const premium = parseFloat(insurance.premium_amount) || 0
                        const y = 180 - ((premium - minPremium) / range) * 160
                        return `${x},${y}`
                      }).join(' ')
                      
                      return (
                        <g>
                          <polyline
                            points={points}
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                          />
                          {insuranceData.slice(0, 8).map((insurance, index) => {
                            const x = 40 + (index * 40)
                            const premium = parseFloat(insurance.premium_amount) || 0
                            const y = 180 - ((premium - minPremium) / range) * 160
                            return (
                              <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#8b5cf6"
                                stroke="white"
                                strokeWidth="2"
                              />
                            )
                          })}
                        </g>
                      )
                    })()}
                  </svg>
                </div>
              </div>

              {/* Pie Chart - Insurance Coverage Type Distribution */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Coverage Type Distribution</h3>
                <div className="h-80 flex flex-col items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible mb-4">
                    {(() => {
                      if (insuranceData.length === 0) {
                        return (
                          <text x="100" y="100" textAnchor="middle" className="text-sm fill-gray-500">
                            No data available
                          </text>
                        )
                      }
                      
                      // Calculate coverage type distribution
                      const coverageCounts = insuranceData.reduce((acc, insurance) => {
                        const coverage = insurance.coverage_type || 'unknown'
                        acc[coverage] = (acc[coverage] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                      
                      const coverageTypes = Object.keys(coverageCounts)
                      
                      // Map specific coverage types to specific colors
                      const getCoverageColor = (coverage: string) => {
                        switch (coverage) {
                          case 'comprehensive': return '#10b981' // Green
                          case 'third_party': return '#3b82f6' // Blue
                          case 'fire_theft': return '#f59e0b' // Amber
                          default: return '#8b5cf6' // Purple
                        }
                      }
                      
                      let currentAngle = 0
                      const radius = 80
                      const centerX = 100
                      const centerY = 100
                      
                      return (
                        <g>
                          {coverageTypes.map((coverage, index) => {
                            const count = coverageCounts[coverage]
                            const percentage = (count / insuranceData.length) * 100
                            const angle = (count / insuranceData.length) * 360
                            
                            const startAngle = currentAngle
                            const endAngle = currentAngle + angle
                            
                            const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180)
                            const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180)
                            const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180)
                            const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180)
                            
                            const largeArcFlag = angle > 180 ? 1 : 0
                            
                            const pathData = [
                              `M ${centerX} ${centerY}`,
                              `L ${x1} ${y1}`,
                              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              'Z'
                            ].join(' ')
                            
                            currentAngle += angle
                            
                            return (
                              <path
                                key={coverage}
                                d={pathData}
                                fill={getCoverageColor(coverage)}
                                stroke="white"
                                strokeWidth="2"
                              />
                            )
                          })}
                        </g>
                      )
                    })()}
                  </svg>
                  
                  {/* Legend below the pie chart */}
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {(() => {
                      if (insuranceData.length === 0) return null
                      
                      const coverageCounts = insuranceData.reduce((acc, insurance) => {
                        const coverage = insurance.coverage_type || 'unknown'
                        acc[coverage] = (acc[coverage] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                      
                      const coverageTypes = Object.keys(coverageCounts)
                      
                      // Map specific coverage types to specific colors
                      const getCoverageColor = (coverage: string) => {
                        switch (coverage) {
                          case 'comprehensive': return '#10b981' // Green
                          case 'third_party': return '#3b82f6' // Blue
                          case 'fire_theft': return '#f59e0b' // Amber
                          default: return '#8b5cf6' // Purple
                        }
                      }
                      
                      return coverageTypes.map((coverage, index) => {
                        const count = coverageCounts[coverage]
                        const color = getCoverageColor(coverage)
                        
                        return (
                          <div key={coverage} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              {coverage.charAt(0).toUpperCase() + coverage.slice(1).replace('_', ' ')} ({count})
                            </span>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeButton === 'Roadworthy' ? (
          <div className="p-6">
            {/* Top Header Buttons */}
            <div className="flex items-center justify-between mb-6">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors">
                ROADWORTHY SCHEDULE
              </button>
              <button onClick={handleAddRoadworthy} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-3xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ADD ROADWORTHY
              </button>
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                  <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-3xl bg-white dark:bg-gray-700 text-sm">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
                <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                  SELECT COLUMNS
                </button>
                <button onClick={() => handleExport('roadworthy', 'excel')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  EXCEL
                </button>
                <button onClick={() => handleExport('roadworthy', 'csv')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </button>
                <button onClick={() => handleExport('roadworthy', 'pdf')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF
                </button>
                <button onClick={() => handleExport('roadworthy', 'print')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  PRINT
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Search:</span>
                <input
                  type="text"
                  placeholder="Search roadworthy..."
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-3xl bg-white dark:bg-gray-700 text-sm w-48"
                />
              </div>
            </div>

            {/* Roadworthy Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-500">
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        ACTIONS
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        NO
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        COMPANY
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        VEHICLE NUMBER
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        DATE ISSUED
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        DATE EXPIRED
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        STATUS
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roadworthyData.length > 0 ? (
                    roadworthyData.map((roadworthy, index) => (
                      <tr key={roadworthy.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewRoadworthy(roadworthy)} 
                              className="text-blue-600 hover:text-blue-900 transition-colors" 
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleEditRoadworthy(roadworthy)} 
                              className="text-green-600 hover:text-green-900 transition-colors" 
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteRoadworthy(roadworthy.id, roadworthy.vehicle_number)} 
                              className="text-red-600 hover:text-red-900 transition-colors" 
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {roadworthy.company || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {roadworthy.vehicle_number || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {roadworthy.date_issued ? formatDateTime(roadworthy.date_issued) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {roadworthy.date_expired ? formatDateTime(roadworthy.date_expired) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            roadworthy.roadworth_status === 'valid' ? 'bg-green-100 text-green-800' :
                            roadworthy.roadworth_status === 'expired' ? 'bg-red-100 text-red-800' :
                            roadworthy.roadworth_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {roadworthy.roadworth_status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                        No roadworthy records found for this vehicle.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing 1 to {roadworthyData.length} of {roadworthyData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  disabled
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
                >
                  Prev
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-full">
                  1
                </button>
                <button 
                  disabled
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Line Graph - Roadworthy Status Over Time */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Roadworthy Status Timeline</h3>
                <div className="h-64">
                  <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="roadworthy-grid" width="40" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#roadworthy-grid)" />
                    
                    {/* Chart area */}
                    <rect x="40" y="20" width="320" height="160" fill="none" stroke="#d1d5db" strokeWidth="1"/>
                    
                    {/* Y-axis labels */}
                    {(() => {
                      const statusValues = roadworthyData.map(r => {
                        switch (r.roadworth_status) {
                          case 'valid': return 3
                          case 'pending': return 2
                          case 'expired': return 1
                          default: return 0
                        }
                      })
                      const maxValue = Math.max(...statusValues, 3)
                      const minValue = Math.min(...statusValues, 0)
                      const range = maxValue - minValue || 1
                      const step = range / 4
                      
                      return Array.from({length: 5}, (_, i) => {
                        const value = minValue + (step * i)
                        const y = 180 - (i * 40)
                        const statusText = value >= 3 ? 'Valid' : value >= 2 ? 'Pending' : value >= 1 ? 'Expired' : 'Unknown'
                        return (
                          <g key={i}>
                            <text x="35" y={y + 5} textAnchor="end" className="text-xs fill-gray-600 dark:fill-gray-400">
                              {statusText}
                            </text>
                            <line x1="40" y1={y} x2="360" y2={y} stroke="#e5e7eb" strokeWidth="0.5"/>
                          </g>
                        )
                      })
                    })()}
                    
                    {/* X-axis labels */}
                    {roadworthyData.slice(0, 8).map((roadworthy, index) => {
                      const x = 40 + (index * 40)
                      const date = new Date(roadworthy.date_issued)
                      return (
                        <g key={index}>
                          <text x={x} y="195" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">
                            {date.getMonth() + 1}/{date.getDate()}
                          </text>
                          <line x1={x} y1="20" x2={x} y2="180" stroke="#e5e7eb" strokeWidth="0.5"/>
                        </g>
                      )
                    })}
                    
                    {/* Line chart */}
                    {(() => {
                      if (roadworthyData.length === 0) return null
                      
                      const statusValues = roadworthyData.map(r => {
                        switch (r.roadworth_status) {
                          case 'valid': return 3
                          case 'pending': return 2
                          case 'expired': return 1
                          default: return 0
                        }
                      })
                      const maxValue = Math.max(...statusValues, 3)
                      const minValue = Math.min(...statusValues, 0)
                      const range = maxValue - minValue || 1
                      
                      const points = roadworthyData.slice(0, 8).map((roadworthy, index) => {
                        const x = 40 + (index * 40)
                        const statusValue = statusValues[index]
                        const y = 180 - ((statusValue - minValue) / range) * 160
                        return `${x},${y}`
                      }).join(' ')
                      
                      return (
                        <g>
                          <polyline
                            points={points}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="2"
                          />
                          {roadworthyData.slice(0, 8).map((roadworthy, index) => {
                            const x = 40 + (index * 40)
                            const statusValue = statusValues[index]
                            const y = 180 - ((statusValue - minValue) / range) * 160
                            const color = roadworthy.roadworth_status === 'valid' ? '#10b981' :
                                         roadworthy.roadworth_status === 'pending' ? '#f59e0b' :
                                         roadworthy.roadworth_status === 'expired' ? '#ef4444' : '#6b7280'
                            return (
                              <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="4"
                                fill={color}
                                stroke="white"
                                strokeWidth="2"
                              />
                            )
                          })}
                        </g>
                      )
                    })()}
                  </svg>
                </div>
              </div>

              {/* Pie Chart - Roadworthy Status Distribution */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Roadworthy Status Distribution</h3>
                <div className="h-80 flex flex-col items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible mb-4">
                    {(() => {
                      if (roadworthyData.length === 0) {
                        return (
                          <text x="100" y="100" textAnchor="middle" className="text-sm fill-gray-500">
                            No data available
                          </text>
                        )
                      }
                      
                      // Calculate status distribution
                      const statusCounts = roadworthyData.reduce((acc, roadworthy) => {
                        const status = roadworthy.roadworth_status || 'unknown'
                        acc[status] = (acc[status] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                      
                      const statuses = Object.keys(statusCounts)
                      
                      // Map specific statuses to specific colors
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'valid': return '#10b981' // Green
                          case 'expired': return '#ef4444' // Red
                          case 'pending': return '#f59e0b' // Amber
                          default: return '#6b7280' // Gray
                        }
                      }
                      
                      let currentAngle = 0
                      const radius = 80
                      const centerX = 100
                      const centerY = 100
                      
                      return (
                        <g>
                          {statuses.map((status, index) => {
                            const count = statusCounts[status]
                            const percentage = (count / roadworthyData.length) * 100
                            const angle = (count / roadworthyData.length) * 360
                            
                            const startAngle = currentAngle
                            const endAngle = currentAngle + angle
                            
                            const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180)
                            const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180)
                            const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180)
                            const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180)
                            
                            const largeArcFlag = angle > 180 ? 1 : 0
                            
                            const pathData = [
                              `M ${centerX} ${centerY}`,
                              `L ${x1} ${y1}`,
                              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              'Z'
                            ].join(' ')
                            
                            currentAngle += angle
                            
                            return (
                              <path
                                key={status}
                                d={pathData}
                                fill={getStatusColor(status)}
                                stroke="white"
                                strokeWidth="2"
                              />
                            )
                          })}
                        </g>
                      )
                    })()}
                  </svg>
                  
                  {/* Legend below the pie chart */}
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {(() => {
                      if (roadworthyData.length === 0) return null
                      
                      const statusCounts = roadworthyData.reduce((acc, roadworthy) => {
                        const status = roadworthy.roadworth_status || 'unknown'
                        acc[status] = (acc[status] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                      
                      const statuses = Object.keys(statusCounts)
                      
                      // Map specific statuses to specific colors
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'valid': return '#10b981' // Green
                          case 'expired': return '#ef4444' // Red
                          case 'pending': return '#f59e0b' // Amber
                          default: return '#6b7280' // Gray
                        }
                      }
                      
                      return statuses.map((status, index) => {
                        const count = statusCounts[status]
                        const color = getStatusColor(status)
                        
                        return (
                          <div key={status} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                            </span>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeButton === 'Fuel Logs' ? (
          <div className="p-6">
            {/* Top Header Buttons */}
            <div className="flex items-center justify-between mb-6">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors">
                FUEL LOGS SCHEDULE
              </button>
              <button onClick={handleAddFuelLog} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-3xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ADD FUEL LOG
              </button>
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                  <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-3xl bg-white dark:bg-gray-700 text-sm">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
                <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                  SELECT COLUMNS
                </button>
                <button onClick={() => handleExport('fuel-logs', 'excel')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  EXCEL
                </button>
                <button onClick={() => handleExport('fuel-logs', 'csv')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </button>
                <button onClick={() => handleExport('fuel-logs', 'pdf')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF
                </button>
                <button onClick={() => handleExport('fuel-logs', 'print')} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  PRINT
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Search:</span>
                <input
                  type="text"
                  placeholder="Search fuel logs..."
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-3xl bg-white dark:bg-gray-700 text-sm w-48"
                />
              </div>
            </div>

            {/* Fuel Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-500">
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        ACTIONS
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        NO
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        DATE
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        QUANTITY (L)
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        UNIT COST (¢)
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        TOTAL COST (¢)
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        VENDOR
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fuelLogsData.length > 0 ? (
                    fuelLogsData.map((fuelLog, index) => (
                      <tr key={fuelLog.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewFuelLog(fuelLog)} 
                              className="text-blue-600 hover:text-blue-900 transition-colors" 
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleEditFuelLog(fuelLog)} 
                              className="text-green-600 hover:text-green-900 transition-colors" 
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteFuelLog(fuelLog.id)} 
                              className="text-red-600 hover:text-red-900 transition-colors" 
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fuelLog.refuel_date ? formatDateTime(fuelLog.refuel_date) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fuelLog.quantity || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₵{fuelLog.unit_cost || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₵{fuelLog.total_cost || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fuelLog.vendor || 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                        No fuel logs found for this vehicle.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing 1 to {fuelLogsData.length} of {fuelLogsData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  disabled
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
                >
                  Prev
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-full">
                  1
                </button>
                <button 
                  disabled
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Line Graph - Fuel Cost Over Time */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Fuel Cost Trend</h3>
                <div className="h-64">
                  <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="fuel-grid" width="40" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#fuel-grid)" />
                    
                    {/* Chart area */}
                    <rect x="40" y="20" width="320" height="160" fill="none" stroke="#d1d5db" strokeWidth="1"/>
                    
                    {/* Y-axis labels */}
                    {(() => {
                      const maxCost = Math.max(...fuelLogsData.map(f => parseFloat(f.total_cost) || 0))
                      const minCost = Math.min(...fuelLogsData.map(f => parseFloat(f.total_cost) || 0))
                      const range = maxCost - minCost || 1
                      const step = range / 4
                      
                      return Array.from({length: 5}, (_, i) => {
                        const value = minCost + (step * i)
                        const y = 180 - (i * 40)
                        return (
                          <g key={i}>
                            <text x="35" y={y + 5} textAnchor="end" className="text-xs fill-gray-600 dark:fill-gray-400">
                              ₵{value.toFixed(0)}
                            </text>
                            <line x1="40" y1={y} x2="360" y2={y} stroke="#e5e7eb" strokeWidth="0.5"/>
                          </g>
                        )
                      })
                    })()}
                    
                    {/* X-axis labels */}
                    {fuelLogsData.slice(0, 8).map((fuelLog, index) => {
                      const x = 40 + (index * 40)
                      const date = new Date(fuelLog.refuel_date)
                      return (
                        <g key={index}>
                          <text x={x} y="195" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">
                            {date.getMonth() + 1}/{date.getDate()}
                          </text>
                          <line x1={x} y1="20" x2={x} y2="180" stroke="#e5e7eb" strokeWidth="0.5"/>
                        </g>
                      )
                    })}
                    
                    {/* Line chart */}
                    {(() => {
                      if (fuelLogsData.length === 0) return null
                      
                      const maxCost = Math.max(...fuelLogsData.map(f => parseFloat(f.total_cost) || 0))
                      const minCost = Math.min(...fuelLogsData.map(f => parseFloat(f.total_cost) || 0))
                      const range = maxCost - minCost || 1
                      
                      const points = fuelLogsData.slice(0, 8).map((fuelLog, index) => {
                        const x = 40 + (index * 40)
                        const cost = parseFloat(fuelLog.total_cost) || 0
                        const y = 180 - ((cost - minCost) / range) * 160
                        return `${x},${y}`
                      }).join(' ')
                      
                      return (
                        <g>
                          <polyline
                            points={points}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                          />
                          {fuelLogsData.slice(0, 8).map((fuelLog, index) => {
                            const x = 40 + (index * 40)
                            const cost = parseFloat(fuelLog.total_cost) || 0
                            const y = 180 - ((cost - minCost) / range) * 160
                            return (
                              <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#f59e0b"
                                stroke="white"
                                strokeWidth="2"
                              />
                            )
                          })}
                        </g>
                      )
                    })()}
                  </svg>
                </div>
              </div>

              {/* Pie Chart - Fuel Type Distribution */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Fuel Type Distribution</h3>
                <div className="h-80 flex flex-col items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible mb-4">
                    {(() => {
                      if (fuelLogsData.length === 0) {
                        return (
                          <text x="100" y="100" textAnchor="middle" className="text-sm fill-gray-500">
                            No data available
                          </text>
                        )
                      }
                      
                      // Calculate fuel type distribution
                      const fuelTypeCounts = fuelLogsData.reduce((acc, fuelLog) => {
                        const fuelType = fuelLog.fuel_type || 'unknown'
                        acc[fuelType] = (acc[fuelType] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                      
                      const fuelTypes = Object.keys(fuelTypeCounts)
                      
                      // Map specific fuel types to specific colors
                      const getFuelTypeColor = (fuelType: string) => {
                        switch (fuelType.toLowerCase()) {
                          case 'petrol': return '#f59e0b' // Amber
                          case 'diesel': return '#6b7280' // Gray
                          case 'gas': return '#3b82f6' // Blue
                          default: return '#8b5cf6' // Purple
                        }
                      }
                      
                      let currentAngle = 0
                      const radius = 80
                      const centerX = 100
                      const centerY = 100
                      
                      return (
                        <g>
                          {fuelTypes.map((fuelType, index) => {
                            const count = fuelTypeCounts[fuelType]
                            const percentage = (count / fuelLogsData.length) * 100
                            const angle = (count / fuelLogsData.length) * 360
                            
                            const startAngle = currentAngle
                            const endAngle = currentAngle + angle
                            
                            const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180)
                            const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180)
                            const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180)
                            const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180)
                            
                            const largeArcFlag = angle > 180 ? 1 : 0
                            
                            const pathData = [
                              `M ${centerX} ${centerY}`,
                              `L ${x1} ${y1}`,
                              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              'Z'
                            ].join(' ')
                            
                            currentAngle += angle
                            
                            return (
                              <path
                                key={fuelType}
                                d={pathData}
                                fill={getFuelTypeColor(fuelType)}
                                stroke="white"
                                strokeWidth="2"
                              />
                            )
                          })}
                        </g>
                      )
                    })()}
                  </svg>
                  
                  {/* Legend below the pie chart */}
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {(() => {
                      if (fuelLogsData.length === 0) return null
                      
                      const fuelTypeCounts = fuelLogsData.reduce((acc, fuelLog) => {
                        const fuelType = fuelLog.fuel_type || 'unknown'
                        acc[fuelType] = (acc[fuelType] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                      
                      const fuelTypes = Object.keys(fuelTypeCounts)
                      
                      // Map specific fuel types to specific colors
                      const getFuelTypeColor = (fuelType: string) => {
                        switch (fuelType.toLowerCase()) {
                          case 'petrol': return '#f59e0b' // Amber
                          case 'diesel': return '#6b7280' // Gray
                          case 'gas': return '#3b82f6' // Blue
                          default: return '#8b5cf6' // Purple
                        }
                      }
                      
                      return fuelTypes.map((fuelType, index) => {
                        const count = fuelTypeCounts[fuelType]
                        const color = getFuelTypeColor(fuelType)
                        
                        return (
                          <div key={fuelType} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)} ({count})
                            </span>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
    ) : activeButton === 'Sensor' ? (
      <div className="p-6">
        {/* Top Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Entries per page */}
            <div className="flex items-center gap-2">
              <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Show
              </span>
              <select
                value={sensorEntriesPerPage}
                onChange={(e) => {
                  setSensorEntriesPerPage(Number(e.target.value))
                  setSensorCurrentPage(1)
                }}
                className={`px-2 py-1 border rounded text-sm ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                entries
              </span>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={exportSensorToExcel}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                EXCEL
              </button>
              <button
                onClick={exportSensorToCSV}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <DocumentTextIcon className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={exportSensorToPDF}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <DocumentIcon className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={printSensorData}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <PrinterIcon className="w-4 h-4" />
                PRINT
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Search:
            </span>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={sensorSearchQuery}
                onChange={(e) => setSensorSearchQuery(e.target.value)}
                placeholder="Search by sensor type, name, value..."
                className={`pl-10 pr-3 py-1 border rounded text-sm ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Sensor Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-600">
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500">
                  No
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500 cursor-pointer"
                  onClick={() => {
                    if (sensorSortField === 'sensor_type') {
                      setSensorSortDirection(sensorSortDirection === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSensorSortField('sensor_type'); setSensorSortDirection('asc')
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Sensor Type
                    {sensorSortField !== 'sensor_type' ? (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                        <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                      </div>
                    ) : sensorSortDirection === 'asc' ? (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-white" />
                        <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                        <ChevronDownIcon className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500 cursor-pointer"
                  onClick={() => {
                    if (sensorSortField === 'name') {
                      setSensorSortDirection(sensorSortDirection === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSensorSortField('name'); setSensorSortDirection('asc')
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Name
                    {sensorSortField !== 'name' ? (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                        <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                      </div>
                    ) : sensorSortDirection === 'asc' ? (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-white" />
                        <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                        <ChevronDownIcon className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500 cursor-pointer"
                  onClick={() => {
                    if (sensorSortField === 'value') {
                      setSensorSortDirection(sensorSortDirection === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSensorSortField('value'); setSensorSortDirection('asc')
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Value
                    {sensorSortField !== 'value' ? (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                        <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                      </div>
                    ) : sensorSortDirection === 'asc' ? (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-white" />
                        <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                        <ChevronDownIcon className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500 cursor-pointer"
                  onClick={() => {
                    if (sensorSortField === 'reading_time_local') {
                      setSensorSortDirection(sensorSortDirection === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSensorSortField('reading_time_local'); setSensorSortDirection('asc')
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Reading Time
                    {sensorSortField !== 'reading_time_local' ? (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                        <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                      </div>
                    ) : sensorSortDirection === 'asc' ? (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-white" />
                        <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                        <ChevronDownIcon className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeMode === 'dark' ? 'divide-gray-600' : 'divide-gray-200'}`}>
              {paginatedSensorData.length > 0 ? (
                paginatedSensorData.map((sensor, index) => (
                  <tr key={sensor.id || index} className={`hover:bg-gray-50 ${themeMode === 'dark' ? 'hover:bg-gray-700' : ''}`}>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {sensorStartIndex + index + 1}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        sensor.sensor_type === 'Temperature' ? 'bg-red-100 text-red-800' :
                        sensor.sensor_type === 'Pressure' ? 'bg-blue-100 text-blue-800' :
                        sensor.sensor_type === 'Speed' ? 'bg-green-100 text-green-800' :
                        sensor.sensor_type === 'Fuel Level' ? 'bg-yellow-100 text-yellow-800' :
                        sensor.sensor_type === 'Battery' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sensor.sensor_type}
                      </span>
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {sensor.name}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {sensor.value !== null && sensor.value !== undefined ? 
                        `${typeof sensor.value === 'object' ? sensor.value.toString() : sensor.value}${sensor.measurement_sign || ''}` : 'N/A'}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {sensor.reading_time_local ? formatDateTime(sensor.reading_time_local) : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={`px-4 py-8 text-center text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No sensor data available for this vehicle
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Showing {sensorStartIndex + 1} to {Math.min(sensorEndIndex, filteredSensorData.length)} of {filteredSensorData.length} entries
            {sensorSearchQuery && (
              <span className="ml-2 text-blue-600">
                (filtered from {sensorData.length} total)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSensorCurrentPage(sensorCurrentPage - 1)}
              disabled={sensorCurrentPage === 1}
              className={`px-3 py-1 rounded-2xl text-sm ${
                sensorCurrentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Prev
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {sensorCurrentPage} of {sensorTotalPages}
            </span>
            <button 
              onClick={() => setSensorCurrentPage(sensorCurrentPage + 1)}
              disabled={sensorCurrentPage === sensorTotalPages}
              className={`px-3 py-1 rounded-2xl text-sm ${
                sensorCurrentPage === sensorTotalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
        ) : activeButton === 'Tracking' ? (
          <div className="p-6">
            {/* Top Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Entries per page */}
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Show
                  </span>
                  <select
                    value={trackingEntriesPerPage}
                    onChange={(e) => {
                      setTrackingEntriesPerPage(Number(e.target.value))
                      setTrackingCurrentPage(1)
                    }}
                    className={`px-2 py-1 border rounded text-sm ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    entries
                  </span>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportTrackingToExcel}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    EXCEL
                  </button>
                  <button
                    onClick={exportTrackingToCSV}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={exportTrackingToPDF}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <DocumentIcon className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={printTrackingData}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <PrinterIcon className="w-4 h-4" />
                    PRINT
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Search:
                </span>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={trackingSearchQuery}
                    onChange={(e) => setTrackingSearchQuery(e.target.value)}
                    placeholder="Search by address, speed, odometer, engine status..."
                    className={`pl-10 pr-3 py-1 border rounded text-sm ${
                      themeMode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Tracking Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-600">
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500">
                      Actions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500">
                      No
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500 cursor-pointer"
                      onClick={() => {
                        if (trackingSortField === 'address') {
                          setTrackingSortDirection(trackingSortDirection === 'asc' ? 'desc' : 'asc')
                        } else {
                          setTrackingSortField('address'); setTrackingSortDirection('asc')
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Address
                        {trackingSortField !== 'address' ? (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                            <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                          </div>
                        ) : trackingSortDirection === 'asc' ? (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-white" />
                            <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                            <ChevronDownIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500 cursor-pointer"
                      onClick={() => {
                        if (trackingSortField === 'speed') {
                          setTrackingSortDirection(trackingSortDirection === 'asc' ? 'desc' : 'asc')
                        } else {
                          setTrackingSortField('speed'); setTrackingSortDirection('asc')
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Speed
                        {trackingSortField !== 'speed' ? (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                            <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                          </div>
                        ) : trackingSortDirection === 'asc' ? (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-white" />
                            <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                            <ChevronDownIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500 cursor-pointer"
                      onClick={() => {
                        if (trackingSortField === 'odometer') {
                          setTrackingSortDirection(trackingSortDirection === 'asc' ? 'desc' : 'asc')
                        } else {
                          setTrackingSortField('odometer'); setTrackingSortDirection('asc')
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Odometer
                        {trackingSortField !== 'odometer' ? (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                            <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                          </div>
                        ) : trackingSortDirection === 'asc' ? (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-white" />
                            <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                            <ChevronDownIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500 cursor-pointer"
                      onClick={() => {
                        if (trackingSortField === 'engine_status') {
                          setTrackingSortDirection(trackingSortDirection === 'asc' ? 'desc' : 'asc')
                        } else {
                          setTrackingSortField('engine_status'); setTrackingSortDirection('asc')
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Engine Status
                        {trackingSortField !== 'engine_status' ? (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                            <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                          </div>
                        ) : trackingSortDirection === 'asc' ? (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-white" />
                            <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                            <ChevronDownIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-500 cursor-pointer"
                      onClick={() => {
                        if (trackingSortField === 'gps_time_utc') {
                          setTrackingSortDirection(trackingSortDirection === 'asc' ? 'desc' : 'asc')
                        } else {
                          setTrackingSortField('gps_time_utc'); setTrackingSortDirection('asc')
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        GPS Time
                        {trackingSortField !== 'gps_time_utc' ? (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                            <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                          </div>
                        ) : trackingSortDirection === 'asc' ? (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-white" />
                            <ChevronDownIcon className="w-3 h-3 text-blue-200" />
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-blue-200" />
                            <ChevronDownIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeMode === 'dark' ? 'divide-gray-600' : 'divide-gray-200'}`}>
                  {paginatedTrackingData.length > 0 ? (
                    paginatedTrackingData.map((tracking, index) => (
                      <tr key={tracking.id || index} className={`hover:bg-gray-50 ${themeMode === 'dark' ? 'hover:bg-gray-700' : ''}`}>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <button 
                            onClick={() => handleOpenMapsModal(tracking)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Location on Map"
                          >
                            <LocationIcon className="w-4 h-4" />
                          </button>
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {trackingStartIndex + index + 1}
                        </td>
                        <td className={`px-4 py-4 text-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'} break-words max-w-xs`}>
                          {tracking.address}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            parseFloat(tracking.speed?.toString() || '0') > 50 ? 'bg-red-100 text-red-800' :
                            parseFloat(tracking.speed?.toString() || '0') > 30 ? 'bg-yellow-100 text-yellow-800' :
                            parseFloat(tracking.speed?.toString() || '0') > 0 ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tracking.speed?.toString() || '0'} km/h
                          </span>
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {tracking.odometer?.toString() || '0'} km
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            tracking.engine_status === 'Running' ? 'bg-green-100 text-green-800' :
                            tracking.engine_status === 'Idle' ? 'bg-yellow-100 text-yellow-800' :
                            tracking.engine_status === 'Stopped' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tracking.engine_status}
                          </span>
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {tracking.gps_time_utc ? formatDateTime(tracking.gps_time_utc) : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className={`px-4 py-8 text-center text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        No tracking data available for this vehicle
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Showing {trackingStartIndex + 1} to {Math.min(trackingEndIndex, filteredTrackingData.length)} of {filteredTrackingData.length} entries
                {trackingSearchQuery && (
                  <span className="ml-2 text-blue-600">
                    (filtered from {trackingData.length} total)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setTrackingCurrentPage(trackingCurrentPage - 1)}
                  disabled={trackingCurrentPage === 1}
                  className={`px-3 py-1 rounded-2xl text-sm ${
                    trackingCurrentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {trackingCurrentPage} of {trackingTotalPages}
                </span>
                <button 
                  onClick={() => setTrackingCurrentPage(trackingCurrentPage + 1)}
                  disabled={trackingCurrentPage === trackingTotalPages}
                  className={`px-3 py-1 rounded-2xl text-sm ${
                    trackingCurrentPage === trackingTotalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {activeButton} functionality coming soon...
            </p>
          </div>
        )}

        {/* Horizontal Divider */}
        <hr className={`my-6 ${themeMode === 'dark' ? 'border-gray-600' : 'border-gray-200'}`} />

        {/* Action Buttons */}
        {activeButton === 'Profile' && (
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
                  <span className="text-sm">EDIT VEHICLE</span>
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
        )}
      </div>

      {/* Add Maintenance Modal */}
      <AddMaintenanceModal
        isOpen={isAddMaintenanceModalOpen}
        onClose={() => setIsAddMaintenanceModalOpen(false)}
        onSubmit={handleMaintenanceSubmit}
        vehicleId={vehicle?.id}
      />

      {/* Edit Maintenance Modal */}
      <EditMaintenanceModal
        isOpen={isEditMaintenanceModalOpen}
        onClose={() => {
          setIsEditMaintenanceModalOpen(false)
          setSelectedMaintenanceRecord(null)
        }}
        onSubmit={handleMaintenanceUpdate}
        maintenanceRecord={selectedMaintenanceRecord}
      />

      {/* View Maintenance Modal */}
      <ViewMaintenanceModal
        isOpen={isViewMaintenanceModalOpen}
        onClose={() => {
          setIsViewMaintenanceModalOpen(false)
          setSelectedMaintenanceRecord(null)
        }}
        maintenanceRecord={selectedMaintenanceRecord}
      />

      {/* Add Repair Modal */}
      <AddRepairModal
        isOpen={isAddRepairModalOpen}
        onClose={() => setIsAddRepairModalOpen(false)}
        onSubmit={handleRepairSubmit}
        vehicleId={vehicle?.id}
      />

      {/* Edit Repair Modal */}
      <EditRepairModal
        isOpen={isEditRepairModalOpen}
        onClose={() => {
          setIsEditRepairModalOpen(false)
          setSelectedRepairRecord(null)
        }}
        onSubmit={handleRepairUpdate}
        repairRecord={selectedRepairRecord}
      />

      {/* View Repair Modal */}
      <ViewRepairModal
        isOpen={isViewRepairModalOpen}
        onClose={() => {
          setIsViewRepairModalOpen(false)
          setSelectedRepairRecord(null)
        }}
        repairRecord={selectedRepairRecord}
      />

      {/* Add Insurance Modal */}
      <AddInsuranceModal
        isOpen={isAddInsuranceModalOpen}
        onClose={() => setIsAddInsuranceModalOpen(false)}
        onSubmit={handleInsuranceSubmit}
        vehicleId={vehicle?.id}
      />

      {/* Edit Insurance Modal */}
      <EditInsuranceModal
        isOpen={isEditInsuranceModalOpen}
        onClose={() => {
          setIsEditInsuranceModalOpen(false)
          setSelectedInsuranceRecord(null)
        }}
        onSubmit={handleInsuranceUpdate}
        insuranceRecord={selectedInsuranceRecord}
      />

      {/* View Insurance Modal */}
      <ViewInsuranceModal
        isOpen={isViewInsuranceModalOpen}
        onClose={() => {
          setIsViewInsuranceModalOpen(false)
          setSelectedInsuranceRecord(null)
        }}
        insuranceRecord={selectedInsuranceRecord}
      />

      {/* Add Roadworthy Modal */}
      <AddRoadworthyModal
        isOpen={isAddRoadworthyModalOpen}
        onClose={() => setIsAddRoadworthyModalOpen(false)}
        onSubmit={handleRoadworthySubmit}
        vehicleId={vehicle?.id}
      />

      {/* Edit Roadworthy Modal */}
      <EditRoadworthyModal
        isOpen={isEditRoadworthyModalOpen}
        onClose={() => {
          setIsEditRoadworthyModalOpen(false)
          setSelectedRoadworthyRecord(null)
        }}
        onSubmit={handleRoadworthyUpdate}
        roadworthyRecord={selectedRoadworthyRecord}
      />

      {/* View Roadworthy Modal */}
      <ViewRoadworthyModal
        isOpen={isViewRoadworthyModalOpen}
        onClose={() => {
          setIsViewRoadworthyModalOpen(false)
          setSelectedRoadworthyRecord(null)
        }}
        roadworthyRecord={selectedRoadworthyRecord}
      />

      {/* Add Fuel Log Modal */}
      <AddFuelLogModal
        isOpen={isAddFuelLogModalOpen}
        onClose={() => setIsAddFuelLogModalOpen(false)}
        onSubmit={handleFuelLogSubmit}
        vehicleId={vehicle?.id}
      />

      {/* Edit Fuel Log Modal */}
      <EditFuelLogModal
        isOpen={isEditFuelLogModalOpen}
        onClose={() => {
          setIsEditFuelLogModalOpen(false)
          setSelectedFuelLogRecord(null)
        }}
        onSubmit={handleFuelLogUpdate}
        fuelLogRecord={selectedFuelLogRecord}
      />

      {/* View Fuel Log Modal */}
      <ViewFuelLogModal
        isOpen={isViewFuelLogModalOpen}
        onClose={() => {
          setIsViewFuelLogModalOpen(false)
          setSelectedFuelLogRecord(null)
        }}
        fuelLogRecord={selectedFuelLogRecord}
      />

      {/* Google Maps Modal */}
      {isMapsModalOpen && selectedLocation && (
        <GoogleMapsModal
          isOpen={isMapsModalOpen}
          onClose={handleCloseMapsModal}
          address={selectedLocation.address}
          latitude={selectedLocation.latitude}
          longitude={selectedLocation.longitude}
          themeMode={themeMode}
          vehicleName={vehicle?.name || vehicle?.reg_number || 'Vehicle Location'}
        />
      )}
    </div>
  )
}
