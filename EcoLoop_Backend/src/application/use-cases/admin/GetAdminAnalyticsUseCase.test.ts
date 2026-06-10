import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetAdminAnalyticsUseCase } from "./GetAdminAnalyticsUseCase";
import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository";
import { IRedemptionsRepository } from "../../../domain/repositories/IRedemptionsRepository";
import { IBinsRepository } from "../../../domain/repositories/IBinsRepository";

describe("GetAdminAnalyticsUseCase", () => {
  const mockProfilesRepo = {
    listProfiles: vi.fn(),
    getProfileById: vi.fn(),
    findProfileByEmail: vi.fn(),
    createProfile: vi.fn(),
    updateProfile: vi.fn(),
  } as unknown as IProfilesRepository;

  const mockTransactionsRepo = {
    findTransactions: vi.fn(),
    findBinByQr: vi.fn(),
    createTransaction: vi.fn(),
    getProfilePoints: vi.fn(),
    updateProfilePoints: vi.fn(),
  } as unknown as ITransactionsRepository;

  const mockRedemptionsRepo = {
    createRedemption: vi.fn(),
    listRedemptions: vi.fn(),
  } as unknown as IRedemptionsRepository;

  const mockBinsRepo = {
    findBinByQr: vi.fn(),
    findBinById: vi.fn(),
    listBins: vi.fn(),
    updateBinCapacity: vi.fn(),
    emptyBin: vi.fn(),
  } as unknown as IBinsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should aggregate dashboard metrics correctly", async () => {
    vi.mocked(mockProfilesRepo.listProfiles).mockResolvedValueOnce([
      { id: "u1" } as any,
      { id: "u2" } as any,
      { id: "u3" } as any,
    ]);
    vi.mocked(mockTransactionsRepo.findTransactions).mockResolvedValueOnce([
      { id: "t1", points_earned: 10 } as any,
      { id: "t2", points_earned: 20 } as any,
    ]);
    vi.mocked(mockRedemptionsRepo.listRedemptions).mockResolvedValueOnce([
      { id: "r1", points_spent: 50 } as any,
      { id: "r2", points_spent: 100 } as any,
    ]);
    vi.mocked(mockBinsRepo.listBins).mockResolvedValueOnce([
      { id: "b1", needs_attention: true } as any,
      { id: "b2", needs_attention: false } as any,
      { id: "b3", needs_attention: true } as any,
    ]);

    const useCase = new GetAdminAnalyticsUseCase(
      mockProfilesRepo,
      mockTransactionsRepo,
      mockRedemptionsRepo,
      mockBinsRepo
    );
    const result = await useCase.execute();

    expect(result.stats.totalUsers).toBe(3);
    expect(result.stats.totalTransactions).toBe(2);
    expect(result.stats.totalPointsEarned).toBe(30);
    expect(result.stats.totalPointsRedeemed).toBe(150);
    expect(result.stats.totalRedemptions).toBe(2);
    expect(result.stats.binsNeedingAttention).toBe(2);
    expect(result.recentTransactions).toHaveLength(2);
    expect(result.wasteBins).toHaveLength(3);
    expect(result.recentRedemptions).toHaveLength(2);
    expect(mockProfilesRepo.listProfiles).toHaveBeenCalledWith({ role: "user" });
  });

  it("should cap recent transactions and redemptions to 10 items", async () => {
    const buildList = (prefix: string, length: number) =>
      Array.from({ length }, (_, i) => ({ id: `${prefix}${i}`, points_earned: 1, points_spent: 1 }) as any);

    vi.mocked(mockProfilesRepo.listProfiles).mockResolvedValueOnce([]);
    vi.mocked(mockTransactionsRepo.findTransactions).mockResolvedValueOnce(buildList("t", 25));
    vi.mocked(mockRedemptionsRepo.listRedemptions).mockResolvedValueOnce(buildList("r", 15));
    vi.mocked(mockBinsRepo.listBins).mockResolvedValueOnce([]);

    const useCase = new GetAdminAnalyticsUseCase(
      mockProfilesRepo,
      mockTransactionsRepo,
      mockRedemptionsRepo,
      mockBinsRepo
    );
    const result = await useCase.execute();

    expect(result.recentTransactions).toHaveLength(10);
    expect(result.recentRedemptions).toHaveLength(10);
    expect(result.wasteBins).toHaveLength(0);
  });

  it("should handle empty datasets returning zeroed stats", async () => {
    vi.mocked(mockProfilesRepo.listProfiles).mockResolvedValueOnce([]);
    vi.mocked(mockTransactionsRepo.findTransactions).mockResolvedValueOnce([]);
    vi.mocked(mockRedemptionsRepo.listRedemptions).mockResolvedValueOnce([]);
    vi.mocked(mockBinsRepo.listBins).mockResolvedValueOnce([]);

    const useCase = new GetAdminAnalyticsUseCase(
      mockProfilesRepo,
      mockTransactionsRepo,
      mockRedemptionsRepo,
      mockBinsRepo
    );
    const result = await useCase.execute();

    expect(result.stats).toEqual({
      totalUsers: 0,
      totalTransactions: 0,
      totalPointsEarned: 0,
      totalPointsRedeemed: 0,
      totalRedemptions: 0,
      binsNeedingAttention: 0,
    });
  });
});
