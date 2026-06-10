import { Request, Response } from "express";
import { GetAdminAnalyticsUseCase } from "../../application/use-cases/admin/GetAdminAnalyticsUseCase";
import { profilesRepository } from "../../infrastructure/repositories/profilesRepository";
import { transactionsRepository } from "../../infrastructure/repositories/transactionsRepository";
import { redemptionsRepository } from "../../infrastructure/repositories/redemptionsRepository";
import { binsRepository } from "../../infrastructure/repositories/binsRepository";

export class AdminController {
  private getAnalyticsUseCase = new GetAdminAnalyticsUseCase(
    profilesRepository,
    transactionsRepository,
    redemptionsRepository,
    binsRepository
  );

  getAnalytics = async (_req: Request, res: Response) => {
    try {
      const data = await this.getAnalyticsUseCase.execute();
      return res.json(data);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err && typeof (err as Record<string, unknown>).message === "string"
          ? (err as Record<string, string>).message
          : "Error interno del servidor";
      return res.status(500).json({ error: message });
    }
  };
}

export const adminController = new AdminController();
export default adminController;
