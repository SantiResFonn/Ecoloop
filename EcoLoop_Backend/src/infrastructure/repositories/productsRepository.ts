import { IProductsRepository } from "../../domain/repositories/IProductsRepository";
import { Product } from "../../domain/entities";
import prisma from "../db/prismaClient";

export class PrismaProductsRepository implements IProductsRepository {
  async listProducts(filter?: { available?: boolean; category?: string }): Promise<Product[]> {
    const where: any = {};
    if (filter?.available) where.is_available = true;
    if (filter?.category) where.category = filter.category;
    return prisma.products.findMany({ where, orderBy: { name: "asc" } }) as any;
  }

  async getProductById(id: string): Promise<Product | null> {
    return prisma.products.findUnique({ where: { id } }) as any;
  }

  async createProduct(data: any): Promise<Product> {
    return prisma.products.create({ data }) as any;
  }

  async updateProduct(id: string, data: any): Promise<Product> {
    return prisma.products.update({ where: { id }, data }) as any;
  }

  async deleteProduct(id: string): Promise<Product> {
    return prisma.products.delete({ where: { id } }) as any;
  }
}

export const productsRepository = new PrismaProductsRepository();
export default productsRepository;
