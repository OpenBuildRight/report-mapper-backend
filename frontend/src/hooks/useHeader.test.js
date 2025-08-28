import { renderHook, act } from '@testing-library/react';
import { useHeader } from './useHeader';

// Mock the useAuth hook
jest.mock('../auth/useAuth', () => ({
  useAuth: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

describe('useHeader', () => {
  const mockUseAuth = require('../auth/useAuth').useAuth;
  const mockUseNavigate = require('react-router-dom').useNavigate;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(jest.fn());
  });

  test('should initialize with default state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signoutRedirect: jest.fn(),
      isAuthenticated: false
    });

    const { result } = renderHook(() => useHeader());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.showUserDropdown).toBe(false);
  });

  test('should handle login', () => {
    const mockNavigate = jest.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseAuth.mockReturnValue({
      user: null,
      signoutRedirect: jest.fn(),
      isAuthenticated: false
    });

    const { result } = renderHook(() => useHeader());

    act(() => {
      result.current.handleLogin();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('should handle logout', () => {
    const mockSignoutRedirect = jest.fn();
    mockUseAuth.mockReturnValue({
      user: { profile: { name: 'John Doe' } },
      signoutRedirect: mockSignoutRedirect,
      isAuthenticated: true
    });

    const { result } = renderHook(() => useHeader());

    act(() => {
      result.current.handleLogout();
    });

    expect(mockSignoutRedirect).toHaveBeenCalled();
    expect(result.current.showUserDropdown).toBe(false);
  });

  test('should toggle user dropdown', () => {
    mockUseAuth.mockReturnValue({
      user: { profile: { name: 'John Doe' } },
      signoutRedirect: jest.fn(),
      isAuthenticated: true
    });

    const { result } = renderHook(() => useHeader());

    expect(result.current.showUserDropdown).toBe(false);

    act(() => {
      result.current.toggleUserDropdown();
    });

    expect(result.current.showUserDropdown).toBe(true);

    act(() => {
      result.current.toggleUserDropdown();
    });

    expect(result.current.showUserDropdown).toBe(false);
  });

  test('should get user initials from given_name and family_name', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        profile: { 
          given_name: 'John',
          family_name: 'Doe'
        } 
      },
      signoutRedirect: jest.fn(),
      isAuthenticated: true
    });

    const { result } = renderHook(() => useHeader());

    expect(result.current.getUserInitials()).toBe('JD');
  });

  test('should get user initials from name', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        profile: { 
          name: 'Jane Smith'
        } 
      },
      signoutRedirect: jest.fn(),
      isAuthenticated: true
    });

    const { result } = renderHook(() => useHeader());

    expect(result.current.getUserInitials()).toBe('JS');
  });

  test('should get user initials from email', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        profile: { 
          email: 'user@example.com'
        } 
      },
      signoutRedirect: jest.fn(),
      isAuthenticated: true
    });

    const { result } = renderHook(() => useHeader());

    expect(result.current.getUserInitials()).toBe('U');
  });

  test('should return U when no user profile', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signoutRedirect: jest.fn(),
      isAuthenticated: false
    });

    const { result } = renderHook(() => useHeader());

    expect(result.current.getUserInitials()).toBe('U');
  });

  test('should return U when user has no profile', () => {
    mockUseAuth.mockReturnValue({
      user: {},
      signoutRedirect: jest.fn(),
      isAuthenticated: true
    });

    const { result } = renderHook(() => useHeader());

    expect(result.current.getUserInitials()).toBe('U');
  });
});
