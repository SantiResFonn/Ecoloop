import { describe, it, expect, vi } from "vitest";
import { GetProductByIdUseCase } from "./GetProductByIdUseCase";
import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";
import { Product } from "../../../domain/entities";

describe("GetProductByIdUseCase", () => {
  it("should return the product if found", async () => {
    const mockProduct: Product = {
      id: "prod-123",
      name: "Camiseta Ecológica",
      description: "Hecha de algodón orgánico",
      points_cost: 100,
      image_url: "http://example.com/image.jpg",
      stock: 10,
      category: "Ropa",
      is_available: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockRepo = {
      getProductById: vi.fn().mockResolvedValue(mockProduct),
    } as unknown as IProductsRepository;

    const useCase = new GetProductByIdUseCase(mockRepo);
    const result = await useCase.execute("prod-123");

    expect(mockRepo.getProductById).toHaveBeenCalledWith("prod-123");
    expect(result).toEqual(mockProduct);
  });

  it("should return null if product is not found", async () => {
    const mockRepo = {
      getProductById: vi.fn().mockResolvedValue(null),
    } as unknown as IProductsRepository;

    const useCase = new GetProductByIdUseCase(mockRepo);
    const result = await useCase.execute("non-existent");

    expect(mockRepo.getProductById).toHaveBeenCalledWith("non-existent");
    expect(result).toBeNull();
  });
});
