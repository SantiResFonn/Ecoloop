import { apiClient } from "@/lib/api-client";

export const binService = {
  async getBinByQr(qrCode: string) {
    return apiClient.get(`/api/v1/bins/qr?qr_code=${encodeURIComponent(qrCode)}`);
  },

  async updateBinCapacity(id: string, capacity: number, currentWeight: number) {
    return apiClient.put(`/api/v1/bins/${id}/capacity`, {
      capacity_percentage: capacity,
      current_weight: currentWeight,
    });
  },

  async emptyBin(id: string) {
    return apiClient.post(`/api/v1/bins/${id}/empty`);
  },
};

export default binService;
