import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all roadworthy records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicle_id')

    // Build the query with optional vehicle filter
    let whereClause = {}
    if (vehicleId) {
      // First get the vehicle registration number
      const vehicle = await prisma.vehicles.findUnique({
        where: { id: BigInt(vehicleId) },
        select: { reg_number: true }
      })
      if (vehicle) {
        whereClause = { vehicle_number: vehicle.reg_number }
      }
    }

    const roadworthyRecords = await prisma.roadworthy.findMany({
      where: whereClause, // Apply the filter here
      orderBy: { created_at: 'desc' }
    })

    // Serialize BigInt values
    const serializedRecords = roadworthyRecords.map(record => ({
      ...record,
      id: record.id.toString()
    }))

    return NextResponse.json(serializedRecords)
  } catch (error) {
    console.error('Error fetching roadworthy records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roadworthy records' },
      { status: 500 }
    )
  }
}

// POST - Create new roadworthy record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      company,
      vehicle_number,
      vehicle_type,
      date_issued,
      date_expired,
      roadworth_status,
      updated_by
    } = body

    // Validate required fields
    if (!company || !vehicle_number || !date_issued || !date_expired || !roadworth_status || !updated_by) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get vehicle registration number from vehicle ID
    let actualVehicleNumber = vehicle_number
    if (vehicle_number && !isNaN(Number(vehicle_number))) {
      // If vehicle_number is a numeric ID, fetch the actual registration number
      const vehicle = await prisma.vehicles.findUnique({
        where: { id: BigInt(vehicle_number) },
        select: { reg_number: true }
      })
      if (vehicle) {
        actualVehicleNumber = vehicle.reg_number
      }
    }

    const newRecord = await prisma.roadworthy.create({
      data: {
        id: BigInt(Date.now()), // Generate a unique ID using timestamp
        company,
        vehicle_number: actualVehicleNumber,
        vehicle_type,
        date_issued: new Date(date_issued),
        date_expired: new Date(date_expired),
        roadworth_status,
        updated_by: updated_by.toString(),
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    // Serialize BigInt values
    const serializedRecord = {
      ...newRecord,
      id: newRecord.id.toString()
    }

    return NextResponse.json(serializedRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating roadworthy record:', error)
    return NextResponse.json(
      { error: 'Failed to create roadworthy record' },
      { status: 500 }
    )
  }
}

// PUT - Update roadworthy record
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const vehicle_number = searchParams.get('vehicle_number')

    if (!id || !vehicle_number) {
      return NextResponse.json(
        { error: 'ID and vehicle_number are required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      company,
      vehicle_type,
      date_issued,
      date_expired,
      roadworth_status,
      updated_by
    } = body
    
    const bodyVehicleNumber = body.vehicle_number

    // Get vehicle registration number from vehicle ID
    let actualVehicleNumber = bodyVehicleNumber
    if (bodyVehicleNumber && !isNaN(Number(bodyVehicleNumber))) {
      // If vehicle_number is a numeric ID, fetch the actual registration number
      const vehicle = await prisma.vehicles.findUnique({
        where: { id: BigInt(bodyVehicleNumber) },
        select: { reg_number: true }
      })
      if (vehicle) {
        actualVehicleNumber = vehicle.reg_number
      }
    }

    // Also check if the existing vehicle_number in URL is an ID and convert it
    let existingVehicleNumber = vehicle_number
    if (vehicle_number && !isNaN(Number(vehicle_number))) {
      // If existing vehicle_number is a numeric ID, fetch the actual registration number
      const vehicle = await prisma.vehicles.findUnique({
        where: { id: BigInt(vehicle_number) },
        select: { reg_number: true }
      })
      if (vehicle) {
        existingVehicleNumber = vehicle.reg_number
      }
    }

    let updatedRecord

    // Check if vehicle_number is changing
    if (actualVehicleNumber !== existingVehicleNumber) {
      // If vehicle_number is changing, we need to delete and recreate due to composite primary key
      await prisma.roadworthy.delete({
        where: { 
          id_vehicle_number: {
            id: BigInt(id),
            vehicle_number: vehicle_number // Use original vehicle_number for delete
          }
        }
      })

      updatedRecord = await prisma.roadworthy.create({
        data: {
          id: BigInt(id), // Keep the same ID
          company,
          vehicle_number: actualVehicleNumber,
          vehicle_type,
          date_issued: date_issued ? new Date(date_issued) : undefined,
          date_expired: date_expired ? new Date(date_expired) : undefined,
          roadworth_status,
          updated_by: updated_by.toString(),
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    } else {
      // If vehicle_number is not changing, do a regular update
      updatedRecord = await prisma.roadworthy.update({
        where: { 
          id_vehicle_number: {
            id: BigInt(id),
            vehicle_number: vehicle_number // Use original vehicle_number for update
          }
        },
        data: {
          company,
          vehicle_type,
          date_issued: date_issued ? new Date(date_issued) : undefined,
          date_expired: date_expired ? new Date(date_expired) : undefined,
          roadworth_status,
          updated_by: updated_by.toString()
        }
      })
    }

    // Serialize BigInt values
    const serializedRecord = {
      ...updatedRecord,
      id: updatedRecord.id.toString()
    }

    return NextResponse.json(serializedRecord)
  } catch (error) {
    console.error('Error updating roadworthy record:', error)
    return NextResponse.json(
      { error: 'Failed to update roadworthy record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete roadworthy record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const vehicle_number = searchParams.get('vehicle_number')

    if (!id || !vehicle_number) {
      return NextResponse.json(
        { error: 'ID and vehicle_number are required' },
        { status: 400 }
      )
    }

    await prisma.roadworthy.delete({
      where: { 
        id_vehicle_number: {
          id: BigInt(id),
          vehicle_number: vehicle_number
        }
      }
    })

    return NextResponse.json({ message: 'Roadworthy record deleted successfully' })
  } catch (error) {
    console.error('Error deleting roadworthy record:', error)
    return NextResponse.json(
      { error: 'Failed to delete roadworthy record' },
      { status: 500 }
    )
  }
}
