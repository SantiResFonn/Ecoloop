import { IRedemptionsRepository } from "../../domain/repositories/IRedemptionsRepository";
import { Redemption } from "../../domain/entities";
import prisma from "../db/prismaClient";

export class PrismaRedemptionsRepository implements IRedemptionsRepository {
  async createRedemption(data: {
    user_id: string;
    product_id: string;
    points_spent: number;
    quantity: number;
    status: string;
  }): Promise<Redemption> {
    return prisma.redemptions.create({
      data,
      include: {
        user: true,
        product: true
      }
    }) as any;
  }

  async listRedemptions(userId?: string): Promise<Redemption[]> {
    const where = userId ? { user_id: userId } : {};
    return prisma.redemptions.findMany({
      where,
      include: {
        user: true,
        product: true
      },
      orderBy: {
        created_at: "desc"
      }
    }) as any;
  }
}

export const redemptionsRepository = new PrismaRedemptionsRepository();
export default redemptionsRepository;
