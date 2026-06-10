import { IQuizzesRepository } from "../../../domain/repositories/IQuizzesRepository";
import { NotFoundError } from "../../../domain/errors";

export class GetQuizByIdUseCase {
  constructor(private quizzesRepo: IQuizzesRepository) {}

  async execute(id: string) {
    const quiz = await this.quizzesRepo.getQuizById(id);
    if (!quiz) {
      throw new NotFoundError("Quiz no encontrado");
    }
    return quiz;
  }
}
