import { 
  calculateTrainingMax, 
  calculateWorkingWeight, 
  generateWorkoutSets,
  calculateWeightIncrement,
  calculateNewTrainingMax,
  generateCycleData,
  validate531Rules
} from '../531-calculations';

describe('5/3/1 Calculations', () => {
  describe('calculateTrainingMax', () => {
    it('should calculate 90% of 1RM', () => {
      expect(calculateTrainingMax(100)).toBe(90);
      expect(calculateTrainingMax(200)).toBe(180);
      expect(calculateTrainingMax(315)).toBe(284);
    });
  });

  describe('calculateWorkingWeight', () => {
    const trainingMax = 100;

    it('should calculate Week 1 percentages correctly', () => {
      expect(calculateWorkingWeight(trainingMax, 1, 1)).toBe(65); // 65%
      expect(calculateWorkingWeight(trainingMax, 1, 2)).toBe(75); // 75%
      expect(calculateWorkingWeight(trainingMax, 1, 3)).toBe(85); // 85%
    });

    it('should calculate Week 2 percentages correctly', () => {
      expect(calculateWorkingWeight(trainingMax, 2, 1)).toBe(70); // 70%
      expect(calculateWorkingWeight(trainingMax, 2, 2)).toBe(80); // 80%
      expect(calculateWorkingWeight(trainingMax, 2, 3)).toBe(90); // 90%
    });

    it('should calculate Week 3 percentages correctly', () => {
      expect(calculateWorkingWeight(trainingMax, 3, 1)).toBe(75); // 75%
      expect(calculateWorkingWeight(trainingMax, 3, 2)).toBe(85); // 85%
      expect(calculateWorkingWeight(trainingMax, 3, 3)).toBe(95); // 95%
    });

    it('should calculate Week 4 (deload) percentages correctly', () => {
      expect(calculateWorkingWeight(trainingMax, 4, 1)).toBe(40); // 40%
      expect(calculateWorkingWeight(trainingMax, 4, 2)).toBe(50); // 50%
      expect(calculateWorkingWeight(trainingMax, 4, 3)).toBe(60); // 60%
    });

    it('should throw error for invalid week or set', () => {
      expect(() => calculateWorkingWeight(trainingMax, 5, 1)).toThrow();
      expect(() => calculateWorkingWeight(trainingMax, 1, 4)).toThrow();
    });
  });

  describe('generateWorkoutSets', () => {
    const trainingMax = 100;

    it('should generate correct sets for Week 1', () => {
      const sets = generateWorkoutSets(trainingMax, 1);
      
      expect(sets).toHaveLength(3);
      expect(sets[0]).toEqual({
        setNumber: 1,
        reps: 5,
        weight: 65,
        percentage: 65,
        isAmrap: false
      });
      expect(sets[1]).toEqual({
        setNumber: 2,
        reps: 5,
        weight: 75,
        percentage: 75,
        isAmrap: false
      });
      expect(sets[2]).toEqual({
        setNumber: 3,
        reps: 5,
        weight: 85,
        percentage: 85,
        isAmrap: true
      });
    });

    it('should generate correct sets for Week 2', () => {
      const sets = generateWorkoutSets(trainingMax, 2);
      
      expect(sets[0].reps).toBe(3);
      expect(sets[1].reps).toBe(3);
      expect(sets[2].reps).toBe(3);
      expect(sets[2].isAmrap).toBe(true);
    });

    it('should generate correct sets for Week 3', () => {
      const sets = generateWorkoutSets(trainingMax, 3);
      
      expect(sets[0].reps).toBe(1);
      expect(sets[1].reps).toBe(1);
      expect(sets[2].reps).toBe(1);
      expect(sets[2].isAmrap).toBe(true);
    });

    it('should generate correct sets for Week 4 (deload)', () => {
      const sets = generateWorkoutSets(trainingMax, 4);
      
      expect(sets[0].reps).toBe(5);
      expect(sets[1].reps).toBe(5);
      expect(sets[2].reps).toBe(5);
      expect(sets[2].isAmrap).toBe(true);
    });
  });

  describe('calculateWeightIncrement', () => {
    it('should return 10 for lower body lifts', () => {
      expect(calculateWeightIncrement('squat')).toBe(10);
      expect(calculateWeightIncrement('deadlift')).toBe(10);
    });

    it('should return 5 for upper body lifts', () => {
      expect(calculateWeightIncrement('bench')).toBe(5);
      expect(calculateWeightIncrement('overhead')).toBe(5);
    });
  });

  describe('calculateNewTrainingMax', () => {
    it('should add correct increment for lower body', () => {
      expect(calculateNewTrainingMax(100, 'squat')).toBe(110);
      expect(calculateNewTrainingMax(200, 'deadlift')).toBe(210);
    });

    it('should add correct increment for upper body', () => {
      expect(calculateNewTrainingMax(100, 'bench')).toBe(105);
      expect(calculateNewTrainingMax(150, 'overhead')).toBe(155);
    });
  });

  describe('generateCycleData', () => {
    it('should generate complete 4-week cycle', () => {
      const cycleData = generateCycleData(100);
      
      expect(cycleData).toHaveLength(4);
      expect(cycleData[0].week).toBe(1);
      expect(cycleData[1].week).toBe(2);
      expect(cycleData[2].week).toBe(3);
      expect(cycleData[3].week).toBe(4);
      
      // Each week should have 3 sets
      cycleData.forEach(week => {
        expect(week.sets).toHaveLength(3);
      });
    });
  });

  describe('validate531Rules', () => {
    it('should validate correct 5/3/1 data', () => {
      expect(validate531Rules({
        week: 1,
        set: 1,
        weight: 65,
        trainingMax: 100
      })).toBe(true);

      expect(validate531Rules({
        week: 3,
        set: 3,
        weight: 95,
        trainingMax: 100
      })).toBe(true);
    });

    it('should reject invalid data', () => {
      // Weight exceeds training max for regular set
      expect(validate531Rules({
        week: 1,
        set: 1,
        weight: 105,
        trainingMax: 100
      })).toBe(false);

      // Invalid week
      expect(validate531Rules({
        week: 5,
        set: 1,
        weight: 65,
        trainingMax: 100
      })).toBe(false);

      // Invalid set
      expect(validate531Rules({
        week: 1,
        set: 4,
        weight: 65,
        trainingMax: 100
      })).toBe(false);
    });
  });
});
