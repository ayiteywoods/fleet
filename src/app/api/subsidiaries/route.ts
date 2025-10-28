import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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
    const clusterId = searchParams.get('cluster_id')

    let whereClause: any = {}
    
    // Note: Subsidiaries are shared organizational resources
    // For now, we show all subsidiaries to authenticated users
    // If needed, we can add company-based filtering here
    
    if (clusterId) {
      whereClause = { cluster_id: BigInt(clusterId) }
    }

    const subsidiaries = await prisma.subsidiary.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(serializeBigInt(subsidiaries))
  } catch (error) {
    console.error('Error fetching subsidiaries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subsidiaries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      contact_no, 
      address, 
      location, 
      contact_person, 
      contact_person_no, 
      cluster_id, 
      description, 
      notes 
    } = body

    // Validate required fields
    if (!name || !contact_no || !address || !contact_person || !contact_person_no) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    const subsidiary = await prisma.subsidiary.create({
      data: {
        name,
        contact_no,
        address,
        location: location || null,
        contact_person,
        contact_person_no,
        cluster_id: cluster_id ? BigInt(cluster_id) : null,
        description: description || null,
        notes: notes || null,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    return NextResponse.json(serializeBigInt(subsidiary), { status: 201 })
  } catch (error) {
    console.error('Error creating subsidiary:', error)
    return NextResponse.json(
      { error: 'Failed to create subsidiary' },
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
      contact_no, 
      address, 
      location, 
      contact_person, 
      contact_person_no, 
      cluster_id, 
      description, 
      notes 
    } = body

    // Validate required fields
    if (!name || !contact_no || !address || !contact_person || !contact_person_no) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    const subsidiary = await prisma.subsidiary.update({
      where: {
        id: BigInt(id)
      },
      data: {
        name,
        contact_no,
        address,
        location: location || null,
        contact_person,
        contact_person_no,
        cluster_id: cluster_id ? BigInt(cluster_id) : null,
        description: description || null,
        notes: notes || null,
        updated_at: new Date()
      }
    })

    return NextResponse.json(serializeBigInt(subsidiary), { status: 200 })
  } catch (error) {
    console.error('Error updating subsidiary:', error)
    return NextResponse.json(
      { error: 'Failed to update subsidiary' },
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

    await prisma.subsidiary.delete({
      where: {
        id: BigInt(id)
      }
    })

    return NextResponse.json({ message: 'Subsidiary deleted successfully' })
  } catch (error) {
    console.error('Error deleting subsidiary:', error)
    return NextResponse.json(
      { error: 'Failed to delete subsidiary' },
      { status: 500 }
    )
  }
}
