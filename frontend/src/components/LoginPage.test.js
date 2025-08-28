import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// Mock the useAuth hook
jest.mock('../auth/useAuth', () => ({
  useAuth: jest.fn()
}));

const mockUseAuth = require('../auth/useAuth').useAuth;

// Wrapper component to provide router context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render login page with title', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      signinRedirect: jest.fn()
    });

    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Report Mapper')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Report Mapper')).toBeInTheDocument();
  });

  test('should render login button when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      signinRedirect: jest.fn()
    });

    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Login with Keycloak')).toBeInTheDocument();
  });

  test('should call signinRedirect when login button is clicked', () => {
    const mockSigninRedirect = jest.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      signinRedirect: mockSigninRedirect
    });

    renderWithRouter(<LoginPage />);
    
    const loginButton = screen.getByText('Login with Keycloak');
    fireEvent.click(loginButton);
    
    expect(mockSigninRedirect).toHaveBeenCalled();
  });

  test('should render welcome message when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      signinRedirect: jest.fn()
    });

    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('You are already logged in!')).toBeInTheDocument();
    expect(screen.getByText('Go to Map')).toBeInTheDocument();
  });

  test('should render navigation links', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      signinRedirect: jest.fn()
    });

    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Map')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Observation')).toBeInTheDocument();
  });

  test('should render description text', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      signinRedirect: jest.fn()
    });

    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText(/Upload photos with location data/)).toBeInTheDocument();
    expect(screen.getByText(/Create detailed observations/)).toBeInTheDocument();
  });

  test('should render footer text', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      signinRedirect: jest.fn()
    });

    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText(/© 2024 Report Mapper/)).toBeInTheDocument();
  });
});
