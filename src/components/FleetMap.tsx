'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '@/contexts/ThemeContext'

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface FleetLocation {
  id: string
  name: string
  position: [number, number]
  status: 'active' | 'inactive'
  vehicle: string
  driver: string
}

export default function FleetMap() {
  const { themeMode } = useTheme()
  const [isClient, setIsClient] = useState(false)

  // West Africa fleet locations
  const fleetLocations: FleetLocation[] = [
    {
      id: '1',
      name: 'Accra Hub',
      position: [5.6037, -0.1870],
      status: 'active',
      vehicle: 'GE 1245 -19',
      driver: 'Osei Kyei'
    },
    {
      id: '2',
      name: 'Kumasi Depot',
      position: [6.6885, -1.6244],
      status: 'active',
      vehicle: 'GN 2266 -21',
      driver: 'Saint Obi'
    },
    {
      id: '3',
      name: 'Tamale Station',
      position: [9.4008, -0.8393],
      status: 'inactive',
      vehicle: 'GH 3344 -22',
      driver: 'Kwame Asante'
    },
    {
      id: '4',
      name: 'Tema Port',
      position: [5.6167, -0.0167],
      status: 'active',
      vehicle: 'GK 5588 -20',
      driver: 'Ama Serwaa'
    },
    {
      id: '5',
      name: 'Takoradi Terminal',
      position: [4.8845, -1.7553],
      status: 'inactive',
      vehicle: 'GT 7788 -23',
      driver: 'Kofi Mensah'
    }
  ]

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden relative z-10">
      <MapContainer
        center={[7.9465, -1.0232]} // Center of West Africa
        zoom={6}
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {fleetLocations.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
            icon={new Icon({
              iconUrl: location.status === 'active' 
                ? 'data:image/svg+xml;base64,' + btoa(`
                  <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#22c55e"/>
                    <circle cx="12.5" cy="12.5" r="6" fill="white"/>
                  </svg>
                `)
                : 'data:image/svg+xml;base64,' + btoa(`
                  <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#ef4444"/>
                    <circle cx="12.5" cy="12.5" r="6" fill="white"/>
                  </svg>
                `),
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900">{location.name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Vehicle:</span> {location.vehicle}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Driver:</span> {location.driver}
                  </p>
                  <p className="text-sm">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      location.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className={`font-medium ${
                      location.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {location.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
