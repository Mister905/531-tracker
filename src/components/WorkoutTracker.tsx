'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const CREATE_WORKOUT = gql`
  mutation CreateWorkout($input: CreateWorkoutInput!) {
    createWorkout(input: $input) {
      id
      date
      notes
      sets {
        id
        setNumber
        reps
        weight
        completed
      }
    }
  }
`;

interface WorkoutSet {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

interface WorkoutTrackerProps {
  liftId: string;
  cycleId: string;
  weekData: {
    week: number;
    sets: Array<{
      setNumber: number;
      reps: number;
      weight: number;
      percentage: number;
      isAmrap: boolean;
    }>;
  };
  onWorkoutComplete: () => void;
}

export default function WorkoutTracker({ 
  liftId, 
  cycleId, 
  weekData, 
  onWorkoutComplete 
}: WorkoutTrackerProps) {
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>(
    weekData.sets.map(set => ({
      setNumber: set.setNumber,
      reps: set.reps,
      weight: set.weight,
      completed: false
    }))
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createWorkout] = useMutation(CREATE_WORKOUT);

  const handleSetChange = (setNumber: number, field: keyof WorkoutSet, value: any) => {
    setWorkoutSets(prev => 
      prev.map(set => 
        set.setNumber === setNumber 
          ? { ...set, [field]: value }
          : set
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createWorkout({
        variables: {
          input: {
            date: new Date().toISOString(),
            notes: notes || null,
            liftId,
            cycleId,
            sets: workoutSets
          }
        }
      });
      
      onWorkoutComplete();
    } catch (error) {
      console.error('Error creating workout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedSets = workoutSets.filter(set => set.completed).length;
  const totalSets = workoutSets.length;
  const progress = (completedSets / totalSets) * 100;

  return (
    <div className="card">
      <div className="card-content">
        <h5 className="text-primary">Week {weekData.week} Workout</h5>
        
        {/* Progress Bar */}
        <div className="progress">
          <div 
            className="determinate" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-secondary">
          {completedSets} of {totalSets} sets completed
        </p>

        <form onSubmit={handleSubmit}>
          {workoutSets.map((set, index) => {
            const originalSet = weekData.sets.find(s => s.setNumber === set.setNumber);
            return (
              <div 
                key={set.setNumber} 
                className={`workout-set ${originalSet?.isAmrap ? 'amrap' : ''}`}
              >
                <div className="row">
                  <div className="col s2">
                    <h6>Set {set.setNumber}</h6>
                    {originalSet?.isAmrap && (
                      <span className="chip">AMRAP</span>
                    )}
                  </div>
                  
                  <div className="col s3">
                    <div className="input-field">
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => handleSetChange(set.setNumber, 'weight', parseFloat(e.target.value) || 0)}
                        className="center-align"
                      />
                      <label className="active">Weight (lbs)</label>
                    </div>
                  </div>
                  
                  <div className="col s3">
                    <div className="input-field">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleSetChange(set.setNumber, 'reps', parseInt(e.target.value) || 0)}
                        className="center-align"
                      />
                      <label className="active">Reps</label>
                    </div>
                  </div>
                  
                  <div className="col s2">
                    <p className="text-secondary">
                      Target: {originalSet?.weight}lbs x {originalSet?.reps}
                    </p>
                    <p className="text-secondary">
                      {originalSet?.percentage}% of TM
                    </p>
                  </div>
                  
                  <div className="col s2">
                    <div className="switch">
                      <label>
                        <input
                          type="checkbox"
                          checked={set.completed}
                          onChange={(e) => handleSetChange(set.setNumber, 'completed', e.target.checked)}
                        />
                        <span className="lever"></span>
                        Complete
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="row">
            <div className="col s12">
              <div className="input-field">
                <textarea
                  id="notes"
                  className="materialize-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <label htmlFor="notes">Workout Notes (Optional)</label>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col s12">
              <button 
                type="submit" 
                className="btn btn-large"
                disabled={isSubmitting || completedSets === 0}
              >
                {isSubmitting ? 'Saving...' : 'Save Workout'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
