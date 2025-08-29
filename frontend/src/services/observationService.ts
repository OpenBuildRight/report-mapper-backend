import { AxiosInstance } from 'axios';

// GeoLocation interface matching backend GeoLocationDto
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

// ObservationData interface matching backend ObservationCreateDto
export interface ObservationData {
  title: string;
  description: string;
  observationTime: string; // Will be converted to ISO string before sending
  location: GeoLocation;
  imageIds: string[]; // Will be converted to Set on backend
  properties: Record<string, string>; // Changed from any to string to match backend
}

// Observation interface matching backend ObservationDto
export interface Observation {
  id: string;
  title: string;
  description: string;
  observationTime: string; // ISO string from backend
  createdTime: string; // ISO string from backend
  updatedTime: string; // ISO string from backend
  location: GeoLocation;
  imageIds: string[]; // Array from backend
  properties: Record<string, string>; // Changed from any to string to match backend
  enabled: boolean; // Added to match backend
}

// Image interface matching backend ImageDto
export interface Image {
  id: string;
  createdTime: string; // ISO string from backend
  imageGeneratedTime?: string; // ISO string from backend, optional
  location?: GeoLocation; // Optional location from backend
  description?: string; // Optional description from backend
}

class ObservationService {
  private apiClient: AxiosInstance;

  constructor(apiClient: AxiosInstance) {
    this.apiClient = apiClient;
  }

  async createObservation(observationData: ObservationData): Promise<Observation> {
    const response = await this.apiClient.post('/observation', observationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async getObservations(): Promise<Observation[]> {
    const response = await this.apiClient.get('/observation');
    return response.data;
  }

  async getObservation(id: string): Promise<Observation> {
    const response = await this.apiClient.get(`/observation/${id}`);
    return response.data;
  }

  async updateObservation(id: string, observationData: Partial<ObservationData>): Promise<Observation> {
    const response = await this.apiClient.put(`/observation/${id}`, observationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async deleteObservation(id: string): Promise<void> {
    const response = await this.apiClient.delete(`/observation/${id}`);
    return response.data;
  }

  async getAvailableImages(): Promise<Image[]> {
    const response = await this.apiClient.get('/images');
    return response.data;
  }
}

export default ObservationService;
