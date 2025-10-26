import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseFallback, insuranceHandlers } from '@/lib/apiWrapper'

// GET - Fetch all insurance records
export const GET = withDatabaseFallback(async (request: NextRequest) => {
  try {
    // Try to use the mock handler first
    return await insuranceHandlers.getInsurance(request)
  } catch (error: any) {
    console.error('Error in insurance handler:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance records' },
      { status: 500 }
    )
  }
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      policy_number,
      insurance_company,
      policy_type,
      start_date,
      end_date,
      premium_amount,
      coverage_amount,
      status,
      vehicle_id,
      notes
    } = body

    const insuranceRecord = await prisma.insurance.create({
      data: {
        policy_number,
        insurance_company,
        policy_type,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        premium_amount: parseFloat(premium_amount),
        coverage_amount: parseFloat(coverage_amount),
        status,
        vehicle_id: BigInt(vehicle_id),
        notes
      }
    })

    return NextResponse.json({
      message: 'Insurance record created successfully',
      insurance: {
        ...insuranceRecord,
        id: insuranceRecord.id.toString(),
        vehicle_id: insuranceRecord.vehicle_id.toString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating insurance record:', error)
    return NextResponse.json(
      { error: 'Failed to create insurance record' },
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
        { error: 'Insurance ID is required' },
        { status: 400 }
      )
    }

    const insuranceRecord = await prisma.insurance.update({
      where: { id: BigInt(id) },
      data: {
        ...updateData,
        vehicle_id: updateData.vehicle_id ? BigInt(updateData.vehicle_id) : undefined,
        start_date: updateData.start_date ? new Date(updateData.start_date) : undefined,
        end_date: updateData.end_date ? new Date(updateData.end_date) : undefined,
        premium_amount: updateData.premium_amount ? parseFloat(updateData.premium_amount) : undefined,
        coverage_amount: updateData.coverage_amount ? parseFloat(updateData.coverage_amount) : undefined
      }
    })

    return NextResponse.json({
      message: 'Insurance record updated successfully',
      insurance: {
        ...insuranceRecord,
        id: insuranceRecord.id.toString(),
        vehicle_id: insuranceRecord.vehicle_id.toString()
      }
    })
  } catch (error) {
    console.error('Error updating insurance record:', error)
    return NextResponse.json(
      { error: 'Failed to update insurance record' },
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
        { error: 'Insurance ID is required' },
        { status: 400 }
      )
    }

    await prisma.insurance.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({
      message: 'Insurance record deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting insurance record:', error)
    return NextResponse.json(
      { error: 'Failed to delete insurance record' },
      { status: 500 }
    )
  }
}