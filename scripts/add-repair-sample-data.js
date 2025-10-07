const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addRepairSampleData() {
  try {
    console.log('Adding repair sample data...')

    // First, check if we have vehicles, supervisors, workshops, and mechanics
    const vehicles = await prisma.vehicles.findMany({ take: 3 })
    const supervisors = await prisma.supervisors.findMany({ take: 2 })
    const workshops = await prisma.workshops.findMany({ take: 2 })
    const mechanics = await prisma.mechanics.findMany({ take: 2 })

    if (supervisors.length === 0) {
      console.log('No supervisors found. Creating sample supervisors...')
      await prisma.supervisors.createMany({
        data: [
          {
            name: 'John Supervisor',
            phone: '0241234567',
            email: 'john.supervisor@example.com',
            region: 'Greater Accra',
            district: 'Accra Central',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 1,
            updated_by: 1
          },
          {
            name: 'Jane Manager',
            phone: '0247654321',
            email: 'jane.manager@example.com',
            region: 'Greater Accra',
            district: 'East Legon',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 1,
            updated_by: 1
          }
        ]
      })
    }

    if (vehicles.length === 0) {
      console.log('No vehicles found. Creating sample vehicles...')
      await prisma.vehicles.createMany({
        data: [
          {
            reg_number: 'GR-1234-21',
            trim: 'Toyota Camry',
            year: 2021,
            color: 'White',
            status: 'active',
            spcode: 1,
            make_id: BigInt(1),
            type_id: BigInt(1),
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 1,
            updated_by: 1
          },
          {
            reg_number: 'GR-5678-22',
            trim: 'Honda Accord',
            year: 2022,
            color: 'Black',
            status: 'active',
            spcode: 1,
            make_id: BigInt(1),
            type_id: BigInt(1),
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 1,
            updated_by: 1
          }
        ]
      })
    }

    if (workshops.length === 0) {
      console.log('No workshops found. Creating sample workshops...')
      const existingSupervisors = await prisma.supervisors.findMany({ take: 2 })
      await prisma.workshops.createMany({
        data: [
          {
            name: 'Central Auto Workshop',
            region: 'Greater Accra',
            district: 'Accra Central',
            supervisor_id: existingSupervisors[0].id,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 1,
            updated_by: 1
          },
          {
            name: 'East Legon Auto Service',
            region: 'Greater Accra',
            district: 'East Legon',
            supervisor_id: existingSupervisors[1].id,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 1,
            updated_by: 1
          }
        ]
      })
    }

    if (mechanics.length === 0) {
      console.log('No mechanics found. Creating sample mechanics...')
      const existingWorkshops = await prisma.workshops.findMany({ take: 2 })
      await prisma.mechanics.createMany({
        data: [
          {
            name: 'John Mechanic',
            specialization: 'Engine Repair',
            region: 'Greater Accra',
            district: 'Accra Central',
            status: 'active',
            workshop_id: existingWorkshops[0].id,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 1,
            updated_by: 1
          },
          {
            name: 'Jane Technician',
            specialization: 'Brake System',
            region: 'Greater Accra',
            district: 'East Legon',
            status: 'active',
            workshop_id: existingWorkshops[1].id,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 1,
            updated_by: 1
          }
        ]
      })
    }

    // Get the created/existing data
    const existingSupervisors = await prisma.supervisors.findMany({ take: 2 })
    const existingVehicles = await prisma.vehicles.findMany({ take: 3 })
    const existingWorkshops = await prisma.workshops.findMany({ take: 2 })
    const existingMechanics = await prisma.mechanics.findMany({ take: 2 })

    // Add repair requests
    console.log('Adding repair requests...')
    const repairRequests = await prisma.repair_request.createMany({
      data: [
        {
          issue_desc: 'Engine overheating issue',
          urgency_level: 'high',
          region: 'Greater Accra',
          district: 'Accra',
          status: 'pending',
          workshop_id: existingWorkshops[0].id,
          vehicle_id: existingVehicles[0].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          issue_desc: 'Brake system malfunction',
          urgency_level: 'urgent',
          region: 'Greater Accra',
          district: 'Tema',
          status: 'in_progress',
          workshop_id: existingWorkshops[1].id,
          vehicle_id: existingVehicles[1].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          issue_desc: 'Transmission problem',
          urgency_level: 'medium',
          region: 'Ashanti',
          district: 'Kumasi',
          status: 'completed',
          workshop_id: existingWorkshops[0].id,
          vehicle_id: existingVehicles[0].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      ]
    })

    // Get the created repair requests
    const createdRepairRequests = await prisma.repair_request.findMany({ take: 3 })

    // Add repair schedules
    console.log('Adding repair schedules...')
    await prisma.repair_schedule.createMany({
      data: [
        {
          schedule_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          assigned_technician: existingMechanics[0].id,
          repair_request_id: createdRepairRequests[0].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          schedule_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          assigned_technician: existingMechanics[1].id,
          repair_request_id: createdRepairRequests[1].id,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      ]
    })

    console.log('✅ Repair sample data added successfully!')
    console.log(`- Added ${repairRequests.count || 3} repair requests`)
    console.log('- Added 2 repair schedules')

  } catch (error) {
    console.error('❌ Error adding repair sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addRepairSampleData()
