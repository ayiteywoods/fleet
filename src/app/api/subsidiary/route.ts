import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const subsidiaries = await prisma.subsidiary.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })
    
    return NextResponse.json(subsidiaries.map(subsidiary => ({
      ...subsidiary,
      id: subsidiary.id.toString(),
      cluster_id: subsidiary.cluster_id?.toString()
    })))
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
    
    const subsidiary = await prisma.subsidiary.create({
      data: {
        name: name || null,
        contact_no: contact_no || null,
        address: address || null,
        location: location || null,
        contact_person: contact_person || null,
        contact_person_no: contact_person_no || null,
        cluster_id: cluster_id ? BigInt(cluster_id) : null,
        description: description || null,
        notes: notes || null,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    
    return NextResponse.json({
      ...subsidiary,
      id: subsidiary.id.toString(),
      cluster_id: subsidiary.cluster_id?.toString()
    }, { status: 201 })
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
    const body = await request.json()
    const { 
      id, 
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
    
    const subsidiary = await prisma.subsidiary.update({
      where: { id: BigInt(id) },
      data: {
        name: name || null,
        contact_no: contact_no || null,
        address: address || null,
        location: location || null,
        contact_person: contact_person || null,
        contact_person_no: contact_person_no || null,
        cluster_id: cluster_id ? BigInt(cluster_id) : null,
        description: description || null,
        notes: notes || null,
        updated_at: new Date()
      }
    })
    
    return NextResponse.json({
      ...subsidiary,
      id: subsidiary.id.toString(),
      cluster_id: subsidiary.cluster_id?.toString()
    })
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
        { error: 'Subsidiary ID is required' },
        { status: 400 }
      )
    }

    await prisma.subsidiary.delete({
      where: { id: BigInt(id) }
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
