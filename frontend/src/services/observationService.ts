import { AxiosInstance } from 'axios';

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface ObservationData {
  title: string;
  description: string;
  observationTime: string;
  location: GeoLocation;
  imageIds: string[];
  properties: Record<string, string>;
}

export interface Observation {
  id: string;
  title: string;
  description: string;
  observationTime: string;
  location: GeoLocation;
  imageIds: string[];
  properties: Record<string, string>;
  enabled: boolean;
  createdTime: string;
  updatedTime: string;
}

export interface Image {
  id: string;
  createdTime: string;
  imageGeneratedTime?: string;
  location?: GeoLocation;
  description?: string;
}

export enum AccessLevel {
  PUBLIC = 'PUBLIC',
  OWNER = 'OWNER',
  MODERATOR = 'MODERATOR',
  DENIED = 'DENIED'
}

export interface AccessInfo {
  accessLevel: AccessLevel;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
}

export interface SecureResponse<T> {
  data: T | null;
  accessInfo: AccessInfo;
  message?: string;
}

class ObservationService {
  private apiClient: AxiosInstance;

  constructor(apiClient: AxiosInstance) {
    this.apiClient = apiClient;
  }

  async createObservation(data: ObservationData): Promise<Observation> {
    const response = await this.apiClient.post('/observation', data);
    return response.data;
  }

  async updateObservation(id: string, data: ObservationData): Promise<Observation> {
    const response = await this.apiClient.put(`/observation/${id}`, data);
    return response.data;
  }

  async getObservation(id: string): Promise<SecureResponse<Observation>> {
    const response = await this.apiClient.get(`/observation/${id}`);
    return response.data;
  }

  async deleteObservation(id: string): Promise<{ message: string }> {
    const response = await this.apiClient.delete(`/observation/${id}`);
    return response.data;
  }

  async publishObservation(id: string, enabled: boolean): Promise<Observation> {
    const response = await this.apiClient.patch(`/observation/${id}/publish?enabled=${enabled}`);
    return response.data;
  }

  async getMyDraftObservations(): Promise<Observation[]> {
    const response = await this.apiClient.get('/observation/my-drafts');
    return response.data;
  }

  async getPublishedObservations(): Promise<Observation[]> {
    const response = await this.apiClient.get('/observation/published');
    return response.data;
  }

  async getObservationsForModeration(): Promise<Observation[]> {
    const response = await this.apiClient.get('/observation/moderation');
    return response.data;
  }

  // Legacy method for backward compatibility
  async getAllObservations(): Promise<Observation[]> {
    const response = await this.apiClient.get('/observation');
    return response.data;
  }
}

export default ObservationService;
