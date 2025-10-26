import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Create Prisma client with exact same configuration as working standalone script
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: ['error']
    })
    
    try {
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      const userCount = await prisma.users.count()
      
      return NextResponse.json({
        success: true,
        testResult,
        userCount,
        timestamp: new Date().toISOString()
      })
      
    } catch (dbError) {
      console.error('Database error:', dbError.message)
      
      return NextResponse.json({
        success: false,
        error: dbError.message,
        errorType: dbError.constructor.name,
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
