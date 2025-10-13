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
    const models = await prisma.model.findMany({
      include: {
        vehicle_make: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    
    return NextResponse.json(serializeBigInt(models))
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, vehicle_make_id } = body
    
    const model = await prisma.model.create({
      data: {
        name: name || '',
        description: description || null,
        vehicle_make_id: BigInt(vehicle_make_id),
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        vehicle_make: true
      }
    })
    
    return NextResponse.json(serializeBigInt(model), { status: 201 })
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, vehicle_make_id } = body
    
    const model = await prisma.model.update({
      where: { id: BigInt(id) },
      data: {
        name: name || '',
        description: description || null,
        vehicle_make_id: vehicle_make_id ? BigInt(vehicle_make_id) : undefined,
        updated_at: new Date()
      },
      include: {
        vehicle_make: true
      }
    })
    
    return NextResponse.json(serializeBigInt(model))
  } catch (error) {
    console.error('Error updating model:', error)
    return NextResponse.json(
      { error: 'Failed to update model' },
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
        { error: 'Model ID is required' },
        { status: 400 }
      )
    }

    await prisma.model.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Model deleted successfully' })
  } catch (error) {
    console.error('Error deleting model:', error)
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    )
  }
}
