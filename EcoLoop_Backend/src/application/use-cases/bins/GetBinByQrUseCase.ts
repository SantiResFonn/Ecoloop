import { IBinsRepository } from "../../../domain/repositories/IBinsRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors";

export class GetBinByQrUseCase {
  constructor(private binsRepo: IBinsRepository) {}

  async execute(qrCode: string) {
    if (!qrCode || typeof qrCode !== "string" || qrCode.trim() === "") {
      throw new ValidationError("Código QR es requerido y debe ser un texto no vacío");
    }

    const bin = await this.binsRepo.findBinByQr(qrCode);
    if (!bin) {
      throw new NotFoundError("Contenedor no encontrado");
    }

    return bin;
  }
}
