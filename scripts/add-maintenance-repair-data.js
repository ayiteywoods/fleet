const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addSampleData() {
  try {
    console.log('Adding sample maintenance and repair data...')

    // First, let's check if we have vehicles to reference
    const vehicles = await prisma.vehicles.findMany()
    console.log(`Found ${vehicles.length} vehicles`)

    if (vehicles.length === 0) {
      console.log('No vehicles found. Please add vehicles first.')
      return
    }

    // Add maintenance records
    const maintenanceRecords = [
      {
        service_date: new Date('2024-01-15'),
        cost: 250.00,
        status: 'completed',
        service_details: 'Regular oil change and filter replacement',
        service_type: 'Oil Change',
        mileage_at_service: 15000,
        parts_replaced: 'Oil filter, Engine oil',
        vehicle_id: vehicles[0].id,
        mechanic_id: BigInt(1),
        workshop_id: BigInt(1),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        service_date: new Date('2024-02-10'),
        cost: 450.00,
        status: 'completed',
        service_details: 'Brake pad replacement and brake fluid check',
        service_type: 'Brake Service',
        mileage_at_service: 18000,
        parts_replaced: 'Brake pads, Brake fluid',
        vehicle_id: vehicles[1]?.id || vehicles[0].id,
        mechanic_id: BigInt(2),
        workshop_id: BigInt(1),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        service_date: new Date('2024-03-05'),
        cost: 320.00,
        status: 'completed',
        service_details: 'Air filter and cabin filter replacement',
        service_type: 'Filter Service',
        mileage_at_service: 22000,
        parts_replaced: 'Air filter, Cabin filter',
        vehicle_id: vehicles[2]?.id || vehicles[0].id,
        mechanic_id: BigInt(1),
        workshop_id: BigInt(2),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        service_date: new Date('2024-03-20'),
        cost: 180.00,
        status: 'completed',
        service_details: 'Scheduled tire rotation and alignment check',
        service_type: 'Tire Service',
        mileage_at_service: 25000,
        parts_replaced: null,
        vehicle_id: vehicles[3]?.id || vehicles[0].id,
        mechanic_id: BigInt(3),
        workshop_id: BigInt(1),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        service_date: new Date('2024-04-12'),
        cost: 650.00,
        status: 'completed',
        service_details: 'Engine diagnostic and transmission service',
        service_type: 'Engine Service',
        mileage_at_service: 30000,
        parts_replaced: 'Transmission fluid, Spark plugs',
        vehicle_id: vehicles[4]?.id || vehicles[0].id,
        mechanic_id: BigInt(2),
        workshop_id: BigInt(2),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      }
    ]

    for (const record of maintenanceRecords) {
      try {
        await prisma.maintenance_history.create({
          data: record
        })
        console.log(`Added maintenance record for vehicle ${record.vehicle_id}`)
      } catch (error) {
        console.error(`Error adding maintenance record:`, error.message)
      }
    }

    // Add repair records
    const repairRecords = [
      {
        service_date: new Date('2024-01-20'),
        cost: 850.00,
        status: 'completed',
        vehicle_id: vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        service_date: new Date('2024-02-15'),
        cost: 1200.00,
        status: 'completed',
        vehicle_id: vehicles[1]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        service_date: new Date('2024-03-10'),
        cost: 450.00,
        status: 'completed',
        vehicle_id: vehicles[2]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        service_date: new Date('2024-03-25'),
        cost: 750.00,
        status: 'completed',
        vehicle_id: vehicles[3]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        service_date: new Date('2024-04-18'),
        cost: 1500.00,
        status: 'completed',
        vehicle_id: vehicles[4]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      }
    ]

    for (const record of repairRecords) {
      try {
        await prisma.repair_history.create({
          data: record
        })
        console.log(`Added repair record for vehicle ${record.vehicle_id}`)
      } catch (error) {
        console.error(`Error adding repair record:`, error.message)
      }
    }

    console.log('Sample maintenance and repair data added successfully!')
  } catch (error) {
    console.error('Error adding sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleData()
