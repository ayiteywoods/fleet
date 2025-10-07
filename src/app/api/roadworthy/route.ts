import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all roadworthy records
export async function GET() {
  try {
    const roadworthyRecords = await prisma.roadworthy.findMany({
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

    const newRecord = await prisma.roadworthy.create({
      data: {
        id: BigInt(Date.now()), // Generate a unique ID using timestamp
        company,
        vehicle_number,
        vehicle_type,
        date_issued: new Date(date_issued),
        date_expired: new Date(date_expired),
        roadworth_status,
        updated_by,
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

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

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

    const updatedRecord = await prisma.roadworthy.update({
      where: { id: BigInt(id) },
      data: {
        company,
        vehicle_number,
        vehicle_type,
        date_issued: date_issued ? new Date(date_issued) : undefined,
        date_expired: date_expired ? new Date(date_expired) : undefined,
        roadworth_status,
        updated_by
      }
    })

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

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    await prisma.roadworthy.delete({
      where: { id: BigInt(id) }
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
