import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all maintenance schedules
export async function GET() {
  try {
    const maintenanceSchedules = await prisma.maintenance_schedule.findMany({
      include: {
        vehicles: {
          select: {
            reg_number: true,
            trim: true,
            year: true,
            status: true
          }
        }
      },
      orderBy: { due_date: 'desc' }
    })

    // Serialize BigInt values
    const serializedSchedules = maintenanceSchedules.map(schedule => ({
      ...schedule,
      id: schedule.id.toString(),
      vehicle_id: schedule.vehicle_id.toString(),
      created_by: schedule.created_by?.toString(),
      updated_by: schedule.updated_by?.toString()
    }))

    return NextResponse.json(serializedSchedules)
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance schedules' },
      { status: 500 }
    )
  }
}

// POST - Create new maintenance schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      due_date,
      vehicle_id
    } = body

    // Validate required fields
    if (!due_date || !vehicle_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate that the vehicle exists
    const vehicle = await prisma.vehicles.findUnique({
      where: { id: BigInt(vehicle_id) }
    })
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 400 }
      )
    }

    const newMaintenanceSchedule = await prisma.maintenance_schedule.create({
      data: {
        due_date: new Date(due_date),
        vehicle_id: BigInt(vehicle_id),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      include: {
        vehicles: {
          select: {
            reg_number: true,
            trim: true,
            year: true,
            status: true
          }
        }
      }
    })

    // Serialize BigInt values
    const serializedSchedule = {
      ...newMaintenanceSchedule,
      id: newMaintenanceSchedule.id.toString(),
      vehicle_id: newMaintenanceSchedule.vehicle_id.toString(),
      created_by: newMaintenanceSchedule.created_by?.toString(),
      updated_by: newMaintenanceSchedule.updated_by?.toString()
    }

    return NextResponse.json(serializedSchedule, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance schedule' },
      { status: 500 }
    )
  }
}

// PUT - Update maintenance schedule
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Maintenance schedule ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      due_date,
      vehicle_id
    } = body

    // Validate that the vehicle exists (if provided)
    if (vehicle_id) {
      const vehicle = await prisma.vehicles.findUnique({
        where: { id: BigInt(vehicle_id) }
      })
      if (!vehicle) {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 400 }
        )
      }
    }

    const updatedMaintenanceSchedule = await prisma.maintenance_schedule.update({
      where: { id: BigInt(id) },
      data: {
        due_date: due_date ? new Date(due_date) : undefined,
        vehicle_id: vehicle_id ? BigInt(vehicle_id) : undefined,
        updated_at: new Date(),
        updated_by: 1
      },
      include: {
        vehicles: {
          select: {
            reg_number: true,
            trim: true,
            year: true,
            status: true
          }
        }
      }
    })

    // Serialize BigInt values
    const serializedSchedule = {
      ...updatedMaintenanceSchedule,
      id: updatedMaintenanceSchedule.id.toString(),
      vehicle_id: updatedMaintenanceSchedule.vehicle_id.toString(),
      created_by: updatedMaintenanceSchedule.created_by?.toString(),
      updated_by: updatedMaintenanceSchedule.updated_by?.toString()
    }

    return NextResponse.json(serializedSchedule)
  } catch (error) {
    console.error('Error updating maintenance schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance schedule' },
      { status: 500 }
    )
  }
}

// DELETE - Delete maintenance schedule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Maintenance schedule ID is required' },
        { status: 400 }
      )
    }

    await prisma.maintenance_schedule.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Maintenance schedule deleted successfully' })
  } catch (error) {
    console.error('Error deleting maintenance schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete maintenance schedule' },
      { status: 500 }
    )
  }
}
