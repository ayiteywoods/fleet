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
    const supervisors = await prisma.supervisors.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(serializeBigInt(supervisors))
  } catch (error) {
    console.error('Error fetching supervisors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supervisors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, region, district, status } = body

    const supervisor = await prisma.supervisors.create({
      data: {
        name: name || '',
        phone: phone || '',
        email: email || '',
        region: region || '',
        district: district || '',
        status: status || 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    return NextResponse.json(serializeBigInt(supervisor), { status: 201 })
  } catch (error) {
    console.error('Error creating supervisor:', error)
    return NextResponse.json(
      { error: 'Failed to create supervisor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, phone, email, region, district, status } = body

    const supervisor = await prisma.supervisors.update({
      where: { id: BigInt(id) },
      data: {
        name: name || '',
        phone: phone || '',
        email: email || '',
        region: region || '',
        district: district || '',
        status: status || 'active',
        updated_at: new Date()
      }
    })
    return NextResponse.json(serializeBigInt(supervisor))
  } catch (error) {
    console.error('Error updating supervisor:', error)
    return NextResponse.json(
      { error: 'Failed to update supervisor' },
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
        { error: 'Supervisor ID is required' },
        { status: 400 }
      )
    }

    await prisma.supervisors.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Supervisor deleted successfully' })
  } catch (error) {
    console.error('Error deleting supervisor:', error)
    return NextResponse.json(
      { error: 'Failed to delete supervisor' },
      { status: 500 }
    )
  }
}
