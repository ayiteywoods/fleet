import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to serialize BigInt and Date objects
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'bigint') return obj.toString()
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) return obj.map(serializeBigInt)
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value)
    }
    return serialized
  }
  return obj
}

// GET /api/vehicles/[id] - Get a specific vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vehicle = await prisma.vehicles.findUnique({
      where: { id: BigInt(id) },
      include: {
        vehicle_types: true,
        vehicle_makes: true,
        driver_operators: true,
        subsidiary: true
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(serializeBigInt(vehicle))
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle' },
      { status: 500 }
    )
  }
}

// PUT /api/vehicles/[id] - Update a specific vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { 
      name,
      reg_number,
      vehicle_type_id,
      vehicle_make_id,
      vin_number,
      year,
      color,
      engine_number,
      chassis_number,
      current_region,
      current_district,
      current_mileage,
      last_service_date,
      next_service_km,
      status,
      spcode,
      driver_id,
      notes
    } = body

    const updateData: any = {
      reg_number,
      vin_number,
      color,
      engine_number,
      chassis_number,
      current_region,
      current_district,
      current_mileage: current_mileage ? parseFloat(current_mileage) : undefined,
      last_service_date: last_service_date ? new Date(last_service_date) : undefined,
      next_service_km: next_service_km ? parseInt(next_service_km) : undefined,
      status,
      notes
    }

    // Add year if provided
    if (year) {
      updateData.year = parseInt(year)
    }

    // Add type_id if provided
    if (vehicle_type_id) {
      updateData.type_id = BigInt(vehicle_type_id)
    }

    // Add make_id if provided
    if (vehicle_make_id) {
      updateData.make_id = BigInt(vehicle_make_id)
    }

    // Add spcode if provided
    if (spcode) {
      updateData.spcode = BigInt(spcode)
    }

    const vehicle = await prisma.vehicles.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        vehicle_types: true,
        vehicle_makes: true,
        driver_operators: true,
        subsidiary: true
      }
    })

    return NextResponse.json(serializeBigInt(vehicle))
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    )
  }
}

// DELETE /api/vehicles/[id] - Delete a specific vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.vehicles.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Vehicle deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    )
  }
}
