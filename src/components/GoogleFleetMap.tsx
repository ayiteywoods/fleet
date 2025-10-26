'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import SimpleFleetMap from './SimpleFleetMap'
import DatabaseErrorDisplay from './DatabaseErrorDisplay'

// Global variable to track if Google Maps API is loaded
declare global {
  interface Window {
    googleMapsLoaded?: boolean
    googleMapsLoading?: Promise<void>
  }
}

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

export default function GoogleFleetMap() {
  const { themeMode } = useTheme()
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [vehiclePositions, setVehiclePositions] = useState<VehiclePosition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)

  // Function to load Google Maps API only once
  const loadGoogleMapsAPI = async (): Promise<void> => {
    if (window.googleMapsLoaded) {
      console.log('Google Maps API already loaded')
      return Promise.resolve()
    }

    if (window.googleMapsLoading) {
      console.log('Google Maps API already loading, waiting...')
      return window.googleMapsLoading
    }

    console.log('Starting to load Google Maps API...')
    window.googleMapsLoading = new Promise((resolve, reject) => {
      if (window.google) {
        console.log('Google Maps API already available')
        window.googleMapsLoaded = true
        resolve()
        return
      }

      const script = document.createElement('script')
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      console.log('API Key available:', !!apiKey)
      
      if (!apiKey) {
        console.error('Google Maps API key not configured')
        reject(new Error('Google Maps API key not configured'))
        return
      }
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        console.log('Google Maps API script loaded successfully')
        window.googleMapsLoaded = true
        resolve()
      }
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API script:', error)
        reject(new Error('Failed to load Google Maps API'))
      }
      
      console.log('Adding Google Maps script to document head')
      document.head.appendChild(script)
    })

    return window.googleMapsLoading
  }

  // Fetch vehicle positions
  const fetchVehiclePositions = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required - Please log in to view fleet positions')
        setIsLoading(false)
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
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: '/api/fleet-positions'
        }) // Enhanced debug log
        
        // Provide more specific error messages based on the error type
        let errorMessage = 'Failed to fetch vehicle positions'
        if (response.status === 401) {
          if (errorData.error === 'Authentication required') {
            errorMessage = 'Please log in to view fleet positions'
          } else if (errorData.error === 'Invalid token') {
            errorMessage = 'Your session has expired. Please log in again'
          } else {
            errorMessage = 'Authentication failed. Please log in again'
          }
        } else if (errorData.type === 'authentication') {
          errorMessage = 'Database authentication failed. Please contact your administrator.'
        } else if (errorData.type === 'connection') {
          errorMessage = 'Unable to connect to database. Please check your connection.'
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
        
        setError(`${errorMessage} (${response.status})`)
      }
    } catch (error) {
      console.error('Error fetching vehicle positions:', error)
      setError(`Failed to fetch vehicle positions: ${error instanceof Error ? error.message : 'Network error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize map
  const initializeMap = async () => {
    if (!mapRef.current) return

    try {
      setIsLoading(true)
      setError(null)

      console.log('Initializing Google Maps...') // Debug log
      
      // Load Google Maps API with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Google Maps API loading timeout')), 10000) // 10 second timeout
      })
      
      await Promise.race([loadGoogleMapsAPI(), timeoutPromise])
      
      console.log('Google Maps API loaded successfully') // Debug log

      // Create map
      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: 7.9465, lng: -1.0232 }, // Center of Ghana
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: themeMode === 'dark' ? [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9a76' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#746855' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2835' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }]
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#2f3948' }]
          },
          {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }]
          }
        ] : undefined
      })

      setMap(mapInstance)
      console.log('Map instance created successfully') // Debug log
    } catch (err) {
      console.error('Error initializing map:', err)
      console.log('Switching to fallback map due to Google Maps error')
      setUseFallback(true)
      setError(null) // Clear error since we're using fallback
    } finally {
      setIsLoading(false)
    }
  }

  // Create markers for vehicles
  const createMarkers = () => {
    if (!map || !vehiclePositions.length) return

    console.log('Creating markers for', vehiclePositions.length, 'vehicles') // Debug log

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    const newMarkers: google.maps.Marker[] = []

    vehiclePositions.forEach((vehiclePos) => {
      const { vehicle, position } = vehiclePos
      
      // Skip if position coordinates are missing
      if (!position.latitude || !position.longitude) {
        return
      }
      
      // Determine marker color based on vehicle status
      const getMarkerColor = (status: string) => {
        switch (status?.toLowerCase()) {
          case 'active':
            return '#22c55e' // Green
          case 'inactive':
            return '#ef4444' // Red
          case 'maintenance':
            return '#f59e0b' // Yellow
          default:
            return '#6b7280' // Gray
        }
      }

      // Create custom marker icon
      const markerIcon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
              </filter>
            </defs>
            <g filter="url(#shadow)">
              <!-- Vehicle body -->
              <rect x="4" y="9" width="18" height="9" rx="2" fill="#1F2937" stroke="#fff" stroke-width="1"/>
              <!-- Vehicle cab -->
              <rect x="6" y="4" width="12" height="7" rx="1" fill="#1F2937" stroke="#fff" stroke-width="1"/>
              <!-- Windshield -->
              <rect x="7" y="5" width="10" height="5" rx="0.5" fill="#374151"/>
              <!-- Wheels -->
              <circle cx="9" cy="20" r="2.5" fill="#111827" stroke="#fff" stroke-width="0.5"/>
              <circle cx="23" cy="20" r="2.5" fill="#111827" stroke="#fff" stroke-width="0.5"/>
              <!-- Wheel centers -->
              <circle cx="9" cy="20" r="1.5" fill="#374151"/>
              <circle cx="23" cy="20" r="1.5" fill="#374151"/>
              <!-- Status indicator -->
              <circle cx="26" cy="6" r="4" fill="${getMarkerColor(vehicle.status)}" stroke="#fff" stroke-width="1"/>
            </g>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32)
      }

      // Create marker
      const marker = new google.maps.Marker({
        position: { 
          lat: Number(position.latitude), 
          lng: Number(position.longitude) 
        },
        map: map,
        title: `${vehicle.reg_number} - ${vehicle.name}`,
        icon: markerIcon,
        animation: google.maps.Animation.DROP
      })

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 250px; font-family: system-ui;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
              ${vehicle.reg_number}
            </h3>
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #374151;">
              ${vehicle.name || 'N/A'}
            </p>
            <div style="margin: 8px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${getMarkerColor(vehicle.status)}; margin-right: 6px;"></div>
                <span style="font-size: 12px; color: #6b7280; text-transform: capitalize;">
                  ${vehicle.status || 'Unknown'}
                </span>
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">
                <strong>Address:</strong> ${position.address || 'N/A'}
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">
                <strong>Speed:</strong> ${position.speed} km/h
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">
                <strong>Odometer:</strong> ${position.odometer} km
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                <strong>Engine:</strong> ${position.engine_status || 'Unknown'}
              </div>
            </div>
          </div>
        `
      })

      // Add click listener to marker
      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)
    console.log('Markers created successfully:', newMarkers.length) // Debug log
  }

  // Initialize map and fetch data
  useEffect(() => {
    console.log('Google Maps API Key available:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) // Debug log
    
    // Set a timeout to stop loading after 10 seconds if nothing happens
    const loadingTimeout = setTimeout(() => {
      console.warn('Map loading timeout reached')
      setIsLoading(false)
    }, 10000)
    
    initializeMap()
    fetchVehiclePositions()
    
    return () => clearTimeout(loadingTimeout)
  }, [])

  // Create markers when map and vehicle positions are ready
  useEffect(() => {
    if (map && vehiclePositions.length > 0) {
      createMarkers()
    }
  }, [map, vehiclePositions])

  // Update map theme when theme changes
  useEffect(() => {
    if (map) {
      // Update map styles based on theme without reinitializing
      const styles = themeMode === 'dark' ? [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b9a76' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca5b3' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#1f2835' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#f3d19c' }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#2f3948' }]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#515c6d' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#17263c' }]
        }
      ] : undefined
      
      map.setOptions({
        styles: styles
      })
    }
  }, [themeMode, map])

  // Use fallback if Google Maps fails
  if (useFallback) {
    return <SimpleFleetMap />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <DatabaseErrorDisplay 
        error={error} 
        onRetry={() => {
          setError(null)
          initializeMap()
          fetchVehiclePositions()
        }} 
      />
    )
  }

  if (!map) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full"></div>
    </div>
  )
}
