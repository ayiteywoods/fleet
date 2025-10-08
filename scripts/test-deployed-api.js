const fetch = require('node-fetch').default || require('node-fetch')

async function testDeployedAPI() {
  try {
    console.log('🔍 Testing deployed user creation API...')
    
    const testUser = {
      name: 'Test User API',
      email: 'test@api.com',
      phone: '0555123456',
      role: 'user',
      password: 'testpassword123',
      is_active: true
    }
    
    console.log('Creating user with data:', { ...testUser, password: '***' })
    
    const response = await fetch('https://nerafleet-dcw5xuhx0-eatwoods-gmailcoms-projects.vercel.app/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    })
    
    const result = await response.json()
    console.log('Response status:', response.status)
    console.log('Response:', result)
    
    if (response.ok) {
      console.log('✅ User created successfully via deployed API')
      
      // Now test login
      console.log('\n🔍 Testing login with created user...')
      
      const loginResponse = await fetch('https://nerafleet-dcw5xuhx0-eatwoods-gmailcoms-projects.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@api.com',
          password: 'testpassword123'
        })
      })
      
      const loginResult = await loginResponse.json()
      console.log('Login response status:', loginResponse.status)
      console.log('Login response:', loginResult)
      
      if (loginResponse.ok) {
        console.log('✅ Login successful! The fix is working.')
      } else {
        console.log('❌ Login failed. The fix is not working.')
      }
    } else {
      console.log('❌ User creation failed')
    }
    
  } catch (error) {
    console.error('❌ Error testing deployed API:', error)
  }
}

testDeployedAPI()
