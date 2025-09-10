import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import WorkoutTracker from '../WorkoutTracker';

const mockWeekData = {
  week: 1,
  sets: [
    {
      setNumber: 1,
      reps: 5,
      weight: 65,
      percentage: 65,
      isAmrap: false
    },
    {
      setNumber: 2,
      reps: 5,
      weight: 75,
      percentage: 75,
      isAmrap: false
    },
    {
      setNumber: 3,
      reps: 5,
      weight: 85,
      percentage: 85,
      isAmrap: true
    }
  ]
};

const mockProps = {
  liftId: 'test-lift-id',
  cycleId: 'test-cycle-id',
  weekData: mockWeekData,
  onWorkoutComplete: jest.fn()
};

describe('WorkoutTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workout sets correctly', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WorkoutTracker {...mockProps} />
      </MockedProvider>
    );

    expect(screen.getByText('Week 1 Workout')).toBeInTheDocument();
    expect(screen.getByText('Set 1')).toBeInTheDocument();
    expect(screen.getByText('Set 2')).toBeInTheDocument();
    expect(screen.getByText('Set 3')).toBeInTheDocument();
    expect(screen.getByText('AMRAP')).toBeInTheDocument();
  });

  it('displays correct target weights and reps', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WorkoutTracker {...mockProps} />
      </MockedProvider>
    );

    expect(screen.getByDisplayValue('65')).toBeInTheDocument(); // Set 1 weight
    expect(screen.getByDisplayValue('75')).toBeInTheDocument(); // Set 2 weight
    expect(screen.getByDisplayValue('85')).toBeInTheDocument(); // Set 3 weight
    expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // Reps
  });

  it('updates set values when inputs change', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WorkoutTracker {...mockProps} />
      </MockedProvider>
    );

    const weightInput = screen.getAllByDisplayValue('65')[0];
    fireEvent.change(weightInput, { target: { value: '70' } });
    expect(weightInput).toHaveValue(70);
  });

  it('toggles set completion', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WorkoutTracker {...mockProps} />
      </MockedProvider>
    );

    const completionSwitch = screen.getAllByRole('checkbox')[0];
    expect(completionSwitch).not.toBeChecked();
    
    fireEvent.click(completionSwitch);
    expect(completionSwitch).toBeChecked();
  });

  it('updates progress bar when sets are completed', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WorkoutTracker {...mockProps} />
      </MockedProvider>
    );

    expect(screen.getByText('0 of 3 sets completed')).toBeInTheDocument();

    const firstSwitch = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstSwitch);
    
    expect(screen.getByText('1 of 3 sets completed')).toBeInTheDocument();
  });

  it('disables save button when no sets are completed', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WorkoutTracker {...mockProps} />
      </MockedProvider>
    );

    const saveButton = screen.getByText('Save Workout');
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when sets are completed', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WorkoutTracker {...mockProps} />
      </MockedProvider>
    );

    const firstSwitch = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstSwitch);
    
    const saveButton = screen.getByText('Save Workout');
    expect(saveButton).not.toBeDisabled();
  });

  it('allows adding workout notes', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WorkoutTracker {...mockProps} />
      </MockedProvider>
    );

    const notesTextarea = screen.getByLabelText('Workout Notes (Optional)');
    fireEvent.change(notesTextarea, { target: { value: 'Great workout!' } });
    expect(notesTextarea).toHaveValue('Great workout!');
  });
});
