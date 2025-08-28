class ImageUploadService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async uploadImage(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add optional metadata
    if (metadata.latitude && metadata.longitude) {
      formData.append('latitude', metadata.latitude);
      formData.append('longitude', metadata.longitude);
    }
    
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    
    if (metadata.imageGeneratedTime) {
      formData.append('imageGeneratedTime', metadata.imageGeneratedTime);
    }

    const response = await this.apiClient.post('/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async uploadMultipleImages(files, metadata = {}) {
    const uploadPromises = files.map(file => 
      this.uploadImage(file, metadata)
    );
    
    return Promise.all(uploadPromises);
  }
}

export default ImageUploadService;
