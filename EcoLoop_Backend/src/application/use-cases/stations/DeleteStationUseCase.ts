import { IStationsRepository } from "../../../domain/repositories/IStationsRepository";

export class DeleteStationUseCase {
  constructor(private stationsRepo: IStationsRepository) {}

  async execute(id: string) {
    return this.stationsRepo.deleteStation(id);
  }
}
