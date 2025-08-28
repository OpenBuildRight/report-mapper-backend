import React from 'react';

const ObservationFormUI = ({
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
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
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
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onInputChange}
            placeholder="Enter observation title..."
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onInputChange}
            placeholder="Enter observation description..."
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Observation Time</label>
          <input
            type="datetime-local"
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
              <label>Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={onInputChange}
                placeholder="e.g., 40.7128"
                required
                disabled={loading}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Longitude</label>
              <input
                type="number"
                step="any"
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
          <div className="dropzone" onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            onFileSelect(files);
          }} onDragOver={(e) => e.preventDefault()}>
            <input
              type="file"
              multiple
              accept="image/*,.jpeg,.jpg,.png"
              onChange={(e) => onFileSelect(Array.from(e.target.files || []))}
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
                <label htmlFor={image.id}>{image.description}</label>
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
