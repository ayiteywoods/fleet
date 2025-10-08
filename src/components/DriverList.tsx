'use client'

import { useState } from 'react'

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

interface DriverListProps {
  drivers: Driver[]
  onUpdate: () => void
}

export default function DriverList({ drivers, onUpdate }: DriverListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/drivers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onUpdate()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting driver:', error)
      alert('Error deleting driver')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isLicenseExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  if (drivers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No drivers found</p>
        <p className="text-gray-400">Add your first driver to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                License
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {driver.firstName} {driver.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {driver.id.slice(0, 8)}...
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">{driver.email}</div>
                    {driver.phone && (
                      <div className="text-sm text-gray-500">{driver.phone}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">{driver.licenseNumber}</div>
                    {driver.licenseExpiry && (
                      <div className={`text-sm ${
                        isLicenseExpired(driver.licenseExpiry) 
                          ? 'text-red-600 font-medium' 
                          : 'text-gray-500'
                      }`}>
                        Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}
                        {isLicenseExpired(driver.licenseExpiry) && ' (EXPIRED)'}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                    {driver.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(driver.id)}
                    disabled={deletingId === driver.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {deletingId === driver.id ? 'Deleting...' : 'Delete'}
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
