import React from 'react';
import { FormData, Message } from '../hooks/useObservationForm';
import { Image } from '../services/observationService';

interface ObservationFormUIProps {
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
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImageSelection: (imageId: string) => void;
  onFileSelect: (files: File[]) => void;
  onUploadImages: () => Promise<any>;
  onAddProperty: () => void;
  onRemoveProperty: (key: string) => void;
  onGetCurrentLocation: () => void;
  onSubmit: () => void;
  onClearMessage: () => void;
  onPropertyKeyChange: (value: string) => void;
  onPropertyValueChange: (value: string) => void;
}

const ObservationFormUI: React.FC<ObservationFormUIProps> = ({
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
  onInputChange,
  onImageSelection,
  onFileSelect,
  onUploadImages,
  onAddProperty,
  onRemoveProperty,
  onGetCurrentLocation,
  onSubmit,
  onClearMessage,
  onPropertyKeyChange,
  onPropertyValueChange
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileSelect(files);
  };

  return (
    <div className="form-section">
      <h2>Create Observation</h2>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button 
            type="button" 
            onClick={onClearMessage}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={onInputChange}
            placeholder="Enter observation title..."
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onInputChange}
            placeholder="Enter observation description..."
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="observationTime">Observation Time</label>
          <input
            type="datetime-local"
            id="observationTime"
            name="observationTime"
            value={formData.observationTime}
            onChange={onInputChange}
            disabled={loading}
          />
          <small>Leave empty to use current time</small>
        </div>

        <div className="form-group">
          <label>Location *</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="latitude">Latitude</label>
              <input
                type="number"
                step="any"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={onInputChange}
                placeholder="e.g., 40.7128"
                required
                disabled={loading}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="longitude">Longitude</label>
              <input
                type="number"
                step="any"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={onInputChange}
                placeholder="e.g., -74.0060"
                required
                disabled={loading}
              />
            </div>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onGetCurrentLocation}
              disabled={loading}
            >
              Get Current Location
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Upload New Images</label>
          <div className="dropzone" onDrop={handleDrop} onDragOver={handleDragOver}>
            <input
              type="file"
              multiple
              accept="image/*,.jpeg,.jpg,.png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload" style={{ cursor: 'pointer', display: 'block' }}>
              <p>Drag & drop images here, or click to select files</p>
            </label>
          </div>
          
          {uploadedImages.length > 0 && (
            <div className="image-preview">
              {uploadedImages.map((file, index) => (
                <img 
                  key={index} 
                  src={URL.createObjectURL(file)} 
                  alt={`Preview ${index + 1}`} 
                  style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }}
                />
              ))}
            </div>
          )}
          
          {uploadedImages.length > 0 && (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onUploadImages}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Images'}
            </button>
          )}
        </div>

        <div className="form-group">
          <label>Available Images</label>
          <div className="image-selection">
            {availableImages.map((image) => (
              <div key={image.id} className="image-option">
                <input
                  type="checkbox"
                  id={image.id}
                  checked={formData.imageIds.includes(image.id)}
                  onChange={() => onImageSelection(image.id)}
                  disabled={loading}
                />
                <label htmlFor={image.id}>{image.description || `Image ${image.id}`}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Custom Properties</label>
          <div className="property-inputs">
            <input
              type="text"
              placeholder="Property key"
              value={propertyKey}
              onChange={(e) => onPropertyKeyChange(e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Property value"
              value={propertyValue}
              onChange={(e) => onPropertyValueChange(e.target.value)}
              disabled={loading}
            />
            <button 
              type="button" 
              onClick={onAddProperty}
              disabled={loading || !propertyKey || !propertyValue}
            >
              Add Property
            </button>
          </div>
          
          {Object.keys(formData.properties).length > 0 && (
            <div className="properties-list">
              {Object.entries(formData.properties).map(([key, value]) => (
                <div key={key} className="property-item">
                  <span>{key}: {value}</span>
                  <button 
                    type="button" 
                    onClick={() => onRemoveProperty(key)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Observation'}
        </button>
      </form>
    </div>
  );
};

export default ObservationFormUI;
