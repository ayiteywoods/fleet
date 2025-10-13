const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDateSerialization() {
  try {
    console.log('🔍 Testing date serialization...')
    
    // Get a category
    const category = await prisma.categories.findFirst()
    if (!category) {
      console.log('No categories found')
      return
    }
    
    console.log('Raw database record:')
    console.log('  ID:', category.id)
    console.log('  Name:', category.name)
    console.log('  Created At:', category.created_at)
    console.log('  Updated At:', category.updated_at)
    console.log('  Created At Type:', typeof category.created_at)
    console.log('  Updated At Type:', typeof category.updated_at)
    
    // Simulate API serialization
    const serializedCategory = {
      ...category,
      id: category.id.toString()
    }
    
    console.log('\nSerialized for API:')
    console.log('  ID:', serializedCategory.id)
    console.log('  Name:', serializedCategory.name)
    console.log('  Created At:', serializedCategory.created_at)
    console.log('  Updated At:', serializedCategory.updated_at)
    console.log('  Created At Type:', typeof serializedCategory.created_at)
    console.log('  Updated At Type:', typeof serializedCategory.updated_at)
    
    // Test JSON serialization
    const jsonString = JSON.stringify(serializedCategory)
    console.log('\nJSON string:', jsonString)
    
    // Test parsing back
    const parsed = JSON.parse(jsonString)
    console.log('\nParsed back:')
    console.log('  Created At:', parsed.created_at)
    console.log('  Updated At:', parsed.updated_at)
    console.log('  Created At Type:', typeof parsed.created_at)
    console.log('  Updated At Type:', typeof parsed.updated_at)
    
    // Test Date creation
    try {
      const createdDate = new Date(parsed.created_at)
      console.log('  Created Date Object:', createdDate)
      console.log('  Created Date Valid:', !isNaN(createdDate.getTime()))
      console.log('  Created Date String:', createdDate.toLocaleDateString())
    } catch (error) {
      console.log('  Error creating date:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error testing date serialization:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDateSerialization()
