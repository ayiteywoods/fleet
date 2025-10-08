const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('🔍 Testing login for user: him@me.com')
    
    // Test the exact same logic as the authenticateUser function
    const emailOrPhone = 'him@me.com'
    const password = 'password123' // Try with a common password
    
    const isEmail = emailOrPhone.includes('@')
    console.log('Is email:', isEmail)
    
    const user = await prisma.users.findFirst({
      where: isEmail 
        ? { email: emailOrPhone, is_active: true }
        : { phone: emailOrPhone, is_active: true }
    })
    
    console.log('User found:', user ? 'YES' : 'NO')
    if (user) {
      console.log('User details:', {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active
      })
      
      console.log('Testing password verification...')
      const isValidPassword = await bcrypt.compare(password, user.password)
      console.log('Password valid:', isValidPassword)
      
      if (isValidPassword) {
        console.log('✅ Login should work!')
      } else {
        console.log('❌ Password verification failed')
        console.log('Trying with phone number instead...')
        
        // Try with phone number
        const userByPhone = await prisma.users.findFirst({
          where: { phone: emailOrPhone, is_active: true }
        })
        
        if (userByPhone) {
          console.log('User found by phone:', userByPhone.name)
          const isValidPasswordByPhone = await bcrypt.compare(password, userByPhone.password)
          console.log('Password valid with phone:', isValidPasswordByPhone)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
