import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from 'type-graphql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { 
  User, 
  Lift, 
  Cycle, 
  Workout, 
  WorkoutSet,
  CreateUserInput,
  CreateLiftInput,
  UpdateLiftInput,
  CreateCycleInput,
  CreateWorkoutInput,
  CreateWorkoutSetInput,
  UpdateWorkoutSetInput,
  AuthPayload,
  LoginInput,
  RegisterInput,
  CycleData
} from '../types/graphql';
import { 
  generateCycleData, 
  calculateTrainingMax, 
  calculateNewTrainingMax,
  LiftType 
} from '../lib/531-calculations';

@Resolver()
export class UserResolver {
  @Query(() => [User])
  @Authorized()
  async users(): Promise<User[]> {
    return prisma.user.findMany();
  }

  @Query(() => User, { nullable: true })
  @Authorized()
  async user(@Arg('id') id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        lifts: true,
        cycles: true,
        workouts: true
      }
    });
  }

  @Mutation(() => AuthPayload)
  async register(@Arg('input') input: RegisterInput): Promise<AuthPayload> {
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
        password: hashedPassword
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
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
        updatedAt: user.updatedAt
      }
    };
  }

  @Mutation(() => AuthPayload)
  async login(@Arg('input') input: LoginInput): Promise<AuthPayload> {
    const { email, password } = input;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
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
      { userId: user.id },
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
        updatedAt: user.updatedAt
      }
    };
  }
}

@Resolver()
export class LiftResolver {
  @Query(() => [Lift])
  @Authorized()
  async lifts(@Ctx() ctx: any): Promise<Lift[]> {
    return prisma.lift.findMany({
      where: { userId: ctx.user.id },
      include: {
        user: true,
        cycles: true,
        workouts: true
      }
    });
  }

  @Query(() => Lift, { nullable: true })
  @Authorized()
  async lift(@Arg('id') id: string, @Ctx() ctx: any): Promise<Lift | null> {
    return prisma.lift.findFirst({
      where: { 
        id,
        userId: ctx.user.id 
      },
      include: {
        user: true,
        cycles: true,
        workouts: true
      }
    });
  }

  @Mutation(() => Lift)
  @Authorized()
  async createLift(@Arg('input') input: CreateLiftInput, @Ctx() ctx: any): Promise<Lift> {
    const { name, oneRepMax, trainingMax } = input;
    
    return prisma.lift.create({
      data: {
        name,
        oneRepMax,
        trainingMax: trainingMax || calculateTrainingMax(oneRepMax),
        userId: ctx.user.id
      },
      include: {
        user: true,
        cycles: true,
        workouts: true
      }
    });
  }

  @Mutation(() => Lift)
  @Authorized()
  async updateLift(@Arg('input') input: UpdateLiftInput, @Ctx() ctx: any): Promise<Lift> {
    const { id, oneRepMax, trainingMax } = input;
    
    // Verify ownership
    const existingLift = await prisma.lift.findFirst({
      where: { id, userId: ctx.user.id }
    });

    if (!existingLift) {
      throw new Error('Lift not found or access denied');
    }

    const updateData: any = {};
    if (oneRepMax !== undefined) {
      updateData.oneRepMax = oneRepMax;
      updateData.trainingMax = trainingMax || calculateTrainingMax(oneRepMax);
    }
    if (trainingMax !== undefined) {
      updateData.trainingMax = trainingMax;
    }

    return prisma.lift.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        cycles: true,
        workouts: true
      }
    });
  }

  @Mutation(() => Boolean)
  @Authorized()
  async deleteLift(@Arg('id') id: string, @Ctx() ctx: any): Promise<boolean> {
    // Verify ownership
    const existingLift = await prisma.lift.findFirst({
      where: { id, userId: ctx.user.id }
    });

    if (!existingLift) {
      throw new Error('Lift not found or access denied');
    }

    await prisma.lift.delete({
      where: { id }
    });

    return true;
  }
}

@Resolver()
export class CycleResolver {
  @Query(() => [Cycle])
  @Authorized()
  async cycles(@Ctx() ctx: any): Promise<Cycle[]> {
    return prisma.cycle.findMany({
      where: { userId: ctx.user.id },
      include: {
        user: true,
        lifts: true,
        workouts: true
      },
      orderBy: { number: 'desc' }
    });
  }

  @Query(() => Cycle, { nullable: true })
  @Authorized()
  async cycle(@Arg('id') id: string, @Ctx() ctx: any): Promise<Cycle | null> {
    return prisma.cycle.findFirst({
      where: { 
        id,
        userId: ctx.user.id 
      },
      include: {
        user: true,
        lifts: true,
        workouts: true
      }
    });
  }

  @Query(() => CycleData)
  @Authorized()
  async cycleData(@Arg('liftId') liftId: string, @Ctx() ctx: any): Promise<CycleData> {
    // Get the lift
    const lift = await prisma.lift.findFirst({
      where: { 
        id: liftId,
        userId: ctx.user.id 
      }
    });

    if (!lift) {
      throw new Error('Lift not found or access denied');
    }

    // Get current cycle or create new one
    let cycle = await prisma.cycle.findFirst({
      where: { userId: ctx.user.id },
      orderBy: { number: 'desc' }
    });

    if (!cycle) {
      // Create first cycle
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 28); // 4 weeks

      cycle = await prisma.cycle.create({
        data: {
          number: 1,
          startDate,
          endDate,
          userId: ctx.user.id
        }
      });
    }

    // Generate 5/3/1 cycle data
    const weeks = generateCycleData(lift.trainingMax);

    return {
      cycle: {
        id: cycle.id,
        number: cycle.number,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        userId: cycle.userId
      },
      weeks
    };
  }

  @Mutation(() => Cycle)
  @Authorized()
  async createCycle(@Arg('input') input: CreateCycleInput, @Ctx() ctx: any): Promise<Cycle> {
    const { number, startDate, endDate } = input;
    
    return prisma.cycle.create({
      data: {
        number,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId: ctx.user.id
      },
      include: {
        user: true,
        lifts: true,
        workouts: true
      }
    });
  }

  @Mutation(() => Cycle)
  @Authorized()
  async startNewCycle(@Ctx() ctx: any): Promise<Cycle> {
    // Get current cycle number
    const lastCycle = await prisma.cycle.findFirst({
      where: { userId: ctx.user.id },
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
        userId: ctx.user.id
      },
      include: {
        user: true,
        lifts: true,
        workouts: true
      }
    });
  }
}

@Resolver()
export class WorkoutResolver {
  @Query(() => [Workout])
  @Authorized()
  async workouts(@Ctx() ctx: any): Promise<Workout[]> {
    return prisma.workout.findMany({
      where: { userId: ctx.user.id },
      include: {
        user: true,
        lift: true,
        cycle: true,
        sets: true
      },
      orderBy: { date: 'desc' }
    });
  }

  @Query(() => Workout, { nullable: true })
  @Authorized()
  async workout(@Arg('id') id: string, @Ctx() ctx: any): Promise<Workout | null> {
    return prisma.workout.findFirst({
      where: { 
        id,
        userId: ctx.user.id 
      },
      include: {
        user: true,
        lift: true,
        cycle: true,
        sets: true
      }
    });
  }

  @Mutation(() => Workout)
  @Authorized()
  async createWorkout(@Arg('input') input: CreateWorkoutInput, @Ctx() ctx: any): Promise<Workout> {
    const { date, notes, liftId, cycleId, sets } = input;
    
    // Verify ownership of lift and cycle
    const lift = await prisma.lift.findFirst({
      where: { id: liftId, userId: ctx.user.id }
    });

    const cycle = await prisma.cycle.findFirst({
      where: { id: cycleId, userId: ctx.user.id }
    });

    if (!lift || !cycle) {
      throw new Error('Lift or cycle not found or access denied');
    }

    // Create workout with sets
    return prisma.workout.create({
      data: {
        date: new Date(date),
        notes,
        userId: ctx.user.id,
        liftId,
        cycleId,
        sets: {
          create: sets.map(set => ({
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            completed: set.completed ?? true
          }))
        }
      },
      include: {
        user: true,
        lift: true,
        cycle: true,
        sets: true
      }
    });
  }

  @Mutation(() => WorkoutSet)
  @Authorized()
  async updateWorkoutSet(@Arg('input') input: UpdateWorkoutSetInput, @Ctx() ctx: any): Promise<WorkoutSet> {
    const { id, reps, weight, completed } = input;
    
    // Verify ownership through workout
    const workoutSet = await prisma.workoutSet.findFirst({
      where: { id },
      include: {
        workout: true
      }
    });

    if (!workoutSet || workoutSet.workout.userId !== ctx.user.id) {
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
