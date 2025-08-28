import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the useAuth hook
jest.mock('./auth/useAuth', () => ({
  useAuth: jest.fn()
}));

const mockUseAuth = require('./auth/useAuth').useAuth;

// Mock the container components
jest.mock('./containers/HeaderContainer', () => {
  return function MockHeaderContainer() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('./containers/HomePageContainer', () => {
  return function MockHomePageContainer() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('./containers/ObservationFormContainer', () => {
  return function MockObservationFormContainer() {
    return <div data-testid="observation-form">Observation Form</div>;
  };
});

jest.mock('./containers/ImageUploadFormContainer', () => {
  return function MockImageUploadFormContainer() {
    return <div data-testid="image-upload-form">Image Upload Form</div>;
  };
});

jest.mock('./components/LoginPage', () => {
  return function MockLoginPage() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false
    });

    render(<App />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should render home page when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true
    });

    render(<App />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('should render home page when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false
    });

    render(<App />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('should redirect to login when accessing protected route without authentication', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false
    });

    // Mock window.location
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });

    render(<App />);
    
    // Navigate to protected route
    window.history.pushState({}, '', '/observation');
    
    // Should redirect to login
    expect(window.location.pathname).toBe('/');
  });
});
