/**
 * 5/3/1 Calculation Logic
 * Implements the Wendler 5/3/1 program calculations with warm-ups, BBB sets, and plate calculations
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
  plates: PlateCalculation;
  setType: 'warmup' | 'main' | 'bbb';
}

export interface PlateCalculation {
  totalWeight: number;
  plates: { weight: number; count: number }[];
  barWeight: number;
}

export interface WeekData {
  week: number;
  warmupSets: WorkoutSet[];
  mainSets: WorkoutSet[];
  bbbSets: WorkoutSet[];
}

export type LiftType = 'squat' | 'bench' | 'deadlift' | 'ohp';
export type WeightUnit = 'pounds' | 'kilograms';

/**
 * Calculate training max (90% of 1RM)
 */
export const calculateTrainingMax = (oneRepMax: number): number => {
  return Math.round(oneRepMax * 0.9);
};

/**
 * Calculate plates needed for a given weight
 */
export const calculatePlates = (
  weight: number,
  availablePlates: number[],
  barWeight: number = 45,
  weightUnit: WeightUnit = 'pounds'
): PlateCalculation => {
  const sortedPlates = [...availablePlates].sort((a, b) => b - a);
  const plates: { weight: number; count: number }[] = [];
  let remainingWeight = weight - barWeight;
  
  // If weight is less than bar weight, return empty plates
  if (remainingWeight <= 0) {
    return {
      totalWeight: barWeight,
      plates: [],
      barWeight
    };
  }
  
  // Calculate plates needed
  for (const plateWeight of sortedPlates) {
    const plateCount = Math.floor(remainingWeight / (plateWeight * 2)); // 2 plates per side
    if (plateCount > 0) {
      plates.push({ weight: plateWeight, count: plateCount });
      remainingWeight -= plateCount * plateWeight * 2;
    }
  }
  
  // If we can't make the exact weight, round down to the nearest achievable weight
  if (remainingWeight > 0) {
    const achievableWeight = weight - remainingWeight;
    return calculatePlates(achievableWeight, availablePlates, barWeight, weightUnit);
  }
  
  return {
    totalWeight: weight,
    plates,
    barWeight
  };
};

/**
 * Generate warm-up sets (3-4 sets, 40-60% of Training Max)
 */
export const generateWarmupSets = (
  trainingMax: number,
  availablePlates: number[],
  barWeight: number = 45,
  weightUnit: WeightUnit = 'pounds'
): WorkoutSet[] => {
  const warmupPercentages = [0.40, 0.50, 0.60];
  const warmupReps = [5, 5, 5];
  
  return warmupPercentages.map((percentage, index) => {
    const weight = Math.round(trainingMax * percentage);
    const plates = calculatePlates(weight, availablePlates, barWeight, weightUnit);
    
    return {
      setNumber: index + 1,
      reps: warmupReps[index],
      weight: plates.totalWeight,
      percentage: percentage * 100,
      isAmrap: false,
      plates,
      setType: 'warmup' as const
    };
  });
};

/**
 * Generate Boring But Big (BBB) sets (5x10 @ 30% Training Max)
 */
export const generateBBBSets = (
  trainingMax: number,
  availablePlates: number[],
  barWeight: number = 45,
  weightUnit: WeightUnit = 'pounds'
): WorkoutSet[] => {
  const bbbWeight = Math.round(trainingMax * 0.30);
  const plates = calculatePlates(bbbWeight, availablePlates, barWeight, weightUnit);
  
  return Array.from({ length: 5 }, (_, index) => ({
    setNumber: index + 1,
    reps: 10,
    weight: plates.totalWeight,
    percentage: 30,
    isAmrap: false,
    plates,
    setType: 'bbb' as const
  }));
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
 * Generate main workout sets for a specific week and lift
 */
export const generateMainWorkoutSets = (
  trainingMax: number,
  week: number,
  availablePlates: number[],
  barWeight: number = 45,
  weightUnit: WeightUnit = 'pounds'
): WorkoutSet[] => {
  const sets: WorkoutSet[] = [];
  
  for (let setNumber = 1; setNumber <= 3; setNumber++) {
    const weight = calculateWorkingWeight(trainingMax, week, setNumber);
    const percentage = getPercentage(week, setNumber);
    const reps = getTargetReps(week, setNumber);
    const plates = calculatePlates(weight, availablePlates, barWeight, weightUnit);
    
    sets.push({
      setNumber,
      reps,
      weight: plates.totalWeight,
      percentage,
      isAmrap: setNumber === 3, // Last set is always AMRAP
      plates,
      setType: 'main' as const
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
 * Generate complete 4-week cycle data with warm-ups, main sets, and BBB sets
 */
export const generateCycleData = (
  trainingMax: number,
  availablePlates: number[],
  barWeight: number = 45,
  weightUnit: WeightUnit = 'pounds'
): WeekData[] => {
  const cycleData: WeekData[] = [];
  
  for (let week = 1; week <= 4; week++) {
    const warmupSets = generateWarmupSets(trainingMax, availablePlates, barWeight, weightUnit);
    const mainSets = generateMainWorkoutSets(trainingMax, week, availablePlates, barWeight, weightUnit);
    const bbbSets = generateBBBSets(trainingMax, availablePlates, barWeight, weightUnit);
    
    cycleData.push({
      week,
      warmupSets,
      mainSets,
      bbbSets
    });
  }
  
  return cycleData;
};

/**
 * Generate cycle data for all lifts
 */
export const generateAllLiftsCycleData = (
  userData: {
    squatOneRepMax: number;
    benchOneRepMax: number;
    deadliftOneRepMax: number;
    ohpOneRepMax: number;
    availablePlates: number[];
    weightUnit: WeightUnit;
  }
): Record<LiftType, WeekData[]> => {
  const { availablePlates, weightUnit } = userData;
  const barWeight = weightUnit === 'pounds' ? 45 : 20; // 45lb/20kg standard bar
  
  return {
    squat: generateCycleData(
      calculateTrainingMax(userData.squatOneRepMax),
      availablePlates,
      barWeight,
      weightUnit
    ),
    bench: generateCycleData(
      calculateTrainingMax(userData.benchOneRepMax),
      availablePlates,
      barWeight,
      weightUnit
    ),
    deadlift: generateCycleData(
      calculateTrainingMax(userData.deadliftOneRepMax),
      availablePlates,
      barWeight,
      weightUnit
    ),
    ohp: generateCycleData(
      calculateTrainingMax(userData.ohpOneRepMax),
      availablePlates,
      barWeight,
      weightUnit
    )
  };
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
