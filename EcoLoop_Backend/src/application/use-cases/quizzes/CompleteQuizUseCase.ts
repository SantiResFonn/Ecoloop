import { IQuizzesRepository } from "../../../domain/repositories/IQuizzesRepository";
import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors";

export interface CompleteQuizInput {
  user_id: string;
  quiz_id: string;
  answers: { question_id: string; selected_answer: string }[];
}

export class CompleteQuizUseCase {
  constructor(
    private quizzesRepo: IQuizzesRepository,
    private profilesRepo: IProfilesRepository
  ) {}

  async execute(input: CompleteQuizInput) {
    const { user_id, quiz_id, answers } = input;

    if (!user_id || !quiz_id || !answers || !Array.isArray(answers)) {
      throw new ValidationError("user_id, quiz_id y answers (array) son requeridos");
    }

    // 1. Get quiz and verify it exists
    const quiz = await this.quizzesRepo.getQuizById(quiz_id);
    if (!quiz) {
      throw new NotFoundError("Quiz no encontrado");
    }

    // 2. Verify quiz is active
    if (!quiz.is_active) {
      throw new ValidationError("Este quiz no está activo");
    }

    // 3. Get profile and verify it exists
    const profile = await this.profilesRepo.getProfileById(user_id);
    if (!profile) {
      throw new NotFoundError("Perfil no encontrado");
    }

    // 4. Verify user has not already completed this quiz
    const completions = await this.quizzesRepo.getCompletionsByUser(user_id);
    const alreadyCompleted = completions.some((c) => c.quiz_id === quiz_id);
    if (alreadyCompleted) {
      throw new ValidationError("El usuario ya ha completado este quiz");
    }

    // 5. Verify the quiz has at least one question
    const questions = quiz.quiz_questions || [];
    const totalQuestions = questions.length;
    if (totalQuestions === 0) {
      throw new ValidationError("Este quiz no tiene preguntas configuradas");
    }

    // 6. Grade the answers on the server
    let score = 0;
    for (const question of questions) {
      const submitted = answers.find((ans) => ans.question_id === question.id);
      if (submitted && submitted.selected_answer === question.correct_answer) {
        score++;
      }
    }

    // 7. Calculate points earned securely
    const pointsEarned = Math.round((score / totalQuestions) * quiz.points_reward);

    // 8. Persist completion and update eco points atomically in a single transaction
    const completion = await this.quizzesRepo.completeQuizTransaction({
      user_id,
      quiz_id,
      score,
      points_earned: pointsEarned,
    });

    return {
      completion,
      points_earned: pointsEarned,
      total_points: profile.eco_points + pointsEarned,
    };
  }
}
