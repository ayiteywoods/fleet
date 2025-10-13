import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    // Search for vehicles by ID or registration number
    const vehicles = await prisma.vehicles.findMany({
      where: {
        OR: [
          // Only try BigInt conversion if query is numeric
          ...(isNaN(Number(query)) ? [] : [{ id: { equals: BigInt(query) } }]),
          { reg_number: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        vehicle_types: true,
        vehicle_makes: true,
        driver_operators: true
      }
    })

    // Search for drivers by ID, name, phone, or license number
    const drivers = await prisma.driver_operators.findMany({
      where: {
        OR: [
          // Only try BigInt conversion if query is numeric
          ...(isNaN(Number(query)) ? [] : [{ id: { equals: BigInt(query) } }]),
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { license_number: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        vehicles: true
      }
    })

    // Return vehicle if found
    if (vehicles.length > 0) {
      const vehicle = vehicles[0]
      return NextResponse.json({
        type: 'vehicle',
        id: vehicle.id.toString(),
        data: {
          id: vehicle.id.toString(),
          name: vehicle.notes || vehicle.reg_number,
          reg_number: vehicle.reg_number,
          vehicle_type: vehicle.vehicle_types?.type,
          vehicle_make: vehicle.vehicle_makes?.name,
          driver: vehicle.driver_operators?.name,
          status: vehicle.status,
          created_at: vehicle.created_at,
          updated_at: vehicle.updated_at
        }
      })
    }

    // Return driver if found
    if (drivers.length > 0) {
      const driver = drivers[0]
      return NextResponse.json({
        type: 'driver',
        id: driver.id.toString(),
        data: {
          id: driver.id.toString(),
          name: driver.name,
          phone: driver.phone,
          email: driver.email,
          license_number: driver.license_number,
          status: driver.status,
          vehicle: driver.vehicles?.[0]?.reg_number,
          created_at: driver.created_at,
          updated_at: driver.updated_at
        }
      })
    }

    // No results found
    return NextResponse.json({ error: 'No vehicle or driver found' }, { status: 404 })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
