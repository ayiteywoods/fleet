'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface VehiclePosition {
  vehicle: {
    id: string
    reg_number: string
    name: string
    status: string
    company_name: string
  }
  position: {
    id: string
    latitude: number
    longitude: number
    address: string
    speed: string
    odometer: string
    engine_status: string
    gps_time_utc: string
  }
}

export default function SimpleFleetMap() {
  const { themeMode } = useTheme()
  const [vehiclePositions, setVehiclePositions] = useState<VehiclePosition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch vehicle positions
  const fetchVehiclePositions = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        return
      }

      console.log('Fetching vehicle positions...') // Debug log
      const response = await fetch('/api/fleet-positions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Vehicle positions fetched:', data.length, 'vehicles') // Debug log
        setVehiclePositions(data)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData) // Debug log
        setError(`Failed to fetch vehicle positions: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error fetching vehicle positions:', error)
      setError('Failed to fetch vehicle positions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehiclePositions()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-red-500'
      case 'maintenance':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading vehicle positions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => {
              setError(null)
              setIsLoading(true)
              fetchVehiclePositions()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
      <div className="p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Fleet Locations ({vehiclePositions.length} vehicles)
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Simple View (Google Maps loading...)
          </div>
        </div>
        
        {vehiclePositions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">No vehicle positions found</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vehiclePositions.map((vehiclePos, index) => (
                <div
                  key={`${vehiclePos.vehicle.id}-${vehiclePos.position.id}-${index}`}
                  className={`p-3 rounded-lg border ${
                    themeMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold text-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {vehiclePos.vehicle.reg_number}
                    </h4>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(vehiclePos.vehicle.status)}`}></div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className={`text-xs ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Name:</strong> {vehiclePos.vehicle.name || 'N/A'}
                    </p>
                    <p className={`text-xs ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Status:</strong> {vehiclePos.vehicle.status || 'Unknown'}
                    </p>
                    <p className={`text-xs ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Address:</strong> {vehiclePos.position.address || 'N/A'}
                    </p>
                    <p className={`text-xs ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Speed:</strong> {vehiclePos.position.speed || '0'} km/h
                    </p>
                    <p className={`text-xs ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Coordinates:</strong> {
                        vehiclePos.position.latitude && vehiclePos.position.longitude
                          ? `${Number(vehiclePos.position.latitude).toFixed(4)}, ${Number(vehiclePos.position.longitude).toFixed(4)}`
                          : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
