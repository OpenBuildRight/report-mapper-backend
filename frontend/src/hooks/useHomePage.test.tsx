import { renderHook } from '@testing-library/react';
import { useHomePage } from './useHomePage';

// Mock the useAuth hook
jest.mock('../auth/useAuth', () => ({
  useAuth: jest.fn()
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
} as Storage;
global.localStorage = localStorageMock;

describe('useHomePage', () => {
  const mockUseAuth = require('../auth/useAuth').useAuth;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('should return isAuthenticated from useAuth', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    const { result } = renderHook(() => useHomePage());

    expect(result.current.isAuthenticated).toBe(true);
  });

  test('should return isAuthenticated from useAuth', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    const { result } = renderHook(() => useHomePage());

    expect(result.current.isAuthenticated).toBe(true);
  });

  test('should handle authentication state changes', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    const { result } = renderHook(() => useHomePage());

    expect(result.current.isAuthenticated).toBe(false);
  });
});
