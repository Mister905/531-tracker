'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

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
  availablePlates: number[];
}

const CORE_LIFTS = [
  { key: 'squat', name: 'Squat', icon: 'fitness_center' },
  { key: 'bench', name: 'Bench Press', icon: 'sports_gymnastics' },
  { key: 'deadlift', name: 'Deadlift', icon: 'fitness_center' },
  { key: 'ohp', name: 'Overhead Press', icon: 'sports_gymnastics' }
] as const;

const DEFAULT_PLATES = [100, 45, 35, 25, 10, 5, 2.5];

export default function InitialSetupForm({ onComplete }: InitialSetupFormProps) {
  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);
  const [formData, setFormData] = useState<FormData>({
    weightUnit: 'pounds',
    squatReps: 1,
    squatWeight: 0,
    benchReps: 1,
    benchWeight: 0,
    deadliftReps: 1,
    deadliftWeight: 0,
    ohpReps: 1,
    ohpWeight: 0,
    availablePlates: DEFAULT_PLATES
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      await updateUserProfile({
        variables: {
          input: {
            weightUnit: formData.weightUnit,
            availablePlates: JSON.stringify(formData.availablePlates),
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

  const togglePlate = (plate: number) => {
    setFormData(prev => ({
      ...prev,
      availablePlates: prev.availablePlates.includes(plate)
        ? prev.availablePlates.filter(p => p !== plate)
        : [...prev.availablePlates, plate].sort((a, b) => b - a)
    }));
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div className="card" style={{ 
        backgroundColor: '#1a1a1a', 
        color: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div className="card-content" style={{ padding: '2rem' }}>
          <h2 className="center-align" style={{ 
            color: '#4CAF50',
            marginBottom: '2rem',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            <i className="material-icons left" style={{ fontSize: '2rem' }}>fitness_center</i>
            5/3/1 Setup
          </h2>
          
          <p className="center-align" style={{ 
            color: '#cccccc',
            marginBottom: '2rem',
            fontSize: '1.1rem'
          }}>
            Let's set up your 5/3/1 program with your current strength levels
          </p>

          <form onSubmit={handleSubmit}>
            {/* Weight Unit Selection */}
            <div className="row" style={{ marginBottom: '2rem' }}>
              <div className="col s12">
                <h4 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Weight Unit</h4>
                <div className="row">
                  <div className="col s6">
                    <label>
                      <input
                        type="radio"
                        name="weightUnit"
                        value="pounds"
                        checked={formData.weightUnit === 'pounds'}
                        onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                      />
                      <span style={{ color: '#ffffff', fontSize: '1.1rem' }}>Pounds (lbs)</span>
                    </label>
                  </div>
                  <div className="col s6">
                    <label>
                      <input
                        type="radio"
                        name="weightUnit"
                        value="kilograms"
                        checked={formData.weightUnit === 'kilograms'}
                        onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                      />
                      <span style={{ color: '#ffffff', fontSize: '1.1rem' }}>Kilograms (kg)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Rep Max Inputs */}
            <div className="row" style={{ marginBottom: '2rem' }}>
              <div className="col s12">
                <h4 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Current Rep Maxes</h4>
                <p style={{ color: '#cccccc', marginBottom: '1.5rem' }}>
                  Enter your current rep max for each lift (e.g., "5 reps × 225 lbs")
                </p>
                
                {CORE_LIFTS.map((lift) => (
                  <div key={lift.key} className="row" style={{ marginBottom: '1.5rem' }}>
                    <div className="col s12">
                      <div className="card" style={{ 
                        backgroundColor: '#2a2a2a',
                        padding: '1rem',
                        borderRadius: '8px'
                      }}>
                        <div className="row valign-wrapper">
                          <div className="col s2">
                            <i className="material-icons" style={{ 
                              fontSize: '2rem',
                              color: '#4CAF50'
                            }}>
                              {lift.icon}
                            </i>
                          </div>
                          <div className="col s10">
                            <h5 style={{ 
                              color: '#ffffff',
                              margin: '0 0 1rem 0',
                              fontSize: '1.3rem'
                            }}>
                              {lift.name}
                            </h5>
                            <div className="row">
                              <div className="col s6">
                                <div className="input-field">
                                  <input
                                    type="number"
                                    id={`${lift.key}Reps`}
                                    value={formData[`${lift.key}Reps` as keyof FormData] as number}
                                    onChange={(e) => handleInputChange(`${lift.key}Reps` as keyof FormData, parseInt(e.target.value) || 1)}
                                    min="1"
                                    max="20"
                                    style={{
                                      color: '#ffffff',
                                      borderBottom: '1px solid #4CAF50'
                                    }}
                                  />
                                  <label 
                                    htmlFor={`${lift.key}Reps`}
                                    style={{ color: '#cccccc' }}
                                  >
                                    Reps
                                  </label>
                                </div>
                              </div>
                              <div className="col s6">
                                <div className="input-field">
                                  <input
                                    type="number"
                                    id={`${lift.key}Weight`}
                                    value={formData[`${lift.key}Weight` as keyof FormData] as number}
                                    onChange={(e) => handleInputChange(`${lift.key}Weight` as keyof FormData, parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.5"
                                    style={{
                                      color: '#ffffff',
                                      borderBottom: '1px solid #4CAF50'
                                    }}
                                  />
                                  <label 
                                    htmlFor={`${lift.key}Weight`}
                                    style={{ color: '#cccccc' }}
                                  >
                                    Weight ({formData.weightUnit === 'pounds' ? 'lbs' : 'kg'})
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Plates */}
            <div className="row" style={{ marginBottom: '2rem' }}>
              <div className="col s12">
                <h4 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Available Plates</h4>
                <p style={{ color: '#cccccc', marginBottom: '1rem' }}>
                  Select the plates you have available at your gym
                </p>
                <div className="row">
                  {[100, 45, 35, 25, 10, 5, 2.5].map((plate) => (
                    <div key={plate} className="col s6 m4 l3">
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.availablePlates.includes(plate)}
                          onChange={() => togglePlate(plate)}
                        />
                        <span style={{ 
                          color: '#ffffff',
                          marginLeft: '0.5rem',
                          fontSize: '1rem'
                        }}>
                          {plate} {formData.weightUnit === 'pounds' ? 'lbs' : 'kg'}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="row">
                <div className="col s12">
                  <div className="card-panel red darken-2" style={{ 
                    color: '#ffffff',
                    textAlign: 'center',
                    borderRadius: '8px'
                  }}>
                    <i className="material-icons left">error</i>
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="row">
              <div className="col s12 center-align">
                <button
                  type="submit"
                  disabled={isSubmitting || formData.squatWeight === 0 || formData.benchWeight === 0 || formData.deadliftWeight === 0 || formData.ohpWeight === 0}
                  className="btn btn-large"
                  style={{
                    backgroundColor: '#4CAF50',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '0 2rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <i className="material-icons left">hourglass_empty</i>
                      Setting Up...
                    </>
                  ) : (
                    <>
                      <i className="material-icons left">check</i>
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
