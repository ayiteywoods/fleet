const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('🔧 Creating a test user with proper password hashing...')
    
    const testUser = {
      name: 'Test User Direct',
      email: 'testdirect@example.com',
      phone: '0555123456',
      role: 'user',
      password: 'testpassword123',
      is_active: true
    }
    
    // Hash the password properly
    const hashedPassword = await bcrypt.hash(testUser.password, 12)
    
    // Create the user
    const newUser = await prisma.users.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        phone: testUser.phone,
        role: testUser.role,
        password: hashedPassword,
        is_active: testUser.is_active,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: '1',
        updated_by: '1'
      }
    })
    
    console.log('✅ Test user created successfully!')
    console.log('Login credentials:')
    console.log('Email:', testUser.email)
    console.log('Password:', testUser.password)
    console.log('User ID:', newUser.id.toString())
    
    // Test password verification
    const isValid = await bcrypt.compare(testUser.password, newUser.password)
    console.log('Password verification test:', isValid ? '✅ Works' : '❌ Fails')
    
  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
