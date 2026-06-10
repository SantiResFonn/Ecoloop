import { Request, Response } from "express";
import { ListStationsUseCase } from "../../application/use-cases/stations/ListStationsUseCase";
import { CreateStationUseCase } from "../../application/use-cases/stations/CreateStationUseCase";
import { GetStationByIdUseCase } from "../../application/use-cases/stations/GetStationByIdUseCase";
import { UpdateStationUseCase } from "../../application/use-cases/stations/UpdateStationUseCase";
import { DeleteStationUseCase } from "../../application/use-cases/stations/DeleteStationUseCase";
import { stationsRepository } from "../../infrastructure/repositories/stationsRepository";

export class StationsController {
  private listStationsUseCase = new ListStationsUseCase(stationsRepository);
  private getStationByIdUseCase = new GetStationByIdUseCase(stationsRepository);
  private createStationUseCase = new CreateStationUseCase(stationsRepository);
  private updateStationUseCase = new UpdateStationUseCase(stationsRepository);
  private deleteStationUseCase = new DeleteStationUseCase(stationsRepository);

  list = async (_req: Request, res: Response) => {
    try {
      const data = await this.listStationsUseCase.execute();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const data = await this.getStationByIdUseCase.execute(req.params.id);
      if (!data) return res.status(404).json({ error: "Estación no encontrada" });
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { name, location, description } = req.body;
      const data = await this.createStationUseCase.execute({ name, location, description });
      return res.status(201).json(data);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await this.updateStationUseCase.execute(id, req.body);
      return res.json(data);
    } catch (err: any) {
      const isNotFound =
        err.code === "P2025" ||
        err.message?.includes("not found") ||
        err.message?.includes("Record to update not found") ||
        err.message?.includes("Record to delete not found") ||
        err.message?.toLowerCase().includes("not found");

      if (isNotFound) {
        return res.status(404).json({ error: "Estación no encontrada" });
      }
      return res.status(500).json({ error: err.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.deleteStationUseCase.execute(id);
      return res.status(204).send();
    } catch (err: any) {
      const isNotFound =
        err.code === "P2025" ||
        err.message?.includes("not found") ||
        err.message?.includes("Record to update not found") ||
        err.message?.includes("Record to delete not found") ||
        err.message?.toLowerCase().includes("not found");

      if (isNotFound) {
        return res.status(404).json({ error: "Estación no encontrada" });
      }
      return res.status(500).json({ error: err.message });
    }
  };
}

export const stationsController = new StationsController();

