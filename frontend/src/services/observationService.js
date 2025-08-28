class ObservationService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async createObservation(observationData) {
    const response = await this.apiClient.post('/observation', observationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async getObservations() {
    const response = await this.apiClient.get('/observation');
    return response.data;
  }

  async getObservation(id) {
    const response = await this.apiClient.get(`/observation/${id}`);
    return response.data;
  }

  async updateObservation(id, observationData) {
    const response = await this.apiClient.put(`/observation/${id}`, observationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async deleteObservation(id) {
    const response = await this.apiClient.delete(`/observation/${id}`);
    return response.data;
  }

  async getAvailableImages() {
    const response = await this.apiClient.get('/images');
    return response.data;
  }
}

export default ObservationService;
