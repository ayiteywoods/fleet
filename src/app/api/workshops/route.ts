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
    const workshops = await prisma.workshops.findMany({
      include: {
        supervisors: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(serializeBigInt(workshops))
  } catch (error) {
    console.error('Error fetching workshops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workshops' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, region, district, supervisor_id } = body

    const workshop = await prisma.workshops.create({
      data: {
        name: name || '',
        region: region || '',
        district: district || '',
        supervisor_id: BigInt(supervisor_id),
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        supervisors: true
      }
    })
    return NextResponse.json(serializeBigInt(workshop), { status: 201 })
  } catch (error) {
    console.error('Error creating workshop:', error)
    return NextResponse.json(
      { error: 'Failed to create workshop' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, region, district, supervisor_id } = body

    const workshop = await prisma.workshops.update({
      where: { id: BigInt(id) },
      data: {
        name: name || '',
        region: region || '',
        district: district || '',
        supervisor_id: supervisor_id ? BigInt(supervisor_id) : undefined,
        updated_at: new Date()
      },
      include: {
        supervisors: true
      }
    })
    return NextResponse.json(serializeBigInt(workshop))
  } catch (error) {
    console.error('Error updating workshop:', error)
    return NextResponse.json(
      { error: 'Failed to update workshop' },
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
        { error: 'Workshop ID is required' },
        { status: 400 }
      )
    }

    await prisma.workshops.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Workshop deleted successfully' })
  } catch (error) {
    console.error('Error deleting workshop:', error)
    return NextResponse.json(
      { error: 'Failed to delete workshop' },
      { status: 500 }
    )
  }
}
