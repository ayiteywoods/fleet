const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to clusters table...')
    
    // Add missing columns to clusters table
    try {
      await prisma.$executeRaw`ALTER TABLE clusters ADD COLUMN IF NOT EXISTS name VARCHAR(255);`
      console.log('✅ Added name column')
    } catch (error) {
      console.log('Name column already exists or error:', error.message)
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE clusters ADD COLUMN IF NOT EXISTS description TEXT;`
      console.log('✅ Added description column')
    } catch (error) {
      console.log('Description column already exists or error:', error.message)
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE clusters ADD COLUMN IF NOT EXISTS notes TEXT;`
      console.log('✅ Added notes column')
    } catch (error) {
      console.log('Notes column already exists or error:', error.message)
    }
    
    // Update existing clusters with default values
    await prisma.$executeRaw`
      UPDATE clusters 
      SET name = 'Cluster ' || id::text 
      WHERE name IS NULL
    `
    
    console.log('🎉 Missing columns added successfully!')
    
    // Test creating a cluster
    console.log('🧪 Testing cluster creation...')
    const testCluster = await prisma.clusters.create({
      data: {
        name: 'Test Cluster',
        description: 'Test Description',
        notes: 'Test Notes'
      }
    })
    console.log('✅ Test cluster created:', testCluster)
    
  } catch (error) {
    console.error('❌ Error adding columns:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMissingColumns()
