import { IStationsRepository } from "../../../domain/repositories/IStationsRepository";

export class GetStationByIdUseCase {
  constructor(private stationsRepo: IStationsRepository) {}

  async execute(id: string) {
    return this.stationsRepo.getStationById(id);
  }
}
