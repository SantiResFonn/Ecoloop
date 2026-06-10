import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListQuizzesUseCase } from "./ListQuizzesUseCase";
import { IQuizzesRepository } from "../../../domain/repositories/IQuizzesRepository";

describe("ListQuizzesUseCase", () => {
  const mockQuizzesRepo = {
    listQuizzes: vi.fn(),
    getQuizById: vi.fn(),
    createQuizCompletion: vi.fn(),
    getCompletionsByUser: vi.fn(),
  } as unknown as IQuizzesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list all quizzes", async () => {
    const useCase = new ListQuizzesUseCase(mockQuizzesRepo);
    const mockQuizzes = [
      { id: "1", title: "Quiz 1", description: "Desc 1", points_reward: 10, is_active: true, created_at: new Date() },
      { id: "2", title: "Quiz 2", description: "Desc 2", points_reward: 8, is_active: false, created_at: new Date() },
    ];

    vi.mocked(mockQuizzesRepo.listQuizzes).mockResolvedValueOnce(mockQuizzes);

    const result = await useCase.execute();

    expect(mockQuizzesRepo.listQuizzes).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(mockQuizzes);
  });

  it("should list only active quizzes when activeOnly is true", async () => {
    const useCase = new ListQuizzesUseCase(mockQuizzesRepo);
    const mockQuizzes = [
      { id: "1", title: "Quiz 1", description: "Desc 1", points_reward: 10, is_active: true, created_at: new Date() },
    ];

    vi.mocked(mockQuizzesRepo.listQuizzes).mockResolvedValueOnce(mockQuizzes);

    const result = await useCase.execute(true);

    expect(mockQuizzesRepo.listQuizzes).toHaveBeenCalledWith(true);
    expect(result).toEqual(mockQuizzes);
  });
});
