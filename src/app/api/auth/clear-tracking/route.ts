import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Utility endpoint to clear tracking:true flag from a user's providers field
 * Useful for fixing stale data when a user loses external access
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin (only admins can clear their own flag, or clear others' flags)
    const roleLower = (user.role || '').toLowerCase()
    const isAdmin = roleLower === 'admin' || roleLower === 'super admin' || roleLower === 'superadmin' || roleLower === 'super_user' || roleLower === 'superuser'
    
    const { userId } = await request.json().catch(() => ({}))
    const targetUserId = userId ? BigInt(userId) : BigInt(user.id)
    
    // Only allow clearing own flag, or if admin clearing others' flags
    if (!isAdmin && targetUserId.toString() !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Clear tracking:true from providers field
    try {
      const dbUser = await prisma.users.findUnique({ 
        where: { id: targetUserId }, 
        select: { providers: true, name: true } 
      })
      
      if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const providers = (dbUser.providers || '').toString()
      const updated = providers.replace(/tracking:true/g, '').replace(/;;/g, ';').replace(/^;|;$/g, '')

      await prisma.users.update({ 
        where: { id: targetUserId }, 
        data: { providers: updated } 
      })

      console.log(`✅ Cleared tracking:true from user ${dbUser.name} (ID: ${targetUserId})`)
      console.log(`   Old providers: "${providers}"`)
      console.log(`   New providers: "${updated}"`)

      return NextResponse.json({ 
        success: true, 
        message: 'Tracking flag cleared',
        oldProviders: providers,
        newProviders: updated
      })
    } catch (e) {
      console.error('Error clearing tracking flag:', e)
      return NextResponse.json({ error: 'Failed to clear tracking flag' }, { status: 500 })
    }
  } catch (e) {
    console.error('Clear tracking error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

