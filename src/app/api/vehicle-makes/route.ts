import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const vehicleMakes = await prisma.vehicle_makes.findMany({
      orderBy: { name: 'asc' }
    })

    // Convert BigInt values to strings for JSON serialization
    const serializedMakes = vehicleMakes.map(make => ({
      ...make,
      id: make.id.toString(),
      created_by: make.created_by?.toString() || null,
      updated_by: make.updated_by?.toString() || null
    }))

    return NextResponse.json(serializedMakes)
  } catch (error: any) {
    console.error('Error fetching vehicle makes:', error)
    return NextResponse.json({ 
      error: 'Error fetching vehicle makes', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const vehicleMake = await prisma.vehicle_makes.create({
      data: {
        name: body.name,
        model: body.model,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1, // Default user ID
        updated_by: 1  // Default user ID
      }
    })

    // Convert BigInt values to strings for JSON serialization
    const serializedMake = {
      ...vehicleMake,
      id: vehicleMake.id.toString(),
      created_by: vehicleMake.created_by?.toString() || null,
      updated_by: vehicleMake.updated_by?.toString() || null
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle make added successfully!',
      make: serializedMake 
    })
  } catch (error: any) {
    console.error('Error creating vehicle make:', error)
    return NextResponse.json({ 
      error: 'Error creating vehicle make', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Vehicle make ID is required' }, { status: 400 })
    }

    const updatedMake = await prisma.vehicle_makes.update({
      where: { id: BigInt(id) },
      data: {
        name: body.name,
        model: body.model,
        updated_at: new Date(),
        updated_by: 1 // Default user ID
      }
    })

    // Convert BigInt values to strings for JSON serialization
    const serializedMake = {
      ...updatedMake,
      id: updatedMake.id.toString(),
      created_by: updatedMake.created_by?.toString() || null,
      updated_by: updatedMake.updated_by?.toString() || null
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle make updated successfully!',
      make: serializedMake 
    })
  } catch (error: any) {
    console.error('Error updating vehicle make:', error)
    return NextResponse.json({ 
      error: 'Error updating vehicle make', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Vehicle make ID is required' }, { status: 400 })
    }

    await prisma.vehicle_makes.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle make deleted successfully!'
    })
  } catch (error: any) {
    console.error('Error deleting vehicle make:', error)
    return NextResponse.json({ 
      error: 'Error deleting vehicle make', 
      details: error.message 
    }, { status: 500 })
  }
}
