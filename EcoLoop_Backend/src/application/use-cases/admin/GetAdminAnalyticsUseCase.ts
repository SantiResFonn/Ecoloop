import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository";
import { IRedemptionsRepository } from "../../../domain/repositories/IRedemptionsRepository";
import { IBinsRepository } from "../../../domain/repositories/IBinsRepository";

export interface AdminAnalyticsResult {
  stats: {
    totalUsers: number;
    totalTransactions: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    totalRedemptions: number;
    binsNeedingAttention: number;
  };
  recentTransactions: unknown[];
  wasteBins: unknown[];
  recentRedemptions: unknown[];
}

export class GetAdminAnalyticsUseCase {
  constructor(
    private profilesRepo: IProfilesRepository,
    private transactionsRepo: ITransactionsRepository,
    private redemptionsRepo: IRedemptionsRepository,
    private binsRepo: IBinsRepository
  ) {}

  async execute(): Promise<AdminAnalyticsResult> {
    const [users, transactions, redemptions, wasteBins] = await Promise.all([
      this.profilesRepo.listProfiles({ role: "user" }),
      this.transactionsRepo.findTransactions(),
      this.redemptionsRepo.listRedemptions(),
      this.binsRepo.listBins(),
    ]);

    const totalUsers = users.length;
    const totalTransactions = transactions.length;
    const totalPointsEarned = transactions.reduce(
      (sum, t) => sum + (t.points_earned ?? 0),
      0
    );
    const totalPointsRedeemed = redemptions.reduce(
      (sum, r) => sum + (r.points_spent ?? 0),
      0
    );
    const totalRedemptions = redemptions.length;
    const binsNeedingAttention = wasteBins.filter((b) => b.needs_attention).length;

    return {
      stats: {
        totalUsers,
        totalTransactions,
        totalPointsEarned,
        totalPointsRedeemed,
        totalRedemptions,
        binsNeedingAttention,
      },
      recentTransactions: transactions.slice(0, 10),
      wasteBins,
      recentRedemptions: redemptions.slice(0, 10),
    };
  }
}
