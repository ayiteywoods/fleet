import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyToken } from '@/lib/auth'

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

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    console.log('Users API called')

    let whereClause: any = {}
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (token) {
      try {
        const requester = verifyToken(token)
        if (requester?.role && requester?.id) {
          const roleLower = requester.role.toLowerCase()
          const isCompanyAdmin = roleLower.includes('company') && roleLower.includes('admin')
          if (isCompanyAdmin) {
            whereClause.created_by = requester.id.toString()
          }
        }
      } catch (error) {
        console.warn('Failed to verify token for users GET:', error)
      }
    }

    const users = await prisma.users.findMany({
      where: whereClause
    })
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
      spcode: user.spcode?.toString() || null,
      group: user.group?.toString() || null,
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
    const { name, email, phone, role = 'user', is_active = true, password, spcode, group } = body

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let requester: any = null
    if (token) {
      try {
        requester = verifyToken(token)
      } catch (error) {
        console.warn('Failed to verify token for user creation:', error)
      }
    }

    const requesterRole = requester?.role?.toLowerCase() || ''
    const requesterIsCompanyAdmin = requesterRole.includes('company') && requesterRole.includes('admin')
    const requesterId = requester?.id ? requester.id.toString() : '1'
    let requesterGroup: number | null = null

    if (requester?.id) {
      try {
        const dbRequester = await prisma.users.findUnique({
          where: { id: BigInt(requester.id) },
          select: { group: true }
        })
        requesterGroup = dbRequester?.group ?? null
      } catch (error) {
        console.warn('Failed to fetch requester group:', error)
      }
    }

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Name and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists by email or phone
    if (email) {
      const existingByEmail = await prisma.users.findFirst({ where: { email } })
      if (existingByEmail) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }
    }

    if (phone) {
      const existingByPhone = await prisma.users.findFirst({ where: { phone } })
      if (existingByPhone) {
        return NextResponse.json(
          { error: 'User with this phone number already exists' },
          { status: 409 }
        )
      }
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(password)

    const newUser = await prisma.users.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        role: requesterIsCompanyAdmin ? 'company user' : role || 'user',
        password: hashedPassword,
        is_active: is_active !== false,
        ...(spcode !== undefined && spcode !== null ? { spcode: parseInt(spcode) } : {}),
        ...(requesterIsCompanyAdmin && requesterGroup !== null
          ? { group: requesterGroup }
          : group !== undefined && group !== null && group !== ''
            ? { group: parseInt(group) }
            : {}),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: requesterId,
        updated_by: requesterId
      }
    })

    // Serialize BigInt values
    const serializedUser = serializeBigInt(newUser)

    return NextResponse.json({
      success: true,
      message: 'User created successfully!',
      user: serializedUser
    })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    // Handle Prisma unique constraint errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A user with this information already exists' },
        { status: 409 }
      )
    }
    
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
    const { name, email, phone, role, is_active, spcode } = body

    const updatedUser = await prisma.users.update({
      where: { id: BigInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(is_active !== undefined && { is_active }),
        ...(spcode !== undefined && spcode !== null && spcode !== '' && { spcode: parseInt(spcode) }),
        updated_at: new Date(),
        updated_by: '1' // Default user ID
      }
    })

    // Serialize BigInt values
    const serializedUser = serializeBigInt(updatedUser)

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
