import { apiClient } from "@/lib/api-client";

export interface CreateStationInput {
  name: string;
  location: string;
  description?: string | null;
}

export interface UpdateStationInput {
  name?: string;
  location?: string;
  description?: string | null;
}

export const stationService = {
  async getStations() {
    return apiClient.get("/api/v1/stations");
  },

  async getStationById(id: string) {
    return apiClient.get(`/api/v1/stations/${id}`);
  },

  async createStation(data: CreateStationInput) {
    return apiClient.post("/api/v1/stations", data);
  },

  async updateStation(id: string, data: UpdateStationInput) {
    return apiClient.put(`/api/v1/stations/${id}`, data);
  },

  async deleteStation(id: string) {
    return apiClient.delete(`/api/v1/stations/${id}`);
  },
};

export default stationService;
