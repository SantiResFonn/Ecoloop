import { INewsRepository } from "../../../domain/repositories/INewsRepository";

export class DeleteNewsUseCase {
  constructor(private newsRepo: INewsRepository) {}

  async execute(id: string) {
    return this.newsRepo.deleteNews(id);
  }
}
