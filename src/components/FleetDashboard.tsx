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
  Cog6ToothIcon,
  ChevronRightIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import { getIconColor } from '@/lib/themeUtils'
import FleetMapWrapper from './FleetMapWrapper'

interface Trip {
  id: string
  status: 'Start' | 'Stop'
  time: string
  location: string
  driver: string
  vehicle: string
  details?: {
    time: string
    distance: string
    incidents: string
  }
}

interface Alert {
  id: string
  vehicleName: string
  timestamp: string
  message: string
  type: 'warning' | 'info' | 'error'
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
  due_date: string
  vehicle_id: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  vehicles: {
    reg_number: string
    trim: string
    year: number
    status: string
  }
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
      const timeFilteredVehicles = filterVehiclesByTimePeriod(filteredVehicles, fleetTimePeriod)
      
      // Count on road and off road vehicles for the filtered period
      const onRoad = timeFilteredVehicles.filter((vehicle: any) => 
        vehicle.status?.toLowerCase() === 'active' || 
        vehicle.status?.toLowerCase() === 'on-road'
      ).length
      const offRoad = timeFilteredVehicles.filter((vehicle: any) => 
        vehicle.status?.toLowerCase() === 'inactive' || 
        vehicle.status?.toLowerCase() === 'off-road' ||
        vehicle.status?.toLowerCase() === 'maintenance' ||
        vehicle.status?.toLowerCase() === 'repair'
      ).length
      
      setOnRoadCount(onRoad)
      setOffRoadCount(offRoad)
    }
  }, [fleetTimePeriod, filteredVehicles])
  
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([
    {
      id: '1',
      vehicleName: "David's Van",
      timestamp: 'Today at 12:23',
      message: 'Out of hours used Detected',
      type: 'warning'
    },
    {
      id: '2',
      vehicleName: "David's Van",
      timestamp: 'Today at 12:23',
      message: 'Entered Kwame Nkrumah Mausoleum, Accra',
      type: 'info'
    }
  ])
  const [recentTrips, setRecentTrips] = useState<Trip[]>([
    {
      id: '1',
      status: 'Start',
      time: '17:16',
      location: 'Agbado, 24 Accra Main, Osu',
      driver: 'Osei Kyei',
      vehicle: 'GE 1245 -19'
    },
    {
      id: '2',
      status: 'Stop',
      time: '17:36',
      location: 'Papaye, 16 Loop Main, Osu',
      driver: 'Saint Obi',
      vehicle: 'GN 2266 -21',
      details: {
        time: '30 mins driving',
        distance: '16 KM',
        incidents: '2 Incidents'
      }
    }
  ])

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
          
          // Count on road and off road vehicles
          const onRoad = vehiclesData.filter((vehicle: any) => 
            vehicle.status?.toLowerCase() === 'active' || 
            vehicle.status?.toLowerCase() === 'on-road'
          ).length
          const offRoad = vehiclesData.filter((vehicle: any) => 
            vehicle.status?.toLowerCase() === 'inactive' || 
            vehicle.status?.toLowerCase() === 'off-road' ||
            vehicle.status?.toLowerCase() === 'maintenance' ||
            vehicle.status?.toLowerCase() === 'repair'
          ).length
          
          setOnRoadCount(onRoad)
          setOffRoadCount(offRoad)
        }

        // Fetch drivers data
        const driversResponse = await fetch('/api/drivers')
        if (driversResponse.ok) {
          const driversData = await driversResponse.json()
          setDriversCount(driversData.length)
        }

        // Fetch insurance data
        const insuranceResponse = await fetch('/api/insurance')
        if (insuranceResponse.ok) {
          const insuranceData = await insuranceResponse.json()
          setInsuranceCount(insuranceData.length)
        }

        // Fetch maintenance data
        const maintenanceResponse = await fetch('/api/maintenance')
        if (maintenanceResponse.ok) {
          const maintenanceData = await maintenanceResponse.json()
          setMaintenanceCount(maintenanceData.length)
        }

          // Fetch fuel logs data for monthly chart
          const fuelResponse = await fetch('/api/fuel-logs')
          if (fuelResponse.ok) {
            const fuelData = await fuelResponse.json()
            const monthlyData = processMonthlyFuelData(fuelData)
            setMonthlyFuelData(monthlyData)
        }

        // Fetch maintenance schedules data
        const maintenanceScheduleResponse = await fetch('/api/maintenance-schedule')
        if (maintenanceScheduleResponse.ok) {
          const scheduleData = await maintenanceScheduleResponse.json()
          setMaintenanceSchedules(scheduleData)
        }
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
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    return schedules
      .filter(schedule => {
        const dueDate = new Date(schedule.due_date)
        return dueDate >= today && dueDate <= thirtyDaysFromNow
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 3) // Show only top 3 upcoming maintenance
  }

  // Calculate days until maintenance is due
  const getDaysUntilDue = (dueDate: string): number => {
    const today = new Date()
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
      subtitleLink: '/vehicles',
      icon: TruckIcon,
      color: 'blue'
    },
    {
      title: 'Inactive Vehicles',
      value: loading ? '...' : offRoadCount.toString(),
      subtitle: 'All Inactive Vehicles',
      subtitleLink: '/vehicles',
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
                    card.color === 'blue' ? 'text-brand-500' : getIconColor(themeColor)
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
                  className="flex items-center text-xs text-brand-500 hover:text-brand-600 transition-colors"
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
          <FleetMapWrapper />
          
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
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : getUpcomingMaintenance(maintenanceSchedules).length > 0 ? (
                  getUpcomingMaintenance(maintenanceSchedules).map((schedule) => {
                    const daysLeft = getDaysUntilDue(schedule.due_date)
                    const isUrgent = daysLeft <= 7
                    const isWarning = daysLeft <= 14
                    
                    return (
                      <div 
                        key={schedule.id}
                        className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${
                          themeMode === 'dark' 
                            ? 'bg-gray-700 hover:bg-gray-600' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {schedule.vehicles.reg_number} - {schedule.vehicles.trim} ({schedule.vehicles.year})
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
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ike&apos;s BMW - Insurance</p>
                    <p className="text-xs text-gray-500">30 Days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ansah&apos;s VW - MOT</p>
                    <p className="text-xs text-gray-500">54 Days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Quaye&apos;s Car - Road Tax</p>
                    <p className="text-xs text-gray-500">30 Days left</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Pie Chart, Recent Trips and Alerts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pie Chart Section */}
          <div className={`p-6 rounded-2xl h-96 ${
            themeMode === 'dark' ? 'bg-navy-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Fleet Distribution
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
            
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 120 120">
                  <defs>
                    {/* Gradient definitions */}
                    <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                  
                  {(() => {
                    // Create fleet distribution data
                    const fleetData = [
                      { type: 'Active Vehicles', count: onRoadCount },
                      { type: 'Inactive Vehicles', count: offRoadCount }
                    ].filter(item => item.count > 0)
                    
                    if (fleetData.length === 0) return null
                    
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
                      
                      // Get gradient ID based on vehicle type
                      const getGradientId = (type: string) => {
                        switch (type) {
                          case 'Active Vehicles': return 'url(#activeGradient)'
                          case 'Inactive Vehicles': return 'url(#inactiveGradient)'
                          default: return 'url(#activeGradient)'
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
            <div className="mt-6 grid grid-cols-1 gap-3">
              {(() => {
                const fleetData = [
                  { type: 'Active Vehicles', count: onRoadCount },
                  { type: 'Inactive Vehicles', count: offRoadCount }
                ].filter(item => item.count > 0)
                
                const total = fleetData.reduce((sum, item) => sum + item.count, 0)
                
                return fleetData.map((item, index) => {
                  const percentage = ((item.count / total) * 100).toFixed(0)
                  
                  const getVehicleTypeColor = (type: string) => {
                    switch (type) {
                      case 'Active Vehicles': return '#10b981'
                      case 'Inactive Vehicles': return '#ef4444'
                      default: return '#10b981'
                    }
                  }
                  
                  return (
                    <div key={item.type} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shadow-sm" 
                          style={{ backgroundColor: getVehicleTypeColor(item.type) }}
                        ></div>
                        <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                Recent Trips
              </h3>
              <button className={`text-sm ${getIconColor(themeColor)} hover:opacity-80`}>
                View all
              </button>
            </div>

            {/* Filter Dropdown */}
            <div className="mb-4">
              <select className={`w-full p-2 rounded border text-sm ${
                themeMode === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}>
                <option>ALL TRIPS</option>
                <option>ACTIVE TRIPS</option>
                <option>COMPLETED TRIPS</option>
              </select>
            </div>

            {/* Trips List */}
            <div className="space-y-3">
              {recentTrips.map((trip) => (
                <div key={trip.id} className={`p-4 rounded-2xl border ${
                  themeMode === 'dark' 
                    ? 'bg-navy-700 border-navy-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  {/* Trip Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(trip.status)}
                      <span className={`text-sm font-medium ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </div>
                    <span className={`text-sm ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {trip.time}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="mb-2">
                    <p className={`text-sm font-medium ${
                      themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {trip.location}
                    </p>
                  </div>

                  {/* Driver and Vehicle */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="w-4 h-4 text-brand-500" />
                      <span className={`text-xs ${
                        themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {trip.driver}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TruckIcon className="w-4 h-4 text-brand-500" />
                      <span className={`text-xs ${
                        themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {trip.vehicle}
                      </span>
                    </div>
                  </div>

                  {/* Trip Details */}
                  {trip.details && (
                    <div className={`pt-2 border-t ${
                      themeMode === 'dark' ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4 text-brand-500" />
                          <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            {trip.details.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4 text-brand-500" />
                          <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            {trip.details.distance}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                          <span className="text-red-500">
                            {trip.details.incidents}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Settings Icon */}
            <div className="mt-4 flex justify-end">
              <button className={`p-2 rounded hover:bg-opacity-10 ${
                themeMode === 'dark' ? 'hover:bg-white' : 'hover:bg-gray-100'
              }`}>
                <Cog6ToothIcon className="w-5 h-5 text-brand-500" />
              </button>
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
              <button className={`text-sm ${getIconColor(themeColor)} hover:opacity-80`}>
                View all
              </button>
            </div>

            {/* Alerts List */}
            <div className="space-y-3 pb-2">
              {recentAlerts.map((alert) => (
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
                      {alert.vehicleName}
                    </h4>
                    <MapPinIcon className="w-4 h-4 text-brand-500" />
                  </div>

                  {/* Timestamp */}
                  <p className={`text-xs mb-2 ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {alert.timestamp}
                  </p>

                  {/* Alert Message */}
                  <div className="flex items-start space-x-2">
                    <ClockIcon className={`w-4 h-4 mt-0.5 ${
                      alert.type === 'warning' ? 'text-orange-500' :
                      alert.type === 'error' ? 'text-red-500' : 'text-blue-500'
                    }`} />
                    <p className={`text-sm ${
                      themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
