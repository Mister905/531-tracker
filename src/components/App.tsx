'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import AuthModal from './AuthModal';
import InitialSetupForm from './InitialSetupForm';
import SummaryTable from './SummaryTable';
import CycleDisplay from './CycleDisplay';

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    user {
      id
      email
      username
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

interface UserProfile {
  id: string;
  email: string;
  username: string;
  weightUnit: string;
  availablePlates: string;
  squatOneRepMax: number | null;
  squatTrainingMax: number | null;
  benchOneRepMax: number | null;
  benchTrainingMax: number | null;
  deadliftOneRepMax: number | null;
  deadliftTrainingMax: number | null;
  ohpOneRepMax: number | null;
  ohpTrainingMax: number | null;
}

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing auth token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setShowAuth(true);
    }
  }, []);

  // Query user profile
  const { data: userData, loading: userLoading, refetch: refetchUser } = useQuery(GET_USER_PROFILE, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
    onCompleted: (data) => {
      if (data?.user) {
        setUser(data.user);
        // Check if user has completed setup
        const hasSetup = data.user.squatOneRepMax && 
                        data.user.benchOneRepMax && 
                        data.user.deadliftOneRepMax && 
                        data.user.ohpOneRepMax;
        setShowSetup(!hasSetup);
      }
    },
    onError: () => {
      // If query fails, user might not be authenticated
      setIsAuthenticated(false);
      setShowAuth(true);
    }
  });

  const handleAuthSuccess = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    setShowAuth(false);
    // Check if user needs setup
    const hasSetup = userData.squatOneRepMax && 
                    userData.benchOneRepMax && 
                    userData.deadliftOneRepMax && 
                    userData.ohpOneRepMax;
    setShowSetup(!hasSetup);
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    refetchUser(); // Refresh user data
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setShowAuth(true);
    setShowSetup(false);
  };

  // Show loading state
  if (isAuthenticated && userLoading) {
    return (
      <div className="container center-align" style={{ marginTop: '100px' }}>
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
        <p style={{ color: '#ffffff', marginTop: '20px' }}>Loading...</p>
      </div>
    );
  }

  // Show auth modal
  if (!isAuthenticated || showAuth) {
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
        
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // Show setup form
  if (showSetup) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#121212',
        padding: '20px 0'
      }}>
        <InitialSetupForm onComplete={handleSetupComplete} />
      </div>
    );
  }

  // Show main app
  if (!user) {
    return (
      <div className="container center-align" style={{ marginTop: '50px' }}>
        <p style={{ color: '#ffffff' }}>Loading user data...</p>
      </div>
    );
  }

  const cycleUserData = {
    squatOneRepMax: user.squatOneRepMax || 0,
    benchOneRepMax: user.benchOneRepMax || 0,
    deadliftOneRepMax: user.deadliftOneRepMax || 0,
    ohpOneRepMax: user.ohpOneRepMax || 0,
    availablePlates: JSON.parse(user.availablePlates || '[]'),
    weightUnit: user.weightUnit as 'pounds' | 'kilograms'
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#121212',
      padding: '20px 0'
    }}>
      {/* Header */}
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="row">
          <div className="col s12">
            <div className="card" style={{ 
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div className="card-content" style={{ padding: '1.5rem' }}>
                <div className="row valign-wrapper">
                  <div className="col s10">
                    <h1 style={{ 
                      color: '#4CAF50',
                      margin: 0,
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}>
                      <i className="material-icons left" style={{ fontSize: '2rem' }}>fitness_center</i>
                      5/3/1 Tracker
                    </h1>
                    <p style={{ 
                      color: '#cccccc',
                      margin: '0.5rem 0 0 0',
                      fontSize: '1.1rem'
                    }}>
                      Welcome back, {user.username}!
                    </p>
                  </div>
                  <div className="col s2 right-align">
                    <button
                      className="btn-flat"
                      onClick={handleLogout}
                      style={{ 
                        color: '#ff6b6b',
                        fontSize: '0.9rem'
                      }}
                    >
                      <i className="material-icons left">logout</i>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <SummaryTable userData={user} />

        {/* Cycle Display */}
        <CycleDisplay userData={cycleUserData} />
      </div>
    </div>
  );
}