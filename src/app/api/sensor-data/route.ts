import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Function to serialize BigInt and Decimal values
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'bigint') return obj.toString()
  
  // Handle Prisma Decimal objects
  if (obj && typeof obj === 'object' && obj.constructor && obj.constructor.name === 'Decimal') {
    return obj.toString()
  }
  
  // Handle Prisma Decimal objects with structure {s, e, d}
  if (obj && typeof obj === 'object' && obj.s !== undefined && obj.e !== undefined && obj.d !== undefined) {
    // This is a Prisma Decimal object, convert it to a number
    const sign = obj.s === 1 ? 1 : -1
    const exponent = obj.e
    const digits = obj.d
    
    if (digits.length === 0) return '0'
    
    // Convert digits array to number string
    let result = digits.join('')
    
    // Apply decimal point based on exponent
    if (exponent < digits.length) {
      const decimalPos = digits.length - exponent
      result = result.slice(0, decimalPos) + '.' + result.slice(decimalPos)
    } else if (exponent > digits.length) {
      // Add trailing zeros
      result = result + '0'.repeat(exponent - digits.length)
    }
    
    // Remove trailing zeros and decimal point if not needed
    result = result.replace(/\.?0+$/, '')
    if (result === '') result = '0'
    
    // Apply sign
    if (sign === -1 && result !== '0') {
      result = '-' + result
    }
    
    return result
  }
  
  if (Array.isArray(obj)) return obj.map(serializeBigInt)
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)])
    )
  }
  return obj
}

// GET - Fetch sensor data for a specific vehicle
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicle_id')

    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 })
    }

    // Validate vehicle ID
    if (isNaN(Number(vehicleId))) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 })
    }

    // Get the vehicle's UID to match with sensor data
    const vehicle = await prisma.vehicles.findUnique({
      where: { id: BigInt(vehicleId) },
      select: { uid: true }
    })

    if (!vehicle?.uid) {
      // If no UID, return empty array instead of error
      return NextResponse.json(serializeBigInt([]))
    }

    // Fetch real sensor data from the database
    const sensorData = await prisma.sensor_data.findMany({
      where: {
        unit_uid: vehicle.uid
      },
      orderBy: {
        gps_time_utc: 'desc'
      },
      take: 100 // Limit to last 100 readings
    })

    // Process the data to fix Decimal values and dates
    const processedData = sensorData.map(item => {
      const processed = { ...item }
      
      // Fix value field - use data.Value if available, otherwise convert Decimal
      if (item.data && typeof item.data === 'object' && item.data.Value) {
        processed.value = item.data.Value
      } else if (item.value && typeof item.value === 'object' && item.value.s !== undefined) {
        // Convert Decimal object
        const sign = item.value.s === 1 ? 1 : -1
        const exponent = item.value.e
        const digits = item.value.d
        
        if (digits.length === 0) {
          processed.value = '0'
        } else {
          let result = digits.join('')
          
          // Apply decimal point based on exponent
          if (exponent < digits.length) {
            const decimalPos = digits.length - exponent
            result = result.slice(0, decimalPos) + '.' + result.slice(decimalPos)
          } else if (exponent > digits.length) {
            result = result + '0'.repeat(exponent - digits.length)
          }
          
          // Remove trailing zeros and decimal point if not needed
          result = result.replace(/\.?0+$/, '')
          if (result === '') result = '0'
          
          // Apply sign
          if (sign === -1 && result !== '0') {
            result = '-' + result
          }
          
          processed.value = result
        }
      }
      
      // Fix date fields - use data fields if available
      if (item.data && typeof item.data === 'object') {
        if (item.data.ReadingTimeLocal) {
          processed.reading_time_local = item.data.ReadingTimeLocal
        }
        if (item.data.ReadingTimeUtc) {
          processed.gps_time_utc = item.data.ReadingTimeUtc
        }
        if (item.data.ServerTimeUtc) {
          processed.server_time_utc = item.data.ServerTimeUtc
        }
      }
      
      return processed
    })

    return NextResponse.json(serializeBigInt(processedData))
  } catch (error) {
    console.error('Error fetching sensor data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sensor data' },
      { status: 500 }
    )
  }
}

// POST - Create new sensor data record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sensor_type, value, name, measurement_sign, unit_id } = body

    // Validate required fields
    if (!sensor_type || !value || !name || !unit_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For now, return success since we're using mock data
    // In a real implementation, this would insert into the sensor_data table
    const newSensorData = {
      id: Date.now().toString(),
      sensor_type,
      value,
      name,
      measurement_sign: measurement_sign || '',
      reading_time_local: new Date().toISOString(),
      unit_id
    }

    return NextResponse.json(serializeBigInt(newSensorData), { status: 201 })
  } catch (error) {
    console.error('Error creating sensor data:', error)
    return NextResponse.json(
      { error: 'Failed to create sensor data' },
      { status: 500 }
    )
  }
}
