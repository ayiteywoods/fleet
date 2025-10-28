import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('Token received, verifying...');
    const user = verifyToken(token)
    if (!user) {
      console.log('Token verification failed');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    console.log('Token verified successfully for user:', user.email);
    console.log('User data from token:', JSON.stringify(user, null, 2));

    let companyName: string | null = null
    try {
      const roleLower = (user.role || '').toLowerCase()
      const isAdmin = roleLower === 'admin' || roleLower === 'super admin' || roleLower === 'superadmin' || roleLower === 'super_user' || roleLower === 'superuser'
      console.log('Role lower:', roleLower, 'Is Admin:', isAdmin);
      console.log('User spcode:', (user as any).spcode);
      
      if (!isAdmin && (user as any).spcode) {
        const spcode = BigInt((user as any).spcode)
        // Prefer companies table first
        try {
          console.log('Looking up company with id:', spcode.toString());
          const company = await prisma.companies.findUnique({ where: { id: spcode }, select: { name: true } })
          companyName = company?.name || null
        } catch {}
        // Fallback to subsidiary if not found
        if (!companyName) {
          console.log('Looking up subsidiary with spcode:', spcode.toString());
          const subsidiary = await prisma.subsidiary.findUnique({ where: { id: spcode }, select: { name: true } })
          companyName = subsidiary?.name || null
        }
        console.log('Company name resolved:', companyName);
      } else {
        console.log('Skipping company lookup - admin or no spcode');
      }
    } catch (e) {
      console.warn('Failed to resolve company name for user:', e)
    }

    const responseData = { user: { ...user, companyName } };
    console.log('Returning user data:', JSON.stringify(responseData, null, 2));
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
