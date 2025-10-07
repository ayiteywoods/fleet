import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all vehicle types
export async function GET() {
  try {
    const vehicleTypes = await prisma.vehicle_types.findMany({
      orderBy: { type: 'asc' }
    })

    // Serialize BigInt values
    const serializedTypes = vehicleTypes.map(type => ({
      ...type,
      id: type.id.toString(),
      created_by: type.created_by?.toString() || null,
      updated_by: type.updated_by?.toString() || null
    }))

    return NextResponse.json(serializedTypes)
  } catch (error) {
    console.error('Error fetching vehicle types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle types' },
      { status: 500 }
    )
  }
}

// POST - Create new vehicle type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, description } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      )
    }

    const newType = await prisma.vehicle_types.create({
      data: {
        type,
        description: description || null,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1, // Default user ID
        updated_by: 1  // Default user ID
      }
    })

    // Serialize BigInt values
    const serializedType = {
      ...newType,
      id: newType.id.toString(),
      created_by: newType.created_by?.toString() || null,
      updated_by: newType.updated_by?.toString() || null
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle type added successfully!',
      type: serializedType
    })
  } catch (error) {
    console.error('Error creating vehicle type:', error)
    return NextResponse.json(
      { error: 'Failed to create vehicle type' },
      { status: 500 }
    )
  }
}

// PUT - Update vehicle type
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle type ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { type, description } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      )
    }

    const updatedType = await prisma.vehicle_types.update({
      where: { id: BigInt(id) },
      data: {
        type,
        description: description || null,
        updated_at: new Date(),
        updated_by: 1 // Default user ID
      }
    })

    // Serialize BigInt values
    const serializedType = {
      ...updatedType,
      id: updatedType.id.toString(),
      created_by: updatedType.created_by?.toString() || null,
      updated_by: updatedType.updated_by?.toString() || null
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle type updated successfully!',
      type: serializedType
    })
  } catch (error) {
    console.error('Error updating vehicle type:', error)
    return NextResponse.json(
      { error: 'Failed to update vehicle type' },
      { status: 500 }
    )
  }
}

// DELETE - Delete vehicle type
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle type ID is required' },
        { status: 400 }
      )
    }

    await prisma.vehicle_types.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'Vehicle type deleted successfully!'
    })
  } catch (error) {
    console.error('Error deleting vehicle type:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle type' },
      { status: 500 }
    )
  }
}
