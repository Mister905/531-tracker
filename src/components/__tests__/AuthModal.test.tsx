import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import AuthModal from '../AuthModal';

const mockProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSuccess: jest.fn()
};

describe('AuthModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthModal {...mockProps} />
      </MockedProvider>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account? Register")).toBeInTheDocument();
  });

  it('switches to register form when toggle is clicked', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthModal {...mockProps} />
      </MockedProvider>
    );

    const toggleButton = screen.getByText("Don't have an account? Register");
    fireEvent.click(toggleButton);

    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByText('Already have an account? Login')).toBeInTheDocument();
  });

  it('updates form inputs correctly', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthModal {...mockProps} />
      </MockedProvider>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows username field in register mode', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthModal {...mockProps} />
      </MockedProvider>
    );

    // Switch to register mode
    const toggleButton = screen.getByText("Don't have an account? Register");
    fireEvent.click(toggleButton);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthModal {...mockProps} />
      </MockedProvider>
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthModal {...mockProps} isOpen={false} />
      </MockedProvider>
    );

    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('validates required fields', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthModal {...mockProps} />
      </MockedProvider>
    );

    const submitButton = screen.getByText('Login');
    fireEvent.click(submitButton);

    // Form should not submit without required fields
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Password')).toBeRequired();
  });
});
