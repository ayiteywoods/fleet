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
        vehicle_makes: true
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

    if (!name || !vehicle_make_id) {
      return NextResponse.json(
        { error: 'Model name and vehicle make are required.' },
        { status: 400 }
      )
    }

    let makeId: bigint
    try {
      makeId = BigInt(vehicle_make_id)
    } catch (e) {
      console.error('Invalid vehicle_make_id value:', vehicle_make_id, e)
      return NextResponse.json(
        { error: 'Invalid vehicle make selected.' },
        { status: 400 }
      )
    }

    // Work around legacy DB where `id` is unique but not properly auto-incrementing
    // Find the current max(id) and insert with next BigInt value
    const lastModel = await prisma.model.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    })
    const currentId = (lastModel?.id as bigint | undefined) ?? BigInt(0)
    const nextId = currentId + BigInt(1)

    const model = await prisma.model.create({
      data: {
        id: nextId,
        name: name || '',
        description: description || null,
        vehicle_make_id: makeId,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        vehicle_makes: true
      }
    })
    
    return NextResponse.json(serializeBigInt(model), { status: 201 })
  } catch (error: any) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { error: 'Failed to create model', details: error?.message ?? 'Unknown error' },
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
        vehicle_makes: true
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
