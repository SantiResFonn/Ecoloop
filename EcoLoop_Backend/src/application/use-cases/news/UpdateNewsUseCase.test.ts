import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateNewsUseCase } from "./UpdateNewsUseCase";
import { INewsRepository } from "../../../domain/repositories/INewsRepository";
import { ValidationError } from "../../../domain/errors";

describe("UpdateNewsUseCase", () => {
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

  it("should update a news article successfully", async () => {
    const useCase = new UpdateNewsUseCase(mockNewsRepo);
    const mockUpdatedArticle = {
      id: "1",
      title: "Updated Title",
      content: "Updated Content",
      image_url: "http://example.com/new.jpg",
      author_id: null,
      published: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockNewsRepo.updateNews).mockResolvedValueOnce(mockUpdatedArticle);

    const result = await useCase.execute("1", {
      title: "  Updated Title  ",
      content: "Updated Content",
      image_url: "http://example.com/new.jpg",
      published: true,
    });

    expect(mockNewsRepo.updateNews).toHaveBeenCalledWith("1", {
      title: "Updated Title",
      content: "Updated Content",
      image_url: "http://example.com/new.jpg",
      published: true,
      updated_at: expect.any(Date),
    });
    expect(result).toEqual(mockUpdatedArticle);
  });

  it("should throw ValidationError if title is provided but is empty or whitespace-only", async () => {
    const useCase = new UpdateNewsUseCase(mockNewsRepo);

    await expect(
      useCase.execute("1", {
        title: "   ",
      })
    ).rejects.toThrow(ValidationError);

    await expect(
      useCase.execute("1", {
        title: "",
      })
    ).rejects.toThrow(ValidationError);

    expect(mockNewsRepo.updateNews).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if content is provided but is empty or whitespace-only", async () => {
    const useCase = new UpdateNewsUseCase(mockNewsRepo);

    await expect(
      useCase.execute("1", {
        content: "   ",
      })
    ).rejects.toThrow(ValidationError);

    await expect(
      useCase.execute("1", {
        content: "",
      })
    ).rejects.toThrow(ValidationError);

    expect(mockNewsRepo.updateNews).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    const useCase = new UpdateNewsUseCase(mockNewsRepo);
    const repoError = new Error("Database connection error");

    vi.mocked(mockNewsRepo.updateNews).mockRejectedValueOnce(repoError);

    await expect(
      useCase.execute("1", {
        title: "Valid Title",
      })
    ).rejects.toThrow("Database connection error");

    expect(mockNewsRepo.updateNews).toHaveBeenCalled();
  });
});
