/**
 * Utility script to clear tracking:true flag from a user's providers field
 * Usage: node scripts/clear-tracking-flag.js <username_or_email>
 * 
 * This is useful when a user has a stale tracking:true flag but doesn't actually have external access
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const identifier = process.argv[2]
  
  if (!identifier) {
    console.error('Usage: node scripts/clear-tracking-flag.js <username_or_email>')
    process.exit(1)
  }

  try {
    // Find user by email, phone, name, or full_name
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          { name: identifier },
          { full_name: identifier },
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        providers: true
      }
    })

    if (!user) {
      console.error(`❌ User not found: ${identifier}`)
      process.exit(1)
    }

    console.log(`Found user: ${user.name} (ID: ${user.id})`)
    console.log(`Current providers: "${(user.providers || '').toString()}"`)

    const providers = (user.providers || '').toString()
    const hasTracking = providers.includes('tracking:true')

    if (!hasTracking) {
      console.log('✅ User does not have tracking:true flag - nothing to clear')
      process.exit(0)
    }

    // Clear tracking:true from providers field
    const updated = providers.replace(/tracking:true/g, '').replace(/;;/g, ';').replace(/^;|;$/g, '')

    await prisma.users.update({
      where: { id: user.id },
      data: { providers: updated }
    })

    console.log(`✅ Cleared tracking:true flag`)
    console.log(`   Old: "${providers}"`)
    console.log(`   New: "${updated}"`)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

