import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  // Create a completely fresh Prisma client instance with explicit configuration
  const freshPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['query', 'info', 'warn', 'error'],
  })
  
  try {
    // Log environment variables with detailed analysis
    const databaseUrl = process.env.DATABASE_URL || ''
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
      databaseUrlLength: databaseUrl.length,
      databaseUrlStart: databaseUrl.substring(0, 20),
      databaseUrlEnd: databaseUrl.substring(databaseUrl.length - 20),
      databaseUrlBytes: Array.from(databaseUrl).map(c => c.charCodeAt(0)),
      prismaUrlSet: !!process.env.PRISMA_DATABASE_URL,
      postgresUrlSet: !!process.env.POSTGRES_URL,
    }

    console.log('Environment info:', envInfo)
    console.log('Full DATABASE_URL:', databaseUrl)
    console.log('DATABASE_URL bytes:', envInfo.databaseUrlBytes)

    // Test database connection with fresh client
    let testResult
    try {
      testResult = await freshPrisma.$queryRaw`SELECT 1 as test`
      console.log('Database query successful:', testResult)
    } catch (dbError) {
      console.error('Database query failed:', dbError)
      throw dbError
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful with fresh client',
      testResult,
      envInfo
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    
    const databaseUrl = process.env.DATABASE_URL || ''
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      envInfo: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrlSet: !!process.env.DATABASE_URL,
        databaseUrlLength: databaseUrl.length,
        databaseUrlStart: databaseUrl.substring(0, 20),
        databaseUrlEnd: databaseUrl.substring(databaseUrl.length - 20),
        databaseUrlBytes: Array.from(databaseUrl).map(c => c.charCodeAt(0)),
        prismaUrlSet: !!process.env.PRISMA_DATABASE_URL,
        postgresUrlSet: !!process.env.POSTGRES_URL,
      }
    }, { status: 500 })
  } finally {
    // Always disconnect the fresh client
    await freshPrisma.$disconnect()
  }
}
