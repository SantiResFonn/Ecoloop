import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { ISecurityService } from "../../../domain/services/ISecurityService";

export class RegisterUseCase {
  constructor(
    private profilesRepo: IProfilesRepository,
    private securityService: ISecurityService
  ) {}

  async execute(email: string, password: string, fullName?: string) {
    if (!email || !password) {
      throw new Error("email y password son requeridos");
    }

    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    const existing = await this.profilesRepo.findProfileByEmail(email);
    if (existing) {
      throw new Error("El email ya está registrado");
    }

    const passwordHash = await this.securityService.hashPassword(password);

    const profile = await this.profilesRepo.createProfile({
      email,
      password_hash: passwordHash,
      full_name: fullName || email.split("@")[0],
      role: "user",
    });

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
