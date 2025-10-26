import { PrismaClient } from '@prisma/client'

// Clear any existing global Prisma client to force fresh initialization
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Force disconnect and clear any existing client
if (globalForPrisma.prisma) {
  console.log('Clearing existing Prisma client...')
  globalForPrisma.prisma.$disconnect()
  delete globalForPrisma.prisma
}

// Create a completely fresh Prisma client instance
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Don't cache the client in development to avoid stale connections
if (process.env.NODE_ENV !== 'production') {
  console.log('Development mode: Not caching Prisma client')
  // globalForPrisma.prisma = prisma
}
