import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all repair schedules
export async function GET() {
  try {
    const repairSchedules = await prisma.repair_schedule.findMany({
      orderBy: { schedule_date: 'desc' }
    })

    // Serialize BigInt values
    const serializedSchedules = repairSchedules.map(schedule => ({
      ...schedule,
      id: schedule.id.toString(),
      assigned_technician: schedule.assigned_technician.toString(),
      repair_request_id: schedule.repair_request_id.toString(),
      created_by: schedule.created_by?.toString(),
      updated_by: schedule.updated_by?.toString()
    }))

    return NextResponse.json(serializedSchedules)
  } catch (error) {
    console.error('Error fetching repair schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repair schedules' },
      { status: 500 }
    )
  }
}

// POST - Create new repair schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      schedule_date,
      assigned_technician,
      repair_request_id
    } = body

    // Validate required fields
    if (!schedule_date || !assigned_technician || !repair_request_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate that the assigned technician exists
    const mechanic = await prisma.mechanics.findUnique({
      where: { id: BigInt(assigned_technician) }
    })
    if (!mechanic) {
      return NextResponse.json(
        { error: 'Assigned technician not found' },
        { status: 400 }
      )
    }

    // Validate that the repair request exists
    const repairRequest = await prisma.repair_request.findUnique({
      where: { id: BigInt(repair_request_id) }
    })
    if (!repairRequest) {
      return NextResponse.json(
        { error: 'Repair request not found' },
        { status: 400 }
      )
    }

    const newRepairSchedule = await prisma.repair_schedule.create({
      data: {
        schedule_date: new Date(schedule_date),
        assigned_technician: BigInt(assigned_technician),
        repair_request_id: BigInt(repair_request_id),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      include: {
        repair_request: {
          include: {
            vehicles: {
              select: {
                reg_number: true,
                trim: true,
                year: true,
                status: true
              }
            },
            workshops: {
              select: {
                name: true,
                region: true,
                district: true
              }
            }
          }
        },
        mechanics: {
          select: {
            name: true,
            specialization: true,
            region: true,
            district: true,
            status: true
          }
        }
      }
    })

    // Serialize BigInt values
    const serializedSchedule = {
      ...newRepairSchedule,
      id: newRepairSchedule.id.toString(),
      assigned_technician: newRepairSchedule.assigned_technician.toString(),
      repair_request_id: newRepairSchedule.repair_request_id.toString(),
      created_by: newRepairSchedule.created_by?.toString(),
      updated_by: newRepairSchedule.updated_by?.toString(),
      repair_request: {
        ...newRepairSchedule.repair_request,
        id: newRepairSchedule.repair_request.id.toString(),
        workshop_id: newRepairSchedule.repair_request.workshop_id.toString(),
        vehicle_id: newRepairSchedule.repair_request.vehicle_id.toString(),
        created_by: newRepairSchedule.repair_request.created_by?.toString(),
        updated_by: newRepairSchedule.repair_request.updated_by?.toString()
      }
    }

    return NextResponse.json(serializedSchedule, { status: 201 })
  } catch (error) {
    console.error('Error creating repair schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create repair schedule' },
      { status: 500 }
    )
  }
}

// PUT - Update repair schedule
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Repair schedule ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      schedule_date,
      assigned_technician,
      repair_request_id
    } = body

    // Validate that the assigned technician exists (if provided)
    if (assigned_technician) {
      const mechanic = await prisma.mechanics.findUnique({
        where: { id: BigInt(assigned_technician) }
      })
      if (!mechanic) {
        return NextResponse.json(
          { error: 'Assigned technician not found' },
          { status: 400 }
        )
      }
    }

    // Validate that the repair request exists (if provided)
    if (repair_request_id) {
      const repairRequest = await prisma.repair_request.findUnique({
        where: { id: BigInt(repair_request_id) }
      })
      if (!repairRequest) {
        return NextResponse.json(
          { error: 'Repair request not found' },
          { status: 400 }
        )
      }
    }

    const updatedRepairSchedule = await prisma.repair_schedule.update({
      where: { id: BigInt(id) },
      data: {
        schedule_date: schedule_date ? new Date(schedule_date) : undefined,
        assigned_technician: assigned_technician ? BigInt(assigned_technician) : undefined,
        repair_request_id: repair_request_id ? BigInt(repair_request_id) : undefined,
        updated_at: new Date(),
        updated_by: 1
      },
      include: {
        repair_request: {
          include: {
            vehicles: {
              select: {
                reg_number: true,
                trim: true,
                year: true,
                status: true
              }
            },
            workshops: {
              select: {
                name: true,
                region: true,
                district: true
              }
            }
          }
        },
        mechanics: {
          select: {
            name: true,
            specialization: true,
            region: true,
            district: true,
            status: true
          }
        }
      }
    })

    // Serialize BigInt values
    const serializedSchedule = {
      ...updatedRepairSchedule,
      id: updatedRepairSchedule.id.toString(),
      assigned_technician: updatedRepairSchedule.assigned_technician.toString(),
      repair_request_id: updatedRepairSchedule.repair_request_id.toString(),
      created_by: updatedRepairSchedule.created_by?.toString(),
      updated_by: updatedRepairSchedule.updated_by?.toString(),
      repair_request: {
        ...updatedRepairSchedule.repair_request,
        id: updatedRepairSchedule.repair_request.id.toString(),
        workshop_id: updatedRepairSchedule.repair_request.workshop_id.toString(),
        vehicle_id: updatedRepairSchedule.repair_request.vehicle_id.toString(),
        created_by: updatedRepairSchedule.repair_request.created_by?.toString(),
        updated_by: updatedRepairSchedule.repair_request.updated_by?.toString()
      }
    }

    return NextResponse.json(serializedSchedule)
  } catch (error) {
    console.error('Error updating repair schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update repair schedule' },
      { status: 500 }
    )
  }
}

// DELETE - Delete repair schedule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Repair schedule ID is required' },
        { status: 400 }
      )
    }

    await prisma.repair_schedule.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Repair schedule deleted successfully' })
  } catch (error) {
    console.error('Error deleting repair schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete repair schedule' },
      { status: 500 }
    )
  }
}
