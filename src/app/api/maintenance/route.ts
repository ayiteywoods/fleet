import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all maintenance records
export async function GET(request: NextRequest) {
  try {
    console.log('Maintenance API called')
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicle_id')

    // Build the query with optional vehicle filter
    const whereClause = vehicleId ? { vehicle_id: BigInt(vehicleId) } : {}

    console.log('Querying maintenance records with whereClause:', whereClause)

    // First, let's get all maintenance records without relations to see what we have
    const maintenanceRecords = await prisma.maintenance_history.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' }
    })

    console.log(`Found ${maintenanceRecords.length} maintenance records without relations`)

    // Now let's manually fetch the related data for each record
    const enrichedRecords = await Promise.all(
      maintenanceRecords.map(async (record) => {
        let vehicle = null
        let mechanic = null
        let workshop = null

        try {
          if (record.vehicle_id) {
            vehicle = await prisma.vehicles.findUnique({
              where: { id: record.vehicle_id },
              select: {
                reg_number: true,
                trim: true,
                year: true,
                status: true
              }
            })
          }
        } catch (error) {
          console.log(`Error fetching vehicle for record ${record.id}:`, error.message)
        }

        try {
          if (record.mechanic_id) {
            mechanic = await prisma.mechanics.findUnique({
              where: { id: record.mechanic_id },
              select: {
                id: true,
                name: true,
                specialization: true
              }
            })
          }
        } catch (error) {
          console.log(`Error fetching mechanic for record ${record.id}:`, error.message)
        }

        try {
          if (record.workshop_id) {
            workshop = await prisma.workshops.findUnique({
              where: { id: record.workshop_id },
              select: {
                id: true,
                name: true,
                region: true,
                district: true
              }
            })
          }
        } catch (error) {
          console.log(`Error fetching workshop for record ${record.id}:`, error.message)
        }

        return {
          ...record,
          vehicles: vehicle,
          mechanics: mechanic,
          workshops: workshop
        }
      })
    )

    console.log(`Enriched ${enrichedRecords.length} maintenance records`)

    // Serialize BigInt values
    const serializedRecords = enrichedRecords.map(record => ({
      id: record.id.toString(),
      service_date: record.service_date.toISOString(),
      cost: record.cost.toString(),
      status: record.status,
      service_details: record.service_details,
      service_type: record.service_type,
      mileage_at_service: record.mileage_at_service.toString(),
      vehicle_id: record.vehicle_id.toString(),
      mechanic_id: record.mechanic_id.toString(),
      workshop_id: record.workshop_id.toString(),
      created_at: record.created_at?.toISOString(),
      updated_at: record.updated_at?.toISOString(),
      created_by: record.created_by?.toString(),
      updated_by: record.updated_by?.toString(),
      vehicle_name: record.vehicles ? `${record.vehicles.reg_number} - ${record.vehicles.trim} (${record.vehicles.year})` : null,
      mechanic_name: record.mechanics?.name || null,
      workshop_name: record.workshops ? `${record.workshops.name} - ${record.workshops.region}, ${record.workshops.district}` : null
    }))

    console.log('Returning serialized records:', serializedRecords.length)
    return NextResponse.json(serializedRecords)
  } catch (error) {
    console.error('Error fetching maintenance records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance records', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new maintenance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      service_date,
      cost,
      status,
      service_details,
      service_type,
      mileage_at_service,
      parts_replaced,
      vehicle_id,
      mechanic_id,
      workshop_id
    } = body

    // Validate required fields
    if (!service_date || !cost || !service_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Handle vehicle_id - make it optional and validate if provided
    let finalVehicleId: bigint
    if (vehicle_id && vehicle_id !== '') {
      try {
        const vehicleIdBigInt = BigInt(vehicle_id)
        // Check if vehicle exists
        const vehicle = await prisma.vehicles.findUnique({
          where: { id: vehicleIdBigInt }
        })
        if (!vehicle) {
          return NextResponse.json(
            { error: 'Vehicle not found' },
            { status: 400 }
          )
        }
        finalVehicleId = vehicleIdBigInt
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid vehicle ID format' },
          { status: 400 }
        )
      }
    } else {
      // Use the first available vehicle
      try {
        const firstVehicle = await prisma.vehicles.findFirst({
          orderBy: { id: 'asc' }
        })
        if (!firstVehicle) {
          return NextResponse.json(
            { error: 'No vehicles available. Please add a vehicle first.' },
            { status: 400 }
          )
        }
        finalVehicleId = firstVehicle.id
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to find available vehicle' },
          { status: 500 }
        )
      }
    }

    const newMaintenance = await prisma.maintenance_history.create({
      data: {
        service_date: new Date(service_date),
        cost: parseFloat(cost),
        status: status || 'completed',
        service_details,
        service_type,
        mileage_at_service: parseInt(mileage_at_service) || 0,
        parts_replaced,
        vehicle_id: finalVehicleId,
        mechanic_id: BigInt(mechanic_id || 1),
        workshop_id: BigInt(workshop_id || 1),
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
    const serializedRecord = {
      ...newMaintenance,
      id: newMaintenance.id.toString(),
      vehicle_id: newMaintenance.vehicle_id.toString(),
      mechanic_id: newMaintenance.mechanic_id.toString(),
      workshop_id: newMaintenance.workshop_id.toString(),
      cost: newMaintenance.cost.toString(),
      mileage_at_service: newMaintenance.mileage_at_service.toString(),
      created_by: newMaintenance.created_by?.toString(),
      updated_by: newMaintenance.updated_by?.toString(),
      created_at: newMaintenance.created_at?.toISOString(),
      updated_at: newMaintenance.updated_at?.toISOString(),
      service_date: newMaintenance.service_date.toISOString()
    }

    return NextResponse.json(serializedRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance record' },
      { status: 500 }
    )
  }
}

// PUT - Update maintenance record
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Maintenance record ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      service_date,
      cost,
      status,
      service_details,
      service_type,
      mileage_at_service,
      parts_replaced,
      vehicle_id,
      mechanic_id,
      workshop_id
    } = body

    const updatedMaintenance = await prisma.maintenance_history.update({
      where: { id: BigInt(id) },
      data: {
        service_date: service_date ? new Date(service_date) : undefined,
        cost: cost ? parseFloat(cost) : undefined,
        status,
        service_details,
        service_type,
        mileage_at_service: mileage_at_service ? parseInt(mileage_at_service) : undefined,
        parts_replaced,
        vehicle_id: vehicle_id ? BigInt(vehicle_id) : undefined,
        mechanic_id: mechanic_id ? BigInt(mechanic_id) : undefined,
        workshop_id: workshop_id ? BigInt(workshop_id) : undefined,
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
    const serializedRecord = {
      ...updatedMaintenance,
      id: updatedMaintenance.id.toString(),
      vehicle_id: updatedMaintenance.vehicle_id.toString(),
      mechanic_id: updatedMaintenance.mechanic_id.toString(),
      workshop_id: updatedMaintenance.workshop_id.toString(),
      cost: updatedMaintenance.cost.toString(),
      mileage_at_service: updatedMaintenance.mileage_at_service.toString(),
      created_by: updatedMaintenance.created_by?.toString(),
      updated_by: updatedMaintenance.updated_by?.toString(),
      created_at: updatedMaintenance.created_at?.toISOString(),
      updated_at: updatedMaintenance.updated_at?.toISOString(),
      service_date: updatedMaintenance.service_date.toISOString()
    }

    return NextResponse.json(serializedRecord)
  } catch (error) {
    console.error('Error updating maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete maintenance record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Maintenance record ID is required' },
        { status: 400 }
      )
    }

    await prisma.maintenance_history.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Maintenance record deleted successfully' })
  } catch (error) {
    console.error('Error deleting maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to delete maintenance record' },
      { status: 500 }
    )
  }
}
