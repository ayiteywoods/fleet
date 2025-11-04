import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkExternalAccess, checkExternalAccessDebug } from '@/lib/externalAuth'

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

    const { password } = await request.json()
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    // Get tracking username from DB
    const dbUser = await prisma.users.findUnique({
      where: { id: BigInt(user.id) },
      select: { full_name: true, name: true }
    })

    // External app uses 'name' field, prioritize it over full_name
    const username = dbUser?.name || dbUser?.full_name || user.name

    // Optional debug mode
    const url = new URL(request.url)
    const isDebug = url.searchParams.get('debug') === '1'
    if (isDebug) {
      const debug = await checkExternalAccessDebug(username, password)
      // On success, persist flag in has_external_access
      if (debug.ok) {
        try {
          await prisma.users.update({ 
            where: { id: BigInt(user.id) }, 
            data: { has_external_access: true } 
          })
        } catch {}
      }
      return NextResponse.json({ hasLiveTracking: !!debug.ok, debug })
    }

    const hasLiveTracking = await checkExternalAccess(username, password)
    // Always persist the result (whether true or false) in has_external_access column
    try {
      await prisma.users.update({ 
        where: { id: BigInt(user.id) }, 
        data: { has_external_access: hasLiveTracking } 
      })
    } catch {}
    
    return NextResponse.json({ hasLiveTracking: hasLiveTracking ? true : false })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


