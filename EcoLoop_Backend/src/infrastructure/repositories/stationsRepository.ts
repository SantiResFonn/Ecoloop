import { IStationsRepository, CreateStationInput } from "../../domain/repositories/IStationsRepository";
import { WasteStation } from "../../domain/entities";
import prisma from "../db/prismaClient";

const DEFAULT_BIN_TYPES = ["recyclable", "organic", "non_recyclable"] as const;

export class PrismaStationsRepository implements IStationsRepository {
  async listStations(): Promise<WasteStation[]> {
    return prisma.waste_stations.findMany({
      include: { waste_bins: true },
      orderBy: { created_at: "desc" },
    }) as any;
  }

  async getStationById(id: string): Promise<WasteStation | null> {
    return prisma.waste_stations.findUnique({
      where: { id },
      include: { waste_bins: true },
    }) as any;
  }

  async createStation(data: CreateStationInput): Promise<WasteStation> {
    const { createDefaultBins, ...stationData } = data;
    if (!createDefaultBins) {
      return prisma.waste_stations.create({
        data: stationData,
        include: { waste_bins: true },
      }) as any;
    }

    const station = await prisma.$transaction(async (tx) => {
      const createdStation = await tx.waste_stations.create({ data: stationData });
      const baseTimestamp = Date.now();
      await tx.waste_bins.createMany({
        data: DEFAULT_BIN_TYPES.map((wasteType, index) => ({
          station_id: createdStation.id,
          waste_type: wasteType as any,
          capacity_percentage: 0,
          needs_attention: false,
          qr_code: `ECOLOOP-${createdStation.id}-${wasteType.toUpperCase()}-${baseTimestamp + index}`,
        })),
      });
      return tx.waste_stations.findUnique({
        where: { id: createdStation.id },
        include: { waste_bins: true },
      });
    });

    return station as unknown as WasteStation;
  }

  async updateStation(id: string, data: any): Promise<WasteStation> {
    return prisma.waste_stations.update({ where: { id }, data }) as any;
  }

  async deleteStation(id: string): Promise<WasteStation> {
    return prisma.waste_stations.delete({ where: { id } }) as any;
  }
}

export const stationsRepository = new PrismaStationsRepository();
export default stationsRepository;
