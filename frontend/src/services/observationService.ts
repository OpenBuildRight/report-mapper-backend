import { AxiosInstance } from 'axios';

export interface ObservationData {
  title: string;
  description: string;
  observationTime: string;
  location: {
    latitude: number;
    longitude: number;
  };
  imageIds: string[];
  properties: Record<string, any>;
}

export interface Observation {
  id: string;
  title: string;
  description: string;
  observationTime: string;
  location: {
    latitude: number;
    longitude: number;
  };
  imageIds: string[];
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: string;
  filename: string;
  description?: string;
  url: string;
  uploadedAt: string;
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
