import { IQuizzesRepository } from "../../../domain/repositories/IQuizzesRepository";
import { ValidationError } from "../../../domain/errors";

export class ListQuizCompletionsUseCase {
  constructor(private quizzesRepo: IQuizzesRepository) {}

  async execute(userId: string) {
    if (!userId) {
      throw new ValidationError("El user_id es requerido");
    }
    return this.quizzesRepo.getCompletionsByUser(userId);
  }
}
