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
    const groups = await prisma.groups.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(serializeBigInt(groups))
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, desc, status } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // If a group with the same name exists, return it instead of failing
    const existing = await prisma.groups.findFirst({ where: { name } })
    if (existing) {
      return NextResponse.json(serializeBigInt(existing), { status: 200 })
    }

    const group = await prisma.groups.create({
      data: {
        name: name || '',
        desc: desc || null,
        status: status || 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    return NextResponse.json(serializeBigInt(group), { status: 201 })
  } catch (error: any) {
    console.error('Error creating group:', error)
    if (error?.code === 'P2002') {
      // Unique constraint violation on id or other fields
      return NextResponse.json({ error: 'Group already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, desc, status } = body

    const group = await prisma.groups.update({
      where: { id: BigInt(id) },
      data: {
        name: name || '',
        desc: desc || null,
        status: status || 'active',
        updated_at: new Date()
      }
    })
    return NextResponse.json(serializeBigInt(group))
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json(
      { error: 'Failed to update group' },
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
        { error: 'Group ID is required' },
        { status: 400 }
      )
    }

    await prisma.groups.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    )
  }
}