import { apiClient } from "@/lib/api-client";

export interface UpdateProfileInput {
  full_name?: string | null;
  role?: "user" | "worker" | "admin";
  eco_points?: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name?: string;
  role?: "user" | "worker" | "admin";
}

export const profileService = {
  async getProfiles(role?: string) {
    const path = role ? `/api/v1/profiles?role=${role}` : "/api/v1/profiles";
    return apiClient.get(path);
  },

  async getProfileById(id: string) {
    return apiClient.get(`/api/v1/profiles/${id}`);
  },

  async updateProfile(id: string, data: UpdateProfileInput) {
    return apiClient.put(`/api/v1/profiles/${id}`, data);
  },

  async createUser(data: CreateUserInput) {
    return apiClient.post("/api/v1/auth/register", {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role: data.role ?? "user",
    });
  },
};

export default profileService;
