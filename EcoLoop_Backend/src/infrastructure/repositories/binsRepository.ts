import { IBinsRepository } from "../../domain/repositories/IBinsRepository";
import { WasteBin } from "../../domain/entities";
import prisma from "../db/prismaClient";
import { NotFoundError } from "../../domain/errors";

export class PrismaBinsRepository implements IBinsRepository {
  async findBinByQr(qrCode: string): Promise<WasteBin | null> {
    const bin = await prisma.waste_bins.findUnique({
      where: { qr_code: qrCode },
    });
    return bin as WasteBin | null;
  }

  async findBinById(id: string): Promise<WasteBin | null> {
    const bin = await prisma.waste_bins.findUnique({
      where: { id },
    });
    return bin as WasteBin | null;
  }

  async listBins(): Promise<WasteBin[]> {
    const bins = await prisma.waste_bins.findMany({
      include: { station: true },
      orderBy: { created_at: "desc" },
    });
    return bins as unknown as WasteBin[];
  }

  async updateBinCapacity(id: string, capacity: number, currentWeight: number): Promise<WasteBin> {
    try {
      const bin = await prisma.waste_bins.update({
        where: { id },
        data: {
          capacity_percentage: capacity,
          needs_attention: capacity >= 90,
        },
      });
      return bin as WasteBin;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        ("code" in error || "name" in error)
      ) {
        const errObj = error as { code?: string; name?: string };
        if (errObj.code === "P2025" || errObj.name === "NotFoundError") {
          throw new NotFoundError("Contenedor no encontrado");
        }
      }
      throw error;
    }
  }

  async emptyBin(id: string): Promise<WasteBin> {
    try {
      const bin = await prisma.waste_bins.update({
        where: { id },
        data: {
          capacity_percentage: 0,
          needs_attention: false,
        },
      });
      return bin as WasteBin;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        ("code" in error || "name" in error)
      ) {
        const errObj = error as { code?: string; name?: string };
        if (errObj.code === "P2025" || errObj.name === "NotFoundError") {
          throw new NotFoundError("Contenedor no encontrado");
        }
      }
      throw error;
    }
  }
}

export const binsRepository = new PrismaBinsRepository();
export default binsRepository;
