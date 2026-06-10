import { describe, it, expect, vi } from "vitest";
import { UpdateStationUseCase } from "./UpdateStationUseCase";
import { IStationsRepository } from "../../../domain/repositories/IStationsRepository";
import { WasteStation } from "../../../domain/entities";

describe("UpdateStationUseCase", () => {
  it("should call updateStation with data and updated_at date", async () => {
    const mockStation: WasteStation = {
      id: "station-1",
      name: "Estación Centro Modificada",
      location: "Calle 11 # 5-20",
      description: "Estación principal actualizada",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockRepo = {
      listStations: vi.fn(),
      getStationById: vi.fn(),
      createStation: vi.fn(),
      updateStation: vi.fn().mockResolvedValue(mockStation),
      deleteStation: vi.fn(),
    } as IStationsRepository;

    const useCase = new UpdateStationUseCase(mockRepo);
    const updateData = {
      name: "Estación Centro Modificada",
      location: "Calle 11 # 5-20",
      description: "Estación principal actualizada",
    };

    const result = await useCase.execute("station-1", updateData);

    expect(mockRepo.updateStation).toHaveBeenCalledWith("station-1", {
      ...updateData,
      updated_at: expect.any(Date),
    });
    expect(result).toEqual(mockStation);
  });
});
