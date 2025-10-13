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

export async function GET(request: NextRequest) {
  try {
    const requests = await prisma.spare_part_request.findMany({
      include: {
        spare_part_inventory: {
          select: {
            id: true,
            part_name: true,
            description: true,
            supplier_name: true
          }
        },
        vehicles: {
          select: {
            id: true,
            reg_number: true,
            trim: true,
            year: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(serializeBigInt(requests))
  } catch (error) {
    console.error('Error fetching spare part requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spare part requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quantity, justification, region, district, status, spare_part_inventory_id, vehicle_id } = body

    // Validate required fields
    if (!quantity || !justification || !region || !district || !status || !spare_part_inventory_id || !vehicle_id) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const requestRecord = await prisma.spare_part_request.create({
      data: {
        quantity: parseInt(quantity),
        justification,
        region,
        district,
        status,
        spare_part_inventory_id: BigInt(spare_part_inventory_id),
        vehicle_id: BigInt(vehicle_id),
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        spare_part_inventory: {
          select: {
            id: true,
            part_name: true,
            description: true,
            supplier_name: true
          }
        },
        vehicles: {
          select: {
            id: true,
            reg_number: true,
            trim: true,
            year: true
          }
        }
      }
    })

    return NextResponse.json(serializeBigInt(requestRecord), { status: 201 })
  } catch (error) {
    console.error('Error creating spare part request:', error)
    return NextResponse.json(
      { error: 'Failed to create spare part request' },
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
    const { quantity, justification, region, district, status, spare_part_inventory_id, vehicle_id } = body

    // Validate required fields
    if (!quantity || !justification || !region || !district || !status || !spare_part_inventory_id || !vehicle_id) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const requestRecord = await prisma.spare_part_request.update({
      where: {
        id: BigInt(id)
      },
      data: {
        quantity: parseInt(quantity),
        justification,
        region,
        district,
        status,
        spare_part_inventory_id: BigInt(spare_part_inventory_id),
        vehicle_id: BigInt(vehicle_id),
        updated_at: new Date()
      },
      include: {
        spare_part_inventory: {
          select: {
            id: true,
            part_name: true,
            description: true,
            supplier_name: true
          }
        },
        vehicles: {
          select: {
            id: true,
            reg_number: true,
            trim: true,
            year: true
          }
        }
      }
    })

    return NextResponse.json(serializeBigInt(requestRecord))
  } catch (error) {
    console.error('Error updating spare part request:', error)
    return NextResponse.json(
      { error: 'Failed to update spare part request' },
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

    await prisma.spare_part_request.delete({
      where: {
        id: BigInt(id)
      }
    })

    return NextResponse.json({ message: 'Spare part request deleted successfully' })
  } catch (error) {
    console.error('Error deleting spare part request:', error)
    return NextResponse.json(
      { error: 'Failed to delete spare part request' },
      { status: 500 }
    )
  }
}
