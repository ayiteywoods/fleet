const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function testDatabase() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['error']
  });
  
  try {
    const testResult = await prisma.$queryRaw`SELECT 1 as test`;
    const userCount = await prisma.users.count();
    
    console.log('✅ Database connection successful!');
    console.log('Test result:', testResult);
    console.log('User count:', userCount);
    
    return {
      success: true,
      testResult,
      userCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabase().then(result => {
  console.log('\nFinal result:', JSON.stringify(result, null, 2));
}).catch(error => {
  console.error('Script error:', error);
});
