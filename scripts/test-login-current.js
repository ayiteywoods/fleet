const fetch = require('node-fetch').default || require('node-fetch')

async function testLoginCurrent() {
  try {
    console.log('🔍 Testing login with current deployment...')
    console.log('URL: https://nerafleet-qmo3cdt4e-eatwoods-gmailcoms-projects.vercel.app')
    
    // Test with the user we created directly in the database
    const loginData = {
      email: 'testdirect@example.com',
      password: 'testpassword123'
    }
    
    console.log('Testing login with:', { ...loginData, password: '***' })
    
    const response = await fetch('https://nerafleet-qmo3cdt4e-eatwoods-gmailcoms-projects.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Login successful!')
      console.log('Response:', result)
    } else {
      const error = await response.text()
      console.log('❌ Login failed')
      console.log('Error response:', error)
    }
    
    // Also test with admin user
    console.log('\n🔍 Testing admin login...')
    const adminData = {
      email: 'admin@nerafleet.com',
      password: 'admin123'
    }
    
    const adminResponse = await fetch('https://nerafleet-qmo3cdt4e-eatwoods-gmailcoms-projects.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData)
    })
    
    console.log('Admin response status:', adminResponse.status)
    
    if (adminResponse.ok) {
      const adminResult = await adminResponse.json()
      console.log('✅ Admin login successful!')
    } else {
      const adminError = await adminResponse.text()
      console.log('❌ Admin login failed')
      console.log('Admin error:', adminError)
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error)
  }
}

testLoginCurrent()
