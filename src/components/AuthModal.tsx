'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        username
      }
    }
  }
`;

const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        username
      }
    }
  }
`;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const [login] = useMutation(LOGIN);
  const [register] = useMutation(REGISTER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const { data } = await login({
          variables: {
            input: {
              email: formData.email,
              password: formData.password
            }
          }
        });
        
        if (data?.login) {
          localStorage.setItem('token', data.login.token);
          onSuccess(data.login.token, data.login.user);
          onClose();
        }
      } else {
        const { data } = await register({
          variables: {
            input: {
              email: formData.email,
              username: formData.username,
              password: formData.password
            }
          }
        });
        
        if (data?.register) {
          localStorage.setItem('token', data.register.token);
          onSuccess(data.register.token, data.register.user);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal" 
      style={{ 
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000
      }}
    >
      <div 
        className="modal-content"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '400px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
        <h4 className="text-primary">
          {isLogin ? 'Login' : 'Register'}
        </h4>
        
        {error && (
          <div className="card-panel red darken-2">
            <span className="white-text">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="email">Email</label>
          </div>

          {!isLogin && (
            <div className="input-field">
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="username">Username</label>
            </div>
          )}

          <div className="input-field">
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="password">Password</label>
          </div>

          <div className="row">
            <div className="col s12">
              <button type="submit" className="btn btn-large">
                {isLogin ? 'Login' : 'Register'}
              </button>
            </div>
          </div>
        </form>

        <div className="row">
          <div className="col s12 center-align">
            <button
              className="btn-flat text-primary"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </div>
        
        <div className="row">
          <div className="col s12 center-align">
            <button className="btn-flat" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
