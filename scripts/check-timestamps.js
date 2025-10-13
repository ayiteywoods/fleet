const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTimestamps() {
  try {
    console.log('🔍 Checking timestamps in all tables...')
    
    // Check categories
    const categories = await prisma.categories.findMany({
      select: { id: true, name: true, created_at: true, updated_at: true }
    })
    console.log(`\n📋 Categories (${categories.length} records):`)
    categories.forEach(cat => {
      console.log(`  ID: ${cat.id}, Name: ${cat.name}, Created: ${cat.created_at}, Updated: ${cat.updated_at}`)
    })
    
    // Check clusters
    const clusters = await prisma.clusters.findMany({
      select: { id: true, name: true, created_at: true, updated_at: true }
    })
    console.log(`\n📋 Clusters (${clusters.length} records):`)
    clusters.forEach(cluster => {
      console.log(`  ID: ${cluster.id}, Name: ${cluster.name}, Created: ${cluster.created_at}, Updated: ${cluster.updated_at}`)
    })
    
    // Check vehicle_types
    const vehicleTypes = await prisma.vehicle_types.findMany({
      select: { id: true, type: true, created_at: true, updated_at: true }
    })
    console.log(`\n📋 Vehicle Types (${vehicleTypes.length} records):`)
    vehicleTypes.forEach(vt => {
      console.log(`  ID: ${vt.id}, Type: ${vt.type}, Created: ${vt.created_at}, Updated: ${vt.updated_at}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking timestamps:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTimestamps()
