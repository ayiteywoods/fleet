import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to serialize BigInts
function serializeBigInt(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  )
}

// GET - Fetch all fuel expense logs
export async function GET() {
  try {
    const fuelExpenseLogs = await prisma.fuel_expense_log.findMany({
      include: {
        fuel_request: {
          include: {
            vehicles: {
              select: {
                reg_number: true,
                trim: true,
                year: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(serializeBigInt(fuelExpenseLogs))
  } catch (error) {
    console.error('Error fetching fuel expense logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fuel expense logs' },
      { status: 500 }
    )
  }
}

// POST - Create new fuel expense log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vendor, payment_method, fuel_request_id } = body

    if (!vendor || !payment_method || !fuel_request_id) {
      return NextResponse.json(
        { error: 'Missing required fields: vendor, payment_method, fuel_request_id' },
        { status: 400 }
      )
    }

    // Validate that the fuel request exists
    const fuelRequest = await prisma.fuel_request.findUnique({
      where: { id: BigInt(fuel_request_id) }
    })
    if (!fuelRequest) {
      return NextResponse.json(
        { error: 'Fuel request not found' },
        { status: 400 }
      )
    }

    const newFuelExpenseLog = await prisma.fuel_expense_log.create({
      data: {
        vendor: vendor,
        payment_method: payment_method,
        fuel_request_id: BigInt(fuel_request_id),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1, // Assuming a default user for now
        updated_by: 1 // Assuming a default user for now
      },
      include: {
        fuel_request: {
          include: {
            vehicles: {
              select: {
                reg_number: true,
                trim: true,
                year: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(serializeBigInt(newFuelExpenseLog), { status: 201 })
  } catch (error) {
    console.error('Error creating fuel expense log:', error)
    return NextResponse.json(
      { error: 'Failed to create fuel expense log' },
      { status: 500 }
    )
  }
}

// PUT - Update fuel expense log
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Fuel expense log ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { vendor, payment_method, fuel_request_id } = body

    // Validate that the fuel request exists (if provided)
    if (fuel_request_id) {
      const fuelRequest = await prisma.fuel_request.findUnique({
        where: { id: BigInt(fuel_request_id) }
      })
      if (!fuelRequest) {
        return NextResponse.json(
          { error: 'Fuel request not found' },
          { status: 400 }
        )
      }
    }

    const updatedFuelExpenseLog = await prisma.fuel_expense_log.update({
      where: { id: BigInt(id) },
      data: {
        vendor: vendor || undefined,
        payment_method: payment_method || undefined,
        fuel_request_id: fuel_request_id ? BigInt(fuel_request_id) : undefined,
        updated_at: new Date(),
        updated_by: 1 // Assuming a default user for now
      },
      include: {
        fuel_request: {
          include: {
            vehicles: {
              select: {
                reg_number: true,
                trim: true,
                year: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(serializeBigInt(updatedFuelExpenseLog))
  } catch (error) {
    console.error('Error updating fuel expense log:', error)
    return NextResponse.json(
      { error: 'Failed to update fuel expense log' },
      { status: 500 }
    )
  }
}

// DELETE - Delete fuel expense log
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Fuel expense log ID is required' },
        { status: 400 }
      )
    }

    await prisma.fuel_expense_log.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Fuel expense log deleted successfully' })
  } catch (error) {
    console.error('Error deleting fuel expense log:', error)
    return NextResponse.json(
      { error: 'Failed to delete fuel expense log' },
      { status: 500 }
    )
  }
}
