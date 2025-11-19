const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugPermissions() {
  try {
    console.log('🔍 Debugging Permissions System\n')
    console.log('='.repeat(60))

    // 1. Check all permissions in database
    console.log('\n📋 Step 1: All Permissions in Database')
    console.log('-'.repeat(60))
    const allPermissions = await prisma.permissions.findMany({
      orderBy: { name: 'asc' },
      take: 50 // Show first 50
    })
    console.log(`Total permissions: ${allPermissions.length}`)
    console.log('\nSample permissions (first 20):')
    allPermissions.slice(0, 20).forEach((p, i) => {
      console.log(`  ${i + 1}. "${p.name}" (guard: ${p.guard_name})`)
    })

    // 2. Check all roles
    console.log('\n\n👥 Step 2: All Roles')
    console.log('-'.repeat(60))
    const allRoles = await prisma.roles.findMany({
      orderBy: { name: 'asc' }
    })
    console.log(`Total roles: ${allRoles.length}`)
    allRoles.forEach((role, i) => {
      console.log(`  ${i + 1}. "${role.name}" (ID: ${role.id}, guard: ${role.guard_name})`)
    })

    // 3. Check role-permission relationships
    console.log('\n\n🔗 Step 3: Role-Permission Relationships')
    console.log('-'.repeat(60))
    for (const role of allRoles) {
      const rolePerms = await prisma.role_has_permissions.findMany({
        where: { role_id: role.id },
        include: { permissions: true }
      })
      console.log(`\n  Role: "${role.name}" (ID: ${role.id})`)
      if (rolePerms.length === 0) {
        console.log('    ❌ No permissions assigned')
      } else {
        console.log(`    ✅ ${rolePerms.length} permission(s):`)
        rolePerms.slice(0, 10).forEach((rp, i) => {
          console.log(`       ${i + 1}. "${rp.permissions.name}"`)
        })
        if (rolePerms.length > 10) {
          console.log(`       ... and ${rolePerms.length - 10} more`)
        }
      }
    }

    // 4. Check users and their roles
    console.log('\n\n👤 Step 4: Users and Their Roles')
    console.log('-'.repeat(60))
    const users = await prisma.users.findMany({
      where: { role_id: { not: null } },
      take: 10
    })
    console.log(`Found ${users.length} users with roles (showing first 10):`)
    for (const user of users) {
      console.log(`\n  User: ${user.name || user.email || user.phone} (ID: ${user.id})`)
      console.log(`    Role ID: ${user.role_id ? user.role_id.toString() : 'NULL'}`)
      
      if (user.role_id) {
        const role = await prisma.roles.findUnique({
          where: { id: user.role_id }
        })
        if (role) {
          console.log(`    Role Name: "${role.name}" (guard: ${role.guard_name})`)
          
          // Get user's permissions
          const userPerms = await prisma.role_has_permissions.findMany({
            where: { role_id: user.role_id },
            include: { permissions: true }
          })
          console.log(`    Permissions: ${userPerms.length} permission(s)`)
          if (userPerms.length > 0) {
            const permNames = userPerms.map(rp => rp.permissions.name.toLowerCase().trim())
            console.log(`    Normalized permissions (first 10): ${permNames.slice(0, 10).join(', ')}`)
          }
        }
      }
    }

    // 5. Check for common permission mismatches
    console.log('\n\n🔍 Step 5: Permission Name Analysis')
    console.log('-'.repeat(60))
    const expectedPermissions = [
      'view driver',
      'add driver',
      'edit driver',
      'delete driver',
      'view vehicles',
      'add vehicles',
      'edit vehicles',
      'delete vehicles',
      'view fuel',
      'add fuel log',
      'view fuel log',
      'view insurance',
      'add insurance',
      'view maintenance',
      'add maintenance',
      'view repair',
      'add repair',
      'view roadworthy',
      'add roadworthy',
      'view user',
      'add user'
    ]

    const dbPermissionNames = allPermissions.map(p => p.name.toLowerCase().trim())
    console.log('\nExpected vs Database:')
    expectedPermissions.forEach(expected => {
      const found = dbPermissionNames.includes(expected)
      const similar = dbPermissionNames.filter(p => 
        p.includes(expected.split(' ')[1]) || expected.split(' ')[1].includes(p.split(' ')[1] || '')
      )
      console.log(`  ${found ? '✅' : '❌'} "${expected}"`)
      if (!found && similar.length > 0) {
        console.log(`      ⚠️  Similar found: ${similar.slice(0, 3).join(', ')}`)
      }
    })

    // 6. Check guard_name consistency
    console.log('\n\n🛡️  Step 6: Guard Name Analysis')
    console.log('-'.repeat(60))
    const guardNames = await prisma.permissions.groupBy({
      by: ['guard_name'],
      _count: { guard_name: true }
    })
    console.log('Guard names in permissions:')
    guardNames.forEach(g => {
      console.log(`  "${g.guard_name}": ${g._count.guard_name} permission(s)`)
    })

    const roleGuardNames = await prisma.roles.groupBy({
      by: ['guard_name'],
      _count: { guard_name: true }
    })
    console.log('\nGuard names in roles:')
    roleGuardNames.forEach(g => {
      console.log(`  "${g.guard_name}": ${g._count.guard_name} role(s)`)
    })

    console.log('\n\n✨ Debug Complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugPermissions()

