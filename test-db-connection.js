#!/usr/bin/env node

// Load environment variables the same way Next.js does
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const { PrismaClient } = require('@prisma/client')

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  console.log('Environment variables:')
  console.log('- NODE_ENV:', process.env.NODE_ENV)
  console.log('- DATABASE_URL set:', !!process.env.DATABASE_URL)
  console.log('- DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
  console.log('- DATABASE_URL start:', process.env.DATABASE_URL?.substring(0, 30) || 'Not set')
  console.log('- Full DATABASE_URL:', process.env.DATABASE_URL)
  
  const prisma = new PrismaClient()
  
  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query successful:', result)
    
    // Test if we can access the users table
    try {
      const userCount = await prisma.users.count()
      console.log('✅ Users table accessible, count:', userCount)
    } catch (error) {
      console.log('❌ Users table not accessible:', error.message)
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:')
    console.log('Error type:', error.constructor.name)
    console.log('Error message:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔧 SOLUTION: Password authentication failed')
      console.log('The database password has changed on the server.')
      console.log('Please contact your database administrator to get the updated password.')
      console.log('\nCurrent credentials being used:')
      console.log('- Server: 172.237.96.166:5432')
      console.log('- Database: laravel_db')
      console.log('- User: iwaste25_admin')
      console.log('- Password: 960pnDIjlhMEjCYdlJXj6ZJtdehdBD6MQavo+JXX7s=')
    }
    
    if (error.message.includes('connection refused')) {
      console.log('\n🔧 SOLUTION: Connection refused')
      console.log('The database server might be down or the IP/port is incorrect.')
    }
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n🔧 SOLUTION: Database does not exist')
      console.log('The database "laravel_db" might not exist on the server.')
    }
    
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log('\n🏁 Database connection test completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })
