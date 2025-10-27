import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseFallback, maintenanceHandlers } from '@/lib/apiWrapper'

// GET - Fetch all maintenance records
export const GET = withDatabaseFallback(async (request: NextRequest) => {
  try {
    // Try to use the mock handler first
    return await maintenanceHandlers.getMaintenance(request)
  } catch (error: any) {
    console.error('Error in maintenance handler:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance records', details: error.message },
      { status: 500 }
    )
  }
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      service_date,
      cost,
      mileage,
      mileage_at_service,
      description,
      service_details,
      next_service_date,
      next_service_mileage,
      vehicle_id,
      mechanic_id,
      workshop_id,
      service_type,
      status,
      parts_replaced
    } = body

    // Handle both field name formats (mileage vs mileage_at_service, description vs service_details)
    const finalMileage = mileage || mileage_at_service || '0'
    const finalDescription = description || service_details || ''
    const finalStatus = status || 'completed'
    const finalPartsReplaced = parts_replaced || ''

    // Validate required fields
    if (!service_date || !cost || !service_type || !vehicle_id) {
      return NextResponse.json(
        { error: 'Missing required fields: service_date, cost, service_type, and vehicle_id are required' },
        { status: 400 }
      )
    }

    // Check if mechanic_id and workshop_id are required and provided
    if (!mechanic_id || !workshop_id) {
      return NextResponse.json(
        { error: 'Mechanic and Workshop are required fields' },
        { status: 400 }
      )
    }

    const maintenanceRecord = await prisma.maintenance_history.create({
      data: {
        service_date: new Date(service_date),
        cost: parseFloat(cost),
        status: finalStatus,
        service_details: finalDescription,
        service_type,
        mileage_at_service: parseInt(finalMileage),
        parts_replaced: finalPartsReplaced,
        vehicle_id: BigInt(vehicle_id),
        mechanic_id: BigInt(mechanic_id),
        workshop_id: BigInt(workshop_id)
      }
    })

    return NextResponse.json({
      message: 'Maintenance record created successfully',
      maintenance: {
        ...maintenanceRecord,
        id: maintenanceRecord.id.toString(),
        vehicle_id: maintenanceRecord.vehicle_id.toString(),
        mechanic_id: maintenanceRecord.mechanic_id?.toString(),
        workshop_id: maintenanceRecord.workshop_id?.toString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance record' },
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
        { error: 'Maintenance ID is required' },
        { status: 400 }
      )
    }

    const maintenanceRecord = await prisma.maintenance_history.update({
      where: { id: BigInt(id) },
      data: {
        ...updateData,
        vehicle_id: updateData.vehicle_id ? BigInt(updateData.vehicle_id) : undefined,
        mechanic_id: updateData.mechanic_id ? BigInt(updateData.mechanic_id) : undefined,
        workshop_id: updateData.workshop_id ? BigInt(updateData.workshop_id) : undefined,
        service_date: updateData.service_date ? new Date(updateData.service_date) : undefined,
        next_service_date: updateData.next_service_date ? new Date(updateData.next_service_date) : undefined,
        cost: updateData.cost ? parseFloat(updateData.cost) : undefined,
        mileage: updateData.mileage ? parseInt(updateData.mileage) : undefined,
        next_service_mileage: updateData.next_service_mileage ? parseInt(updateData.next_service_mileage) : undefined
      }
    })

    return NextResponse.json({
      message: 'Maintenance record updated successfully',
      maintenance: {
        ...maintenanceRecord,
        id: maintenanceRecord.id.toString(),
        vehicle_id: maintenanceRecord.vehicle_id.toString(),
        mechanic_id: maintenanceRecord.mechanic_id?.toString(),
        workshop_id: maintenanceRecord.workshop_id?.toString()
      }
    })
  } catch (error) {
    console.error('Error updating maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance record' },
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
        { error: 'Maintenance ID is required' },
        { status: 400 }
      )
    }

    await prisma.maintenance_history.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({
      message: 'Maintenance record deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to delete maintenance record' },
      { status: 500 }
    )
  }
}