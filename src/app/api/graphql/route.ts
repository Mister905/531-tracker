import { NextRequest, NextResponse } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '../../../graphql/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';

// Context interface
interface Context {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// JWT authentication middleware
const authenticateUser = (req: NextRequest): Context => {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {};
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return {
      user: {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username
      }
    };
  } catch (error) {
    return {};
  }
};

// Resolvers
const resolvers = {
  Query: {
    users: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      return prisma.user.findMany();
    },
    
    user: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      return prisma.user.findUnique({
        where: { id },
        include: {
          cycles: true,
          workouts: true
        }
      });
    },
    
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      return prisma.user.findUnique({
        where: { id: context.user.id },
        include: {
          cycles: true,
          workouts: true
        }
      });
    },
    
    cycles: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      return prisma.cycle.findMany({
        where: { userId: context.user!.id },
        include: {
          user: true,
          workouts: true
        },
        orderBy: { number: 'desc' }
      });
    },
    
    cycle: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      return prisma.cycle.findFirst({
        where: { 
          id,
          userId: context.user!.id 
        },
        include: {
          user: true,
          workouts: true
        }
      });
    },
    
    workouts: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      return prisma.workout.findMany({
        where: { userId: context.user!.id },
        include: {
          user: true,
          cycle: true,
          sets: true
        },
        orderBy: { date: 'desc' }
      });
    },
    
    workout: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      return prisma.workout.findFirst({
        where: { 
          id,
          userId: context.user!.id 
        },
        include: {
          user: true,
          cycle: true,
          sets: true
        }
      });
    }
  },
  
  Mutation: {
    register: async (_: any, { input }: { input: any }) => {
      const { email, username, password } = input;
      
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          weightUnit: 'pounds',
          availablePlates: JSON.stringify([100, 45, 35, 25, 10, 5, 2.5])
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          weightUnit: user.weightUnit,
          availablePlates: user.availablePlates,
          squatOneRepMax: user.squatOneRepMax,
          squatTrainingMax: user.squatTrainingMax,
          benchOneRepMax: user.benchOneRepMax,
          benchTrainingMax: user.benchTrainingMax,
          deadliftOneRepMax: user.deadliftOneRepMax,
          deadliftTrainingMax: user.deadliftTrainingMax,
          ohpOneRepMax: user.ohpOneRepMax,
          ohpTrainingMax: user.ohpTrainingMax
        }
      };
    },
    
    login: async (_: any, { input }: { input: any }) => {
      const { email, password } = input;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          cycles: true,
          workouts: true
        }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }


      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          weightUnit: user.weightUnit,
          availablePlates: user.availablePlates,
          squatOneRepMax: user.squatOneRepMax,
          squatTrainingMax: user.squatTrainingMax,
          benchOneRepMax: user.benchOneRepMax,
          benchTrainingMax: user.benchTrainingMax,
          deadliftOneRepMax: user.deadliftOneRepMax,
          deadliftTrainingMax: user.deadliftTrainingMax,
          ohpOneRepMax: user.ohpOneRepMax,
          ohpTrainingMax: user.ohpTrainingMax
        }
      };
    },
    
    updateUserProfile: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const updateData: any = {};
      
      // Update only provided fields
      if (input.weightUnit !== undefined) updateData.weightUnit = input.weightUnit;
      if (input.availablePlates !== undefined) updateData.availablePlates = input.availablePlates;
      if (input.squatOneRepMax !== undefined) updateData.squatOneRepMax = input.squatOneRepMax;
      if (input.squatTrainingMax !== undefined) updateData.squatTrainingMax = input.squatTrainingMax;
      if (input.benchOneRepMax !== undefined) updateData.benchOneRepMax = input.benchOneRepMax;
      if (input.benchTrainingMax !== undefined) updateData.benchTrainingMax = input.benchTrainingMax;
      if (input.deadliftOneRepMax !== undefined) updateData.deadliftOneRepMax = input.deadliftOneRepMax;
      if (input.deadliftTrainingMax !== undefined) updateData.deadliftTrainingMax = input.deadliftTrainingMax;
      if (input.ohpOneRepMax !== undefined) updateData.ohpOneRepMax = input.ohpOneRepMax;
      if (input.ohpTrainingMax !== undefined) updateData.ohpTrainingMax = input.ohpTrainingMax;

      const user = await prisma.user.update({
        where: { id: context.user!.id },
        data: updateData,
        include: {
          cycles: true,
          workouts: true
        }
      });

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        weightUnit: user.weightUnit,
        availablePlates: user.availablePlates,
        squatOneRepMax: user.squatOneRepMax,
        squatTrainingMax: user.squatTrainingMax,
        benchOneRepMax: user.benchOneRepMax,
        benchTrainingMax: user.benchTrainingMax,
        deadliftOneRepMax: user.deadliftOneRepMax,
        deadliftTrainingMax: user.deadliftTrainingMax,
        ohpOneRepMax: user.ohpOneRepMax,
        ohpTrainingMax: user.ohpTrainingMax,
        cycles: user.cycles,
        workouts: user.workouts
      };
    },
    
    createCycle: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const { number, startDate, endDate } = input;
      
      return prisma.cycle.create({
        data: {
          number,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          userId: context.user!.id
        },
        include: {
          user: true,
          workouts: true
        }
      });
    },
    
    startNewCycle: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      
      // Get current cycle number
      const lastCycle = await prisma.cycle.findFirst({
        where: { userId: context.user!.id },
        orderBy: { number: 'desc' }
      });

      const nextCycleNumber = lastCycle ? lastCycle.number + 1 : 1;
      
      // Calculate dates for new cycle
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 28); // 4 weeks

      return prisma.cycle.create({
        data: {
          number: nextCycleNumber,
          startDate,
          endDate,
          userId: context.user!.id
        },
        include: {
          user: true,
          workouts: true
        }
      });
    },
    
    createWorkout: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const { date, notes, liftType, cycleId, sets } = input;
      
      // Verify ownership of cycle
      const cycle = await prisma.cycle.findFirst({
        where: { id: cycleId, userId: context.user!.id }
      });

      if (!cycle) {
        throw new Error('Cycle not found or access denied');
      }

      // Create workout with sets
      return prisma.workout.create({
        data: {
          date: new Date(date),
          notes,
          liftType,
          userId: context.user!.id,
          cycleId,
          sets: {
            create: sets.map((set: any) => ({
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight,
              completed: set.completed ?? true
            }))
          }
        },
        include: {
          user: true,
          cycle: true,
          sets: true
        }
      });
    },
    
    updateWorkoutSet: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const { id, reps, weight, completed } = input;
      
      // Verify ownership through workout
      const workoutSet = await prisma.workoutSet.findFirst({
        where: { id },
        include: {
          workout: true
        }
      });

      if (!workoutSet || workoutSet.workout.userId !== context.user!.id) {
        throw new Error('Workout set not found or access denied');
      }

      return prisma.workoutSet.update({
        where: { id },
        data: {
          reps,
          weight,
          completed
        },
        include: {
          workout: true
        }
      });
    }
  }
};

// Create schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Create Apollo Server
const server = new ApolloServer<Context>({
  schema,
  context: ({ req }) => authenticateUser(req as NextRequest)
});

// Create handler
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => authenticateUser(req)
});

export { handler as GET, handler as POST };