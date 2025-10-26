import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Temporary workaround for Next.js Prisma client issue
// This creates a fresh client for each request to bypass caching issues
export async function GET(request: NextRequest) {
  try {
    // Create a completely fresh Prisma client instance
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: ['error'], // Only log errors to reduce noise
    })
    
    try {
      // Test database connection
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      
      // Test users table access
      const userCount = await prisma.users.count()
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        testResult,
        userCount,
        timestamp: new Date().toISOString()
      })
      
    } catch (dbError) {
      console.error('Database error:', dbError.message)
      
      // Return mock data as fallback
      return NextResponse.json({
        success: false,
        message: 'Database connection failed - using mock data',
        error: dbError.message,
        mockData: {
          testResult: [{ test: 1 }],
          userCount: 5,
          note: 'This is mock data due to Next.js Prisma client issue'
        },
        timestamp: new Date().toISOString()
      })
      
    } finally {
      await prisma.$disconnect()
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
