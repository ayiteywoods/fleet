const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addMaintenanceScheduleData() {
  try {
    console.log('Adding maintenance schedule sample data...')

    // First, check if we have vehicles
    const vehicles = await prisma.vehicles.findMany({ take: 5 })
    
    if (vehicles.length === 0) {
      console.log('No vehicles found. Please add vehicles first.')
      return
    }

    // Check if maintenance schedules already exist
    const existingSchedules = await prisma.maintenance_schedule.findMany({ take: 1 })
    
    if (existingSchedules.length > 0) {
      console.log('Maintenance schedules already exist. Skipping...')
      return
    }

    // Add maintenance schedules
    console.log('Adding maintenance schedules...')
    const maintenanceSchedules = await prisma.maintenance_schedule.createMany({
      data: [
        {
          due_date: new Date('2025-01-15'),
          vehicle_id: vehicles[0].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          due_date: new Date('2025-01-20'),
          vehicle_id: vehicles[1]?.id || vehicles[0].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          due_date: new Date('2025-01-25'),
          vehicle_id: vehicles[2]?.id || vehicles[0].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          due_date: new Date('2025-02-01'),
          vehicle_id: vehicles[3]?.id || vehicles[0].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          due_date: new Date('2025-02-10'),
          vehicle_id: vehicles[4]?.id || vehicles[0].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      ]
    })

    console.log('✅ Maintenance schedule sample data added successfully!')
    console.log(`- Added ${maintenanceSchedules.count} maintenance schedules`)

  } catch (error) {
    console.error('Error adding maintenance schedule data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMaintenanceScheduleData()
