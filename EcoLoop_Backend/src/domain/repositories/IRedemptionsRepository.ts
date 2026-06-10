import { Redemption } from "../entities";

export interface IRedemptionsRepository {
  createRedemption(data: {
    user_id: string;
    product_id: string;
    points_spent: number;
    quantity: number;
    status: string;
  }): Promise<Redemption>;
  listRedemptions(userId?: string): Promise<Redemption[]>;
}
