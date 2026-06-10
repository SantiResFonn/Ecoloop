import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListQuizCompletionsUseCase } from "./ListQuizCompletionsUseCase";
import { IQuizzesRepository } from "../../../domain/repositories/IQuizzesRepository";
import { ValidationError } from "../../../domain/errors";

describe("ListQuizCompletionsUseCase", () => {
  const mockQuizzesRepo = {
    listQuizzes: vi.fn(),
    getQuizById: vi.fn(),
    createQuizCompletion: vi.fn(),
    getCompletionsByUser: vi.fn(),
  } as unknown as IQuizzesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return completions for a user", async () => {
    const useCase = new ListQuizCompletionsUseCase(mockQuizzesRepo);
    const mockCompletions = [
      { id: "comp-1", user_id: "user-1", quiz_id: "quiz-1", score: 1, points_earned: 5, completed_at: new Date() },
    ];

    vi.mocked(mockQuizzesRepo.getCompletionsByUser).mockResolvedValueOnce(mockCompletions);

    const result = await useCase.execute("user-1");

    expect(mockQuizzesRepo.getCompletionsByUser).toHaveBeenCalledWith("user-1");
    expect(result).toEqual(mockCompletions);
  });

  it("should throw ValidationError if userId is empty", async () => {
    const useCase = new ListQuizCompletionsUseCase(mockQuizzesRepo);

    await expect(useCase.execute("")).rejects.toThrow(ValidationError);
  });
});
