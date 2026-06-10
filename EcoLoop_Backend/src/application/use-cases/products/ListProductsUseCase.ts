import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";

export class ListProductsUseCase {
  constructor(private productsRepo: IProductsRepository) {}

  async execute(filter?: { available?: boolean; category?: string }) {
    return this.productsRepo.listProducts(filter);
  }
}
