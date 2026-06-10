import { Request, Response } from "express";
import { ListNewsUseCase } from "../../application/use-cases/news/ListNewsUseCase";
import { GetNewsByIdUseCase } from "../../application/use-cases/news/GetNewsByIdUseCase";
import { CreateNewsUseCase } from "../../application/use-cases/news/CreateNewsUseCase";
import { UpdateNewsUseCase } from "../../application/use-cases/news/UpdateNewsUseCase";
import { DeleteNewsUseCase } from "../../application/use-cases/news/DeleteNewsUseCase";
import { newsRepository } from "../../infrastructure/repositories/newsRepository";
import { ValidationError, NotFoundError } from "../../domain/errors";

function handleError(res: Response, err: any) {
  if (err instanceof ValidationError || err?.name === "ValidationError") {
    return res.status(400).json({ error: err?.message });
  }
  if (
    err?.code === "P2025" ||
    err instanceof NotFoundError ||
    err?.name === "NotFoundError" ||
    err?.message?.toLowerCase().includes("not found")
  ) {
    return res.status(404).json({ error: err?.message || "Artículo no encontrado" });
  }
  return res.status(500).json({ error: err?.message });
}

export class NewsController {
  private listNewsUseCase = new ListNewsUseCase(newsRepository);
  private getNewsByIdUseCase = new GetNewsByIdUseCase(newsRepository);
  private createNewsUseCase = new CreateNewsUseCase(newsRepository);
  private updateNewsUseCase = new UpdateNewsUseCase(newsRepository);
  private deleteNewsUseCase = new DeleteNewsUseCase(newsRepository);

  list = async (req: Request, res: Response) => {
    try {
      const published = req.query.published === "true";
      const data = await this.listNewsUseCase.execute(req.query.published ? { published } : undefined);
      return res.json(data);
    } catch (err: any) {
      return handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const data = await this.getNewsByIdUseCase.execute(req.params.id);
      if (!data) {
        throw new NotFoundError("Artículo no encontrado");
      }
      return res.json(data);
    } catch (err: any) {
      return handleError(res, err);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { title, content, image_url, published } = req.body;
      const data = await this.createNewsUseCase.execute({
        title,
        content,
        image_url,
        published,
      });
      return res.status(201).json(data);
    } catch (err: any) {
      return handleError(res, err);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await this.updateNewsUseCase.execute(id, req.body);
      return res.json(data);
    } catch (err: any) {
      return handleError(res, err);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.deleteNewsUseCase.execute(req.params.id);
      return res.status(204).send();
    } catch (err: any) {
      return handleError(res, err);
    }
  };
}

export const newsController = new NewsController();
export default newsController;
