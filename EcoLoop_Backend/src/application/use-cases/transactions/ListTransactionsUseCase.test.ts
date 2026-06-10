import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListTransactionsUseCase } from "./ListTransactionsUseCase";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository";
import { Transaction } from "../../../domain/entities";

describe("ListTransactionsUseCase", () => {
  const mockTransactionsRepo = {
    findTransactions: vi.fn(),
    findBinByQr: vi.fn(),
    createTransaction: vi.fn(),
    getProfilePoints: vi.fn(),
    updateProfilePoints: vi.fn(),
  } as unknown as ITransactionsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTransactions: Transaction[] = [
    {
      id: "tx-1",
      user_id: "user-123",
      bin_id: "bin-1",
      points_earned: 10,
      waste_type: "recyclable",
      created_at: new Date(),
    },
    {
      id: "tx-2",
      user_id: "user-456",
      bin_id: "bin-2",
      points_earned: 8,
      waste_type: "organic",
      created_at: new Date(),
    },
  ];

  it("should list all transactions when no userId filter is provided", async () => {
    const useCase = new ListTransactionsUseCase(mockTransactionsRepo);

    vi.mocked(mockTransactionsRepo.findTransactions).mockResolvedValueOnce(mockTransactions);

    const result = await useCase.execute();

    expect(mockTransactionsRepo.findTransactions).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(mockTransactions);
  });

  it("should list transactions filtered by userId when userId is provided", async () => {
    const useCase = new ListTransactionsUseCase(mockTransactionsRepo);

    const userSpecificTransactions = mockTransactions.filter(tx => tx.user_id === "user-123");
    vi.mocked(mockTransactionsRepo.findTransactions).mockResolvedValueOnce(userSpecificTransactions);

    const result = await useCase.execute("user-123");

    expect(mockTransactionsRepo.findTransactions).toHaveBeenCalledWith({ user_id: "user-123" });
    expect(result).toEqual(userSpecificTransactions);
  });
});
