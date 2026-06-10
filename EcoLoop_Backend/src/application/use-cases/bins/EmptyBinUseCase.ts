import { IBinsRepository } from "../../../domain/repositories/IBinsRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors";

export class EmptyBinUseCase {
  constructor(private binsRepo: IBinsRepository) {}

  async execute(id: string) {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new ValidationError("El ID del contenedor es requerido y debe ser un texto no vacío");
    }

    return this.binsRepo.emptyBin(id);
  }
}
