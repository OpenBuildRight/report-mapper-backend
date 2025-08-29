import React, { useState, useRef } from 'react';
import { FormData, Message } from '../hooks/useObservationForm';
import { Image, GeoLocation } from '../services/observationService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/ObservationForm.css';
import '../styles/ErrorComponents.css';
import ErrorMessage, { ErrorDetails } from './ErrorMessage';
import { useImageUrl } from '../services/imageService';

interface ObservationFormUIProps {
  // State
  formData: FormData;
  availableImages: Image[];
  uploadedImages: File[];
  uploading: boolean;
  loading: boolean;
  message: Message | null;
  error: ErrorDetails | null;
  
  // Actions
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImageSelection: (imageId: string) => void;
  onFileSelect: (files: File[]) => void;
  onUploadImages: () => Promise<any>;
  onGetCurrentLocation: () => void;
  onSubmit: () => void;
  onClearMessage: () => void;
  onClearError: () => void;
  onImageDescriptionChange: (imageId: string, description: string) => void;
  onLocationFromImage: (location: GeoLocation) => void;
  onTimeFromImage: (time: string) => void;
}

// Map component for location display only
const LocationMap: React.FC<{
  latitude: number;
  longitude: number;
}> = ({ latitude, longitude }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="location-map-container">
      <div className="map-header">
        <h4>Observation Location</h4>
        <button 
          type="button" 
          className="btn btn-sm btn-secondary"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: isExpanded ? '400px' : '200px', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        touchZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[latitude, longitude]}>
          <Popup>Observation Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

// Image upload component with progress
const ImageUploadArea: React.FC<{
  uploadedImages: File[];
  onFileSelect: (files: File[]) => void;
  onUpload: () => Promise<any>;
  uploading: boolean;
  uploadProgress: number;
}> = ({ uploadedImages, onFileSelect, onUpload, uploading, uploadProgress }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      onFileSelect(files);
      // Auto-upload after selection
      setTimeout(() => onUpload(), 100);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files);
      // Auto-upload after selection
      setTimeout(() => onUpload(), 100);
    }
  };

  return (
    <div className="image-upload-area">
      <div 
        className={`dropzone ${uploading ? 'uploading' : ''}`} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.jpeg,.jpg,.png"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="dropzone-content">
          {uploading ? (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p>Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <>
              <p>📷 Drag & drop images here, or click to select</p>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Select Images
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Image gallery component with trash icon for removal
const ImageGallery: React.FC<{
  images: Image[];
  onImageSelection: (imageId: string) => void;
  onImageDescriptionChange: (imageId: string, description: string) => void;
}> = ({ images, onImageSelection, onImageDescriptionChange }) => {
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [tempDescription, setTempDescription] = useState('');
  const { getImageUrl, isAuthenticated } = useImageUrl();

  const handleDescriptionEdit = (imageId: string, currentDescription: string) => {
    setEditingDescription(imageId);
    setTempDescription(currentDescription || '');
  };

  const handleDescriptionSave = (imageId: string) => {
    onImageDescriptionChange(imageId, tempDescription);
    setEditingDescription(null);
  };

  const handleDescriptionCancel = () => {
    setEditingDescription(null);
  };

  const handleRemoveImage = (imageId: string) => {
    onImageSelection(imageId); // This will remove it from selected images
  };

  if (images.length === 0) {
    return (
      <div className="image-gallery empty">
        <p>No images uploaded yet. Upload some images to get started!</p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <h4>Observation Images ({images.length})</h4>
      <div className="image-grid">
        {images.map((image) => {
          // For draft observations, images are not published yet
          const imageUrl = getImageUrl(image.id, true, false);
          
          return (
            <div key={image.id} className="image-card">
              <div className="image-preview">
                <img 
                  src={imageUrl}
                  alt={image.description || `Image ${image.id}`}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHN2ZyB4PSIzNSIgeT0iMzUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTkgM0g1QzMuOSAzIDMgMy45IDMgNVYxOUMzIDIwLjEgMy45IDIxIDUgMjFIMTlDMjAuMSAyMSAyMSAyMC4xIDIxIDE5VjVDMjEgMy45IDIwLjEgMyAxOSAzWk0xOSAxOUg1VjVIMTlWMTlaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0xNCAxNEgxMFYxMEgxNFYxNFoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                  }}
                />
                <button 
                  type="button" 
                  className="image-remove-btn"
                  onClick={() => handleRemoveImage(image.id)}
                  title="Remove image"
                >
                  🗑️
                </button>
              </div>
              <div className="image-info">
                <div className="image-description">
                  {editingDescription === image.id ? (
                    <div className="description-edit">
                      <input
                        type="text"
                        value={tempDescription}
                        onChange={(e) => setTempDescription(e.target.value)}
                        placeholder="Enter image description..."
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button 
                          type="button" 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleDescriptionSave(image.id)}
                        >
                          Save
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-secondary"
                          onClick={handleDescriptionCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="description-display">
                      <span>{image.description || 'No description'}</span>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-link"
                        onClick={() => handleDescriptionEdit(image.id, image.description || '')}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                
                {image.location && (
                  <div className="image-location">
                    <small>📍 {image.location.latitude.toFixed(6)}, {image.location.longitude.toFixed(6)}</small>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Form validation component with better UX
const FormValidation: React.FC<{
  formData: FormData;
  hasImages: boolean;
}> = ({ formData, hasImages }) => {
  const requiredFields = [
    { name: 'title', label: 'Title', value: formData.title },
    { name: 'description', label: 'Description', value: formData.description },
    { name: 'latitude', label: 'Latitude', value: formData.latitude },
    { name: 'longitude', label: 'Longitude', value: formData.longitude }
  ];

  const missingFields = requiredFields.filter(field => !field.value.trim());
  const totalRequired = requiredFields.length + (hasImages ? 0 : 1); // +1 for images if none
  const completedFields = requiredFields.length - missingFields.length + (hasImages ? 1 : 0);
  const progressPercentage = (completedFields / totalRequired) * 100;

  if (missingFields.length === 0 && hasImages) {
    return (
      <div className="form-validation valid">
        <span>✅ All required fields are filled</span>
      </div>
    );
  }

  return (
    <div className="form-validation incomplete">
      <div className="validation-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <span>{completedFields} of {totalRequired} required fields completed</span>
      </div>
      {missingFields.length > 0 && (
        <div className="missing-fields">
          <span>Still needed:</span>
          <ul>
            {missingFields.map(field => (
              <li key={field.name}>{field.label}</li>
            ))}
          </ul>
        </div>
      )}
      {!hasImages && (
        <div className="missing-fields">
          <span>Still needed:</span>
          <ul>
            <li>At least one image</li>
          </ul>
        </div>
      )}
    </div>
  );
};

const ObservationFormUI: React.FC<ObservationFormUIProps> = ({
  // State
  formData,
  availableImages,
  uploadedImages,
  uploading,
  loading,
  message,
  error,
  
  // Actions
  onInputChange,
  onImageSelection,
  onFileSelect,
  onUploadImages,
  onGetCurrentLocation,
  onSubmit,
  onClearMessage,
  onClearError,
  onImageDescriptionChange,
  onLocationFromImage,
  onTimeFromImage
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  // Auto-upload with progress
  const handleAutoUpload = async () => {
    if (uploadedImages.length === 0) return;
    
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onUploadImages();
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      setUploadProgress(0);
    }
  };

  // Auto-populate location and time from first image with data
  React.useEffect(() => {
    if (availableImages.length > 0) {
      const firstImageWithLocation = availableImages.find(img => img.location);
      const firstImageWithTime = availableImages.find(img => img.imageGeneratedTime);
      
      if (firstImageWithLocation?.location && !formData.latitude && !formData.longitude) {
        onLocationFromImage(firstImageWithLocation.location);
      }
      
      if (firstImageWithTime?.imageGeneratedTime && !formData.observationTime) {
        // Convert ISO string to datetime-local format
        const date = new Date(firstImageWithTime.imageGeneratedTime);
        const localDateTime = date.toISOString().slice(0, 16);
        onTimeFromImage(localDateTime);
      }
    }
  }, [availableImages, formData.latitude, formData.longitude, formData.observationTime, onLocationFromImage, onTimeFromImage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  const hasValidLocation = formData.latitude && formData.longitude;
  const currentLat = parseFloat(formData.latitude) || 0;
  const currentLng = parseFloat(formData.longitude) || 0;

  return (
    <div className="observation-form">
      <h2>Create Observation</h2>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button 
            type="button" 
            onClick={onClearMessage}
            className="alert-close"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <ErrorMessage 
          error={error} 
          variant="inline"
          className="form-error"
        />
      )}

      <FormValidation formData={formData} hasImages={availableImages.length > 0} />

      <form onSubmit={handleSubmit}>
        {/* Step 1: Images */}
        <div className="form-section">
          <h3>📷 Images</h3>
          
          <ImageUploadArea
            uploadedImages={uploadedImages}
            onFileSelect={onFileSelect}
            onUpload={handleAutoUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />

          <ImageGallery
            images={availableImages}
            onImageSelection={onImageSelection}
            onImageDescriptionChange={onImageDescriptionChange}
          />
        </div>

        {/* Step 2: Basic Information */}
        <div className="form-section">
          <h3>📝 Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="title" className={!formData.title ? 'required' : ''}>
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              placeholder="Enter observation title..."
              required
              disabled={loading}
              className={!formData.title ? 'invalid' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className={!formData.description ? 'required' : ''}>
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              placeholder="Enter observation description..."
              required
              disabled={loading}
              className={!formData.description ? 'invalid' : ''}
              rows={4}
            />
          </div>
        </div>

        {/* Step 3: Time */}
        <div className="form-section">
          <h3>🕒 Time</h3>
          
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
            <small>Leave empty to use current time, or will auto-populate from image data</small>
          </div>
        </div>

        {/* Step 4: Location */}
        <div className="form-section">
          <h3>📍 Location</h3>
          
          <div className="location-inputs">
            <div className="form-group">
              <label htmlFor="latitude" className={!formData.latitude ? 'required' : ''}>
                Latitude *
              </label>
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
                className={!formData.latitude ? 'invalid' : ''}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="longitude" className={!formData.longitude ? 'required' : ''}>
                Longitude *
              </label>
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
                className={!formData.longitude ? 'invalid' : ''}
              />
            </div>
            
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onGetCurrentLocation}
              disabled={loading}
            >
              📍 Get Current Location
            </button>
          </div>

          {hasValidLocation && (
            <LocationMap
              latitude={currentLat}
              longitude={currentLng}
            />
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !formData.title || !formData.description || !formData.latitude || !formData.longitude || availableImages.length === 0}
          >
            {loading ? 'Creating...' : 'Create Observation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ObservationFormUI;
