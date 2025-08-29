import { renderHook, act } from '@testing-library/react';
import { useObservationForm } from './useObservationForm';
import ObservationService from '../services/observationService';
import ImageUploadService from '../services/imageUploadService';

// Mock the auth hook
jest.mock('../auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { name: 'Test User' }
  })
}));

// Mock services
const mockObservationService = {
  getAvailableImages: jest.fn(),
  createObservation: jest.fn()
} as jest.Mocked<ObservationService>;

const mockUploadService = {
  uploadMultipleImages: jest.fn()
} as jest.Mocked<ImageUploadService>;
