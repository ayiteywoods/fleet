import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Login attempt started...')
    const { email, phone, password } = await request.json()
    console.log('Request data:', { email, phone, password: password ? '***' : 'missing' })
    
    const emailOrPhone = email || phone

    if (!emailOrPhone || !password) {
      console.log('❌ Missing email/phone or password')
      return NextResponse.json(
        { error: 'Email/Phone and password are required' },
        { status: 400 }
      )
    }

    console.log('🔍 Attempting authentication...')
    const user = await authenticateUser(emailOrPhone, password)
    console.log('Authentication result:', user ? 'SUCCESS' : 'FAILED')

    if (!user) {
      console.log('❌ Authentication failed - invalid credentials')
      return NextResponse.json(
        { error: 'Invalid email/phone or password' },
        { status: 401 }
      )
    }

    console.log('🔍 Generating token...')
    const token = generateToken(user)
    console.log('✅ Login successful!')

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('❌ Login error:', error)
    console.error('Error details:', error.message)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
