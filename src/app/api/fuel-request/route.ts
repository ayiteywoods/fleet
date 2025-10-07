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

// GET - Fetch all fuel requests
export async function GET() {
  try {
    const fuelRequests = await prisma.fuel_request.findMany({
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
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(serializeBigInt(fuelRequests))
  } catch (error) {
    console.error('Error fetching fuel requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fuel requests' },
      { status: 500 }
    )
  }
}

// POST - Create new fuel request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { justification, quantity, unit_cost, total_cost, status, vehicle_id } = body

    if (!justification || !quantity || !unit_cost || !total_cost || !status || !vehicle_id) {
      return NextResponse.json(
        { error: 'Missing required fields: justification, quantity, unit_cost, total_cost, status, vehicle_id' },
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

    const newFuelRequest = await prisma.fuel_request.create({
      data: {
        justification: justification,
        quantity: Number(quantity),
        unit_cost: Number(unit_cost),
        total_cost: Number(total_cost),
        status: status,
        vehicle_id: BigInt(vehicle_id),
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
        }
      }
    })

    return NextResponse.json(serializeBigInt(newFuelRequest), { status: 201 })
  } catch (error) {
    console.error('Error creating fuel request:', error)
    return NextResponse.json(
      { error: 'Failed to create fuel request' },
      { status: 500 }
    )
  }
}

// PUT - Update fuel request
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Fuel request ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { justification, quantity, unit_cost, total_cost, status, vehicle_id } = body

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

    const updatedFuelRequest = await prisma.fuel_request.update({
      where: { id: BigInt(id) },
      data: {
        justification: justification || undefined,
        quantity: quantity ? Number(quantity) : undefined,
        unit_cost: unit_cost ? Number(unit_cost) : undefined,
        total_cost: total_cost ? Number(total_cost) : undefined,
        status: status || undefined,
        vehicle_id: vehicle_id ? BigInt(vehicle_id) : undefined,
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
        }
      }
    })

    return NextResponse.json(serializeBigInt(updatedFuelRequest))
  } catch (error) {
    console.error('Error updating fuel request:', error)
    return NextResponse.json(
      { error: 'Failed to update fuel request' },
      { status: 500 }
    )
  }
}

// DELETE - Delete fuel request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Fuel request ID is required' },
        { status: 400 }
      )
    }

    // First delete related fuel expense logs
    await prisma.fuel_expense_log.deleteMany({
      where: { fuel_request_id: BigInt(id) }
    })

    // Then delete the fuel request
    await prisma.fuel_request.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Fuel request deleted successfully' })
  } catch (error) {
    console.error('Error deleting fuel request:', error)
    return NextResponse.json(
      { error: 'Failed to delete fuel request' },
      { status: 500 }
    )
  }
}
