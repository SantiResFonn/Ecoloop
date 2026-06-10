import { Request, Response } from "express";
import { RedeemProductUseCase } from "../../application/use-cases/redemptions/RedeemProductUseCase";
import { ListRedemptionsUseCase } from "../../application/use-cases/redemptions/ListRedemptionsUseCase";
import { redemptionsRepository } from "../../infrastructure/repositories/redemptionsRepository";
import { productsRepository } from "../../infrastructure/repositories/productsRepository";
import { profilesRepository } from "../../infrastructure/repositories/profilesRepository";
import { ValidationError, NotFoundError } from "../../domain/errors";

const handleError = (res: Response, err: any) => {
  if (err instanceof ValidationError || err?.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError || err?.name === "NotFoundError" || err?.message?.toLowerCase().includes("not found")) {
    return res.status(404).json({ error: err.message || "Recurso no encontrado" });
  }
  return res.status(500).json({ error: err.message || "Error interno del servidor" });
};

export class RedemptionsController {
  private redeemProductUseCase = new RedeemProductUseCase(
    redemptionsRepository,
    productsRepository,
    profilesRepository
  );

  private listRedemptionsUseCase = new ListRedemptionsUseCase(redemptionsRepository);

  create = async (req: Request, res: Response) => {
    try {
      const { product_id, quantity = 1 } = req.body;
      
      // Safety: Only admins can specify a different user_id. Non-admins always redeem for themselves.
      let targetUserId = (req as any).user.userId;
      if ((req as any).user.role === "admin" && req.body.user_id) {
        targetUserId = req.body.user_id;
      }

      const redemption = await this.redeemProductUseCase.execute(targetUserId, product_id, quantity);
      return res.status(201).json(redemption);
    } catch (err: any) {
      return handleError(res, err);
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      // Safety: Non-admins can only see their own redemptions. Admins can see all or filter.
      let filterUserId: string | undefined = undefined;
      
      if ((req as any).user.role !== "admin") {
        filterUserId = (req as any).user.userId;
      } else if (req.query.userId) {
        filterUserId = req.query.userId as string;
      }

      const list = await this.listRedemptionsUseCase.execute(filterUserId);
      return res.json(list);
    } catch (err: any) {
      return handleError(res, err);
    }
  };
}

export const redemptionsController = new RedemptionsController();
export default redemptionsController;
