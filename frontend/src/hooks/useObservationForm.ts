import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import ObservationService, { ObservationData, Image, GeoLocation } from '../services/observationService';
import ImageUploadService, { UploadedImage } from '../services/imageUploadService';

export interface FormData {
  title: string;
  description: string;
  observationTime: string;
  latitude: string;
  longitude: string;
  imageIds: string[];
  properties: Record<string, string>; // Changed from any to string to match backend
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
  propertyKey: string;
  propertyValue: string;
  
  // Actions
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleImageSelection: (imageId: string) => void;
  handleFileSelect: (files: File[]) => void;
  handleUploadImages: () => Promise<UploadedImage[] | null>;
  addProperty: () => void;
  removeProperty: (key: string) => void;
  getCurrentLocation: () => void;
  submitObservation: () => Promise<any>;
  clearMessage: () => void;
  setPropertyKey: (value: string) => void;
  setPropertyValue: (value: string) => void;
  handleImageDescriptionChange: (imageId: string, description: string) => void;
  handleLocationFromImage: (location: GeoLocation) => void;
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
  const [propertyKey, setPropertyKey] = useState<string>('');
  const [propertyValue, setPropertyValue] = useState<string>('');

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
    setFormData(prev => ({
      ...prev,
      imageIds: prev.imageIds.includes(imageId)
        ? prev.imageIds.filter(id => id !== imageId)
        : [...prev.imageIds, imageId]
    }));
  }, []);

  const handleFileSelect = useCallback((files: File[]) => {
    setUploadedImages(files);
  }, []);

  const handleUploadImages = useCallback(async (): Promise<UploadedImage[] | null> => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'You must be logged in to upload images.' });
      return null;
    }

    if (uploadedImages.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one image to upload.' });
      return null;
    }

    setUploading(true);
    setMessage(null);

    try {
      const results = await uploadService.uploadMultipleImages(uploadedImages, {});
      
      setMessage({ 
        type: 'success', 
        text: `Successfully uploaded ${results.length} image(s)!` 
      });
      
      // Clear uploaded images
      setUploadedImages([]);
      
      // Add newly uploaded images to available images list
      const newImages = results.map(result => ({
        id: result.id,
        createdTime: result.createdTime,
        imageGeneratedTime: result.imageGeneratedTime,
        location: result.location,
        description: result.description || `Image ${result.id}`
      }));
      
      setAvailableImages(prev => [...prev, ...newImages]);

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

      return results;
    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload images. Please try again.' 
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [uploadedImages, uploadService, isAuthenticated, formData.latitude, formData.longitude]);

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

  const addProperty = useCallback(() => {
    if (propertyKey && propertyValue) {
      setFormData(prev => ({
        ...prev,
        properties: {
          ...prev.properties,
          [propertyKey]: propertyValue
        }
      }));
      setPropertyKey('');
      setPropertyValue('');
    }
  }, [propertyKey, propertyValue]);

  const removeProperty = useCallback((key: string) => {
    setFormData(prev => {
      const newProperties = { ...prev.properties };
      delete newProperties[key];
      return {
        ...prev,
        properties: newProperties
      };
    });
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
          setMessage({ 
            type: 'error', 
            text: 'Unable to get current location. Please enter coordinates manually.' 
          });
        }
      );
    } else {
      setMessage({ 
        type: 'error', 
        text: 'Geolocation is not supported by this browser.' 
      });
    }
  }, []);

  const submitObservation = useCallback(async () => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'You must be logged in to create observations.' });
      return null;
    }

    if (!formData.title || !formData.description || !formData.latitude || !formData.longitude) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return null;
    }

    setLoading(true);
    setMessage(null);

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
        imageIds: formData.imageIds,
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

      return result;
    } catch (error: any) {
      console.error('Observation creation error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create observation. Please try again.' 
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [formData, observationService, isAuthenticated]);

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
    propertyKey,
    propertyValue,
    
    // Actions
    handleInputChange,
    handleImageSelection,
    handleFileSelect,
    handleUploadImages,
    addProperty,
    removeProperty,
    getCurrentLocation,
    submitObservation,
    clearMessage,
    setPropertyKey,
    setPropertyValue,
    handleImageDescriptionChange,
    handleLocationFromImage
  };
};
