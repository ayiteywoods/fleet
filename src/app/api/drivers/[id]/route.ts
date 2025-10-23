import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to serialize BigInt and Date objects
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'bigint') return obj.toString()
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) return obj.map(serializeBigInt)
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value)
    }
    return serialized
  }
  return obj
}

// GET /api/drivers/[id] - Get a specific driver
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const driver = await prisma.driver_operators.findUnique({
      where: { id: BigInt(id) },
      include: {
        vehicles: true
      }
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    // Fetch subsidiary if spcode exists
    let subsidiary = null
    if (driver.spcode) {
      subsidiary = await prisma.subsidiary.findUnique({
        where: { id: BigInt(driver.spcode) }
      })
    }

    // Add subsidiary to driver object
    const driverWithSubsidiary = {
      ...driver,
      subsidiary
    }

    return NextResponse.json(serializeBigInt(driverWithSubsidiary))
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      name, 
      phone, 
      license_number, 
      license_category, 
      license_expire, 
      region, 
      district, 
      status, 
      subsidiary_id 
    } = body

    const updateData: any = {
      name,
      phone,
      license_number,
      license_category,
      license_expire,
      region,
      district,
      status
    }

    // Add spcode if subsidiary_id is provided
    if (subsidiary_id) {
      updateData.spcode = BigInt(subsidiary_id)
    }

    const driver = await prisma.driver_operators.update({
      where: { id: BigInt(id) },
      data: updateData
    })

    return NextResponse.json(serializeBigInt(driver))
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.driver_operators.delete({
      where: { id: BigInt(id) }
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
