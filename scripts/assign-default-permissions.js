/**
 * This script assigns default permissions to roles for testing
 * Run this after ensuring your database is accessible
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const defaultPermissions = {
  'Officer': [
    'view driver',
    'add driver',
    'edit driver',
    'view vehicles',
    'add vehicles',
    'edit vehicles',
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
  ],
  'Manager': [
    'view driver',
    'add driver',
    'edit driver',
    'delete driver',
    'view vehicles',
    'add vehicles',
    'edit vehicles',
    'delete vehicles',
    'view fuel',
    'view fuel log',
    'add fuel log',
    'edit fuel log',
    'view insurance',
    'add insurance',
    'edit insurance',
    'view maintenance',
    'add maintenance',
    'edit maintenance',
    'view repair',
    'add repair',
    'edit repair',
    'view roadworthy',
    'add roadworthy',
    'edit roadworthy'
  ],
  'Admin': [
    // Admin gets all permissions - we'll assign all 'view', 'add', 'edit', 'delete' permissions
  ]
}

async function assignDefaultPermissions() {
  try {
    console.log('🔧 Assigning Default Permissions to Roles\n')
    
    // Get all roles
    const roles = await prisma.roles.findMany()
    console.log(`Found ${roles.length} roles\n`)
    
    for (const role of roles) {
      console.log(`Processing role: "${role.name}" (ID: ${role.id})`)
      
      let permissionsToAssign = defaultPermissions[role.name] || []
      
      // For Admin, assign all view/add/edit/delete permissions
      if (role.name === 'Admin' || role.name === 'Super Admin') {
        const allPerms = await prisma.permissions.findMany({
          where: {
            guard_name: 'web',
            OR: [
              { name: { startsWith: 'view ' } },
              { name: { startsWith: 'add ' } },
              { name: { startsWith: 'edit ' } },
              { name: { startsWith: 'delete ' } }
            ]
          }
        })
        permissionsToAssign = allPerms.map(p => p.name)
        console.log(`  Admin role - assigning all ${permissionsToAssign.length} permissions`)
      }
      
      if (permissionsToAssign.length === 0) {
        console.log(`  ⚠️  No default permissions defined for "${role.name}"`)
        continue
      }
      
      // Get permission IDs
      const permissions = await prisma.permissions.findMany({
        where: {
          guard_name: 'web',
          name: { in: permissionsToAssign }
        }
      })
      
      console.log(`  Found ${permissions.length} permissions to assign`)
      
      if (permissions.length === 0) {
        console.log(`  ⚠️  No matching permissions found in database`)
        continue
      }
      
      // Delete existing permissions
      await prisma.role_has_permissions.deleteMany({
        where: { role_id: role.id }
      })
      
      // Assign new permissions
      const data = permissions.map(p => ({
        role_id: role.id,
        permission_id: p.id
      }))
      
      await prisma.role_has_permissions.createMany({
        data: data
      })
      
      console.log(`  ✅ Assigned ${data.length} permissions to "${role.name}"\n`)
    }
    
    console.log('✨ Done!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

assignDefaultPermissions()

