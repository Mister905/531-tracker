import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    username: String!
    createdAt: String!
    updatedAt: String!
    weightUnit: String!
    availablePlates: String!
    squatOneRepMax: Float
    squatTrainingMax: Float
    benchOneRepMax: Float
    benchTrainingMax: Float
    deadliftOneRepMax: Float
    deadliftTrainingMax: Float
    ohpOneRepMax: Float
    ohpTrainingMax: Float
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
    workouts: [Workout!]!
  }

  type Workout {
    id: ID!
    date: String!
    notes: String
    liftType: String!
    userId: String!
    cycleId: String!
    user: User!
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

  input UpdateUserProfileInput {
    weightUnit: String
    availablePlates: String
    squatOneRepMax: Float
    squatTrainingMax: Float
    benchOneRepMax: Float
    benchTrainingMax: Float
    deadliftOneRepMax: Float
    deadliftTrainingMax: Float
    ohpOneRepMax: Float
    ohpTrainingMax: Float
  }

  input CreateCycleInput {
    number: Int!
    startDate: String!
    endDate: String!
  }

  input CreateWorkoutInput {
    date: String!
    notes: String
    liftType: String!
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
    cycles: [Cycle!]!
    cycle(id: ID!): Cycle
    workouts: [Workout!]!
    workout(id: ID!): Workout
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateUserProfile(input: UpdateUserProfileInput!): User!
    createCycle(input: CreateCycleInput!): Cycle!
    startNewCycle: Cycle!
    createWorkout(input: CreateWorkoutInput!): Workout!
    updateWorkoutSet(input: UpdateWorkoutSetInput!): WorkoutSet!
  }
`;
