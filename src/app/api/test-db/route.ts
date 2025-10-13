import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      testResult: testQuery,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      prismaUrl: process.env.PRISMA_DATABASE_URL ? 'Set' : 'Not set',
      postgresUrl: process.env.POSTGRES_URL ? 'Set' : 'Not set'
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      prismaUrl: process.env.PRISMA_DATABASE_URL ? 'Set' : 'Not set',
      postgresUrl: process.env.POSTGRES_URL ? 'Set' : 'Not set'
    }, { status: 500 })
  }
}
