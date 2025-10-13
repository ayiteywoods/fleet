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
    const mechanics = await prisma.mechanics.findMany({
      include: {
        workshops: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(serializeBigInt(mechanics))
  } catch (error) {
    console.error('Error fetching mechanics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mechanics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, specialization, region, district, status, workshop_id } = body

    const mechanic = await prisma.mechanics.create({
      data: {
        name: name || '',
        specialization: specialization || '',
        region: region || '',
        district: district || '',
        status: status || 'active',
        workshop_id: BigInt(workshop_id),
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        workshops: true
      }
    })
    return NextResponse.json(serializeBigInt(mechanic), { status: 201 })
  } catch (error) {
    console.error('Error creating mechanic:', error)
    return NextResponse.json(
      { error: 'Failed to create mechanic' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, specialization, region, district, status, workshop_id } = body

    const mechanic = await prisma.mechanics.update({
      where: { id: BigInt(id) },
      data: {
        name: name || '',
        specialization: specialization || '',
        region: region || '',
        district: district || '',
        status: status || 'active',
        workshop_id: workshop_id ? BigInt(workshop_id) : undefined,
        updated_at: new Date()
      },
      include: {
        workshops: true
      }
    })
    return NextResponse.json(serializeBigInt(mechanic))
  } catch (error) {
    console.error('Error updating mechanic:', error)
    return NextResponse.json(
      { error: 'Failed to update mechanic' },
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
        { error: 'Mechanic ID is required' },
        { status: 400 }
      )
    }

    await prisma.mechanics.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Mechanic deleted successfully' })
  } catch (error) {
    console.error('Error deleting mechanic:', error)
    return NextResponse.json(
      { error: 'Failed to delete mechanic' },
      { status: 500 }
    )
  }
}