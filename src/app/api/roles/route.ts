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
    const roles = await prisma.roles.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(serializeBigInt(roles))
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, guard_name } = body

    if (!name || !guard_name) {
      return NextResponse.json(
        { error: 'name and guard_name are required' },
        { status: 400 }
      )
    }

    // Check for existing role on the unique composite index
    const existing = await prisma.roles.findUnique({
      where: { name_guard_name: { name, guard_name } }
    })
    if (existing) {
      return NextResponse.json(serializeBigInt(existing), { status: 200 })
    }

    const role = await prisma.roles.create({
      data: {
        name,
        guard_name,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    return NextResponse.json(serializeBigInt(role), { status: 201 })
  } catch (error: any) {
    console.error('Error creating role:', error)
    // Handle unique constraint violations
    if (error?.code === 'P2002') {
      const target = error?.meta?.target
      if (Array.isArray(target) && target.includes('roles_name_guard_name_unique')) {
        return NextResponse.json({ error: 'Role already exists' }, { status: 409 })
      }
      if (Array.isArray(target) && target.includes('id')) {
        return NextResponse.json({ error: 'Role ID conflict' }, { status: 500 })
      }
    }
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, guard_name } = body

    const role = await prisma.roles.update({
      where: { id: BigInt(id) },
      data: {
        name: name || '',
        guard_name: guard_name || '',
        updated_at: new Date()
      }
    })
    return NextResponse.json(serializeBigInt(role))
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json(
      { error: 'Failed to update role' },
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
        { error: 'Role ID is required' },
        { status: 400 }
      )
    }

    await prisma.roles.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    )
  }
}