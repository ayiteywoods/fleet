const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function syncUserRoleIds() {
  try {
    console.log('🔧 Syncing User Role IDs\n')
    console.log('='.repeat(60))

    // Get all users
    const users = await prisma.users.findMany({
      where: {
        role_id: null
      }
    })

    console.log(`\nFound ${users.length} user(s) with NULL role_id\n`)

    // Get all roles
    const roles = await prisma.roles.findMany()
    const roleMap = new Map()
    roles.forEach(role => {
      roleMap.set(role.name.toLowerCase(), role.id)
    })

    console.log('Available roles:')
    roles.forEach(role => {
      console.log(`  "${role.name}" -> ID: ${role.id}`)
    })
    console.log('')

    let updated = 0
    let skipped = 0

    for (const user of users) {
      if (!user.role) {
        console.log(`⚠️  User ${user.id} (${user.name || user.email}) has no role string`)
        skipped++
        continue
      }

      const roleNameLower = user.role.toLowerCase()
      const roleId = roleMap.get(roleNameLower)

      if (!roleId) {
        console.log(`❌ User ${user.id} (${user.name || user.email})`)
        console.log(`   Role string: "${user.role}" - No matching role found in database`)
        skipped++
        continue
      }

      // Update user's role_id
      await prisma.users.update({
        where: { id: user.id },
        data: { role_id: roleId }
      })

      console.log(`✅ Updated user ${user.id} (${user.name || user.email})`)
      console.log(`   Role: "${user.role}" -> role_id: ${roleId}`)
      updated++
    }

    console.log('\n' + '='.repeat(60))
    console.log(`\n✨ Sync Complete!`)
    console.log(`   Updated: ${updated} user(s)`)
    console.log(`   Skipped: ${skipped} user(s)`)
    console.log(`\n💡 Users need to log out and log back in to refresh their permissions.`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

syncUserRoleIds()

