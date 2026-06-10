import { apiClient } from "@/lib/api-client";

export interface AdminAnalyticsResponse {
  stats: {
    totalUsers: number;
    totalTransactions: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    totalRedemptions: number;
    binsNeedingAttention: number;
  };
  recentTransactions: any[];
  wasteBins: any[];
  recentRedemptions: any[];
}

export const adminService = {
  async getAnalyticsData(): Promise<AdminAnalyticsResponse> {
    return apiClient.get("/api/v1/admin/analytics");
  },
};

export default adminService;
