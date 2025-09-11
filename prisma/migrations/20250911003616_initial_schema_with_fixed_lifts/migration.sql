-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "weightUnit" TEXT NOT NULL DEFAULT 'pounds',
    "availablePlates" TEXT NOT NULL,
    "squatOneRepMax" REAL,
    "squatTrainingMax" REAL,
    "benchOneRepMax" REAL,
    "benchTrainingMax" REAL,
    "deadliftOneRepMax" REAL,
    "deadliftTrainingMax" REAL,
    "ohpOneRepMax" REAL,
    "ohpTrainingMax" REAL
);

-- CreateTable
CREATE TABLE "cycles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "cycles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    "liftType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    CONSTRAINT "workouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workouts_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "cycles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workout_sets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" REAL NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "workoutId" TEXT NOT NULL,
    CONSTRAINT "workout_sets_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
