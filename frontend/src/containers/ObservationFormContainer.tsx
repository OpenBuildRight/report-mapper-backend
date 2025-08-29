import React from 'react';
import ObservationFormUI from '../components/ObservationFormUI';
import { useObservationForm } from '../hooks/useObservationForm';
import ObservationService from '../services/observationService';
import ImageUploadService from '../services/imageUploadService';
import apiClient from '../api/apiClient';

interface ObservationFormContainerProps {
  onSuccess?: (result: any) => void;
}

const ObservationFormContainer: React.FC<ObservationFormContainerProps> = ({ onSuccess }) => {
  // Create service instances
  const observationService = React.useMemo(() => new ObservationService(apiClient), []);
  const uploadService = React.useMemo(() => new ImageUploadService(apiClient), []);
  
  // Use custom hook for logic
  const {
    formData,
    availableImages,
    uploadedImages,
    uploading,
    loading,
    message,
    error,
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
  } = useObservationForm(observationService, uploadService);

  const handleSubmit = async () => {
    const result = await submitObservation();
    if (result && onSuccess) {
      onSuccess(result);
    }
  };

  return (
    <ObservationFormUI
      // State
      formData={formData}
      availableImages={availableImages}
      uploadedImages={uploadedImages}
      uploading={uploading}
      loading={loading}
      message={message}
      error={error}
      
      // Actions
      onInputChange={handleInputChange}
      onImageSelection={handleImageSelection}
      onFileSelect={handleFileSelect}
      onUploadImages={handleUploadImages}
      onGetCurrentLocation={getCurrentLocation}
      onSubmit={handleSubmit}
      onClearMessage={clearMessage}
      onClearError={clearError}
      onImageDescriptionChange={handleImageDescriptionChange}
      onLocationFromImage={handleLocationFromImage}
      onTimeFromImage={handleTimeFromImage}
    />
  );
};

export default ObservationFormContainer;
