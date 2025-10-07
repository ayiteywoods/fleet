const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const email = 'admin@nerafleet.com'
    const phone = '+1234567890'
    const password = 'admin123'
    const firstName = 'Admin'
    const lastName = 'User'

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      console.log('Admin user already exists!')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'ADMIN',
        isActive: true
      }
    })

    console.log('Admin user created successfully!')
    console.log('Email:', email)
    console.log('Phone:', phone)
    console.log('Password:', password)
    console.log('Please change the password after first login.')
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
