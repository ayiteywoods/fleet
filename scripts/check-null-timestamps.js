const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkForNullTimestamps() {
  try {
    console.log('🔍 Checking for null timestamps in all tables...')
    
    const tables = [
      'categories',
      'clusters', 
      'groups',
      'supervisors',
      'tags',
      'workshops',
      'mechanics',
      'permissions',
      'roles',
      'subsidiary',
      'vehicle_types'
    ]
    
    for (const table of tables) {
      try {
        const result = await prisma[table].findMany({
          where: {
            OR: [
              { created_at: null },
              { updated_at: null }
            ]
          },
          select: {
            id: true,
            ...(table === 'categories' ? { name: true } : {}),
            ...(table === 'clusters' ? { name: true } : {}),
            ...(table === 'groups' ? { name: true } : {}),
            ...(table === 'supervisors' ? { name: true } : {}),
            ...(table === 'tags' ? { name: true } : {}),
            ...(table === 'workshops' ? { name: true } : {}),
            ...(table === 'mechanics' ? { name: true } : {}),
            ...(table === 'permissions' ? { name: true } : {}),
            ...(table === 'roles' ? { name: true } : {}),
            ...(table === 'subsidiary' ? { name: true } : {}),
            ...(table === 'vehicle_types' ? { type: true } : {}),
            created_at: true,
            updated_at: true
          }
        })
        
        if (result.length > 0) {
          console.log(`\n❌ ${table.toUpperCase()} - Found ${result.length} records with null timestamps:`)
          result.forEach(record => {
            console.log(`  ID: ${record.id}, Created: ${record.created_at}, Updated: ${record.updated_at}`)
          })
        } else {
          console.log(`✅ ${table.toUpperCase()} - All timestamps are valid`)
        }
      } catch (error) {
        console.log(`⚠️  ${table.toUpperCase()} - Error checking: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking timestamps:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkForNullTimestamps()
