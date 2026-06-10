import { describe, it, expect, vi } from "vitest";
import { CreateStationUseCase } from "./CreateStationUseCase";
import { IStationsRepository } from "../../../domain/repositories/IStationsRepository";
import { WasteStation } from "../../../domain/entities";
import { ValidationError } from "../../../domain/errors";

describe("CreateStationUseCase", () => {
  const mockStation: WasteStation = {
    id: "station-1",
    name: "Estación Centro",
    location: "Calle 10 # 5-20",
    description: "Estación principal",
    created_at: new Date(),
    updated_at: new Date(),
  };

  it("should create a station with default bins by default", async () => {
    const mockRepo = {
      listStations: vi.fn(),
      getStationById: vi.fn(),
      createStation: vi.fn().mockResolvedValue(mockStation),
      updateStation: vi.fn(),
      deleteStation: vi.fn(),
    } as IStationsRepository;

    const useCase = new CreateStationUseCase(mockRepo);
    const result = await useCase.execute({
      name: "Estación Centro",
      location: "Calle 10 # 5-20",
      description: "Estación principal",
    });

    expect(mockRepo.createStation).toHaveBeenCalledWith({
      name: "Estación Centro",
      location: "Calle 10 # 5-20",
      description: "Estación principal",
      createDefaultBins: true,
    });
    expect(result).toEqual(mockStation);
  });

  it("should respect explicit createDefaultBins=false", async () => {
    const mockRepo = {
      listStations: vi.fn(),
      getStationById: vi.fn(),
      createStation: vi.fn().mockResolvedValue(mockStation),
      updateStation: vi.fn(),
      deleteStation: vi.fn(),
    } as IStationsRepository;

    const useCase = new CreateStationUseCase(mockRepo);
    await useCase.execute({
      name: "Estación Centro",
      location: "Calle 10",
      createDefaultBins: false,
    });

    expect(mockRepo.createStation).toHaveBeenCalledWith({
      name: "Estación Centro",
      location: "Calle 10",
      description: null,
      createDefaultBins: false,
    });
  });

  it("should throw ValidationError when name is missing", async () => {
    const mockRepo = {
      createStation: vi.fn(),
    } as unknown as IStationsRepository;

    const useCase = new CreateStationUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "", location: "Calle 10" })
    ).rejects.toThrow(ValidationError);

    expect(mockRepo.createStation).not.toHaveBeenCalled();
  });

  it("should throw ValidationError when location is missing", async () => {
    const mockRepo = {
      createStation: vi.fn(),
    } as unknown as IStationsRepository;

    const useCase = new CreateStationUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "Estación Centro", location: "" })
    ).rejects.toThrow(ValidationError);

    expect(mockRepo.createStation).not.toHaveBeenCalled();
  });
});
