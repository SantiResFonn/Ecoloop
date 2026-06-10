import { IStationsRepository } from "../../../domain/repositories/IStationsRepository";

export class ListStationsUseCase {
  constructor(private stationsRepo: IStationsRepository) {}

  async execute() {
    return this.stationsRepo.listStations();
  }
}
