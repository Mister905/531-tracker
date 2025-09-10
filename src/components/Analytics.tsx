'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_WORKOUT_HISTORY = gql`
  query GetWorkoutHistory {
    workouts {
      id
      date
      lift {
        id
        name
        oneRepMax
        trainingMax
      }
      cycle {
        id
        number
      }
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
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

interface Workout {
  id: string;
  date: string;
  lift: {
    id: string;
    name: string;
    oneRepMax: number;
    trainingMax: number;
  };
  cycle: {
    id: string;
    number: number;
  };
  sets: WorkoutSet[];
}

interface AnalyticsProps {
  onClose: () => void;
}

export default function Analytics({ onClose }: AnalyticsProps) {
  const [selectedLift, setSelectedLift] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  const { data, loading, error } = useQuery(GET_WORKOUT_HISTORY, {
    errorPolicy: 'all'
  });

  const workouts: Workout[] = data?.workouts || [];

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!workouts.length) return null;

    const now = new Date();
    const timeframes = {
      month: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      quarter: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      year: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    };

    const filteredWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      const timeframeFilter = workoutDate >= timeframes[timeframe];
      const liftFilter = selectedLift === 'all' || workout.lift.id === selectedLift;
      return timeframeFilter && liftFilter;
    });

    // Total workouts
    const totalWorkouts = filteredWorkouts.length;

    // Total sets completed
    const totalSets = filteredWorkouts.reduce((acc, workout) => 
      acc + workout.sets.filter(set => set.completed).length, 0
    );

    // Total volume (weight x reps)
    const totalVolume = filteredWorkouts.reduce((acc, workout) => 
      acc + workout.sets
        .filter(set => set.completed)
        .reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0)
    , 0);

    // Average weight per lift
    const liftStats = filteredWorkouts.reduce((acc, workout) => {
      if (!acc[workout.lift.name]) {
        acc[workout.lift.name] = {
          name: workout.lift.name,
          totalWeight: 0,
          totalReps: 0,
          maxWeight: 0,
          workouts: 0,
          currentTM: workout.lift.trainingMax,
          current1RM: workout.lift.oneRepMax
        };
      }

      const completedSets = workout.sets.filter(set => set.completed);
      const workoutVolume = completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
      const maxWorkoutWeight = Math.max(...completedSets.map(set => set.weight));

      acc[workout.lift.name].totalWeight += workoutVolume;
      acc[workout.lift.name].totalReps += completedSets.reduce((sum, set) => sum + set.reps, 0);
      acc[workout.lift.name].maxWeight = Math.max(acc[workout.lift.name].maxWeight, maxWorkoutWeight);
      acc[workout.lift.name].workouts += 1;

      return acc;
    }, {} as Record<string, any>);

    // Progress over time
    const progressData = Object.values(liftStats).map((lift: any) => ({
      name: lift.name,
      averageWeight: Math.round(lift.totalWeight / lift.totalReps),
      maxWeight: lift.maxWeight,
      totalVolume: lift.totalWeight,
      workouts: lift.workouts,
      currentTM: lift.currentTM,
      current1RM: lift.current1RM
    }));

    // Cycle progress
    const cycleProgress = filteredWorkouts.reduce((acc, workout) => {
      const cycleKey = `Cycle ${workout.cycle.number}`;
      if (!acc[cycleKey]) {
        acc[cycleKey] = { workouts: 0, volume: 0 };
      }
      acc[cycleKey].workouts += 1;
      acc[cycleKey].volume += workout.sets
        .filter(set => set.completed)
        .reduce((sum, set) => sum + (set.weight * set.reps), 0);
      return acc;
    }, {} as Record<string, any>);

    return {
      totalWorkouts,
      totalSets,
      totalVolume,
      liftStats: progressData,
      cycleProgress: Object.entries(cycleProgress).map(([cycle, data]) => ({
        cycle,
        ...data
      }))
    };
  }, [workouts, selectedLift, timeframe]);

  const uniqueLifts = useMemo(() => {
    const lifts = workouts.reduce((acc, workout) => {
      if (!acc.find(lift => lift.id === workout.lift.id)) {
        acc.push(workout.lift);
      }
      return acc;
    }, [] as any[]);
    return lifts;
  }, [workouts]);

  if (loading) {
    return (
      <div className="modal" style={{ display: 'block' }}>
        <div className="modal-content">
          <div className="center-align">
            <div className="preloader-wrapper big active">
              <div className="spinner-layer spinner-red-only">
                <div className="circle-clipper left">
                  <div className="circle"></div>
                </div>
                <div className="gap-patch">
                  <div className="circle"></div>
                </div>
                <div className="circle-clipper right">
                  <div className="circle"></div>
                </div>
              </div>
            </div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="modal" style={{ display: 'block' }}>
        <div className="modal-content">
          <h4 className="text-primary">Analytics</h4>
          <p className="text-secondary">No workout data available yet. Complete some workouts to see your progress!</p>
        </div>
        <div className="modal-footer">
          <button className="btn-flat" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal" style={{ display: 'block', maxHeight: '90vh', overflow: 'auto' }}>
      <div className="modal-content">
        <h4 className="text-primary">
          <i className="material-icons left">trending_up</i>
          Analytics Dashboard
        </h4>

        {/* Filters */}
        <div className="row">
          <div className="col s6">
            <div className="input-field">
              <select
                value={selectedLift}
                onChange={(e) => setSelectedLift(e.target.value)}
                className="browser-default"
              >
                <option value="all">All Lifts</option>
                {uniqueLifts.map(lift => (
                  <option key={lift.id} value={lift.id}>{lift.name}</option>
                ))}
              </select>
              <label>Filter by Lift</label>
            </div>
          </div>
          <div className="col s6">
            <div className="input-field">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="browser-default"
              >
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <label>Timeframe</label>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="row">
          <div className="col s12 m4">
            <div className="card bg-surface">
              <div className="card-content center-align">
                <h3 className="text-primary">{analytics.totalWorkouts}</h3>
                <p className="text-secondary">Total Workouts</p>
              </div>
            </div>
          </div>
          <div className="col s12 m4">
            <div className="card bg-surface">
              <div className="card-content center-align">
                <h3 className="text-secondary">{analytics.totalSets}</h3>
                <p className="text-secondary">Sets Completed</p>
              </div>
            </div>
          </div>
          <div className="col s12 m4">
            <div className="card bg-surface">
              <div className="card-content center-align">
                <h3 className="text-accent">{analytics.totalVolume.toLocaleString()}</h3>
                <p className="text-secondary">Total Volume (lbs)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lift Progress */}
        <div className="row">
          <div className="col s12">
            <div className="card">
              <div className="card-content">
                <h5 className="text-primary">Lift Progress</h5>
                {analytics.liftStats.map((lift, index) => (
                  <div key={index} className="row" style={{ marginBottom: '20px' }}>
                    <div className="col s12">
                      <h6 className="text-secondary">{lift.name}</h6>
                      <div className="row">
                        <div className="col s6 m3">
                          <p><strong>Current 1RM:</strong> {lift.current1RM}lbs</p>
                        </div>
                        <div className="col s6 m3">
                          <p><strong>Training Max:</strong> {lift.currentTM}lbs</p>
                        </div>
                        <div className="col s6 m3">
                          <p><strong>Max Weight:</strong> {lift.maxWeight}lbs</p>
                        </div>
                        <div className="col s6 m3">
                          <p><strong>Total Volume:</strong> {lift.totalVolume.toLocaleString()}lbs</p>
                        </div>
                      </div>
                      <div className="progress">
                        <div 
                          className="determinate" 
                          style={{ width: `${Math.min((lift.maxWeight / lift.current1RM) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-secondary">
                        Max effort: {Math.round((lift.maxWeight / lift.current1RM) * 100)}% of 1RM
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cycle Progress */}
        {analytics.cycleProgress.length > 0 && (
          <div className="row">
            <div className="col s12">
              <div className="card">
                <div className="card-content">
                  <h5 className="text-primary">Cycle Progress</h5>
                  {analytics.cycleProgress.map((cycle, index) => (
                    <div key={index} className="row">
                      <div className="col s4">
                        <strong>{cycle.cycle}</strong>
                      </div>
                      <div className="col s4">
                        <span className="chip">{cycle.workouts} workouts</span>
                      </div>
                      <div className="col s4 right-align">
                        <span className="text-secondary">{cycle.volume.toLocaleString()}lbs volume</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="row">
          <div className="col s12">
            <div className="card">
              <div className="card-content">
                <h5 className="text-primary">Recommendations</h5>
                <div className="collection">
                  {analytics.totalWorkouts < 4 && (
                    <div className="collection-item">
                      <i className="material-icons left text-warning">warning</i>
                      Complete more workouts to get better analytics insights
                    </div>
                  )}
                  {analytics.liftStats.some((lift: any) => lift.maxWeight > lift.currentTM * 0.95) && (
                    <div className="collection-item">
                      <i className="material-icons left text-success">trending_up</i>
                      Consider increasing your Training Max - you're hitting high percentages!
                    </div>
                  )}
                  {analytics.totalVolume > 0 && (
                    <div className="collection-item">
                      <i className="material-icons left text-secondary">fitness_center</i>
                      Average volume per workout: {Math.round(analytics.totalVolume / analytics.totalWorkouts).toLocaleString()}lbs
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="modal-footer">
        <button className="btn-flat" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
