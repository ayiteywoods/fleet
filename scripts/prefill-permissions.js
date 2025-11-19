const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const guardName = 'web'

const baseActions = ['view', 'add', 'edit', 'delete', 'activate', 'suspend']

const modules = [
  'driver',
  'driver roles',
  'fuel',
  'fuel log',
  'fuel request',
  'fuel expense',
  'insurance',
  'vehicles',
  'vehicle profile',
  'vehicle dispatch',
  'vehicle reservation',
  'vehicle types',
  'vehicle makes',
  'vehicle models',
  'maintenance',
  'maintenance schedule',
  'repair',
  'repair request',
  'roadworthy',
  'settings',
  'general settings',
  'security settings',
  'notification settings',
  'appearance settings',
  'system settings',
  'workshops',
  'reports',
  'user',
  'roles',
  'permissions',
  'categories',
  'clusters',
  'companies',
  'groups',
  'subsidiary',
  'mechanics',
  'supervisors',
  'tags',
  'spare parts',
  'spare parts request',
  'spare parts dispatch',
  'spare parts inventory',
  'spare parts receipt'
]

async function syncSequence() {
  try {
    await prisma.$executeRawUnsafe(`SELECT setval(
      pg_get_serial_sequence('"permissions"', 'id'),
      COALESCE((SELECT MAX(id) FROM "permissions"), 0)
    )`)
  } catch (error) {
    console.warn('Could not sync permissions id sequence:', error.message)
  }
}

async function main() {
  await syncSequence()

  const permissions = modules.flatMap((entity) =>
    baseActions.map((action) => ({
      name: `${action} ${entity}`,
      guard_name: guardName
    }))
  )

  for (const permission of permissions) {
    await prisma.permissions.upsert({
      where: {
        name_guard_name: {
          name: permission.name,
          guard_name: guardName
        }
      },
      update: {},
      create: {
        name: permission.name,
        guard_name: permission.guard_name
      }
    })
  }

  console.log(`Upserted ${permissions.length} permissions.`)
}

main()
  .catch((error) => {
    console.error('Error pre-filling permissions:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


