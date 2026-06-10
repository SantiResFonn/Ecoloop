import { INewsRepository, CreateNewsInput, UpdateNewsInput } from "../../domain/repositories/INewsRepository";
import { NewsArticle } from "../../domain/entities";
import prisma from "../db/prismaClient";
import { NotFoundError } from "../../domain/errors";

export class PrismaNewsRepository implements INewsRepository {
  async listNews(filter?: { published?: boolean }): Promise<NewsArticle[]> {
    const where: any = {};
    if (filter?.published) where.published = true;
    return prisma.news_articles.findMany({ where, orderBy: { created_at: "desc" } });
  }

  async getNewsById(id: string): Promise<NewsArticle | null> {
    return prisma.news_articles.findUnique({ where: { id } });
  }

  async createNews(data: CreateNewsInput): Promise<NewsArticle> {
    return prisma.news_articles.create({ data });
  }

  async deleteNews(id: string): Promise<NewsArticle> {
    try {
      return await prisma.news_articles.delete({ where: { id } });
    } catch (error: any) {
      if (error && (error.code === "P2025" || error.name === "NotFoundError")) {
        throw new NotFoundError("Artículo no encontrado");
      }
      throw error;
    }
  }

  async updateNews(id: string, data: UpdateNewsInput): Promise<NewsArticle> {
    try {
      return await prisma.news_articles.update({ where: { id }, data });
    } catch (error: any) {
      if (error && (error.code === "P2025" || error.name === "NotFoundError")) {
        throw new NotFoundError("Artículo no encontrado");
      }
      throw error;
    }
  }
}

export const newsRepository = new PrismaNewsRepository();
export default newsRepository;
