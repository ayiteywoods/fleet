import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import { createDatabaseErrorResponse } from './dbErrorHandler'
import { verifyToken } from './auth'

// Mock data generators for fallback
const mockVehicles = [
  {
    id: "1",
    reg_number: "GC 1056-19",
    trim: "Toyota Hilux",
    year: 2023,
    status: "Active",
    color: "White",
    name: "GC 1056-19 - Toyota Hilux (2023)",
    subsidiary: { id: "1", name: "Main Fleet" },
    driver_operators: []
  },
  {
    id: "2", 
    reg_number: "GE 7176-25",
    trim: "Ford Ranger",
    year: 2022,
    status: "Active",
    color: "Blue",
    name: "GE 7176-25 - Ford Ranger (2022)",
    subsidiary: { id: "1", name: "Main Fleet" },
    driver_operators: []
  }
]

const mockDrivers = [
  {
    id: "1",
    name: "John Doe",
    phone: "0554040387",
    email: "john@example.com",
    license_number: "DL123456",
    status: "Active",
    spcode: "1",
    subsidiary_name: "Main Fleet",
    vehicles: []
  }
]

const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    phone: "0554040387",
    role: "admin",
    is_active: true,
    spcode: "1"
  }
]

const mockFleetPositions = [
  {
    id: "1",
    unit_name: "GC 1056-19",
    address: "Accra, Ghana",
    latitude: 5.6037,
    longitude: -0.1870,
    speed: 45,
    gps_time_utc: new Date().toISOString()
  },
  {
    id: "2", 
    unit_name: "GE 7176-25",
    address: "Kumasi, Ghana",
    latitude: 6.6885,
    longitude: -1.6244,
    speed: 32,
    gps_time_utc: new Date().toISOString()
  }
]

const mockRecentTrips = [
  {
    id: "1",
    vehicle: {
      reg_number: "GC 1056-19",
      name: "GC 1056-19 - Toyota Hilux"
    },
    trip: {
      status: "Active",
      time: "10:27 AM",
      timeAgo: "2h ago"
    },
    address: "Accra Central, Ghana",
    gps_time_utc: new Date().toISOString()
  },
  {
    id: "2",
    vehicle: {
      reg_number: "GE 7176-25", 
      name: "GE 7176-25 - Ford Ranger"
    },
    trip: {
      status: "Active",
      time: "09:27 AM",
      timeAgo: "3h ago"
    },
    address: "Kumasi Central, Ghana",
    gps_time_utc: new Date(Date.now() - 3600000).toISOString()
  }
]

const mockRecentAlerts = [
  {
    id: "1",
    vehicle: {
      reg_number: "GC 1056-19",
      name: "GC 1056-19 - Toyota Hilux"
    },
    alert: {
      unit_name: "GC 1056-19",
      alert_type: "Speed Alert",
      alert_description: "Vehicle exceeded speed limit",
      last_reported_time_utc: new Date().toISOString(),
      address: "Accra, Ghana",
      latitude: 5.6037,
      longitude: -0.1870
    }
  },
  {
    id: "2",
    vehicle: {
      reg_number: "GE 7176-25",
      name: "GE 7176-25 - Ford Ranger"
    },
    alert: {
      unit_name: "GE 7176-25",
      alert_type: "Geofence Alert", 
      alert_description: "Vehicle left designated area",
      last_reported_time_utc: new Date(Date.now() - 1800000).toISOString(),
      address: "Kumasi, Ghana",
      latitude: 6.6885,
      longitude: -1.6244
    }
  }
]

const mockInsurance = [
  {
    id: "1",
    policy_number: "POL-001",
    insurance_company: "Ghana Insurance Co.",
    policy_type: "Comprehensive",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    premium_amount: 2500.00,
    coverage_amount: 50000.00,
    status: "Active",
    vehicle_id: "1",
    vehicles: {
      reg_number: "GC 1056-19",
      trim: "Toyota Hilux",
      year: 2023,
      status: "Active",
      color: "White"
    }
  }
]

const mockMaintenance = [
  {
    id: "1",
    service_date: new Date().toISOString(),
    service_type: "Regular Service",
    cost: 500.00,
    mileage: 15000,
    description: "Oil change and filter replacement",
    next_service_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    next_service_mileage: 20000,
    vehicle_id: "1",
    mechanic_id: "1",
    workshop_id: "1",
    vehicles: {
      reg_number: "GC 1056-19",
      trim: "Toyota Hilux",
      year: 2023,
      status: "Active",
      color: "White"
    },
    mechanics: {
      name: "John Mechanic",
      phone: "0551234567"
    },
    workshops: {
      name: "Accra Auto Service",
      region: "Greater Accra",
      district: "Accra"
    }
  }
]

const mockFuelLogs = [
  {
    id: "1",
    refuel_date: new Date().toISOString(),
    quantity: 50.0,
    cost: 300.00,
    fuel_type: "Petrol",
    station_name: "Shell Accra",
    odometer_reading: 15000,
    vehicle_id: "1",
    vehicles: {
      reg_number: "GC 1056-19",
      trim: "Toyota Hilux",
      year: 2023,
      status: "Active"
    }
  }
]

const mockMaintenanceSchedule = [
  {
    id: "1",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    service_type: "Oil Change",
    description: "Regular oil change service",
    priority: "Medium",
    status: "Pending",
    vehicle_id: "1",
    vehicles: {
      reg_number: "GC 1056-19",
      trim: "Toyota Hilux",
      year: 2023,
      status: "Active"
    }
  }
]

// Generic API wrapper that handles database errors
export function withDatabaseFallback<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Skip database connection test - go straight to handler
      // The handler will catch database errors and we'll return structured errors
      return await handler(request)
    } catch (error: any) {
      console.error('Database error in API wrapper:', error)
      
      // Return structured error response
      return createDatabaseErrorResponse(error)
    }
  }
}

// Authentication-aware wrapper that handles both database errors and auth
export function withAuthAndDatabaseFallback<T>(
  handler: (request: NextRequest, user: any) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get user from token
      const token = request.headers.get('authorization')?.replace('Bearer ', '')
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const user = verifyToken(token)
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      // Skip database connection test - go straight to handler
      // The handler will catch database errors and we'll return structured errors
      return await handler(request, user)
    } catch (error: any) {
      console.error('Error in auth wrapper:', error)
      
      // If it's an auth error, return auth error
      if (error.message?.includes('Authentication required') || error.message?.includes('Invalid token')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        )
      }
      
      // Otherwise return database error response
      return createDatabaseErrorResponse(error)
    }
  }
}

// Specific handlers for different endpoints
export const vehicleHandlers = {
  async getVehicles(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const simple = searchParams.get('simple')
    
    // Extract filter parameters
    const company = searchParams.get('company')
    const subsidiary = searchParams.get('subsidiary')
    const year = searchParams.get('year')
    const status = searchParams.get('status')
    const registration = searchParams.get('registration')
    
    // Build where clause for filters
    let whereClause: any = {}
    
    if (company) {
      // The company parameter is now the company name directly from the vehicles
      // We'll try to match it exactly first, then try partial match
      whereClause.company_name = {
        contains: company,
        mode: 'insensitive'
      }
    }
    
    if (subsidiary) {
      whereClause.subsidiary_name = subsidiary
    }
    
    if (year) {
      whereClause.year = parseInt(year)
    }
    
    if (status) {
      whereClause.status = status
    }
    
    if (registration) {
      whereClause.reg_number = {
        contains: registration,
        mode: 'insensitive'
      }
    }
    
    if (simple === 'true') {
      const vehicles = await prisma.vehicles.findMany({
        where: whereClause,
        select: {
          id: true,
          reg_number: true,
          trim: true,
          year: true,
          status: true,
          color: true,
          name: true
        }
      })
      
      const simpleVehicles = vehicles.map(v => ({
        id: v.id.toString(),
        reg_number: v.reg_number,
        trim: v.trim,
        year: v.year,
        status: v.status,
        color: v.color,
        name: v.name
      }))
      return NextResponse.json(simpleVehicles)
    }
    
    const vehicles = await prisma.vehicles.findMany({
      where: whereClause,
      include: {
        vehicle_types: true,
        vehicle_makes: true,
        subsidiary: true
      }
    })
    
    const formattedVehicles = vehicles.map(v => ({
      id: v.id.toString(),
      reg_number: v.reg_number,
      vin_number: v.vin_number,
      trim: v.trim,
      year: v.year,
      status: v.status,
      color: v.color,
      engine_number: v.engine_number,
      chassis_number: v.chassis_number,
      current_region: v.current_region,
      current_district: v.current_district,
      current_mileage: v.current_mileage,
      last_service_date: v.last_service_date,
      next_service_km: v.next_service_km,
      notes: v.notes,
      company_name: v.company_name,
      subsidiary_name: v.subsidiary?.name,
      uid: v.uid,
      type_id: v.type_id?.toString(),
      make_id: v.make_id?.toString(),
      spcode: v.spcode?.toString(),
      vehicle_type: v.vehicle_types?.name,
      vehicle_type_name: v.vehicle_types?.name,
      vehicle_make: v.vehicle_makes?.name,
      vehicle_make_name: v.vehicle_makes?.name,
      company: v.subsidiary?.name
    }))
    
    return NextResponse.json(formattedVehicles)
  }
}

export const driverHandlers = {
  async getDrivers(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const companyFilter = searchParams.get('company')
    const nameFilter = searchParams.get('name')
    const licenseNumberFilter = searchParams.get('license_number')
    const statusFilter = searchParams.get('status')
    
    // Build where clause with optional filters
    let whereClause: any = {}
    
    if (nameFilter) {
      whereClause.name = {
        contains: nameFilter,
        mode: 'insensitive'
      }
    }
    
    if (licenseNumberFilter) {
      whereClause.license_number = {
        contains: licenseNumberFilter,
        mode: 'insensitive'
      }
    }
    
    if (statusFilter) {
      whereClause.status = {
        contains: statusFilter,
        mode: 'insensitive'
      }
    }
    
    // For company filter, we need to get vehicles from that company first
    let companyVehicleIds: BigInt[] | undefined = undefined
    if (companyFilter) {
      const companyVehicles = await prisma.vehicles.findMany({
        where: {
          company_name: {
            contains: companyFilter,
            mode: 'insensitive'
          }
        },
        select: { id: true }
      })
      companyVehicleIds = companyVehicles.map(v => v.id)
      
      whereClause.vehicle_id = {
        in: companyVehicleIds
      }
    }
    
    const drivers = await prisma.driver_operators.findMany({
      where: whereClause,
      include: {
        vehicles: {
          select: {
            reg_number: true,
            name: true,
            company_name: true
          }
        }
      }
    })
    
    // Filter by company if specified (in case of partial company match)
    let filteredDrivers = drivers
    if (companyFilter && !companyVehicleIds) {
      filteredDrivers = drivers.filter(driver => {
        const companyName = driver.vehicles?.company_name?.toLowerCase() || ''
        return companyName.includes(companyFilter.toLowerCase())
      })
    }
    
    const formattedDrivers = filteredDrivers.map(d => ({
      id: d.id.toString(),
      name: d.name,
      phone: d.phone,
      email: d.email || '',
      license_number: d.license_number,
      license_category: d.license_category,
      license_expire: d.license_expire,
      status: d.status,
      spcode: d.spcode?.toString(),
      vehicle_reg: d.vehicles?.reg_number,
      vehicle_name: d.vehicles?.name,
      company_name: d.vehicles?.company_name,
      created_by: d.created_by,
      updated_by: d.updated_by
    }))
    
    return NextResponse.json(formattedDrivers)
  }
}

export const userHandlers = {
  async getUsers(request: NextRequest): Promise<NextResponse> {
    const users = await prisma.users.findMany({
      include: {
        companies: true
      }
    })
    
    const formattedUsers = users.map(u => ({
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      spcode: u.spcode?.toString(),
      company: u.companies?.name
    }))
    
    return NextResponse.json(formattedUsers)
  }
}

export const fleetPositionHandlers = {
  async getFleetPositions(request: NextRequest, user: any): Promise<NextResponse> {
    // Get user's company filter
    let whereClause: any = {}
    
    if (user.role === 'company') {
      whereClause.unit_uid = {
        in: await prisma.vehicles.findMany({
          where: { spcode: BigInt(user.spcode) },
          select: { uid: true }
        }).then(vehicles => vehicles.map(v => v.uid))
      }
    } else if (user.role === 'subsidiary') {
      // Get vehicles from companies under this subsidiary
      const subsidiaryCompanies = await prisma.companies.findMany({
        where: { parent_company_id: BigInt(user.spcode) },
        select: { id: true }
      })
      
      whereClause.unit_uid = {
        in: await prisma.vehicles.findMany({
          where: { 
            spcode: {
              in: subsidiaryCompanies.map(c => c.id)
            }
          },
          select: { uid: true }
        }).then(vehicles => vehicles.map(v => v.uid))
      }
    }
    
    const alerts = await prisma.alerts_data.findMany({
      where: whereClause,
      orderBy: { gps_time_utc: 'desc' },
      take: 50 // Limit to recent alerts
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
        name: true,
        status: true,
        company_name: true
      }
    })
    
    // Create a map of UID to vehicle for quick lookup
    const vehicleMap = new Map(vehicles.map(v => [v.uid, v]))
    
    // Group alerts by vehicle UID and keep only the latest alert per vehicle
    const latestAlertsByVehicle = new Map()
    
    alerts.forEach(a => {
      const existing = latestAlertsByVehicle.get(a.unit_uid)
      if (!existing || new Date(a.gps_time_utc) > new Date(existing.gps_time_utc)) {
        latestAlertsByVehicle.set(a.unit_uid, a)
      }
    })
    
    // Format alerts with vehicle data
    const formattedPositions = Array.from(latestAlertsByVehicle.values()).map(a => {
      const vehicle = vehicleMap.get(a.unit_uid)
      return {
        vehicle: {
          id: vehicle?.id?.toString() || '',
          reg_number: vehicle?.reg_number || '',
          name: vehicle?.name || '',
          status: vehicle?.status || '',
          company_name: vehicle?.company_name || ''
        },
        position: {
          id: a.id.toString(),
          latitude: a.latitude != null ? Number(a.latitude).toString() : null,
          longitude: a.longitude != null ? Number(a.longitude).toString() : null,
          address: a.address || '',
          speed: a.speed?.toString() || '0',
          odometer: a.odometer?.toString() || '0',
          engine_status: a.engine_status || '',
          gps_time_utc: a.gps_time_utc?.toISOString() || null
        }
      }
    })
    
    return NextResponse.json(formattedPositions)
  }
}

export const recentTripsHandlers = {
  async getRecentTrips(request: NextRequest, user: any): Promise<NextResponse> {
    // Get user's company filter
    let whereClause: any = {}
    
    if (user.role === 'company') {
      whereClause.unit_uid = {
        in: await prisma.vehicles.findMany({
          where: { spcode: BigInt(user.spcode) },
          select: { uid: true }
        }).then(vehicles => vehicles.map(v => v.uid))
      }
    } else if (user.role === 'subsidiary') {
      // Get vehicles from companies under this subsidiary
      const subsidiaryCompanies = await prisma.companies.findMany({
        where: { parent_company_id: BigInt(user.spcode) },
        select: { id: true }
      })
      
      whereClause.unit_uid = {
        in: await prisma.vehicles.findMany({
          where: { 
            spcode: {
              in: subsidiaryCompanies.map(c => c.id)
            }
          },
          select: { uid: true }
        }).then(vehicles => vehicles.map(v => v.uid))
      }
    }
    
    const trips = await prisma.positions_data.findMany({
      where: whereClause,
      orderBy: { gps_time_utc: 'desc' },
      take: 10
    })
    
    // Get vehicle information for each trip
    const formattedTrips = await Promise.all(trips.map(async (trip) => {
      const vehicle = await prisma.vehicles.findFirst({
        where: { uid: trip.unit_uid },
        select: {
          reg_number: true,
          name: true
        }
      })
      
      const gpsTime = new Date(trip.gps_time_utc)
      const now = new Date()
      const timeDiff = now.getTime() - gpsTime.getTime()
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60))
      
      // Determine trip status from engine_status
      let tripStatus = 'Stop' // Default to completed/stopped
      if (trip.engine_status) {
        const engineStatusLower = trip.engine_status.toLowerCase()
        if (engineStatusLower.includes('on') || engineStatusLower.includes('running')) {
          tripStatus = 'Start' // Active trip
        } else if (engineStatusLower.includes('off') || engineStatusLower.includes('stopped')) {
          tripStatus = 'Stop' // Completed trip
        }
      }

      return {
        id: trip.id.toString(),
        vehicle: {
          id: '0',
          reg_number: vehicle?.reg_number || trip.unit_name || trip.unit_uid,
          name: vehicle?.name || trip.unit_name || trip.unit_uid,
          status: tripStatus === 'Start' ? 'Active' : 'Inactive',
          company_name: ''
        },
        position: {
          id: trip.id.toString(),
          address: trip.address || '',
          speed: trip.speed?.toString() || '0',
          odometer: trip.odometer?.toString() || '0',
          engine_status: trip.engine_status || '',
          gps_time_utc: trip.gps_time_utc?.toISOString() || ''
        },
        trip: {
          status: tripStatus,
          time: gpsTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          timeAgo: hoursAgo > 0 ? `${hoursAgo}h ago` : 'Just now',
          location: trip.address || ''
        }
      }
    }))
    
    return NextResponse.json(formattedTrips)
  }
}

export const recentAlertsHandlers = {
  async getRecentAlerts(request: NextRequest, user: any): Promise<NextResponse> {
    // Get user's company filter
    let whereClause: any = {}
    
    if (user.role === 'company') {
      whereClause.unit_uid = {
        in: await prisma.vehicles.findMany({
          where: { spcode: BigInt(user.spcode) },
          select: { uid: true }
        }).then(vehicles => vehicles.map(v => v.uid))
      }
    } else if (user.role === 'subsidiary') {
      // Get vehicles from companies under this subsidiary
      const subsidiaryCompanies = await prisma.companies.findMany({
        where: { parent_company_id: BigInt(user.spcode) },
        select: { id: true }
      })
      
      whereClause.unit_uid = {
        in: await prisma.vehicles.findMany({
          where: { 
            spcode: {
              in: subsidiaryCompanies.map(c => c.id)
            }
          },
          select: { uid: true }
        }).then(vehicles => vehicles.map(v => v.uid))
      }
    }
    
    const alerts = await prisma.alerts_data.findMany({
      where: whereClause,
      orderBy: { last_reported_time_utc: 'desc' },
      take: 10
    })
    
    // Get vehicle information for each alert
    const formattedAlerts = await Promise.all(alerts.map(async (alert) => {
      const vehicle = await prisma.vehicles.findFirst({
        where: { uid: alert.unit_uid },
        select: {
          reg_number: true,
          name: true
        }
      })
      
      return {
        id: alert.id.toString(),
        vehicle: {
          reg_number: vehicle?.reg_number || alert.unit_name || alert.unit_uid,
          name: vehicle?.name || alert.unit_name || alert.unit_uid
        },
        alert: {
          unit_name: alert.unit_name,
          alert_type: alert.alert_type,
          alert_description: alert.alert_description,
          last_reported_time_utc: alert.last_reported_time_utc,
          address: alert.address,
          latitude: alert.latitude,
          longitude: alert.longitude
        }
      }
    }))
    
    return NextResponse.json(formattedAlerts)
  }
}

export const insuranceHandlers = {
  async getInsurance(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    const companyFilter = searchParams.get('company')
    const statusFilter = searchParams.get('status')
    const vehicleNumber = searchParams.get('vehicle_number')
    
    // Build where clause with optional filters
    let whereClause: any = {}
    
    if (vehicleId) {
      whereClause.vehicle_id = BigInt(vehicleId)
    }
    
    if (vehicleNumber) {
      whereClause.vehicles = {
        reg_number: {
          contains: vehicleNumber,
          mode: 'insensitive'
        }
      }
    }
    
    if (statusFilter) {
      // Filter by expiry date based on status
      const today = new Date()
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      today.setHours(0, 0, 0, 0)
      thirtyDaysFromNow.setHours(0, 0, 0, 0)
      
      if (statusFilter === 'Expired') {
        whereClause.end_date = { lt: today }
      } else if (statusFilter === 'Expiring Soon') {
        whereClause.end_date = { gte: today, lte: thirtyDaysFromNow }
      } else if (statusFilter === 'Valid') {
        whereClause.end_date = { gt: thirtyDaysFromNow }
      }
    }
    
    const insuranceRecords = await prisma.insurance.findMany({
      where: whereClause,
      include: {
        vehicles: {
          select: {
            reg_number: true,
            name: true,
            company_name: true,
            vehicle_types: {
              select: {
                type: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })
    
    let filteredRecords = insuranceRecords
    
    // Filter by company if specified
    if (companyFilter) {
      filteredRecords = insuranceRecords.filter(record => {
        const companyName = record.vehicles?.company_name?.toLowerCase() || ''
        return companyName.includes(companyFilter.toLowerCase())
      })
    }
    
    const formattedInsurance = filteredRecords.map(i => ({
      id: i.id.toString(),
      policy_number: i.policy_number,
      provider: i.provider,
      start_date: i.start_date,
      end_date: i.end_date,
      premium_amount: i.premium_amount,
      coverage_type: i.coverage_type,
      status: i.status,
      vehicle_id: i.vehicle_id?.toString(),
      vehicle_reg: i.vehicles?.reg_number,
      vehicle_name: i.vehicles?.name,
      vehicle_company_name: i.vehicles?.company_name,
      vehicle_type: i.vehicles?.vehicle_types?.type,
      created_by: i.created_by,
      updated_by: i.updated_by
    }))
    
    return NextResponse.json(formattedInsurance)
  }
}

export const maintenanceHandlers = {
  async getMaintenance(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    
    const whereClause = vehicleId ? {
      vehicle_id: BigInt(vehicleId)
    } : {}
    
    const maintenanceRecords = await prisma.maintenance_history.findMany({
      where: whereClause,
      include: {
        vehicles: {
          select: {
            reg_number: true,
            name: true
          }
        }
      }
    })
    
    const formattedMaintenance = maintenanceRecords.map(m => ({
      id: m.id.toString(),
      service_type: m.service_type,
      service_date: m.service_date,
      mileage: m.mileage_at_service,
      cost: m.cost,
      description: m.service_details,
      next_service_mileage: null, // Not available in maintenance_history
      next_service_date: null, // Not available in maintenance_history
      status: m.status,
      vehicle_id: m.vehicle_id?.toString(),
      vehicle_reg: m.vehicles?.reg_number,
      vehicle_name: m.vehicles?.name
    }))
    
    return NextResponse.json(formattedMaintenance)
  }
}

export const alertsHandlers = {
  async getAlerts(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const companyFilter = searchParams.get('company')
    const unitNameFilter = searchParams.get('unit_name')
    const alertTypeFilter = searchParams.get('alert_type')
    const statusFilter = searchParams.get('status')
    
    // Build where clause with optional filters
    let whereClause: any = {}
    
    if (unitNameFilter) {
      whereClause.unit_name = {
        contains: unitNameFilter,
        mode: 'insensitive'
      }
    }
    
    if (alertTypeFilter) {
      whereClause.alert_type = {
        contains: alertTypeFilter,
        mode: 'insensitive'
      }
    }
    
    if (statusFilter) {
      whereClause.status = {
        contains: statusFilter,
        mode: 'insensitive'
      }
    }
    
    const alerts = await prisma.alerts_data.findMany({
      where: whereClause,
      orderBy: { gps_time_utc: 'desc' }
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
        name: true,
        company_name: true
      }
    })
    
    // Create a map of UID to vehicle for quick lookup
    const vehicleMap = new Map(vehicles.map(v => [v.uid, v]))
    
    // Format alerts with vehicle data
    let formattedAlerts = alerts.map(alert => {
      const vehicle = vehicleMap.get(alert.unit_uid)
      return {
        id: alert.id.toString(),
        unit_uid: alert.unit_uid,
        unit_name: alert.unit_name,
        gps_time_utc: alert.gps_time_utc?.toISOString() || alert.gps_time_utc,
        address: alert.address,
        speed: alert.speed?.toString() || alert.speed,
        odometer: alert.odometer?.toString() || alert.odometer,
        latitude: alert.latitude?.toString() || alert.latitude,
        longitude: alert.longitude?.toString() || alert.longitude,
        alert_type: alert.alert_type,
        alert_description: alert.alert_description,
        engine_status: alert.engine_status,
        status: alert.status,
        vehicle: vehicle ? {
          id: vehicle.id?.toString(),
          uid: vehicle.uid,
          reg_number: vehicle.reg_number,
          name: vehicle.name,
          company_name: vehicle.company_name
        } : null
      }
    })
    
    // Filter by company if specified
    if (companyFilter) {
      formattedAlerts = formattedAlerts.filter(alert => {
        const companyName = alert.vehicle?.company_name?.toLowerCase() || ''
        return companyName.includes(companyFilter.toLowerCase())
      })
    }
    
    return NextResponse.json(formattedAlerts)
  }
}

export const fuelRequestHandlers = {
  async getFuelRequests(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const registrationNumber = searchParams.get('registration_number')
    const statusFilter = searchParams.get('status')
    
    // Build where clause with optional filters
    let whereClause: any = {}
    
    if (statusFilter) {
      whereClause.status = {
        contains: statusFilter,
        mode: 'insensitive'
      }
    }
    
    let fuelRequests = await prisma.fuel_request.findMany({
      where: whereClause,
      include: {
        vehicles: {
          select: {
            id: true,
            reg_number: true,
            name: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })
    
    // Filter by registration number if specified
    if (registrationNumber) {
      fuelRequests = fuelRequests.filter(request => {
        const regNumber = request.vehicles?.reg_number?.toLowerCase() || ''
        return regNumber.includes(registrationNumber.toLowerCase())
      })
    }
    
    const formattedFuelRequests = fuelRequests.map(r => ({
      id: r.id.toString(),
      justification: r.justification,
      quantity: r.quantity,
      unit_cost: r.unit_cost,
      total_cost: r.total_cost,
      status: r.status,
      created_by: r.created_by,
      updated_by: r.updated_by,
      created_at: r.created_at,
      updated_at: r.updated_at,
      vehicles: r.vehicles ? {
        id: r.vehicles.id?.toString(),
        reg_number: r.vehicles.reg_number,
        name: r.vehicles.name
      } : null
    }))
    
    return NextResponse.json(formattedFuelRequests)
  }
}

export const fuelLogsHandlers = {
  async getFuelLogs(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    
    const whereClause = vehicleId ? {
      vehicle_id: BigInt(vehicleId)
    } : {}
    
    const fuelLogs = await prisma.fuel_logs.findMany({
      where: whereClause,
      include: {
        vehicles: {
          select: {
            reg_number: true,
            name: true
          }
        }
      }
    })
    
    const formattedFuelLogs = fuelLogs.map(f => ({
      id: f.id.toString(),
      date: f.date,
      fuel_amount: f.fuel_amount,
      cost: f.cost,
      mileage: f.mileage,
      fuel_type: f.fuel_type,
      station: f.station,
      notes: f.notes,
      vehicle_id: f.vehicle_id?.toString(),
      vehicle_reg: f.vehicles?.reg_number,
      vehicle_name: f.vehicles?.name
    }))
    
    return NextResponse.json(formattedFuelLogs)
  }
}

export const maintenanceScheduleHandlers = {
  async getMaintenanceSchedule(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    
    const whereClause = vehicleId ? {
      vehicle_id: BigInt(vehicleId)
    } : {}
    
    const maintenanceSchedule = await prisma.maintenance_schedule.findMany({
      where: whereClause,
      include: {
        vehicles: {
          select: {
            reg_number: true,
            name: true
          }
        }
      }
    })
    
    const formattedSchedule = maintenanceSchedule.map(s => ({
      id: s.id.toString(),
      service_type: s.service_type,
      scheduled_date: s.scheduled_date,
      mileage_threshold: s.mileage_threshold,
      description: s.description,
      status: s.status,
      vehicle_id: s.vehicle_id?.toString(),
      vehicle_reg: s.vehicles?.reg_number,
      vehicle_name: s.vehicles?.name
    }))
    
    return NextResponse.json(formattedSchedule)
  }
}

// Authentication handler
export const authHandlers = {
  authenticateUser(emailOrPhone: string, password: string) {
    // Mock authentication for development
    if (emailOrPhone === '0554040387' && password === 'password') {
      return {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        phone: "0554040387",
        role: "admin",
        is_active: true
      }
    }
    return null
  }
}
