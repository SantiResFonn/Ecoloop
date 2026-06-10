import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";
import { ValidationError } from "../../../domain/errors";

export class UpdateProductUseCase {
  constructor(private productsRepo: IProductsRepository) {}

  async execute(
    id: string,
    data: {
      name?: string;
      description?: string;
      points_cost?: number;
      stock?: number;
      category?: string;
      image_url?: string;
      is_available?: boolean;
    }
  ) {
    let sanitizedName = data.name;
    if (data.name !== undefined && data.name !== null) {
      sanitizedName = data.name.trim();
      if (!sanitizedName) {
        throw new ValidationError("El nombre no puede estar vacío");
      }
    }

    if (data.points_cost !== undefined && data.points_cost !== null) {
      if (!Number.isInteger(data.points_cost)) {
        throw new ValidationError("points_cost debe ser un número entero");
      }
      if (data.points_cost < 0) {
        throw new ValidationError("points_cost no puede ser negativo");
      }
    }

    if (data.stock !== undefined && data.stock !== null) {
      if (!Number.isInteger(data.stock)) {
        throw new ValidationError("stock debe ser un número entero");
      }
      if (data.stock < 0) {
        throw new ValidationError("stock no puede ser negativo");
      }
    }

    const updateData = { ...data };
    if (sanitizedName !== undefined) {
      updateData.name = sanitizedName;
    }

    return this.productsRepo.updateProduct(id, {
      ...updateData,
      updated_at: new Date(),
    });
  }
}

