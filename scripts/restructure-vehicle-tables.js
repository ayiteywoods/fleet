const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restructureVehicleTables() {
  try {
    console.log('🚀 Starting database restructuring...');
    
    // Step 1: Drop the existing model table (it has wrong structure)
    console.log('\n📋 Step 1: Dropping existing model table...');
    await prisma.$executeRaw`DROP TABLE IF EXISTS model CASCADE`;
    console.log('✅ Model table dropped');
    
    // Step 2: Create new model table with proper structure
    console.log('\n📋 Step 2: Creating new model table...');
    await prisma.$executeRaw`
      CREATE TABLE model (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        vehicle_make_id BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (vehicle_make_id) REFERENCES vehicle_makes(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ New model table created');
    
    // Step 3: Get all unique makes from vehicle_makes
    console.log('\n📋 Step 3: Processing vehicle_makes data...');
    const vehicleMakes = await prisma.vehicle_makes.findMany();
    
    // Group by make name to handle duplicates
    const makeMap = new Map();
    vehicleMakes.forEach(vm => {
      if (!makeMap.has(vm.name)) {
        makeMap.set(vm.name, {
          id: vm.id,
          name: vm.name,
          models: []
        });
      }
      makeMap.get(vm.name).models.push(vm.model);
    });
    
    console.log(`📊 Found ${makeMap.size} unique makes:`);
    makeMap.forEach((make, name) => {
      console.log(`  - ${name}: ${make.models.length} models`);
    });
    
    // Step 4: Insert models into the new model table
    console.log('\n📋 Step 4: Inserting models into new model table...');
    let modelCount = 0;
    
    for (const [makeName, makeData] of makeMap) {
      for (const modelName of makeData.models) {
        await prisma.$executeRaw`
          INSERT INTO model (name, vehicle_make_id, created_at, updated_at)
          VALUES (${modelName}, ${makeData.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        modelCount++;
      }
    }
    
    console.log(`✅ Inserted ${modelCount} models into model table`);
    
    // Step 5: Remove model column from vehicle_makes table
    console.log('\n📋 Step 5: Removing model column from vehicle_makes table...');
    await prisma.$executeRaw`ALTER TABLE vehicle_makes DROP COLUMN IF EXISTS model`;
    console.log('✅ Model column removed from vehicle_makes table');
    
    // Step 6: Verify the new structure
    console.log('\n📋 Step 6: Verifying new structure...');
    
    const vehicleMakesCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM vehicle_makes`;
    const modelsCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM model`;
    
    console.log(`📊 vehicle_makes table: ${vehicleMakesCount[0].count} records`);
    console.log(`📊 model table: ${modelsCount[0].count} records`);
    
    // Show sample data
    console.log('\n📋 Sample vehicle_makes data:');
    const sampleMakes = await prisma.$queryRaw`SELECT * FROM vehicle_makes LIMIT 5`;
    sampleMakes.forEach((make, index) => {
      console.log(`  ${index + 1}. ID: ${make.id}, Name: ${make.name}`);
    });
    
    console.log('\n📋 Sample model data:');
    const sampleModels = await prisma.$queryRaw`
      SELECT m.id, m.name as model_name, vm.name as make_name 
      FROM model m 
      JOIN vehicle_makes vm ON m.vehicle_make_id = vm.id 
      LIMIT 5
    `;
    sampleModels.forEach((model, index) => {
      console.log(`  ${index + 1}. ID: ${model.id}, Model: ${model.model_name}, Make: ${model.make_name}`);
    });
    
    console.log('\n🎉 Database restructuring completed successfully!');
    console.log('\n📋 New structure:');
    console.log('  - vehicle_makes: Contains only make information (Toyota, Honda, etc.)');
    console.log('  - model: Contains model information with foreign key to vehicle_makes');
    console.log('  - Proper normalized relationship established');
    
  } catch (error) {
    console.error('❌ Error during restructuring:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restructureVehicleTables();
