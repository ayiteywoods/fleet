import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/drivers/[id] - Get a specific driver
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: params.id },
      include: {
        reservations: {
          include: {
            vehicle: true
          }
        }
      }
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(driver)
  } catch (error) {
    console.error('Error fetching driver:', error)
    return NextResponse.json(
      { error: 'Failed to fetch driver' },
      { status: 500 }
    )
  }
}

// PUT /api/drivers/[id] - Update a specific driver
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, licenseNumber, licenseExpiry, status } = body

    const driver = await prisma.driver.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        licenseNumber,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
        status
      }
    })

    return NextResponse.json(driver)
  } catch (error) {
    console.error('Error updating driver:', error)
    return NextResponse.json(
      { error: 'Failed to update driver' },
      { status: 500 }
    )
  }
}

// DELETE /api/drivers/[id] - Delete a specific driver
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.driver.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Driver deleted successfully' })
  } catch (error) {
    console.error('Error deleting driver:', error)
    return NextResponse.json(
      { error: 'Failed to delete driver' },
      { status: 500 }
    )
  }
}
