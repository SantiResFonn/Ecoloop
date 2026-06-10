import { apiClient } from "@/lib/api-client";

export interface ScanQrInput {
  qr_code: string;
  weight: number;
}

export const transactionService = {
  async getTransactions(userId?: string) {
    const path = userId ? `/api/v1/transactions?user_id=${userId}` : "/api/v1/transactions";
    return apiClient.get(path);
  },

  async scanQr(input: ScanQrInput) {
    return apiClient.post("/api/v1/transactions/scan", input);
  },
};

export default transactionService;
