# 5/3/1 Tracker - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database
- Yarn package manager

### 2. Setup
```bash
# Clone and install
git clone <your-repo>
cd 531_tracker
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma generate
npx prisma migrate dev

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

### 6. Support
- Check the README.md for detailed documentation
- View PROJECT_SUMMARY.md for complete feature list
- Run `yarn test` to verify everything is working

**Ready to get stronger? Let's go! 💪**
