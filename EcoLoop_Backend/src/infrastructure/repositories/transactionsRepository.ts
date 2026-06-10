import { ITransactionsRepository, RecyclingScanResult } from "../../domain/repositories/ITransactionsRepository";
import { Transaction, WasteBin, WasteType } from "../../domain/entities";
import prisma from "../db/prismaClient";
import { NotFoundError } from "../../domain/errors";

export class PrismaTransactionsRepository implements ITransactionsRepository {
  async findTransactions(filter?: { user_id?: string }): Promise<Transaction[]> {
    const where: any = {};
    if (filter?.user_id) where.user_id = filter.user_id;
    return prisma.transactions.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        user: { select: { full_name: true, email: true } },
        bin: { select: { waste_type: true, qr_code: true } },
      },
    }) as any;
  }

  async findBinByQr(qr: string): Promise<WasteBin | null> {
    return prisma.waste_bins.findUnique({ where: { qr_code: qr } }) as any;
  }

  async createTransaction(data: {
    user_id: string;
    bin_id: string;
    points_earned: number;
    waste_type: any;
  }): Promise<Transaction> {
    return prisma.transactions.create({ data }) as any;
  }

  async getProfilePoints(user_id: string): Promise<number> {
    const p = await prisma.profiles.findUnique({
      where: { id: user_id },
      select: { eco_points: true },
    });
    return p?.eco_points ?? 0;
  }

  async updateProfilePoints(user_id: string, newPoints: number): Promise<any> {
    return prisma.profiles.update({
      where: { id: user_id },
      data: { eco_points: newPoints },
    });
  }

  async executeRecyclingScan(params: {
    user_id: string;
    bin_id: string;
    waste_type: WasteType;
    points_earned: number;
    new_capacity: number;
    needs_attention: boolean;
  }): Promise<RecyclingScanResult> {
    try {
      const [transaction, profile, bin] = await prisma.$transaction(async (tx) => {
        const createdTransaction = await tx.transactions.create({
          data: {
            user_id: params.user_id,
            bin_id: params.bin_id,
            points_earned: params.points_earned,
            waste_type: params.waste_type as any,
          },
        });

        const updatedProfile = await tx.profiles.update({
          where: { id: params.user_id },
          data: { eco_points: { increment: params.points_earned } },
        });

        const updatedBin = await tx.waste_bins.update({
          where: { id: params.bin_id },
          data: {
            capacity_percentage: params.new_capacity,
            needs_attention: params.needs_attention,
          },
        });

        return [createdTransaction, updatedProfile, updatedBin];
      });

      return {
        transaction: transaction as unknown as Transaction,
        newPoints: profile.eco_points,
        bin: bin as unknown as WasteBin,
      };
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error) {
        const code = (error as { code?: string }).code;
        if (code === "P2025") {
          throw new NotFoundError("Usuario o contenedor no encontrado");
        }
      }
      throw error;
    }
  }
}

export const transactionsRepository = new PrismaTransactionsRepository();
export default transactionsRepository;
