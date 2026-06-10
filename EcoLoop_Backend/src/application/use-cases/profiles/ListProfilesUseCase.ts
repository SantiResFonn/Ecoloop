import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { Profile } from "../../../domain/entities";

export class ListProfilesUseCase {
  constructor(private profilesRepo: IProfilesRepository) {}

  async execute(filter?: { role?: string }): Promise<Profile[]> {
    return this.profilesRepo.listProfiles(filter);
  }
}
