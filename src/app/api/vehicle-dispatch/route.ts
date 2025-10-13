import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to serialize BigInt values
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString()
  }
  
  if (obj instanceof Date) {
    return obj.toISOString()
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt)
  }
  
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value)
    }
    return serialized
  }
  
  return obj
}

export async function GET() {
  try {
    const vehicleDispatches = await prisma.vehicle_dispatch.findMany({
      include: {
        vehicles: {
          select: {
            id: true,
            reg_number: true,
            vin_number: true,
            trim: true,
            year: true,
            status: true,
            color: true,
            current_region: true,
            current_district: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(serializeBigInt(vehicleDispatches))
  } catch (error) {
    console.error('Error fetching vehicle dispatches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle dispatches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      region, 
      district, 
      first_maintenance, 
      assigned_to, 
      received_by, 
      purpose, 
      dispatch_date, 
      expected_return_date, 
      vehicle_id, 
      driver_id 
    } = body

    const vehicleDispatch = await prisma.vehicle_dispatch.create({
      data: {
        region: region || '',
        district: district || '',
        first_maintenance: first_maintenance ? new Date(first_maintenance) : null,
        assigned_to: assigned_to || '',
        received_by: received_by || '',
        purpose: purpose || '',
        dispatch_date: new Date(dispatch_date),
        expected_return_date: expected_return_date ? new Date(expected_return_date) : null,
        vehicle_id: BigInt(vehicle_id),
        driver_id: BigInt(driver_id),
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    return NextResponse.json(serializeBigInt(vehicleDispatch), { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle dispatch:', error)
    return NextResponse.json(
      { error: 'Failed to create vehicle dispatch' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, 
      region, 
      district, 
      first_maintenance, 
      assigned_to, 
      received_by, 
      purpose, 
      dispatch_date, 
      expected_return_date, 
      vehicle_id, 
      driver_id 
    } = body

    const vehicleDispatch = await prisma.vehicle_dispatch.update({
      where: { id: BigInt(id) },
      data: {
        region: region || '',
        district: district || '',
        first_maintenance: first_maintenance ? new Date(first_maintenance) : null,
        assigned_to: assigned_to || '',
        received_by: received_by || '',
        purpose: purpose || '',
        dispatch_date: new Date(dispatch_date),
        expected_return_date: expected_return_date ? new Date(expected_return_date) : null,
        vehicle_id: BigInt(vehicle_id),
        driver_id: BigInt(driver_id),
        updated_at: new Date()
      }
    })
    return NextResponse.json(serializeBigInt(vehicleDispatch))
  } catch (error) {
    console.error('Error updating vehicle dispatch:', error)
    return NextResponse.json(
      { error: 'Failed to update vehicle dispatch' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle Dispatch ID is required' },
        { status: 400 }
      )
    }

    await prisma.vehicle_dispatch.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Vehicle dispatch deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle dispatch:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle dispatch' },
      { status: 500 }
    )
  }
}
