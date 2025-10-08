const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAppDatabase() {
  try {
    console.log('🔍 Testing application database connection...');
    
    // Test the exact same logic as the authenticateUser function
    const emailOrPhone = '0554040387';
    const password = 'password123';
    
    console.log('Testing login for:', emailOrPhone);
    
    // Check if input is email or phone number
    const isEmail = emailOrPhone.includes('@');
    
    const user = await prisma.users.findFirst({
      where: isEmail 
        ? { email: emailOrPhone, is_active: true }
        : { phone: emailOrPhone, is_active: true }
    });
    
    if (user) {
      console.log('✅ User found:', user.name);
      console.log('📧 Email:', user.email);
      console.log('📱 Phone:', user.phone);
      console.log('👤 Role:', user.role);
      console.log('✅ Active:', user.is_active);
      
      // Test password verification
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔑 Password valid:', isValidPassword);
      
      if (isValidPassword) {
        console.log('\n🎉 LOGIN SHOULD NOW WORK!');
        console.log('📱 Phone: 0554040387');
        console.log('📧 Email: aa@me.com');
        console.log('🔑 Password: password123');
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAppDatabase();
