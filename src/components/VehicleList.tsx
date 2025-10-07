'use client'

import { useState } from 'react'

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

interface VehicleListProps {
  vehicles: Vehicle[]
  onUpdate: () => void
}

export default function VehicleList({ vehicles, onUpdate }: VehicleListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onUpdate()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('Error deleting vehicle')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'IN_USE':
        return 'bg-blue-100 text-blue-800'
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800'
      case 'OUT_OF_SERVICE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No vehicles found</p>
        <p className="text-gray-400">Add your first vehicle to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                License Plate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mileage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-sm text-gray-500">
                      {vehicle.color && `${vehicle.color} • `}
                      {vehicle.vin && `VIN: ${vehicle.vin}`}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicle.licensePlate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    disabled={deletingId === vehicle.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {deletingId === vehicle.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
