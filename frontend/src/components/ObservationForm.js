import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ObservationForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    observationTime: '',
    latitude: '',
    longitude: '',
    imageIds: [],
    properties: {}
  });
  
  const [availableImages, setAvailableImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [propertyKey, setPropertyKey] = useState('');
  const [propertyValue, setPropertyValue] = useState('');

  // Load available images (in a real app, you'd fetch this from your API)
  useEffect(() => {
    // For demo purposes, we'll use a mock list
    // In production, you'd fetch this from your API
    setAvailableImages([
      { id: 'demo-image-1', description: 'Demo Image 1' },
      { id: 'demo-image-2', description: 'Demo Image 2' }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelection = (imageId) => {
    setFormData(prev => ({
      ...prev,
      imageIds: prev.imageIds.includes(imageId)
        ? prev.imageIds.filter(id => id !== imageId)
        : [...prev.imageIds, imageId]
    }));
  };

  const addProperty = () => {
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
  };

  const removeProperty = (key) => {
    setFormData(prev => {
      const newProperties = { ...prev.properties };
      delete newProperties[key];
      return {
        ...prev,
        properties: newProperties
      };
    });
  };

  const getCurrentLocation = () => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.latitude || !formData.longitude) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const observationData = {
        title: formData.title,
        description: formData.description,
        observationTime: formData.observationTime || new Date().toISOString(),
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        },
        imageIds: formData.imageIds,
        properties: formData.properties
      };

      const response = await axios.post('/observation', observationData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setMessage({ 
        type: 'success', 
        text: `Observation created successfully! ID: ${response.data.id}` 
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

    } catch (error) {
      console.error('Observation creation error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create observation. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <h2>Create Observation</h2>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter observation title..."
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter observation description..."
            required
          />
        </div>

        <div className="form-group">
          <label>Observation Time</label>
          <input
            type="datetime-local"
            name="observationTime"
            value={formData.observationTime}
            onChange={handleInputChange}
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
                onChange={handleInputChange}
                placeholder="e.g., 40.7128"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="e.g., -74.0060"
                required
              />
            </div>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={getCurrentLocation}
            >
              Get Current Location
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Associated Images</label>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
            {availableImages.length > 0 ? (
              availableImages.map(image => (
                <div key={image.id} style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.imageIds.includes(image.id)}
                      onChange={() => handleImageSelection(image.id)}
                      style={{ marginRight: '10px' }}
                    />
                    {image.description} ({image.id})
                  </label>
                </div>
              ))
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No images available. Upload some images first.
              </p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Properties (Key-Value Pairs)</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Property key"
              value={propertyKey}
              onChange={(e) => setPropertyKey(e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              type="text"
              placeholder="Property value"
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              style={{ flex: 1 }}
            />
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={addProperty}
            >
              Add
            </button>
          </div>
          
          {Object.keys(formData.properties).length > 0 && (
            <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
              {Object.entries(formData.properties).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span><strong>{key}:</strong> {value}</span>
                  <button 
                    type="button" 
                    onClick={() => removeProperty(key)}
                    style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '3px', padding: '2px 8px', cursor: 'pointer' }}
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

export default ObservationForm;
