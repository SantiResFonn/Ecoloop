import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { Profile } from "../../../domain/entities";

export class GetProfileByIdUseCase {
  constructor(private profilesRepo: IProfilesRepository) {}

  async execute(id: string): Promise<Profile | null> {
    return this.profilesRepo.getProfileById(id);
  }
}
