const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUser() {
  try {
    console.log('🔍 Checking all users in database...')
    
    const users = await prisma.users.findMany()
    console.log(`Found ${users.length} users:`)
    
    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`)
      console.log(`ID: ${user.id}`)
      console.log(`Name: ${user.name}`)
      console.log(`Email: ${user.email}`)
      console.log(`Phone: ${user.phone}`)
      console.log(`Role: ${user.role}`)
      console.log(`Is Active: ${user.is_active}`)
      console.log(`Password (first 20 chars): ${user.password.substring(0, 20)}...`)
      console.log(`Password is hashed: ${user.password.startsWith('$2a$') || user.password.startsWith('$2b$')}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
