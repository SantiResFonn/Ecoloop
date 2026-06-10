import { Request, Response } from "express";
import { GetBinByQrUseCase } from "../../application/use-cases/bins/GetBinByQrUseCase";
import { UpdateBinCapacityUseCase } from "../../application/use-cases/bins/UpdateBinCapacityUseCase";
import { EmptyBinUseCase } from "../../application/use-cases/bins/EmptyBinUseCase";
import { binsRepository } from "../../infrastructure/repositories/binsRepository";
import { ValidationError, NotFoundError } from "../../domain/errors";

const handleError = (res: Response, err: unknown) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message || "Contenedor no encontrado" });
  }

  if (err && typeof err === "object") {
    const errorObj = err as Record<string, unknown>;
    if (errorObj.name === "ValidationError" && typeof errorObj.message === "string") {
      return res.status(400).json({ error: errorObj.message });
    }
    if (errorObj.name === "NotFoundError" && typeof errorObj.message === "string") {
      return res.status(404).json({ error: errorObj.message });
    }
    if (typeof errorObj.message === "string" && errorObj.message.toLowerCase().includes("not found")) {
      return res.status(404).json({ error: errorObj.message });
    }
    if (typeof errorObj.message === "string") {
      return res.status(500).json({ error: errorObj.message });
    }
  }

  return res.status(500).json({ error: "Error interno del servidor" });
};

export class BinsController {
  private getBinByQrUseCase = new GetBinByQrUseCase(binsRepository);
  private updateBinCapacityUseCase = new UpdateBinCapacityUseCase(binsRepository);
  private emptyBinUseCase = new EmptyBinUseCase(binsRepository);

  getByQr = async (req: Request, res: Response) => {
    try {
      const qrCode = typeof req.query.qr_code === "string" ? req.query.qr_code : "";
      if (!qrCode) {
        return res.status(400).json({ error: "El parámetro qr_code es requerido" });
      }
      const data = await this.getBinByQrUseCase.execute(qrCode);
      return res.json(data);
    } catch (err: unknown) {
      return handleError(res, err);
    }
  };

  updateCapacity = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { capacity_percentage, current_weight } = req.body ?? {};

      const capacityNum = Number(capacity_percentage);
      const weightNum = Number(current_weight);

      if (capacity_percentage === undefined || capacity_percentage === null || Number.isNaN(capacityNum)) {
        return res.status(400).json({ error: "capacity_percentage es requerido y debe ser un número" });
      }
      if (current_weight === undefined || current_weight === null || Number.isNaN(weightNum)) {
        return res.status(400).json({ error: "current_weight es requerido y debe ser un número" });
      }

      const data = await this.updateBinCapacityUseCase.execute(id, capacityNum, weightNum);
      return res.json(data);
    } catch (err: unknown) {
      return handleError(res, err);
    }
  };

  empty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await this.emptyBinUseCase.execute(id);
      return res.json(data);
    } catch (err: unknown) {
      return handleError(res, err);
    }
  };
}

export const binsController = new BinsController();
export default binsController;
