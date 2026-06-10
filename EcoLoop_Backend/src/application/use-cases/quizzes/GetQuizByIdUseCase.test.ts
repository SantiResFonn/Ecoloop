import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetQuizByIdUseCase } from "./GetQuizByIdUseCase";
import { IQuizzesRepository } from "../../../domain/repositories/IQuizzesRepository";
import { NotFoundError } from "../../../domain/errors";

describe("GetQuizByIdUseCase", () => {
  const mockQuizzesRepo = {
    listQuizzes: vi.fn(),
    getQuizById: vi.fn(),
    createQuizCompletion: vi.fn(),
    getCompletionsByUser: vi.fn(),
  } as unknown as IQuizzesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a quiz if it exists", async () => {
    const useCase = new GetQuizByIdUseCase(mockQuizzesRepo);
    const mockQuiz = {
      id: "1",
      title: "Quiz 1",
      description: "Desc 1",
      points_reward: 10,
      is_active: true,
      created_at: new Date(),
      quiz_questions: [],
    };

    vi.mocked(mockQuizzesRepo.getQuizById).mockResolvedValueOnce(mockQuiz);

    const result = await useCase.execute("1");

    expect(mockQuizzesRepo.getQuizById).toHaveBeenCalledWith("1");
    expect(result).toEqual(mockQuiz);
  });

  it("should throw NotFoundError if the quiz does not exist", async () => {
    const useCase = new GetQuizByIdUseCase(mockQuizzesRepo);

    vi.mocked(mockQuizzesRepo.getQuizById).mockResolvedValueOnce(null);

    await expect(useCase.execute("non-existent-id")).rejects.toThrow(NotFoundError);
    expect(mockQuizzesRepo.getQuizById).toHaveBeenCalledWith("non-existent-id");
  });
});
