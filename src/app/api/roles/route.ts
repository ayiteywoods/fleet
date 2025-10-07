import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all roles
export async function GET() {
  try {
    const roles = await prisma.roles.findMany({
      orderBy: { name: 'asc' }
    })

    // Serialize BigInt values
    const serializedRoles = roles.map(role => ({
      ...role,
      id: role.id.toString()
    }))

    return NextResponse.json(serializedRoles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

// POST - Create new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, guard_name = 'web' } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      )
    }

    const newRole = await prisma.roles.create({
      data: {
        name,
        guard_name,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    // Serialize BigInt values
    const serializedRole = {
      ...newRole,
      id: newRole.id.toString()
    }

    return NextResponse.json(serializedRole, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
}

// PUT - Update role
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, guard_name } = body

    const updatedRole = await prisma.roles.update({
      where: { id: BigInt(id) },
      data: {
        name: name || undefined,
        guard_name: guard_name || undefined,
        updated_at: new Date()
      }
    })

    // Serialize BigInt values
    const serializedRole = {
      ...updatedRole,
      id: updatedRole.id.toString()
    }

    return NextResponse.json(serializedRole)
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}

// DELETE - Delete role
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

    return NextResponse.json(
      { message: 'Role deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    )
  }
}
