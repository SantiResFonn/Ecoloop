import { describe, it, expect, vi } from "vitest";
import { DeleteProductUseCase } from "./DeleteProductUseCase";
import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";
import { Product } from "../../../domain/entities";

describe("DeleteProductUseCase", () => {
  it("should delete a product successfully and return the deleted product details", async () => {
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
      deleteProduct: vi.fn().mockResolvedValue(mockProduct),
    } as unknown as IProductsRepository;

    const useCase = new DeleteProductUseCase(mockRepo);
    const result = await useCase.execute("prod-123");

    expect(mockRepo.deleteProduct).toHaveBeenCalledWith("prod-123");
    expect(result).toEqual(mockProduct);
  });

  it("should propagate error when repository throws", async () => {
    const mockRepo = {
      deleteProduct: vi.fn().mockRejectedValue(new Error("Producto no encontrado")),
    } as unknown as IProductsRepository;

    const useCase = new DeleteProductUseCase(mockRepo);

    await expect(
      useCase.execute("prod-123")
    ).rejects.toThrow("Producto no encontrado");

    expect(mockRepo.deleteProduct).toHaveBeenCalledWith("prod-123");
  });
});
