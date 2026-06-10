import { NewsArticle } from "../entities";

export interface CreateNewsInput {
  title: string;
  content: string;
  image_url?: string | null;
  author_id?: string | null;
  published?: boolean;
}

export interface UpdateNewsInput {
  title?: string;
  content?: string;
  image_url?: string | null;
  author_id?: string | null;
  published?: boolean;
  updated_at?: Date;
}

export interface INewsRepository {
  listNews(filter?: { published?: boolean }): Promise<NewsArticle[]>;
  getNewsById(id: string): Promise<NewsArticle | null>;
  createNews(data: CreateNewsInput): Promise<NewsArticle>;
  deleteNews(id: string): Promise<NewsArticle>;
  updateNews(id: string, data: UpdateNewsInput): Promise<NewsArticle>;
}
