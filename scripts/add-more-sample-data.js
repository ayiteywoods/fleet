const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addMoreSampleData() {
  try {
    console.log('🚀 Adding more sample data...')

    // Get existing vehicles
    const vehicles = await prisma.vehicles.findMany()
    console.log(`📦 Found ${vehicles.length} vehicles`)

    if (vehicles.length === 0) {
      console.log('❌ No vehicles found. Please add vehicles first.')
      return
    }

    // Add more drivers
    console.log('👨‍💼 Adding more drivers...')
    const drivers = [
      {
        name: 'John Mensah',
        phone: '+233241234567',
        license_number: 'DL-001-2021',
        license_category: 'B',
        license_expire: '2026-03-15',
        region: 'Greater Accra',
        district: 'Accra Metropolitan',
        status: 'Active',
        vehicle_id: vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sarah Asante',
        phone: '+233241234568',
        license_number: 'DL-002-2020',
        license_category: 'B',
        license_expire: '2025-08-20',
        region: 'Ashanti',
        district: 'Kumasi Metropolitan',
        status: 'Active',
        vehicle_id: vehicles[1]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Kwame Osei',
        phone: '+233241234569',
        license_number: 'DL-003-2019',
        license_category: 'C',
        license_expire: '2024-12-10',
        region: 'Western',
        district: 'Takoradi',
        status: 'Inactive',
        vehicle_id: vehicles[2]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ama Serwaa',
        phone: '+233241234570',
        license_number: 'DL-004-2022',
        license_category: 'B',
        license_expire: '2027-06-30',
        region: 'Eastern',
        district: 'Koforidua',
        status: 'Active',
        vehicle_id: vehicles[3]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Kofi Boateng',
        phone: '+233241234571',
        license_number: 'DL-005-2021',
        license_category: 'D',
        license_expire: '2026-01-15',
        region: 'Central',
        district: 'Cape Coast',
        status: 'Suspended',
        vehicle_id: vehicles[4]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Grace Adjei',
        phone: '+233241234572',
        license_number: 'DL-006-2023',
        license_category: 'B',
        license_expire: '2028-09-15',
        region: 'Volta',
        district: 'Ho',
        status: 'Active',
        vehicle_id: vehicles[5]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Michael Darko',
        phone: '+233241234573',
        license_number: 'DL-007-2020',
        license_category: 'C',
        license_expire: '2025-11-30',
        region: 'Northern',
        district: 'Tamale',
        status: 'Active',
        vehicle_id: vehicles[6]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Patience Owusu',
        phone: '+233241234574',
        license_number: 'DL-008-2022',
        license_category: 'B',
        license_expire: '2027-04-20',
        region: 'Brong-Ahafo',
        district: 'Sunyani',
        status: 'Active',
        vehicle_id: vehicles[7]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    for (const driver of drivers) {
      try {
        await prisma.driver_operators.create({ data: driver })
        console.log(`✅ Driver ${driver.name} added`)
      } catch (error) {
        console.log(`⚠️ Driver ${driver.name} error:`, error.message)
      }
    }

    // Add more insurance records
    console.log('🛡️ Adding more insurance records...')
    const insuranceRecords = [
      {
        policy_number: 'INS-001-2024',
        insurance_company: 'SIC Insurance',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        premium_amount: 2500.00,
        coverage_type: 'Comprehensive',
        notes: 'Full coverage with roadside assistance',
        vehicle_id: vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        policy_number: 'INS-002-2024',
        insurance_company: 'Vanguard Assurance',
        start_date: new Date('2024-02-15'),
        end_date: new Date('2025-02-14'),
        premium_amount: 3200.00,
        coverage_type: 'Third Party',
        notes: 'Basic third party coverage',
        vehicle_id: vehicles[1]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        policy_number: 'INS-003-2024',
        insurance_company: 'Metropolitan Insurance',
        start_date: new Date('2024-03-01'),
        end_date: new Date('2025-02-28'),
        premium_amount: 1800.00,
        coverage_type: 'Comprehensive',
        notes: 'Comprehensive coverage for commercial vehicle',
        vehicle_id: vehicles[2]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        policy_number: 'INS-004-2024',
        insurance_company: 'Enterprise Insurance',
        start_date: new Date('2024-04-10'),
        end_date: new Date('2025-04-09'),
        premium_amount: 2800.00,
        coverage_type: 'Comprehensive',
        notes: 'Full coverage with zero depreciation',
        vehicle_id: vehicles[3]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        policy_number: 'INS-005-2024',
        insurance_company: 'GLICO Insurance',
        start_date: new Date('2024-05-20'),
        end_date: new Date('2025-05-19'),
        premium_amount: 2200.00,
        coverage_type: 'Third Party',
        notes: 'Third party with fire and theft',
        vehicle_id: vehicles[4]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        policy_number: 'INS-006-2024',
        insurance_company: 'SIC Insurance',
        start_date: new Date('2024-06-01'),
        end_date: new Date('2025-05-31'),
        premium_amount: 1950.00,
        coverage_type: 'Comprehensive',
        notes: 'Standard comprehensive coverage',
        vehicle_id: vehicles[5]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        policy_number: 'INS-007-2024',
        insurance_company: 'Vanguard Assurance',
        start_date: new Date('2024-07-15'),
        end_date: new Date('2025-07-14'),
        premium_amount: 3100.00,
        coverage_type: 'Comprehensive',
        notes: 'Premium comprehensive with towing',
        vehicle_id: vehicles[6]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        policy_number: 'INS-008-2024',
        insurance_company: 'Metropolitan Insurance',
        start_date: new Date('2024-08-20'),
        end_date: new Date('2025-08-19'),
        premium_amount: 1650.00,
        coverage_type: 'Third Party',
        notes: 'Basic third party coverage',
        vehicle_id: vehicles[7]?.id || vehicles[0].id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    for (const insurance of insuranceRecords) {
      try {
        await prisma.insurance.create({ data: insurance })
        console.log(`✅ Insurance ${insurance.policy_number} added`)
      } catch (error) {
        console.log(`⚠️ Insurance ${insurance.policy_number} error:`, error.message)
      }
    }

    // Add more roadworthy records
    console.log('📋 Adding more roadworthy records...')
    const roadworthyRecords = [
      {
        id: BigInt(Date.now()),
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
        id: BigInt(Date.now() + 1),
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
        id: BigInt(Date.now() + 2),
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
        id: BigInt(Date.now() + 3),
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
        id: BigInt(Date.now() + 4),
        company: 'DVLA',
        vehicle_number: 'GR-7890-19',
        vehicle_type: 'Sedan',
        date_issued: new Date('2024-01-30'),
        date_expired: new Date('2025-01-29'),
        roadworth_status: 'Valid',
        updated_by: 'Kofi Boateng',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(Date.now() + 5),
        company: 'DVLA',
        vehicle_number: 'GR-2468-24',
        vehicle_type: 'Hatchback',
        date_issued: new Date('2024-04-10'),
        date_expired: new Date('2025-04-09'),
        roadworth_status: 'Valid',
        updated_by: 'Grace Adjei',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(Date.now() + 6),
        company: 'DVLA',
        vehicle_number: 'GR-1357-21',
        vehicle_type: 'SUV',
        date_issued: new Date('2024-05-15'),
        date_expired: new Date('2025-05-14'),
        roadworth_status: 'Valid',
        updated_by: 'Michael Darko',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: BigInt(Date.now() + 7),
        company: 'DVLA',
        vehicle_number: 'GR-9753-22',
        vehicle_type: 'Sedan',
        date_issued: new Date('2024-06-20'),
        date_expired: new Date('2025-06-19'),
        roadworth_status: 'Valid',
        updated_by: 'Patience Owusu',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    for (const roadworthy of roadworthyRecords) {
      try {
        await prisma.roadworthy.create({ data: roadworthy })
        console.log(`✅ Roadworthy ${roadworthy.vehicle_number} added`)
      } catch (error) {
        console.log(`⚠️ Roadworthy ${roadworthy.vehicle_number} error:`, error.message)
      }
    }

    // Final count
    const finalVehicles = await prisma.vehicles.findMany()
    const finalDrivers = await prisma.driver_operators.findMany()
    const finalInsurance = await prisma.insurance.findMany()
    const finalRoadworthy = await prisma.roadworthy.findMany()
    const finalUsers = await prisma.users.findMany()

    console.log('\n🎉 More sample data added successfully!')
    console.log('\n📊 Final data count:')
    console.log(`- Vehicles: ${finalVehicles.length}`)
    console.log(`- Drivers: ${finalDrivers.length}`)
    console.log(`- Insurance: ${finalInsurance.length}`)
    console.log(`- Roadworthy: ${finalRoadworthy.length}`)
    console.log(`- Users: ${finalUsers.length}`)

  } catch (error) {
    console.error('❌ Error adding more sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMoreSampleData()
