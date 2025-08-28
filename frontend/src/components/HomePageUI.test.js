import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePageUI from './HomePageUI';

// Mock the Map component
jest.mock('./Map', () => {
  return function MockMap() {
    return <div data-testid="map">Map Component</div>;
  };
});

describe('HomePageUI', () => {
  const defaultProps = {
    isAuthenticated: false
  };

  test('should render map component', () => {
    render(<HomePageUI {...defaultProps} />);
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  test('should render with authentication status', () => {
    render(<HomePageUI {...defaultProps} isAuthenticated={true} />);
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });
});
