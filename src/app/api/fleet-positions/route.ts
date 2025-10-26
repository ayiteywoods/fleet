import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createDatabaseErrorResponse } from '@/lib/dbErrorHandler'
import { withAuthAndDatabaseFallback, fleetPositionHandlers } from '@/lib/apiWrapper'

// Helper function to serialize BigInt and Decimal values
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'bigint') return obj.toString()
  
  if (Array.isArray(obj)) return obj.map(serializeBigInt)
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)])
    )
  }
  return obj
}

// GET - Fetch vehicle positions based on user permissions
export const GET = withAuthAndDatabaseFallback(async (request: NextRequest, user: any) => {
  try {
    // Try to use the mock handler first
    return await fleetPositionHandlers.getFleetPositions(request, user)
  } catch (error: any) {
    console.error('Error in fleet positions handler:', error)
    return createDatabaseErrorResponse(error)
  }
})