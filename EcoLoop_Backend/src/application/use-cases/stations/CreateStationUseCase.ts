import { IStationsRepository, CreateStationInput } from "../../../domain/repositories/IStationsRepository";
import { ValidationError } from "../../../domain/errors";

export class CreateStationUseCase {
  constructor(private stationsRepo: IStationsRepository) {}

  async execute(data: CreateStationInput) {
    if (!data.name || !data.location) {
      throw new ValidationError("name y location son requeridos");
    }
    return this.stationsRepo.createStation({
      name: data.name,
      location: data.location,
      description: data.description ?? null,
      createDefaultBins: data.createDefaultBins ?? true,
    });
  }
}
