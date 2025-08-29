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
    propertyKey,
    propertyValue,
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
    setPropertyValue
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
      propertyKey={propertyKey}
      propertyValue={propertyValue}
      
      // Actions
      onInputChange={handleInputChange}
      onImageSelection={handleImageSelection}
      onFileSelect={handleFileSelect}
      onUploadImages={handleUploadImages}
      onAddProperty={addProperty}
      onRemoveProperty={removeProperty}
      onGetCurrentLocation={getCurrentLocation}
      onSubmit={handleSubmit}
      onClearMessage={clearMessage}
      onPropertyKeyChange={setPropertyKey}
      onPropertyValueChange={setPropertyValue}
    />
  );
};

export default ObservationFormContainer;
