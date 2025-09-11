'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import styles from './InitialSetupForm.module.scss';

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      weightUnit
      availablePlates
      squatOneRepMax
      squatTrainingMax
      benchOneRepMax
      benchTrainingMax
      deadliftOneRepMax
      deadliftTrainingMax
      ohpOneRepMax
      ohpTrainingMax
    }
  }
`;

interface InitialSetupFormProps {
  onComplete: () => void;
  userData?: {
    weightUnit: string;
    squatOneRepMax: number | null;
    squatTrainingMax: number | null;
    benchOneRepMax: number | null;
    benchTrainingMax: number | null;
    deadliftOneRepMax: number | null;
    deadliftTrainingMax: number | null;
    ohpOneRepMax: number | null;
    ohpTrainingMax: number | null;
    availablePlates: string;
  };
}

interface FormData {
  weightUnit: 'pounds' | 'kilograms';
  squatReps: number;
  squatWeight: number;
  benchReps: number;
  benchWeight: number;
  deadliftReps: number;
  deadliftWeight: number;
  ohpReps: number;
  ohpWeight: number;
  availablePlates: { [plateWeight: number]: number }; // plate weight -> count
}

const CORE_LIFTS = [
  { key: 'ohp', name: 'Overhead Press', icon: 'sports_gymnastics' },
  { key: 'bench', name: 'Bench Press', icon: 'sports_gymnastics' },
  { key: 'squat', name: 'Squat', icon: 'fitness_center' },
  { key: 'deadlift', name: 'Deadlift', icon: 'fitness_center' }
] as const;

const DEFAULT_PLATES = [100, 55, 45, 35, 25, 10, 5, 2.5];

export default function InitialSetupForm({ onComplete, userData }: InitialSetupFormProps) {
  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);
  
  // Parse available plates from userData
  const parseAvailablePlates = (platesString: string) => {
    try {
      const parsed = JSON.parse(platesString);
      
      // If parsed is empty or null, return defaults
      if (!parsed || (Array.isArray(parsed) && parsed.length === 0)) {
        return {
          100: 0,
          55: 0,
          45: 4,
          35: 1,
          25: 1,
          10: 1,
          5: 1,
          2.5: 1
        };
      }
      
      // Handle array format: [{"weight":5,"count":1}, ...]
      if (Array.isArray(parsed)) {
        const plateMap: { [key: number]: number } = {};
        parsed.forEach((plate: { weight: number; count: number }) => {
          plateMap[plate.weight] = plate.count;
        });
        
        return {
          100: plateMap[100] || 0,
          55: plateMap[55] || 0,
          45: plateMap[45] || 4,
          35: plateMap[35] || 1,
          25: plateMap[25] || 1,
          10: plateMap[10] || 1,
          5: plateMap[5] || 1,
          2.5: plateMap[2.5] || 1
        };
      }
      
      // Handle object format: {5: 1, 10: 1, ...}
      return {
        100: parsed[100] || parsed['100'] || 0,
        55: parsed[55] || parsed['55'] || 0,
        45: parsed[45] || parsed['45'] || 4,
        35: parsed[35] || parsed['35'] || 1,
        25: parsed[25] || parsed['25'] || 1,
        10: parsed[10] || parsed['10'] || 1,
        5: parsed[5] || parsed['5'] || 1,
        2.5: parsed[2.5] || parsed['2.5'] || 1
      };
    } catch {
      return {
        100: 0,
        55: 0,
        45: 4,
        35: 1,
        25: 1,
        10: 1,
        5: 1,
        2.5: 1
      };
    }
  };

  const [formData, setFormData] = useState<FormData>(() => {
    const defaultPlates = {
      100: 0,
      55: 0,
      45: 4,
      35: 1,
      25: 1,
      10: 1,
      5: 1,
      2.5: 1
    };
    
    return {
      weightUnit: (userData?.weightUnit as 'pounds' | 'kilograms') || 'pounds',
      squatReps: 1,
      squatWeight: userData?.squatOneRepMax || 300,
      benchReps: 1,
      benchWeight: userData?.benchOneRepMax || 200,
      deadliftReps: 1,
      deadliftWeight: userData?.deadliftOneRepMax || 400,
      ohpReps: 1,
      ohpWeight: userData?.ohpOneRepMax || 100,
      availablePlates: (userData?.availablePlates && userData.availablePlates !== '[]' && userData.availablePlates !== 'null') 
        ? parseAvailablePlates(userData.availablePlates) 
        : defaultPlates
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      const defaultPlates = {
        100: 0,
        55: 0,
        45: 4,
        35: 1,
        25: 1,
        10: 1,
        5: 1,
        2.5: 1
      };
      
      setFormData({
        weightUnit: (userData.weightUnit as 'pounds' | 'kilograms') || 'pounds',
        squatReps: 1,
        squatWeight: userData.squatOneRepMax || 300,
        benchReps: 1,
        benchWeight: userData.benchOneRepMax || 200,
        deadliftReps: 1,
        deadliftWeight: userData.deadliftOneRepMax || 400,
        ohpReps: 1,
        ohpWeight: userData.ohpOneRepMax || 100,
        availablePlates: (userData.availablePlates && userData.availablePlates !== '[]' && userData.availablePlates !== 'null') 
          ? parseAvailablePlates(userData.availablePlates) 
          : defaultPlates
      });
    }
  }, [userData]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateOneRepMax = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    // Epley formula: 1RM = weight * (1 + reps/30)
    return Math.round(weight * (1 + reps / 30));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate 1RM for each lift
      const squatOneRepMax = calculateOneRepMax(formData.squatWeight, formData.squatReps);
      const benchOneRepMax = calculateOneRepMax(formData.benchWeight, formData.benchReps);
      const deadliftOneRepMax = calculateOneRepMax(formData.deadliftWeight, formData.deadliftReps);
      const ohpOneRepMax = calculateOneRepMax(formData.ohpWeight, formData.ohpReps);

      // Calculate training max (90% of 1RM)
      const squatTrainingMax = Math.round(squatOneRepMax * 0.9);
      const benchTrainingMax = Math.round(benchOneRepMax * 0.9);
      const deadliftTrainingMax = Math.round(deadliftOneRepMax * 0.9);
      const ohpTrainingMax = Math.round(ohpOneRepMax * 0.9);

      // Convert plate counts to the format expected by the backend
      const plateData = Object.entries(formData.availablePlates)
        .filter(([_, count]) => count > 0)
        .map(([weight, count]) => ({ weight: parseFloat(weight), count }));

      await updateUserProfile({
        variables: {
          input: {
            weightUnit: formData.weightUnit,
            availablePlates: JSON.stringify(plateData),
            squatOneRepMax,
            squatTrainingMax,
            benchOneRepMax,
            benchTrainingMax,
            deadliftOneRepMax,
            deadliftTrainingMax,
            ohpOneRepMax,
            ohpTrainingMax
          }
        }
      });

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePlateCount = (plate: number, count: number) => {
    setFormData(prev => ({
      ...prev,
      availablePlates: {
        ...prev.availablePlates,
        [plate]: Math.max(0, count) // Ensure count is not negative
      }
    }));
  };



  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardContent}>
          <h2 className={styles.title}>
            <i className={`material-icons ${styles.titleIcon}`}>fitness_center</i>
            5/3/1 Setup
          </h2>
          
          <p className={styles.description}>
            Let's set up your 5/3/1 program with your current strength levels
          </p>

          <form onSubmit={handleSubmit}>
            {/* Weight Unit Selection */}
            <div className={`row ${styles.section}`}>
              <div className="col s12">
                <h4 className={styles.sectionTitle}>Weight Unit</h4>
                <div className={styles.radioGroup}>
                  <label>
                    <input
                      type="radio"
                      name="weightUnit"
                      value="pounds"
                      checked={formData.weightUnit === 'pounds'}
                      onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                    />
                    <span className={styles.radioLabel}>Pounds (lbs)</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="weightUnit"
                      value="kilograms"
                      checked={formData.weightUnit === 'kilograms'}
                      onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                    />
                    <span className={styles.radioLabel}>Kilograms (kg)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Available Plates */}
            <div className={`row ${styles.section}`}>
              <div className="col s12">
                <h4 className={styles.sectionTitle}>Available Plates</h4>
                <p className={styles.sectionDescription}>
                  Enter how many pairs of each weight you have available at your gym
                </p>
                <div className={styles.plateGrid}>
                  {DEFAULT_PLATES.map((plate) => (
                    <div key={plate} className={styles.plateCard}>
                      <div className={styles.plateWeight}>
                        {plate} {formData.weightUnit === 'pounds' ? 'lbs' : 'kg'}
                      </div>
                      <div className={styles.plateInputField}>
                        <input
                          type="number"
                          id={`plate-${plate}`}
                          value={formData.availablePlates[plate] ?? 0}
                          onChange={(e) => updatePlateCount(plate, parseInt(e.target.value) || 0)}
                          min="0"
                          max="20"
                          className={`${styles.plateInput} active`}
                        />
                        <label 
                          htmlFor={`plate-${plate}`}
                          className={styles.plateInputLabel}
                        >
                          Pairs
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rep Max Inputs */}
            <div className={`row ${styles.section}`}>
              <div className="col s12">
                <h4 className={styles.sectionTitle}>Current Rep Maxes</h4>
                <p className={styles.sectionDescription}>
                  Enter your current rep max for each lift (e.g., "1 rep × 225 lbs")
                </p>
                
                {CORE_LIFTS.map((lift) => (
                  <div key={lift.key} className={styles.liftCard}>
                    <div className={styles.liftHeader}>
                      <i className={`material-icons ${styles.liftIcon}`}>
                        {lift.icon}
                      </i>
                      <h5 className={styles.liftName}>
                        {lift.name}
                      </h5>
                    </div>
                    <div className={styles.inputRow}>
                      <div className={styles.inputField}>
                        <label 
                          htmlFor={`${lift.key}Reps`}
                          className={styles.inputLabel}
                        >
                          Reps
                        </label>
                        <input
                          type="number"
                          id={`${lift.key}Reps`}
                          value={formData[`${lift.key}Reps` as keyof FormData] as number}
                          onChange={(e) => handleInputChange(`${lift.key}Reps` as keyof FormData, parseInt(e.target.value) || 1)}
                          min="1"
                          max="20"
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.inputField}>
                        <label 
                          htmlFor={`${lift.key}Weight`}
                          className={styles.inputLabel}
                        >
                          Weight ({formData.weightUnit === 'pounds' ? 'lbs' : 'kg'})
                        </label>
                        <input
                          type="number"
                          id={`${lift.key}Weight`}
                          value={formData[`${lift.key}Weight` as keyof FormData] as number}
                          onChange={(e) => handleInputChange(`${lift.key}Weight` as keyof FormData, parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.5"
                          className={styles.input}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="row">
                <div className="col s12">
                  <div className={styles.errorCard}>
                    <i className={`material-icons ${styles.errorIcon}`}>error</i>
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="row">
              <div className={`col s12 ${styles.submitContainer}`}>
                <button
                  type="submit"
                  disabled={isSubmitting || formData.squatWeight === 0 || formData.benchWeight === 0 || formData.deadliftWeight === 0 || formData.ohpWeight === 0}
                  className={`btn btn-large ${styles.submitButton}`}
                >
                  {isSubmitting ? (
                    <>
                      <i className={`material-icons ${styles.submitButtonIcon}`}>hourglass_empty</i>
                      Setting Up...
                    </>
                  ) : (
                    <>
                      <i className={`material-icons ${styles.submitButtonIcon}`}>check</i>
                      Complete Setup
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
