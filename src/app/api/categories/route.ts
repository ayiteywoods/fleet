import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all categories
export async function GET() {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })
    
    // Convert BigInt to string for JSON serialization
    const serializedCategories = categories.map(category => ({
      ...category,
      id: category.id.toString()
    }))
    
    return NextResponse.json(serializedCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const category = await prisma.categories.create({
      data: {
        name,
        description: description || null
      }
    })

    // Convert BigInt to string for JSON serialization
    const serializedCategory = {
      ...category,
      id: category.id.toString()
    }

    return NextResponse.json(serializedCategory, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

// PUT update category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description } = body

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Category ID and name are required' },
        { status: 400 }
      )
    }

    const category = await prisma.categories.update({
      where: { id: BigInt(id) },
      data: {
        name,
        description: description || null
      }
    })

    // Convert BigInt to string for JSON serialization
    const serializedCategory = {
      ...category,
      id: category.id.toString()
    }

    return NextResponse.json(serializedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    await prisma.categories.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
