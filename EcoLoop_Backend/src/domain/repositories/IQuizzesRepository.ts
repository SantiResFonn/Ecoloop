import { Quiz, QuizCompletion } from "../entities";

export interface IQuizzesRepository {
  listQuizzes(activeOnly?: boolean): Promise<Quiz[]>;
  getQuizById(id: string): Promise<Quiz | null>;
  createQuizCompletion(data: {
    user_id: string;
    quiz_id: string;
    score: number;
    points_earned: number;
  }): Promise<QuizCompletion>;
  getCompletionsByUser(userId: string): Promise<QuizCompletion[]>;
  completeQuizTransaction(data: {
    user_id: string;
    quiz_id: string;
    score: number;
    points_earned: number;
  }): Promise<QuizCompletion>;
}
