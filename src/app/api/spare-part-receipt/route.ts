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
    const receipts = await prisma.spare_part_receipt.findMany({
      include: {
        spare_part_dispatch: {
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

    return NextResponse.json(serializeBigInt(receipts))
  } catch (error) {
    console.error('Error fetching spare part receipts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spare part receipts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { spare_part_dispatch_id, vehicle_id, quantity, justification, region, district, status } = body

    // Validate required fields
    if (!spare_part_dispatch_id || !vehicle_id || !quantity || !justification || !region || !district || !status) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const receipt = await prisma.spare_part_receipt.create({
      data: {
        spare_part_dispatch: {
          connect: { id: BigInt(spare_part_dispatch_id) }
        },
        vehicles: {
          connect: { id: BigInt(vehicle_id) }
        },
        quantity: parseInt(quantity),
        justification,
        region,
        district,
        status,
        received_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        spare_part_dispatch: {
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

    return NextResponse.json(serializeBigInt(receipt), { status: 201 })
  } catch (error) {
    console.error('Error creating spare part receipt:', error)
    return NextResponse.json(
      { error: 'Failed to create spare part receipt' },
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
    const { spare_part_dispatch_id, vehicle_id, quantity, justification, region, district, status } = body

    // Validate required fields
    if (!spare_part_dispatch_id || !vehicle_id || !quantity || !justification || !region || !district || !status) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const receipt = await prisma.spare_part_receipt.update({
      where: {
        id: BigInt(id)
      },
      data: {
        spare_part_dispatch: {
          connect: { id: BigInt(spare_part_dispatch_id) }
        },
        vehicles: {
          connect: { id: BigInt(vehicle_id) }
        },
        quantity: parseInt(quantity),
        justification,
        region,
        district,
        status,
        updated_at: new Date()
      },
      include: {
        spare_part_dispatch: {
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

    return NextResponse.json(serializeBigInt(receipt))
  } catch (error) {
    console.error('Error updating spare part receipt:', error)
    return NextResponse.json(
      { error: 'Failed to update spare part receipt' },
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

    await prisma.spare_part_receipt.delete({
      where: {
        id: BigInt(id)
      }
    })

    return NextResponse.json({ message: 'Spare part receipt deleted successfully' })
  } catch (error) {
    console.error('Error deleting spare part receipt:', error)
    return NextResponse.json(
      { error: 'Failed to delete spare part receipt' },
      { status: 500 }
    )
  }
}
