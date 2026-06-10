import { apiClient } from "@/lib/api-client";

export interface CreateProductInput {
  name: string;
  description?: string | null;
  points_cost: number;
  stock: number;
  category: string;
  image_url?: string | null;
  is_available?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  description?: string | null;
  points_cost?: number;
  stock?: number;
  category?: string;
  image_url?: string | null;
  is_available?: boolean;
}

export const productService = {
  async getProducts(availableOnly = false) {
    const path = availableOnly ? "/api/v1/products?available=true" : "/api/v1/products";
    return apiClient.get(path);
  },

  async getProductById(id: string) {
    return apiClient.get(`/api/v1/products/${id}`);
  },

  async createProduct(data: CreateProductInput) {
    return apiClient.post("/api/v1/products", data);
  },

  async updateProduct(id: string, data: UpdateProductInput) {
    return apiClient.put(`/api/v1/products/${id}`, data);
  },

  async deleteProduct(id: string) {
    return apiClient.delete(`/api/v1/products/${id}`);
  },

  async redeemProduct(_userId: string, productId: string, _pointsSpent: number, quantity = 1) {
    return apiClient.post("/api/v1/redemptions", {
      product_id: productId,
      quantity,
    });
  },

  async getRedemptions(userId?: string) {
    const path = userId ? `/api/v1/redemptions?userId=${userId}` : "/api/v1/redemptions";
    return apiClient.get(path);
  },
};

export default productService;
