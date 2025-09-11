'use client';

import { generateAllLiftsCycleData, LiftType, WeekData, WeightUnit } from '../lib/531-calculations';

interface CycleDisplayProps {
  userData: {
    squatOneRepMax: number;
    benchOneRepMax: number;
    deadliftOneRepMax: number;
    ohpOneRepMax: number;
    availablePlates: number[];
    weightUnit: WeightUnit;
  };
}

const CORE_LIFTS = [
  { key: 'ohp', name: 'Overhead Press', icon: 'sports_gymnastics' },
  { key: 'deadlift', name: 'Deadlift', icon: 'fitness_center' },
  { key: 'bench', name: 'Bench Press', icon: 'sports_gymnastics' },
  { key: 'squat', name: 'Squat', icon: 'fitness_center' }
] as const;

export default function CycleDisplay({ userData }: CycleDisplayProps) {
  const cycleData = generateAllLiftsCycleData(userData);
  const { weightUnit } = userData;
  const unit = weightUnit === 'pounds' ? 'lbs' : 'kg';

  const renderPlates = (plates: { weight: number; count: number }[]) => {
    if (plates.length === 0) {
      return <span style={{ color: '#cccccc', fontSize: '0.9rem' }}>Bar only</span>;
    }

    return (
      <div style={{ fontSize: '0.8rem' }}>
        {plates.map((plate, index) => (
          <span key={index} style={{ 
            display: 'inline-block',
            backgroundColor: '#4CAF50',
            color: '#ffffff',
            padding: '2px 6px',
            borderRadius: '4px',
            margin: '1px',
            fontSize: '0.7rem'
          }}>
            {plate.count}×{plate.weight}
          </span>
        ))}
      </div>
    );
  };

  const renderSet = (set: any, setType: 'warmup' | 'main' | 'bbb') => {
    const setTypeColors = {
      warmup: '#FFC107',
      main: '#4CAF50',
      bbb: '#2196F3'
    };

    const setTypeLabels = {
      warmup: 'Warm-up',
      main: 'Main',
      bbb: 'BBB'
    };

    return (
      <tr key={`${setType}-${set.setNumber}`} style={{ borderBottom: '1px solid #333' }}>
        <td style={{ 
          padding: '0.5rem 0.3rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#ffffff',
          whiteSpace: 'nowrap'
        }}>
          {set.setNumber}
        </td>
        <td style={{ 
          padding: '0.5rem 0.3rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: setTypeColors[setType],
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          {setTypeLabels[setType]}
        </td>
        <td style={{ 
          padding: '0.5rem 0.3rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#ffffff',
          whiteSpace: 'nowrap'
        }}>
          {set.reps}{set.isAmrap ? '+' : ''}
        </td>
        <td style={{ 
          padding: '0.5rem 0.3rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#ffffff',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          {set.weight} {unit}
        </td>
        <td style={{ 
          padding: '0.5rem 0.3rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#cccccc',
          whiteSpace: 'nowrap'
        }}>
          {set.percentage}%
        </td>
        <td style={{ 
          padding: '0.5rem 0.3rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          whiteSpace: 'nowrap'
        }}>
          {renderPlates(set.plates.plates)}
        </td>
      </tr>
    );
  };

  const renderWeek = (week: WeekData, weekNumber: number) => {
    return (
      <div key={weekNumber} className="col s12" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ 
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          height: '100%'
        }}>
          <div className="card-content" style={{ padding: '1rem' }}>
            <h5 className="center-align" style={{ 
              color: '#4CAF50',
              marginBottom: '1rem',
              fontSize: '1.3rem',
              fontWeight: 'bold'
            }}>
              Week {weekNumber}
              {weekNumber === 4 && (
                <span style={{ 
                  fontSize: '0.8rem',
                  color: '#FFC107',
                  marginLeft: '0.5rem'
                }}>
                  (Deload)
                </span>
              )}
            </h5>
            
            <div className="row" style={{ margin: 0 }}>
              {CORE_LIFTS.map((lift) => {
                const liftData = cycleData[lift.key as LiftType][weekNumber - 1];
                
                return (
                  <div key={lift.key} className="col s12 m6 l3" style={{ padding: '0.5rem' }}>
                    <table style={{ 
                      width: '100%',
                      backgroundColor: '#1a1a1a',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      borderCollapse: 'collapse',
                      cellSpacing: 0
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#333' }}>
                          <th style={{ 
                            padding: '0.5rem',
                            color: '#4CAF50',
                            textAlign: 'center',
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                          }}>
                            {lift.name}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {liftData.warmupSets.map(set => (
                          <tr key={`warmup-${set.setNumber}`} style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ 
                              padding: '0.5rem',
                              color: '#ffffff',
                              fontSize: '1rem'
                            }}>
                              {set.reps} × {set.weight} {unit}
                              <span style={{ 
                                color: '#4CAF50',
                                fontSize: '0.9rem',
                                marginLeft: '0.5rem'
                              }}>
                                [{set.plates.plates.map(p => p.weight).join(',')}]
                              </span>
                            </td>
                          </tr>
                        ))}
                        {liftData.mainSets.map(set => (
                          <tr key={`main-${set.setNumber}`} style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ 
                              padding: '0.5rem',
                              color: '#ffffff',
                              fontSize: '1rem'
                            }}>
                              {set.reps}{set.isAmrap ? '+' : ''} × {set.weight} {unit}
                              <span style={{ 
                                color: '#4CAF50',
                                fontSize: '0.9rem',
                                marginLeft: '0.5rem'
                              }}>
                                [{set.plates.plates.map(p => p.weight).join(',')}]
                              </span>
                            </td>
                          </tr>
                        ))}
                        {liftData.bbbSets.map(set => (
                          <tr key={`bbb-${set.setNumber}`} style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ 
                              padding: '0.5rem',
                              color: '#ffffff',
                              fontSize: '1rem'
                            }}>
                              {set.reps} × {set.weight} {unit}
                              <span style={{ 
                                color: '#4CAF50',
                                fontSize: '0.9rem',
                                marginLeft: '0.5rem'
                              }}>
                                [{set.plates.plates.map(p => p.weight).join(',')}]
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ width: '100%', margin: '0 auto', padding: '20px' }}>
      <div className="card" style={{ 
        backgroundColor: '#1a1a1a', 
        color: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div className="card-content" style={{ padding: '2rem' }}>
          <h3 className="center-align" style={{ 
            color: '#4CAF50',
            marginBottom: '2rem',
            fontSize: '1.8rem',
            fontWeight: 'bold'
          }}>
            <i className="material-icons left" style={{ fontSize: '1.8rem' }}>schedule</i>
            5/3/1 Training Cycles
          </h3>
          
          <p className="center-align" style={{ 
            color: '#cccccc',
            marginBottom: '2rem',
            fontSize: '1rem'
          }}>
            Complete 4-week training cycles for all lifts with warm-ups, main sets, and BBB sets
          </p>

          <div className="row">
            {[1, 2, 3, 4].map(weekNumber => 
              renderWeek(cycleData.squat[weekNumber - 1], weekNumber)
            )}
          </div>

          <div className="row" style={{ marginTop: '2rem' }}>
            <div className="col s12">
              <div className="card-panel" style={{ 
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #4CAF50'
              }}>
                <div className="row">
                  <div className="col s12 m4">
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <span style={{ 
                        display: 'inline-block',
                        backgroundColor: '#FFC107',
                        color: '#000000',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        marginRight: '0.5rem'
                      }}>
                        WARM-UP
                      </span>
                      <span style={{ fontSize: '0.9rem' }}>40-60% Training Max</span>
                    </div>
                  </div>
                  <div className="col s12 m4">
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <span style={{ 
                        display: 'inline-block',
                        backgroundColor: '#4CAF50',
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        marginRight: '0.5rem'
                      }}>
                        MAIN
                      </span>
                      <span style={{ fontSize: '0.9rem' }}>5/3/1 Working Sets</span>
                    </div>
                  </div>
                  <div className="col s12 m4">
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <span style={{ 
                        display: 'inline-block',
                        backgroundColor: '#2196F3',
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        marginRight: '0.5rem'
                      }}>
                        BBB
                      </span>
                      <span style={{ fontSize: '0.9rem' }}>5×10 @ 30% Training Max</span>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col s12">
                    <p style={{ 
                      margin: 0,
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                      textAlign: 'center'
                    }}>
                      <strong>Note:</strong> Last set of main work is AMRAP (As Many Reps As Possible). 
                      Week 4 is a deload week with lighter weights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
