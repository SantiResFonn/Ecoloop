import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository";
import { ValidationError, NotFoundError } from "../../../domain/errors";
import { WasteType } from "../../../domain/entities";

export const POINTS_BY_TYPE: Record<WasteType, number> = {
  recyclable: 10,
  organic: 8,
  non_recyclable: 5,
};

export const POINTS_PER_KG: Record<WasteType, number> = {
  recyclable: 2,
  organic: 1.5,
  non_recyclable: 1,
};

export const MAX_CAPACITY_KG = 120;
export const ATTENTION_THRESHOLD_PERCENT = 80;

export interface ScanQrInput {
  userId: string;
  qrCode: string;
  weight: number;
}

export class ScanQrUseCase {
  constructor(private transactionsRepo: ITransactionsRepository) {}

  async execute(input: ScanQrInput) {
    const { userId, qrCode, weight } = input;

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      throw new ValidationError("user_id es requerido");
    }
    if (!qrCode || typeof qrCode !== "string" || qrCode.trim() === "") {
      throw new ValidationError("qr_code es requerido");
    }
    if (typeof weight !== "number" || Number.isNaN(weight)) {
      throw new ValidationError("weight es requerido y debe ser un número");
    }
    if (weight <= 0) {
      throw new ValidationError("La cantidad de residuos debe ser mayor a 0");
    }
    if (weight > MAX_CAPACITY_KG) {
      throw new ValidationError(`La cantidad de residuos no puede exceder ${MAX_CAPACITY_KG}kg`);
    }

    const bin = await this.transactionsRepo.findBinByQr(qrCode);
    if (!bin) {
      throw new NotFoundError("Código QR inválido o no encontrado");
    }

    if (bin.capacity_percentage >= 100) {
      throw new ValidationError("Este contenedor está lleno. Por favor, usa otro.");
    }

    const wasteType = bin.waste_type as WasteType;
    const basePoints = POINTS_BY_TYPE[wasteType] ?? 5;
    const pointsPerKg = POINTS_PER_KG[wasteType] ?? 1;
    const pointsEarned = Math.round(basePoints + weight * pointsPerKg);

    const capacityIncrease = Math.round((weight / MAX_CAPACITY_KG) * 100);
    const newCapacity = Math.min(bin.capacity_percentage + capacityIncrease, 100);
    const needsAttention = newCapacity >= ATTENTION_THRESHOLD_PERCENT;

    const result = await this.transactionsRepo.executeRecyclingScan({
      user_id: userId,
      bin_id: bin.id,
      waste_type: wasteType,
      points_earned: pointsEarned,
      new_capacity: newCapacity,
      needs_attention: needsAttention,
    });

    return {
      transaction: result.transaction,
      points_earned: pointsEarned,
      total_points: result.newPoints,
      capacity_percentage: newCapacity,
      needs_attention: needsAttention,
      bin: result.bin,
      message: `¡Excelente! Ganaste ${pointsEarned} EcoPoints por reciclar ${wasteType}`,
    };
  }
}
