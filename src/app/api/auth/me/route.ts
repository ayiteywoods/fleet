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
    let providerHasTracking = false
    let isSuperAdmin = false
    try {
      const roleLower = (user.role || '').toLowerCase()
      const isAdmin = roleLower === 'admin' || roleLower === 'super admin' || roleLower === 'superadmin' || roleLower === 'super_user' || roleLower === 'superuser'
      // Check specifically for super admin roles
      isSuperAdmin = roleLower === 'super admin' || roleLower === 'superadmin' || roleLower === 'super_user' || roleLower === 'superuser'
      console.log('Role lower:', roleLower, 'Is Admin:', isAdmin, 'Is Super Admin:', isSuperAdmin);
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
      // Check has_external_access column for live tracking access
      // Only check if user is NOT super admin (super admins don't need this check)
      if (!isSuperAdmin) {
        try {
          const dbUser = await prisma.users.findUnique({ 
            where: { id: BigInt(user.id) }, 
            select: { has_external_access: true, name: true } 
          })
          
          console.log('[auth/me] Database query result:', {
            userId: user.id,
            userName: dbUser?.name,
            has_external_access: dbUser?.has_external_access,
            has_external_access_type: typeof dbUser?.has_external_access,
            strict_true_check: dbUser?.has_external_access === true,
            strict_false_check: dbUser?.has_external_access === false,
            is_null: dbUser?.has_external_access === null,
            is_undefined: dbUser?.has_external_access === undefined
          })
          
          // Strict check: must be explicitly true (not null, not undefined, not truthy)
          providerHasTracking = dbUser?.has_external_access === true
          
          if (providerHasTracking) {
            console.log('✅ User has external access in has_external_access column')
          } else {
            console.log('❌ User does NOT have external access in has_external_access column', {
              value: dbUser?.has_external_access,
              type: typeof dbUser?.has_external_access
            })
          }
        } catch (e) {
          console.error('❌ Error checking has_external_access:', e)
          providerHasTracking = false // Default to false on error
        }
      } else {
        console.log('✅ User is super admin - granting Live Tracking access')
      }
    } catch (e) {
      console.warn('Failed to resolve company name for user:', e)
    }

    // Show Live Tracking ONLY if user has external access OR is super admin
    // IGNORE the token's hasLiveTracking value - always check fresh from has_external_access column
    // Super admins always have access, otherwise check has_external_access column
    // Explicitly set to false if user doesn't have access and isn't super admin
    let hasLiveTracking = false
    if (isSuperAdmin) {
      hasLiveTracking = true
      console.log('[auth/me] ✅ User is super admin - granting Live Tracking access')
    } else if (providerHasTracking === true) {
      hasLiveTracking = true
      console.log('[auth/me] ✅ User has external access in has_external_access column - granting Live Tracking access')
    } else {
      hasLiveTracking = false
      console.log('[auth/me] ❌ User does not have external access - denying Live Tracking access', {
        providerHasTracking,
        isSuperAdmin,
        role: user.role
      })
    }
    
    console.log('[auth/me] Final hasLiveTracking decision:', {
      hasLiveTracking,
      isSuperAdmin,
      providerHasTracking,
      role: user.role,
      userId: user.id
    })

    // Return user data WITHOUT the token's hasLiveTracking value - use our computed value
    const responseData = { 
      user: { 
        id: user.id,
        email: user.email || '',
        name: user.name,
        role: user.role,
        spcode: (user as any).spcode || null,
        companyName, 
        hasLiveTracking: hasLiveTracking  // Explicitly set to boolean (true or false) - IGNORE token value
      } 
    };
    console.log('Returning user data:', JSON.stringify(responseData, null, 2));
    console.log('hasLiveTracking final value:', responseData.user.hasLiveTracking, 'isSuperAdmin:', isSuperAdmin, 'providerHasTracking:', providerHasTracking);
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
