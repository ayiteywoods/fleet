const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function debugPassword() {
  try {
    console.log('🔍 Debugging password for user: him@me.com')
    
    const user = await prisma.users.findFirst({
      where: { email: 'him@me.com' }
    })
    
    if (user) {
      console.log('User found:', user.name)
      console.log('Stored password hash:', user.password)
      
      // Test with common passwords
      const testPasswords = [
        'password123',
        'password',
        '123456',
        'admin123',
        'Password123',
        'him@me.com',
        'Gods Love',
        'gods love',
        'gods',
        'love'
      ]
      
      console.log('\n🔍 Testing common passwords:')
      for (const testPassword of testPasswords) {
        const isValid = await bcrypt.compare(testPassword, user.password)
        console.log(`"${testPassword}": ${isValid ? '✅ MATCH' : '❌ No match'}`)
      }
      
      // Let's also create a new hash with a known password to test
      console.log('\n🔍 Testing with a known password:')
      const testPassword = 'test123'
      const newHash = await bcrypt.hash(testPassword, 12)
      console.log('New hash for "test123":', newHash)
      
      const isValidNew = await bcrypt.compare(testPassword, newHash)
      console.log('Verification of new hash:', isValidNew ? '✅ Works' : '❌ Fails')
      
    } else {
      console.log('❌ User not found')
    }
    
  } catch (error) {
    console.error('❌ Error debugging password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugPassword()
