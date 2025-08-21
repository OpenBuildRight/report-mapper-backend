import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from 'react-oidc-context';
import LoginPage from '../components/LoginPage';
import Header from '../components/Header';
import App from '../App';

// Mock the useAuth hook
jest.mock('react-oidc-context');

describe('Authentication Components', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('LoginPage', () => {
    test('should render login page with sign in button', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        signinRedirect: jest.fn(),
      });

      render(<LoginPage />);
      
      expect(screen.getByText('Report Mapper')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Please sign in to continue')).toBeInTheDocument();
    });

    test('should call signinRedirect when sign in button is clicked', () => {
      const mockSigninRedirect = jest.fn();
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        signinRedirect: mockSigninRedirect,
      });

      render(<LoginPage />);
      
      fireEvent.click(screen.getByText('Sign In'));
      
      expect(mockSigninRedirect).toHaveBeenCalledTimes(1);
    });

    test('should show loading state', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        signinRedirect: jest.fn(),
      });

      render(<LoginPage />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Header', () => {
    test('should render header with user info when authenticated', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { profile: { name: 'Alice' } },
        signoutRedirect: jest.fn(),
      });

      render(<Header />);
      
      expect(screen.getByText('Report Mapper')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    test('should call signoutRedirect when sign out button is clicked', () => {
      const mockSignoutRedirect = jest.fn();
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { profile: { name: 'Alice' } },
        signoutRedirect: mockSignoutRedirect,
      });

      render(<Header />);
      
      fireEvent.click(screen.getByText('Sign Out'));
      
      expect(mockSignoutRedirect).toHaveBeenCalledTimes(1);
    });

    test('should not render when not authenticated', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        signoutRedirect: jest.fn(),
      });

      const { container } = render(<Header />);
      
      // Header should not render when not authenticated
      expect(container.firstChild).toBeNull();
    });
  });

  describe('App Authentication Flow', () => {
    test('should show login page when not authenticated', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        signinRedirect: jest.fn(),
      });

      render(<App />);
      
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.queryByText('Upload Images')).not.toBeInTheDocument();
    });

    test('should show main app when authenticated', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { profile: { name: 'Alice' } },
        signoutRedirect: jest.fn(),
      });

      render(<App />);
      
      expect(screen.getByText('Upload Images')).toBeInTheDocument();
      expect(screen.getByText('Create Observation')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    test('should show loading state', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        signinRedirect: jest.fn(),
      });

      render(<App />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
