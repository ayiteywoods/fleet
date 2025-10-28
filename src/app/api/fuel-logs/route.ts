import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseFallback, fuelLogsHandlers } from '@/lib/apiWrapper'

// Helper function to serialize BigInts
function serializeBigInt(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  )
}

// GET - Fetch all fuel logs
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
    return await fuelLogsHandlers.getFuelLogs(request, user || undefined)
  } catch (error: any) {
    console.error('Error in fuel logs handler:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fuel logs' },
      { status: 500 }
    )
  }
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      refuel_date, 
      quantity, 
      cost, 
      fuel_type, 
      station_name, 
      odometer_reading, 
      vehicle_id 
    } = body

    const fuelLog = await prisma.fuel_logs.create({
      data: {
        refuel_date: new Date(refuel_date),
        quantity: parseFloat(quantity),
        cost: parseFloat(cost),
        fuel_type,
        station_name,
        odometer_reading: parseInt(odometer_reading),
        vehicle_id: BigInt(vehicle_id)
      }
    })

    return NextResponse.json({
      message: 'Fuel log created successfully',
      fuelLog: {
        ...fuelLog,
        id: fuelLog.id.toString(),
        vehicle_id: fuelLog.vehicle_id.toString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating fuel log:', error)
    return NextResponse.json(
      { error: 'Failed to create fuel log' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Fuel log ID is required' },
        { status: 400 }
      )
    }

    const fuelLog = await prisma.fuel_logs.update({
      where: { id: BigInt(id) },
      data: {
        ...updateData,
        vehicle_id: updateData.vehicle_id ? BigInt(updateData.vehicle_id) : undefined,
        refuel_date: updateData.refuel_date ? new Date(updateData.refuel_date) : undefined,
        quantity: updateData.quantity ? parseFloat(updateData.quantity) : undefined,
        cost: updateData.cost ? parseFloat(updateData.cost) : undefined,
        odometer_reading: updateData.odometer_reading ? parseInt(updateData.odometer_reading) : undefined
      }
    })

    return NextResponse.json({
      message: 'Fuel log updated successfully',
      fuelLog: {
        ...fuelLog,
        id: fuelLog.id.toString(),
        vehicle_id: fuelLog.vehicle_id.toString()
      }
    })
  } catch (error) {
    console.error('Error updating fuel log:', error)
    return NextResponse.json(
      { error: 'Failed to update fuel log' },
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
        { error: 'Fuel log ID is required' },
        { status: 400 }
      )
    }

    await prisma.fuel_logs.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({
      message: 'Fuel log deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting fuel log:', error)
    return NextResponse.json(
      { error: 'Failed to delete fuel log' },
      { status: 500 }
    )
  }
}