import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository";

export class ListTransactionsUseCase {
  constructor(private transactionsRepo: ITransactionsRepository) {}

  async execute(userId?: string) {
    return this.transactionsRepo.findTransactions(userId ? { user_id: userId } : undefined);
  }
}
