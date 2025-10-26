import { NextResponse } from 'next/server'

export interface DatabaseError {
  type: 'authentication' | 'connection' | 'permission' | 'unknown'
  message: string
  details?: any
}

export function handleDatabaseError(error: any): DatabaseError {
  const errorMessage = error?.message || 'Unknown database error'
  
  if (errorMessage.includes('Authentication failed') || errorMessage.includes('password authentication failed')) {
    return {
      type: 'authentication',
      message: 'Database authentication failed. Please contact your administrator to verify database credentials.',
      details: error
    }
  }
  
  if (errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('timeout')) {
    return {
      type: 'connection',
      message: 'Unable to connect to database server. Please check your network connection and database server status.',
      details: error
    }
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
    return {
      type: 'permission',
      message: 'Insufficient database permissions. Please contact your administrator.',
      details: error
    }
  }
  
  return {
    type: 'unknown',
    message: 'An unexpected database error occurred. Please try again later.',
    details: error
  }
}

export function createErrorResponse(error: DatabaseError, statusCode: number = 500) {
  return NextResponse.json(
    {
      error: error.message,
      type: error.type,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { details: error.details })
    },
    { status: statusCode }
  )
}

export function createDatabaseErrorResponse(error: any, statusCode: number = 500) {
  const dbError = handleDatabaseError(error)
  return createErrorResponse(dbError, statusCode)
}
