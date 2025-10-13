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
    const dispatches = await prisma.spare_part_dispatch.findMany({
      include: {
        spare_part_request: {
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
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(serializeBigInt(dispatches))
  } catch (error) {
    console.error('Error fetching spare part dispatches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spare part dispatches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quantity, status, spare_part_request_id } = body

    // Validate required fields
    if (!quantity || !status || !spare_part_request_id) {
      return NextResponse.json(
        { error: 'Quantity, status, and spare part request ID are required' },
        { status: 400 }
      )
    }

    const dispatch = await prisma.spare_part_dispatch.create({
      data: {
        quantity: parseInt(quantity),
        status,
        spare_part_request_id: BigInt(spare_part_request_id),
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    return NextResponse.json(serializeBigInt(dispatch), { status: 201 })
  } catch (error) {
    console.error('Error creating spare part dispatch:', error)
    return NextResponse.json(
      { error: 'Failed to create spare part dispatch' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, quantity, status, spare_part_request_id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Dispatch ID is required' },
        { status: 400 }
      )
    }

    const dispatch = await prisma.spare_part_dispatch.update({
      where: {
        id: BigInt(id)
      },
      data: {
        quantity: quantity ? parseInt(quantity) : undefined,
        status,
        spare_part_request_id: spare_part_request_id ? BigInt(spare_part_request_id) : undefined,
        updated_at: new Date()
      }
    })

    return NextResponse.json(serializeBigInt(dispatch))
  } catch (error) {
    console.error('Error updating spare part dispatch:', error)
    return NextResponse.json(
      { error: 'Failed to update spare part dispatch' },
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
        { error: 'Dispatch ID is required' },
        { status: 400 }
      )
    }

    await prisma.spare_part_dispatch.delete({
      where: {
        id: BigInt(id)
      }
    })

    return NextResponse.json({ message: 'Spare part dispatch deleted successfully' })
  } catch (error) {
    console.error('Error deleting spare part dispatch:', error)
    return NextResponse.json(
      { error: 'Failed to delete spare part dispatch' },
      { status: 500 }
    )
  }
}
