import { Request, Response } from "express";
import { ListTransactionsUseCase } from "../../application/use-cases/transactions/ListTransactionsUseCase";
import { ScanQrUseCase } from "../../application/use-cases/transactions/ScanQrUseCase";
import { transactionsRepository } from "../../infrastructure/repositories/transactionsRepository";
import { ValidationError, NotFoundError } from "../../domain/errors";

const handleError = (res: Response, err: unknown) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err && typeof err === "object" && "message" in err && typeof (err as Record<string, unknown>).message === "string") {
    return res.status(500).json({ error: (err as Record<string, string>).message });
  }
  return res.status(500).json({ error: "Error interno del servidor" });
};

export class TransactionsController {
  private listTransactionsUseCase = new ListTransactionsUseCase(transactionsRepository);
  private scanQrUseCase = new ScanQrUseCase(transactionsRepository);

  list = async (req: Request, res: Response) => {
    try {
      const userId = req.query.user_id as string | undefined;
      const data = await this.listTransactionsUseCase.execute(userId);
      return res.json(data);
    } catch (err: unknown) {
      return handleError(res, err);
    }
  };

  scan = async (req: Request, res: Response) => {
    try {
      const { user_id, qr_code, weight } = req.body ?? {};
      const authUserId = req.user?.userId;

      const effectiveUserId = authUserId || user_id;
      if (!effectiveUserId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const weightNum = Number(weight);

      const result = await this.scanQrUseCase.execute({
        userId: effectiveUserId,
        qrCode: qr_code,
        weight: weightNum,
      });
      return res.status(201).json(result);
    } catch (err: unknown) {
      return handleError(res, err);
    }
  };
}

export const transactionsController = new TransactionsController();
