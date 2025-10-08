#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 NeraFleet App - Vercel Deployment Script');
console.log('==========================================\n');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.log('❌ Vercel CLI not found. Installing...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully');
  } catch (installError) {
    console.log('❌ Failed to install Vercel CLI. Please install manually:');
    console.log('   npm install -g vercel');
    process.exit(1);
  }
}

// Check if user is logged in to Vercel
try {
  execSync('vercel whoami', { stdio: 'pipe' });
  console.log('✅ Logged in to Vercel');
} catch (error) {
  console.log('❌ Not logged in to Vercel. Please login:');
  console.log('   vercel login');
  process.exit(1);
}

// Build the project
console.log('\n📦 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.log('❌ Build failed');
  process.exit(1);
}

// Deploy to Vercel
console.log('\n🚀 Deploying to Vercel...');
try {
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
} catch (error) {
  console.log('❌ Deployment failed');
  process.exit(1);
}

console.log('\n🎉 Deployment completed!');
console.log('\n📋 Next steps:');
console.log('1. Set up your database (Vercel Postgres recommended)');
console.log('2. Add environment variables in Vercel dashboard:');
console.log('   - DATABASE_URL');
console.log('   - POSTGRES_URL');
console.log('   - PRISMA_DATABASE_URL');
console.log('   - JWT_SECRET');
console.log('   - NODE_ENV=production');
console.log('3. Run database migrations:');
console.log('   npx prisma migrate deploy');
console.log('4. Create admin user:');
console.log('   node scripts/create-admin.js');
