'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Truck, 
  Users, 
  Anchor, 
  Wrench, 
  MapPin, 
  Navigation,
  Square,
  Clock,
  AlertCircle,
  Eye,
  Settings,
  ChevronRight,
  MapPin as MapPinIcon
} from 'lucide-react'
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

export default function FleetDashboard() {
  const { themeColor, themeMode } = useTheme()
  const [vehiclesCount, setVehiclesCount] = useState(0)
  const [driversCount, setDriversCount] = useState(0)
  const [insuranceCount, setInsuranceCount] = useState(0)
  const [onRoadCount, setOnRoadCount] = useState(0)
  const [offRoadCount, setOffRoadCount] = useState(0)
  const [loading, setLoading] = useState(true)
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
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const kpiCards = [
    {
      title: 'Vehicles',
      value: loading ? '...' : vehiclesCount.toString(),
      subtitle: 'All Vehicles',
      subtitleLink: '/vehicles',
      icon: Truck,
      color: 'blue'
    },
    {
      title: 'Drivers',
      value: loading ? '...' : driversCount.toString(),
      subtitle: 'All Drivers',
      subtitleLink: '/drivers',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Insurance/Roadworthy',
      value: loading ? '...' : insuranceCount.toString(),
      subtitle: 'All Insurances',
      subtitleLink: '/insurance',
      icon: Anchor,
      color: 'blue'
    },
    {
      title: 'On Road',
      value: loading ? '...' : onRoadCount.toString(),
      subtitle: 'All On Road',
      subtitleLink: '/vehicles',
      icon: Truck,
      color: 'blue'
    },
    {
      title: 'Off Road',
      value: loading ? '...' : offRoadCount.toString(),
      subtitle: 'All Off Road',
      subtitleLink: '/vehicles',
      icon: Truck,
      color: 'blue'
    }
  ]

  const getStatusIcon = (status: string) => {
    if (status === 'Start') {
      return <Navigation className="w-5 h-5 text-green-600" />
    }
    return <Square className="w-5 h-5 text-blue-600" />
  }

  const getStatusColor = (status: string) => {
    return status === 'Start' ? 'text-green-600' : 'text-blue-600'
  }

  return (
    <div className={`space-y-6 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <div key={index} className={`p-4 rounded-lg border ${
              themeMode === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <IconComponent className={`w-8 h-8 ${
                  card.color === 'blue' ? 'text-blue-600' : getIconColor(themeColor)
                }`} />
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
              <Link 
                href={card.subtitleLink} 
                className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                title={card.title === 'On Road' ? 'View all vehicles (filter by Active status)' : 
                       card.title === 'Off Road' ? 'View all vehicles (filter by Inactive status)' : 
                       `View all ${card.title.toLowerCase()}`}
              >
                <ChevronRight className="w-3 h-3 mr-1" />
                {card.subtitle}
              </Link>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className={`p-4 rounded-lg border ${
            themeMode === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } shadow-sm`}>
            <FleetMap />
          </div>
          
          {/* Maintenance and Reminders Tables under Map */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Maintenance Due */}
            <div className={`p-4 rounded-lg border ${
              themeMode === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } shadow-sm`}>
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
                  <ChevronRight className="w-3 h-3 mr-1" />
                  All
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Osei&apos;s Van - Checking Transmission</p>
                    <p className="text-xs text-gray-500">30 Days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ansah&apos;s Honda - Change rear brakes and...</p>
                    <p className="text-xs text-gray-500">54 Days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Quaye&apos;s Car - Changing of Oil Tank...</p>
                    <p className="text-xs text-gray-500">30 Days left</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reminders Due */}
            <div className={`p-4 rounded-lg border ${
              themeMode === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } shadow-sm`}>
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
                  <ChevronRight className="w-3 h-3 mr-1" />
                  All
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ike&apos;s BMW - Insurance</p>
                    <p className="text-xs text-gray-500">30 Days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ansah&apos;s VW - MOT</p>
                    <p className="text-xs text-gray-500">54 Days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
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
          <div className={`p-4 rounded-lg border ${
            themeMode === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } shadow-sm`}>
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
                <div key={trip.id} className={`p-3 rounded border ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
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
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className={`text-xs ${
                        themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {trip.driver}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4 text-blue-600" />
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
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            {trip.details.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            {trip.details.distance}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4 text-red-500" />
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
                <Settings className="w-5 h-5 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Recent Alerts Section */}
          <div className={`p-4 rounded-lg border ${
            themeMode === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } shadow-sm`}>
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
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded border ${
                  themeMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  {/* Alert Header */}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-sm font-semibold ${
                      themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {alert.vehicleName}
                    </h4>
                    <MapPinIcon className="w-4 h-4 text-blue-600" />
                  </div>

                  {/* Timestamp */}
                  <p className={`text-xs mb-2 ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {alert.timestamp}
                  </p>

                  {/* Alert Message */}
                  <div className="flex items-start space-x-2">
                    <Clock className={`w-4 h-4 mt-0.5 ${
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
