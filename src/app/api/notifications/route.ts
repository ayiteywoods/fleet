import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Resolve user and company scope
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let scopedVehicleUids: string[] | null = null
    if (token) {
      const user: any = verifyToken(token)
      if (user) {
        const roleLower = (user.role || '').toLowerCase()
        const isAdmin = roleLower === 'admin' || roleLower === 'super admin' || roleLower === 'superadmin' || roleLower === 'super_user' || roleLower === 'superuser'
        if (!isAdmin && user.spcode) {
          // Find company name by companies.id == spcode
          const company = await prisma.companies.findUnique({
            where: { id: BigInt(user.spcode) },
            select: { name: true }
          }).catch(() => null)
          const companyName = company?.name || null
          if (companyName) {
            // Get vehicle UIDs for this company
            const companyVehicles = await prisma.vehicles.findMany({
              where: { company_name: companyName },
              select: { uid: true }
            })
            scopedVehicleUids = companyVehicles.map(v => v.uid!).filter(Boolean) as string[]
          }
        }
      }
    }
    
    // Fetch recent alerts as notifications
    const alerts = await prisma.alerts_data.findMany({
      where: scopedVehicleUids && scopedVehicleUids.length > 0 ? { unit_uid: { in: scopedVehicleUids } } : {},
      take: 50,
      orderBy: { gps_time_utc: 'desc' },
      include: {
        // We'll map vehicles manually since there's no direct relation
      }
    })
    
    // Get unique vehicle UIDs from alerts
    const uniqueUnitUids = [...new Set(alerts.map(a => a.unit_uid))]
    
    // Fetch vehicle details for these UIDs
    const vehicles = await prisma.vehicles.findMany({
      where: { uid: { in: uniqueUnitUids } },
      select: {
        id: true,
        uid: true,
        reg_number: true,
        name: true
      }
    })
    
    // Create a map of UID to vehicle for quick lookup
    const vehicleMap = new Map(vehicles.map(v => [v.uid, v]))
    
    // Transform alerts into notifications format
    const notifications = alerts.map(alert => {
      const vehicle = vehicleMap.get(alert.unit_uid)
      
      // Calculate time ago
      const alertTime = new Date(alert.gps_time_utc)
      const now = new Date()
      const timeDiff = now.getTime() - alertTime.getTime()
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60))
      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      
      let timeAgo = ''
      if (hoursAgo < 1) {
        timeAgo = 'Just now'
      } else if (hoursAgo < 24) {
        timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
      } else if (daysAgo === 1) {
        timeAgo = '1 day ago'
      } else {
        timeAgo = `${daysAgo} days ago`
      }
      
      return {
        id: alert.id.toString(),
        title: `${alert.alert_type} Alert`,
        message: `${vehicle?.reg_number || 'Vehicle'} - ${alert.alert_description || alert.alert_type}`,
        time: timeAgo,
        timestamp: alert.gps_time_utc,
        read: false,
        type: alert.alert_type?.toLowerCase() || 'general',
        vehicle_id: vehicle?.id?.toString(),
        vehicle_reg: vehicle?.reg_number,
        address: alert.address
      }
    })
    
    // Add additional system notifications
    const systemNotifications = [
      {
        id: 'sys-1',
        title: 'System Update',
        message: 'Fleet management system has been updated',
        time: '1 day ago',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: false,
        type: 'system'
      },
      {
        id: 'sys-2',
        title: 'New Feature',
        message: 'Real-time tracking is now available for all vehicles',
        time: '2 days ago',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        read: false,
        type: 'system'
      }
    ]
    
    const allNotifications = [...systemNotifications, ...notifications]
    
    return NextResponse.json(allNotifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST - Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const { notificationIds } = await request.json()
    
    // In a real implementation, you would update notifications in the database
    // For now, we'll just return success
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}

