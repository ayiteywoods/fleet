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
    const reservations = await prisma.vehicle_reservation.findMany({
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

    return NextResponse.json(serializeBigInt(reservations))
  } catch (error) {
    console.error('Error fetching vehicle reservations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle reservations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { justification, start_date, end_date, duration, status, vehicle_id } = body

    // Validate required fields
    if (!justification || !start_date || !end_date || !duration || !status || !vehicle_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const reservation = await prisma.vehicle_reservation.create({
      data: {
        justification,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        duration: parseInt(duration),
        status,
        vehicle_id: BigInt(vehicle_id),
        created_at: new Date(),
        updated_at: new Date()
      },
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
      }
    })

    return NextResponse.json(serializeBigInt(reservation), { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle reservation:', error)
    return NextResponse.json(
      { error: 'Failed to create vehicle reservation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, justification, start_date, end_date, duration, status, vehicle_id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Reservation ID is required' },
        { status: 400 }
      )
    }

    const reservation = await prisma.vehicle_reservation.update({
      where: {
        id: BigInt(id)
      },
      data: {
        justification,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        duration: parseInt(duration),
        status,
        vehicle_id: BigInt(vehicle_id),
        updated_at: new Date()
      },
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
      }
    })

    return NextResponse.json(serializeBigInt(reservation))
  } catch (error) {
    console.error('Error updating vehicle reservation:', error)
    return NextResponse.json(
      { error: 'Failed to update vehicle reservation' },
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
        { error: 'Reservation ID is required' },
        { status: 400 }
      )
    }

    await prisma.vehicle_reservation.delete({
      where: {
        id: BigInt(id)
      }
    })

    return NextResponse.json({ message: 'Vehicle reservation deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle reservation:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle reservation' },
      { status: 500 }
    )
  }
}
