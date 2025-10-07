import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false })
    }

    const user = await prisma.users.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    })

    return NextResponse.json({ valid: !!user })
  } catch (error) {
    console.error('Verify reset token error:', error)
    return NextResponse.json({ valid: false })
  }
}
