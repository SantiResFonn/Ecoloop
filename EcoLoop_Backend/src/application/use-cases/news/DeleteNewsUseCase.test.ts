import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteNewsUseCase } from "./DeleteNewsUseCase";
import { INewsRepository } from "../../../domain/repositories/INewsRepository";

describe("DeleteNewsUseCase", () => {
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

  it("should delete a news article successfully", async () => {
    const useCase = new DeleteNewsUseCase(mockNewsRepo);
    const mockDeletedArticle = {
      id: "1",
      title: "Deleted Title",
      content: "Deleted Content",
      image_url: null,
      author_id: null,
      published: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockNewsRepo.deleteNews).mockResolvedValueOnce(mockDeletedArticle);

    const result = await useCase.execute("1");

    expect(mockNewsRepo.deleteNews).toHaveBeenCalledWith("1");
    expect(result).toEqual(mockDeletedArticle);
  });

  it("should propagate repository errors during deletion", async () => {
    const useCase = new DeleteNewsUseCase(mockNewsRepo);
    const repoError = new Error("Database error on deletion");

    vi.mocked(mockNewsRepo.deleteNews).mockRejectedValueOnce(repoError);

    await expect(useCase.execute("1")).rejects.toThrow("Database error on deletion");

    expect(mockNewsRepo.deleteNews).toHaveBeenCalledWith("1");
  });
});
