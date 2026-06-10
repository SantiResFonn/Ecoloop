import { IRedemptionsRepository } from "../../../domain/repositories/IRedemptionsRepository";
import { Redemption } from "../../../domain/entities";

export class ListRedemptionsUseCase {
  constructor(private redemptionsRepo: IRedemptionsRepository) {}

  async execute(userId?: string): Promise<Redemption[]> {
    return this.redemptionsRepo.listRedemptions(userId);
  }
}
