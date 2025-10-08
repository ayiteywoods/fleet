# 🚀 NeraFleet App - Vercel Deployment Guide

## Quick Start

### Option 1: Automated Deployment
```bash
npm run deploy
```

### Option 2: Manual Deployment
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: 
   - Vercel Postgres (recommended)
   - Supabase
   - Railway
   - Any PostgreSQL provider

## Step-by-Step Deployment

### 1. Database Setup

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Go to Storage tab
3. Create a new Postgres database
4. Copy the connection strings

#### Option B: External Database
1. Create a PostgreSQL database with your preferred provider
2. Get the connection string

### 2. Environment Variables

Set these in your Vercel project settings:

```
DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"
POSTGRES_URL="postgresql://username:password@hostname:port/database?schema=public"
PRISMA_DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="production"
```

**Important**: Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Deploy the Application

```bash
# Clone and navigate to the project
git clone <your-repo-url>
cd nerafleet-app

# Install dependencies
npm install

# Deploy to Vercel
npm run deploy
```

### 4. Post-Deployment Setup

#### Run Database Migrations
```bash
# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

#### Create Admin User
```bash
# Create admin user
node scripts/create-admin.js
```

## Replacing an Existing Vercel App

### Method 1: Update Existing Project
1. Go to your existing Vercel project
2. Go to Settings > General
3. Update the Git repository URL
4. Redeploy

### Method 2: Create New Project
1. Create a new Vercel project
2. Import your Git repository
3. Set environment variables
4. Deploy
5. Delete the old project (optional)

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Primary database connection | `postgresql://user:pass@host:5432/db` |
| `POSTGRES_URL` | Alternative database connection | `postgresql://user:pass@host:5432/db` |
| `PRISMA_DATABASE_URL` | Prisma-specific connection | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing secret | `your-64-char-secret` |
| `NODE_ENV` | Environment mode | `production` |

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure TypeScript compilation passes
- Verify all imports are correct

### Database Errors
- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel
- Ensure migrations have been run

### Runtime Errors
- Check all environment variables are set
- Verify JWT secret is strong enough
- Check Vercel function logs

### Common Issues

1. **"Can't reach database server"**
   - Check database URL format
   - Verify database is running
   - Check firewall/network settings

2. **"JWT secret not defined"**
   - Set `JWT_SECRET` environment variable
   - Ensure it's at least 32 characters

3. **"Prisma client not generated"**
   - Run `npx prisma generate`
   - Check `schema.prisma` is valid

## Production Checklist

- [ ] Database created and accessible
- [ ] Environment variables set in Vercel
- [ ] Application deployed successfully
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Test login functionality
- [ ] Test all major features
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test database connectivity
4. Check this deployment guide

## Features Included

✅ **Fleet Management Dashboard**
✅ **Vehicle Management**
✅ **Driver Management** 
✅ **Fuel Tracking**
✅ **Maintenance Scheduling**
✅ **Insurance Management**
✅ **Roadworthy Certificates**
✅ **Repair Management**
✅ **User Management**
✅ **Settings & Configuration**
✅ **Responsive Design**
✅ **Dark/Light Theme**
✅ **Data Export (Excel, CSV, PDF)**
✅ **Search & Filtering**
✅ **Real-time Charts & Analytics**

---

**Ready to deploy? Run `npm run deploy` and follow the prompts!** 🚀
