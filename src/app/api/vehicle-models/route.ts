import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleMakeId = searchParams.get('vehicle_make_id')

    let whereClause = {}
    if (vehicleMakeId) {
      whereClause = { vehicle_make_id: BigInt(vehicleMakeId) }
    }

    const models = await prisma.model.findMany({
      where: whereClause,
      include: {
        vehicle_make: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(serializeBigInt(models))
  } catch (error) {
    console.error('Error fetching vehicle models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, vehicle_make_id } = body

    // Validate required fields
    if (!name || !vehicle_make_id) {
      return NextResponse.json(
        { error: 'Name and vehicle make ID are required' },
        { status: 400 }
      )
    }

    const model = await prisma.model.create({
      data: {
        name,
        description: description || null,
        vehicle_make_id: BigInt(vehicle_make_id),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      include: {
        vehicle_make: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(serializeBigInt(model), { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle model:', error)
    return NextResponse.json(
      { error: 'Failed to create vehicle model' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, vehicle_make_id } = body

    // Validate required fields
    if (!name || !vehicle_make_id) {
      return NextResponse.json(
        { error: 'Name and vehicle make ID are required' },
        { status: 400 }
      )
    }

    const model = await prisma.model.update({
      where: {
        id: BigInt(id)
      },
      data: {
        name,
        description: description || null,
        vehicle_make_id: BigInt(vehicle_make_id),
        updated_at: new Date(),
        updated_by: 1
      },
      include: {
        vehicle_make: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(serializeBigInt(model), { status: 200 })
  } catch (error) {
    console.error('Error updating vehicle model:', error)
    return NextResponse.json(
      { error: 'Failed to update vehicle model' },
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
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    await prisma.model.delete({
      where: {
        id: BigInt(id)
      }
    })

    return NextResponse.json({ message: 'Vehicle model deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle model:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle model' },
      { status: 500 }
    )
  }
}
