import { INewsRepository } from "../../../domain/repositories/INewsRepository";
import { ValidationError } from "../../../domain/errors";

export class UpdateNewsUseCase {
  constructor(private newsRepo: INewsRepository) {}

  async execute(
    id: string,
    data: {
      title?: string;
      content?: string;
      image_url?: string;
      published?: boolean;
    }
  ) {
    let sanitizedTitle = data.title;
    if (data.title !== undefined && data.title !== null) {
      sanitizedTitle = data.title.trim();
      if (!sanitizedTitle) {
        throw new ValidationError("title no puede estar vacío");
      }
    }

    let sanitizedContent = data.content;
    if (data.content !== undefined && data.content !== null) {
      sanitizedContent = data.content.trim();
      if (!sanitizedContent) {
        throw new ValidationError("content no puede estar vacío");
      }
    }

    const updateData = { ...data };
    if (sanitizedTitle !== undefined) {
      updateData.title = sanitizedTitle;
    }
    if (sanitizedContent !== undefined) {
      updateData.content = sanitizedContent;
    }

    return this.newsRepo.updateNews(id, {
      ...updateData,
      updated_at: new Date(),
    });
  }
}
