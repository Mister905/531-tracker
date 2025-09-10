import { User, Lift, Cycle, Workout, WorkoutSet } from '@prisma/client';

// Base types
export interface BaseUser {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseLift {
  id: string;
  name: string;
  oneRepMax: number;
  trainingMax: number;
  userId: string;
}

export interface BaseCycle {
  id: string;
  number: number;
  startDate: Date;
  endDate: Date;
  userId: string;
}

export interface BaseWorkout {
  id: string;
  date: Date;
  notes?: string;
  userId: string;
  liftId: string;
  cycleId: string;
}

export interface BaseWorkoutSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  workoutId: string;
}

// Extended types with relations
export interface UserWithRelations extends BaseUser {
  lifts: BaseLift[];
  cycles: BaseCycle[];
  workouts: BaseWorkout[];
}

export interface LiftWithRelations extends BaseLift {
  user: BaseUser;
  cycles: BaseCycle[];
  workouts: BaseWorkout[];
}

export interface CycleWithRelations extends BaseCycle {
  user: BaseUser;
  lifts: BaseLift[];
  workouts: BaseWorkout[];
}

export interface WorkoutWithRelations extends BaseWorkout {
  user: BaseUser;
  lift: BaseLift;
  cycle: BaseCycle;
  sets: BaseWorkoutSet[];
}

export interface WorkoutSetWithRelations extends BaseWorkoutSet {
  workout: BaseWorkout;
}

// Input types for mutations
export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
}

export interface CreateLiftInput {
  name: string;
  oneRepMax: number;
  trainingMax: number;
}

export interface UpdateLiftInput {
  id: string;
  oneRepMax?: number;
  trainingMax?: number;
}

export interface CreateCycleInput {
  number: number;
  startDate: Date;
  endDate: Date;
}

export interface CreateWorkoutInput {
  date: Date;
  notes?: string;
  liftId: string;
  cycleId: string;
  sets: CreateWorkoutSetInput[];
}

export interface CreateWorkoutSetInput {
  setNumber: number;
  reps: number;
  weight: number;
  completed?: boolean;
}

export interface UpdateWorkoutSetInput {
  id: string;
  reps?: number;
  weight?: number;
  completed?: boolean;
}

// 5/3/1 specific types
export interface WorkoutSetData {
  setNumber: number;
  reps: number;
  weight: number;
  percentage: number;
  isAmrap: boolean;
}

export interface WeekData {
  week: number;
  sets: WorkoutSetData[];
}

export interface CycleData {
  cycle: BaseCycle;
  weeks: WeekData[];
}

// Auth types
export interface AuthPayload {
  token: string;
  user: BaseUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}
