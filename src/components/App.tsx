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

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for existing auth token
  useEffect(() => {
    if (!isClient) return;
    
    console.log('App mounted - checking authentication state');
    const token = localStorage.getItem('token');
    console.log('Token found:', !!token);
    
    if (token) {
      // Basic token validation - check if it's a valid JWT format
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          // Decode payload to check expiration
          const payload = JSON.parse(atob(parts[1]));
          const now = Math.floor(Date.now() / 1000);
          
          console.log('Token payload:', payload);
          console.log('Token expires at:', new Date(payload.exp * 1000));
          console.log('Current time:', new Date(now * 1000));
          
          if (payload.exp && payload.exp > now) {
            console.log('Token is valid - setting authenticated');
            setIsAuthenticated(true);
          } else {
            console.log('Token expired - clearing auth state');
            localStorage.removeItem('token');
            setShowAuth(true);
          }
        } else {
          console.log('Invalid token format - clearing auth state');
          localStorage.removeItem('token');
          setShowAuth(true);
        }
      } catch (error) {
        console.log('Token validation error - clearing auth state:', error);
        localStorage.removeItem('token');
        setShowAuth(true);
      }
    } else {
      console.log('No token found - showing auth');
      setShowAuth(true);
    }
    
    setInitialLoadComplete(true);
  }, [isClient]);

  // Query user profile
  const { data: userData, loading: userLoading, refetch: refetchUser } = useQuery(GET_USER_PROFILE, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
    fetchPolicy: 'network-only', // Always fetch from network, not cache
    onCompleted: (data) => {
      console.log('GraphQL query completed:', data);
      if (data?.me) {
        console.log('User data received:', data.me);
        setUser(data.me);
        // Check if user has completed setup
        const hasSetup = data.me.squatOneRepMax && 
                        data.me.benchOneRepMax && 
                        data.me.deadliftOneRepMax && 
                        data.me.ohpOneRepMax;
        console.log('User has setup:', hasSetup);
        setShowSetup(!hasSetup);
      } else {
        console.log('No user data - clearing auth state');
        // If me is null, token is invalid
        setIsAuthenticated(false);
        setShowAuth(true);
        localStorage.removeItem('token');
      }
    },
    onError: (error) => {
      console.log('GraphQL query error:', error);
      // If query fails, user might not be authenticated
      setIsAuthenticated(false);
      setShowAuth(true);
      localStorage.removeItem('token');
    }
  });

  // Add timeout mechanism to prevent infinite loading
  useEffect(() => {
    console.log('Timeout effect - isAuthenticated:', isAuthenticated, 'userLoading:', userLoading);
    if (isAuthenticated && userLoading) {
      console.log('Setting up timeout for query');
      const timeout = setTimeout(() => {
        console.log('Query timeout - clearing auth state');
        setIsAuthenticated(false);
        setShowAuth(true);
        localStorage.removeItem('token');
      }, 10000); // 10 second timeout

      return () => {
        console.log('Clearing timeout');
        clearTimeout(timeout);
      };
    }
  }, [isAuthenticated, userLoading]);

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

  // Show initial loading state during SSR or before client hydration
  if (!isClient || !initialLoadComplete) {
    console.log('Showing initial loading state - isClient:', isClient, 'initialLoadComplete:', initialLoadComplete);
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
        <p style={{ color: '#ffffff', marginTop: '20px' }}>Initializing application...</p>
      </div>
    );
  }

  // Show loading state only when authenticated and loading
  console.log('Render check - isAuthenticated:', isAuthenticated, 'userLoading:', userLoading, 'showAuth:', showAuth, 'user:', !!user);
  
  if (isAuthenticated && userLoading) {
    console.log('Showing loading state');
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
        <p style={{ color: '#ffffff', marginTop: '20px' }}>Loading user data...</p>
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