const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addFuelSampleData() {
  try {
    console.log('Adding fuel sample data...')

    // Ensure vehicles and drivers exist
    const vehicles = await prisma.vehicles.findMany({ take: 5 })
    const drivers = await prisma.driver_operators.findMany({ take: 5 })
    
    if (vehicles.length === 0) {
      console.error('No vehicles found. Please add vehicles first.')
      return
    }
    
    if (drivers.length === 0) {
      console.error('No drivers found. Please add drivers first.')
      return
    }

    // Add fuel logs
    console.log('Adding fuel logs...')
    const fuelLogs = await prisma.fuel_logs.createMany({
      data: [
        {
          refuel_date: new Date('2025-01-15'),
          quantity: 50.0,
          unit_cost: 12.50,
          total_cost: 625.00,
          mileage_before: 15000,
          mileage_after: 15120,
          fuel_type: 'Petrol',
          vendor: 'Shell Ghana',
          receipt_number: 'SH001234',
          notes: 'Regular refuel for daily operations',
          vehicle_id: vehicles[0].id,
          driver_id: drivers[0].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
        {
          refuel_date: new Date('2025-01-16'),
          quantity: 45.5,
          unit_cost: 12.75,
          total_cost: 580.13,
          mileage_before: 15120,
          mileage_after: 15200,
          fuel_type: 'Petrol',
          vendor: 'Total Ghana',
          receipt_number: 'TG002345',
          notes: 'Highway trip refuel',
          vehicle_id: vehicles[1].id,
          driver_id: drivers[1].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
        {
          refuel_date: new Date('2025-01-17'),
          quantity: 60.0,
          unit_cost: 11.80,
          total_cost: 708.00,
          mileage_before: 20000,
          mileage_after: 20150,
          fuel_type: 'Diesel',
          vendor: 'GOIL',
          receipt_number: 'GO003456',
          notes: 'Fleet maintenance refuel',
          vehicle_id: vehicles[2].id,
          driver_id: drivers[2].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
        {
          refuel_date: new Date('2025-01-18'),
          quantity: 35.0,
          unit_cost: 13.20,
          total_cost: 462.00,
          mileage_before: 8500,
          mileage_after: 8580,
          fuel_type: 'Petrol',
          vendor: 'Shell Ghana',
          receipt_number: 'SH004567',
          notes: 'City delivery refuel',
          vehicle_id: vehicles[3].id,
          driver_id: drivers[3].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
        {
          refuel_date: new Date('2025-01-19'),
          quantity: 55.0,
          unit_cost: 12.00,
          total_cost: 660.00,
          mileage_before: 25000,
          mileage_after: 25120,
          fuel_type: 'Diesel',
          vendor: 'Total Ghana',
          receipt_number: 'TG005678',
          notes: 'Long distance trip refuel',
          vehicle_id: vehicles[4].id,
          driver_id: drivers[4].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        }
      ],
      skipDuplicates: true,
    })

    // Add fuel requests
    console.log('Adding fuel requests...')
    const fuelRequests = await prisma.fuel_request.createMany({
      data: [
        {
          justification: 'Emergency fuel request for urgent delivery',
          quantity: 30.0,
          unit_cost: 12.50,
          total_cost: 375.00,
          status: 'approved',
          vehicle_id: vehicles[0].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
        {
          justification: 'Regular fuel request for weekly operations',
          quantity: 50.0,
          unit_cost: 12.75,
          total_cost: 637.50,
          status: 'pending',
          vehicle_id: vehicles[1].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
        {
          justification: 'Fuel request for maintenance vehicle',
          quantity: 40.0,
          unit_cost: 11.80,
          total_cost: 472.00,
          status: 'approved',
          vehicle_id: vehicles[2].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
        {
          justification: 'Fuel request for city operations',
          quantity: 25.0,
          unit_cost: 13.20,
          total_cost: 330.00,
          status: 'rejected',
          vehicle_id: vehicles[3].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
        {
          justification: 'Fuel request for long distance trip',
          quantity: 60.0,
          unit_cost: 12.00,
          total_cost: 720.00,
          status: 'pending',
          vehicle_id: vehicles[4].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        }
      ],
      skipDuplicates: true,
    })

    // Add fuel expense logs
    console.log('Adding fuel expense logs...')
    const fuelRequestsForExpense = await prisma.fuel_request.findMany({ take: 3 })
    
    if (fuelRequestsForExpense.length > 0) {
      const fuelExpenseLogs = await prisma.fuel_expense_log.createMany({
        data: [
          {
            vendor: 'Shell Ghana',
            payment_method: 'Card',
            fuel_request_id: fuelRequestsForExpense[0].id,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 1,
            updated_by: 1,
          },
          {
            vendor: 'Total Ghana',
            payment_method: 'Cash',
            fuel_request_id: fuelRequestsForExpense[1].id,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 1,
            updated_by: 1,
          },
          {
            vendor: 'GOIL',
            payment_method: 'Bank Transfer',
            fuel_request_id: fuelRequestsForExpense[2].id,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 1,
            updated_by: 1,
          }
        ],
        skipDuplicates: true,
      })
      console.log(`✅ Fuel expense logs sample data added successfully!`)
      console.log(`- Added ${fuelExpenseLogs.count} fuel expense logs`)
    }

    console.log(`✅ Fuel sample data added successfully!`)
    console.log(`- Added ${fuelLogs.count} fuel logs`)
    console.log(`- Added ${fuelRequests.count} fuel requests`)
  } catch (error) {
    console.error('Error adding fuel sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addFuelSampleData()
