import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all drivers
export async function GET() {
  try {
    const drivers = await prisma.driver_operators.findMany({
      include: {
        vehicles: {
          select: {
            reg_number: true,
            trim: true,
            year: true,
            status: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // Serialize BigInt values
    const serializedDrivers = drivers.map(driver => ({
      ...driver,
      id: driver.id.toString(),
      vehicle_id: driver.vehicle_id.toString(),
      created_by: driver.created_by?.toString(),
      updated_by: driver.updated_by?.toString()
    }))

    return NextResponse.json(serializedDrivers)
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    )
  }
}

// POST - Create new driver
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      license_number,
      license_category,
      license_expire,
      region,
      district,
      status,
      vehicle_id
    } = body

    if (!name || !phone || !license_number || !license_category || !license_expire || !region || !district || !status) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Handle vehicle_id - ensure we always have a valid vehicle_id
    let finalVehicleId = BigInt(1) // Default to vehicle ID 1
    
    if (vehicle_id && vehicle_id !== '') {
      try {
        const vehicleExists = await prisma.vehicles.findUnique({
          where: { id: BigInt(vehicle_id) }
        })
        
        if (!vehicleExists) {
          return NextResponse.json(
            { error: `Vehicle ID ${vehicle_id} does not exist. Please select a valid vehicle or leave empty.` },
            { status: 400 }
          )
        }
        finalVehicleId = BigInt(vehicle_id)
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid vehicle ID format' },
          { status: 400 }
        )
      }
    } else {
      // If no vehicle_id provided, check if vehicle ID 1 exists, if not create a default vehicle
      try {
        const defaultVehicle = await prisma.vehicles.findUnique({
          where: { id: BigInt(1) }
        })
        
        if (!defaultVehicle) {
          // Create a default vehicle
          await prisma.vehicles.create({
            data: {
              id: BigInt(1),
              reg_number: 'DEFAULT-001',
              trim: 'Default Vehicle',
              year: 2024,
              color: 'White',
              status: 'Active',
              spcode: 1,
              created_at: new Date(),
              updated_at: new Date(),
              created_by: 1,
              updated_by: 1
            }
          })
        }
      } catch (error) {
        console.error('Error creating default vehicle:', error)
        return NextResponse.json(
          { error: 'Unable to assign default vehicle. Please provide a valid vehicle ID.' },
          { status: 400 }
        )
      }
    }

    const newDriver = await prisma.driver_operators.create({
      data: {
        name,
        phone,
        license_number,
        license_category,
        license_expire,
        region,
        district,
        status,
        vehicle_id: finalVehicleId,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      include: {
        vehicles: {
          select: {
            reg_number: true,
            trim: true,
            year: true,
            status: true
          }
        }
      }
    })

    // Serialize BigInt values
    const serializedDriver = {
      ...newDriver,
      id: newDriver.id.toString(),
      vehicle_id: newDriver.vehicle_id.toString(),
      created_by: newDriver.created_by?.toString(),
      updated_by: newDriver.updated_by?.toString()
    }

    return NextResponse.json(serializedDriver, { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    )
  }
}

// PUT - Update driver
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      phone,
      license_number,
      license_category,
      license_expire,
      region,
      district,
      status,
      vehicle_id
    } = body

    const updatedDriver = await prisma.driver_operators.update({
      where: { id: BigInt(id) },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        license_number: license_number || undefined,
        license_category: license_category || undefined,
        license_expire: license_expire || undefined,
        region: region || undefined,
        district: district || undefined,
        status: status || undefined,
        vehicle_id: vehicle_id ? BigInt(vehicle_id) : undefined,
        updated_at: new Date(),
        updated_by: 1
      },
      include: {
        vehicles: {
          select: {
            reg_number: true,
            trim: true,
            year: true,
            status: true
          }
        }
      }
    })

    // Serialize BigInt values
    const serializedDriver = {
      ...updatedDriver,
      id: updatedDriver.id.toString(),
      vehicle_id: updatedDriver.vehicle_id.toString(),
      created_by: updatedDriver.created_by?.toString(),
      updated_by: updatedDriver.updated_by?.toString()
    }

    return NextResponse.json(serializedDriver)
  } catch (error) {
    console.error('Error updating driver:', error)
    return NextResponse.json(
      { error: 'Failed to update driver' },
      { status: 500 }
    )
  }
}

// DELETE - Delete driver
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      )
    }

    await prisma.driver_operators.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json(
      { message: 'Driver deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting driver:', error)
    return NextResponse.json(
      { error: 'Failed to delete driver' },
      { status: 500 }
    )
  }
}