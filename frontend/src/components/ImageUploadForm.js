import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { format } from 'date-fns';

const ImageUploadForm = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    description: '',
    imageGeneratedTime: ''
  });

  const onDrop = useCallback((acceptedFiles) => {
    setUploadedImages(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadedImages.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one image to upload.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const uploadPromises = uploadedImages.map(async (file) => {
        const formDataToSend = new FormData();
        formDataToSend.append('file', file);
        
        if (formData.latitude && formData.longitude) {
          formDataToSend.append('latitude', formData.latitude);
          formDataToSend.append('longitude', formData.longitude);
        }
        
        if (formData.description) {
          formDataToSend.append('description', formData.description);
        }
        
        if (formData.imageGeneratedTime) {
          formDataToSend.append('imageGeneratedTime', formData.imageGeneratedTime);
        }

        const response = await axios.post('/image', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data;
      });

      const results = await Promise.all(uploadPromises);
      
      setMessage({ 
        type: 'success', 
        text: `Successfully uploaded ${results.length} image(s)!` 
      });
      
      setUploadedImages([]);
      setFormData({
        latitude: '',
        longitude: '',
        description: '',
        imageGeneratedTime: ''
      });

    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload images. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
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

  return (
    <div className="form-section">
      <h2>Upload Images</h2>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Images</label>
          <div 
            {...getRootProps()} 
            className={`dropzone ${isDragActive ? 'dragover' : ''}`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the images here...</p>
            ) : (
              <p>Drag & drop images here, or click to select files</p>
            )}
          </div>
          
          {uploadedImages.length > 0 && (
            <div className="image-preview">
              {uploadedImages.map((file, index) => (
                <img 
                  key={index} 
                  src={URL.createObjectURL(file)} 
                  alt={`Preview ${index + 1}`} 
                />
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Description (optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter a description for the images..."
          />
        </div>

        <div className="form-group">
          <label>Image Generated Time (optional)</label>
          <input
            type="datetime-local"
            name="imageGeneratedTime"
            value={formData.imageGeneratedTime}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Location (optional)</label>
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

        <button 
          type="submit" 
          className="btn" 
          disabled={uploading || uploadedImages.length === 0}
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
      </form>
    </div>
  );
};

export default ImageUploadForm;
