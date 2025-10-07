import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to serialize BigInts
function serializeBigInt(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  )
}

// GET - Fetch all fuel logs
export async function GET() {
  try {
    const fuelLogs = await prisma.fuel_logs.findMany({
      include: {
        vehicles: {
          select: {
            reg_number: true,
            trim: true,
            year: true,
            status: true
          }
        },
        driver_operators: {
          select: {
            name: true,
            phone: true,
            license_number: true
          }
        }
      },
      orderBy: {
        refuel_date: 'desc'
      }
    })
    return NextResponse.json(serializeBigInt(fuelLogs))
  } catch (error) {
    console.error('Error fetching fuel logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fuel logs' },
      { status: 500 }
    )
  }
}

// POST - Create new fuel log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      refuel_date, 
      quantity, 
      unit_cost, 
      total_cost, 
      mileage_before, 
      mileage_after, 
      fuel_type, 
      vendor, 
      receipt_number, 
      notes, 
      vehicle_id, 
      driver_id 
    } = body

    if (!refuel_date || !quantity || !unit_cost || !total_cost || !mileage_before || !mileage_after || !fuel_type || !vendor || !vehicle_id || !driver_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate that the vehicle exists
    const vehicle = await prisma.vehicles.findUnique({
      where: { id: BigInt(vehicle_id) }
    })
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 400 }
      )
    }

    // Validate that the driver exists
    const driver = await prisma.driver_operators.findUnique({
      where: { id: BigInt(driver_id) }
    })
    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 400 }
      )
    }

    const newFuelLog = await prisma.fuel_logs.create({
      data: {
        refuel_date: new Date(refuel_date),
        quantity: Number(quantity),
        unit_cost: Number(unit_cost),
        total_cost: Number(total_cost),
        mileage_before: Number(mileage_before),
        mileage_after: Number(mileage_after),
        fuel_type: fuel_type,
        vendor: vendor,
        receipt_number: receipt_number || null,
        notes: notes || null,
        vehicle_id: BigInt(vehicle_id),
        driver_id: BigInt(driver_id),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1, // Assuming a default user for now
        updated_by: 1 // Assuming a default user for now
      },
      include: {
        vehicles: {
          select: {
            reg_number: true,
            trim: true,
            year: true,
            status: true
          }
        },
        driver_operators: {
          select: {
            name: true,
            phone: true,
            license_number: true
          }
        }
      }
    })

    return NextResponse.json(serializeBigInt(newFuelLog), { status: 201 })
  } catch (error) {
    console.error('Error creating fuel log:', error)
    return NextResponse.json(
      { error: 'Failed to create fuel log' },
      { status: 500 }
    )
  }
}

// PUT - Update fuel log
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Fuel log ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      refuel_date, 
      quantity, 
      unit_cost, 
      total_cost, 
      mileage_before, 
      mileage_after, 
      fuel_type, 
      vendor, 
      receipt_number, 
      notes, 
      vehicle_id, 
      driver_id 
    } = body

    // Validate that the vehicle exists (if provided)
    if (vehicle_id) {
      const vehicle = await prisma.vehicles.findUnique({
        where: { id: BigInt(vehicle_id) }
      })
      if (!vehicle) {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 400 }
        )
      }
    }

    // Validate that the driver exists (if provided)
    if (driver_id) {
      const driver = await prisma.driver_operators.findUnique({
        where: { id: BigInt(driver_id) }
      })
      if (!driver) {
        return NextResponse.json(
          { error: 'Driver not found' },
          { status: 400 }
        )
      }
    }

    const updatedFuelLog = await prisma.fuel_logs.update({
      where: { id: BigInt(id) },
      data: {
        refuel_date: refuel_date ? new Date(refuel_date) : undefined,
        quantity: quantity ? Number(quantity) : undefined,
        unit_cost: unit_cost ? Number(unit_cost) : undefined,
        total_cost: total_cost ? Number(total_cost) : undefined,
        mileage_before: mileage_before ? Number(mileage_before) : undefined,
        mileage_after: mileage_after ? Number(mileage_after) : undefined,
        fuel_type: fuel_type || undefined,
        vendor: vendor || undefined,
        receipt_number: receipt_number || undefined,
        notes: notes || undefined,
        vehicle_id: vehicle_id ? BigInt(vehicle_id) : undefined,
        driver_id: driver_id ? BigInt(driver_id) : undefined,
        updated_at: new Date(),
        updated_by: 1 // Assuming a default user for now
      },
      include: {
        vehicles: {
          select: {
            reg_number: true,
            trim: true,
            year: true,
            status: true
          }
        },
        driver_operators: {
          select: {
            name: true,
            phone: true,
            license_number: true
          }
        }
      }
    })

    return NextResponse.json(serializeBigInt(updatedFuelLog))
  } catch (error) {
    console.error('Error updating fuel log:', error)
    return NextResponse.json(
      { error: 'Failed to update fuel log' },
      { status: 500 }
    )
  }
}

// DELETE - Delete fuel log
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Fuel log ID is required' },
        { status: 400 }
      )
    }

    await prisma.fuel_logs.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Fuel log deleted successfully' })
  } catch (error) {
    console.error('Error deleting fuel log:', error)
    return NextResponse.json(
      { error: 'Failed to delete fuel log' },
      { status: 500 }
    )
  }
}
