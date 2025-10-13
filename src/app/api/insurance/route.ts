import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all insurance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicle_id')

    // Build the query with optional vehicle filter
    const whereClause = vehicleId ? { vehicle_id: BigInt(vehicleId) } : {}

    const insuranceRecords = await prisma.insurance.findMany({
      where: whereClause, // Apply the filter here
      include: {
        vehicles: {
          select: {
            id: true,
            reg_number: true,
            trim: true,
            year: true,
            status: true,
            color: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // Serialize BigInt values and add vehicle name
    const serializedInsurance = insuranceRecords.map(record => ({
      id: record.id.toString(),
      policy_number: record.policy_number,
      insurance_company: record.insurance_company,
      start_date: record.start_date,
      end_date: record.end_date,
      premium_amount: record.premium_amount.toString(),
      coverage_type: record.coverage_type,
      notes: record.notes,
      vehicle_id: record.vehicle_id.toString(),
      created_at: record.created_at,
      updated_at: record.updated_at,
      created_by: record.created_by?.toString() || null,
      updated_by: record.updated_by?.toString() || null,
      vehicle_name: record.vehicles ? `${record.vehicles.reg_number} - ${record.vehicles.trim} (${record.vehicles.year})` : null,
      vehicle: record.vehicles ? {
        id: record.vehicles.id.toString(),
        reg_number: record.vehicles.reg_number,
        trim: record.vehicles.trim,
        year: record.vehicles.year,
        status: record.vehicles.status,
        color: record.vehicles.color
      } : null
    }))

    return NextResponse.json(serializedInsurance)
  } catch (error) {
    console.error('Error fetching insurance records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance records' },
      { status: 500 }
    )
  }
}

// POST - Create new insurance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      policy_number,
      insurance_company,
      start_date,
      end_date,
      premium_amount,
      coverage_type,
      notes,
      vehicle_id
    } = body

    if (!policy_number || !insurance_company || !start_date || !end_date || !premium_amount || !coverage_type || !vehicle_id) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    const newInsurance = await prisma.insurance.create({
      data: {
        policy_number,
        insurance_company,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        premium_amount: parseFloat(premium_amount),
        coverage_type,
        notes: notes || null,
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
    const serializedInsurance = {
      ...newInsurance,
      id: newInsurance.id.toString(),
      vehicle_id: newInsurance.vehicle_id.toString(),
      premium_amount: newInsurance.premium_amount.toString(),
      created_by: newInsurance.created_by?.toString(),
      updated_by: newInsurance.updated_by?.toString()
    }

    return NextResponse.json(serializedInsurance, { status: 201 })
  } catch (error) {
    console.error('Error creating insurance record:', error)
    return NextResponse.json(
      { error: 'Failed to create insurance record' },
      { status: 500 }
    )
  }
}

// PUT - Update insurance record
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Insurance ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      policy_number,
      insurance_company,
      start_date,
      end_date,
      premium_amount,
      coverage_type,
      notes,
      vehicle_id
    } = body

    const updatedInsurance = await prisma.insurance.update({
      where: { id: BigInt(id) },
      data: {
        policy_number: policy_number || undefined,
        insurance_company: insurance_company || undefined,
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,
        premium_amount: premium_amount ? parseFloat(premium_amount) : undefined,
        coverage_type: coverage_type || undefined,
        notes: notes !== undefined ? notes : undefined,
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
    const serializedInsurance = {
      ...updatedInsurance,
      id: updatedInsurance.id.toString(),
      vehicle_id: updatedInsurance.vehicle_id.toString(),
      premium_amount: updatedInsurance.premium_amount.toString(),
      created_by: updatedInsurance.created_by?.toString(),
      updated_by: updatedInsurance.updated_by?.toString()
    }

    return NextResponse.json(serializedInsurance)
  } catch (error) {
    console.error('Error updating insurance record:', error)
    return NextResponse.json(
      { error: 'Failed to update insurance record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete insurance record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Insurance ID is required' },
        { status: 400 }
      )
    }

    await prisma.insurance.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json(
      { message: 'Insurance record deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting insurance record:', error)
    return NextResponse.json(
      { error: 'Failed to delete insurance record' },
      { status: 500 }
    )
  }
}
