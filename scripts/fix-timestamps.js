const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixTimestamps() {
  try {
    console.log('🔄 Fixing timestamps for all tables...')
    
    const currentTime = new Date()
    
    // Fix categories
    const categoriesResult = await prisma.categories.updateMany({
      where: {
        OR: [
          { created_at: null },
          { updated_at: null }
        ]
      },
      data: {
        created_at: currentTime,
        updated_at: currentTime
      }
    })
    console.log(`✅ Updated ${categoriesResult.count} categories`)
    
    // Fix clusters
    const clustersResult = await prisma.clusters.updateMany({
      where: {
        OR: [
          { created_at: null },
          { updated_at: null }
        ]
      },
      data: {
        created_at: currentTime,
        updated_at: currentTime
      }
    })
    console.log(`✅ Updated ${clustersResult.count} clusters`)
    
    // Fix groups
    const groupsResult = await prisma.groups.updateMany({
      where: {
        OR: [
          { created_at: null },
          { updated_at: null }
        ]
      },
      data: {
        created_at: currentTime,
        updated_at: currentTime
      }
    })
    console.log(`✅ Updated ${groupsResult.count} groups`)
    
    // Fix supervisors
    const supervisorsResult = await prisma.supervisors.updateMany({
      where: {
        OR: [
          { created_at: null },
          { updated_at: null }
        ]
      },
      data: {
        created_at: currentTime,
        updated_at: currentTime
      }
    })
    console.log(`✅ Updated ${supervisorsResult.count} supervisors`)
    
    // Fix tags
    const tagsResult = await prisma.tags.updateMany({
      where: {
        OR: [
          { created_at: null },
          { updated_at: null }
        ]
      },
      data: {
        created_at: currentTime,
        updated_at: currentTime
      }
    })
    console.log(`✅ Updated ${tagsResult.count} tags`)
    
    // Fix workshops
    const workshopsResult = await prisma.workshops.updateMany({
      where: {
        OR: [
          { created_at: null },
          { updated_at: null }
        ]
      },
      data: {
        created_at: currentTime,
        updated_at: currentTime
      }
    })
    console.log(`✅ Updated ${workshopsResult.count} workshops`)
    
    // Fix mechanics
    const mechanicsResult = await prisma.mechanics.updateMany({
      where: {
        OR: [
          { created_at: null },
          { updated_at: null }
        ]
      },
      data: {
        created_at: currentTime,
        updated_at: currentTime
      }
    })
    console.log(`✅ Updated ${mechanicsResult.count} mechanics`)
    
    // Fix permissions
    const permissionsResult = await prisma.permissions.updateMany({
      where: {
        OR: [
          { created_at: null },
          { updated_at: null }
        ]
      },
      data: {
        created_at: currentTime,
        updated_at: currentTime
      }
    })
    console.log(`✅ Updated ${permissionsResult.count} permissions`)
    
    // Fix roles
    const rolesResult = await prisma.roles.updateMany({
      where: {
        OR: [
          { created_at: null },
          { updated_at: null }
        ]
      },
      data: {
        created_at: currentTime,
        updated_at: currentTime
      }
    })
    console.log(`✅ Updated ${rolesResult.count} roles`)
    
    // Fix subsidiary
    const subsidiaryResult = await prisma.subsidiary.updateMany({
      where: {
        OR: [
          { created_at: null },
          { updated_at: null }
        ]
      },
      data: {
        created_at: currentTime,
        updated_at: currentTime
      }
    })
    console.log(`✅ Updated ${subsidiaryResult.count} subsidiary records`)
    
    // Fix vehicle_types
    const vehicleTypesResult = await prisma.vehicle_types.updateMany({
      where: {
        OR: [
          { created_at: null },
          { updated_at: null }
        ]
      },
      data: {
        created_at: currentTime,
        updated_at: currentTime
      }
    })
    console.log(`✅ Updated ${vehicleTypesResult.count} vehicle types`)
    
    console.log('🎉 All timestamps have been fixed!')
    
  } catch (error) {
    console.error('❌ Error fixing timestamps:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixTimestamps()
