import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'bigint') {
    return obj.toString()
  }

  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt)
  }

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
    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get('roleId')

    if (!roleId) {
      return NextResponse.json(
        { error: 'roleId is required' },
        { status: 400 }
      )
    }

    const role = await prisma.roles.findUnique({
      where: { id: BigInt(roleId) },
      include: {
        role_has_permissions: true
      }
    })

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    const permissionIds = role.role_has_permissions.map((rp) =>
      rp.permission_id.toString()
    )

    return NextResponse.json(
      serializeBigInt({
        roleId: role.id,
        permissionIds
      })
    )
  } catch (error) {
    console.error('Error fetching role permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch role permissions' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { roleId, permissionIds } = body as {
      roleId?: string | number
      permissionIds?: (string | number)[]
    }

    if (!roleId) {
      return NextResponse.json(
        { error: 'roleId is required' },
        { status: 400 }
      )
    }

    const roleIdBigInt = BigInt(roleId)
    const permissionBigInts = (permissionIds ?? []).map((id) => BigInt(id))

    await prisma.$transaction(async (tx) => {
      await tx.role_has_permissions.deleteMany({
        where: { role_id: roleIdBigInt }
      })

      if (permissionBigInts.length) {
        await tx.role_has_permissions.createMany({
          data: permissionBigInts.map((permissionId) => ({
            role_id: roleIdBigInt,
            permission_id: permissionId
          }))
        })
      }
    })

    return NextResponse.json({
      message: 'Role permissions updated successfully',
      roleId: roleIdBigInt.toString(),
      permissionIds: permissionBigInts.map((id) => id.toString())
    })
  } catch (error) {
    console.error('Error updating role permissions:', error)
    return NextResponse.json(
      { error: 'Failed to update role permissions' },
      { status: 500 }
    )
  }
}


