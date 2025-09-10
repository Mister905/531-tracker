/**
 * 5/3/1 Calculation Logic
 * Implements the Wendler 5/3/1 program calculations
 */

export interface LiftData {
  oneRepMax: number;
  trainingMax: number; // 90% of 1RM
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weight: number;
  percentage: number;
  isAmrap: boolean;
}

export interface WeekData {
  week: number;
  sets: WorkoutSet[];
}

export type LiftType = 'squat' | 'bench' | 'deadlift' | 'overhead';

/**
 * Calculate training max (90% of 1RM)
 */
export const calculateTrainingMax = (oneRepMax: number): number => {
  return Math.round(oneRepMax * 0.9);
};

/**
 * Calculate working weight based on training max, week, and set
 */
export const calculateWorkingWeight = (
  trainingMax: number,
  week: number,
  set: number
): number => {
  const percentages = {
    1: { 1: 0.65, 2: 0.75, 3: 0.85 }, // Week 1: 65%, 75%, 85%
    2: { 1: 0.70, 2: 0.80, 3: 0.90 }, // Week 2: 70%, 80%, 90%
    3: { 1: 0.75, 2: 0.85, 3: 0.95 }, // Week 3: 75%, 85%, 95%
    4: { 1: 0.40, 2: 0.50, 3: 0.60 }  // Week 4: 40%, 50%, 60% (deload)
  };

  const percentage = percentages[week as keyof typeof percentages]?.[set as keyof typeof percentages[1]];
  if (!percentage) {
    throw new Error(`Invalid week (${week}) or set (${set})`);
  }

  return Math.round(trainingMax * percentage);
};

/**
 * Generate workout sets for a specific week and lift
 */
export const generateWorkoutSets = (
  trainingMax: number,
  week: number
): WorkoutSet[] => {
  const sets: WorkoutSet[] = [];
  
  for (let setNumber = 1; setNumber <= 3; setNumber++) {
    const weight = calculateWorkingWeight(trainingMax, week, setNumber);
    const percentage = getPercentage(week, setNumber);
    const reps = getTargetReps(week, setNumber);
    
    sets.push({
      setNumber,
      reps,
      weight,
      percentage,
      isAmrap: setNumber === 3 // Last set is always AMRAP
    });
  }
  
  return sets;
};

/**
 * Get percentage for week and set
 */
const getPercentage = (week: number, set: number): number => {
  const percentages = {
    1: { 1: 65, 2: 75, 3: 85 },
    2: { 1: 70, 2: 80, 3: 90 },
    3: { 1: 75, 2: 85, 3: 95 },
    4: { 1: 40, 2: 50, 3: 60 }
  };
  
  return percentages[week as keyof typeof percentages]?.[set as keyof typeof percentages[1]] || 0;
};

/**
 * Get target reps for week and set
 */
const getTargetReps = (week: number, set: number): number => {
  if (week === 4) {
    // Deload week - 5 reps for all sets
    return 5;
  }
  
  if (set === 3) {
    // Last set is AMRAP - target is minimum reps
    return week === 1 ? 5 : week === 2 ? 3 : 1;
  }
  
  // First two sets
  return week === 1 ? 5 : week === 2 ? 3 : 1;
};

/**
 * Calculate weight increment for next cycle
 */
export const calculateWeightIncrement = (liftType: LiftType): number => {
  const increments = {
    squat: 10,      // Lower body: +10lb
    deadlift: 10,   // Lower body: +10lb
    bench: 5,       // Upper body: +5lb
    overhead: 5     // Upper body: +5lb
  };
  
  return increments[liftType];
};

/**
 * Calculate new training max for next cycle
 */
export const calculateNewTrainingMax = (
  currentTrainingMax: number,
  liftType: LiftType
): number => {
  const increment = calculateWeightIncrement(liftType);
  return currentTrainingMax + increment;
};

/**
 * Generate complete 4-week cycle data
 */
export const generateCycleData = (trainingMax: number): WeekData[] => {
  const cycleData: WeekData[] = [];
  
  for (let week = 1; week <= 4; week++) {
    const sets = generateWorkoutSets(trainingMax, week);
    cycleData.push({
      week,
      sets
    });
  }
  
  return cycleData;
};

/**
 * Validate 5/3/1 program rules
 */
export const validate531Rules = (data: {
  week: number;
  set: number;
  weight: number;
  trainingMax: number;
}): boolean => {
  const { week, set, weight, trainingMax } = data;
  
  // Weight should not exceed training max for regular sets
  if (set < 3 && weight > trainingMax) {
    return false;
  }
  
  // Week should be 1-4
  if (week < 1 || week > 4) {
    return false;
  }
  
  // Set should be 1-3
  if (set < 1 || set > 3) {
    return false;
  }
  
  return true;
};
