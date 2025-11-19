import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken, hashPassword } from '@/lib/auth'
import { authHandlers } from '@/lib/apiWrapper'
import { prisma } from '@/lib/prisma'
import { checkExternalAccess } from '@/lib/externalAuth'
import { getUserPermissions } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Login attempt started...')
    const { identifier, email, phone, password } = await request.json()
    console.log('Request data:', { identifier, email, phone, password: password ? '***' : 'missing' })
    
    const emailOrPhone = identifier || email || phone

    if (!emailOrPhone || !password) {
      console.log('❌ Missing email/phone or password')
      return NextResponse.json(
        { error: 'Email/Phone and password are required' },
        { status: 400 }
      )
    }

    console.log('🔍 Attempting authentication...')
    let user: any = null
    
    try {
      user = await authenticateUser(emailOrPhone, password)
    } catch (error) {
      console.log('Database authentication failed, trying mock authentication...')
      // Fallback to mock authentication for development
      user = authHandlers.authenticateUser(emailOrPhone, password)
    }
    
    console.log('Authentication result:', user ? 'SUCCESS' : 'FAILED')

    // Compute external access and possible auto-provisioning
    let hasLiveTracking = false
    let resolvedUser = user

    if (!resolvedUser) {
      // Before attempting external provisioning, check if a local account exists
      try {
        const existingUser = await prisma.users.findFirst({
          where: {
            is_active: true,
            OR: [
              { email: emailOrPhone },
              { phone: emailOrPhone },
              { name: emailOrPhone },
              { full_name: emailOrPhone },
            ]
          },
          select: { id: true }
        })
        if (existingUser) {
          console.log('❌ Local user exists but password invalid; not attempting external provisioning')
          return NextResponse.json(
            { error: 'Invalid email/phone/username or password' },
            { status: 401 }
          )
        }
      } catch (e) {
        console.warn('Local existence check failed (continuing):', e)
      }
      // Try external app with the provided identifier as username
      console.log('Local auth failed, attempting external auth/provisioning...')
      const externalOk = await checkExternalAccess(emailOrPhone, password)
      if (externalOk) {
        hasLiveTracking = true
        // Auto-provision locally with minimal required fields
        try {
          const hashed = await hashPassword(password)
          const created = await prisma.users.create({
            data: {
              name: emailOrPhone, // required - external app uses 'name' field
              full_name: emailOrPhone, // also store in full_name for backwards compatibility
              password: hashed,
              is_active: true,
              role: 'user',
            }
          })
          resolvedUser = {
            id: created.id.toString(),
            email: created.email || '',
            name: created.name,
            role: created.role,
            spcode: created.spcode != null ? created.spcode.toString() : null
          }
        } catch (e) {
          console.error('Auto-provision failed:', e)
          return NextResponse.json(
            { error: 'Account provisioning failed' },
            { status: 500 }
          )
        }
      } else {
        console.log('❌ Authentication failed - invalid credentials (local and external)')
        return NextResponse.json(
          { error: 'Invalid email/phone or password' },
          { status: 401 }
        )
      }
    } else {
      // We have a local user; attempt external access check using name (external app uses name field)
      try {
        const dbUser = await prisma.users.findUnique({
          where: { id: BigInt(user.id) },
          select: { full_name: true, name: true, providers: true, has_external_access: true }
        })
        // External app uses 'name' field, prioritize it over full_name
        const username = dbUser?.name || dbUser?.full_name || user.name
        const currentHasExternalAccess = dbUser?.has_external_access === true
        console.log('🔍 Checking external access for user:', username)
        console.log('🔍 Current has_external_access before check:', currentHasExternalAccess)
        
        hasLiveTracking = await checkExternalAccess(username, password)
        console.log('🔍 External access result:', hasLiveTracking, '(type:', typeof hasLiveTracking, ')')
        
        // Persist the result, but only update if it's different from current value
        // If has_external_access is manually set to false, we respect that unless check explicitly returns true
        // If check returns false, always update to false
        try {
          let finalValue = hasLiveTracking
          // If current value is false and check returns true, keep it false (manual override)
          // This allows admins to manually deny access even if credentials work
          if (currentHasExternalAccess === false && hasLiveTracking === true) {
            console.log('⚠️ External check returned true, but has_external_access is manually set to false - preserving false value')
            finalValue = false
            hasLiveTracking = false // Also update the variable used for token generation
          }
          
          await prisma.users.update({ 
            where: { id: BigInt(user.id) }, 
            data: { has_external_access: finalValue } 
          })
          console.log(finalValue ? '✅ External access granted - persisted in has_external_access column' : '❌ External access denied - persisted in has_external_access column')
        } catch (e) {
          console.warn('Failed to persist external access result:', e)
        }
      } catch (e) {
        console.error('❌ External access check failed with error:', e)
        console.error('Error details:', e instanceof Error ? e.message : String(e))
        console.error('Error stack:', e instanceof Error ? e.stack : 'No stack trace')
        hasLiveTracking = false
        // Also clear external access flag on error
        try {
          await prisma.users.update({ 
            where: { id: BigInt(user.id) }, 
            data: { has_external_access: false } 
          })
          console.log('✅ Cleared has_external_access flag after error')
        } catch (updateError) {
          console.error('❌ Failed to clear has_external_access flag after error:', updateError)
        }
      }
    }

    // Check if user is super admin - super admins always have Live Tracking access
    const roleLower = (resolvedUser.role || '').toLowerCase()
    const isSuperAdmin = roleLower === 'super admin' || roleLower === 'superadmin' || roleLower === 'super_user' || roleLower === 'superuser'
    
    // Read has_external_access from database to ensure we have the latest value
    let dbHasExternalAccess = false
    try {
      const dbUser = await prisma.users.findUnique({
        where: { id: BigInt(resolvedUser.id) },
        select: { has_external_access: true }
      })
      dbHasExternalAccess = dbUser?.has_external_access === true
    } catch (e) {
      console.warn('Failed to read has_external_access from database:', e)
    }
    
    // Explicitly set to boolean - true only if super admin OR has external access
    const finalHasLiveTracking = isSuperAdmin || dbHasExternalAccess === true

    // Fetch user permissions based on role_id
    let permissions: string[] = []
    try {
      permissions = await getUserPermissions(resolvedUser.id)
      console.log('[login] ✅ Fetched user permissions:', permissions.length, 'permissions')
      if (permissions.length > 0) {
        console.log('[login] Sample permissions:', permissions.slice(0, 5).join(', '))
      } else {
        console.warn('[login] ⚠️ User has 0 permissions! Check if role has permissions assigned.')
      }
    } catch (error) {
      console.error('[login] ❌ Failed to fetch user permissions:', error)
      // Continue without permissions - user can still log in
    }

    console.log('🔍 Generating token...')
    console.log('hasLiveTracking:', hasLiveTracking, 'dbHasExternalAccess:', dbHasExternalAccess, 'isSuperAdmin:', isSuperAdmin, 'finalHasLiveTracking:', finalHasLiveTracking)
    const token = generateToken({
      id: resolvedUser.id,
      email: resolvedUser.email || '',
      name: resolvedUser.name,
      role: resolvedUser.role,
      spcode: (resolvedUser as any).spcode || null,
      hasLiveTracking: finalHasLiveTracking ? true : false  // Explicitly set to boolean
    })
    console.log('✅ Login successful!')

    return NextResponse.json({
      token,
      user: {
        id: resolvedUser.id,
        email: resolvedUser.email || '',
        name: resolvedUser.name,
        role: resolvedUser.role,
        spcode: (resolvedUser as any).spcode || null,
        hasLiveTracking: finalHasLiveTracking ? true : false,  // Explicitly set to boolean
        permissions  // Include permissions in response
      }
    })
  } catch (error) {
    console.error('❌ Login error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
