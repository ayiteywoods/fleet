const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserPermissions() {
  try {
    const args = process.argv.slice(2)
    const userIdentifier = args[0] // email, phone, or user ID

    if (!userIdentifier) {
      console.log('Usage: node scripts/check-user-permissions.js <email|phone|userId>')
      process.exit(1)
    }

    // Find user
    let user
    if (/^\d+$/.test(userIdentifier)) {
      // Numeric ID
      user = await prisma.users.findUnique({
        where: { id: BigInt(userIdentifier) }
      })
    } else if (userIdentifier.includes('@')) {
      // Email
      user = await prisma.users.findUnique({
        where: { email: userIdentifier }
      })
    } else {
      // Phone or name
      user = await prisma.users.findFirst({
        where: {
          OR: [
            { phone: userIdentifier },
            { name: userIdentifier },
            { full_name: userIdentifier }
          ]
        }
      })
    }

    if (!user) {
      console.log('❌ User not found')
      process.exit(1)
    }

    console.log('\n📋 User Information:')
    console.log('  ID:', user.id.toString())
    console.log('  Name:', user.name)
    console.log('  Email:', user.email || 'N/A')
    console.log('  Phone:', user.phone || 'N/A')
    console.log('  Role (string):', user.role)
    console.log('  Role ID:', user.role_id ? user.role_id.toString() : '❌ NOT SET')

    if (!user.role_id) {
      console.log('\n⚠️  WARNING: User does not have a role_id assigned!')
      console.log('   To fix: Update the user in the database and set role_id to a valid role ID')
      process.exit(1)
    }

    // Get role
    const role = await prisma.roles.findUnique({
      where: { id: user.role_id }
    })

    if (!role) {
      console.log('\n❌ Role not found for role_id:', user.role_id.toString())
      process.exit(1)
    }

    console.log('\n👤 Role Information:')
    console.log('  Role ID:', role.id.toString())
    console.log('  Role Name:', role.name)
    console.log('  Guard Name:', role.guard_name)

    // Get permissions
    const rolePermissions = await prisma.role_has_permissions.findMany({
      where: { role_id: user.role_id },
      include: {
        permissions: {
          select: { name: true }
        }
      }
    })

    console.log('\n🔐 Permissions:')
    if (rolePermissions.length === 0) {
      console.log('  ❌ No permissions assigned to this role!')
      console.log('   To fix: Use the Roles modal to assign permissions to this role')
    } else {
      console.log(`  ✅ ${rolePermissions.length} permission(s) assigned:`)
      rolePermissions.forEach((rp, index) => {
        console.log(`     ${index + 1}. ${rp.permissions.name}`)
      })
    }

    // Check common permissions
    const permissionNames = rolePermissions.map(rp => rp.permissions.name.toLowerCase())
    const commonChecks = [
      'view driver',
      'view vehicle',
      'view fuel',
      'view insurance',
      'view maintenance',
      'view repair',
      'view roadworthy'
    ]

    console.log('\n📊 Permission Summary:')
    commonChecks.forEach(perm => {
      const has = permissionNames.includes(perm)
      console.log(`  ${has ? '✅' : '❌'} ${perm}`)
    })

    console.log('\n✨ Done!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserPermissions()

