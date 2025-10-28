import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all reminders (items expiring within 2 weeks)
export async function GET(request: NextRequest) {
  try {
    // Resolve user and company scope
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let scopedCompanyName: string | null = null
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
          scopedCompanyName = company?.name || null
        }
      }
    }

    const reminders: any[] = []
    const today = new Date()
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
    
    // Reset hours to start of day for comparison
    today.setHours(0, 0, 0, 0)
    twoWeeksFromNow.setHours(23, 59, 59, 999)

    // Build where clause for drivers based on company scoping
    let driversWhere: any = {}
    if (scopedCompanyName) {
      // Get vehicles for this company, then find drivers assigned to those vehicles
      const companyVehicles = await prisma.vehicles.findMany({
        where: { company_name: scopedCompanyName },
        select: { id: true }
      })
      if (companyVehicles.length > 0) {
        driversWhere.vehicle_id = {
          in: companyVehicles.map(v => v.id)
        }
      }
    }

    // Get drivers with licenses expiring within 2 weeks
    const drivers = await prisma.driver_operators.findMany({
      where: driversWhere,
      select: {
        id: true,
        name: true,
        license_number: true,
        license_expire: true
      }
    })

    drivers.forEach(driver => {
      try {
        const expiryDate = new Date(driver.license_expire)
        expiryDate.setHours(0, 0, 0, 0)
        
        if (expiryDate >= today && expiryDate <= twoWeeksFromNow) {
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          reminders.push({
            id: `driver-${driver.id}`,
            type: 'Driver License',
            title: `${driver.name}'s License`,
            description: `Driver: ${driver.name} | License: ${driver.license_number} | Expiring: ${expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
            expiryDate: expiryDate.toISOString(),
            daysUntilExpiry,
            driver_id: driver.id.toString(),
            urgency: daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 14 ? 'medium' : 'low'
          })
        }
      } catch (error) {
        // Skip drivers with invalid dates
        console.log(`Invalid date for driver ${driver.id}: ${driver.license_expire}`)
      }
    })

    // Build where clause for insurance based on company scoping
    let insuranceWhere: any = {}
    if (scopedCompanyName) {
      // Get vehicles for this company, then find insurance for those vehicles
      const companyVehicles = await prisma.vehicles.findMany({
        where: { company_name: scopedCompanyName },
        select: { id: true }
      })
      if (companyVehicles.length > 0) {
        insuranceWhere.vehicle_id = {
          in: companyVehicles.map(v => v.id)
        }
      }
    }

    // Get insurance policies expiring within 2 weeks
    const insurancePolicies = await prisma.insurance.findMany({
      where: insuranceWhere,
      select: {
        id: true,
        policy_number: true,
        insurance_company: true,
        end_date: true,
        vehicles: {
          select: {
            reg_number: true,
            name: true
          }
        }
      }
    })

    insurancePolicies.forEach(insurance => {
      try {
        const expiryDate = new Date(insurance.end_date)
        expiryDate.setHours(0, 0, 0, 0)
        
        if (expiryDate >= today && expiryDate <= twoWeeksFromNow) {
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          reminders.push({
            id: `insurance-${insurance.id}`,
            type: 'Insurance',
            title: insurance.vehicles?.name || 'Insurance Policy',
            description: `Vehicle: ${insurance.vehicles?.reg_number || 'N/A'} | Policy: ${insurance.policy_number} | Expiring: ${expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
            vehicleReg: insurance.vehicles?.reg_number,
            expiryDate: expiryDate.toISOString(),
            daysUntilExpiry,
            insurance_id: insurance.id.toString(),
            urgency: daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 14 ? 'medium' : 'low'
          })
        }
      } catch (error) {
        console.log(`Invalid date for insurance ${insurance.id}`)
      }
    })

    // Build where clause for roadworthy based on company scoping
    let roadworthyWhere: any = {}
    if (scopedCompanyName) {
      roadworthyWhere.company = scopedCompanyName
    }

    // Get roadworthy certificates expiring within 2 weeks
    const roadworthyRecords = await prisma.roadworthy.findMany({
      where: roadworthyWhere,
      select: {
        id: true,
        vehicle_number: true,
        company: true,
        date_expired: true
      }
    })

    roadworthyRecords.forEach(roadworthy => {
      try {
        const expiryDate = new Date(roadworthy.date_expired)
        expiryDate.setHours(0, 0, 0, 0)
        
        if (expiryDate >= today && expiryDate <= twoWeeksFromNow) {
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          reminders.push({
            id: `roadworthy-${roadworthy.id}`,
            type: 'Roadworthy',
            title: `Vehicle ${roadworthy.vehicle_number}`,
            description: `Vehicle: ${roadworthy.vehicle_number} | Company: ${roadworthy.company} | Expiring: ${expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
            vehicleReg: roadworthy.vehicle_number,
            expiryDate: expiryDate.toISOString(),
            daysUntilExpiry,
            roadworthy_id: roadworthy.id.toString(),
            urgency: daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 14 ? 'medium' : 'low'
          })
        }
      } catch (error) {
        console.log(`Invalid date for roadworthy ${roadworthy.id}`)
      }
    })

    // Sort by urgency and days until expiry
    reminders.sort((a, b) => {
      const urgencyOrder = { 'high': 0, 'medium': 1, 'low': 2 }
      if (urgencyOrder[a.urgency as keyof typeof urgencyOrder] !== urgencyOrder[b.urgency as keyof typeof urgencyOrder]) {
        return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder]
      }
      return a.daysUntilExpiry - b.daysUntilExpiry
    })

    return NextResponse.json(reminders)
  } catch (error: any) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

