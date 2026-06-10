import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";

export class DeleteProductUseCase {
  constructor(private productsRepo: IProductsRepository) {}

  async execute(id: string) {
    return this.productsRepo.deleteProduct(id);
  }
}
