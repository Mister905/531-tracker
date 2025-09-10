import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    username: String!
    createdAt: String!
    updatedAt: String!
    lifts: [Lift!]!
    cycles: [Cycle!]!
    workouts: [Workout!]!
  }

  type Lift {
    id: ID!
    name: String!
    oneRepMax: Float!
    trainingMax: Float!
    userId: String!
    user: User!
    cycles: [Cycle!]!
    workouts: [Workout!]!
  }

  type Cycle {
    id: ID!
    number: Int!
    startDate: String!
    endDate: String!
    userId: String!
    user: User!
    lifts: [Lift!]!
    workouts: [Workout!]!
  }

  type Workout {
    id: ID!
    date: String!
    notes: String
    userId: String!
    liftId: String!
    cycleId: String!
    user: User!
    lift: Lift!
    cycle: Cycle!
    sets: [WorkoutSet!]!
  }

  type WorkoutSet {
    id: ID!
    setNumber: Int!
    reps: Int!
    weight: Float!
    completed: Boolean!
    workoutId: String!
    workout: Workout!
  }

  type WorkoutSetData {
    setNumber: Int!
    reps: Int!
    weight: Float!
    percentage: Float!
    isAmrap: Boolean!
  }

  type WeekData {
    week: Int!
    sets: [WorkoutSetData!]!
  }

  type CycleData {
    cycle: Cycle!
    weeks: [WeekData!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CreateUserInput {
    email: String!
    username: String!
    password: String!
  }

  input CreateLiftInput {
    name: String!
    oneRepMax: Float!
    trainingMax: Float
  }

  input UpdateLiftInput {
    id: ID!
    oneRepMax: Float
    trainingMax: Float
  }

  input CreateCycleInput {
    number: Int!
    startDate: String!
    endDate: String!
  }

  input CreateWorkoutInput {
    date: String!
    notes: String
    liftId: ID!
    cycleId: ID!
    sets: [CreateWorkoutSetInput!]!
  }

  input CreateWorkoutSetInput {
    setNumber: Int!
    reps: Int!
    weight: Float!
    completed: Boolean
  }

  input UpdateWorkoutSetInput {
    id: ID!
    reps: Int
    weight: Float
    completed: Boolean
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RegisterInput {
    email: String!
    username: String!
    password: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    lifts: [Lift!]!
    lift(id: ID!): Lift
    cycles: [Cycle!]!
    cycle(id: ID!): Cycle
    cycleData(liftId: ID!): CycleData!
    workouts: [Workout!]!
    workout(id: ID!): Workout
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createLift(input: CreateLiftInput!): Lift!
    updateLift(input: UpdateLiftInput!): Lift!
    deleteLift(id: ID!): Boolean!
    createCycle(input: CreateCycleInput!): Cycle!
    startNewCycle: Cycle!
    createWorkout(input: CreateWorkoutInput!): Workout!
    updateWorkoutSet(input: UpdateWorkoutSetInput!): WorkoutSet!
  }
`;
