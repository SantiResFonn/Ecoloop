import { Product } from "../entities";

export interface IProductsRepository {
  listProducts(filter?: { available?: boolean; category?: string }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(data: any): Promise<Product>;
  updateProduct(id: string, data: any): Promise<Product>;
  deleteProduct(id: string): Promise<Product>;
}
