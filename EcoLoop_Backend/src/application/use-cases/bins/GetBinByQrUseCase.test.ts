import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetBinByQrUseCase } from "./GetBinByQrUseCase";
import { IBinsRepository } from "../../../domain/repositories/IBinsRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors";
import { WasteBin } from "../../../domain/entities";

describe("GetBinByQrUseCase", () => {
  const mockBinsRepo = {
    findBinByQr: vi.fn(),
    findBinById: vi.fn(),
    updateBinCapacity: vi.fn(),
    emptyBin: vi.fn(),
  } as unknown as IBinsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a waste bin if it exists", async () => {
    const useCase = new GetBinByQrUseCase(mockBinsRepo);
    const mockBin: WasteBin = {
      id: "bin-123",
      station_id: "station-456",
      waste_type: "recyclable",
      capacity_percentage: 20,
      needs_attention: false,
      qr_code: "QR-TEST-001",
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockBinsRepo.findBinByQr).mockResolvedValueOnce(mockBin);

    const result = await useCase.execute("QR-TEST-001");

    expect(mockBinsRepo.findBinByQr).toHaveBeenCalledWith("QR-TEST-001");
    expect(result).toEqual(mockBin);
  });

  it("should throw NotFoundError if the waste bin does not exist", async () => {
    const useCase = new GetBinByQrUseCase(mockBinsRepo);

    vi.mocked(mockBinsRepo.findBinByQr).mockResolvedValueOnce(null);

    await expect(useCase.execute("non-existent-qr")).rejects.toThrow(NotFoundError);
    expect(mockBinsRepo.findBinByQr).toHaveBeenCalledWith("non-existent-qr");
  });

  it("should throw ValidationError if QR code is empty", async () => {
    const useCase = new GetBinByQrUseCase(mockBinsRepo);

    await expect(useCase.execute("")).rejects.toThrow(ValidationError);
    await expect(useCase.execute("   ")).rejects.toThrow(ValidationError);
    expect(mockBinsRepo.findBinByQr).not.toHaveBeenCalled();
  });
});
