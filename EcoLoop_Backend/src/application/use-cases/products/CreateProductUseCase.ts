import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";
import { ValidationError } from "../../../domain/errors";

export class CreateProductUseCase {
  constructor(private productsRepo: IProductsRepository) {}

  async execute(data: {
    name: string;
    description?: string;
    points_cost: number;
    stock?: number;
    category: string;
    image_url?: string;
    is_available?: boolean;
  }) {
    const sanitizedName = data.name ? data.name.trim() : "";

    if (!sanitizedName || data.points_cost === undefined || data.points_cost === null || !data.category) {
      throw new ValidationError("name, points_cost y category son requeridos");
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

    return this.productsRepo.createProduct({
      name: sanitizedName,
      description: data.description,
      points_cost: data.points_cost,
      stock: data.stock !== undefined ? data.stock : 0,
      category: data.category,
      image_url: data.image_url,
      is_available: data.is_available,
    });
  }
}

