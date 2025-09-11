'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import AuthModal from './AuthModal';
import InitialSetupForm from './InitialSetupForm';
import SummaryTable from './SummaryTable';
import CycleDisplay from './CycleDisplay';
import styles from './App.module.scss';

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
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

interface GetUserProfileResponse {
  me: UserProfile | null;
}

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check localStorage for token on client only
  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setShowAuth(true);
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp > now) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          setShowAuth(true);
        }
      } else {
        localStorage.removeItem('token');
        setShowAuth(true);
      }
    } catch {
      localStorage.removeItem('token');
      setShowAuth(true);
    }
  }, [isClient]);

  const { data, loading, refetch } = useQuery<GetUserProfileResponse>(GET_USER_PROFILE, {
    skip: !isAuthenticated,
    fetchPolicy: 'network-only',
  });

  // Handle query completion
  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
      const needsSetup =
        !data.me.squatOneRepMax &&
        !data.me.benchOneRepMax &&
        !data.me.deadliftOneRepMax &&
        !data.me.ohpOneRepMax;
      setShowSetup(needsSetup);
    } else if (data && !data.me) {
      handleLogout();
    }
  }, [data]);

  const handleAuthSuccess = (token: string, userData: UserProfile) => {
    if (typeof window !== 'undefined') localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    setShowAuth(false);
    const needsSetup =
      !userData.squatOneRepMax &&
      !userData.benchOneRepMax &&
      !userData.deadliftOneRepMax &&
      !userData.ohpOneRepMax;
    setShowSetup(needsSetup);
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    refetch();
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
    setIsAuthenticated(false);
    setShowAuth(true);
    setShowSetup(false);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your 1RM values? This will clear all your current rep maxes and you\'ll need to set them again.')) {
      setShowSetup(true);
    }
  };

  // Show loading state during hydration or when loading user data
  if (!isClient || (isAuthenticated && loading) || (isAuthenticated && !user)) {
    return (
      <div className={`container center-align ${styles.loadingContainer}`}>
        <div className={`preloader-wrapper big active ${styles.preloaderWrapper}`}>
          <div className={`spinner-layer ${styles.spinnerLayer}`}></div>
        </div>
        <p className={styles.loadingText}>
          {!isClient ? 'Loading...' : 'Loading user data...'}
        </p>
      </div>
    );
  }

  // Render auth modal
  if (!isAuthenticated) {
    return (
      <div className={`container center-align ${styles.authContainer}`}>
        <h1 className={styles.authTitle}>
          <i className={`material-icons ${styles.authTitleIcon}`}>fitness_center</i>5/3/1 Tracker
        </h1>
        <p className={styles.authSubtitle}>Please log in to continue</p>
        <AuthModal isOpen={true} onClose={() => {}} onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // Render setup form
  if (showSetup) {
    return (
      <div className={styles.appContainer}>
        <div className={`container ${styles.container}`}>
          {/* Header */}
          <div className="row">
            <div className="col s12">
              <div className={`card ${styles.headerCard}`}>
                <div className={`card-content ${styles.headerCardContent}`}>
                  <div className={`row valign-wrapper ${styles.headerRow}`}>
                    <div className="col s10">
                      <h1 className={styles.headerTitle}>
                        <i className={`material-icons left ${styles.headerTitleIcon}`}>
                          fitness_center
                        </i>
                        5/3/1 Tracker
                      </h1>
                      <p className={styles.headerSubtitle}>
                        Welcome back, {user?.username}! Let's set up your training.
                      </p>
                    </div>
                    <div className="col s2 right-align">
                      <button
                        className={`btn-flat ${styles.logoutButton}`}
                        onClick={handleLogout}
                      >
                        <i className={`material-icons ${styles.logoutIcon}`}>logout</i>Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Form */}
          <InitialSetupForm onComplete={handleSetupComplete} userData={user} />
        </div>
      </div>
    );
  }

  // Prepare user data for cycle display
  const cycleUserData = {
    squatOneRepMax: user.squatOneRepMax || 0,
    squatTrainingMax: user.squatTrainingMax || 0,
    benchOneRepMax: user.benchOneRepMax || 0,
    benchTrainingMax: user.benchTrainingMax || 0,
    deadliftOneRepMax: user.deadliftOneRepMax || 0,
    deadliftTrainingMax: user.deadliftTrainingMax || 0,
    ohpOneRepMax: user.ohpOneRepMax || 0,
    ohpTrainingMax: user.ohpTrainingMax || 0,
    availablePlates: JSON.parse(user.availablePlates || '[]'),
    weightUnit: user.weightUnit as 'pounds' | 'kilograms',
  };

  // Prepare user data for summary table
  const summaryUserData = {
    weightUnit: user.weightUnit,
    squatOneRepMax: user.squatOneRepMax || 0,
    squatTrainingMax: user.squatTrainingMax || 0,
    benchOneRepMax: user.benchOneRepMax || 0,
    benchTrainingMax: user.benchTrainingMax || 0,
    deadliftOneRepMax: user.deadliftOneRepMax || 0,
    deadliftTrainingMax: user.deadliftTrainingMax || 0,
    ohpOneRepMax: user.ohpOneRepMax || 0,
    ohpTrainingMax: user.ohpTrainingMax || 0,
  };

  return (
    <div className={styles.appContainer}>
      <div className={`container ${styles.container}`}>
        {/* Header */}
        <div className="row">
          <div className="col s12">
            <div className={`card ${styles.headerCard}`}>
              <div className={`card-content ${styles.headerCardContent}`}>
                <div className={`row valign-wrapper ${styles.headerRow}`}>
                  <div className="col s10">
                    <h1 className={styles.headerTitle}>
                      <i className={`material-icons left ${styles.headerTitleIcon}`}>
                        fitness_center
                      </i>
                      5/3/1 Tracker
                    </h1>
                    <p className={styles.headerSubtitle}>
                      Welcome back, {user.username}!
                    </p>
                  </div>
                  <div className="col s2 right-align">
                    <button
                      className={`btn-flat ${styles.resetButton}`}
                      onClick={handleReset}
                      style={{ marginRight: '1rem' }}
                    >
                      <i className={`material-icons ${styles.resetIcon}`}>refresh</i>Reset
                    </button>
                    <button
                      className={`btn-flat ${styles.logoutButton}`}
                      onClick={handleLogout}
                    >
                      <i className={`material-icons ${styles.logoutIcon}`}>logout</i>Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <SummaryTable userData={summaryUserData} />

        {/* Cycle Display */}
        <CycleDisplay userData={cycleUserData} />
      </div>
    </div>
  );
}
