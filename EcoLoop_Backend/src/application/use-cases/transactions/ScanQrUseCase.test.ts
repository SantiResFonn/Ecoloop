import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScanQrUseCase, POINTS_BY_TYPE, POINTS_PER_KG, MAX_CAPACITY_KG } from "./ScanQrUseCase";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository";
import { ValidationError, NotFoundError } from "../../../domain/errors";
import { Transaction, WasteBin, WasteType } from "../../../domain/entities";

describe("ScanQrUseCase", () => {
  const mockTransactionsRepo = {
    findTransactions: vi.fn(),
    findBinByQr: vi.fn(),
    createTransaction: vi.fn(),
    getProfilePoints: vi.fn(),
    updateProfilePoints: vi.fn(),
    executeRecyclingScan: vi.fn(),
  } as unknown as ITransactionsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const buildBin = (overrides: Partial<WasteBin> = {}): WasteBin => ({
    id: "bin-123",
    station_id: "station-456",
    waste_type: "recyclable",
    capacity_percentage: 20,
    needs_attention: false,
    qr_code: "qr-test",
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  });

  const wasteTypes: { type: WasteType; weight: number }[] = [
    { type: "recyclable", weight: 5 },
    { type: "organic", weight: 3 },
    { type: "non_recyclable", weight: 2 },
  ];

  for (const { type, weight } of wasteTypes) {
    it(`should process scan for ${type} (${weight}kg) and award expected points + capacity`, async () => {
      const useCase = new ScanQrUseCase(mockTransactionsRepo);
      const mockBin = buildBin({ waste_type: type, capacity_percentage: 10, qr_code: `qr-${type}` });
      const expectedPoints = Math.round(POINTS_BY_TYPE[type] + weight * POINTS_PER_KG[type]);
      const expectedCapacityIncrease = Math.round((weight / MAX_CAPACITY_KG) * 100);
      const expectedNewCapacity = Math.min(10 + expectedCapacityIncrease, 100);
      const expectedNeedsAttention = expectedNewCapacity >= 80;

      const mockTransaction: Transaction = {
        id: "tx-789",
        user_id: "user-123",
        bin_id: "bin-123",
        points_earned: expectedPoints,
        waste_type: type,
        created_at: new Date(),
      };

      vi.mocked(mockTransactionsRepo.findBinByQr).mockResolvedValueOnce(mockBin);
      vi.mocked(mockTransactionsRepo.executeRecyclingScan).mockResolvedValueOnce({
        transaction: mockTransaction,
        newPoints: 50 + expectedPoints,
        bin: { ...mockBin, capacity_percentage: expectedNewCapacity, needs_attention: expectedNeedsAttention },
      });

      const result = await useCase.execute({ userId: "user-123", qrCode: `qr-${type}`, weight });

      expect(mockTransactionsRepo.findBinByQr).toHaveBeenCalledWith(`qr-${type}`);
      expect(mockTransactionsRepo.executeRecyclingScan).toHaveBeenCalledWith({
        user_id: "user-123",
        bin_id: "bin-123",
        waste_type: type,
        points_earned: expectedPoints,
        new_capacity: expectedNewCapacity,
        needs_attention: expectedNeedsAttention,
      });

      expect(result.points_earned).toBe(expectedPoints);
      expect(result.total_points).toBe(50 + expectedPoints);
      expect(result.capacity_percentage).toBe(expectedNewCapacity);
      expect(result.needs_attention).toBe(expectedNeedsAttention);
      expect(result.transaction).toEqual(mockTransaction);
    });
  }

  it("should mark bin as needing attention when capacity reaches threshold", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);
    const mockBin = buildBin({ capacity_percentage: 78 });

    vi.mocked(mockTransactionsRepo.findBinByQr).mockResolvedValueOnce(mockBin);
    vi.mocked(mockTransactionsRepo.executeRecyclingScan).mockResolvedValueOnce({
      transaction: { id: "tx" } as Transaction,
      newPoints: 100,
      bin: { ...mockBin, capacity_percentage: 81, needs_attention: true },
    });

    const result = await useCase.execute({ userId: "user-123", qrCode: "qr-test", weight: 5 });

    expect(result.needs_attention).toBe(true);
    expect(result.capacity_percentage).toBeGreaterThanOrEqual(80);
  });

  it("should throw ValidationError when userId is empty", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);
    await expect(useCase.execute({ userId: "", qrCode: "qr-test", weight: 1 })).rejects.toThrow(ValidationError);
    expect(mockTransactionsRepo.findBinByQr).not.toHaveBeenCalled();
  });

  it("should throw ValidationError when qrCode is empty", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);
    await expect(useCase.execute({ userId: "user-123", qrCode: "", weight: 1 })).rejects.toThrow(ValidationError);
    expect(mockTransactionsRepo.findBinByQr).not.toHaveBeenCalled();
  });

  it("should throw ValidationError when weight is zero or negative", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);
    await expect(useCase.execute({ userId: "user-123", qrCode: "qr-test", weight: 0 })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ userId: "user-123", qrCode: "qr-test", weight: -2 })).rejects.toThrow(ValidationError);
    expect(mockTransactionsRepo.findBinByQr).not.toHaveBeenCalled();
  });

  it("should throw ValidationError when weight exceeds MAX_CAPACITY_KG", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);
    await expect(
      useCase.execute({ userId: "user-123", qrCode: "qr-test", weight: MAX_CAPACITY_KG + 1 })
    ).rejects.toThrow(ValidationError);
    expect(mockTransactionsRepo.findBinByQr).not.toHaveBeenCalled();
  });

  it("should throw ValidationError when weight is not a number", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);
    await expect(
      useCase.execute({ userId: "user-123", qrCode: "qr-test", weight: NaN })
    ).rejects.toThrow(ValidationError);
    await expect(
      useCase.execute({ userId: "user-123", qrCode: "qr-test", weight: "abc" as unknown as number })
    ).rejects.toThrow(ValidationError);
  });

  it("should throw NotFoundError when QR code is not found", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);
    vi.mocked(mockTransactionsRepo.findBinByQr).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ userId: "user-123", qrCode: "qr-invalid", weight: 5 })
    ).rejects.toThrow(NotFoundError);
    expect(mockTransactionsRepo.executeRecyclingScan).not.toHaveBeenCalled();
  });

  it("should throw ValidationError when bin is already full", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);
    const fullBin = buildBin({ capacity_percentage: 100 });
    vi.mocked(mockTransactionsRepo.findBinByQr).mockResolvedValueOnce(fullBin);

    await expect(
      useCase.execute({ userId: "user-123", qrCode: "qr-test", weight: 5 })
    ).rejects.toThrow(ValidationError);
    expect(mockTransactionsRepo.executeRecyclingScan).not.toHaveBeenCalled();
  });

  it("should cap new capacity at 100", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);
    const almostFullBin = buildBin({ capacity_percentage: 95 });

    vi.mocked(mockTransactionsRepo.findBinByQr).mockResolvedValueOnce(almostFullBin);
    vi.mocked(mockTransactionsRepo.executeRecyclingScan).mockResolvedValueOnce({
      transaction: { id: "tx" } as Transaction,
      newPoints: 100,
      bin: { ...almostFullBin, capacity_percentage: 100, needs_attention: true },
    });

    await useCase.execute({ userId: "user-123", qrCode: "qr-test", weight: MAX_CAPACITY_KG });

    const calledWith = vi.mocked(mockTransactionsRepo.executeRecyclingScan).mock.calls[0][0];
    expect(calledWith.new_capacity).toBe(100);
  });
});
