'use client';

import { calculateTrainingMax } from '../lib/531-calculations';

interface SummaryTableProps {
  userData: {
    weightUnit: string;
    squatOneRepMax: number;
    squatTrainingMax: number;
    benchOneRepMax: number;
    benchTrainingMax: number;
    deadliftOneRepMax: number;
    deadliftTrainingMax: number;
    ohpOneRepMax: number;
    ohpTrainingMax: number;
  };
}

const CORE_LIFTS = [
  { 
    key: 'ohp', 
    name: 'Overhead Press', 
    icon: 'sports_gymnastics',
    oneRepMax: 'ohpOneRepMax',
    trainingMax: 'ohpTrainingMax'
  },
  { 
    key: 'bench', 
    name: 'Bench Press', 
    icon: 'sports_gymnastics',
    oneRepMax: 'benchOneRepMax',
    trainingMax: 'benchTrainingMax'
  },
  { 
    key: 'squat', 
    name: 'Squat', 
    icon: 'fitness_center',
    oneRepMax: 'squatOneRepMax',
    trainingMax: 'squatTrainingMax'
  },
  { 
    key: 'deadlift', 
    name: 'Deadlift', 
    icon: 'fitness_center',
    oneRepMax: 'deadliftOneRepMax',
    trainingMax: 'deadliftTrainingMax'
  }
] as const;

export default function SummaryTable({ userData }: SummaryTableProps) {
  const { weightUnit } = userData;
  const unit = weightUnit === 'pounds' ? 'lbs' : 'kg';

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
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
            <i className="material-icons left" style={{ fontSize: '1.8rem' }}>assessment</i>
            Strength Summary
          </h3>
          
          <p className="center-align" style={{ 
            color: '#cccccc',
            marginBottom: '2rem',
            fontSize: '1rem'
          }}>
            Your calculated 1RM and Training Max (90% of 1RM) for each lift
          </p>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="striped" style={{ 
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <thead style={{ backgroundColor: '#1a1a1a' }}>
                <tr>
                  <th style={{ 
                    color: '#ffffff',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    Lift
                  </th>
                  <th style={{ 
                    color: '#ffffff',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    Real 1RM
                  </th>
                  <th style={{ 
                    color: '#ffffff',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    Training Max
                  </th>
                  <th style={{ 
                    color: '#ffffff',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {CORE_LIFTS.map((lift) => {
                  const oneRepMax = userData[lift.oneRepMax as keyof typeof userData] as number;
                  const trainingMax = userData[lift.trainingMax as keyof typeof userData] as number;
                  const percentage = Math.round((trainingMax / oneRepMax) * 100);
                  
                  return (
                    <tr key={lift.key} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ 
                        padding: '1rem',
                        textAlign: 'center',
                        verticalAlign: 'middle'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="material-icons" style={{ 
                            fontSize: '1.5rem',
                            color: '#4CAF50',
                            marginRight: '0.5rem'
                          }}>
                            {lift.icon}
                          </i>
                          <span style={{ 
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            color: '#ffffff'
                          }}>
                            {lift.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#ffffff'
                      }}>
                        {oneRepMax} {unit}
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#4CAF50'
                      }}>
                        {trainingMax} {unit}
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '1rem',
                        color: '#cccccc'
                      }}>
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="row" style={{ marginTop: '2rem' }}>
            <div className="col s12">
              <div className="card-panel" style={{ 
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #4CAF50'
              }}>
                <div className="row valign-wrapper">
                  <div className="col s1">
                    <i className="material-icons" style={{ 
                      fontSize: '1.5rem',
                      color: '#4CAF50'
                    }}>
                      info
                    </i>
                  </div>
                  <div className="col s11">
                    <p style={{ 
                      margin: 0,
                      fontSize: '0.9rem',
                      lineHeight: '1.4'
                    }}>
                      <strong>Training Max:</strong> 90% of your 1RM. This is the weight used for all 5/3/1 calculations. 
                      It ensures you can complete all prescribed reps while maintaining proper form.
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
