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
  baseCost: number
  additionalCost: number
  totalCost: number
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
  const [isLoadingFuelData, setIsLoadingFuelData] = useState(true)
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null)
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
          
          // Count on road and off road vehicles
          const onRoad = vehiclesData.filter((vehicle: any) => 
            vehicle.status?.toLowerCase() === 'active' || 
            vehicle.status?.toLowerCase() === 'on-road'
          ).length
          const offRoad = vehiclesData.filter((vehicle: any) => 
            vehicle.status?.toLowerCase() === 'inactive' || 
            vehicle.status?.toLowerCase() === 'off-road'
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
    // Group by month names (last 12 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyData: { [key: string]: { baseCost: number; additionalCost: number } } = {}
    
    // Initialize 12 months
    monthNames.forEach(month => {
      monthlyData[month] = { baseCost: 0, additionalCost: 0 }
    })
    
    // Sort fuel logs by date (newest first)
    const sortedLogs = [...fuelLogs].sort((a, b) => 
      new Date(b.refuel_date).getTime() - new Date(a.refuel_date).getTime()
    )
    
    // Distribute logs across the 12 months (most recent logs get recent months)
    sortedLogs.forEach((log, index) => {
      const monthIndex = Math.min(11, Math.max(0, Math.floor(index / Math.ceil(sortedLogs.length / 12))))
      const monthKey = monthNames[monthIndex]
      
      const totalCost = Number(log.total_cost) || 0
      const baseCost = totalCost * 0.7
      const additionalCost = totalCost * 0.3
      
      monthlyData[monthKey].baseCost += baseCost
      monthlyData[monthKey].additionalCost += additionalCost
    })
    
    // Convert to array format
    const result = monthNames.map(month => {
      const data = monthlyData[month]
      return {
        month: month,
        baseCost: data.baseCost,
        additionalCost: data.additionalCost,
        totalCost: data.baseCost + data.additionalCost
      }
    })
    
    return result
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
                    const maxCost = Math.max(...monthlyFuelData.map(m => m.totalCost))
                    const baseHeight = maxCost > 0 ? (monthData.baseCost / maxCost) * 100 : 0
                    const additionalHeight = maxCost > 0 ? (monthData.additionalCost / maxCost) * 100 : 0
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
                          <div className="absolute bottom-0 w-full bg-gray-200 rounded-t"></div>
                          <div 
                            className={`absolute bottom-0 w-full bg-blue-500 rounded-t transition-all duration-200 ${
                              isHovered ? 'opacity-90 scale-105' : ''
                            }`}
                            style={{height: `${additionalHeight}%`}}
                          ></div>
                          <div 
                            className={`absolute bottom-0 w-full bg-blue-400 rounded-t transition-all duration-200 ${
                              isHovered ? 'opacity-90 scale-105' : ''
                            }`}
                            style={{height: `${baseHeight}%`}}
                          ></div>
                          
                          {/* Tooltip */}
                          {isHovered && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-3xl shadow-lg whitespace-nowrap z-10">
                              <div className="text-center">
                                <div className="font-semibold">{monthData.month}</div>
                                <div>Base: ₵{monthData.baseCost.toFixed(2)}</div>
                                <div>Additional: ₵{monthData.additionalCost.toFixed(2)}</div>
                                <div className="font-semibold border-t border-gray-700 pt-1 mt-1">
                                  Total: ₵{monthData.totalCost.toFixed(2)}
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
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span className="text-sm text-gray-600">Base Fuel Cost</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Additional Fuel Cost</span>
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
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Osei&apos;s Van - Checking Transmission</p>
                    <p className="text-xs text-gray-500">30 Days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ansah&apos;s Honda - Change rear brakes and...</p>
                    <p className="text-xs text-gray-500">54 Days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Quaye&apos;s Car - Changing of Oil Tank...</p>
                    <p className="text-xs text-gray-500">30 Days left</p>
                  </div>
                </div>
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
                  className={`px-3 py-1 rounded text-sm border ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <option>Monthly</option>
                  <option>Weekly</option>
                  <option>Yearly</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {(() => {
                    // Create sample data for fleet distribution
                    const fleetData = [
                      { type: 'Active Vehicles', count: onRoadCount },
                      { type: 'Maintenance', count: maintenanceCount },
                      { type: 'Offline', count: offRoadCount }
                    ].filter(item => item.count > 0)
                    
                    const total = fleetData.reduce((sum, item) => sum + item.count, 0)
                    let currentAngle = 0
                    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
                    
                    return fleetData.map((item, index) => {
                      const percentage = (item.count / total) * 100
                      const angle = (percentage / 100) * 360
                      const startAngle = currentAngle
                      const endAngle = currentAngle + angle
                      currentAngle += angle
                      
                      const startAngleRad = (startAngle - 90) * (Math.PI / 180)
                      const endAngleRad = (endAngle - 90) * (Math.PI / 180)
                      
                      const x1 = 50 + 35 * Math.cos(startAngleRad)
                      const y1 = 50 + 35 * Math.sin(startAngleRad)
                      const x2 = 50 + 35 * Math.cos(endAngleRad)
                      const y2 = 50 + 35 * Math.sin(endAngleRad)
                      
                      const largeArcFlag = angle > 180 ? 1 : 0
                      
                      const pathData = [
                        `M 50 50`,
                        `L ${x1} ${y1}`,
                        `A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        `Z`
                      ].join(' ')
                      
                      return (
                        <path
                          key={item.type}
                          d={pathData}
                          fill={colors[index % colors.length]}
                          stroke="white"
                          strokeWidth="2"
                        />
                      )
                    })
                  })()}
                </svg>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-6 grid grid-cols-1 gap-4">
              {(() => {
                const fleetData = [
                  { type: 'Active Vehicles', count: onRoadCount },
                  { type: 'Maintenance', count: maintenanceCount },
                  { type: 'Offline', count: offRoadCount }
                ].filter(item => item.count > 0)
                
                const total = fleetData.reduce((sum, item) => sum + item.count, 0)
                const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
                
                return fleetData.slice(0, 2).map((item, index) => {
                  const percentage = ((item.count / total) * 100).toFixed(0)
                  
                  return (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {item.type}
                        </span>
                      </div>
                      <span className={`text-lg font-bold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {percentage}%
                      </span>
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
