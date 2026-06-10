import { INewsRepository } from "../../../domain/repositories/INewsRepository";
import { ValidationError } from "../../../domain/errors";

export class CreateNewsUseCase {
  constructor(private newsRepo: INewsRepository) {}

  async execute(data: {
    title: string;
    content: string;
    image_url?: string;
    published?: boolean;
  }) {
    const title = typeof data?.title === "string" ? data.title.trim() : "";
    const content = typeof data?.content === "string" ? data.content.trim() : "";

    if (!title || !content) {
      throw new ValidationError("title y content son requeridos y no pueden estar vacíos");
    }

    const published = data.published !== undefined ? data.published : false;

    return this.newsRepo.createNews({
      title,
      content,
      image_url: data.image_url,
      published,
    });
  }
}
