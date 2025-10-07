import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all permissions
export async function GET() {
  try {
    const permissions = await prisma.permissions.findMany({
      orderBy: { name: 'asc' }
    })

    // Serialize BigInt values
    const serializedPermissions = permissions.map(permission => ({
      ...permission,
      id: permission.id.toString()
    }))

    return NextResponse.json(serializedPermissions)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}

// POST - Create new permission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, guard_name = 'web' } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Permission name is required' },
        { status: 400 }
      )
    }

    const newPermission = await prisma.permissions.create({
      data: {
        name,
        guard_name,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    // Serialize BigInt values
    const serializedPermission = {
      ...newPermission,
      id: newPermission.id.toString()
    }

    return NextResponse.json(serializedPermission, { status: 201 })
  } catch (error) {
    console.error('Error creating permission:', error)
    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 }
    )
  }
}

// PUT - Update permission
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Permission ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, guard_name } = body

    const updatedPermission = await prisma.permissions.update({
      where: { id: BigInt(id) },
      data: {
        name: name || undefined,
        guard_name: guard_name || undefined,
        updated_at: new Date()
      }
    })

    // Serialize BigInt values
    const serializedPermission = {
      ...updatedPermission,
      id: updatedPermission.id.toString()
    }

    return NextResponse.json(serializedPermission)
  } catch (error) {
    console.error('Error updating permission:', error)
    return NextResponse.json(
      { error: 'Failed to update permission' },
      { status: 500 }
    )
  }
}

// DELETE - Delete permission
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

    return NextResponse.json(
      { message: 'Permission deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting permission:', error)
    return NextResponse.json(
      { error: 'Failed to delete permission' },
      { status: 500 }
    )
  }
}
