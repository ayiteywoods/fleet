import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fuelRequestHandlers } from '@/lib/apiWrapper'

// GET - Fetch all fuel request records
export async function GET(request: NextRequest) {
  try {
    return await fuelRequestHandlers.getFuelRequests(request)
  } catch (error: any) {
    console.error('Error in fuel request handler:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fuel request records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      justification,
      quantity,
      unit_cost,
      total_cost,
      status,
      vehicle_id
    } = body

    const fuelRequestRecord = await prisma.fuel_request.create({
      data: {
        justification,
        quantity: parseFloat(quantity),
        unit_cost: parseFloat(unit_cost),
        total_cost: parseFloat(total_cost),
        status,
        vehicle_id: BigInt(vehicle_id)
      }
    })

    return NextResponse.json({
      ...fuelRequestRecord,
      id: fuelRequestRecord.id.toString()
    })
  } catch (error) {
    console.error('Error creating fuel request:', error)
    return NextResponse.json(
      { error: 'Failed to create fuel request record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const fuelRequestRecord = await prisma.fuel_request.update({
      where: { id: BigInt(id) },
      data: updateData
    })

    return NextResponse.json({
      ...fuelRequestRecord,
      id: fuelRequestRecord.id.toString()
    })
  } catch (error) {
    console.error('Error updating fuel request:', error)
    return NextResponse.json(
      { error: 'Failed to update fuel request record' },
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
        { error: 'Fuel request ID is required' },
        { status: 400 }
      )
    }

    await prisma.fuel_request.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Fuel request record deleted successfully' })
  } catch (error) {
    console.error('Error deleting fuel request:', error)
    return NextResponse.json(
      { error: 'Failed to delete fuel request record' },
      { status: 500 }
    )
  }
}