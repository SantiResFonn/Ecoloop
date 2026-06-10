import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListStationsUseCase } from "./ListStationsUseCase";
import { IStationsRepository } from "../../../domain/repositories/IStationsRepository";
import { WasteStation } from "../../../domain/entities";

describe("ListStationsUseCase", () => {
  const mockStationsRepo = {
    listStations: vi.fn(),
    getStationById: vi.fn(),
    createStation: vi.fn(),
    updateStation: vi.fn(),
    deleteStation: vi.fn(),
  } as unknown as IStationsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list all waste stations successfully", async () => {
    const useCase = new ListStationsUseCase(mockStationsRepo);

    const mockStations: WasteStation[] = [
      {
        id: "station-1",
        name: "Main Station",
        location: "Building A",
        description: "Primary recycling station",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "station-2",
        name: "Secondary Station",
        location: "Building B",
        description: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    vi.mocked(mockStationsRepo.listStations).mockResolvedValueOnce(mockStations);

    const result = await useCase.execute();

    expect(mockStationsRepo.listStations).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockStations);
  });
});
