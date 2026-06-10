import { apiClient } from "@/lib/api-client";

export interface QuizAnswerInput {
  question_id: string;
  selected_answer: string;
}

export const quizService = {
  async getQuizzes(activeOnly = false) {
    const path = activeOnly ? "/api/v1/quizzes?active=true" : "/api/v1/quizzes";
    return apiClient.get(path);
  },

  async getQuizById(id: string) {
    return apiClient.get(`/api/v1/quizzes/${id}`);
  },

  async submitQuizCompletion(quizId: string, answers: QuizAnswerInput[]) {
    return apiClient.post(`/api/v1/quizzes/${quizId}/complete`, { answers });
  },

  async getCompletions(_userId?: string) {
    return apiClient.get("/api/v1/quizzes/completions/user");
  },
};

export default quizService;
