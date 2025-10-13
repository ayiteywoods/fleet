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
    const vehicleTypes = await prisma.vehicle_types.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(serializeBigInt(vehicleTypes))
  } catch (error) {
    console.error('Error fetching vehicle types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, description } = body

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      )
    }

    const vehicleType = await prisma.vehicle_types.create({
      data: {
        type,
        description: description || null
      }
    })

    return NextResponse.json(serializeBigInt(vehicleType), { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle type:', error)
    return NextResponse.json(
      { error: 'Failed to create vehicle type' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type, description } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle type ID is required' },
        { status: 400 }
      )
    }

    const vehicleType = await prisma.vehicle_types.update({
      where: {
        id: BigInt(id)
      },
      data: {
        type,
        description: description || null
      }
    })

    return NextResponse.json(serializeBigInt(vehicleType))
  } catch (error) {
    console.error('Error updating vehicle type:', error)
    return NextResponse.json(
      { error: 'Failed to update vehicle type' },
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
        { error: 'Vehicle type ID is required' },
        { status: 400 }
      )
    }

    await prisma.vehicle_types.delete({
      where: {
        id: BigInt(id)
      }
    })

    return NextResponse.json({ message: 'Vehicle type deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle type:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle type' },
      { status: 500 }
    )
  }
}