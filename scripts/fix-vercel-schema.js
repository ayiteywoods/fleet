const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function fixConstraintsAndSchema() {
  try {
    console.log('🔧 Fixing foreign key constraints...')
    
    // Disable foreign key checks temporarily
    await prisma.$executeRaw`SET session_replication_role = replica;`
    
    // Fix maintenance_history records with invalid foreign keys
    await prisma.$executeRaw`
      UPDATE maintenance_history 
      SET mechanic_id = NULL 
      WHERE mechanic_id IS NOT NULL 
      AND mechanic_id NOT IN (SELECT id FROM mechanics)
    `
    
    await prisma.$executeRaw`
      UPDATE maintenance_history 
      SET workshop_id = NULL 
      WHERE workshop_id IS NOT NULL 
      AND workshop_id NOT IN (SELECT id FROM workshops)
    `
    
    await prisma.$executeRaw`
      UPDATE maintenance_history 
      SET vehicle_id = NULL 
      WHERE vehicle_id IS NOT NULL 
      AND vehicle_id NOT IN (SELECT id FROM vehicles)
    `
    
    // Fix other tables
    await prisma.$executeRaw`
      UPDATE vehicles 
      SET spcode = NULL 
      WHERE spcode IS NOT NULL 
      AND spcode NOT IN (SELECT id FROM subsidiary)
    `
    
    await prisma.$executeRaw`
      UPDATE driver_operators 
      SET spcode = NULL 
      WHERE spcode IS NOT NULL 
      AND spcode NOT IN (SELECT id FROM subsidiary)
    `
    
    // Re-enable foreign key checks
    await prisma.$executeRaw`SET session_replication_role = DEFAULT;`
    
    console.log('✅ Foreign key constraints fixed!')
    
    // Now add missing columns to clusters table
    console.log('🔧 Adding missing columns to clusters table...')
    
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
    
    console.log('🎉 Schema fixes completed successfully!')
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixConstraintsAndSchema()
