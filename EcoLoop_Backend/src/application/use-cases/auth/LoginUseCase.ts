import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { ISecurityService } from "../../../domain/services/ISecurityService";

export class LoginUseCase {
  constructor(
    private profilesRepo: IProfilesRepository,
    private securityService: ISecurityService
  ) {}

  async execute(email: string, password: string) {
    if (!email || !password) {
      throw new Error("email y password son requeridos");
    }

    const profile = await this.profilesRepo.findProfileByEmail(email);
    if (!profile) {
      throw new Error("Credenciales inválidas");
    }

    const isPasswordValid = await this.securityService.verifyPassword(password, profile.password_hash);
    if (!isPasswordValid) {
      throw new Error("Credenciales inválidas");
    }

    const token = this.securityService.generateToken({
      userId: profile.id,
      email: profile.email,
      role: profile.role,
    });

    return {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        eco_points: profile.eco_points,
      },
    };
  }
}
