const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetUserPassword() {
  try {
    console.log('🔧 Resetting password for user: Temple Jedi (0554040387)')
    
    // First find the user by phone
    const user = await prisma.users.findFirst({
      where: { phone: '0554040387' }
    })
    
    if (!user) {
      console.log('❌ User not found with phone: 0554040387')
      return
    }
    
    console.log('👤 Found user:', user.name, '(ID:', user.id, ')')
    
    // Set a new known password
    const newPassword = 'password123'
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        updated_at: new Date()
      }
    })
    
    console.log('✅ Password reset successfully!')
    console.log('New login credentials:')
    console.log('Phone: 0554040387')
    console.log('Email: aa@me.com')
    console.log('Password: password123')
    
    // Test the new password
    const testUser = await prisma.users.findFirst({
      where: { phone: '0554040387' }
    })
    
    const isValid = await bcrypt.compare(newPassword, testUser.password)
    console.log('Password verification test:', isValid ? '✅ Works' : '❌ Fails')
    
  } catch (error) {
    console.error('❌ Error resetting password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetUserPassword()
