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
import FleetMap from './FleetMap'

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

interface WeeklyFuelData {
  week: string
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
  const [weeklyFuelData, setWeeklyFuelData] = useState<WeeklyFuelData[]>([])
  const [isLoadingFuelData, setIsLoadingFuelData] = useState(true)
  const [hoveredWeek, setHoveredWeek] = useState<string | null>(null)
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
    },
    {
      id: '3',
      status: 'Start',
      time: '18:05',
      location: 'Teshie, 15 Accra East, Labadi',
      driver: 'Kwame Asante',
      vehicle: 'GH 3344 -22'
    },
    {
      id: '4',
      status: 'Stop',
      time: '19:10',
      location: 'Tema, 22 Harbour Road, Community 25',
      driver: 'Ama Serwaa',
      vehicle: 'GK 5588 -20',
      details: {
        time: '45 mins driving',
        distance: '25 KM',
        incidents: '1 Incident'
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

          // Fetch fuel logs data for weekly chart
          const fuelResponse = await fetch('/api/fuel-logs')
          if (fuelResponse.ok) {
            const fuelData = await fuelResponse.json()
            const weeklyData = processWeeklyFuelData(fuelData)
            setWeeklyFuelData(weeklyData)
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

  // Process fuel data into weekly format
  const processWeeklyFuelData = (fuelLogs: FuelLog[]): WeeklyFuelData[] => {
    // Simple approach: group by week number (1-10) based on recency
    const weeklyData: { [key: string]: { baseCost: number; additionalCost: number } } = {}
    
    // Initialize 10 weeks
    for (let i = 1; i <= 10; i++) {
      weeklyData[i.toString()] = { baseCost: 0, additionalCost: 0 }
    }
    
    // Sort fuel logs by date (newest first)
    const sortedLogs = [...fuelLogs].sort((a, b) => 
      new Date(b.refuel_date).getTime() - new Date(a.refuel_date).getTime()
    )
    
    // Distribute logs across the 10 weeks (most recent logs get higher week numbers)
    sortedLogs.forEach((log, index) => {
      const weekNumber = Math.min(10, Math.max(1, Math.ceil((index + 1) / Math.ceil(sortedLogs.length / 10))))
      const weekKey = weekNumber.toString()
      
      const totalCost = Number(log.total_cost) || 0
      const baseCost = totalCost * 0.7
      const additionalCost = totalCost * 0.3
      
      weeklyData[weekKey].baseCost += baseCost
      weeklyData[weekKey].additionalCost += additionalCost
    })
    
    // Convert to array format
    const result = Array.from({ length: 10 }, (_, i) => {
      const weekNumber = (i + 1).toString()
      const data = weeklyData[weekNumber]
      return {
        week: weekNumber,
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
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
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
          {/* Weekly Fuel Expenses Chart */}
          <div className={`p-6 rounded-2xl mb-6 ${
            themeMode === 'dark' 
              ? 'bg-navy-800' 
              : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Weekly Fuel Expenses
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
                  {weeklyFuelData.map((weekData, index) => {
                    const maxCost = Math.max(...weeklyFuelData.map(w => w.totalCost))
                    const baseHeight = maxCost > 0 ? (weekData.baseCost / maxCost) * 100 : 0
                    const additionalHeight = maxCost > 0 ? (weekData.additionalCost / maxCost) * 100 : 0
                    const isHovered = hoveredWeek === weekData.week
                    
                    return (
                      <div 
                        key={index} 
                        className="flex flex-col items-center space-y-1 cursor-pointer group"
                        onMouseEnter={() => setHoveredWeek(weekData.week)}
                        onMouseLeave={() => setHoveredWeek(null)}
                        onClick={() => {
                          // Navigate to fuel logs page with week filter
                          window.location.href = `/fuel?week=${weekData.week}`
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
                                <div className="font-semibold">Week {weekData.week}</div>
                                <div>Base: ${weekData.baseCost.toFixed(2)}</div>
                                <div>Additional: ${weekData.additionalCost.toFixed(2)}</div>
                                <div className="font-semibold border-t border-gray-700 pt-1 mt-1">
                                  Total: ${weekData.totalCost.toFixed(2)}
                                </div>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </div>
                        <span className={`text-xs transition-colors duration-200 ${
                          isHovered ? 'text-blue-600 font-semibold' : 'text-gray-500'
                        }`}>
                          {weekData.week}
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
          <div className={`p-6 rounded-2xl ${
            themeMode === 'dark' 
              ? 'bg-navy-800' 
              : 'bg-white'
          }`}>
            <FleetMap />
          </div>
          
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

        {/* Right Column - Recent Trips and Alerts */}
        <div className="lg:col-span-1 space-y-6">
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
            <div className="space-y-3 pb-10">
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
