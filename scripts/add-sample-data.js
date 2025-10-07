const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addSampleData() {
  try {
    console.log('🚀 Starting to add sample data...')

    // 1. Add sample vehicles
    console.log('📦 Adding sample vehicles...')
    const vehicles = [
      {
        id: BigInt(1),
        reg_number: 'GR-1234-21',
        trim: 'Toyota Camry LE',
        year: 2021,
        color: 'White',
        status: 'Active',
        spcode: 1,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        id: BigInt(2),
        reg_number: 'GR-5678-22',
        trim: 'Honda Accord Sport',
        year: 2022,
        color: 'Black',
        status: 'Active',
        spcode: 1,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        id: BigInt(3),
        reg_number: 'GR-9012-20',
        trim: 'Ford Explorer XLT',
        year: 2020,
        color: 'Silver',
        status: 'Inactive',
        spcode: 1,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        id: BigInt(4),
        reg_number: 'GR-3456-23',
        trim: 'Nissan Altima SV',
        year: 2023,
        color: 'Blue',
        status: 'Active',
        spcode: 1,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        id: BigInt(5),
        reg_number: 'GR-7890-19',
        trim: 'Chevrolet Malibu LT',
        year: 2019,
        color: 'Red',
        status: 'Maintenance',
        spcode: 1,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      }
    ]

    for (const vehicle of vehicles) {
      try {
        await prisma.vehicles.upsert({
          where: { id: vehicle.id },
          update: vehicle,
          create: vehicle
        })
        console.log(`✅ Vehicle ${vehicle.reg_number} added/updated`)
      } catch (error) {
        console.log(`⚠️ Vehicle ${vehicle.reg_number} already exists or error:`, error.message)
      }
    }

    // 2. Add sample drivers
    console.log('👨‍💼 Adding sample drivers...')
    const drivers = [
      {
        id: BigInt(1),
        name: 'John Mensah',
        phone: '+233241234567',
        license_number: 'DL-001-2021',
        license_category: 'B',
        license_expire: '2026-03-15',
        region: 'Greater Accra',
        district: 'Accra Metropolitan',
        status: 'Active',
        vehicle_id: BigInt(1),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(2),
        name: 'Sarah Asante',
        phone: '+233241234568',
        license_number: 'DL-002-2020',
        license_category: 'B',
        license_expire: '2025-08-20',
        region: 'Ashanti',
        district: 'Kumasi Metropolitan',
        status: 'Active',
        vehicle_id: BigInt(2),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(3),
        name: 'Kwame Osei',
        phone: '+233241234569',
        license_number: 'DL-003-2019',
        license_category: 'C',
        license_expire: '2024-12-10',
        region: 'Western',
        district: 'Takoradi',
        status: 'Inactive',
        vehicle_id: BigInt(3),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(4),
        name: 'Ama Serwaa',
        phone: '+233241234570',
        license_number: 'DL-004-2022',
        license_category: 'B',
        license_expire: '2027-06-30',
        region: 'Eastern',
        district: 'Koforidua',
        status: 'Active',
        vehicle_id: BigInt(4),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(5),
        name: 'Kofi Boateng',
        phone: '+233241234571',
        license_number: 'DL-005-2021',
        license_category: 'D',
        license_expire: '2026-01-15',
        region: 'Central',
        district: 'Cape Coast',
        status: 'Suspended',
        vehicle_id: BigInt(5),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    for (const driver of drivers) {
      try {
        await prisma.driver_operators.upsert({
          where: { id: driver.id },
          update: driver,
          create: driver
        })
        console.log(`✅ Driver ${driver.name} added/updated`)
      } catch (error) {
        console.log(`⚠️ Driver ${driver.name} already exists or error:`, error.message)
      }
    }

    // 3. Add sample insurance records
    console.log('🛡️ Adding sample insurance records...')
    const insuranceRecords = [
      {
        id: BigInt(1),
        policy_number: 'INS-001-2024',
        insurance_company: 'SIC Insurance',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        premium_amount: 2500.00,
        coverage_type: 'Comprehensive',
        notes: 'Full coverage with roadside assistance',
        vehicle_id: BigInt(1),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(2),
        policy_number: 'INS-002-2024',
        insurance_company: 'Vanguard Assurance',
        start_date: new Date('2024-02-15'),
        end_date: new Date('2025-02-14'),
        premium_amount: 3200.00,
        coverage_type: 'Third Party',
        notes: 'Basic third party coverage',
        vehicle_id: BigInt(2),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(3),
        policy_number: 'INS-003-2024',
        insurance_company: 'Metropolitan Insurance',
        start_date: new Date('2024-03-01'),
        end_date: new Date('2025-02-28'),
        premium_amount: 1800.00,
        coverage_type: 'Comprehensive',
        notes: 'Comprehensive coverage for commercial vehicle',
        vehicle_id: BigInt(3),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(4),
        policy_number: 'INS-004-2024',
        insurance_company: 'Enterprise Insurance',
        start_date: new Date('2024-04-10'),
        end_date: new Date('2025-04-09'),
        premium_amount: 2800.00,
        coverage_type: 'Comprehensive',
        notes: 'Full coverage with zero depreciation',
        vehicle_id: BigInt(4),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(5),
        policy_number: 'INS-005-2024',
        insurance_company: 'GLICO Insurance',
        start_date: new Date('2024-05-20'),
        end_date: new Date('2025-05-19'),
        premium_amount: 2200.00,
        coverage_type: 'Third Party',
        notes: 'Third party with fire and theft',
        vehicle_id: BigInt(5),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    for (const insurance of insuranceRecords) {
      try {
        await prisma.insurance.upsert({
          where: { id: insurance.id },
          update: insurance,
          create: insurance
        })
        console.log(`✅ Insurance ${insurance.policy_number} added/updated`)
      } catch (error) {
        console.log(`⚠️ Insurance ${insurance.policy_number} already exists or error:`, error.message)
      }
    }

    // 4. Add sample roadworthy records
    console.log('📋 Adding sample roadworthy records...')
    const roadworthyRecords = [
      {
        id: BigInt(1),
        company: 'DVLA',
        vehicle_number: 'GR-1234-21',
        vehicle_type: 'Sedan',
        date_issued: new Date('2024-01-15'),
        date_expired: new Date('2025-01-14'),
        roadworth_status: 'Valid',
        updated_by: 'John Mensah',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(2),
        company: 'DVLA',
        vehicle_number: 'GR-5678-22',
        vehicle_type: 'Sedan',
        date_issued: new Date('2024-02-20'),
        date_expired: new Date('2025-02-19'),
        roadworth_status: 'Valid',
        updated_by: 'Sarah Asante',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(3),
        company: 'DVLA',
        vehicle_number: 'GR-9012-20',
        vehicle_type: 'SUV',
        date_issued: new Date('2023-12-10'),
        date_expired: new Date('2024-12-09'),
        roadworth_status: 'Expired',
        updated_by: 'Kwame Osei',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(4),
        company: 'DVLA',
        vehicle_number: 'GR-3456-23',
        vehicle_type: 'Sedan',
        date_issued: new Date('2024-03-05'),
        date_expired: new Date('2025-03-04'),
        roadworth_status: 'Valid',
        updated_by: 'Ama Serwaa',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(5),
        company: 'DVLA',
        vehicle_number: 'GR-7890-19',
        vehicle_type: 'Sedan',
        date_issued: new Date('2024-01-30'),
        date_expired: new Date('2025-01-29'),
        roadworth_status: 'Valid',
        updated_by: 'Kofi Boateng',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    for (const roadworthy of roadworthyRecords) {
      try {
        await prisma.roadworthy.upsert({
          where: { id: roadworthy.id },
          update: roadworthy,
          create: roadworthy
        })
        console.log(`✅ Roadworthy ${roadworthy.vehicle_number} added/updated`)
      } catch (error) {
        console.log(`⚠️ Roadworthy ${roadworthy.vehicle_number} already exists or error:`, error.message)
      }
    }

    // 5. Add sample users (if they don't exist)
    console.log('👥 Adding sample users...')
    const users = [
      {
        id: BigInt(1),
        name: 'Admin User',
        email: 'admin@nerafleet.com',
        phone: '+233241234500',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(2),
        name: 'Fleet Manager',
        email: 'manager@nerafleet.com',
        phone: '+233241234501',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'manager',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(3),
        name: 'Operations Officer',
        email: 'operations@nerafleet.com',
        phone: '+233241234502',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'officer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    for (const user of users) {
      try {
        await prisma.users.upsert({
          where: { id: user.id },
          update: user,
          create: user
        })
        console.log(`✅ User ${user.name} added/updated`)
      } catch (error) {
        console.log(`⚠️ User ${user.name} already exists or error:`, error.message)
      }
    }

    console.log('🎉 Sample data added successfully!')
    console.log('\n📊 Summary:')
    console.log('- 5 Vehicles added')
    console.log('- 5 Drivers added')
    console.log('- 5 Insurance records added')
    console.log('- 5 Roadworthy records added')
    console.log('- 3 Users added')
    console.log('\n🔑 Login credentials:')
    console.log('- Email: admin@nerafleet.com, Password: password')
    console.log('- Email: manager@nerafleet.com, Password: password')
    console.log('- Email: operations@nerafleet.com, Password: password')

  } catch (error) {
    console.error('❌ Error adding sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleData()
