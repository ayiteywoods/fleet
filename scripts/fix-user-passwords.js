const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixUserPasswords() {
  try {
    console.log('🔍 Finding users with plain text passwords...')
    
    // Get all users
    const users = await prisma.users.findMany()
    console.log(`Found ${users.length} users`)
    
    for (const user of users) {
      // Check if password looks like it's already hashed (bcrypt hashes start with $2a$ or $2b$)
      const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
      
      if (!isHashed) {
        console.log(`🔧 Fixing password for user: ${user.name} (${user.email || user.phone})`)
        
        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(user.password, 12)
        
        // Update the user with hashed password
        await prisma.users.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        })
        
        console.log(`✅ Fixed password for user: ${user.name}`)
      } else {
        console.log(`✅ User ${user.name} already has hashed password`)
      }
    }
    
    console.log('🎉 All user passwords have been fixed!')
  } catch (error) {
    console.error('❌ Error fixing user passwords:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserPasswords()
