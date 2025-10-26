import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { alertsHandlers } from '@/lib/apiWrapper'

// GET - Fetch all alert records
export async function GET(request: NextRequest) {
  try {
    return await alertsHandlers.getAlerts(request)
  } catch (error: any) {
    console.error('Error in alerts handler:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      unit_uid,
      unit_name,
      gps_time_utc,
      address,
      speed,
      odometer,
      latitude,
      longitude,
      alert_type,
      alert_description,
      engine_status
    } = body

    const alertRecord = await prisma.alerts_data.create({
      data: {
        unit_uid,
        unit_name,
        gps_time_utc: new Date(gps_time_utc),
        address,
        speed: parseFloat(speed),
        odometer: parseFloat(odometer),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        alert_type,
        alert_description,
        engine_status,
        status: 'Active'
      }
    })

    return NextResponse.json({
      ...alertRecord,
      id: alertRecord.id.toString()
    })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const alertRecord = await prisma.alerts_data.update({
      where: { id: BigInt(id) },
      data: updateData
    })

    return NextResponse.json({
      ...alertRecord,
      id: alertRecord.id.toString()
    })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert record' },
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
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    await prisma.alerts_data.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Alert record deleted successfully' })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert record' },
      { status: 500 }
    )
  }
}
