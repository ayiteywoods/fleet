import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseFallback, maintenanceScheduleHandlers } from '@/lib/apiWrapper'

// GET - Fetch all maintenance schedules
export const GET = withDatabaseFallback(async (request: NextRequest) => {
  try {
    // Try to use the mock handler first
    return await maintenanceScheduleHandlers.getMaintenanceSchedule(request)
  } catch (error: any) {
    console.error('Error in maintenance schedule handler:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance schedules' },
      { status: 500 }
    )
  }
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      due_date,
      vehicle_id,
      service_type,
      description,
      priority,
      status
    } = body

    const maintenanceSchedule = await prisma.maintenance_schedule.create({
      data: {
        due_date: new Date(due_date),
        vehicle_id: BigInt(vehicle_id),
        service_type,
        description,
        priority,
        status
      }
    })

    return NextResponse.json({
      message: 'Maintenance schedule created successfully',
      schedule: {
        ...maintenanceSchedule,
        id: maintenanceSchedule.id.toString(),
        vehicle_id: maintenanceSchedule.vehicle_id.toString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance schedule' },
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
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    const maintenanceSchedule = await prisma.maintenance_schedule.update({
      where: { id: BigInt(id) },
      data: {
        ...updateData,
        vehicle_id: updateData.vehicle_id ? BigInt(updateData.vehicle_id) : undefined,
        due_date: updateData.due_date ? new Date(updateData.due_date) : undefined
      }
    })

    return NextResponse.json({
      message: 'Maintenance schedule updated successfully',
      schedule: {
        ...maintenanceSchedule,
        id: maintenanceSchedule.id.toString(),
        vehicle_id: maintenanceSchedule.vehicle_id.toString()
      }
    })
  } catch (error) {
    console.error('Error updating maintenance schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance schedule' },
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
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    await prisma.maintenance_schedule.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({
      message: 'Maintenance schedule deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting maintenance schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete maintenance schedule' },
      { status: 500 }
    )
  }
}