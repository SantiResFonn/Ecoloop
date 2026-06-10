import { INewsRepository } from "../../../domain/repositories/INewsRepository";

export class GetNewsByIdUseCase {
  constructor(private newsRepo: INewsRepository) {}

  async execute(id: string) {
    return this.newsRepo.getNewsById(id);
  }
}
