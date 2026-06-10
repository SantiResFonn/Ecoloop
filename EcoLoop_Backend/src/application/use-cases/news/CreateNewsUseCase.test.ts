import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateNewsUseCase } from "./CreateNewsUseCase";
import { INewsRepository } from "../../../domain/repositories/INewsRepository";
import { ValidationError } from "../../../domain/errors";

describe("CreateNewsUseCase", () => {
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

  it("should create a news article successfully with default published as false", async () => {
    const useCase = new CreateNewsUseCase(mockNewsRepo);
    const mockArticle = {
      id: "1",
      title: "New Ecology Policy",
      content: "Details about the policy...",
      image_url: "http://example.com/image.jpg",
      author_id: null,
      published: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockNewsRepo.createNews).mockResolvedValueOnce(mockArticle);

    const result = await useCase.execute({
      title: "  New Ecology Policy  ",
      content: "Details about the policy...",
      image_url: "http://example.com/image.jpg",
    });

    expect(mockNewsRepo.createNews).toHaveBeenCalledWith({
      title: "New Ecology Policy",
      content: "Details about the policy...",
      image_url: "http://example.com/image.jpg",
      published: false,
    });
    expect(result).toEqual(mockArticle);
  });

  it("should create a news article with published set to true if provided", async () => {
    const useCase = new CreateNewsUseCase(mockNewsRepo);
    const mockArticle = {
      id: "2",
      title: "Ecology Policy 2",
      content: "Details about policy 2...",
      image_url: null,
      author_id: null,
      published: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockNewsRepo.createNews).mockResolvedValueOnce(mockArticle);

    const result = await useCase.execute({
      title: "Ecology Policy 2",
      content: "Details about policy 2...",
      published: true,
    });

    expect(mockNewsRepo.createNews).toHaveBeenCalledWith({
      title: "Ecology Policy 2",
      content: "Details about policy 2...",
      image_url: undefined,
      published: true,
    });
    expect(result).toEqual(mockArticle);
  });

  it("should throw ValidationError if title is missing or whitespace-only", async () => {
    const useCase = new CreateNewsUseCase(mockNewsRepo);

    await expect(
      useCase.execute({
        title: "   ",
        content: "Some content",
      })
    ).rejects.toThrow(ValidationError);

    await expect(
      useCase.execute({
        title: "",
        content: "Some content",
      })
    ).rejects.toThrow(ValidationError);

    expect(mockNewsRepo.createNews).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if content is missing or whitespace-only", async () => {
    const useCase = new CreateNewsUseCase(mockNewsRepo);

    await expect(
      useCase.execute({
        title: "A Valid Title",
        content: "  ",
      })
    ).rejects.toThrow(ValidationError);

    await expect(
      useCase.execute({
        title: "A Valid Title",
        content: "",
      })
    ).rejects.toThrow(ValidationError);

    expect(mockNewsRepo.createNews).not.toHaveBeenCalled();
  });
});
