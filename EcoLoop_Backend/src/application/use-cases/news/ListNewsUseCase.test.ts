import { describe, it, expect, vi } from 'vitest';
import { ListNewsUseCase } from './ListNewsUseCase';
import { INewsRepository } from '../../../domain/repositories/INewsRepository';
import { NewsArticle } from '../../../domain/entities';

describe('ListNewsUseCase', () => {
  it('should list news articles from repository', async () => {
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        title: 'Ecology today',
        content: 'Content of ecology today',
        image_url: null,
        author_id: 'admin-1',
        published: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const mockNewsRepo = {
      listNews: vi.fn().mockResolvedValue(mockArticles),
      getNewsById: vi.fn(),
      createNews: vi.fn(),
      deleteNews: vi.fn(),
      updateNews: vi.fn(),
    } as INewsRepository;

    const useCase = new ListNewsUseCase(mockNewsRepo);
    const result = await useCase.execute({ published: true });

    expect(mockNewsRepo.listNews).toHaveBeenCalledWith({ published: true });
    expect(result).toEqual(mockArticles);
  });
});
