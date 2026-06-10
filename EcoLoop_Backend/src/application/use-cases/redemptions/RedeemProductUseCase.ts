import { IRedemptionsRepository } from "../../../domain/repositories/IRedemptionsRepository";
import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";
import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { ValidationError, NotFoundError } from "../../../domain/errors";
import { Redemption } from "../../../domain/entities";

export class RedeemProductUseCase {
  constructor(
    private redemptionsRepo: IRedemptionsRepository,
    private productsRepo: IProductsRepository,
    private profilesRepo: IProfilesRepository
  ) {}

  async execute(userId: string, productId: string, quantity = 1): Promise<Redemption> {
    if (!userId || !userId.trim()) {
      throw new ValidationError("ID de usuario requerido");
    }
    if (!productId || !productId.trim()) {
      throw new ValidationError("ID de producto requerido");
    }
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new ValidationError("La cantidad debe ser un entero positivo");
    }

    // 1. Fetch product and validate stock
    const product = await this.productsRepo.getProductById(productId);
    if (!product) {
      throw new NotFoundError("Producto no encontrado");
    }
    if (!product.is_available || product.stock < quantity) {
      throw new ValidationError("El producto no tiene stock disponible");
    }

    // 2. Fetch user and validate points
    const user = await this.profilesRepo.getProfileById(userId);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    const totalCost = product.points_cost * quantity;
    if (user.eco_points < totalCost) {
      throw new ValidationError(`Puntos insuficientes (Requeridos: ${totalCost}, Disponibles: ${user.eco_points})`);
    }

    // 3. Deduct points from user
    await this.profilesRepo.updateProfile(userId, {
      eco_points: user.eco_points - totalCost
    });

    // 4. Deduct stock from product
    const newStock = product.stock - quantity;
    await this.productsRepo.updateProduct(productId, {
      stock: newStock,
      is_available: newStock > 0
    });

    // 5. Create redemption record
    return this.redemptionsRepo.createRedemption({
      user_id: userId,
      product_id: productId,
      points_spent: totalCost,
      quantity,
      status: "pending"
    });
  }
}
