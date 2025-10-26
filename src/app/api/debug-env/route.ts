import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      envInfo: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrlSet: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length,
        databaseUrlStart: process.env.DATABASE_URL?.substring(0, 30),
        databaseUrlEnd: process.env.DATABASE_URL?.substring(-20),
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('PRISMA')),
        databaseUrlBytes: process.env.DATABASE_URL ? Array.from(process.env.DATABASE_URL).map(c => c.charCodeAt(0)) : null
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
