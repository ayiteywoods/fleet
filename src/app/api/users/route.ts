import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all users
export async function GET() {
  try {
    console.log('Users API called')
    const users = await prisma.users.findMany()
    console.log('Users found:', users.length)

    // Serialize BigInt values
    const serializedUsers = users.map(user => ({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      region: user.region,
      district: user.district,
      spcode: user.spcode,
      group: user.group,
      email_verified_at: user.email_verified_at,
      password: user.password,
      license_number: user.license_number,
      license_category: user.license_category,
      license_expiry: user.license_expiry,
      specialization: user.specialization,
      is_active: user.is_active,
      remember_token: user.remember_token,
      created_at: user.created_at,
      updated_at: user.updated_at,
      created_by: user.created_by,
      updated_by: user.updated_by,
      profile_image: user.profile_image,
      user_code: user.user_code,
      status: user.status,
      user_type: user.user_type
    }))

    return NextResponse.json(serializedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, role = 'user', is_active = true, password } = body

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Name and password are required' },
        { status: 400 }
      )
    }

    const newUser = await prisma.users.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        role: role || 'user',
        password,
        is_active: is_active !== false,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: '1', // Default user ID
        updated_by: '1'  // Default user ID
      }
    })

    // Serialize BigInt values
    const serializedUser = {
      ...newUser,
      id: newUser.id.toString()
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully!',
      user: serializedUser
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, email, phone, role, is_active } = body

    const updatedUser = await prisma.users.update({
      where: { id: BigInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(is_active !== undefined && { is_active }),
        updated_at: new Date(),
        updated_by: '1' // Default user ID
      }
    })

    // Serialize BigInt values
    const serializedUser = {
      ...updatedUser,
      id: updatedUser.id.toString()
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully!',
      user: serializedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await prisma.users.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully!'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
