'use client'

import { useEffect, useRef, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

// Global variable to track if Google Maps API is loaded
declare global {
  interface Window {
    googleMapsLoaded?: boolean
    googleMapsLoading?: Promise<void>
  }
}

interface GoogleMapsModalProps {
  isOpen: boolean
  onClose: () => void
  address: string
  latitude?: number
  longitude?: number
  themeMode?: 'light' | 'dark'
  vehicleName?: string
}

export default function GoogleMapsModal({ 
  isOpen, 
  onClose, 
  address, 
  latitude, 
  longitude,
  themeMode = 'light',
  vehicleName = 'Vehicle Location'
}: GoogleMapsModalProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to load Google Maps API only once
  const loadGoogleMapsAPI = async (): Promise<void> => {
    if (window.googleMapsLoaded) {
      return Promise.resolve()
    }

    if (window.googleMapsLoading) {
      return window.googleMapsLoading
    }

    window.googleMapsLoading = new Promise((resolve, reject) => {
      if (window.google) {
        window.googleMapsLoaded = true
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geocoding`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        window.googleMapsLoaded = true
        resolve()
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'))
      }
      
      document.head.appendChild(script)
    })

    return window.googleMapsLoading
  }

  useEffect(() => {
    if (!isOpen || !mapRef.current) return

    const initializeMap = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Load Google Maps API only once
        await loadGoogleMapsAPI()

        // Create map
        const mapInstance = new google.maps.Map(mapRef.current!, {
          zoom: 15,
          center: { lat: 0, lng: 0 }, // Will be updated based on coordinates or geocoding
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

        // Set location based on available data
        let mapCenter: google.maps.LatLngLiteral
        let markerPosition: google.maps.LatLngLiteral

        if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude) && 
            latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
          // Use provided coordinates
          mapCenter = { lat: latitude, lng: longitude }
          markerPosition = { lat: latitude, lng: longitude }
        } else if (address) {
          // Geocode the address
          const geocoder = new google.maps.Geocoder()
          const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
            geocoder.geocode({ address }, (results, status) => {
              if (status === 'OK' && results) {
                resolve(results)
              } else {
                reject(new Error(`Geocoding failed: ${status}`))
              }
            })
          })

          if (result.length > 0) {
            const location = result[0].geometry.location
            mapCenter = { lat: location.lat(), lng: location.lng() }
            markerPosition = { lat: location.lat(), lng: location.lng() }
          } else {
            throw new Error('No results found for the address')
          }
        } else {
          // Fallback to default coordinates (Ghana center)
          mapCenter = { lat: 7.9465, lng: -1.0232 }
          markerPosition = { lat: 7.9465, lng: -1.0232 }
        }

        // Set map center
        mapInstance.setCenter(mapCenter)

        // Create marker with vehicle icon
        const markerInstance = new google.maps.Marker({
          position: markerPosition,
          map: mapInstance,
          title: vehicleName,
          animation: google.maps.Animation.DROP,
            icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/>
                  </filter>
                </defs>
                <g filter="url(#shadow)">
                  <!-- Vehicle body -->
                  <rect x="8" y="18" width="36" height="18" rx="3" fill="#dc2626" stroke="#fff" stroke-width="2"/>
                  <!-- Vehicle cab -->
                  <rect x="12" y="8" width="24" height="14" rx="2" fill="#dc2626" stroke="#fff" stroke-width="2"/>
                  <!-- Windshield -->
                  <rect x="14" y="10" width="20" height="10" rx="1" fill="#991b1b"/>
                  <!-- Wheels -->
                  <circle cx="18" cy="40" r="4.5" fill="#111827" stroke="#fff" stroke-width="1.5"/>
                  <circle cx="46" cy="40" r="4.5" fill="#111827" stroke="#fff" stroke-width="1.5"/>
                  <!-- Wheel centers -->
                  <circle cx="18" cy="40" r="3" fill="#374151"/>
                  <circle cx="46" cy="40" r="3" fill="#374151"/>
                  <!-- Headlights -->
                  <circle cx="26" cy="14" r="2" fill="#FEF3C7"/>
                  <circle cx="32" cy="14" r="2" fill="#FEF3C7"/>
                  <!-- Grille -->
                  <rect x="22" y="16" width="10" height="2" rx="1" fill="#991b1b"/>
                </g>
              </svg>
            `),
            scaledSize: new google.maps.Size(64, 64),
            anchor: new google.maps.Point(32, 64)
          }
        })

        setMarker(markerInstance)

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${vehicleName}</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
            </div>
          `
        })

        markerInstance.addListener('click', () => {
          infoWindow.open(mapInstance, markerInstance)
        })

      } catch (err) {
        console.error('Error initializing map:', err)
        setError(err instanceof Error ? err.message : 'Failed to load map')
      } finally {
        setIsLoading(false)
      }
    }

    initializeMap()

    // Cleanup
    return () => {
      if (marker) {
        marker.setMap(null)
      }
      if (map) {
        // Map will be cleaned up automatically when component unmounts
      }
    }
  }, [isOpen, address, latitude, longitude, themeMode])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
        style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          background: 'rgba(0, 0, 0, 0.4)'
        }}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-4xl h-[80vh] mx-4 rounded-2xl shadow-2xl ${
        themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-semibold ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {vehicleName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative h-[calc(80vh-120px)]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading map...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div 
            ref={mapRef} 
            className="w-full h-full rounded-b-2xl"
            style={{ display: isLoading || error ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>
  )
}
