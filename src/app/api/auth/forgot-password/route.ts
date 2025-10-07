import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateResetToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json()
    const emailOrPhone = email || phone

    if (!emailOrPhone) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      )
    }

    // Check if input is email or phone
    const isEmail = emailOrPhone.includes('@')
    
    const user = await prisma.users.findFirst({
      where: isEmail 
        ? { email: emailOrPhone, is_active: true }
        : { phone: emailOrPhone, is_active: true }
    })

    // Always return success to prevent enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email/phone exists, we have sent a password reset link.'
      })
    }

    const resetToken = generateResetToken()
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour

    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_reset: resetToken,
        // Note: Your database might not have resetPasswordExpires field
        // You may need to add this field or use a different approach
      }
    })

    // In a real application, you would send an email/SMS here
    // For now, we'll just log the reset link
    console.log(`Password reset link for ${emailOrPhone}: /reset-password?token=${resetToken}`)

    return NextResponse.json({
      message: 'If an account with that email/phone exists, we have sent a password reset link.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
