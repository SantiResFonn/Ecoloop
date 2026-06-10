import { IStationsRepository } from "../../../domain/repositories/IStationsRepository";

export class UpdateStationUseCase {
  constructor(private stationsRepo: IStationsRepository) {}

  async execute(id: string, data: { name?: string; location?: string; description?: string }) {
    return this.stationsRepo.updateStation(id, {
      ...data,
      updated_at: new Date(),
    });
  }
}
