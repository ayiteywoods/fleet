const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseAndUsers() {
  try {
    console.log('🔍 Checking database connection to fleet2db...\n');
    
    // Test database connection
    const userCount = await prisma.users.count();
    console.log('✅ Database connection successful!');
    console.log(`📊 Total users in fleet2db: ${userCount}\n`);
    
    if (userCount > 0) {
      console.log('👥 Available users for login:');
      console.log('=====================================');
      
      const users = await prisma.users.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          is_active: true
        }
      });
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Phone: ${user.phone || 'N/A'}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.is_active ? '✅' : '❌'}`);
        console.log('   ---');
      });
      
      console.log('\n💡 You can login using either email or phone number');
      console.log('🔑 Password: Check your database or use the reset password feature');
    } else {
      console.log('⚠️  No users found in the database');
      console.log('💡 You may need to create a user first');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your DATABASE_URL in .env file');
    console.log('3. Ensure the fleet2db database exists');
    console.log('4. Verify database credentials');
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseAndUsers();
