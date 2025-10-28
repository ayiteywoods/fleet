import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseFallback, driverHandlers } from '@/lib/apiWrapper'

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

export const GET = withDatabaseFallback(async (request: NextRequest) => {
  try {
    // Extract user from token for company-based filtering
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let user = null
    if (token) {
      const { verifyToken } = await import('@/lib/auth')
      user = verifyToken(token)
      if (user) {
        console.log('🔐 Authenticated request from:', user.name, 'Role:', user.role)
      }
    }
    return await driverHandlers.getDrivers(request, user || undefined)
  } catch (error: any) {
    console.error('Error in drivers handler:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    )
  }
})

export async function POST(request: NextRequest) {
  try {
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
      vehicle_id,
      cluster,
      subsidiary
    } = body

    // Validate required fields
    if (!name || !phone || !license_number || !license_category || !region || !district) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    const driver = await prisma.driver_operators.create({
      data: {
        name,
        phone,
        license_number,
        license_category,
        license_expire: license_expire || '',
        region,
        district,
        status: status || 'Active',
        spcode: subsidiary ? BigInt(subsidiary) : null,
        vehicle_id: vehicle_id ? BigInt(vehicle_id) : null,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    return NextResponse.json(serializeBigInt(driver), { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

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
      vehicle_id,
      cluster,
      subsidiary
    } = body

    // Validate required fields
    if (!name || !phone || !license_number || !license_category || !region || !district) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    const updateData: any = {
      name,
      phone,
      license_number,
      license_category,
      license_expire: license_expire || '',
      region,
      district,
      status: status || 'Active',
      spcode: subsidiary ? BigInt(subsidiary) : null,
      vehicle_id: vehicle_id ? BigInt(vehicle_id) : null,
      updated_at: new Date()
    }

    const driver = await prisma.driver_operators.update({
      where: {
        id: BigInt(id)
      },
      data: updateData
    })

    return NextResponse.json(serializeBigInt(driver), { status: 200 })
  } catch (error) {
    console.error('Error updating driver:', error)
    return NextResponse.json(
      { error: 'Failed to update driver' },
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
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    await prisma.driver_operators.delete({
      where: {
        id: BigInt(id)
      }
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