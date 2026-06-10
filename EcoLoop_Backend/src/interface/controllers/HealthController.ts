import { Request, Response } from "express";
import prisma from "../../infrastructure/db/prismaClient";

export class HealthController {
  check = async (_req: Request, res: Response) => {
    let dbStatus = "disconnected";
    try {
      // Simple probe
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (e) {
      dbStatus = "disconnected";
    }

    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      version: "1.0.0",
      service: "EcoLoop Backend API",
    });
  };
}

export const healthController = new HealthController();
export default healthController;
