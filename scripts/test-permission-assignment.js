const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPermissionAssignment() {
  try {
    console.log('🧪 Testing Permission Assignment\n')
    
    // 1. Get a role that needs permissions
    const role = await prisma.roles.findFirst({
      where: { name: 'Officer' }
    })
    
    if (!role) {
      console.log('❌ Officer role not found')
      return
    }
    
    console.log(`✅ Found role: "${role.name}" (ID: ${role.id}, guard: ${role.guard_name})`)
    
    // 2. Get some permissions to assign
    const permissionsToAssign = await prisma.permissions.findMany({
      where: {
        AND: [
          {
            name: {
              in: [
                'view driver',
                'add driver',
                'edit driver',
                'view vehicles',
                'add vehicles',
                'view fuel',
                'view fuel log',
                'add fuel log',
                'view insurance',
                'add insurance',
                'view maintenance',
                'add maintenance',
                'view repair',
                'add repair',
                'view roadworthy',
                'add roadworthy'
              ]
            }
          },
          {
            guard_name: 'web'
          }
        ]
      },
      take: 16
    })
    
    console.log(`\n📋 Found ${permissionsToAssign.length} permissions to assign:`)
    permissionsToAssign.forEach((p, i) => {
      console.log(`  ${i + 1}. "${p.name}" (ID: ${p.id})`)
    })
    
    // 3. Check current permissions for this role
    const currentPerms = await prisma.role_has_permissions.findMany({
      where: { role_id: role.id },
      include: { permissions: true }
    })
    
    console.log(`\n🔍 Current permissions for "${role.name}": ${currentPerms.length}`)
    if (currentPerms.length > 0) {
      currentPerms.forEach((rp, i) => {
        console.log(`  ${i + 1}. "${rp.permissions.name}"`)
      })
    }
    
    // 4. Try to assign permissions
    if (permissionsToAssign.length > 0) {
      console.log(`\n💾 Assigning ${permissionsToAssign.length} permissions to "${role.name}"...`)
      
      // Delete existing permissions
      await prisma.role_has_permissions.deleteMany({
        where: { role_id: role.id }
      })
      
      // Create new permissions
      const permissionIds = permissionsToAssign.map(p => p.id)
      const data = permissionIds.map(permissionId => ({
        role_id: role.id,
        permission_id: permissionId
      }))
      
      await prisma.role_has_permissions.createMany({
        data: data
      })
      
      console.log('✅ Permissions assigned successfully!')
      
      // Verify
      const verifyPerms = await prisma.role_has_permissions.findMany({
        where: { role_id: role.id },
        include: { permissions: true }
      })
      
      console.log(`\n✅ Verification: ${verifyPerms.length} permissions now assigned:`)
      verifyPerms.forEach((rp, i) => {
        console.log(`  ${i + 1}. "${rp.permissions.name}"`)
      })
    }
    
    console.log('\n✨ Test Complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPermissionAssignment()

