import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all repair requests
export async function GET() {
  try {
    const repairRequests = await prisma.repair_request.findMany({
      orderBy: { created_at: 'desc' }
    })

    // Serialize BigInt values
    const serializedRequests = repairRequests.map(request => ({
      ...request,
      id: request.id.toString(),
      workshop_id: request.workshop_id.toString(),
      vehicle_id: request.vehicle_id.toString(),
      created_by: request.created_by?.toString(),
      updated_by: request.updated_by?.toString()
    }))

    return NextResponse.json(serializedRequests)
  } catch (error) {
    console.error('Error fetching repair requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repair requests' },
      { status: 500 }
    )
  }
}

// POST - Create new repair request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      issue_desc,
      urgency_level,
      region,
      district,
      status,
      workshop_id,
      vehicle_id
    } = body

    // Validate required fields
    if (!issue_desc || !urgency_level || !region || !district || !status || !workshop_id || !vehicle_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newRepairRequest = await prisma.repair_request.create({
      data: {
        issue_desc,
        urgency_level,
        region,
        district,
        status,
        workshop_id: BigInt(workshop_id),
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
        },
        workshops: {
          select: {
            name: true,
            region: true,
            district: true
          }
        }
      }
    })

    // Serialize BigInt values
    const serializedRequest = {
      ...newRepairRequest,
      id: newRepairRequest.id.toString(),
      workshop_id: newRepairRequest.workshop_id.toString(),
      vehicle_id: newRepairRequest.vehicle_id.toString(),
      created_by: newRepairRequest.created_by?.toString(),
      updated_by: newRepairRequest.updated_by?.toString()
    }

    return NextResponse.json(serializedRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating repair request:', error)
    return NextResponse.json(
      { error: 'Failed to create repair request' },
      { status: 500 }
    )
  }
}

// PUT - Update repair request
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Repair request ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      issue_desc,
      urgency_level,
      region,
      district,
      status,
      workshop_id,
      vehicle_id
    } = body

    const updatedRepairRequest = await prisma.repair_request.update({
      where: { id: BigInt(id) },
      data: {
        issue_desc: issue_desc || undefined,
        urgency_level: urgency_level || undefined,
        region: region || undefined,
        district: district || undefined,
        status: status || undefined,
        workshop_id: workshop_id ? BigInt(workshop_id) : undefined,
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
        },
        workshops: {
          select: {
            name: true,
            region: true,
            district: true
          }
        }
      }
    })

    // Serialize BigInt values
    const serializedRequest = {
      ...updatedRepairRequest,
      id: updatedRepairRequest.id.toString(),
      workshop_id: updatedRepairRequest.workshop_id.toString(),
      vehicle_id: updatedRepairRequest.vehicle_id.toString(),
      created_by: updatedRepairRequest.created_by?.toString(),
      updated_by: updatedRepairRequest.updated_by?.toString()
    }

    return NextResponse.json(serializedRequest)
  } catch (error) {
    console.error('Error updating repair request:', error)
    return NextResponse.json(
      { error: 'Failed to update repair request' },
      { status: 500 }
    )
  }
}

// DELETE - Delete repair request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Repair request ID is required' },
        { status: 400 }
      )
    }

    // First delete associated repair schedules
    await prisma.repair_schedule.deleteMany({
      where: { repair_request_id: BigInt(id) }
    })

    // Then delete the repair request
    await prisma.repair_request.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Repair request deleted successfully' })
  } catch (error) {
    console.error('Error deleting repair request:', error)
    return NextResponse.json(
      { error: 'Failed to delete repair request' },
      { status: 500 }
    )
  }
}
