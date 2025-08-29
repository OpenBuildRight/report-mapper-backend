import React, { useState, useRef } from 'react';
import { FormData, Message } from '../hooks/useObservationForm';
import { Image, GeoLocation } from '../services/observationService';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/ObservationForm.css';

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
  onImageDescriptionChange: (imageId: string, description: string) => void;
  onLocationFromImage: (location: GeoLocation) => void;
}

// Map component for location selection
const LocationMap: React.FC<{
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  imageLocations: GeoLocation[];
}> = ({ latitude, longitude, onLocationChange, imageLocations }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const mapContent = (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      style={{ height: isExpanded ? '400px' : '200px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapClickHandler />
      
      {/* Observation location marker */}
      <Marker position={[latitude, longitude]}>
        <Popup>Observation Location</Popup>
      </Marker>
      
      {/* Image location markers */}
      {imageLocations.map((loc, index) => (
        <Marker 
          key={index} 
          position={[loc.latitude, loc.longitude]}
          icon={new Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })}
        >
          <Popup>Image {index + 1} Location</Popup>
        </Marker>
      ))}
    </MapContainer>
  );

  return (
    <div className="location-map-container">
      <div className="map-header">
        <h4>Location Map</h4>
        <button 
          type="button" 
          className="btn btn-sm btn-secondary"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {mapContent}
      <small>Click on the map to set observation location</small>
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

// Image gallery component
const ImageGallery: React.FC<{
  images: Image[];
  selectedImageIds: string[];
  onImageSelection: (imageId: string) => void;
  onImageDescriptionChange: (imageId: string, description: string) => void;
}> = ({ images, selectedImageIds, onImageSelection, onImageDescriptionChange }) => {
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [tempDescription, setTempDescription] = useState('');

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

  if (images.length === 0) {
    return (
      <div className="image-gallery empty">
        <p>No images uploaded yet. Upload some images to get started!</p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <h4>Available Images ({images.length})</h4>
      <div className="image-grid">
        {images.map((image) => (
          <div 
            key={image.id} 
            className={`image-card ${selectedImageIds.includes(image.id) ? 'selected' : ''}`}
          >
                         <div className="image-preview">
               <img 
                 src={`/api/image/download/thumbnail-${image.id}`} 
                 alt={image.description || `Image ${image.id}`}
                 onError={(e) => {
                   e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHN2ZyB4PSIzNSIgeT0iMzUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTkgM0g1QzMuOSAzIDMgMy45IDMgNVYxOUMzIDIwLjEgMy45IDIxIDUgMjFIMTlDMjAuMSAyMSAyMSAyMC4xIDIxIDE5VjVDMjEgMy45IDIwLjEgMyAxOSAzWk0xOSAxOUg1VjVIMTlWMTlaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0xNCAxNEgxMFYxMEgxNFYxNFoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                 }}
               />
             </div>
            <div className="image-info">
              <div className="image-selection">
                <input
                  type="checkbox"
                  id={image.id}
                  checked={selectedImageIds.includes(image.id)}
                  onChange={() => onImageSelection(image.id)}
                />
                <label htmlFor={image.id}>Include in observation</label>
              </div>
              
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
        ))}
      </div>
    </div>
  );
};

// Form validation component
const FormValidation: React.FC<{
  formData: FormData;
}> = ({ formData }) => {
  const requiredFields = [
    { name: 'title', label: 'Title', value: formData.title },
    { name: 'description', label: 'Description', value: formData.description },
    { name: 'latitude', label: 'Latitude', value: formData.latitude },
    { name: 'longitude', label: 'Longitude', value: formData.longitude }
  ];

  const missingFields = requiredFields.filter(field => !field.value.trim());

  if (missingFields.length === 0) {
    return (
      <div className="form-validation valid">
        <span>✅ All required fields are filled</span>
      </div>
    );
  }

  return (
    <div className="form-validation invalid">
      <span>⚠️ Missing required fields:</span>
      <ul>
        {missingFields.map(field => (
          <li key={field.name}>{field.label}</li>
        ))}
      </ul>
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
  onPropertyValueChange,
  onImageDescriptionChange,
  onLocationFromImage
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMap, setShowMap] = useState(false);

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

  // Get image locations for map
  const imageLocations = availableImages
    .filter(img => img.location)
    .map(img => img.location!)
    .filter((loc, index, arr) => 
      arr.findIndex(l => l.latitude === loc.latitude && l.longitude === loc.longitude) === index
    );

  // Auto-populate location from first image with location data
  React.useEffect(() => {
    if (!formData.latitude && !formData.longitude && imageLocations.length > 0) {
      const firstImageLocation = imageLocations[0];
      onLocationFromImage(firstImageLocation);
    }
  }, [imageLocations, formData.latitude, formData.longitude, onLocationFromImage]);

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

      <FormValidation formData={formData} />

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Information</h3>
          
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
        </div>

        <div className="form-section">
          <h3>Location</h3>
          
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
              onLocationChange={(lat, lng) => {
                onInputChange({
                  target: { name: 'latitude', value: lat.toString() }
                } as React.ChangeEvent<HTMLInputElement>);
                onInputChange({
                  target: { name: 'longitude', value: lng.toString() }
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              imageLocations={imageLocations}
            />
          )}
        </div>

        <div className="form-section">
          <h3>Images</h3>
          
          <ImageUploadArea
            uploadedImages={uploadedImages}
            onFileSelect={onFileSelect}
            onUpload={handleAutoUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />

          <ImageGallery
            images={availableImages}
            selectedImageIds={formData.imageIds}
            onImageSelection={onImageSelection}
            onImageDescriptionChange={onImageDescriptionChange}
          />
        </div>

        <div className="form-section">
          <h3>Custom Properties</h3>
          
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
              className="btn btn-secondary"
            >
              Add Property
            </button>
          </div>
          
          {Object.keys(formData.properties).length > 0 && (
            <div className="properties-list">
              {Object.entries(formData.properties).map(([key, value]) => (
                <div key={key} className="property-item">
                  <span className="property-key">{key}:</span>
                  <span className="property-value">{value}</span>
                  <button 
                    type="button" 
                    onClick={() => onRemoveProperty(key)}
                    disabled={loading}
                    className="btn btn-sm btn-danger"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !formData.title || !formData.description || !formData.latitude || !formData.longitude}
          >
            {loading ? 'Creating...' : 'Create Observation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ObservationFormUI;
