import { AxiosInstance } from 'axios';
import { GeoLocation } from './observationService';

export interface ImageMetadata {
  latitude?: number;
  longitude?: number;
  description?: string;
  imageGeneratedTime?: string;
}

export interface UploadedImage {
  id: string;
  createdTime: string;
  imageGeneratedTime?: string;
  location?: GeoLocation;
  description?: string;
}

class ImageUploadService {
  private apiClient: AxiosInstance;

  constructor(apiClient: AxiosInstance) {
    this.apiClient = apiClient;
  }

  async uploadImage(file: File, metadata: ImageMetadata = {}): Promise<UploadedImage> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add optional metadata
    if (metadata.latitude && metadata.longitude) {
      formData.append('latitude', metadata.latitude.toString());
      formData.append('longitude', metadata.longitude.toString());
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

    // Transform the response to match our UploadedImage interface
    const imageDto = response.data;
    return {
      id: imageDto.id,
      createdTime: imageDto.createdTime,
      imageGeneratedTime: imageDto.imageGeneratedTime,
      location: imageDto.location,
      description: imageDto.description
    };
  }

  async uploadMultipleImages(files: File[], metadata: ImageMetadata = {}): Promise<UploadedImage[]> {
    const uploadPromises = files.map(file => 
      this.uploadImage(file, metadata)
    );
    
    return Promise.all(uploadPromises);
  }
}

export default ImageUploadService;
