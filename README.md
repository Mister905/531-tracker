# 5/3/1 Tracker

A mobile-first Progressive Web App (PWA) for tracking the Wendler 5/3/1 strength training program. Built with Next.js, TypeScript, GraphQL, and Materialize CSS.

## Features

### Core 5/3/1 Functionality
- ✅ **Automatic 5/3/1 Calculations**: Correctly implements Wendler's percentage-based system
- ✅ **Training Max Management**: Automatically calculates 90% of 1RM for all lifts
- ✅ **4-Week Cycle Tracking**: Complete cycle management with proper deload weeks
- ✅ **Weight Progression**: Automatic +5lb (upper body) and +10lb (lower body) increments
- ✅ **AMRAP Set Support**: Last set of each week marked as "As Many Reps As Possible"

### User Experience
- ✅ **Mobile-First Design**: Optimized for mobile devices with touch-friendly interface
- ✅ **Dark Theme**: Fitness-focused dark theme with orange/teal accent colors
- ✅ **PWA Support**: Installable app with offline functionality
- ✅ **Real-time Updates**: Live workout tracking and progress monitoring

### Technical Features
- ✅ **GraphQL API**: Efficient data fetching with Apollo Client
- ✅ **JWT Authentication**: Secure user authentication and authorization
- ✅ **TypeScript**: Full type safety throughout the application
- ✅ **Prisma ORM**: Type-safe database operations with PostgreSQL
- ✅ **Materialize CSS**: Familiar CSS framework for consistent UI

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Materialize CSS 1.0.0
- **State Management**: Apollo Client with GraphQL
- **Backend**: Next.js API Routes with Apollo Server
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **PWA**: Service Worker, Web App Manifest

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- **Local**: No additional setup (uses SQLite)
- **Production**: PostgreSQL database (AWS RDS recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 531_tracker
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up local development (SQLite)**
   ```bash
   # Quick setup with SQLite (zero configuration)
   yarn setup:local
   ```

   Or manually:
   ```bash
   # Copy environment file
   cp .env.local .env
   
   # Setup SQLite database
   yarn db:sqlite
   yarn db:push
   ```

4. **Start the development server**
   ```bash
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Production Deployment (PostgreSQL)

For production deployment with PostgreSQL on AWS:

1. **Set up AWS RDS PostgreSQL**
   - Create RDS PostgreSQL instance
   - Note connection details

2. **Configure production environment**
   ```bash
   # Update .env.production with your RDS details
   cp .env.production .env
   # Edit .env with your AWS RDS connection string
   ```

3. **Deploy to production**
   ```bash
   # Setup production database
   yarn setup:production
   
   # Build and start
   yarn build
   yarn start
   ```

   Or with Docker:
   ```bash
   docker-compose up --build
   ```

## Usage

### Getting Started
1. **Register/Login**: Create an account or log in with existing credentials
2. **Add Your Lifts**: Set up your four main lifts (Squat, Bench Press, Deadlift, Overhead Press) with your current 1RM
3. **View Your Cycle**: The app automatically generates your 4-week training cycle with correct percentages
4. **Track Workouts**: Log your sets, reps, and weights for each workout
5. **Monitor Progress**: Track your progression over multiple cycles

### 5/3/1 Program Rules (Automatically Implemented)

The app follows Wendler's 5/3/1 program exactly:

- **Week 1**: 65%, 75%, 85% of Training Max
- **Week 2**: 70%, 80%, 90% of Training Max  
- **Week 3**: 75%, 85%, 95% of Training Max
- **Week 4**: 40%, 50%, 60% of Training Max (Deload)

- **Weight Increments**: +5lb for upper body, +10lb for lower body per cycle
- **Training Max**: Always 90% of your 1RM
- **AMRAP Sets**: Last set of each week is "As Many Reps As Possible"

## Project Structure

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
│   └── WorkoutTracker.tsx # Workout tracking component
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

## Database Schema

The app uses a relational database schema with the following main entities:

- **User**: User accounts with authentication
- **Lift**: Individual lifts (Squat, Bench, etc.) with 1RM and Training Max
- **Cycle**: 4-week training cycles
- **Workout**: Individual workout sessions
- **WorkoutSet**: Individual sets within a workout

## API Endpoints

### GraphQL Endpoint
- **URL**: `/api/graphql`
- **Method**: POST/GET
- **Authentication**: JWT Bearer token

### Key Queries
- `lifts`: Get user's lifts
- `cycles`: Get user's training cycles
- `cycleData(liftId)`: Get 5/3/1 calculations for a specific lift
- `workouts`: Get user's workout history

### Key Mutations
- `register`: Create new user account
- `login`: Authenticate user
- `createLift`: Add new lift with 1RM
- `createWorkout`: Log a workout session
- `updateWorkoutSet`: Update individual set data

## PWA Features

The app is a fully functional Progressive Web App:

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Works without internet connection
- **App-like Experience**: Full-screen, native app feel
- **Push Notifications**: (Future feature)

## Development

### Running Tests
```bash
yarn test
```

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Deploy migrations
npx prisma migrate deploy
```

### Building for Production
```bash
yarn build
yarn start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Jim Wendler**: Creator of the 5/3/1 program
- **Materialize CSS**: UI framework
- **Next.js Team**: React framework
- **Apollo GraphQL**: GraphQL client/server

## Support

For support, email support@531tracker.com or create an issue in the GitHub repository.

---

**Built with ❤️ for the strength training community**