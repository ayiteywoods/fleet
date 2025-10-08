# Vercel Deployment Guide for NeraFleet App

## Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres, Supabase, or any PostgreSQL provider)
- Git repository

## Step 1: Prepare Environment Variables

You'll need to set these environment variables in Vercel:

### Required Environment Variables:
```
DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"
POSTGRES_URL="postgresql://username:password@hostname:port/database?schema=public"  
PRISMA_DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="production"
```

## Step 2: Database Setup

1. **Create a PostgreSQL database** (if you don't have one):
   - Use Vercel Postgres (recommended)
   - Or use Supabase, Railway, or any PostgreSQL provider

2. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add POSTGRES_URL  
vercel env add PRISMA_DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV

# Deploy to production
vercel --prod
```

### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Set environment variables in project settings
5. Deploy

## Step 4: Post-Deployment Setup

1. **Run database migrations** on production:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

2. **Create admin user** (run this script):
   ```bash
   node scripts/create-admin.js
   ```

## Step 5: Replace Existing App

If you want to replace an existing Vercel app:
1. Go to your existing project in Vercel dashboard
2. Go to Settings > General
3. Update the Git repository to point to this new project
4. Or delete the old project and create a new one

## Troubleshooting

- **Build errors**: Check that all dependencies are in package.json
- **Database errors**: Verify DATABASE_URL is correct
- **Environment variables**: Make sure all required vars are set in Vercel
- **Prisma errors**: Run `npx prisma generate` before deploying
