const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample fuel data
const sampleFuelLogs = [
  {
    refuel_date: new Date('2024-12-15'),
    quantity: 45.5,
    unit_cost: 12.50,
    total_cost: 568.75,
    mileage_before: 125000,
    mileage_after: 125045,
    fuel_type: 'Petrol',
    vendor: 'Shell',
    receipt_number: 'SH-2024-001234',
    notes: 'Regular refuel for city operations',
    vehicle_id: 16, // AG 2983 V
    driver_id: 2    // Osei Akoto
  },
  {
    refuel_date: new Date('2024-12-14'),
    quantity: 60.0,
    unit_cost: 12.30,
    total_cost: 738.00,
    mileage_before: 45000,
    mileage_after: 45060,
    fuel_type: 'Petrol',
    vendor: 'Total',
    receipt_number: 'TL-2024-005678',
    notes: 'Highway trip refuel',
    vehicle_id: 14, // GS 2438 23
    driver_id: 3    // John Mensah
  },
  {
    refuel_date: new Date('2024-12-13'),
    quantity: 35.2,
    unit_cost: 12.80,
    total_cost: 450.56,
    mileage_before: 78000,
    mileage_after: 78035,
    fuel_type: 'Petrol',
    vendor: 'GOIL',
    receipt_number: 'GL-2024-009012',
    notes: 'Urban delivery route',
    vehicle_id: 12, // GT-8990-25
    driver_id: 7    // Kofi Boateng
  },
  {
    refuel_date: new Date('2024-12-12'),
    quantity: 42.8,
    unit_cost: 12.40,
    total_cost: 530.72,
    mileage_before: 95000,
    mileage_after: 95043,
    fuel_type: 'Petrol',
    vendor: 'Shell',
    receipt_number: 'SH-2024-003456',
    notes: 'Client visit refuel',
    vehicle_id: 17, // GN 2398 20
    driver_id: 8    // Grace Adjei
  },
  {
    refuel_date: new Date('2024-12-11'),
    quantity: 38.5,
    unit_cost: 12.60,
    total_cost: 485.10,
    mileage_before: 124800,
    mileage_after: 124839,
    fuel_type: 'Petrol',
    vendor: 'Total',
    receipt_number: 'TL-2024-007890',
    notes: 'Maintenance trip',
    vehicle_id: 16, // AG 2983 V
    driver_id: 2    // Osei Akoto
  },
  {
    refuel_date: new Date('2024-12-10'),
    quantity: 55.0,
    unit_cost: 12.20,
    total_cost: 671.00,
    mileage_before: 44800,
    mileage_after: 44855,
    fuel_type: 'Petrol',
    vendor: 'GOIL',
    receipt_number: 'GL-2024-011234',
    notes: 'Long distance delivery',
    vehicle_id: 14, // GS 2438 23
    driver_id: 3    // John Mensah
  },
  {
    refuel_date: new Date('2024-12-09'),
    quantity: 33.7,
    unit_cost: 12.90,
    total_cost: 434.73,
    mileage_before: 77950,
    mileage_after: 77984,
    fuel_type: 'Petrol',
    vendor: 'Shell',
    receipt_number: 'SH-2024-005678',
    notes: 'City operations',
    vehicle_id: 12, // GT-8990-25
    driver_id: 7    // Kofi Boateng
  },
  {
    refuel_date: new Date('2024-12-08'),
    quantity: 40.2,
    unit_cost: 12.35,
    total_cost: 496.47,
    mileage_before: 94950,
    mileage_after: 94991,
    fuel_type: 'Petrol',
    vendor: 'Total',
    receipt_number: 'TL-2024-009012',
    notes: 'Regular service refuel',
    vehicle_id: 17, // GN 2398 20
    driver_id: 8    // Grace Adjei
  },
  {
    refuel_date: new Date('2024-12-07'),
    quantity: 47.3,
    unit_cost: 12.45,
    total_cost: 588.89,
    mileage_before: 124600,
    mileage_after: 124648,
    fuel_type: 'Petrol',
    vendor: 'GOIL',
    receipt_number: 'GL-2024-013456',
    notes: 'Weekend emergency trip',
    vehicle_id: 16, // AG 2983 V
    driver_id: 2    // Osei Akoto
  },
  {
    refuel_date: new Date('2024-12-06'),
    quantity: 52.8,
    unit_cost: 12.15,
    total_cost: 641.52,
    mileage_before: 44700,
    mileage_after: 44753,
    fuel_type: 'Petrol',
    vendor: 'Shell',
    receipt_number: 'SH-2024-007890',
    notes: 'Intercity delivery',
    vehicle_id: 14, // GS 2438 23
    driver_id: 3    // John Mensah
  },
  {
    refuel_date: new Date('2024-12-05'),
    quantity: 36.9,
    unit_cost: 12.75,
    total_cost: 470.48,
    mileage_before: 77900,
    mileage_after: 77937,
    fuel_type: 'Petrol',
    vendor: 'Total',
    receipt_number: 'TL-2024-011234',
    notes: 'Local pickup and delivery',
    vehicle_id: 12, // GT-8990-25
    driver_id: 7    // Kofi Boateng
  },
  {
    refuel_date: new Date('2024-12-04'),
    quantity: 44.1,
    unit_cost: 12.25,
    total_cost: 540.23,
    mileage_before: 94900,
    mileage_after: 94944,
    fuel_type: 'Petrol',
    vendor: 'GOIL',
    receipt_number: 'GL-2024-015678',
    notes: 'Client meeting trip',
    vehicle_id: 17, // GN 2398 20
    driver_id: 8    // Grace Adjei
  },
  {
    refuel_date: new Date('2024-12-03'),
    quantity: 41.6,
    unit_cost: 12.55,
    total_cost: 522.08,
    mileage_before: 124400,
    mileage_after: 124442,
    fuel_type: 'Petrol',
    vendor: 'Shell',
    receipt_number: 'SH-2024-009012',
    notes: 'Routine maintenance visit',
    vehicle_id: 16, // AG 2983 V
    driver_id: 2    // Osei Akoto
  },
  {
    refuel_date: new Date('2024-12-02'),
    quantity: 58.3,
    unit_cost: 12.10,
    total_cost: 705.43,
    mileage_before: 44600,
    mileage_after: 44659,
    fuel_type: 'Petrol',
    vendor: 'Total',
    receipt_number: 'TL-2024-013456',
    notes: 'Long haul delivery',
    vehicle_id: 14, // GS 2438 23
    driver_id: 3    // John Mensah
  },
  {
    refuel_date: new Date('2024-12-01'),
    quantity: 34.8,
    unit_cost: 12.85,
    total_cost: 447.18,
    mileage_before: 77850,
    mileage_after: 77885,
    fuel_type: 'Petrol',
    vendor: 'GOIL',
    receipt_number: 'GL-2024-017890',
    notes: 'Urban distribution',
    vehicle_id: 12, // GT-8990-25
    driver_id: 7    // Kofi Boateng
  }
];

async function addFuelSampleData() {
  try {
    console.log('Adding sample fuel data...');
    
    // Check if fuel logs already exist
    const existingLogs = await prisma.fuel_logs.count();
    console.log(`Found ${existingLogs} existing fuel logs. Adding more sample data...`);
    
    // Add sample fuel logs
    for (const fuelLog of sampleFuelLogs) {
      await prisma.fuel_logs.create({
        data: {
          ...fuelLog,
          vehicle_id: BigInt(fuelLog.vehicle_id),
          driver_id: BigInt(fuelLog.driver_id),
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      });
    }
    
    console.log(`Successfully added ${sampleFuelLogs.length} fuel log entries!`);
    
    // Display summary
    const totalCost = sampleFuelLogs.reduce((sum, log) => sum + log.total_cost, 0);
    const totalQuantity = sampleFuelLogs.reduce((sum, log) => sum + log.quantity, 0);
    
    console.log('\nSummary:');
    console.log(`Total fuel quantity: ${totalQuantity.toFixed(1)} liters`);
    console.log(`Total cost: $${totalCost.toFixed(2)}`);
    console.log(`Average cost per liter: $${(totalCost / totalQuantity).toFixed(2)}`);
    
  } catch (error) {
    console.error('Error adding fuel sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addFuelSampleData();