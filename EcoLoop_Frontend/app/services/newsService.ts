import { apiClient } from "@/lib/api-client";

export interface CreateNewsInput {
  title: string;
  content: string;
  image_url?: string | null;
  published?: boolean;
}

export interface UpdateNewsInput {
  title?: string;
  content?: string;
  image_url?: string | null;
  published?: boolean;
}

export const newsService = {
  async getNews(publishedOnly = false) {
    const path = publishedOnly ? "/api/v1/news?published=true" : "/api/v1/news";
    return apiClient.get(path);
  },

  async getNewsById(id: string) {
    return apiClient.get(`/api/v1/news/${id}`);
  },

  async createNews(data: CreateNewsInput) {
    return apiClient.post("/api/v1/news", data);
  },

  async updateNews(id: string, data: UpdateNewsInput) {
    return apiClient.put(`/api/v1/news/${id}`, data);
  },

  async deleteNews(id: string) {
    return apiClient.delete(`/api/v1/news/${id}`);
  },
};

export default newsService;
