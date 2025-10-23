const { PrismaClient } = require('@prisma/client')

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testProductionDB() {
  try {
    console.log('🔍 Testing production database connection...\n')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to production database')
    
    // Get a few vehicles to see their trim values
    const vehicles = await prisma.vehicles.findMany({
      take: 5,
      select: {
        id: true,
        reg_number: true,
        trim: true,
        vehicle_makes: {
          select: {
            name: true
          }
        }
      },
      orderBy: { id: 'asc' }
    })
    
    console.log(`\n📊 Sample vehicles from production database:`)
    vehicles.forEach(vehicle => {
      const isNumeric = /^\d+$/.test(vehicle.trim || '')
      console.log(`${vehicle.reg_number}: ${vehicle.trim} (${vehicle.vehicle_makes?.name}) ${isNumeric ? '❌' : '✅'}`)
    })
    
    // Check if there are any vehicles with numeric trim
    const numericTrimCount = await prisma.vehicles.count({
      where: {
        trim: {
          in: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
        }
      }
    })
    
    console.log(`\n🔢 Vehicles with numeric trim values: ${numericTrimCount}`)
    
    // Get total vehicle count
    const totalVehicles = await prisma.vehicles.count()
    console.log(`📊 Total vehicles in database: ${totalVehicles}`)

  } catch (error) {
    console.error('❌ Error testing production database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProductionDB()
