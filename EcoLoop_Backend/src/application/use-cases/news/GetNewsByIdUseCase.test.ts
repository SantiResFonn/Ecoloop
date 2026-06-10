import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetNewsByIdUseCase } from "./GetNewsByIdUseCase";
import { INewsRepository } from "../../../domain/repositories/INewsRepository";

describe("GetNewsByIdUseCase", () => {
  const mockNewsRepo = {
    listNews: vi.fn(),
    getNewsById: vi.fn(),
    createNews: vi.fn(),
    deleteNews: vi.fn(),
    updateNews: vi.fn(),
  } as unknown as INewsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a news article if it exists", async () => {
    const useCase = new GetNewsByIdUseCase(mockNewsRepo);
    const mockArticle = {
      id: "1",
      title: "Title 1",
      content: "Content 1",
      image_url: null,
      author_id: null,
      published: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockNewsRepo.getNewsById).mockResolvedValueOnce(mockArticle);

    const result = await useCase.execute("1");

    expect(mockNewsRepo.getNewsById).toHaveBeenCalledWith("1");
    expect(result).toEqual(mockArticle);
  });

  it("should return null if the news article does not exist", async () => {
    const useCase = new GetNewsByIdUseCase(mockNewsRepo);

    vi.mocked(mockNewsRepo.getNewsById).mockResolvedValueOnce(null);

    const result = await useCase.execute("non-existent-id");

    expect(mockNewsRepo.getNewsById).toHaveBeenCalledWith("non-existent-id");
    expect(result).toBeNull();
  });
});
