'use client'

import { useState, useEffect } from 'react'
import VehicleForm from './VehicleForm'
import VehicleList from './VehicleList'
import DriverForm from './DriverForm'
import DriverList from './DriverList'
import FleetDashboard from './FleetDashboard'
import { Truck, Users, Wrench, AlertTriangle } from 'lucide-react'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  vin?: string
  color?: string
  mileage?: number
  status: string
  createdAt: string
  updatedAt: string
}

interface Driver {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  licenseNumber: string
  licenseExpiry?: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles')
  const [showForm, setShowForm] = useState(false)

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setVehicles(data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/drivers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setDrivers(data)
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  useEffect(() => {
    fetchVehicles()
    fetchDrivers()
  }, [])

  return <FleetDashboard />
}
