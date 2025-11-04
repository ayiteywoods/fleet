import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getUserCompany, shouldReturnEmpty, isAdmin } from '@/lib/companyFilter'

// GET - Fetch all repair records
export async function GET(request: NextRequest) {
  try {
    // Extract user from token for company-based filtering
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let user = null
    if (token) {
      user = verifyToken(token)
      if (user) {
        console.log('🔐 Authenticated request from:', user.name, 'Role:', user.role)
      }
    }

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicle_id')

    // Build the query with optional vehicle filter
    let whereClause: any = vehicleId ? { vehicle_id: BigInt(vehicleId) } : {}
    
    // Apply company scoping for non-admin users
    if (user) {
      // If user has no company assigned, return empty results
      if (shouldReturnEmpty(user)) {
        console.log('🔒 User has no company assigned - returning empty results')
        return NextResponse.json([])
      }
      
      // Get user's company info
      const companyInfo = await getUserCompany(user)
      
      if (companyInfo && !isAdmin(user)) {
        console.log('🔒 Applying company filter for repairs for user:', user.name, 'spcode:', companyInfo.spcode)
        
        if (companyInfo.companyName) {
          // Get vehicles for this company
          const companyVehicles = await prisma.vehicles.findMany({
            where: { company_name: companyInfo.companyName },
            select: { id: true }
          })
          
          if (companyVehicles.length > 0) {
            // If vehicleId is specified, ensure it's in the company's vehicles
            if (vehicleId) {
              const vehicleExists = companyVehicles.some(v => v.id.toString() === vehicleId)
              if (!vehicleExists) {
                whereClause.vehicle_id = { in: [] } // Return empty result
              }
            } else {
              whereClause.vehicle_id = {
                in: companyVehicles.map(v => v.id)
              }
            }
          } else {
            whereClause.vehicle_id = { in: [] }
          }
        }
      }
    }

    const repairRecords = await prisma.repair_history.findMany({
      where: whereClause, // Apply the filter here
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
      orderBy: { created_at: 'desc' }
    })

    // Serialize BigInt values
    const serializedRecords = repairRecords.map(record => ({
      ...record,
      id: record.id.toString(),
      vehicle_id: record.vehicle_id.toString(),
      cost: record.cost.toString(),
      created_by: record.created_by?.toString(),
      updated_by: record.updated_by?.toString(),
      created_at: record.created_at?.toISOString(),
      updated_at: record.updated_at?.toISOString(),
      service_date: record.service_date.toISOString()
    }))

    return NextResponse.json(serializedRecords)
  } catch (error) {
    console.error('Error fetching repair records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repair records' },
      { status: 500 }
    )
  }
}

// POST - Create new repair record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      service_date,
      cost,
      status,
      vehicle_id
    } = body

    // Validate required fields
    if (!service_date || !cost || !status) {
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

    const newRepair = await prisma.repair_history.create({
      data: {
        service_date: new Date(service_date),
        cost: parseFloat(cost),
        status,
        vehicle_id: finalVehicleId,
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
      ...newRepair,
      id: newRepair.id.toString(),
      vehicle_id: newRepair.vehicle_id.toString(),
      cost: newRepair.cost.toString(),
      created_by: newRepair.created_by?.toString(),
      updated_by: newRepair.updated_by?.toString(),
      created_at: newRepair.created_at?.toISOString(),
      updated_at: newRepair.updated_at?.toISOString(),
      service_date: newRepair.service_date.toISOString()
    }

    return NextResponse.json(serializedRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating repair record:', error)
    return NextResponse.json(
      { error: 'Failed to create repair record' },
      { status: 500 }
    )
  }
}

// PUT - Update repair record
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Repair record ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      service_date,
      cost,
      status,
      vehicle_id
    } = body

    const updatedRepair = await prisma.repair_history.update({
      where: { id: BigInt(id) },
      data: {
        service_date: service_date ? new Date(service_date) : undefined,
        cost: cost ? parseFloat(cost) : undefined,
        status,
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
    const serializedRecord = {
      ...updatedRepair,
      id: updatedRepair.id.toString(),
      vehicle_id: updatedRepair.vehicle_id.toString(),
      cost: updatedRepair.cost.toString(),
      created_by: updatedRepair.created_by?.toString(),
      updated_by: updatedRepair.updated_by?.toString(),
      created_at: updatedRepair.created_at?.toISOString(),
      updated_at: updatedRepair.updated_at?.toISOString(),
      service_date: updatedRepair.service_date.toISOString()
    }

    return NextResponse.json(serializedRecord)
  } catch (error) {
    console.error('Error updating repair record:', error)
    return NextResponse.json(
      { error: 'Failed to update repair record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete repair record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Repair record ID is required' },
        { status: 400 }
      )
    }

    await prisma.repair_history.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Repair record deleted successfully' })
  } catch (error) {
    console.error('Error deleting repair record:', error)
    return NextResponse.json(
      { error: 'Failed to delete repair record' },
      { status: 500 }
    )
  }
}
