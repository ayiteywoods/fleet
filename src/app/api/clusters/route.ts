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
    const clusters = await prisma.clusters.findMany({
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(serializeBigInt(clusters))
  } catch (error) {
    console.error('Error fetching clusters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clusters' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, notes } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const cluster = await prisma.clusters.create({
      data: {
        name,
        description: description || null,
        notes: notes || null,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    return NextResponse.json(serializeBigInt(cluster), { status: 201 })
  } catch (error) {
    console.error('Error creating cluster:', error)
    return NextResponse.json(
      { error: 'Failed to create cluster' },
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
    const { name, description, notes } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const cluster = await prisma.clusters.update({
      where: {
        id: BigInt(id)
      },
      data: {
        name,
        description: description || null,
        notes: notes || null,
        updated_at: new Date()
      }
    })

    return NextResponse.json(serializeBigInt(cluster), { status: 200 })
  } catch (error) {
    console.error('Error updating cluster:', error)
    return NextResponse.json(
      { error: 'Failed to update cluster' },
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

    await prisma.clusters.delete({
      where: {
        id: BigInt(id)
      }
    })

    return NextResponse.json({ message: 'Cluster deleted successfully' })
  } catch (error) {
    console.error('Error deleting cluster:', error)
    return NextResponse.json(
      { error: 'Failed to delete cluster' },
      { status: 500 }
    )
  }
}