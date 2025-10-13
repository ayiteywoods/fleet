import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    const inventories = await prisma.spare_part_inventory.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(serializeBigInt(inventories))
  } catch (error) {
    console.error('Error fetching spare part inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spare part inventory' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { part_name, description, quantity, reorder_threshold, supplier_name } = body

    // Validate required fields
    if (!part_name || !description || !quantity || !reorder_threshold || !supplier_name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const inventory = await prisma.spare_part_inventory.create({
      data: {
        part_name,
        description,
        quantity: parseInt(quantity),
        reorder_threshold: parseInt(reorder_threshold),
        supplier_name,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    return NextResponse.json(serializeBigInt(inventory), { status: 201 })
  } catch (error) {
    console.error('Error creating spare part inventory:', error)
    return NextResponse.json(
      { error: 'Failed to create spare part inventory' },
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
    const { part_name, description, quantity, reorder_threshold, supplier_name } = body

    // Validate required fields
    if (!part_name || !description || !quantity || !reorder_threshold || !supplier_name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const inventory = await prisma.spare_part_inventory.update({
      where: {
        id: BigInt(id)
      },
      data: {
        part_name,
        description,
        quantity: parseInt(quantity),
        reorder_threshold: parseInt(reorder_threshold),
        supplier_name,
        updated_at: new Date()
      }
    })

    return NextResponse.json(serializeBigInt(inventory))
  } catch (error) {
    console.error('Error updating spare part inventory:', error)
    return NextResponse.json(
      { error: 'Failed to update spare part inventory' },
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

    await prisma.spare_part_inventory.delete({
      where: {
        id: BigInt(id)
      }
    })

    return NextResponse.json({ message: 'Spare part inventory deleted successfully' })
  } catch (error) {
    console.error('Error deleting spare part inventory:', error)
    return NextResponse.json(
      { error: 'Failed to delete spare part inventory' },
      { status: 500 }
    )
  }
}
