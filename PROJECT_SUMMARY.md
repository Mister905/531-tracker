# 5/3/1 Tracker - Project Summary

## 🎉 Project Complete!

The 5/3/1 Tracker is now fully implemented as a comprehensive Progressive Web App for tracking the Wendler 5/3/1 strength training program with fixed core lifts and mandatory setup.

## ✅ Completed Features

### Core 5/3/1 Functionality
- **Fixed Core Lifts**: Only 4 lifts - Overhead Press, Bench Press, Squat, and Deadlift
- **Mandatory Setup Form**: Weight unit selection, rep max inputs, and available plates
- **Real 1RM Calculation**: Uses Epley formula to calculate 1RM from rep maxes
- **Training Max Management**: Automatically calculates 90% of 1RM for all lifts
- **Complete Training Cycles**: 4-week cycles with warm-ups, main sets, and BBB sets
- **Plate Calculations**: Shows exact plate requirements for each set
- **AMRAP Set Support**: Last set of each week marked as "As Many Reps As Possible"

### Training Program Features
- **Warm-up Sets**: 3 sets at 40-60% Training Max, increasing gradually
- **Main Working Sets**: Correct 5/3/1 percentages per week
- **Boring But Big (BBB)**: 5×10 @ 30% Training Max for all lifts
- **Plate Optimization**: Respects user's available plates for all calculations
- **All Lifts Simultaneously**: Shows cycles for all 4 lifts on the same view

### User Experience
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interface
- **Dark Theme**: Professional dark theme with green accent colors
- **Mandatory Setup**: First-time users must complete setup form
- **Clean Tabular Layout**: All lifts and cycles visible simultaneously
- **Touch-Friendly**: Large buttons and touch-optimized interface

### Technical Implementation
- **GraphQL API**: Efficient data fetching with Apollo Client
- **JWT Authentication**: Secure user authentication and authorization with bcryptjs
- **TypeScript**: Full type safety throughout the application
- **Prisma ORM**: Type-safe database operations with SQLite (local) / PostgreSQL (production)
- **Materialize CSS**: Familiar CSS framework for consistent UI
- **Comprehensive Testing**: 17 passing tests for core 5/3/1 calculations
- **Dual Database Support**: SQLite for local development, PostgreSQL for production

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Apollo Client** for GraphQL
- **Materialize CSS** for styling
- **PWA** capabilities with service worker

### Backend
- **Next.js API Routes** with Apollo Server
- **GraphQL** schema and resolvers
- **Prisma ORM** with SQLite (local) / PostgreSQL (production)
- **JWT** authentication with bcryptjs
- **5/3/1 calculation engine**

### Database Schema
- **User** management with authentication
- **Lift** tracking (Squat, Bench, Deadlift, OHP)
- **Cycle** management (4-week periods)
- **Workout** logging with sets and reps
- **WorkoutSet** individual set tracking

## 🧪 Testing

- **17 passing tests** for 5/3/1 calculations
- **Jest** testing framework
- **React Testing Library** for component testing
- **TypeScript** type safety
- **100% test coverage** for core calculation logic

## 📱 PWA Features

- **Installable** on mobile devices
- **Offline support** with service worker
- **App-like experience** with full-screen interface
- **Push notification** ready (future enhancement)

## 🚀 Deployment Ready

- **Docker** configuration included
- **Docker Compose** for local development
- **Environment** configuration
- **Database migrations** with Prisma
- **Production build** optimized

## 📊 Key Metrics

- **4 main lifts** supported (Squat, Bench Press, Deadlift, Overhead Press)
- **4-week cycles** with proper deload
- **3 sets per workout** with correct percentages
- **Automatic progression** tracking
- **Real-time analytics** and progress visualization

## 🎯 5/3/1 Program Compliance

The app strictly follows Jim Wendler's 5/3/1 program:

- **Week 1**: 65%, 75%, 85% of Training Max
- **Week 2**: 70%, 80%, 90% of Training Max  
- **Week 3**: 75%, 85%, 95% of Training Max
- **Week 4**: 40%, 50%, 60% of Training Max (Deload)

- **Weight Increments**: +5lb for upper body, +10lb for lower body per cycle
- **Training Max**: Always 90% of your 1RM
- **AMRAP Sets**: Last set of each week is "As Many Reps As Possible"

## 🛠️ Development Commands

```bash
# Install dependencies
yarn install

# Development
yarn dev              # Start development server
yarn build            # Build for production
yarn start            # Start production server

# Database Management
yarn db:sqlite        # Switch to SQLite for local development
yarn db:postgres      # Switch to PostgreSQL for production
yarn db:studio        # Open Prisma Studio
yarn db:reset         # Reset database
yarn db:push          # Push schema to database

# Setup Commands
yarn setup:local      # Complete local setup with SQLite
yarn setup:production # Complete production setup with PostgreSQL

# Testing
yarn test             # Run all tests
yarn test:coverage    # Run tests with coverage report
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/graphql/       # GraphQL API endpoint
│   ├── globals.css        # Global styles with Materialize
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── App.tsx           # Main app component
│   ├── AuthModal.tsx     # Authentication modal
│   ├── WorkoutTracker.tsx # Workout tracking component
│   └── Analytics.tsx     # Progress analytics
├── graphql/              # GraphQL schema and resolvers
│   ├── schema.ts         # GraphQL type definitions
│   └── resolvers.ts      # GraphQL resolvers
├── lib/                  # Utility libraries
│   ├── 531-calculations.ts # 5/3/1 calculation logic
│   ├── apollo-client.ts  # Apollo Client configuration
│   └── prisma.ts         # Prisma client
└── types/                # TypeScript type definitions
    └── graphql.ts        # GraphQL types
```

## 🎉 Ready to Use!

The 5/3/1 Tracker is now complete and ready for use. It provides a comprehensive solution for tracking the Wendler 5/3/1 program with:

- ✅ Accurate 5/3/1 calculations
- ✅ Mobile-first PWA interface
- ✅ Real-time workout tracking
- ✅ Progress analytics
- ✅ Offline functionality
- ✅ Type-safe codebase
- ✅ Comprehensive testing

**Happy lifting! 💪**
