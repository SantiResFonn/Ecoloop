import { describe, it, expect, vi } from "vitest";
import { DeleteStationUseCase } from "./DeleteStationUseCase";
import { IStationsRepository } from "../../../domain/repositories/IStationsRepository";
import { WasteStation } from "../../../domain/entities";

describe("DeleteStationUseCase", () => {
  it("should call deleteStation with the correct id", async () => {
    const mockStation: WasteStation = {
      id: "station-1",
      name: "Estación Centro",
      location: "Calle 10",
      description: "Estación principal",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockRepo = {
      listStations: vi.fn(),
      getStationById: vi.fn(),
      createStation: vi.fn(),
      updateStation: vi.fn(),
      deleteStation: vi.fn().mockResolvedValue(mockStation),
    } as IStationsRepository;

    const useCase = new DeleteStationUseCase(mockRepo);
    const result = await useCase.execute("station-1");

    expect(mockRepo.deleteStation).toHaveBeenCalledWith("station-1");
    expect(result).toEqual(mockStation);
  });
});
