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
    const permissions = await prisma.permissions.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(serializeBigInt(permissions))
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, guard_name } = body

    const permission = await prisma.permissions.create({
      data: {
        name: name || '',
        guard_name: guard_name || 'web',
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    return NextResponse.json(serializeBigInt(permission), { status: 201 })
  } catch (error) {
    console.error('Error creating permission:', error)
    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, guard_name } = body

    const permission = await prisma.permissions.update({
      where: { id: BigInt(id) },
      data: {
        name: name || '',
        guard_name: guard_name || 'web',
        updated_at: new Date()
      }
    })
    return NextResponse.json(serializeBigInt(permission))
  } catch (error) {
    console.error('Error updating permission:', error)
    return NextResponse.json(
      { error: 'Failed to update permission' },
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
        { error: 'Permission ID is required' },
        { status: 400 }
      )
    }

    await prisma.permissions.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Permission deleted successfully' })
  } catch (error) {
    console.error('Error deleting permission:', error)
    return NextResponse.json(
      { error: 'Failed to delete permission' },
      { status: 500 }
    )
  }
}