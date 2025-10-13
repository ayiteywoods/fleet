import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'bigint') return obj.toString()
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) return obj.map(serializeBigInt)
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value)
    }
    return serialized
  }
  return obj
}

export async function GET(request: NextRequest) {
  try {
    const companies = await prisma.companies.findMany({
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(serializeBigInt(companies))
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      location, 
      loc_code, 
      phone, 
      description, 
      group_id, 
      email, 
      address, 
      contact_person, 
      contact_phone, 
      status 
    } = body

    // Validate required fields
    if (!name || !location || !phone || !email || !address || !contact_person || !contact_phone || !status) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    const company = await prisma.companies.create({
      data: {
        name,
        location,
        loc_code: loc_code || null,
        phone,
        description: description || null,
        group_id: group_id ? parseInt(group_id) : null,
        email,
        address,
        contact_person,
        contact_phone,
        status,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    return NextResponse.json(serializeBigInt(company), { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}

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
      name, 
      location, 
      loc_code, 
      phone, 
      description, 
      group_id, 
      email, 
      address, 
      contact_person, 
      contact_phone, 
      status 
    } = body

    // Validate required fields
    if (!name || !location || !phone || !email || !address || !contact_person || !contact_phone || !status) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    const company = await prisma.companies.update({
      where: {
        id: BigInt(id)
      },
      data: {
        name,
        location,
        loc_code: loc_code || null,
        phone,
        description: description || null,
        group_id: group_id ? parseInt(group_id) : null,
        email,
        address,
        contact_person,
        contact_phone,
        status,
        updated_at: new Date()
      }
    })

    return NextResponse.json(serializeBigInt(company), { status: 200 })
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
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
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    await prisma.companies.delete({
      where: {
        id: BigInt(id)
      }
    })

    return NextResponse.json({ message: 'Company deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    )
  }
}
