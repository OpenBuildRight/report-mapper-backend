import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import ObservationService, { ObservationData, Image, GeoLocation } from '../services/observationService';
import ImageUploadService, { UploadedImage } from '../services/imageUploadService';
import { useErrorHandler, createUploadError, createValidationError } from './useErrorHandler';
import { ErrorDetails } from '../components/ErrorMessage';

export interface FormData {
  title: string;
  description: string;
  observationTime: string;
  latitude: string;
  longitude: string;
  imageIds: string[];
  properties: Record<string, string>; // Keep for backend compatibility but not used in UI
}

export interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface UseObservationFormReturn {
  // State
  formData: FormData;
  availableImages: Image[];
  uploadedImages: File[];
  uploading: boolean;
  loading: boolean;
  message: Message | null;
  error: ErrorDetails | null;
  
  // Actions
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleImageSelection: (imageId: string) => void;
  handleFileSelect: (files: File[]) => void;
  handleUploadImages: () => Promise<UploadedImage[] | null>;
  getCurrentLocation: () => void;
  submitObservation: () => Promise<any>;
  clearMessage: () => void;
  clearError: () => void;
  handleImageDescriptionChange: (imageId: string, description: string) => void;
  handleLocationFromImage: (location: GeoLocation) => void;
  handleTimeFromImage: (time: string) => void;
}

export const useObservationForm = (
  observationService: ObservationService, 
  uploadService: ImageUploadService
): UseObservationFormReturn => {
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    observationTime: '',
    latitude: '',
    longitude: '',
    imageIds: [],
    properties: {}
  });
  
  const [availableImages, setAvailableImages] = useState<Image[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Use the error handler hook
  const { error, setError, clearError } = useErrorHandler({
    showRetry: true,
    showDismiss: true,
    autoDismiss: false
  });

  // Load available images only if authenticated
  useEffect(() => {
    // Don't automatically load images - user should start with no images
    // and only see them after uploading
    setAvailableImages([]);
  }, [isAuthenticated]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleImageSelection = useCallback((imageId: string) => {
    // This now removes the image from the available images list
    setAvailableImages(prev => prev.filter(img => img.id !== imageId));
    setFormData(prev => ({
      ...prev,
      imageIds: prev.imageIds.filter(id => id !== imageId)
    }));
  }, []);

  const handleFileSelect = useCallback((files: File[]) => {
    setUploadedImages(files);
  }, []);

  const handleUploadImages = useCallback(async (): Promise<UploadedImage[] | null> => {
    if (!isAuthenticated) {
      const authError = createUploadError('You must be logged in to upload images.');
      setError(authError);
      return null;
    }

    if (uploadedImages.length === 0) {
      const validationError = createValidationError('Please select at least one image to upload.');
      setError(validationError);
      return null;
    }

    setUploading(true);
    setMessage(null);
    clearError();

    try {
      const results = await uploadService.uploadMultipleImages(uploadedImages, {});
      
      setMessage({ 
        type: 'success', 
        text: `Successfully uploaded ${results.length} image(s)!` 
      });
      
      // Clear uploaded images
      setUploadedImages([]);
      
      // Add newly uploaded images to available images list and automatically include them
      const newImages = results.map(result => ({
        id: result.id,
        createdTime: result.createdTime,
        imageGeneratedTime: result.imageGeneratedTime,
        location: result.location,
        description: result.description || `Image ${result.id}`
      }));
      
      setAvailableImages(prev => [...prev, ...newImages]);
      
      // Automatically include all uploaded images in the observation
      setFormData(prev => ({
        ...prev,
        imageIds: [...prev.imageIds, ...newImages.map(img => img.id)]
      }));

      // Auto-populate location from first image with location data if location is empty
      const firstImageWithLocation = newImages.find(img => img.location);
      if (firstImageWithLocation?.location && !formData.latitude && !formData.longitude) {
        setFormData(prev => ({
          ...prev,
          latitude: firstImageWithLocation.location!.latitude.toString(),
          longitude: firstImageWithLocation.location!.longitude.toString()
        }));
        setMessage(prev => prev ? {
          ...prev,
          text: `${prev.text} Location auto-populated from image data.`
        } : null);
      }

      // Auto-populate time from first image with time data if time is empty
      const firstImageWithTime = newImages.find(img => img.imageGeneratedTime);
      if (firstImageWithTime?.imageGeneratedTime && !formData.observationTime) {
        const date = new Date(firstImageWithTime.imageGeneratedTime);
        const localDateTime = date.toISOString().slice(0, 16);
        setFormData(prev => ({
          ...prev,
          observationTime: localDateTime
        }));
        setMessage(prev => prev ? {
          ...prev,
          text: `${prev.text} Time auto-populated from image data.`
        } : null);
      }

      return results;
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Create a specific upload error with retry action
      const uploadError = createUploadError(
        error.response?.data?.message || 'Failed to upload images. Please try again.',
        () => handleUploadImages() // Retry action
      );
      
      setError(uploadError);
      return null;
    } finally {
      setUploading(false);
    }
  }, [uploadedImages, uploadService, isAuthenticated, formData.latitude, formData.longitude, formData.observationTime, setError, clearError]);

  const handleImageDescriptionChange = useCallback((imageId: string, description: string) => {
    setAvailableImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, description } 
          : img
      )
    );
  }, []);

  const handleLocationFromImage = useCallback((location: GeoLocation) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    }));
  }, []);

  const handleTimeFromImage = useCallback((time: string) => {
    setFormData(prev => ({
      ...prev,
      observationTime: time
    }));
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
        },
        (error) => {
          const locationError = createUploadError('Unable to get current location. Please enter coordinates manually.');
          setError(locationError);
        }
      );
    } else {
      const browserError = createUploadError('Geolocation is not supported by this browser.');
      setError(browserError);
    }
  }, [setError]);

  const submitObservation = useCallback(async () => {
    if (!isAuthenticated) {
      const authError = createUploadError('You must be logged in to create observations.');
      setError(authError);
      return null;
    }

    if (!formData.title || !formData.description || !formData.latitude || !formData.longitude || availableImages.length === 0) {
      const validationError = createValidationError('Please fill in all required fields and upload at least one image.');
      setError(validationError);
      return null;
    }

    setLoading(true);
    setMessage(null);
    clearError();

    try {
      // Convert datetime-local format to ISO 8601
      let observationTime: string;
      if (formData.observationTime) {
        // datetime-local format is "YYYY-MM-DDTHH:MM", convert to ISO 8601
        const date = new Date(formData.observationTime);
        observationTime = date.toISOString();
      } else {
        observationTime = new Date().toISOString();
      }

      const observationData: ObservationData = {
        title: formData.title,
        description: formData.description,
        observationTime: observationTime,
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        },
        imageIds: availableImages.map(img => img.id), // Use all available images
        properties: formData.properties
      };

      const result = await observationService.createObservation(observationData);
      
      setMessage({ 
        type: 'success', 
        text: 'Observation created successfully!' 
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        observationTime: '',
        latitude: '',
        longitude: '',
        imageIds: [],
        properties: {}
      });
      setAvailableImages([]);

      return result;
    } catch (error: any) {
      console.error('Observation creation error:', error);
      
      const creationError = createUploadError(
        error.response?.data?.message || 'Failed to create observation. Please try again.',
        () => submitObservation() // Retry action
      );
      
      setError(creationError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [formData, availableImages, observationService, isAuthenticated, setError, clearError]);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    // State
    formData,
    availableImages,
    uploadedImages,
    uploading,
    loading,
    message,
    error,
    
    // Actions
    handleInputChange,
    handleImageSelection,
    handleFileSelect,
    handleUploadImages,
    getCurrentLocation,
    submitObservation,
    clearMessage,
    clearError,
    handleImageDescriptionChange,
    handleLocationFromImage,
    handleTimeFromImage
  };
};
