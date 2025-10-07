import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/vehicles/[id] - Get a specific vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        reservations: {
          include: {
            driver: true
          }
        },
        maintenance: true
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle' },
      { status: 500 }
    )
  }
}

// PUT /api/vehicles/[id] - Update a specific vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { make, model, year, licensePlate, vin, color, mileage, status } = body

    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        make,
        model,
        year: year ? parseInt(year) : undefined,
        licensePlate,
        vin,
        color,
        mileage: mileage ? parseInt(mileage) : undefined,
        status
      }
    })

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    )
  }
}

// DELETE /api/vehicles/[id] - Delete a specific vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.vehicle.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Vehicle deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    )
  }
}
