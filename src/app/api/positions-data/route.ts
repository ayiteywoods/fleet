import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to serialize BigInt values
function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  )
}

// GET - Fetch positions data for a specific vehicle
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicle_id')

    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 })
    }

    // Validate vehicle ID
    if (isNaN(Number(vehicleId))) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 })
    }

    // Get the vehicle's UID to match with positions data
    const vehicle = await prisma.vehicles.findUnique({
      where: { id: BigInt(vehicleId) },
      select: { uid: true }
    })

    if (!vehicle?.uid) {
      // If no UID, return empty array instead of error
      return NextResponse.json(serializeBigInt([]))
    }

    // Fetch real positions data from the database
    const positionsData = await prisma.positions_data.findMany({
      where: {
        unit_uid: vehicle.uid
      },
      orderBy: {
        gps_time_utc: 'desc'
      },
      take: 100 // Limit to last 100 positions
    })

    return NextResponse.json(serializeBigInt(positionsData))
  } catch (error) {
    console.error('Error fetching positions data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch positions data' },
      { status: 500 }
    )
  }
}

// POST - Create new positions data (placeholder for future implementation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // In a real scenario, you would save this to the database
    console.log('Received new positions data:', body)

    return NextResponse.json(
      { message: 'Positions data received (mock success)', data: body },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating positions data:', error)
    return NextResponse.json(
      { error: 'Failed to create positions data' },
      { status: 500 }
    )
  }
}
