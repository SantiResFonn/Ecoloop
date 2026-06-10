import { IQuizzesRepository } from "../../../domain/repositories/IQuizzesRepository";

export class ListQuizzesUseCase {
  constructor(private quizzesRepo: IQuizzesRepository) {}

  async execute(activeOnly?: boolean) {
    return this.quizzesRepo.listQuizzes(activeOnly);
  }
}
