import { IQuizzesRepository } from "../../domain/repositories/IQuizzesRepository";
import { Quiz, QuizCompletion } from "../../domain/entities";
import prisma from "../db/prismaClient";
import { NotFoundError, ValidationError } from "../../domain/errors";

export class PrismaQuizzesRepository implements IQuizzesRepository {
  async listQuizzes(activeOnly?: boolean): Promise<Quiz[]> {
    const where: any = {};
    if (activeOnly) {
      where.is_active = true;
    }
    const result = await prisma.quizzes.findMany({
      where,
      include: {
        quiz_questions: {
          orderBy: {
            order_index: "asc",
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return result as unknown as Quiz[];
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    const result = await prisma.quizzes.findUnique({
      where: { id },
      include: {
        quiz_questions: {
          orderBy: {
            order_index: "asc",
          },
        },
      },
    });
    return result as unknown as Quiz | null;
  }

  async createQuizCompletion(data: {
    user_id: string;
    quiz_id: string;
    score: number;
    points_earned: number;
  }): Promise<QuizCompletion> {
    try {
      const result = await prisma.quiz_completions.create({
        data: {
          user_id: data.user_id,
          quiz_id: data.quiz_id,
          score: data.score,
          points_earned: data.points_earned,
        },
        include: {
          quiz: true,
        },
      });
      return result as unknown as QuizCompletion;
    } catch (error: any) {
      if (error && error.code === "P2002") {
        throw new ValidationError("El usuario ya ha completado este cuestionario.");
      }
      if (error && error.code === "P2003") {
        throw new NotFoundError("Usuario o cuestionario no encontrado.");
      }
      throw error;
    }
  }

  async getCompletionsByUser(userId: string): Promise<QuizCompletion[]> {
    const result = await prisma.quiz_completions.findMany({
      where: { user_id: userId },
      include: {
        quiz: true,
      },
      orderBy: {
        completed_at: "desc",
      },
    });
    return result as unknown as QuizCompletion[];
  }

  async completeQuizTransaction(data: {
    user_id: string;
    quiz_id: string;
    score: number;
    points_earned: number;
  }): Promise<QuizCompletion> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create quiz completion
        const completion = await tx.quiz_completions.create({
          data: {
            user_id: data.user_id,
            quiz_id: data.quiz_id,
            score: data.score,
            points_earned: data.points_earned,
          },
          include: {
            quiz: true,
          },
        });

        // 2. Increment profile eco_points atomically
        await tx.profiles.update({
          where: { id: data.user_id },
          data: {
            eco_points: {
              increment: data.points_earned,
            },
          },
        });

        return completion;
      });
      return result as unknown as QuizCompletion;
    } catch (error: any) {
      if (error && error.code === "P2002") {
        throw new ValidationError("El usuario ya ha completado este cuestionario.");
      }
      if (error && error.code === "P2003") {
        throw new NotFoundError("Usuario o cuestionario no encontrado.");
      }
      if (error && error.code === "P2025") {
        throw new NotFoundError("Usuario no encontrado.");
      }
      throw error;
    }
  }
}

export const quizzesRepository = new PrismaQuizzesRepository();
export default quizzesRepository;
