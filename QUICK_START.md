# 5/3/1 Tracker - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites
- Node.js 18+
- Yarn package manager
- **Local Development**: No additional setup (uses SQLite)
- **Production**: PostgreSQL database (AWS RDS recommended)

### 2. Setup (Local Development with SQLite)
```bash
# Clone and install
git clone <your-repo>
cd 531_tracker
yarn install

# Quick setup with SQLite (zero configuration)
yarn setup:local

# Start development server
yarn dev
```

### 2. Setup (Production with PostgreSQL)
```bash
# Clone and install
git clone <your-repo>
cd 531_tracker
yarn install

# Configure environment
cp .env.production .env
# Edit .env with your PostgreSQL credentials

# Setup production database
yarn setup:production

# Start development server
yarn dev
```

### 3. First Use
1. **Register** a new account
2. **Add your lifts** with current 1RM values
3. **View your cycle** with automatic 5/3/1 calculations
4. **Start tracking** your workouts
5. **Monitor progress** with analytics

### 4. Key Features
- **Automatic Calculations**: No need to calculate percentages manually
- **Mobile-First**: Optimized for phone use
- **Offline Support**: Works without internet
- **Progress Tracking**: See your strength gains over time

### 5. 5/3/1 Program Rules (Automatically Implemented)
- **Week 1**: 65%, 75%, 85% of Training Max
- **Week 2**: 70%, 80%, 90% of Training Max  
- **Week 3**: 75%, 85%, 95% of Training Max
- **Week 4**: 40%, 50%, 60% of Training Max (Deload)
- **Progression**: +5lb upper body, +10lb lower body per cycle

### 6. Available Commands
```bash
# Development
yarn dev              # Start development server
yarn build            # Build for production
yarn start            # Start production server

# Database Management
yarn db:sqlite        # Switch to SQLite for local development
yarn db:postgres      # Switch to PostgreSQL for production
yarn db:studio        # Open Prisma Studio
yarn db:reset         # Reset database

# Testing
yarn test             # Run all tests
yarn test:coverage    # Run tests with coverage report
```

### 7. Support
- Check the README.md for detailed documentation
- View PROJECT_SUMMARY.md for complete feature list
- Run `yarn test` to verify everything is working

**Ready to get stronger? Let's go! 💪**
