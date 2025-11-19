const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserRolePermissions() {
  try {
    console.log('🔍 Checking User Role and Permissions\n')
    console.log('='.repeat(60))

    // Get all users with their role information
    const users = await prisma.users.findMany({
      where: {
        role: {
          contains: 'Others',
          mode: 'insensitive'
        }
      },
      take: 10
    })

    console.log(`\n👤 Found ${users.length} user(s) with role containing "Others":\n`)

    for (const user of users) {
      console.log(`User: ${user.name || user.email || user.phone} (ID: ${user.id})`)
      console.log(`  Role (string): "${user.role}"`)
      console.log(`  Role ID: ${user.role_id ? user.role_id.toString() : '❌ NULL'}`)

      if (!user.role_id) {
        console.log(`  ⚠️  User has no role_id set!`)
        continue
      }

      // Get the role details
      const role = await prisma.roles.findUnique({
        where: { id: user.role_id }
      })

      if (!role) {
        console.log(`  ❌ Role with ID ${user.role_id} not found in database!`)
        continue
      }

      console.log(`  ✅ Role found: "${role.name}" (ID: ${role.id}, guard: ${role.guard_name})`)

      // Check if role name matches
      if (role.name.toLowerCase() !== user.role?.toLowerCase()) {
        console.log(`  ⚠️  WARNING: Role name mismatch!`)
        console.log(`     User.role: "${user.role}"`)
        console.log(`     Role.name: "${role.name}"`)
      }

      // Get permissions for this role
      const rolePermissions = await prisma.role_has_permissions.findMany({
        where: { role_id: user.role_id },
        include: {
          permissions: {
            select: { name: true, guard_name: true }
          }
        }
      })

      console.log(`  📋 Permissions: ${rolePermissions.length} permission(s)`)
      if (rolePermissions.length === 0) {
        console.log(`  ❌ No permissions assigned to role "${role.name}"!`)
        console.log(`     To fix: Go to Users > ROLES > Click shield icon for "${role.name}" > Select permissions > Save`)
      } else {
        console.log(`  ✅ Permissions assigned:`)
        rolePermissions.forEach((rp, i) => {
          console.log(`     ${i + 1}. "${rp.permissions.name}" (guard: ${rp.permissions.guard_name})`)
        })
      }

      console.log('')
    }

    // Also check the "Others" role directly
    console.log('\n' + '='.repeat(60))
    console.log('\n🔍 Checking "Others" Role Directly:\n')

    const othersRole = await prisma.roles.findFirst({
      where: {
        name: {
          contains: 'Others',
          mode: 'insensitive'
        }
      }
    })

    if (!othersRole) {
      console.log('❌ "Others" role not found in database!')
    } else {
      console.log(`✅ Found "Others" role:`)
      console.log(`   ID: ${othersRole.id}`)
      console.log(`   Name: "${othersRole.name}"`)
      console.log(`   Guard: ${othersRole.guard_name}`)

      const othersPermissions = await prisma.role_has_permissions.findMany({
        where: { role_id: othersRole.id },
        include: {
          permissions: {
            select: { name: true }
          }
        }
      })

      console.log(`\n   Permissions: ${othersPermissions.length} permission(s)`)
      if (othersPermissions.length === 0) {
        console.log(`   ❌ No permissions assigned!`)
      } else {
        console.log(`   ✅ Permissions:`)
        othersPermissions.forEach((rp, i) => {
          console.log(`      ${i + 1}. "${rp.permissions.name}"`)
        })
      }
    }

    console.log('\n✨ Check Complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserRolePermissions()

