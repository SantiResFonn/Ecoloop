import { Transaction, WasteBin, WasteType } from "../entities";

export interface RecyclingScanResult {
  transaction: Transaction;
  newPoints: number;
  bin: WasteBin;
}

export interface ITransactionsRepository {
  findTransactions(filter?: { user_id?: string }): Promise<Transaction[]>;
  findBinByQr(qr: string): Promise<WasteBin | null>;
  createTransaction(data: {
    user_id: string;
    bin_id: string;
    points_earned: number;
    waste_type: any;
  }): Promise<Transaction>;
  getProfilePoints(user_id: string): Promise<number>;
  updateProfilePoints(user_id: string, newPoints: number): Promise<any>;
  executeRecyclingScan(params: {
    user_id: string;
    bin_id: string;
    waste_type: WasteType;
    points_earned: number;
    new_capacity: number;
    needs_attention: boolean;
  }): Promise<RecyclingScanResult>;
}
