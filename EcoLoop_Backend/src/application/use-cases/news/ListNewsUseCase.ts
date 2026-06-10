import { INewsRepository } from "../../../domain/repositories/INewsRepository";

export class ListNewsUseCase {
  constructor(private newsRepo: INewsRepository) {}

  async execute(filter?: { published?: boolean }) {
    return this.newsRepo.listNews(filter);
  }
}
