# Database Setup Guide

## 🎯 Your Workflow: SQLite (Local) + PostgreSQL (Production)

This project is configured to match your preferred workflow:
- **Local Development**: SQLite (fast, file-based, zero setup)
- **Production Deployment**: PostgreSQL on AWS (robust, multi-user, networked)

## 🚀 Local Development (SQLite)

### Quick Start
```bash
# Setup local development with SQLite
yarn setup:local

# Start development server
yarn dev
```

### What happens:
1. Switches to SQLite schema
2. Creates `dev.db` file in project root
3. Generates Prisma client for SQLite
4. Pushes schema to local database

### Local Commands
```bash
# Database management
yarn db:studio          # Open Prisma Studio
yarn db:push           # Push schema changes
yarn db:reset          # Reset database
yarn db:sqlite         # Switch to SQLite schema
```

## 🏗️ Production Deployment (PostgreSQL)

### AWS RDS Setup
1. Create PostgreSQL RDS instance on AWS
2. Note the connection details
3. Update `.env.production` with your RDS endpoint

### Deploy Commands
```bash
# Setup production with PostgreSQL
yarn setup:production

# Or manually:
yarn db:postgres       # Switch to PostgreSQL schema
yarn db:deploy         # Deploy migrations to production
```

### Docker Deployment
```bash
# Build and run with PostgreSQL
docker-compose up --build
```

## 📁 File Structure

```
prisma/
├── schema.prisma           # Active schema (switches between SQLite/PostgreSQL)
├── schema.sqlite.prisma    # SQLite schema for local dev
└── schema.postgresql.prisma # PostgreSQL schema for production

.env.local          # Local development environment
.env.production     # Production environment
```

## 🔄 Schema Switching

The project automatically switches schemas based on your needs:

### Local Development
- Uses `schema.sqlite.prisma`
- Creates `dev.db` file
- Zero configuration required
- Fast file-based database

### Production
- Uses `schema.postgresql.prisma`
- Connects to AWS RDS PostgreSQL
- Robust, multi-user database
- Networked access

## 🛠️ Environment Variables

### Local (.env.local)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-jwt-secret"
```

### Production (.env.production)
```env
DATABASE_URL="postgresql://username:password@your-aws-rds-endpoint:5432/531_tracker?schema=public"
JWT_SECRET="your-production-jwt-secret"
```

## 🚀 Deployment Workflow

1. **Develop locally** with SQLite
2. **Test** your changes
3. **Switch to PostgreSQL** for production
4. **Deploy** to AWS with RDS

This gives you the best of both worlds:
- ⚡ **Fast local development** with SQLite
- 🏗️ **Robust production** with PostgreSQL
- 🔄 **Easy switching** between environments
- 📦 **Docker support** for deployment

## 🎉 Benefits

- **Zero setup** for local development
- **Fast iteration** with SQLite
- **Production-ready** with PostgreSQL
- **AWS-optimized** for scalability
- **Type-safe** database operations
