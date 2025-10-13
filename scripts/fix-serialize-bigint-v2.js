const fs = require('fs')
const path = require('path')

// List of API route files that need the serializeBigInt function fixed
const apiFiles = [
  'src/app/api/vehicle-dispatch/route.ts',
  'src/app/api/tags/route.ts',
  'src/app/api/roles/route.ts',
  'src/app/api/permissions/route.ts',
  'src/app/api/mechanics/route.ts',
  'src/app/api/workshops/route.ts',
  'src/app/api/supervisors/route.ts',
  'src/app/api/groups/route.ts',
  'src/app/api/model/route.ts',
  'src/app/api/fuel-request/route.ts',
  'src/app/api/fuel-expense-log/route.ts',
  'src/app/api/fuel-logs/route.ts'
]

// The correct serializeBigInt function
const correctSerializeBigInt = `// Helper function to serialize BigInt values
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString()
  }
  
  if (obj instanceof Date) {
    return obj.toISOString()
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt)
  }
  
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value)
    }
    return serialized
  }
  
  return obj
}`

console.log('🔧 Fixing serializeBigInt function in API routes...')

apiFiles.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8')
      let updated = false
      
      // Pattern 1: JSON.stringify/JSON.parse approach
      const jsonPattern = /\/\/ Helper to convert BigInt to string for JSON serialization\nfunction serializeBigInt\(obj: any\) \{\n  return JSON\.parse\(JSON\.stringify\(obj, \(key, value\) =>\n    typeof value === 'bigint'\n      \? value\.toString\(\)\n      : value\n  \)\);\n\}/g
      
      if (jsonPattern.test(content)) {
        content = content.replace(jsonPattern, correctSerializeBigInt)
        updated = true
      }
      
      // Pattern 2: Manual object iteration approach (already fixed in some files)
      const manualPattern = /\/\/ Helper function to serialize BigInt values\nfunction serializeBigInt\(obj: any\): any \{\n  if \(obj === null \|\| obj === undefined\) \{\n    return obj\n  }\n  \n  if \(typeof obj === 'bigint'\) \{\n    return obj\.toString\(\)\n  }\n  \n  if \(Array\.isArray\(obj\)\) \{\n    return obj\.map\(serializeBigInt\)\n  }\n  \n  if \(typeof obj === 'object'\) \{\n    const serialized: any = \{\}\n    for \(const \[key, value\] of Object\.entries\(obj\)\) \{\n      serialized\[key\] = serializeBigInt\(value\)\n    }\n    return serialized\n  }\n  \n  return obj\n\}/g
      
      if (manualPattern.test(content)) {
        content = content.replace(manualPattern, correctSerializeBigInt)
        updated = true
      }
      
      if (updated) {
        // Write the updated content back to the file
        fs.writeFileSync(filePath, content, 'utf8')
        console.log(`✅ Fixed ${filePath}`)
      } else {
        console.log(`⚠️  ${filePath} - Pattern not found or already fixed`)
      }
    } else {
      console.log(`❌ ${filePath} - File not found`)
    }
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}: ${error.message}`)
  }
})

console.log('🎉 Finished fixing serializeBigInt functions!')
