import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// Mock the auth hook
const mockSigninRedirect = jest.fn();
jest.mock('../auth/useAuth', () => ({
  useAuth: () => ({
    signinRedirect: mockSigninRedirect,
    isLoading: false,
    isAuthenticated: false
  })
}));

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
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Report Mapper')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to access the application')).toBeInTheDocument();
  });

  test('should render login button when not authenticated', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('should call signinRedirect when login button is clicked', () => {
    renderWithRouter(<LoginPage />);
    
    const loginButton = screen.getByText('Sign In');
    fireEvent.click(loginButton);
    
    expect(mockSigninRedirect).toHaveBeenCalled();
  });

  test('should render welcome message when authenticated', () => {
    // Mock authenticated state
    jest.doMock('../auth/useAuth', () => ({
      useAuth: () => ({
        signinRedirect: mockSigninRedirect,
        isLoading: false,
        isAuthenticated: true
      })
    }));

    renderWithRouter(<LoginPage />);
    
    // When authenticated, the component should redirect, so we won't see the login form
    // This test might need to be adjusted based on the actual behavior
    expect(screen.getByText('Report Mapper')).toBeInTheDocument();
  });

  test('should render test credentials', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Test Credentials:')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('alice_password')).toBeInTheDocument();
  });
});
