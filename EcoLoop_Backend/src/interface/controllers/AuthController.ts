import { Request, Response } from "express";
import { LoginUseCase } from "../../application/use-cases/auth/LoginUseCase";
import { RegisterUseCase } from "../../application/use-cases/auth/RegisterUseCase";
import { profilesRepository } from "../../infrastructure/repositories/profilesRepository";
import { bcryptJwtSecurityService } from "../../infrastructure/security/BcryptJwtSecurityService";

export class AuthController {
  private loginUseCase = new LoginUseCase(profilesRepository, bcryptJwtSecurityService);
  private registerUseCase = new RegisterUseCase(profilesRepository, bcryptJwtSecurityService);

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.loginUseCase.execute(email, password);
      return res.json(result);
    } catch (err: any) {
      return res.status(err.message === "Credenciales inválidas" ? 401 : 400).json({ error: err.message });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const { email, password, full_name } = req.body;
      const result = await this.registerUseCase.execute(email, password, full_name);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(err.message.includes("registrado") ? 409 : 400).json({ error: err.message });
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const profile = await profilesRepository.findProfileByEmail(req.user.email);
      if (!profile) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      return res.json({
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          eco_points: profile.eco_points,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  logout = (req: Request, res: Response) => {
    return res.json({ message: "Logout exitoso" });
  };
}

export const authController = new AuthController();
