import { describe, it, expect, vi } from "vitest";
import { GetStationByIdUseCase } from "./GetStationByIdUseCase";
import { IStationsRepository } from "../../../domain/repositories/IStationsRepository";
import { WasteStation } from "../../../domain/entities";

describe("GetStationByIdUseCase", () => {
  it("should return the station when it exists", async () => {
    const mockStation: WasteStation = {
      id: "station-123",
      name: "Estación Norte",
      location: "Calle 100",
      description: "Estación del norte",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockRepo = {
      listStations: vi.fn(),
      getStationById: vi.fn().mockResolvedValue(mockStation),
      createStation: vi.fn(),
      updateStation: vi.fn(),
      deleteStation: vi.fn(),
    } as IStationsRepository;

    const useCase = new GetStationByIdUseCase(mockRepo);
    const result = await useCase.execute("station-123");

    expect(mockRepo.getStationById).toHaveBeenCalledWith("station-123");
    expect(result).toEqual(mockStation);
  });

  it("should return null when the station does not exist", async () => {
    const mockRepo = {
      listStations: vi.fn(),
      getStationById: vi.fn().mockResolvedValue(null),
      createStation: vi.fn(),
      updateStation: vi.fn(),
      deleteStation: vi.fn(),
    } as IStationsRepository;

    const useCase = new GetStationByIdUseCase(mockRepo);
    const result = await useCase.execute("non-existent-id");

    expect(mockRepo.getStationById).toHaveBeenCalledWith("non-existent-id");
    expect(result).toBeNull();
  });
});
