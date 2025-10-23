const { PrismaClient } = require('@prisma/client')

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function fixSpecificVehicles() {
  try {
    console.log('🔧 Fixing specific vehicles in production database...\n')
    
    // Based on the API response, these are the vehicles that need fixing:
    const vehiclesToFix = [
      { reg_number: 'AS-2020-19', current_trim: '2', new_trim: 'Altima' },
      { reg_number: 'GT 9454-13', current_trim: '1', new_trim: 'Camry Hybrid' },
      { reg_number: 'GX 2746-15', current_trim: '3', new_trim: 'Vitz' },
      { reg_number: 'GM 2036-16', current_trim: '2', new_trim: 'Altima' }
    ]
    
    for (const vehicle of vehiclesToFix) {
      console.log(`Fixing vehicle: ${vehicle.reg_number}`)
      
      // Find the vehicle
      const foundVehicle = await prisma.vehicles.findFirst({
        where: {
          reg_number: vehicle.reg_number
        }
      })
      
      if (foundVehicle) {
        console.log(`  Current trim: ${foundVehicle.trim}`)
        
        // Update the trim value
        await prisma.vehicles.update({
          where: { id: foundVehicle.id },
          data: { trim: vehicle.new_trim }
        })
        
        console.log(`  ✅ Updated to: ${vehicle.new_trim}`)
      } else {
        console.log(`  ❌ Vehicle not found`)
      }
      
      console.log('')
    }
    
    // Verify the changes
    console.log('🔍 Verifying changes...')
    const allVehicles = await prisma.vehicles.findMany({
      select: {
        reg_number: true,
        trim: true
      },
      orderBy: { reg_number: 'asc' }
    })
    
    console.log('\nAll vehicles in production database:')
    allVehicles.forEach(vehicle => {
      const isNumeric = /^\d+$/.test(vehicle.trim || '')
      console.log(`${vehicle.reg_number}: ${vehicle.trim} ${isNumeric ? '❌' : '✅'}`)
    })

  } catch (error) {
    console.error('❌ Error fixing specific vehicles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSpecificVehicles()
