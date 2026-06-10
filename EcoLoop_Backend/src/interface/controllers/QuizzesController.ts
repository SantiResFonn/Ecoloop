import { Request, Response } from "express";
import { ListQuizzesUseCase } from "../../application/use-cases/quizzes/ListQuizzesUseCase";
import { GetQuizByIdUseCase } from "../../application/use-cases/quizzes/GetQuizByIdUseCase";
import { CompleteQuizUseCase } from "../../application/use-cases/quizzes/CompleteQuizUseCase";
import { ListQuizCompletionsUseCase } from "../../application/use-cases/quizzes/ListQuizCompletionsUseCase";
import { quizzesRepository } from "../../infrastructure/repositories/quizzesRepository";
import { profilesRepository } from "../../infrastructure/repositories/profilesRepository";
import { ValidationError, NotFoundError } from "../../domain/errors";
import { Quiz, QuizQuestion } from "../../domain/entities";

type SanitizedQuizQuestion = Omit<QuizQuestion, "correct_answer">;
type SanitizedQuiz = Omit<Quiz, "quiz_questions"> & {
  quiz_questions?: SanitizedQuizQuestion[];
};

const handleError = (res: Response, err: unknown) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message || "Cuestionario no encontrado" });
  }

  if (err && typeof err === "object") {
    const errorObj = err as Record<string, unknown>;
    if (errorObj.name === "ValidationError" && typeof errorObj.message === "string") {
      return res.status(400).json({ error: errorObj.message });
    }
    if (errorObj.name === "NotFoundError" && typeof errorObj.message === "string") {
      return res.status(404).json({ error: errorObj.message });
    }
    if (typeof errorObj.message === "string" && errorObj.message.toLowerCase().includes("not found")) {
      return res.status(404).json({ error: errorObj.message });
    }
    if (typeof errorObj.message === "string") {
      return res.status(500).json({ error: errorObj.message });
    }
  }

  return res.status(500).json({ error: "Error interno del servidor" });
};

export class QuizzesController {
  private listQuizzesUseCase = new ListQuizzesUseCase(quizzesRepository);
  private getQuizByIdUseCase = new GetQuizByIdUseCase(quizzesRepository);
  private completeQuizUseCase = new CompleteQuizUseCase(quizzesRepository, profilesRepository);
  private listQuizCompletionsUseCase = new ListQuizCompletionsUseCase(quizzesRepository);

  private sanitizeQuiz(quiz: Quiz): SanitizedQuiz {
    if (!quiz.quiz_questions) {
      return quiz;
    }
    const sanitizedQuestions = quiz.quiz_questions.map(({ correct_answer, ...q }) => q);
    return {
      ...quiz,
      quiz_questions: sanitizedQuestions,
    };
  }

  private sanitizeQuizzes(quizzes: Quiz[]): SanitizedQuiz[] {
    return quizzes.map(quiz => this.sanitizeQuiz(quiz));
  }

  list = async (req: Request, res: Response) => {
    try {
      const activeOnly = req.query.active === "true" ? true : undefined;
      const data = await this.listQuizzesUseCase.execute(activeOnly);
      return res.json(this.sanitizeQuizzes(data));
    } catch (err: unknown) {
      return handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await this.getQuizByIdUseCase.execute(id);
      return res.json(this.sanitizeQuiz(data));
    } catch (err: unknown) {
      return handleError(res, err);
    }
  };

  complete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { answers } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const result = await this.completeQuizUseCase.execute({
        user_id: userId,
        quiz_id: id,
        answers,
      });

      return res.json(result);
    } catch (err: unknown) {
      return handleError(res, err);
    }
  };

  listCompletions = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const data = await this.listQuizCompletionsUseCase.execute(userId);
      return res.json(data);
    } catch (err: unknown) {
      return handleError(res, err);
    }
  };
}

export const quizzesController = new QuizzesController();
export default quizzesController;
