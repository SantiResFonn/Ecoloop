import { Request, Response } from "express";
import { profilesRepository } from "../../infrastructure/repositories/profilesRepository";
import { ListProfilesUseCase } from "../../application/use-cases/profiles/ListProfilesUseCase";
import { GetProfileByIdUseCase } from "../../application/use-cases/profiles/GetProfileByIdUseCase";
import { UpdateProfileUseCase } from "../../application/use-cases/profiles/UpdateProfileUseCase";
import { NotFoundError } from "../../domain/errors";
import { Profile } from "../../domain/entities";

export class ProfilesController {
  private listProfilesUseCase = new ListProfilesUseCase(profilesRepository);
  private getProfileByIdUseCase = new GetProfileByIdUseCase(profilesRepository);
  private updateProfileUseCase = new UpdateProfileUseCase(profilesRepository);

  private sanitizeProfile(profile: Profile) {
    const { password_hash, ...rest } = profile;
    return rest;
  }

  list = async (req: Request, res: Response) => {
    try {
      const role = req.query.role as string | undefined;
      const data = await this.listProfilesUseCase.execute(role ? { role } : undefined);
      return res.json(data.map((p) => this.sanitizeProfile(p)));
    } catch (err: unknown) {
      return this.handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const data = await this.getProfileByIdUseCase.execute(req.params.id);
      if (!data) {
        throw new NotFoundError("Perfil no encontrado");
      }
      return res.json(this.sanitizeProfile(data));
    } catch (err: unknown) {
      return this.handleError(res, err);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!req.user || (req.user.userId !== id && req.user.role !== "admin")) {
        return res.status(403).json({ error: "No tienes permiso para actualizar este perfil" });
      }

      const payload = { ...req.body };
      if (req.user.role !== "admin") {
        delete payload.role;
        delete payload.eco_points;
      }

      const data = await this.updateProfileUseCase.execute(id, payload);
      return res.json(this.sanitizeProfile(data));
    } catch (err: unknown) {
      return this.handleError(res, err);
    }
  };

  private handleError(res: Response, error: unknown) {
    const err = error as any;
    const message = err?.message || "Internal Server Error";

    if (err?.name === "ValidationError" || err?.constructor?.name === "ValidationError") {
      return res.status(400).json({ error: message });
    }

    if (
      err?.name === "NotFoundError" ||
      err?.constructor?.name === "NotFoundError" ||
      err?.code === "P2025" ||
      (typeof message === "string" && message.toLowerCase().includes("not found"))
    ) {
      return res.status(404).json({ error: message || "Perfil no encontrado" });
    }

    return res.status(500).json({ error: message });
  }
}

export const profilesController = new ProfilesController();
export default profilesController;
