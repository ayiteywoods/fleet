'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  TruckIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  PlayIcon,
  StopIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChevronRightIcon,
  BoltIcon,
  XCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  BeakerIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import { formatDateTime } from '@/lib/dateUtils'
import { getIconColor, getBrandColor } from '@/lib/themeUtils'
import GoogleFleetMapWrapper from './GoogleFleetMapWrapper'
import FloatingSettings from './FloatingSettings'
import GoogleMapsModal from './GoogleMapsModal'
import DatabaseErrorDisplay from './DatabaseErrorDisplay'

interface Trip {
  id: string
  vehicle: {
    id: string
    reg_number: string
    name: string
    status: string
    company_name: string
  }
  position: {
    id: string
    address: string
    speed: string
    odometer: string
    engine_status: string
    gps_time_utc: string
  }
  trip: {
  status: 'Start' | 'Stop'
  time: string
    timeAgo: string
  location: string
  }
}

interface Alert {
  id: string
  vehicle: {
    id: string
    reg_number: string
    name: string
    status: string
    company_name: string
  }
  alert: {
    id: string
    unit_name: string
    alert_type: string
    alert_description: string
    last_reported_time_utc: string
    address: string
    latitude: string
    longitude: string
    speed: string
    odometer: string
    engine_status: string
    gps_time_utc: string
  }
}

interface FuelLog {
  id: string
  refuel_date: string
  quantity: number
  unit_cost: number
  total_cost: number
  fuel_type: string
  vendor: string
  vehicles: {
    reg_number: string
  }
}

interface MonthlyFuelData {
  month: string
  petrolCost: number
  dieselCost: number
  totalCost: number
}

interface MaintenanceSchedule {
  id: string
  service_date?: string
  due_date?: string
  vehicle_id: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  vehicles?: {
    reg_number: string
    trim: string
    year: number
    status: string
  }
  vehicle_reg?: string
  vehicle_name?: string
  service_type?: string
}

export default function FleetDashboard() {
  const { themeColor, themeMode } = useTheme()
  const [vehiclesCount, setVehiclesCount] = useState(0)
  const [driversCount, setDriversCount] = useState(0)
  const [insuranceCount, setInsuranceCount] = useState(0)
  const [onRoadCount, setOnRoadCount] = useState(0)
  const [offRoadCount, setOffRoadCount] = useState(0)
  const [maintenanceCount, setMaintenanceCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [monthlyFuelData, setMonthlyFuelData] = useState<MonthlyFuelData[]>([])
  const [fuelTypeDistribution, setFuelTypeDistribution] = useState<{ petrol: number; diesel: number }>({ petrol: 0, diesel: 0 })
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([])
  const [isLoadingFuelData, setIsLoadingFuelData] = useState(true)
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null)
  const [hoveredFleetSegment, setHoveredFleetSegment] = useState<{ type: string; count: number; percentage: number } | null>(null)
  const [fleetTooltipPosition, setFleetTooltipPosition] = useState({ x: 0, y: 0 })
  const [fleetTimePeriod, setFleetTimePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([])
  
  // Filter vehicles based on time period
  const filterVehiclesByTimePeriod = (vehicles: any[], period: 'weekly' | 'monthly' | 'yearly') => {
    const now = new Date()
    let cutoffDate: Date
    
    switch (period) {
      case 'weekly':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'yearly':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    
    return vehicles.filter(vehicle => {
      const vehicleDate = new Date(vehicle.created_at)
      return vehicleDate >= cutoffDate
    })
  }
  
  // Update fleet counts when time period changes
  useEffect(() => {
    if (filteredVehicles.length > 0) {
      // DON'T apply time filtering to KPI counts - show all vehicles regardless of creation date
      // The KPI should always show total active/inactive vehicles, not time-filtered ones
      
      const onRoad = filteredVehicles.filter((vehicle: any) => 
        vehicle.status === 'Active'
      ).length
      const offRoad = filteredVehicles.filter((vehicle: any) => 
        vehicle.status === 'Inactive' ||
        vehicle.status === 'Suspended' ||
        vehicle.status === 'Maintenance' ||
        vehicle.status === 'Repair'
      ).length
      
      setOnRoadCount(onRoad)
      setOffRoadCount(offRoad)
    }
  }, [fleetTimePeriod, filteredVehicles])
  
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true)
  const [isMapsModalOpen, setIsMapsModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    latitude?: number
    longitude?: number
    vehicleName?: string
  } | null>(null)
  const [recentTrips, setRecentTrips] = useState<Trip[]>([])
  const [isLoadingTrips, setIsLoadingTrips] = useState(true)
  const [tripsFilter, setTripsFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL')
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoadingReminders, setIsLoadingReminders] = useState(true)

  // Google Maps Modal handlers
  const handleOpenMapsModal = (alert: Alert) => {
    const vehicleName = alert.vehicle?.reg_number || alert.alert.unit_name || 'Unknown Vehicle'
    setSelectedLocation({
      address: alert.alert.address || 'Unknown Location',
      latitude: alert.alert.latitude ? parseFloat(alert.alert.latitude) : undefined,
      longitude: alert.alert.longitude ? parseFloat(alert.alert.longitude) : undefined,
      vehicleName
    })
    setIsMapsModalOpen(true)
  }

  const handleCloseMapsModal = () => {
    setIsMapsModalOpen(false)
    setSelectedLocation(null)
  }

  // Fetch recent trips data
  const fetchRecentTrips = async () => {
    try {
      setIsLoadingTrips(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const tripsResponse = await fetch('/api/recent-trips', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (tripsResponse.ok) {
        const tripsData = await tripsResponse.json()
        setRecentTrips(tripsData)
      }
    } catch (error) {
      console.error('Error fetching recent trips:', error)
    } finally {
      setIsLoadingTrips(false)
    }
  }

  // Fetch recent alerts data
  const fetchRecentAlerts = async () => {
    try {
      setIsLoadingAlerts(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const alertsResponse = await fetch('/api/recent-alerts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setRecentAlerts(alertsData)
      }
    } catch (error) {
      console.error('Error fetching recent alerts:', error)
    } finally {
      setIsLoadingAlerts(false)
    }
  }

  // Fetch reminders data
  const fetchReminders = async () => {
    try {
      setIsLoadingReminders(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const remindersResponse = await fetch('/api/reminders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (remindersResponse.ok) {
        const remindersData = await remindersResponse.json()
        setReminders(remindersData)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setIsLoadingReminders(false)
    }
  }

  // Filter trips based on selected filter
  const filteredTrips = recentTrips.filter(trip => {
    switch (tripsFilter) {
      case 'ACTIVE':
        return trip.trip.status === 'Start'
      case 'COMPLETED':
        return trip.trip.status === 'Stop'
      default:
        return true
    }
  })

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch vehicles data
        const vehiclesResponse = await fetch('/api/vehicles')
        if (vehiclesResponse.ok) {
          const vehiclesData = await vehiclesResponse.json()
          
          setVehiclesCount(vehiclesData.length)
          setFilteredVehicles(vehiclesData) // Store vehicles for filtering
          
          // Count on road and off road vehicles - calculate directly from fresh data
          const onRoad = vehiclesData.filter((vehicle: any) => {
            return vehicle.status === 'Active'
          }).length
          
          const offRoad = vehiclesData.filter((vehicle: any) => {
            return vehicle.status === 'Inactive' ||
            vehicle.status === 'Suspended' ||
            vehicle.status === 'Maintenance' ||
            vehicle.status === 'Repair'
          }).length
          
          setOnRoadCount(onRoad)
          setOffRoadCount(offRoad)
        } else {
          const errorData = await vehiclesResponse.json()
          console.error('Vehicles API Error:', {
            status: vehiclesResponse.status,
            statusText: vehiclesResponse.statusText,
            error: errorData,
            url: '/api/vehicles'
          })
        }

        // Fetch drivers data
        const driversResponse = await fetch('/api/drivers')
        if (driversResponse.ok) {
          const driversData = await driversResponse.json()
          setDriversCount(driversData.length)
        } else {
          const errorData = await driversResponse.json()
          console.error('Drivers API Error:', {
            status: driversResponse.status,
            statusText: driversResponse.statusText,
            error: errorData,
            url: '/api/drivers'
          })
        }

        // Fetch insurance data
        const insuranceResponse = await fetch('/api/insurance')
        if (insuranceResponse.ok) {
          const insuranceData = await insuranceResponse.json()
          setInsuranceCount(insuranceData.length)
        } else {
          const errorData = await insuranceResponse.json()
          console.error('Insurance API Error:', {
            status: insuranceResponse.status,
            statusText: insuranceResponse.statusText,
            error: errorData,
            url: '/api/insurance'
          })
        }

        // Fetch maintenance data
        const maintenanceResponse = await fetch('/api/maintenance')
        if (maintenanceResponse.ok) {
          const maintenanceData = await maintenanceResponse.json()
          setMaintenanceCount(maintenanceData.length)
        } else {
          const errorData = await maintenanceResponse.json()
          console.error('Maintenance API Error:', {
            status: maintenanceResponse.status,
            statusText: maintenanceResponse.statusText,
            error: errorData,
            url: '/api/maintenance'
          })
        }

          // Fetch fuel logs data for monthly chart and fuel type distribution
          const fuelResponse = await fetch('/api/fuel-logs')
          if (fuelResponse.ok) {
            const fuelData = await fuelResponse.json()
            const monthlyData = processMonthlyFuelData(fuelData)
            setMonthlyFuelData(monthlyData)
            
            // Calculate fuel type distribution
            const fuelTypeCounts = fuelData.reduce((acc: { petrol: number; diesel: number }, log: any) => {
              const fuelType = (log.fuel_type || '').toLowerCase()
              if (fuelType === 'petrol') {
                acc.petrol += 1
              } else if (fuelType === 'diesel') {
                acc.diesel += 1
              }
              return acc
            }, { petrol: 0, diesel: 0 })
            
            setFuelTypeDistribution(fuelTypeCounts)
        } else {
          const errorData = await fuelResponse.json()
          console.error('Fuel Logs API Error:', {
            status: fuelResponse.status,
            statusText: fuelResponse.statusText,
            error: errorData,
            url: '/api/fuel-logs'
          })
        }

        // Fetch maintenance schedules data
        const maintenanceScheduleResponse = await fetch('/api/maintenance')
        if (maintenanceScheduleResponse.ok) {
          const scheduleData = await maintenanceScheduleResponse.json()
          setMaintenanceSchedules(scheduleData)
        } else {
          const errorData = await maintenanceScheduleResponse.json()
          console.error('Maintenance Schedule API Error:', {
            status: maintenanceScheduleResponse.status,
            statusText: maintenanceScheduleResponse.statusText,
            error: errorData,
            url: '/api/maintenance-schedule'
          })
        }

        // Fetch recent trips data
        await fetchRecentTrips()
        
        // Fetch recent alerts data
        await fetchRecentAlerts()
        
        // Fetch reminders data
        await fetchReminders()
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
        setIsLoadingFuelData(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Process fuel data into monthly format
  const processMonthlyFuelData = (fuelLogs: FuelLog[]): MonthlyFuelData[] => {
    // Group by actual month names from dates
    const monthlyData: { [key: string]: { petrolCost: number; dieselCost: number } } = {}
    
    // Process each fuel log with its actual date
    fuelLogs.forEach((log) => {
      try {
        const date = new Date(log.refuel_date)
        const month = date.toLocaleDateString('en-US', { month: 'short' })
        const fuelType = (log.fuel_type || '').toLowerCase()
        const totalCost = Number(log.total_cost) || 0
        
        // Initialize month if not exists
        if (!monthlyData[month]) {
          monthlyData[month] = { petrolCost: 0, dieselCost: 0 }
        }
        
        // Categorize by fuel type
        if (fuelType === 'diesel') {
          monthlyData[month].dieselCost += totalCost
        } else {
          // Default to petrol for petrol, gas, or unknown types
          monthlyData[month].petrolCost += totalCost
        }
      } catch (error) {
        console.error('Error processing fuel log:', error, log)
      }
    })
    
    // Get all 12 months in order, starting from January
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Convert to array format, showing all 12 months with data (zero for months without data)
    const result = monthNames.map(month => {
      const data = monthlyData[month] || { petrolCost: 0, dieselCost: 0 }
      return {
        month: month,
        petrolCost: data.petrolCost,
        dieselCost: data.dieselCost,
        totalCost: data.petrolCost + data.dieselCost
      }
    })
    
    return result
  }

  // Process maintenance schedules to get upcoming maintenance
  const getUpcomingMaintenance = (schedules: MaintenanceSchedule[]): MaintenanceSchedule[] => {
    const today = new Date()
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return schedules
      .filter(schedule => {
        // Use service_date if available, otherwise fall back to due_date
        const scheduleDate = schedule.service_date || schedule.due_date
        if (!scheduleDate) return false
        
        const targetDate = new Date(scheduleDate)
        return targetDate >= today && targetDate <= sevenDaysFromNow
      })
      .sort((a, b) => {
        const dateA = new Date(a.service_date || a.due_date || '')
        const dateB = new Date(b.service_date || b.due_date || '')
        return dateA.getTime() - dateB.getTime()
      })
      // Remove slice to show all items - will be made scrollable in UI
  }

  // Calculate days until maintenance is due
  const getDaysUntilDue = (schedule: MaintenanceSchedule): number => {
    const today = new Date()
    const dueDate = schedule.service_date || schedule.due_date
    if (!dueDate) return 0
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const kpiCards = [
    {
      title: 'Vehicles',
      value: loading ? '...' : vehiclesCount.toString(),
      subtitle: 'All Vehicles',
      subtitleLink: '/vehicles',
      icon: TruckIcon,
      color: 'blue'
    },
    {
      title: 'Drivers',
      value: loading ? '...' : driversCount.toString(),
      subtitle: 'All Drivers',
      subtitleLink: '/drivers',
      icon: UserGroupIcon,
      color: 'blue'
    },
    {
      title: 'Insurance/Roadworthy',
      value: loading ? '...' : insuranceCount.toString(),
      subtitle: 'All Insurances',
      subtitleLink: '/insurance',
      icon: ShieldCheckIcon,
      color: 'blue'
    },
    {
      title: 'Active Vehicles',
      value: loading ? '...' : onRoadCount.toString(),
      subtitle: 'All Active Vehicles',
      subtitleLink: '/vehicles?status=Active',
      icon: TruckIcon,
      color: 'blue'
    },
    {
      title: 'Inactive Vehicles',
      value: loading ? '...' : offRoadCount.toString(),
      subtitle: 'All Inactive Vehicles',
      subtitleLink: '/vehicles?status=Inactive',
      icon: TruckIcon,
      color: 'blue'
    },
    {
      title: 'Maintenance',
      value: loading ? '...' : maintenanceCount.toString(),
      subtitle: 'All Maintenance',
      subtitleLink: '/maintenance',
      icon: WrenchScrewdriverIcon,
      color: 'blue'
    }
  ]

  const getStatusIcon = (status: string) => {
    if (status === 'Start') {
      return <PlayIcon className="w-5 h-5 text-green-600" />
    }
    return <StopIcon className="w-5 h-5 text-blue-600" />
  }

  const getStatusColor = (status: string) => {
    return status === 'Start' ? 'text-green-600' : 'text-blue-600'
  }

  return (
    <div className={`space-y-6 mt-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <div key={index} className={`p-6 rounded-2xl ${
              themeMode === 'dark' 
                ? 'bg-navy-800' 
                : 'bg-white'
            }`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${
                  themeMode === 'dark' ? 'bg-navy-700' : 'bg-gray-100'
                }`}>
                  <IconComponent className={`w-6 h-6 ${
getBrandColor(themeColor)
                }`} />
              </div>
                <div className="ml-4">
              <h3 className={`text-sm font-medium ${
                themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {card.title}
              </h3>
              <p className={`text-2xl font-bold ${
                    themeMode === 'dark' ? 'text-white' : 'text-navy-700'
              }`}>
                {card.value}
              </p>
                </div>
              </div>
              <div className="flex justify-end mt-2">
              <Link 
                href={card.subtitleLink} 
                  className={`flex items-center text-xs ${getBrandColor(themeColor)} hover:opacity-80 transition-colors`}
                  title={card.title === 'Active Vehicles' ? 'View all vehicles (filter by Active status)' : 
                         card.title === 'Inactive Vehicles' ? 'View all vehicles (filter by Inactive status)' : 
                       `View all ${card.title.toLowerCase()}`}
              >
                  <ChevronRightIcon className="w-3 h-3 mr-1" />
                {card.subtitle}
              </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          {/* Monthly Fuel Expenses Chart */}
          <div className={`p-6 rounded-2xl mb-6 h-96 ${
            themeMode === 'dark' 
              ? 'bg-navy-800' 
              : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Monthly Fuel Expenses
              </h3>
              <div className="p-2 rounded-3xl bg-blue-100">
                <BoltIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative">
              {isLoadingFuelData ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
              ) : (
                <div className="flex items-end justify-between h-48 px-2">
                  {monthlyFuelData.map((monthData, index) => {
                    const maxCost = Math.max(...monthlyFuelData.map(m => m.totalCost || 0))
                    const petrolHeight = maxCost > 0 ? ((monthData.petrolCost || 0) / maxCost) * 100 : 0
                    const dieselHeight = maxCost > 0 ? ((monthData.dieselCost || 0) / maxCost) * 100 : 0
                    const isHovered = hoveredMonth === monthData.month
                    
                    return (
                      <div 
                        key={index} 
                        className="flex flex-col items-center space-y-1 cursor-pointer group"
                        onMouseEnter={() => setHoveredMonth(monthData.month)}
                        onMouseLeave={() => setHoveredMonth(null)}
                        onClick={() => {
                          // Navigate to fuel logs page with month filter
                          window.location.href = `/fuel?month=${monthData.month}`
                        }}
                      >
                        <div className="relative w-8 h-40">
                          {/* Petrol bar (bottom, blue) */}
                          <div 
                            className={`absolute bottom-0 w-full bg-blue-500 rounded-t transition-all duration-200 ${
                              isHovered ? 'opacity-90 scale-105' : ''
                            }`}
                            style={{height: `${Math.max(petrolHeight - 2, 0)}%`}}
                          ></div>
                          
                          {/* Diesel bar (top, green, inverted) */}
                          <div 
                            className={`absolute top-0 w-full bg-green-500 rounded-b transition-all duration-200 ${
                              isHovered ? 'opacity-90 scale-105' : ''
                            }`}
                            style={{height: `${Math.max(dieselHeight - 2, 0)}%`}}
                          ></div>
                          
                          {/* Tooltip */}
                          {isHovered && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-3xl shadow-lg whitespace-nowrap z-10">
                              <div className="text-center">
                                <div className="font-semibold">{monthData.month}</div>
                                <div>Petrol: ₵{(monthData.petrolCost || 0).toFixed(2)}</div>
                                <div>Diesel: ₵{(monthData.dieselCost || 0).toFixed(2)}</div>
                                <div className="font-semibold border-t border-gray-700 pt-1 mt-1">
                                  Total: ₵{(monthData.totalCost || 0).toFixed(2)}
                                </div>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </div>
                        <span className={`text-xs transition-colors duration-200 ${
                          isHovered ? 'text-blue-600 font-semibold' : 'text-gray-500'
                        }`}>
                          {monthData.month}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Petrol</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Diesel</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <GoogleFleetMapWrapper />
          
          {/* Maintenance and Reminders Tables under Map */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Maintenance Due */}
          <div className={`p-6 rounded-2xl ${
              themeMode === 'dark' 
              ? 'bg-navy-800 border-navy-700' 
                : 'bg-white border-gray-200'
          }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-lg font-semibold ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Maintenance Due
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Maintenance</span>
                  <span className="text-sm text-gray-500">Due</span>
                </div>
              </div>
              <div className="mb-3">
                <Link 
                  href="/maintenance" 
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ChevronRightIcon className="w-3 h-3 mr-1" />
                  All
                </Link>
              </div>
              <div className={`space-y-3 ${getUpcomingMaintenance(maintenanceSchedules).length > 3 ? 'max-h-96 overflow-y-auto' : ''}`}>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : getUpcomingMaintenance(maintenanceSchedules).length > 0 ? (
                  getUpcomingMaintenance(maintenanceSchedules).map((schedule) => {
                    const daysLeft = getDaysUntilDue(schedule)
                    const isUrgent = daysLeft <= 3
                    const isWarning = daysLeft <= 7
                    
                    return (
                      <div 
                        key={schedule.id}
                        className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${
                          themeMode === 'dark' 
                            ? 'bg-navy-700 hover:bg-navy-600' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {(schedule.vehicles?.reg_number || schedule.vehicle_reg || 'N/A')} - {schedule.service_type || 'Maintenance'}
                          </p>
                          <p className={`text-xs ${
                            isUrgent ? 'text-red-500' : 
                            isWarning ? 'text-yellow-500' : 
                            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {daysLeft === 0 ? 'Due today' : 
                             daysLeft === 1 ? 'Due tomorrow' : 
                             daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` :
                             `${daysLeft} days left`}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          isUrgent ? 'bg-red-500' : 
                          isWarning ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}></div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        No upcoming maintenance
                      </div>
                      <div className={`text-xs ${
                        themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        All maintenance is up to date
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reminders Due */}
          <div className={`p-6 rounded-2xl  ${
              themeMode === 'dark' 
              ? 'bg-navy-800 border-navy-700' 
                : 'bg-white border-gray-200'
          }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-lg font-semibold ${
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Reminders Due
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Reminder</span>
                  <span className="text-sm text-gray-500">Due</span>
                </div>
              </div>
              <div className="mb-3">
                <Link 
                  href="/reminders" 
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ChevronRightIcon className="w-3 h-3 mr-1" />
                  All
                </Link>
              </div>
              <div className="space-y-3">
                {isLoadingReminders ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : reminders.slice(0, 3).length > 0 ? (
                  reminders.slice(0, 3).map((reminder) => {
                    const isUrgent = reminder.urgency === 'high'
                    const isWarning = reminder.urgency === 'medium'
                    
                    return (
                      <div 
                        key={reminder.id}
                        className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${
                          themeMode === 'dark' 
                            ? 'bg-navy-700 hover:bg-navy-600' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {reminder.title}
                          </p>
                          <p className={`text-xs ${
                            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {reminder.description}
                          </p>
                          <p className={`text-xs mt-1 ${
                            isUrgent ? 'text-red-500' : 
                            isWarning ? 'text-yellow-500' : 
                            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {reminder.daysUntilExpiry === 0 ? 'Expires today' : 
                             reminder.daysUntilExpiry === 1 ? 'Expires tomorrow' : 
                             `${reminder.daysUntilExpiry} days left`}
                          </p>
                </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            reminder.type === 'Driver License' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                            reminder.type === 'Insurance' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                            'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {reminder.type}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            isUrgent ? 'bg-red-500' : 
                            isWarning ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}></div>
                  </div>
                </div>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        No reminders due
                  </div>
                      <div className={`text-xs ${
                        themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        All items are up to date
                </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Pie Chart, Recent Trips and Alerts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pie Chart Section */}
          <div className={`p-6 rounded-2xl ${
            themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Fuel Type Distribution
              </h3>
              <div className="flex items-center gap-2">
                <select 
                  value={fleetTimePeriod}
                  onChange={(e) => setFleetTimePeriod(e.target.value as 'weekly' | 'monthly' | 'yearly')}
                  className={`px-3 py-1 rounded text-sm border ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 120 120">
                  <defs>
                    {/* Gradient definitions for fuel types */}
                    <linearGradient id="petrolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="dieselGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6b7280" />
                      <stop offset="100%" stopColor="#4b5563" />
                    </linearGradient>
                  </defs>
                  
                  {(() => {
                    // Create fuel type distribution data
                    const fleetData = [
                      { type: 'Petrol', count: fuelTypeDistribution.petrol },
                      { type: 'Diesel', count: fuelTypeDistribution.diesel }
                    ].filter(item => item.count > 0)
                    
                    if (fleetData.length === 0) {
                      return (
                        <g>
                          <circle cx="60" cy="60" r="50" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2" />
                          <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-gray-500">
                            No Data
                          </text>
                        </g>
                      )
                    }
                    
                    const total = fleetData.reduce((sum, item) => sum + item.count, 0)
                    let currentAngle = 0
                    const innerRadius = 30
                    const outerRadius = 50
                    
                    return fleetData.map((item, index) => {
                      const percentage = (item.count / total) * 100
                      const angle = (percentage / 100) * 360
                      const startAngle = currentAngle
                      const endAngle = currentAngle + angle
                      currentAngle += angle
                      
                      const startAngleRad = (startAngle - 90) * (Math.PI / 180)
                      const endAngleRad = (endAngle - 90) * (Math.PI / 180)
                      
                      // Outer arc coordinates
                      const x1 = 60 + outerRadius * Math.cos(startAngleRad)
                      const y1 = 60 + outerRadius * Math.sin(startAngleRad)
                      const x2 = 60 + outerRadius * Math.cos(endAngleRad)
                      const y2 = 60 + outerRadius * Math.sin(endAngleRad)
                      
                      // Inner arc coordinates
                      const x3 = 60 + innerRadius * Math.cos(endAngleRad)
                      const y3 = 60 + innerRadius * Math.sin(endAngleRad)
                      const x4 = 60 + innerRadius * Math.cos(startAngleRad)
                      const y4 = 60 + innerRadius * Math.sin(startAngleRad)
                      
                      const largeArcFlag = angle > 180 ? 1 : 0
                      
                      const pathData = [
                        `M ${x1} ${y1}`,
                        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        `L ${x3} ${y3}`,
                        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                        `Z`
                      ].join(' ')
                      
                      // Get gradient ID based on fuel type
                      const getGradientId = (type: string) => {
                        switch (type) {
                          case 'Petrol': return 'url(#petrolGradient)'
                          case 'Diesel': return 'url(#dieselGradient)'
                          default: return 'url(#petrolGradient)'
                        }
                      }
                      
                      return (
                        <path
                          key={item.type}
                          d={pathData}
                          fill={getGradientId(item.type)}
                          stroke="white"
                          strokeWidth="1"
                          className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect()
                            if (svgRect) {
                              setFleetTooltipPosition({
                                x: rect.left - svgRect.left + rect.width / 2,
                                y: rect.top - svgRect.top - 10
                              })
                              setHoveredFleetSegment({
                                type: item.type,
                                count: item.count,
                                percentage: percentage
                              })
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredFleetSegment(null)
                          }}
                        />
                      )
                    })
                  })()}
                  
                  {/* Center content */}
                  <circle cx="60" cy="60" r="25" fill="white" />
                  <circle cx="60" cy="60" r="25" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                  
                  {/* Fleet icon */}
                  <g transform="translate(50, 50)">
                    <path
                      d="M20 4h-4V2c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2H0v2h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6h2V4h-4zM6 2h8v2H6V2zm10 16H4V6h12v12z"
                      fill="#10b981"
                      transform="scale(0.7)"
                    />
                  </g>
                  
                </svg>
                
                {/* Tooltip */}
                {hoveredFleetSegment && (
                  <div 
                    className={`absolute z-10 px-3 py-2 rounded-lg shadow-lg text-sm font-medium pointer-events-none ${
                      themeMode === 'dark' 
                        ? 'bg-gray-800 text-white border border-gray-600' 
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                    style={{
                      left: `${fleetTooltipPosition.x}px`,
                      top: `${fleetTooltipPosition.y}px`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{hoveredFleetSegment.type}</div>
                      <div className="text-xs mt-1">
                        <div>Count: {hoveredFleetSegment.count}</div>
                        <div>Percentage: {hoveredFleetSegment.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modern Legend */}
            <div className="mt-4 grid grid-cols-1 gap-2">
              {(() => {
                const fleetData = [
                  { type: 'Petrol', count: fuelTypeDistribution.petrol },
                  { type: 'Diesel', count: fuelTypeDistribution.diesel }
                ].filter(item => item.count > 0)
                
                const total = fleetData.reduce((sum, item) => sum + item.count, 0)
                
                return fleetData.map((item, index) => {
                  const percentage = ((item.count / total) * 100).toFixed(0)
                  
                  const getFuelTypeColor = (type: string) => {
                    switch (type) {
                      case 'Petrol': return '#f59e0b'
                      case 'Diesel': return '#6b7280'
                      default: return '#f59e0b'
                    }
                  }
                  
                  return (
                    <div key={item.type} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-navy-700">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shadow-sm" 
                          style={{ backgroundColor: getVehicleTypeColor(item.type) }}
                        ></div>
                        <span className={`text-xs font-medium ${themeMode === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.count}
                        </div>
                        <div className={`text-xs ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>

          {/* Recent Trips Section */}
          <div className={`p-6 rounded-2xl h-[500px] flex flex-col ${
            themeMode === 'dark' 
              ? 'bg-navy-800' 
              : 'bg-white'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Trips
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchRecentTrips}
                  disabled={isLoadingTrips}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    isLoadingTrips 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : themeMode === 'dark' 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isLoadingTrips ? 'Loading...' : 'Refresh'}
              </button>
                <div className="text-sm text-gray-500">
                  {filteredTrips.length} trips
                </div>
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="mb-4">
              <select 
                value={tripsFilter}
                onChange={(e) => setTripsFilter(e.target.value as 'ALL' | 'ACTIVE' | 'COMPLETED')}
                className={`w-full p-2 rounded border text-sm ${
                themeMode === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="ALL">ALL TRIPS</option>
                <option value="ACTIVE">ACTIVE TRIPS</option>
                <option value="COMPLETED">COMPLETED TRIPS</option>
              </select>
            </div>

            {/* Trips List - Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {isLoadingTrips ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredTrips.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No {tripsFilter.toLowerCase()} trips found
                    </p>
                  </div>
                </div>
              ) : (
                filteredTrips.map((trip) => (
                  <div key={trip.id} className={`p-3 rounded-xl border ${
                  themeMode === 'dark' 
                    ? 'bg-navy-700 border-navy-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  {/* Trip Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        {getStatusIcon(trip.trip.status)}
                        <span className={`text-xs font-medium ${getStatusColor(trip.trip.status)}`}>
                          {trip.trip.status}
                      </span>
                    </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                          {trip.trip.time}
                    </span>
                        <div className={`text-xs ${
                          themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {trip.trip.timeAgo}
                        </div>
                      </div>
                  </div>

                    {/* Vehicle Name - Primary Info */}
                  <div className="mb-2">
                      <div className="flex items-center space-x-2">
                        <TruckIcon className={`w-4 h-4 ${getBrandColor(themeColor)} flex-shrink-0`} />
                        <h4 className={`text-sm font-semibold ${
                      themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                          {trip.vehicle.reg_number}
                        </h4>
                      </div>
                      {trip.vehicle.name && trip.vehicle.name !== trip.vehicle.reg_number && (
                        <p className={`text-xs truncate max-w-full ml-6 ${
                          themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} title={trip.vehicle.name}>
                          {trip.vehicle.name.length > 25 ? 
                            `${trip.vehicle.name.substring(0, 25)}...` : 
                            trip.vehicle.name
                          }
                        </p>
                      )}
                  </div>

                    {/* Location - Secondary Info */}
                    <div className="mb-1">
                      <div className="flex items-start space-x-2">
                        <MapPinIcon className={`w-3 h-3 ${getBrandColor(themeColor)} mt-0.5 flex-shrink-0`} />
                        <p className={`text-xs break-words ${
                        themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                          {trip.position?.address || trip.address || 'Unknown Location'}
                        </p>
                    </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Recent Alerts Section */}
          <div className={`p-6 rounded-2xl ${
            themeMode === 'dark' 
              ? 'bg-navy-800' 
              : 'bg-white'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Alerts
              </h3>
              <div className="flex items-center gap-3">
                {!isLoadingAlerts && (
                  <span className={`text-xs font-medium ${
                    themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {recentAlerts.length} Alerts
                  </span>
                )}
              <button className={`text-sm ${getIconColor(themeColor)} hover:opacity-80`}>
                View all
              </button>
              </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-3 pb-2 max-h-80 overflow-y-auto">
              {isLoadingAlerts ? (
                <div className={`text-center py-8 ${
                  themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-sm">Loading alerts...</p>
                </div>
              ) : recentAlerts.length === 0 ? (
                <div className={`text-center py-8 ${
                  themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <p className="text-sm">No recent alerts</p>
                </div>
              ) : (
                recentAlerts.map((alert) => {
                  // Get alert type color
                  const getAlertTypeColor = (alertType: string) => {
                    switch (alertType?.toLowerCase()) {
                      case 'warning':
                      case 'warn':
                        return 'text-orange-500'
                      case 'error':
                      case 'critical':
                      case 'emergency':
                        return 'text-red-500'
                      case 'info':
                      case 'information':
                        return 'text-blue-500'
                      case 'success':
                      case 'completed':
                        return 'text-green-500'
                      case 'maintenance':
                        return 'text-purple-500'
                      case 'fuel':
                        return 'text-yellow-600'
                      case 'speed':
                        return 'text-pink-500'
                      default:
                        return 'text-gray-500'
                    }
                  }

                  // Get alert type background color
                  const getAlertTypeBgColor = (alertType: string) => {
                    switch (alertType?.toLowerCase()) {
                      case 'warning':
                      case 'warn':
                        return 'bg-orange-500'
                      case 'error':
                      case 'critical':
                      case 'emergency':
                        return 'bg-red-500'
                      case 'info':
                      case 'information':
                        return 'bg-blue-500'
                      case 'success':
                      case 'completed':
                        return 'bg-green-500'
                      case 'maintenance':
                        return 'bg-purple-500'
                      case 'fuel':
                        return 'bg-yellow-600'
                      case 'speed':
                        return 'bg-pink-500'
                      default:
                        return 'bg-gray-500'
                    }
                  }

                  // Get alert type icon
                  const getAlertTypeIcon = (alertType: string) => {
                    switch (alertType?.toLowerCase()) {
                      case 'warning':
                      case 'warn':
                        return <ExclamationTriangleIcon className="w-4 h-4" />
                      case 'error':
                      case 'critical':
                      case 'emergency':
                        return <XCircleIcon className="w-4 h-4" />
                      case 'info':
                      case 'information':
                        return <InformationCircleIcon className="w-4 h-4" />
                      case 'success':
                      case 'completed':
                        return <CheckCircleIcon className="w-4 h-4" />
                      case 'maintenance':
                        return <WrenchScrewdriverIcon className="w-4 h-4" />
                      case 'fuel':
                        return <BeakerIcon className="w-4 h-4" />
                      case 'speed':
                        return <TruckIcon className="w-4 h-4" />
                      default:
                        return <BellIcon className="w-4 h-4" />
                    }
                  }

                  return (
                <div key={alert.id} className={`p-4 rounded-2xl border ${
                  themeMode === 'dark' 
                    ? 'bg-navy-700 border-navy-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  {/* Alert Header */}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-sm font-semibold ${
                      themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                          {alert.alert.unit_name || alert.vehicle.reg_number}
                    </h4>
                        <button 
                          onClick={() => handleOpenMapsModal(alert)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Location on Map"
                        >
                          <MapPinIcon className={`w-4 h-4 ${getBrandColor(themeColor)}`} />
                        </button>
                      </div>

                  {/* Timestamp */}
                  <p className={`text-xs mb-2 ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                        {formatDateTime(alert.alert.last_reported_time_utc)}
                  </p>

                      {/* Alert Description */}
                  <div className="flex items-start space-x-2">
                        <div className={getAlertTypeColor(alert.alert.alert_type)}>
                          {getAlertTypeIcon(alert.alert.alert_type)}
                        </div>
                    <p className={`text-sm ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                          {alert.alert.alert_description || 'No description available'}
                    </p>
                  </div>
                </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Settings Button */}
      <FloatingSettings />

      {/* Google Maps Modal */}
      {isMapsModalOpen && selectedLocation && (
        <GoogleMapsModal
          isOpen={isMapsModalOpen}
          onClose={handleCloseMapsModal}
          address={selectedLocation.address}
          latitude={selectedLocation.latitude}
          longitude={selectedLocation.longitude}
          themeMode={themeMode}
          vehicleName={selectedLocation.vehicleName || 'Vehicle Location'}
        />
      )}
    </div>
  )
}
