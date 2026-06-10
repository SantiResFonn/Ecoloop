import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";

export class GetProductByIdUseCase {
  constructor(private productsRepo: IProductsRepository) {}

  async execute(id: string) {
    return this.productsRepo.getProductById(id);
  }
}
