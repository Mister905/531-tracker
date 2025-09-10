'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import AuthModal from './AuthModal';
import WorkoutTracker from './WorkoutTracker';
import Analytics from './Analytics';

// GraphQL queries and mutations
const GET_LIFTS = gql`
  query GetLifts {
    lifts {
      id
      name
      oneRepMax
      trainingMax
    }
  }
`;

const GET_CYCLES = gql`
  query GetCycles {
    cycles {
      id
      number
      startDate
      endDate
    }
  }
`;

const CREATE_LIFT = gql`
  mutation CreateLift($input: CreateLiftInput!) {
    createLift(input: $input) {
      id
      name
      oneRepMax
      trainingMax
    }
  }
`;

const GET_CYCLE_DATA = gql`
  query GetCycleData($liftId: ID!) {
    cycleData(liftId: $liftId) {
      cycle {
        id
        number
        startDate
        endDate
      }
      weeks {
        week
        sets {
          setNumber
          reps
          weight
          percentage
          isAmrap
        }
      }
    }
  }
`;

interface Lift {
  id: string;
  name: string;
  oneRepMax: number;
  trainingMax: number;
}

interface CycleData {
  cycle: {
    id: string;
    number: number;
    startDate: string;
    endDate: string;
  };
  weeks: Array<{
    week: number;
    sets: Array<{
      setNumber: number;
      reps: number;
      weight: number;
      percentage: number;
      isAmrap: boolean;
    }>;
  }>;
}

export default function App() {
  const [selectedLift, setSelectedLift] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [showAddLift, setShowAddLift] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showWorkout, setShowWorkout] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [newLift, setNewLift] = useState({ name: '', oneRepMax: 0 });

  // Check for existing auth token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd verify the token and get user data
      setUser({ id: '1', username: 'User' });
    } else {
      setShowAuth(true);
    }
  }, []);

  // Queries
  const { data: liftsData, loading: liftsLoading, refetch: refetchLifts } = useQuery(GET_LIFTS, {
    errorPolicy: 'all',
    skip: !user
  });

  const { data: cycleData, loading: cycleLoading } = useQuery(GET_CYCLE_DATA, {
    variables: { liftId: selectedLift },
    skip: !selectedLift || !user,
    errorPolicy: 'all'
  });

  // Mutations
  const [createLift] = useMutation(CREATE_LIFT, {
    onCompleted: () => {
      refetchLifts();
      setShowAddLift(false);
      setNewLift({ name: '', oneRepMax: 0 });
    }
  });

  const handleAddLift = async () => {
    if (newLift.name && newLift.oneRepMax > 0) {
      try {
        await createLift({
          variables: {
            input: {
              name: newLift.name,
              oneRepMax: newLift.oneRepMax
            }
          }
        });
      } catch (error) {
        console.error('Error creating lift:', error);
      }
    }
  };

  const handleAuthSuccess = (token: string, userData: any) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleStartWorkout = () => {
    setShowWorkout(true);
  };

  const handleWorkoutComplete = () => {
    setShowWorkout(false);
    // Refresh data
    refetchLifts();
  };

  const lifts: Lift[] = liftsData?.lifts || [];
  const cycle: CycleData | null = cycleData?.cycleData || null;
  const selectedWeekData = cycle?.weeks.find(w => w.week === selectedWeek);

  if (!user) {
    return (
      <div className="container center-align" style={{ marginTop: '50px' }}>
        <h1 className="text-primary">
          <i className="material-icons left">fitness_center</i>
          5/3/1 Tracker
        </h1>
        <p className="text-secondary">Please log in to continue</p>
        <button 
          className="btn btn-large"
          onClick={() => setShowAuth(true)}
          style={{ marginTop: '20px' }}
        >
          <i className="material-icons left">login</i>
          Login / Register
        </button>
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="row">
        <div className="col s12">
          <h1 className="center-align text-primary">
            <i className="material-icons left">fitness_center</i>
            5/3/1 Tracker
          </h1>
          <p className="center-align text-secondary">
            Welcome back, {user.username}!
          </p>
        </div>
      </div>

      {/* Lift Selection */}
      <div className="row">
        <div className="col s12">
          <div className="card">
            <div className="card-content">
              <h5 className="text-primary">Select Your Lift</h5>
              {liftsLoading ? (
                <div className="center-align">
                  <div className="preloader-wrapper small active">
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
                </div>
              ) : (
                <div className="row">
                  {lifts.map((lift) => (
                    <div key={lift.id} className="col s6 m3">
                      <div 
                        className={`card lift-card ${selectedLift === lift.id ? 'border-primary' : ''}`}
                        onClick={() => setSelectedLift(lift.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-content center-align">
                          <h6 className="text-primary">{lift.name}</h6>
                          <p className="text-secondary">
                            1RM: {lift.oneRepMax}lbs<br />
                            TM: {lift.trainingMax}lbs
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="col s6 m3">
                    <div 
                      className="card lift-card"
                      onClick={() => setShowAddLift(true)}
                      style={{ cursor: 'pointer', border: '2px dashed var(--border-color)' }}
                    >
                      <div className="card-content center-align">
                        <i className="material-icons text-secondary" style={{ fontSize: '2rem' }}>add</i>
                        <p className="text-secondary">Add Lift</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cycle Data Display */}
      {selectedLift && cycle && !showWorkout && (
        <div className="row">
          <div className="col s12">
            <div className="card">
              <div className="card-content">
                <h5 className="text-primary">
                  Cycle {cycle.cycle.number} - {lifts.find(l => l.id === selectedLift)?.name}
                </h5>
                <p className="text-secondary">
                  {new Date(cycle.cycle.startDate).toLocaleDateString()} - {new Date(cycle.cycle.endDate).toLocaleDateString()}
                </p>
                
                {/* Week Selection */}
                <div className="row">
                  <div className="col s12">
                    <h6 className="text-secondary">Select Week:</h6>
                    <div className="row">
                      {cycle.weeks.map((week) => (
                        <div key={week.week} className="col s3">
                          <button
                            className={`btn ${selectedWeek === week.week ? '' : 'secondary'}`}
                            onClick={() => setSelectedWeek(week.week)}
                            style={{ width: '100%' }}
                          >
                            Week {week.week}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Selected Week Data */}
                {selectedWeekData && (
                  <div className="row">
                    <div className="col s12">
                      <div className="cycle-week">
                        <h6 className="text-accent center-align">Week {selectedWeekData.week}</h6>
                        {selectedWeekData.sets.map((set) => (
                          <div 
                            key={set.setNumber} 
                            className={`workout-set ${set.isAmrap ? 'amrap' : ''}`}
                          >
                            <div className="row">
                              <div className="col s4">
                                <strong>Set {set.setNumber}</strong>
                              </div>
                              <div className="col s4 center-align">
                                {set.weight}lbs
                              </div>
                              <div className="col s4 right-align">
                                {set.reps} reps
                                {set.isAmrap && <span className="chip">AMRAP</span>}
                              </div>
                            </div>
                            <div className="row">
                              <div className="col s12">
                                <small className="text-secondary">
                                  {set.percentage}% of Training Max
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="row">
                          <div className="col s12 center-align">
                            <button 
                              className="btn btn-large"
                              onClick={handleStartWorkout}
                            >
                              Start Workout
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Tracker */}
      {showWorkout && selectedWeekData && (
        <div className="row">
          <div className="col s12">
            <WorkoutTracker
              liftId={selectedLift}
              cycleId={cycle?.cycle.id || ''}
              weekData={selectedWeekData}
              onWorkoutComplete={handleWorkoutComplete}
            />
          </div>
        </div>
      )}

      {/* Add Lift Modal */}
      {showAddLift && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <h4 className="text-primary">Add New Lift</h4>
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="liftName"
                  type="text"
                  value={newLift.name}
                  onChange={(e) => setNewLift({ ...newLift, name: e.target.value })}
                />
                <label htmlFor="liftName">Lift Name</label>
              </div>
              <div className="input-field col s12">
                <input
                  id="oneRepMax"
                  type="number"
                  value={newLift.oneRepMax || ''}
                  onChange={(e) => setNewLift({ ...newLift, oneRepMax: parseFloat(e.target.value) || 0 })}
                />
                <label htmlFor="oneRepMax">One Rep Max (lbs)</label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn secondary"
              onClick={() => setShowAddLift(false)}
            >
              Cancel
            </button>
            <button 
              className="btn"
              onClick={handleAddLift}
            >
              Add Lift
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed-action-btn">
        <a className="btn-floating btn-large bg-primary">
          <i className="material-icons">add</i>
        </a>
        <ul>
          <li>
            <a className="btn-floating bg-secondary" title="Workouts">
              <i className="material-icons">fitness_center</i>
            </a>
          </li>
          <li>
            <a 
              className="btn-floating bg-secondary" 
              title="Analytics"
              onClick={() => setShowAnalytics(true)}
              style={{ cursor: 'pointer' }}
            >
              <i className="material-icons">trending_up</i>
            </a>
          </li>
          <li>
            <a className="btn-floating bg-secondary" title="Profile">
              <i className="material-icons">person</i>
            </a>
          </li>
        </ul>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Analytics Modal */}
      {showAnalytics && (
        <Analytics onClose={() => setShowAnalytics(false)} />
      )}
    </div>
  );
}
