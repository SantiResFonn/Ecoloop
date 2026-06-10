import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { Profile } from "../../../domain/entities";
import { ValidationError } from "../../../domain/errors";

export class UpdateProfileUseCase {
  constructor(private profilesRepo: IProfilesRepository) {}

  async execute(
    id: string,
    data: { email?: string; full_name?: string | null; role?: string; eco_points?: number } & Record<string, any>
  ): Promise<Profile> {
    const { email, full_name, role, eco_points } = data || {};
    const updateData: Partial<Omit<Profile, "id" | "password_hash" | "created_at" | "updated_at">> & { updated_at?: Date } = {};

    if (email !== undefined) updateData.email = email;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role as any;
    if (eco_points !== undefined) {
      if (eco_points < 0) {
        throw new ValidationError("Los puntos ecológicos no pueden ser negativos");
      }
      if (!Number.isInteger(eco_points)) {
        throw new ValidationError("Los puntos ecológicos deben ser un número entero");
      }
      updateData.eco_points = eco_points;
    }

    updateData.updated_at = new Date();

    return this.profilesRepo.updateProfile(id, updateData);
  }
}
